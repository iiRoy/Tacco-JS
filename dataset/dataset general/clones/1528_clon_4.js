'use strict';

const webFramework = require('kraken-js');
const dataStore = require('./lib/database');
const localeHandler = require('./lib/language');
const webServer = require('express');
const paymentGateway = require('paypal-rest-sdk');

const { methodOverride } = webServer;

class ApplicationLifecycleManager {
    constructor() {
        // No explicit constructor logic needed for this simple case,
        // but its presence signifies a different structural approach.
    }

    setupRuntimeEnvironment(configurationProvider, completionSignal) {
        try {
            dataStore.config(configurationProvider.get('databaseConfig'));
            paymentGateway.configure(configurationProvider.get('paypalConfig'));
            completionSignal(null);
        } catch (initializationError) {
            completionSignal(initializationError);
        }
    }

    onBeginRequest(serverContext) {
        // This phase remains a placeholder, as in the original.
    }

    applyPreRoutingMiddleware(serverContext) {
        serverContext.use(methodOverride());
        serverContext.use(localeHandler());
    }

    onEndRequest(serverContext) {
        // This phase remains a placeholder, as in the original.
    }

    retrieveServiceHooks() {
        return {
            configure: this.setupRuntimeEnvironment.bind(this),
            requestStart: this.onBeginRequest.bind(this),
            requestBeforeRoute: this.applyPreRoutingMiddleware.bind(this),
            requestAfterRoute: this.onEndRequest.bind(this)
        };
    }
}

const serviceCoordinator = new ApplicationLifecycleManager();
const integrationPoints = serviceCoordinator.retrieveServiceHooks();

webFramework.create(integrationPoints).listen((startupIssue) => {
    if (startupIssue) {
        console.error('System initialization failed:', startupIssue.message || startupIssue);
        process.exit(1);
    }
});