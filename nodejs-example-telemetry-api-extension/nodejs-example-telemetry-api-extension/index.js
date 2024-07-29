#!/usr/bin/env node

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**

Notes:

- This is a simple example extension to make you help start exploring the Lambda Telemetry API.
This code is intended for eduational purposes only, it is not intended to run in production environments as-is. 
Use it as a reference only, at your own discretion, after you tested it thoroughly.  

- Because of the asynchronous nature of the system, it is possible that telemetry for one invoke will be processed during the 
next invoke slice. Likewise, it is possible that telemetry for the last invoke will be processed during the SHUTDOWN event.

*/

const extensionsApi = require('./extensions-api');
const telemetryApi = require('./telemetry-api');
const telemetryListener = require('./telemetry-listener');
const telemetryDispatcher = require('./telemetry-dispatcher');

(async function main() {
    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

    console.log('[index:main] Starting the Telemetry API extension');

    // Step 1 - Register the extension with Extensions API
    console.log('[index:main] Registering extension');
    const extensionId = await extensionsApi.register();
    console.log('[index:main] Registered with extensionId', extensionId);

    // Step 2 - Start the local http listener which will receive data from Telemetry API
    console.log('[index:main] Starting the telemetry listener');
    const listenerUri = telemetryListener.start(extensionId);
    console.log('[index:main] Telemetry listener started at', listenerUri);

    // Step 3 - Subscribe the listener to Telemetry API 
    console.log('[index:main] Subscribing the telemetry listener to Telemetry API');
    await telemetryApi.subscribe(extensionId, listenerUri);
    console.log('[index:main] Subscription success');
    console.log('[index:main] Extension and telemetry registration done');

    // while (true) {
    console.log('[index:main] Next. No loop here, just a single event');

    await extensionsApi.runExtensionEventLoopOnce(extensionId);

    // }
})();
