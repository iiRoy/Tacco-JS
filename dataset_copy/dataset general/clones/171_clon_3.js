/**
 * This module manages the asynchronous retrieval and logging of a peripheral device's operational status.
 * It establishes a continuous polling mechanism, querying the device at regular intervals
 * and displaying the received state information to the console.
 */

// Import the external device interaction library, aliasing it for clarity.
const PeriphConnector = require('sparky');
// Import the configuration settings specific to the device.
const OperationalParameters = require('./config');

// Define constants for the polling behavior.
const POLLING_INTERVAL_MS = 500; // Time in milliseconds between status checks.
const STATUS_QUERY_COMMAND = 'retrieve_current_state'; // The command string to send for status.

// Global control flag to enable or disable the continuous monitoring loop.
let isMonitoringActive = true;
// Counter to track the number of polling cycles completed.
let cycleCounter = 0;

// Initialize the device interface using the imported connector and parameters.
const deviceInterface = new PeriphConnector(OperationalParameters);

/**
 * A utility function to schedule the next execution of a given callback.
 * It respects the global `isMonitoringActive` flag.
 * @param {Function} callbackFn - The function to be called after the delay.
 */
const scheduleNextPoll = (callbackFn) => {
    if (isMonitoringActive) {
        setTimeout(callbackFn, POLLING_INTERVAL_MS);
    } else {
        console.info("[Monitor] Polling sequence halted by user or condition.");
    }
};

/**
 * The primary function responsible for initiating a single device state query
 * and processing its response. It recursively schedules itself for continuous operation.
 */
function initiateStatePolling() {
    // Guard clause: If monitoring is not active, prevent further execution and scheduling.
    if (!isMonitoringActive) {
        console.warn("[Monitor] Polling cycle skipped as monitoring is currently inactive.");
        return;
    }

    cycleCounter++; // Increment the cycle counter for the current iteration.

    // Execute the status query command on the device interface.
    // The second argument is `undefined` as no additional data is sent with this command.
    deviceInterface.run(STATUS_QUERY_COMMAND, undefined, (returnedStatus) => {
        // Use an intermediate variable to hold the processed status, providing a default if none is received.
        const processedStatus = returnedStatus || { type: 'ERROR', detail: 'No status object received from device.' };

        // Log the received status, with additional detail based on its structure.
        if (typeof processedStatus === 'object' && processedStatus !== null) {
            console.log(`[Cycle ${cycleCounter}] Device State:`, processedStatus);
            if (processedStatus.type) {
                console.debug(`[Cycle ${cycleCounter}] Status Type: ${processedStatus.type}`);
            }
            if (processedStatus.detail) {
                console.debug(`[Cycle ${cycleCounter}] Status Detail: ${processedStatus.detail}`);
            }
        } else {
            // Handle cases where the returned status is not an object or is null.
            console.error(`[Cycle ${cycleCounter}] Received unexpected status format:`, processedStatus);
        }

        // Schedule the next polling cycle using the helper function.
        scheduleNextPoll(initiateStatePolling);
    });
}

// Initial check and call to start the monitoring process.
if (isMonitoringActive) {
    console.info("Commencing device state monitoring process...");
    initiateStatePolling();
} else {
    console.info("Monitoring setup completed, but is configured to be inactive at startup.");
}