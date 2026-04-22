/* task_unit.js - Developed by A. Programmer - http://example.com/project
 * Sets up a background processing unit and connects a data input handler to listen for
 * external instructions from the coordinating client.
 * To understand this script, begin by tracing actions from the 'inputProcessor' method.
 * A typical operational cycle involves:
 * taskOrchestrator/acquire_job -> dataProcessor/submit_outcome -> taskOrchestrator
 * This loop continues until a 'terminate' signal is received.
 */
function TaskProcessor() {
    // The endpoint for job requests
    this.sourceAddress = '/service_endpoint/';


    // A counter for consecutive acquisition failures
    this.errorTally = 0;


    // Default configuration parameters
    this.settings = {'waitIntervalMillis':'2500'};


    // This method processes incoming messages from the main thread
    this.inputProcessor = function(inputMsg) {
        // Example input: {'command':'initiate','settings':{'waitIntervalMillis':'6000'}}
        inputMsg = JSON.parse(inputMsg);

        switch(inputMsg.command) {
            case 'initiate':
                this.halted = false;
                this.errorTally = 0;
                postMessage('Task orchestrator commencing operations');
                this.taskOrchestrator();
                break;

            case 'terminate':
                postMessage('Task orchestrator halting operations');
                if (this.requestObject) {
                    // If an active download request exists, cancel it immediately
                    this.requestObject.abort();
                }
                this.halted = true;
                break;
        }


        if (inputMsg.settings) {
            // Update specific settings if provided in the message
            this.settings.waitIntervalMillis =
                inputMsg.settings.waitIntervalMillis || this.settings.waitIntervalMillis;
        }
    };


    // Invoked whenever the processor is idle, after a configured pause
    this.taskOrchestrator = function() {
        if (this.halted) {
            return false;
        }

        if (this.errorTally > 6) {
            postMessage('Job acquisition failure limit exceeded');
        } else {
            var selfRef = this;
            var currentXHR = new XMLHttpRequest();

            currentXHR.onreadystatechange = function() {
                // Check if the HTTP request has completed
                if (currentXHR.readyState === 4) {
                    if (currentXHR.status === 200) {
                        // Successfully received data; proceed to process
                        selfRef.dataProcessor(currentXHR.responseText);
                    } else {
                        // Problem during data retrieval
                        selfRef.fetchError();
                    }
                }
            };

            // Prepare to fetch data from the designated URL
            currentXHR.open("GET", this.sourceAddress, true);
            currentXHR.send(null);

            // Keep a reference to the active request for potential cancellation
            this.requestObject = currentXHR;
        }
    };


    // Handles scenarios where data fetching fails
    this.fetchError = function() {
        this.errorTally += 1;
        var selfRef = this;
        // Schedule another attempt after a delay
        setTimeout("jobProcessor.taskOrchestrator()", parseInt(this.settings.waitIntervalMillis));
    };


    // Processes the received data payload and dispatches the outcome
    this.dataProcessor = function(receivedPayload) {
        if (this.halted) {
            return false;
        }

        var parsedData = JSON.parse(receivedPayload);

        if (parsedData.statusIndicator) {
            if (parsedData.statusIndicator === 'reattempt') {
                // Server indicates no tasks currently available, requests a delay
                postMessage('Reattempt delay of ' + parsedData.duration + 'ms requested.');
                setTimeout("jobProcessor.taskOrchestrator()", parseInt(parsedData.duration));
            }
        } else {
            var unitId = parsedData.uniqueID;
            var funcString = unescape(parsedData.execFunc);
            var inputData = unescape(parsedData.payloadData);

            // Assuming the function string comes from a trusted source
            eval('var operation = ' + funcString);

            // Execute the provided function with the given data and set up a callback
            // to upload the result and resume the task orchestrator
            var selfRef = this;

            this.currentExecution = function() {
                // Perform the designated operation on the input data
                var outcome = operation(inputData);

                var postBody = "{'jobID':'" + unitId + "','outcomeValue':'" + outcome + "'}";

                // Transmit the computed outcome
                var uploadRequest = new XMLHttpRequest();

                // This endpoint should point to your task result submission service
                uploadRequest.open('POST', '/result_submission/', true);
                uploadRequest.setRequestHeader("Content-type", "application/json");
                uploadRequest.setRequestHeader("Content-length", postBody.length);
                uploadRequest.setRequestHeader("Connection", "close");
                uploadRequest.send(postBody);

                // Schedule the next task acquisition
                setTimeout("jobProcessor.taskOrchestrator()", parseInt(selfRef.settings.waitIntervalMillis));
                selfRef.currentExecution = null; // Clear the reference after execution
            };
            this.currentExecution();
        }
    };
}

// Instantiate the primary task processing unit
var jobProcessor = new TaskProcessor();

// Listen for messages from the main thread to control the worker
onmessage = function(workerEvent) {
    jobProcessor.inputProcessor(workerEvent.payload);
};