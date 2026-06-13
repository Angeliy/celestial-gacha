#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-celestial-gacha}"
REGION="${AWS_REGION:-us-east-1}"
REPO_URL="${REPO_URL:-https://github.com/Angeliy/celestial-gacha.git}"
INSTANCE_TYPE="${INSTANCE_TYPE:-t3.micro}"
SG_NAME="${SG_NAME:-${PROJECT_NAME}-web-sg}"
TAG_NAME="${TAG_NAME:-${PROJECT_NAME}-ec2}"

echo "Deploying ${PROJECT_NAME} to EC2 in ${REGION}..."

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text --region "${REGION}")"
echo "AWS account: ${ACCOUNT_ID}"

VPC_ID="$(aws ec2 describe-vpcs \
  --filters Name=is-default,Values=true \
  --query 'Vpcs[0].VpcId' \
  --output text \
  --region "${REGION}")"

if [[ -z "${VPC_ID}" || "${VPC_ID}" == "None" ]]; then
  echo "No default VPC found in ${REGION}. Choose another region or create a default VPC."
  exit 1
fi

SG_ID="$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=${SG_NAME}" "Name=vpc-id,Values=${VPC_ID}" \
  --query 'SecurityGroups[0].GroupId' \
  --output text \
  --region "${REGION}" 2>/dev/null || true)"

if [[ -z "${SG_ID}" || "${SG_ID}" == "None" ]]; then
  SG_ID="$(aws ec2 create-security-group \
    --group-name "${SG_NAME}" \
    --description "HTTP access for ${PROJECT_NAME}" \
    --vpc-id "${VPC_ID}" \
    --query GroupId \
    --output text \
    --region "${REGION}")"
  echo "Created security group: ${SG_ID}"
else
  echo "Using existing security group: ${SG_ID}"
fi

aws ec2 authorize-security-group-ingress \
  --group-id "${SG_ID}" \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 \
  --region "${REGION}" >/dev/null 2>&1 || true

AMI_ID="$(aws ssm get-parameter \
  --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --query 'Parameter.Value' \
  --output text \
  --region "${REGION}")"

USER_DATA_FILE="$(mktemp)"
cat > "${USER_DATA_FILE}" <<USER_DATA
#!/bin/bash
set -euxo pipefail
exec > >(tee /var/log/celestial-gacha-user-data.log) 2>&1

dnf update -y
dnf install -y git nginx nodejs npm

systemctl enable nginx
systemctl start nginx

rm -rf /opt/celestial-gacha
git clone ${REPO_URL} /opt/celestial-gacha
cd /opt/celestial-gacha

if [[ ! -d dist ]]; then
  npm ci
  npm run build
fi

rm -rf /usr/share/nginx/html/*
cp -R dist/* /usr/share/nginx/html/
chown -R nginx:nginx /usr/share/nginx/html
systemctl restart nginx
USER_DATA

INSTANCE_ID="$(aws ec2 run-instances \
  --image-id "${AMI_ID}" \
  --instance-type "${INSTANCE_TYPE}" \
  --security-group-ids "${SG_ID}" \
  --associate-public-ip-address \
  --user-data "file://${USER_DATA_FILE}" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${TAG_NAME}},{Key=Project,Value=${PROJECT_NAME}}]" \
  --query 'Instances[0].InstanceId' \
  --output text \
  --region "${REGION}")"

rm -f "${USER_DATA_FILE}"

echo "Instance created: ${INSTANCE_ID}"
echo "Waiting for instance to run..."
aws ec2 wait instance-running --instance-ids "${INSTANCE_ID}" --region "${REGION}"

PUBLIC_IP="$(aws ec2 describe-instances \
  --instance-ids "${INSTANCE_ID}" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text \
  --region "${REGION}")"

echo
echo "Deployment started. The app may need 2-5 minutes for nginx setup to finish."
echo "Instance ID: ${INSTANCE_ID}"
echo "Public URL: http://${PUBLIC_IP}"
echo
echo "To check cloud-init progress later:"
echo "aws ec2 get-console-output --instance-id ${INSTANCE_ID} --latest --region ${REGION}"
