# AWS EC2 Deployment Notes

## Local AWS setup

Do not paste AWS secrets into chat. Configure credentials locally:

```bash
aws configure
```

Recommended values:

```text
Default region name: us-east-1
Default output format: json
```

Then verify:

```bash
aws sts get-caller-identity
```

## Deploy

```bash
chmod +x scripts/deploy-ec2.sh
AWS_REGION=us-east-1 ./scripts/deploy-ec2.sh
```

The script creates:

- One EC2 instance tagged `celestial-gacha-ec2`
- One security group named `celestial-gacha-web-sg`
- An HTTP inbound rule for port 80
- An nginx site serving the GitHub project build

## Cost note

Stop or terminate the EC2 instance after the assignment demo if you do not need it running.
