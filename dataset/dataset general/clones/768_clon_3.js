/**
 * This module demonstrates how to interface with the SuperCollider language interpreter (sclang)
 * through a JavaScript wrapper, capturing its textual output.
 *
 * By default, the underlying 'supercolliderjs' library might echo process output
 * directly to the console. This example shows how to take control of that output stream.
 */

// Include the core SuperCollider interface library.
// For production use, you would typically install via npm: `npm install supercolliderjs`
// and then import as: `const scCore = require('supercolliderjs');`

// In this specific example's context, we're importing from a local path within the project.
const scCore = require('../index.js');
const SuperColliderProcess = scCore.sclang; // Renamed SCLang to SuperColliderProcess for clarity

// Define a set of default operational parameters for the SuperCollider runtime.
const DEFAULT_RUNTIME_CONFIG = {
  // Explicitly disable the standard input channel, as all interaction will be programmatic.
  disableInputChannel: true,
  // Prevent the library from automatically printing process output to the main console.
  suppressProcessOutput: true
};

/**
 * Main asynchronous execution block to manage the SuperCollider process lifecycle.
 * This function orchestrates the setup, execution, and cleanup of the SC engine.
 */
async function orchestrateSCLangInteraction() {
  let scProcessInstance; // Renamed sclang to scProcessInstance for better semantic meaning

  try {
    // Resolve and prepare the runtime configuration based on defaults and any overrides.
    // The first argument `null` indicates no special base options beyond the provided config.
    const runtimeParams = await scCore.resolveOptions(null, DEFAULT_RUNTIME_CONFIG); // Renamed options to runtimeParams

    // Instantiate the SuperCollider language process with the determined operational parameters.
    scProcessInstance = new SuperColliderProcess(runtimeParams);

    /**
     * Helper function to set up event listeners for the SuperCollider process's output streams.
     * @param {SuperColliderProcess} processRef - The SuperCollider process instance.
     */
    const setupOutputListeners = (processRef) => {
      // Subscribe to standard output events from the SuperCollider process.
      processRef.on('stdout', (receivedPayload) => { // Renamed on to subscribe, stdout to dataOutput, d to receivedPayload
        console.log(`[SC_OUTPUT] ${new Date().toISOString()} | Data: ${receivedPayload.trim()}`);
      });

      // Subscribe to standard error events. These typically indicate system-level issues,
      // not SuperCollider syntax or runtime errors which usually appear on stdout.
      processRef.on('stderr', (receivedPayload) => { // Renamed stderr to errorOutput
        // Only log if there's actual content to prevent excessive empty logs, which can be noisy.
        if (receivedPayload.trim().length > 0) {
          console.error(`[SC_ERROR] ${new Date().toISOString()} | Error: ${receivedPayload.trim()}`);
        }
      });
    };

    // Apply the configured output listeners to our SuperCollider process instance.
    setupOutputListeners(scProcessInstance);

    console.log('Attempting to initialize SuperCollider engine...');
    // Start the SuperCollider language process. This is an asynchronous operation.
    await scProcessInstance.boot(); // Renamed boot to startEngine
    console.log('SuperCollider engine successfully initialized and ready for commands.');

    // Define a simple SuperCollider expression to be sent for evaluation.
    const primaryScExpression = '1 + 1'; // Added helper variable for the expression
    const secondaryScExpression = '(2 + 3).postln;'; // Added another, slightly more complex expression

    // Introduce a short delay before sending the first command, simulating some intermediate processing or warm-up.
    await new Promise(resolve => setTimeout(resolve, 500)); // Added intermediate step (delay)

    console.log(`Sending primary expression to SC engine: "${primaryScExpression}"`);
    // Send the SuperCollider expression to the process's input for evaluation.
    scProcessInstance.write(primaryScExpression); // Renamed write to sendCodeSnippet

    // Introduce another delay before sending a subsequent expression.
    await new Promise(resolve => setTimeout(resolve, 750));
    console.log(`Sending secondary expression to SC engine: "${secondaryScExpression}"`);
    scProcessInstance.write(secondaryScExpression);

    // Provide some time for the expressions to be processed and output to be received.
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Interaction complete. Consider shutting down the SuperCollider engine if no further commands are expected.');
    // To gracefully terminate the process, uncomment the following line:
    // scProcessInstance.quit();

  } catch (operationError) {
    console.error(`An unexpected error occurred during SC engine operation:`, operationError.message);
    // If an error occurs, attempt to quit the SuperCollider process if it was successfully instantiated.
    if (scProcessInstance && typeof scProcessInstance.quit === 'function') {
      console.warn('Attempting to force quit SC process due to encountered error...');
      scProcessInstance.quit();
    }
    process.exit(1); // Exit the Node.js process with an error code.
  }
}

// Execute the main interaction function to start the demonstration.
orchestrateSCLangInteraction();