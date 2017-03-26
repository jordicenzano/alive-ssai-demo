#!/usr/bin/env bash

DEST_BUCKET="s3://alive-qa-brain-ui/test-ssai/ssaiV1"

aws s3 sync . ${DEST_BUCKET} --exclude ".*" --exclude ".*" --exclude "*.sh"
echo '{"env": {"name": "QA", "value":"qa" }}' > env_tmp.json
aws s3 cp env_tmp.json ${DEST_BUCKET}/env.json

rm env_tmp.json