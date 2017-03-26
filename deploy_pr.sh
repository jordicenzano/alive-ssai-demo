#!/usr/bin/env bash

DEST_BUCKET="s3://alive-pr-brain-ui/alive-test/ssaiV1"

aws s3 sync . ${DEST_BUCKET} --exclude ".*" --exclude ".*" --exclude "*.sh"
echo '{"env": {"name": "Production", "value":"pr" }}' > env_tmp.json
aws s3 cp env_tmp.json ${DEST_BUCKET}/env.json

rm env_tmp.json