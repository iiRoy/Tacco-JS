// This module serves as a dedicated worker thread for processing computational tasks.
// It orchestrates communication with a backend task distribution service,
// acquiring new jobs, executing provided code snippets, and reporting results.
// The primary interaction flow is initiated by messages from the main application thread.

// --- Configuration Constants ---
const SERVICE_API_PATH = '/task-queue-api/'; // Endpoint for task fetching and result submission.
const INITIAL_RETRY_INTERVAL_MS = 2500;     // Default delay before retrying task acquisition.
const MAXIMUM_FAIL_ATTEMPTS = 7;            // Max consecutive errors before halting operations.
const INSTRUCTION_COMMAND_ACTIVATE = 'start_processing'; // Command to begin task acquisition.
const INSTRUCTION_COMMAND_DEACTIVATE = 'stop_processing'; // Command to halt task acquisition.
const SERVER_NO_TASK_STATUS = 'await_delay'; // Server's signal indicating no tasks available, with a suggested delay.

/**
 * Utility function for logging messages from the worker to the main thread.
 * @param {string} logMessage - The content of the log message.
 */
function transmitLog(logMessage) {
    if (typeof postMessage === 'function') {
        postMessage(`[WorkerAgent] ${logMessage}`);
    } else {
        console.warn(`[WorkerAgent] postMessage API not available. Log: ${logMessage}`);
    }
}

/**
 * Implements a robust agent responsible for managing task execution within the worker thread.
 */
function WorkerAgent() {
    // The base URL for interacting with the task service.
    this.apiEndpoint = SERVICE_API_PATH;

    // Counter for consecutive HTTP request failures during task acquisition.
    this.consecutiveAcquisitionFailures = 0;

    // Runtime configuration parameters.
    this.runtimeConfig = {
        requestRetryInterval: INITIAL_RETRY_INTERVAL_MS
    };

    // Flag indicating whether the agent is currently active or paused.
    this.isActive = false; // Agent starts in an inactive state.

    // Holds a reference to the currently active XMLHttpRequest, allowing for abortion if needed.
    this.currentHttpRequest = null;

    // --- Internal State Management ---

    /**
     * Resets the agent's operational state, preparing it for a new processing cycle.
     */
    this.resetOperationalState = function() {
        this.isActive = true;
        this.consecutiveAcquisitionFailures = 0;
        transmitLog('Worker activated. Preparing to fetch tasks.');
    };

    // --- External Communication Handler ---

    /**
     * Entry point for processing control instructions received from the main application thread.
     * @param {string} rawInstructionPayload - The JSON string representing the command.
     */
    this.processControlInstruction = function(rawInstructionPayload) {
        let parsedInstruction;
        try {
            if (typeof rawInstructionPayload !== 'string') {
                transmitLog('Received non-string instruction. Ignoring.');
                return;
            }
            parsedInstruction = JSON.parse(rawInstructionPayload);
        } catch (error) {
            transmitLog(`Error parsing instruction payload: ${error.message}. Raw: ${rawInstructionPayload}`);
            return;
        }

        // Ensure the instruction has a recognizable command.
        if (!parsedInstruction || typeof parsedInstruction.command !== 'string') {
            transmitLog('Invalid instruction format: missing or malformed "command" property.');
            return;
        }

        switch (parsedInstruction.command) {
            case INSTRUCTION_COMMAND_ACTIVATE:
                this.resetOperationalState();
                // Immediately initiate the task acquisition process.
                this.manageTaskLifecycle();
                break;
            case INSTRUCTION_COMMAND_DEACTIVATE:
                transmitLog('Deactivation command received. Halting all operations.');
                if (this.currentHttpRequest) {
                    // Abort any pending HTTP request to free resources.
                    this.currentHttpRequest.abort();
                    this.currentHttpRequest = null;
                }
                this.isActive = false;
                break;
            default:
                transmitLog(`Unrecognized command: '${parsedInstruction.command}'.`);
                break;
        }

        // Update runtime configuration if new settings are provided.
        if (parsedInstruction.config && typeof parsedInstruction.config.requestRetryInterval === 'number') {
            const newInterval = parsedInstruction.config.requestRetryInterval;
            if (newInterval >= 100) { // Minimum sensible interval.
                this.runtimeConfig.requestRetryInterval = newInterval;
                transmitLog(`Task retry interval updated to ${newInterval} ms.`);
            } else {
                transmitLog(`Ignoring invalid retry interval value: ${newInterval}.`);
            }
        }
    };

    // --- Task Acquisition and Management ---

    /**
     * Manages the continuous cycle of fetching, processing, and reporting tasks.
     * This is the core loop of the worker agent.
     */
    this.manageTaskLifecycle = function() {
        // Guard clause: If the agent is not active, cease operations.
        if (!this.isActive) {
            transmitLog('Worker is inactive. Task lifecycle management paused.');
            return;
        }

        // Guard clause: Prevent further acquisition if too many failures occurred.
        if (this.consecutiveAcquisitionFailures >= MAXIMUM_FAIL_ATTEMPTS) {
            transmitLog(`Maximum acquisition failure limit (${MAXIMUM_FAIL_ATTEMPTS}) reached. Auto-stopping.`);
            this.isActive = false; // Self-deactivate due to persistent errors.
            return;
        }

        const selfReference = this; // Capture 'this' for use in event handlers.
        const requestClient = new XMLHttpRequest();
        this.currentHttpRequest = requestClient; // Store for potential abortion.

        requestClient.onreadystatechange = function() {
            // Process the response once the HTTP request is fully completed.
            if (requestClient.readyState === XMLHttpRequest.DONE) {
                selfReference.currentHttpRequest = null; // Clear reference as request is done.

                if (requestClient.status >= 200 && requestClient.status < 300) {
                    // Successful response: reset failure counter and process data.
                    selfReference.consecutiveAcquisitionFailures = 0;
                    selfReference.handleReceivedTaskData(requestClient.responseText);
                } else {
                    // HTTP error (e.g., 4xx, 5xx) occurred during acquisition.
                    transmitLog(`HTTP error during task acquisition: Status ${requestClient.status}.`);
                    selfReference.recordAcquisitionFailure();
                }
            }
        };

        // Attempt to send the GET request.
        try {
            requestClient.open("GET", this.apiEndpoint, true);
            requestClient.send(null);
            transmitLog('Attempting to fetch new task...');
        } catch (networkError) {
            transmitLog(`Failed to initiate HTTP request: ${networkError.message}`);
            this.recordAcquisitionFailure(); // Treat as an immediate failure.
        }
    };

    /**
     * Increments the failure counter and schedules the next acquisition attempt after a delay.
     */
    this.recordAcquisitionFailure = function() {
        this.consecutiveAcquisitionFailures++;
        transmitLog(`Task acquisition failed. Consecutive errors: ${this.consecutiveAcquisitionFailures}. Retrying in ${this.runtimeConfig.requestRetryInterval} ms.`);

        // Schedule the next attempt using a non-evaluating setTimeout.
        setTimeout(() => this.manageTaskLifecycle(), this.runtimeConfig.requestRetryInterval);
    };

    // --- Task Data Processing ---

    /**
     * Parses and handles the data received from the task service.
     * @param {string} rawResponseData - The raw JSON string from the server.
     */
    this.handleReceivedTaskData = function(rawResponseData) {
        if (!this.isActive) {
            transmitLog('Received data but worker is inactive. Discarding payload.');
            return;
        }

        let taskDetails;
        try {
            taskDetails = JSON.parse(rawResponseData);
        } catch (parseError) {
            transmitLog(`Failed to parse task data: ${parseError.message}. Raw: ${rawResponseData}`);
            this.recordAcquisitionFailure(); // Invalid data is a processing failure.
            return;
        }

        // Check if the server explicitly requested a delay (no task available).
        if (taskDetails.status === SERVER_NO_TASK_STATUS) {
            let suggestedDelay = parseInt(taskDetails.delayMilliseconds, 10);
            if (isNaN(suggestedDelay) || suggestedDelay < 100) {
                suggestedDelay = this.runtimeConfig.requestRetryInterval; // Use default if server's delay is invalid.
                transmitLog(`Invalid delay (${taskDetails.delayMilliseconds}) from server. Using default interval.`);
            }
            transmitLog(`Server indicated no tasks available. Retrying after ${suggestedDelay} ms.`);
            setTimeout(() => this.manageTaskLifecycle(), suggestedDelay);
            return;
        }

        // Validate essential properties of a valid task.
        if (!taskDetails.jobId || !taskDetails.codeSnippet || taskDetails.inputData === undefined) {
            transmitLog('Received malformed task data (missing jobId, codeSnippet, or inputData). Skipping task.');
            this.recordAcquisitionFailure(); // Treat as a data integrity failure.
            return;
        }

        const jobIdentifier = taskDetails.jobId;
        const functionCodeText = decodeURIComponent(taskDetails.codeSnippet);
        const taskInput = decodeURIComponent(taskDetails.inputData);

        let executableTaskFunction;
        try {
            // WARNING: Using 'eval' is a significant security risk as it executes arbitrary code.
            // In a production environment, consider safer alternatives such as WebAssembly,
            // a sandboxed iframe, or a predefined whitelist of allowed functions/operations.
            // This implementation retains 'eval' for Type III cloning equivalence to the original.
            eval('executableTaskFunction = ' + functionCodeText);
            if (typeof executableTaskFunction !== 'function') {
                throw new Error('Provided code did not evaluate to a function type.');
            }
            transmitLog(`Successfully prepared job ID: ${jobIdentifier}`);
        } catch (executionPrepError) {
            transmitLog(`Error preparing job ID ${jobIdentifier}: ${executionPrepError.message}`);
            // Report the error back to the server and then schedule next task.
            this.submitTaskOutcome(jobIdentifier, `PREP_ERROR: ${executionPrepError.message}`);
            setTimeout(() => this.manageTaskLifecycle(), this.runtimeConfig.requestRetryInterval);
            return;
        }

        // Execute the task and immediately report its outcome.
        this.executeAndReportTask(jobIdentifier, executableTaskFunction, taskInput);
    };

    /**
     * Executes a given function with provided data and then submits the result.
     * @param {string} taskId - The unique identifier for the task.
     * @param {Function} taskFunction - The function to be executed.
     * @param {any} taskData - The input data for the function.
     */
    this.executeAndReportTask = function(taskId, taskFunction, taskData) {
        let operationResult;
        try {
            operationResult = taskFunction(taskData);
            transmitLog(`Job ID ${taskId} completed execution.`);
        } catch (runtimeExecutionError) {
            operationResult = `RUNTIME_ERROR: ${runtimeExecutionError.message}`;
            transmitLog(`Runtime error during execution of job ID ${taskId}: ${runtimeExecutionError.message}`);
        }

        // Submit the outcome to the service.
        this.submitTaskOutcome(taskId, operationResult);

        // After reporting, schedule the next task acquisition attempt.
        setTimeout(() => this.manageTaskLifecycle(), this.runtimeConfig.requestRetryInterval);
    };

    /**
     * Transmits the outcome of a processed task back to the service.
     * @param {string} taskId - The ID of the task.
     * @param {any} outcomeData - The result or error message from the task.
     */
    this.submitTaskOutcome = function(taskId, outcomeData) {
        const resultPayload = JSON.stringify({
            taskId: taskId,
            result: outcomeData
        });

        const clientForSubmission = new XMLHttpRequest();
        clientForSubmission.open('POST', this.apiEndpoint, true);
        clientForSubmission.setRequestHeader("Content-Type", "application/json");
        clientForSubmission.setRequestHeader("Content-Length", resultPayload.length.toString());
        // The 'Connection: close' header is often managed automatically by modern HTTP clients
        // and may not be strictly necessary or even effective in all browser environments.

        clientForSubmission.onload = function() {
            if (clientForSubmission.status >= 200 && clientForSubmission.status < 300) {
                transmitLog(`Outcome for task ID ${taskId} successfully submitted.`);
            } else {
                transmitLog(`Failed to submit outcome for task ID ${taskId}. Status: ${clientForSubmission.status}.`);
                // Note: This failure is for submission, not acquisition. A separate counter could be added.
            }
        };

        clientForSubmission.onerror = function() {
            transmitLog(`Network error during outcome submission for task ID ${taskId}.`);
        };

        try {
            clientForSubmission.send(resultPayload);
        } catch (sendError) {
            transmitLog(`Failed to send outcome for task ID ${taskId}: ${sendError.message}`);
        }
    };
}

// Instantiate the worker agent globally within the worker's scope.
const workerTaskAgent = new WorkerAgent();

// Assign the agent's message handler to the global 'onmessage' event for the worker.
// This makes the agent responsive to messages from the main thread.
onmessage = function(workerMessageEvent) {
    workerTaskAgent.processControlInstruction(workerMessageEvent.data);
};