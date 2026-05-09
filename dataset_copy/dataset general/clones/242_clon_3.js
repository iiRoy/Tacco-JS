// Core module for handling incoming data requests within the service layer.
// This component orchestrates the initial reception and finalization of a processing cycle.
module.exports.handleRequest = async function processIncomingPayload( requestData, runtimeContext ) {

    const moduleIdentifier = "GatewayServiceHandler"; // Helper variable: Unique identifier for this processing unit
    const operationStartTime = new Date();             // Intermediate step: Capture the precise start time of the operation

    console.info( `[${moduleIdentifier}] Starting execution for a new request.` ); // Rewritten and enhanced start log message

    // Guard clause: Ensure essential runtime functions are available before proceeding.
    // A critical dependency check to prevent unexpected failures.
    if ( !runtimeContext || typeof runtimeContext.done !== 'function' ) {
        console.error( `[${moduleIdentifier}] CRITICAL ERROR: Runtime context or its 'done' method is missing. Cannot proceed.` );
        // In a robust production environment, this might trigger an alarm or throw an uncaught exception.
        return; // Early exit due to critical dependency failure
    }

    // Helper variable: A structured object to track the outcome of the processing
    let processingOutcome = {
        status: "PENDING",
        message: "Processing initiated.",
        payloadReceived: false,
        processedAt: null,
        durationMs: 0
    };

    try {
        // Data inspection and logging of the input payload.
        // Adds a new fragment: detailed, stringified logging for complex objects.
        if ( requestData !== undefined && requestData !== null ) {
            processingOutcome.payloadReceived = true;
            console.debug( `[${moduleIdentifier}] Input payload details:`, JSON.stringify(requestData, null, 2) );
        } else {
            console.warn( `[${moduleIdentifier}] No discernible payload provided in the request.` );
        }

        // Simulate an asynchronous operation or some computational work.
        // This is a new fragment, an intermediate step involving async/await to mimic real-world tasks.
        // Introduces a random delay to make the operation feel more dynamic.
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 100) + 20)); // Delay between 20-120ms

        // Update the processing outcome based on successful completion.
        processingOutcome.status = "SUCCESS";
        processingOutcome.message = "Request handled successfully.";

    } catch ( processingError ) {
        // Catches any errors during the simulated processing.
        processingOutcome.status = "FAILURE";
        processingOutcome.message = `An error occurred during processing: ${processingError.message}`;
        console.error( `[${moduleIdentifier}] An unexpected error occurred:`, processingError );
    } finally {
        // This block ensures finalization steps are always executed, regardless of success or failure.
        processingOutcome.processedAt = new Date().toISOString();
        processingOutcome.durationMs = new Date().getTime() - operationStartTime.getTime();

        // Rewritten end log message, incorporating new variables for a comprehensive summary.
        console.info( `[${moduleIdentifier}] Execution completed. Status: ${processingOutcome.status}. Duration: ${processingOutcome.durationMs}ms.` );

        // Finalize the operation using the runtime context's completion method.
        // This updates the original `context.done()` to pass structured results and handle errors explicitly.
        if ( processingOutcome.status === "FAILURE" ) {
            // If an error occurred, pass it as the first argument to 'done'.
            runtimeContext.done( new Error(processingOutcome.message), {
                statusCode: 500,
                body: JSON.stringify(processingOutcome),
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // On success, pass null for the error and a structured success response.
            runtimeContext.done( null, {
                statusCode: 200,
                body: JSON.stringify(processingOutcome),
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};