// This module is designed to process streaming input from the standard input channel.
// Its primary function is to interpret each received data segment as a numerical value,
// perform a cubic calculation on that number, and then present the computed result
// to the standard output stream with additional contextual information.

// --- Core Configuration Settings ---
const CUBING_POWER = 3; // Defines the exponent for the mathematical operation.
const INPUT_BUFFER_ENCODING = 'utf8'; // Specifies the character encoding for incoming data buffers.
const ERROR_MESSAGE_INVALID_INPUT = "Processing Alert: Encountered non-numeric, empty, or unparseable input. Cube computation aborted.";
const STARTUP_NOTIFICATION = "System Engine Activated. Awaiting valid numeric data from the input stream...";
const SHUTDOWN_NOTIFICATION = "Input stream concluded. Initiating graceful shutdown of processing activities.";

// --- System Interface Abstractions ---
const inputStreamHandler = process.stdin; // Alias for the standard input stream object.
const outputLogFacility = console;      // Alias for the console object, used for logging and output.

/**
 * Computes the cubic value of a given base number.
 * This method serves as an explicit, step-by-step alternative to Math.pow(baseValue, 3).
 * @param {number} baseValue The numerical input for which the cube needs to be calculated.
 * @returns {number} The result of cubing the baseValue.
 */
function calculateNumberCube(baseValue) {
  // Intermediate calculations are performed here for transparency and potential optimization points.
  const firstMultiplicationResult = baseValue * baseValue;
  const finalMultiplicationResult = firstMultiplicationResult * baseValue;
  return finalMultiplicationResult;
}

// Ensure the standard input stream is in a resumed state to actively
// listen for and receive data chunks. Without this, the stream might
// remain paused and not emit 'data' events.
inputStreamHandler.resume();

// Display an initial message to the user, indicating that the system is
// operational and ready to accept input.
outputLogFacility.log(STARTUP_NOTIFICATION);

// --- Primary Event Listener for Data Reception ---
// This anonymous function is invoked every time a 'data' event is emitted
// from the standard input stream, signifying new data has arrived.
inputStreamHandler.on("data", function(incomingRawDataBuffer) {
  try {
    // Convert the received Buffer object into a string using the specified encoding,
    // then remove any leading or trailing whitespace characters.
    const processedInputString = incomingRawDataBuffer.toString(INPUT_BUFFER_ENCODING).trim();

    // Implement a guard clause: If the string is empty after trimming,
    // log a warning and cease further processing for this data chunk.
    if (processedInputString.length === 0) {
      outputLogFacility.warn(ERROR_MESSAGE_INVALID_INPUT);
      return;
    }

    // Attempt to convert the cleaned string into a floating-point number.
    // parseFloat is used to handle potential decimal inputs.
    const parsedNumericValue = parseFloat(processedInputString);

    // Another guard clause: Verify if the parsed value is a valid number.
    // If it's NaN (Not-a-Number), log an error and stop processing.
    if (isNaN(parsedNumericValue)) {
      outputLogFacility.error(ERROR_MESSAGE_INVALID_INPUT);
      return;
    }

    // --- Core Functional Logic: Cubic Calculation ---
    // Utilize the custom 'calculateNumberCube' function for the computation,
    // enhancing readability and providing an alternative to standard library calls.
    const finalComputedCube = calculateNumberCube(parsedNumericValue);

    // Construct a comprehensive output message that includes both the
    // original parsed input and the calculated cubic result.
    const structuredOutputMessage = `Input: [${parsedNumericValue}] (Power ${CUBING_POWER}) => Result: ${finalComputedCube}`;

    // Output the formatted message to the standard output stream.
    outputLogFacility.log(structuredOutputMessage);

  } catch (executionException) {
    // A robust error handling mechanism to catch any unexpected exceptions
    // that might occur during the data processing pipeline.
    outputLogFacility.error(`Critical Runtime Error: An unforeseen issue disrupted input processing: ${executionException.message}`);
  }
});

// --- Auxiliary Event Handlers for Stream Lifecycle ---

// Attaches an event listener for when the input stream signals its end (EOF).
// This provides a clear indication that no more data will be received.
inputStreamHandler.on('end', () => {
  outputLogFacility.info(SHUTDOWN_NOTIFICATION);
  // Depending on application requirements, one might explicitly exit the process here:
  // process.exit(0);
});

// Attaches an event listener to capture and report any errors that occur
// within the standard input stream itself, ensuring system stability.
inputStreamHandler.on('error', (streamError) => {
  outputLogFacility.error(`Input Stream Fault: An error occurred on the standard input channel: ${streamError.message}`);
});