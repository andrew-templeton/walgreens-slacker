
# This is a sensible default, but may be changed to any region with:
#   Lambda
#   CloudWatch Events (EventBridge)
export AWS_REGION=us-east-1;

# Change this to the profile in your AWS configs to which you would like to deploy.
export AWS_PROFILE=default;
# SAM requires an S3 URL to ship packaged templates and Lambda code zips to.
#   This bucket should be in the same region as AWS_REGION above.
export ARTIFACT_BUCKET=07bad1ce-5fe6-449f-9e1c-52cd6d38ee6f;

# For testing purposes, if you need to splice in a positive test hit to check if things work,
#   swap which line is commented.
export TEST_HITS='{}'
# export TEST_HITS='{"78701": [{ "location": "https://google.com", "zipCode": "00000" }]}'

# This should be changed to the channel inbound hook to which notifications will post.
export HOOK_URI='Please put a hook URI here, the full protocol included'



sam build;
sam package \
  --template .aws-sam/build/template.yaml \
  --s3-bucket $ARTIFACT_BUCKET \
  --output-template-file /tmp/template-export.yml;
aws cloudformation deploy \
  --stack-name wg-slacker \
  --template-file /tmp/template-export.yml \
  --parameter-overrides "TestHits=${TEST_HITS}" "HookUri=${HOOK_URI}" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND;
