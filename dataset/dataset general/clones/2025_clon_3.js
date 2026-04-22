const communicationModule = require('./index.js'); // Custom RPC client library
const asynchronousFlowManager = require('step');   // Utility for sequential async operations

// --- Global Configuration Parameters ---
const MAX_EXECUTION_CYCLES = 101;       // Upper bound for the number of full processing cycles (original: > 100)
const CONCURRENT_BATCH_SIZE = 100;      // Number of parallel RPC connection attempts per cycle
const EXPECTED_ADDITION_RESULT = 3;     // Anticipated outcome from the remote 'performAddition' method
const EXPECTED_RESOURCE_BYTE_LENGTH = 97143; // Expected string length of the JSON-serialized fetched resource
const REFRESH_INTERVAL_MILLISECONDS = 1000; // Delay between the initiation of successive processing cycles
const TARGET_SERVICE_PORT = 5556;       // Network port for the RPC service
const TARGET_SERVICE_HOSTNAME = 'localhost'; // Host address for the RPC service

// --- System State Monitoring Variables ---
let currentProcessingCycle = 0;         // Tracks the count of completed execution cycles
let globalExecutionScheduler = undefined; // Reference to the periodic timer for stopping it
let initiatedRpcRequests = 0;           // Counter for RPC requests that have begun
let completedRpcResponses = 0;          // Counter for RPC requests that have concluded
let integrityCheckFailures = 0;         // Tallies any data validation discrepancies

/**
 * Safely terminates an active RPC connection channel.
 * This helper ensures that both the underlying socket and the communication stream are closed.
 * @param {object} activeChannelInstance - The connection object returned by the RPC client.
 */
const closeServiceConnection = (activeChannelInstance) => {
    if (activeChannelInstance && typeof activeChannelInstance.destroy === 'function') {
        activeChannelInstance.destroy(); // Destroys the socket
    }
    if (activeChannelInstance && typeof activeChannelInstance.end === 'function') {
        activeChannelInstance.end();     // Ends the communication stream
    }
    // console.log('DEBUG: Connection closed.'); // Uncomment for verbose logging
};

/**
 * Executes a sequence of remote procedure calls for a single connection.
 * This includes connecting, performing two distinct operations, validating their results,
 * and then ensuring the connection is properly closed.
 * @param {object} rpcClientInstance - The instance of the RPC client.
 */
function processSingleServiceInteraction(rpcClientInstance) {
    initiatedRpcRequests++; // Mark a new request as started

    rpcClientInstance.connect(TARGET_SERVICE_PORT, TARGET_SERVICE_HOSTNAME, (remoteApiProxy, connectionChannel) => {
        // Basic connection validation
        if (!remoteApiProxy || !connectionChannel) {
            console.error('ERROR: Failed to establish RPC connection. Skipping operations for this attempt.');
            completedRpcResponses++; // Increment to avoid hanging
            return;
        }

        // --- First Remote Operation: Numeric Addition ---
        remoteApiProxy.performAddition(1, 2, (computedSum) => {
            if (computedSum !== EXPECTED_ADDITION_RESULT) {
                console.warn(`WARNING: Data integrity error in 'performAddition'! Expected ${EXPECTED_ADDITION_RESULT}, received ${computedSum}.`);
                integrityCheckFailures++;
            }

            // --- Second Remote Operation: Resource Retrieval ---
            remoteApiProxy.retrieveDocument((documentPayload) => {
                const serializedDocument = JSON.stringify(documentPayload);
                const actualPayloadLength = serializedDocument.length; // Measures string length, not byte length

                if (actualPayloadLength !== EXPECTED_RESOURCE_BYTE_LENGTH) {
                    console.warn(`WARNING: Resource size mismatch in 'retrieveDocument'! Expected ${EXPECTED_RESOURCE_BYTE_LENGTH}, actual ${actualPayloadLength}.`);
                    integrityCheckFailures++;
                }

                completedRpcResponses++; // Mark this specific request as completed

                // Check if all requests initiated so far have concluded.
                // This provides a periodic summary of overall progress.
                if (completedRpcResponses === initiatedRpcRequests) {
                    console.info(`PROGRESS: All ${initiatedRpcRequests} requests initiated since last reset have now completed.`);
                    console.info(`Current state: Started: ${initiatedRpcRequests}, Finished: ${completedRpcResponses}, Errors: ${integrityCheckFailures}`);
                }

                closeServiceConnection(connectionChannel); // Crucially, close the connection after all operations
            });
        });
    });
}

/**
 * The main orchestrator function, responsible for initiating a batch of RPC calls.
 * This function is invoked periodically by the global timer.
 */
function orchestrateRpcProcessingCycle() {
    // --- Termination Condition Guard ---
    if (currentProcessingCycle >= MAX_EXECUTION_CYCLES) {
        clearInterval(globalExecutionScheduler); // Halt the timer
        console.log('--- SYSTEM SHUTDOWN ---');
        console.log(`Final Metrics: Total processing cycles: ${currentProcessingCycle}. RPC requests initiated: ${initiatedRpcRequests}, RPC requests completed: ${completedRpcResponses}. Validation warnings: ${integrityCheckFailures}.`);
        return; // Exit the function gracefully
    }

    console.log(`Initiating processing cycle #${currentProcessingCycle + 1} of ${MAX_EXECUTION_CYCLES}...`);
    currentProcessingCycle++; // Advance the cycle counter for the next iteration

    // Utilize the asynchronous flow manager. Even for a single step, this maintains the original structure.
    asynchronousFlowManager(
        function executeConcurrentRequests() {
            // Loop to dispatch multiple independent RPC interaction processes concurrently.
            for (let i = 0; i < CONCURRENT_BATCH_SIZE; i++) {
                processSingleServiceInteraction(communicationModule); // Delegate to the helper function
            }
        }
    );
}

// --- System Initialization ---
// Start the periodic execution of the RPC processing orchestrator.
// The arrow function ensures `this` context is preserved if `orchestrateRpcProcessingCycle` were a method.
globalExecutionScheduler = setInterval(() => orchestrateRpcProcessingCycle(), REFRESH_INTERVAL_MILLISECONDS);

console.log(`RPC client system initialized. Will run for ${MAX_EXECUTION_CYCLES} cycles, with a ${REFRESH_INTERVAL_MILLISECONDS}ms interval.`);
console.log(`Each cycle will attempt ${CONCURRENT_BATCH_SIZE} concurrent RPC connections.`);
// The original commented-out RPC example has been removed as per Type III requirements (deletion of non-essential fragments).