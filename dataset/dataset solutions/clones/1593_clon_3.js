/**
 * Expert system for analyzing meteorological sequences.
 * This module processes raw weather data to compute a specialized metric
 * for consecutive rain events. The metric specifically counts the initial
 * occurrence of rain and any subsequent rain symbols that immediately
 * follow another rain symbol.
 */

/**
 * Processes a raw weather data string to calculate a specific rain streak metric.
 * This metric counts initial rain occurrences and subsequent consecutive rain events.
 *
 * @param {string} rawDataString - The multi-line string containing weather observations,
 *                                 where the first line is the primary sequence.
 */
const ProcessWeatherData = (rawDataString) => {
  // Split the entire input into individual lines based on the newline character.
  const inputLines = rawDataString.split('\n');

  // The primary sequence of weather symbols is consistently expected on the first line of input.
  const weatherSequenceString = inputLines[0];

  // Initialize a counter for the accumulated rain streak score.
  // This variable will store the final metric value.
  let rainStreakAccumulator = 0;

  // Track the previously observed weather symbol.
  // Using `null` explicitly signifies that no prior observation has been made yet,
  // which is distinct from an empty string or any specific weather symbol.
  let previousObservedSymbol = null;

  // Define the constant character that represents 'Rain' for clear and consistent checking.
  const targetRainSymbol = 'R';

  // --- Type III Addition: Guard clause for empty or invalid input ---
  // If the weather sequence string is empty, null, or undefined, there's no data to process.
  // In such cases, the rain streak score is zero, and we can exit early.
  if (!weatherSequenceString || weatherSequenceString.length === 0) {
    console.log(0);
    return; // Terminate execution as there's nothing further to compute.
  }

  // Iterate over each character (weather symbol) in the sequence.
  // This standard `for` loop construction replaces the original `reduce` method,
  // providing a significant structural variation for Type III cloning.
  for (let i = 0; i < weatherSequenceString.length; i++) {
    const currentSymbol = weatherSequenceString[i];

    // --- Type III Addition: Intermediate flag for clarity ---
    // A boolean flag to concisely determine if the accumulator should be incremented
    // based on the conditions evaluated in this iteration.
    let shouldIncrementStreak = false;

    // Determine if the current symbol being evaluated is the target rain symbol.
    const isCurrentSymbolRain = (currentSymbol === targetRainSymbol);
    // Determine if the previous symbol observed was also the target rain symbol.
    const wasPreviousSymbolRain = (previousObservedSymbol === targetRainSymbol);

    // --- Type III Logic Update: Rewriting conditional statements ---
    // Condition 1: Check for a consecutive rain event.
    // This occurs when the current symbol is 'R' AND the immediately preceding symbol was also 'R'.
    if (isCurrentSymbolRain && wasPreviousSymbolRain) {
      shouldIncrementStreak = true;
    }
    // Condition 2: Check if the very first symbol in the sequence is 'R'.
    // This handles the initial 'R' when no previous symbol has been set yet
    // (i.e., `previousObservedSymbol` is still `null`).
    else if (isCurrentSymbolRain && previousObservedSymbol === null) {
      shouldIncrementStreak = true;
    }

    // If any of the defined conditions for a rain streak are met, increment the accumulator.
    if (shouldIncrementStreak) {
      rainStreakAccumulator++;
    }

    // Update the `previousObservedSymbol` to the `currentSymbol` for the next iteration.
    // This maintains the state needed to detect consecutive events.
    previousObservedSymbol = currentSymbol;
  }

  // Display the final calculated rain streak score to the standard output.
  console.log(rainStreakAccumulator);
};

// --- Type III Addition: Encapsulate input reading into a dedicated helper function ---
/**
 * Reads data from the standard input stream.
 * This function abstracts the file system interaction for cleaner separation of concerns.
 *
 * @returns {string} The entire content read from `/dev/stdin` as a UTF-8 encoded string.
 */
const fetchStandardInput = () => {
  // Using 'node:fs' for explicit Node.js module import, a modern practice.
  return require('node:fs').readFileSync('/dev/stdin', 'utf8');
};

// Execute the main weather data processing function by first fetching data from standard input.
ProcessWeatherData(fetchStandardInput());