// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

//const fetch = require('node-fetch');
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const dispatchPostUri = process.env.DISPATCH_POST_URI;
const dispatchMinBatchSize = parseInt(process.env.DISPATCH_MIN_BATCH_SIZE || 1);

async function dispatch(queue, force) {

    if (queue.length !== 0 && (force || queue.length >= dispatchMinBatchSize)) {
        console.log('[telementry-dispatcher:dispatch] Dispatching', queue.length, 'telemetry events');;
        const requestBody = JSON.stringify(queue);
        queue.splice(0);

        if (!dispatchPostUri) {
            console.log('[telementry-dispatcher:dispatch] dispatchPostUri not found. Discarding log events from the queue');
            return;
        }


        const s3Client = new S3Client({ region: 'ap-southeast-2', });

        const now = Date.now();
        const bucketName = 'forge-app-data-test';

        console.log('Sending log to S3');

        const { } = await s3Client.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: `time=2024-12-01T12:00/appID=app1/envId=envprod1/${now}.log`,
                Body: requestBody,
            })
        );

        console.log('sent logs to s3');

        const { Body } = await s3Client.send(
            new GetObjectCommand({
                Bucket: bucketName,
                Key: `time=2024-12-01T12:00/appID=app1/envId=envprod1/${now}.log`,
            })
        );

        console.log(await Body.transformToString());
    }
}

module.exports = {
    dispatch
}
