#!/usr/bin/env bash

DEST_BUCKET="s3://alive-st-brain-ui/test-ssai/ssaiV1"

aws s3 sync . ${DEST_BUCKET} --exclude ".*" --exclude "*.sh"
echo '{"env": {"name": "Staging", "value":"st" }}' > env_tmp.json
aws s3 cp env_tmp.json ${DEST_BUCKET}/env.json

rm env_tmp.json