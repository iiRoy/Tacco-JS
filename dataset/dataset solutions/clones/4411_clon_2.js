function emitLog(logMessage){
  console.log(logMessage); // Displays information to the console.
}

/**
 * This primary routine processes the incoming data to perform a sequence of calculations.
 *
 * @param {string} sourceData - The entire string of content received from the input source.
 */
function executeCoreLogic (sourceData) {

  // A large prime number used as a modulus to keep results within a specific range,
  // preventing potential integer overflow during multiplication steps.
  const MODULO_CONSTANT = 1000000007;

  // First, remove any leading/trailing whitespace, then divide the raw input into an array of strings based on newline characters.
  let processedInputLines = sourceData.trim().split("\n");

  // Parse the very first element of the processed lines array to get the main limit for our loop.
  var operationLimit = parseInt(processedInputLines[0]);

  // Initialize a variable that will accumulate the product throughout the iterative process.
  var cumulativeProduct = 1;

  // Begin a loop that runs from zero up to (but not including) the determined operation limit.
  for (
    var currentIteration = 0;
    currentIteration < operationLimit;
    currentIteration++
  ) {
    // Check the remainder when the current iteration index is divided by 3.
    if (currentIteration % 3 === 0) {
      // If the remainder is 0, multiply the current product by 3 and apply the modulo.
      cumulativeProduct = (cumulativeProduct * 3) % MODULO_CONSTANT;
    }
    // Check if the remainder is 1.
    else if (currentIteration % 3 === 1) {
      // If the remainder is 1, multiply the current product by 2 and apply the modulo.
      cumulativeProduct = (cumulativeProduct * 2) % MODULO_CONSTANT;
    }
    // If currentIteration % 3 === 2, no operation is performed on cumulativeProduct, mirroring original logic.
  }

  // After the loop finishes, send the final computed product to the logging function.
  emitLog(cumulativeProduct);
}

// Kick off the entire application by reading from standard input, cleaning it, and passing it to the core logic.
executeCoreLogic(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
);