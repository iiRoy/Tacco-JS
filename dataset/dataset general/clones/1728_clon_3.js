// This script illustrates a robust approach to message templating using a dedicated utility.
// It involves loading a specialized module, preparing a template string, and then
// applying dynamic data to generate a final, formatted output string.

// Step 1: Acquire the core templating engine from the local utility path.
// The 'rssi' module is expected to export a function capable of compiling templates.
const messageProcessorModule = require('../rssi');

// Basic validation: Ensure the loaded module provides a callable function.
// If the module does not export a function, it indicates a critical setup error.
if (typeof messageProcessorModule !== 'function') {
    console.error("Critical Error: The required template processing utility is not a callable function.");
    // In a production environment, one might throw an error or handle more gracefully.
    // For this example, we'll log and exit to clearly indicate the failure.
    process.exit(1);
}

// Step 2: Define the base template string with a placeholder.
// The placeholder format (e.g., #{item}) is expected by the 'messageProcessorModule'.
const baseTemplateString = 'Greetings, esteemed #{recipient}!';

console.log("Status: Template string prepared. Initiating compilation phase...");

// Step 3: Compile the base template string into a reusable message generation function.
// This step pre-processes the template for efficient repeated use.
const compiledMessageGenerator = messageProcessorModule(baseTemplateString);

// Intermediate validation: Verify that the compilation process yielded a valid function.
// A non-function result implies a failure in the template compilation logic within the module.
if (typeof compiledMessageGenerator !== 'function') {
    console.error("Critical Error: Template compilation failed; did not return a valid function.");
    process.exit(1);
}

// Step 4: Prepare the data payload that will be injected into the template.
// The keys in this object must match the placeholders defined in the template string.
const dataForGeneration = {
    recipient: 'Traveler' // Changed from 'shawarma' to 'Traveler' and 'thing' to 'recipient'.
};

console.log("Status: Template successfully compiled. Proceeding to final message generation.");

// Step 5: Generate the final, formatted message by applying the data payload to the compiled template.
const finalFormattedMessage = compiledMessageGenerator(dataForGeneration);

// Final validation: A quick check on the output type to ensure it's a string.
// While not strictly necessary for this simple case, it adds robustness.
if (typeof finalFormattedMessage !== 'string') {
    console.warn("Warning: The generated output is not of type string. Unexpected result.");
}

// Step 6: Display the ultimate result to the user.
console.info("Operation Complete: The generated message is displayed below.");
console.log(finalFormattedMessage); // Expected output: Greetings, esteemed Traveler!