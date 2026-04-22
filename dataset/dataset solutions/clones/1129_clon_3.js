const pathModule = require('path');
const fileSystemHandler = require('fs');

// Define a constant for the standard input file path, making it more explicit.
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';

/**
 * Utility function to read raw data from a specified file path synchronously.
 * @param {string} filePath - The path to the file to read.
 * @returns {string} The content of the file as a UTF-8 string.
 * @throws {Error} If the file cannot be read.
 */
const retrieveRawData = (filePath) => {
  try {
    // Synchronously read the entire content of the file.
    return fileSystemHandler.readFileSync(filePath, 'utf8');
  } catch (error) {
    // Provide a more informative error message if file reading fails.
    console.error(`Error reading input file at ${filePath}:`, error.message);
    throw new Error(`Failed to obtain problem input from ${filePath}.`);
  }
};

/**
 * A mechanism to yield control back to the Node.js event loop, preventing deep
 * recursion from causing stack overflow errors in synchronous contexts.
 * This effectively breaks the call stack and allows other pending operations to run.
 * @returns {Promise<void>} A promise that resolves after the next tick of the event loop.
 */
const deferControlToEventLoop = () => {
  // Ensure 'process' global is available, typical in Node.js environments.
  if (typeof process === 'undefined' || !process.nextTick) {
    // Fallback for non-Node.js environments or if process.nextTick is unavailable.
    // This might not be as efficient as process.nextTick but provides similar behavior.
    return new Promise(fulfill => setTimeout(fulfill, 0));
  }

  return new Promise((fulfillOperation, denyOperation) => {
    // Schedule the fulfillment of the promise for the very next iteration of the event loop.
    process.nextTick((operationError) => {
      if (operationError) {
        // If an error occurred during the nextTick callback, reject the promise.
        denyOperation(operationError);
        return;
      }
      // If successful, fulfill the promise.
      fulfillOperation();
    });
  });
};

// --- Global State and Constants for the Dynamic Programming Problem ---

// Maximum recursion depth before deferring to the event loop.
// This helps prevent stack overflow in deeply recursive asynchronous functions.
const RECURSION_RESET_THRESHOLD = 1_000_000; // Using underscore for readability.

// A very large number representing an impossible or unachievable state
// in a minimization problem. Using MAX_SAFE_INTEGER as a sentinel.
const IMPOSSIBLE_COIN_COUNT = Number.MAX_SAFE_INTEGER;

// Global variables to store problem parameters, initialized after input parsing.
let g_targetAmount = 0; // The total amount to be made change for (originally 'n').
let g_availableCoinTypesCount = 0; // The number of distinct coin denominations (originally 'm').
let g_coinDenominations = []; // An array of available coin values (originally 'cm').

// Global counter for recursive calls to monitor depth.
let g_invocationCounter = 0;

// Dynamic programming cache (memoization table).
// Stores results of subproblems: memoizationCache[coinIndex][currentSum]
let memoizationCache = [];

/**
 * Parses the raw input string into problem-specific parameters.
 * @param {string} rawContent - The entire content read from the input file.
 * @returns {object} An object containing parsed parameters.
 */
const parseProblemParameters = (rawContent) => {
  // Trim whitespace from the content and split into individual lines.
  const inputLines = rawContent.trim().split('\n');

  // Validate that we have at least two lines of input.
  if (inputLines.length < 2) {
    throw new Error("Insufficient input data: Expected at least two lines for problem parameters.");
  }

  // Parse the first line for target amount and number of coin types.
  const firstLineParts = inputLines[0].trim().split(' ').map(Number);
  if (firstLineParts.length !== 2 || firstLineParts.some(isNaN)) {
    throw new Error("Invalid format for the first line. Expected two numbers: target amount and coin type count.");
  }
  const [ parsedTargetAmount, parsedCoinTypeCount ] = firstLineParts;

  // Parse the second line for coin denominations.
  const coinValuesString = inputLines[1].trim();
  if (!coinValuesString) {
      throw new Error("Coin denominations line is empty.");
  }
  const parsedCoinDenominations = coinValuesString.split(' ').map(Number);

  // Validate coin denominations.
  if (parsedCoinDenominations.some(isNaN) || parsedCoinDenominations.some(val => val <= 0)) {
    throw new Error("Invalid coin denominations. All denominations must be positive numbers.");
  }
  if (parsedCoinDenominations.length !== parsedCoinTypeCount) {
    console.warn(`Warning: Declared coin type count (${parsedCoinTypeCount}) does not match actual denominations provided (${parsedCoinDenominations.length}). Using actual count.`);
    // Adjust g_availableCoinTypesCount to match actual input.
  }

  return {
    target: parsedTargetAmount,
    coinCount: parsedCoinTypeCount, // This will be updated later if needed.
    denominations: parsedCoinDenominations
  };
};


/**
 * Calculates the minimum number of coins required to reach a specific `remainingAmount`
 * using coins from `denominationIndex` onwards. This is a recursive, memoized function.
 *
 * @param {number} denominationIndex - The current index in the `g_coinDenominations` array.
 * @param {number} remainingAmount - The amount for which we need to find the minimum coins.
 * @returns {Promise<number>} A promise that resolves to the minimum number of coins,
 *                            or IMPOSSIBLE_COIN_COUNT if the amount cannot be made.
 */
const calculateOptimalCoinUsage = async (denominationIndex, remainingAmount) => {
  // Increment the global recursion counter.
  g_invocationCounter++;

  // Periodically yield control to the event loop to prevent stack overflow
  // in deeply recursive calls, especially in Node.js.
  if (g_invocationCounter > RECURSION_RESET_THRESHOLD) {
    // console.debug(`DEBUG: Yielding control at invocation count: ${g_invocationCounter}`);
    await deferControlToEventLoop();
    g_invocationCounter = 0; // Reset the counter after yielding.
    // console.debug('DEBUG: Control resumed, counter reset.');
  }

  // --- Base Cases for Recursion ---

  // If the remaining amount is exactly zero, we've successfully made change
  // and require 0 additional coins.
  if (remainingAmount === 0) {
    return 0;
  }

  // If the remaining amount is negative, this path is invalid (over-shot the target).
  if (remainingAmount < 0) {
    return IMPOSSIBLE_COIN_COUNT;
  }

  // If we have exhausted all available coin denominations
  // and `remainingAmount` is still greater than 0, it's impossible to make change.
  if (denominationIndex >= g_availableCoinTypesCount) {
    return IMPOSSIBLE_COIN_COUNT;
  }

  // --- Memoization Check ---

  // If this subproblem has already been solved, return the cached result.
  if (memoizationCache[denominationIndex][remainingAmount] !== undefined) {
    return memoizationCache[denominationIndex][remainingAmount];
  }

  // --- Recursive Steps ---

  // Option 1: Skip the current coin denomination.
  // Move to the next coin type to try to make change for the same remaining amount.
  const skipCurrentCoinResult = await calculateOptimalCoinUsage(
    denominationIndex + 1,
    remainingAmount
  );

  let useCurrentCoinResult = IMPOSSIBLE_COIN_COUNT; // Initialize with impossible.

  const currentCoinValue = g_coinDenominations[denominationIndex];

  // Option 2: Use the current coin denomination.
  // Only consider using the current coin if it's not larger than the `remainingAmount`.
  if (remainingAmount >= currentCoinValue) {
    const resultIfUsed = await calculateOptimalCoinUsage(
      denominationIndex, // Stay at the same coin index to potentially use it again.
      remainingAmount - currentCoinValue
    );

    // If using the coin leads to a valid solution, add 1 (for the current coin)
    // to the result of the subproblem.
    if (resultIfUsed !== IMPOSSIBLE_COIN_COUNT) {
      useCurrentCoinResult = resultIfUsed + 1;
    }
  }

  // --- Store and Return Result ---

  // The minimum coins needed for the current subproblem is the minimum of
  // skipping the coin versus using the coin (if possible).
  const optimalResult = Math.min(skipCurrentCoinResult, useCurrentCoinResult);

  // Cache the computed result before returning.
  return (memoizationCache[denominationIndex][remainingAmount] = optimalResult);
};

/**
 * The main asynchronous execution flow of the program.
 * Handles input, setup, calls the solver, and outputs the result.
 */
const mainExecutionFlow = async () => {
  try {
    // 1. Read and parse input data.
    const rawInputContent = retrieveRawData(STANDARD_INPUT_FILE_PATH);
    const problemParams = parseProblemParameters(rawInputContent);

    // Assign parsed values to global variables.
    g_targetAmount = problemParams.target;
    g_coinDenominations = problemParams.denominations;
    g_availableCoinTypesCount = g_coinDenominations.length; // Use actual count.

    // 2. Initialize the memoization cache (DP table).
    // The table needs to be (g_availableCoinTypesCount + 1) x (g_targetAmount + 1)
    // It's initialized with 'undefined' to signify uncomputed states.
    memoizationCache = Array.from({ length: g_availableCoinTypesCount + 1 }, () =>
      Array(g_targetAmount + 1).fill(undefined)
    );

    // 3. Initiate the recursive dynamic programming calculation.
    console.log(`Attempting to find minimum coins for target: ${g_targetAmount}`);
    console.log(`Available coin types: ${g_coinDenominations.join(', ')}`);

    const finalResult = await calculateOptimalCoinUsage(0, g_targetAmount);

    // 4. Output the final result.
    if (finalResult === IMPOSSIBLE_COIN_COUNT) {
      console.log("It is not possible to make the target amount with the given coin denominations.");
    } else {
      console.log(`Minimum number of coins required: ${finalResult}`);
    }
  } catch (error) {
    // Catch and log any errors that occur during the main execution.
    console.error("An unrecoverable error occurred during program execution:");
    console.error(error.message);
    // Exit with a non-zero code to indicate an error.
    process.exit(1);
  }
};

// Execute the main program flow.
mainExecutionFlow();