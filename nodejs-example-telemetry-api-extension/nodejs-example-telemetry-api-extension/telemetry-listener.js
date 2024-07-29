// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const express = require('express');
const { dispatch } = require('./telemetry-dispatcher');
const { next, runExtensionEventLoopOnce } = require('./extensions-api');

const LISTENER_HOST = process.env.AWS_SAM_LOCAL === 'true' ? '0.0.0.0' : 'sandbox.localdomain';
const LISTENER_PORT = 4243;
const eventsQueue = [];
let telemetryExtensionId = '';

function start(extensionId) {
    console.log('[telementry-listener:start] Starting a listener. ExtensionId:', extensionId);
    telemetryExtensionId = extensionId;
    const server = express();
    server.use(express.json({ limit: '512kb' }));

    // Logging or printing besides handling error cases below is not recommended 
    // if you have subscribed to receive extension logs. Otherwise, logging here will 
    // cause Telemetry API to send new entries for the printed lines which might create a loop
    server.post('/', async (req, res) => {
        if (req.body.length && req.body.length > 0) {
            eventsQueue.push(...req.body); //filter events here based on https://docs.aws.amazon.com/lambda/latest/dg/telemetry-schema-reference.html

            for (const telemetryEvent of req.body) {
                if (telemetryEvent && telemetryEvent.type === 'platform.runtimeDone') {
                    console.log('[telementry-listener:post] received runtimeDone event. Force Dispatching');
                    await dispatch(eventsQueue, true);
                    await runExtensionEventLoopOnce(telemetryExtensionId);
                }
            }
        }
        console.log('[telementry-listener:post] received', req.body.length, 'total', eventsQueue.length);
        res.send('OK');
    });

    const listenerUrl = `http://${LISTENER_HOST}:${LISTENER_PORT}`;
    server.listen(LISTENER_PORT, LISTENER_HOST, () => {
        console.log(`[telemetry-listener:start] listening at ${listenerUrl}`);
    });
    return listenerUrl;
}

module.exports = {
    start,
    eventsQueue
};

