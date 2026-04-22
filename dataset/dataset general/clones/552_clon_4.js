const loggingUtility = require('util');
const taskQueueConnector = require('../lib/beanstalk_client');
const ServiceConnector = taskQueueConnector.Client;

// Helper to convert callback-style functions to Promise-based
const makeAsyncMethod = (originalMethod) => (...args) => {
    return new Promise((resolve, reject) => {
        originalMethod(...args, (issue, ...results) => {
            if (issue) {
                return reject(issue);
            }
            resolve(results.length === 1 ? results[0] : results);
        });
    });
};

// Promisified connection establishment
const establishQueueLink = (host, port) => {
    return new Promise((resolve, reject) => {
        ServiceConnector.connect(host, port, (issue, channel) => {
            if (issue) {
                return reject(issue);
            }
            resolve(channel);
        });
    });
};

// Wrapper for an established connection to expose async methods
const createAsyncChannelAccess = (channelInstance) => {
    return {
        selectChannel: makeAsyncMethod(channelInstance.use.bind(channelInstance)),
        dispatchWork: makeAsyncMethod(channelInstance.put.bind(channelInstance)),
        monitorChannel: makeAsyncMethod(channelInstance.watch.bind(channelInstance)),
        acquireTask: makeAsyncMethod(channelInstance.reserve.bind(channelInstance)),
        removeTask: makeAsyncMethod(channelInstance.destroy.bind(channelInstance)),
    };
};

// Logic for sending a work item
async function sendWorkUnit() {
    let producerLink;
    try {
        console.log('Producer: Initiating link to queue.');
        producerLink = await establishQueueLink(null, null);
        const asyncProducerAccess = createAsyncChannelAccess(producerLink);

        console.log('Producer: Link established.');
        await asyncProducerAccess.selectChannel('test');
        const workItemIdentifier = await asyncProducerAccess.dispatchWork(0, 0, 1, 'hiben');
        console.log('Producer: Work item dispatched, ID:', workItemIdentifier);
    } catch (connectionIssue) {
        console.error('Producer: Link or operation failure:', loggingUtility.inspect(connectionIssue));
    }
}

// Logic for receiving and processing a work item
async function processWorkUnit() {
    let consumerLink;
    try {
        console.log('Consumer: Initiating link to queue.');
        consumerLink = await establishQueueLink(null, null);
        const asyncConsumerAccess = createAsyncChannelAccess(consumerLink);

        console.log('Consumer: Link established.');
        await asyncConsumerAccess.monitorChannel('test');
        const [workItemIdentifier, messagePayload] = await asyncConsumerAccess.acquireTask();
        console.log('Consumer: Acquired work item, ID:', workItemIdentifier);
        console.log('  Work item payload:', messagePayload);
        await asyncConsumerAccess.removeTask(workItemIdentifier);
        console.log('Consumer: Removed work item, ID:', workItemIdentifier);
    } catch (connectionIssue) {
        console.error('Consumer: Link or operation failure:', loggingUtility.inspect(connectionIssue));
    }
}

// Orchestrator for concurrent operations
(async () => {
    try {
        await Promise.all([
            sendWorkUnit(),
            processWorkUnit()
        ]);
        console.log('All queue operations concluded.');
    } catch (overallFailure) {
        console.error('An unexpected error occurred during concurrent operations:', loggingUtility.inspect(overallFailure));
    }
})();