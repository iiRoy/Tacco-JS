// Function to process a set of numerical computations based on input queries.
function ProcessQuerySet(inputRawData) {
  // Split the entire input string into individual lines, filtering out any empty lines.
  const inputLines = inputRawData.split('\n').filter(Boolean);

  // Validate input: ensure there's at least one line for the query count.
  if (inputLines.length === 0) {
    console.error("Error: No input data provided for processing.");
    return;
  }

  // The first line contains the total number of queries to execute.
  // Using `parseInt` with radix for explicit type conversion and safety.
  const totalQueries = parseInt(inputLines[0], 10);

  // Basic validation for the number of queries.
  if (isNaN(totalQueries) || totalQueries <= 0) {
    console.error("Error: Invalid or non-positive number of queries specified.");
    return;
  }

  // An array to collect the calculated results of each query.
  const queryResults = [];

  // Iterate through each query, starting from the second line of the input.
  // The loop runs for 'totalQueries' iterations, processing one query per iteration.
  for (let currentQueryIndex = 0; currentQueryIndex < totalQueries; currentQueryIndex++) {
    // Each query's parameters are on a new line, after the initial query count line.
    // The line index is `currentQueryIndex + 1` relative to the `inputLines` array.
    const currentQueryLine = inputLines[currentQueryIndex + 1];

    // Basic validation to ensure the query line exists before attempting to parse.
    if (!currentQueryLine) {
      console.warn(`Warning: Missing input data for query number ${currentQueryIndex + 1}. This query will be skipped.`);
      continue;
    }

    // Parse the two space-separated integer parameters for the current query.
    // `map(Number)` is used for concise string-to-number type conversion.
    const operandPair = currentQueryLine.split(' ').map(Number);

    // Further validation to ensure two valid numbers were successfully parsed.
    if (operandPair.length !== 2 || isNaN(operandPair[0]) || isNaN(operandPair[1])) {
      console.error(`Error: Invalid numerical operands found for query ${currentQueryIndex + 1}. Skipping this query.`);
      continue;
    }

    // Determine the smaller and larger values from the pair for structured calculations.
    // This re-assignment to `lowVal` and `highVal` provides clearer variable semantics.
    let lowVal = Math.min(operandPair[0], operandPair[1]);
    let highVal = Math.max(operandPair[0], operandPair[1]);

    // Calculate the product of the two operands using a custom function.
    // `MultiplyUint32Parts` is designed to handle products that might exceed standard JS number precision,
    // returning the result as a string.
    const productAsString = MultiplyUint32Parts(lowVal, highVal);

    // Compute the integer square root of the product string.
    // `IntegerSquareRootFromString` returns the floor of the square root as a number.
    let derivedRootValue = IntegerSquareRootFromString(productAsString);

    // Apply an initial adjustment to the derived root value.
    derivedRootValue = derivedRootValue - 1;

    // Initialize the primary result accumulator for the current query.
    // The base calculation is `(lowVal - 1) * 2`.
    let currentQueryResult = (lowVal - 1) * 2;

    // Apply the first conditional adjustment to the result.
    // If `lowVal` is strictly less than `highVal - 1`, increment the result.
    if (lowVal < highVal - 1) {
      currentQueryResult++;
    }

    // Apply the second adjustment, based on the difference between the derived root and `lowVal`.
    // Only positive differences contribute to the adjustment.
    const rootLowValDifference = derivedRootValue - lowVal;
    if (rootLowValDifference > 0) {
      currentQueryResult += rootLowValDifference * 2;
    }

    // Apply the third and final conditional adjustment, involving a division check.
    // A guard clause is crucial here to prevent division by zero if `derivedRootValue` is zero.
    if (derivedRootValue !== 0) {
      // For precision, especially with larger numbers, intermediate multiplication is done with BigInt.
      const numeratorForComparison = BigInt(lowVal) * BigInt(highVal);
      const denominatorForComparison = BigInt(derivedRootValue);
      // Perform BigInt division and convert the result back to a Number for `Math.floor`.
      const calculatedRatio = Number(numeratorForComparison / denominatorForComparison);
      
      // If the floored ratio equals the derived root value, decrement the result.
      if (Math.floor(calculatedRatio) === derivedRootValue) {
        currentQueryResult--;
      }
    } else {
        // If `derivedRootValue` is 0, the condition `Math.floor((lowVal * highVal) / derivedRootValue) === derivedRootValue`
        // would involve division by zero, resulting in `NaN` or `Infinity`, neither of which equals 0.
        // Therefore, the condition naturally fails, and no decrement occurs. No explicit action needed here.
    }

    // Store the final computed result for the current query.
    queryResults.push(currentQueryResult);
  }

  // Output all collected results to the console, each on a new line.
  queryResults.forEach(finalAnswer => console.log(finalAnswer));
}

// Custom function to calculate the integer square root of a large number represented as a string.
// This implements a digit-by-digit long division algorithm similar to manual square root calculation.
function IntegerSquareRootFromString(largeNumberStr) {
  // Input validation: ensure the input is a string composed solely of digits.
  if (typeof largeNumberStr !== 'string' || !/^\d+$/.test(largeNumberStr)) {
    throw new Error("Invalid argument: 'largeNumberStr' must be a string containing only digits.");
  }

  const stringLength = largeNumberStr.length;

  // For numbers that fit within JavaScript's safe integer limits (up to ~15 digits),
  // use the native `Math.sqrt` for better performance and simplicity.
  if (stringLength <= 15) {
      const numericValue = Number(largeNumberStr);
      if (numericValue < 0) { // Though regex checks for digits, defensive check for negative logic.
        throw new Error("Cannot compute square root of a negative number.");
      }
      return Math.floor(Math.sqrt(numericValue));
  }

  let currentRemainder;     // Holds the current remainder in the long division process.
  let currentRootPart;      // Accumulates the integer digits of the square root.
  let divisorCoefficient;   // Aids in constructing the trial divisor for each step.

  // Determine the size of the first block of digits based on the total string length.
  // An odd length means the first block is a single digit; an even length means two digits.
  const initialBlockSize = stringLength % 2 === 1 ? 1 : 2;
  const initialBlockValue = parseInt(largeNumberStr.substring(0, initialBlockSize), 10);

  // Calculate the initial root digit and the corresponding remainder for the first block.
  currentRootPart = Math.floor(Math.sqrt(initialBlockValue));
  currentRemainder = initialBlockValue - (currentRootPart * currentRootPart);

  // Initialize the divisor coefficient. For the first step, it's `2 * currentRootPart`.
  divisorCoefficient = currentRootPart * 2;

  // Iterate through the remaining digit pairs in the large number string.
  // The loop processes two digits at a time, extending the remainder.
  for (let pairIndex = initialBlockSize; pairIndex < stringLength; pairIndex += 2) {
    // Bring down the next two digits and append them to the current remainder.
    // This effectively multiplies `currentRemainder` by 100 and adds the new pair.
    const nextDigitPair = parseInt(largeNumberStr.substring(pairIndex, pairIndex + 2), 10);
    currentRemainder = currentRemainder * 100 + nextDigitPair;

    // Update the divisor coefficient for the current step.
    // The logic `(divisorCoefficient + currentRootPart % 10) * 10` is a specific
    // way this algorithm prepares the `20 * current_root_part_so_far` value.
    divisorCoefficient = (divisorCoefficient + (currentRootPart % 10)) * 10;

    // Find the largest possible trial digit (from 1 to 9) that fits the remainder.
    let trialDigit = 1;
    while (true) {
      const trialDivisor = divisorCoefficient + trialDigit;
      const product = trialDivisor * trialDigit;
      if (currentRemainder < product) {
        trialDigit--; // The previous `trialDigit` was the correct one.
        break;
      }
      if (trialDigit === 9) break; // If 9 works, it's the largest.
      trialDigit++;
    }

    // Append the determined `trialDigit` to the `currentRootPart`.
    currentRootPart = currentRootPart * 10 + trialDigit;

    // Subtract the product of the effective divisor and the trial digit from the remainder.
    currentRemainder -= (divisorCoefficient + trialDigit) * trialDigit;

    // Update the `divisorCoefficient` for the *next* iteration.
    // It becomes `2 * currentRootPart` (the new, extended root).
    divisorCoefficient = currentRootPart * 2;
  }

  // Final adjustment: if there's any remainder left, increment the root.
  // This behavior effectively computes `ceil(sqrt(N))` for the integer part if N is not a perfect square.
  if (currentRemainder > 0) {
    currentRootPart++;
  }

  return currentRootPart;
}

// Custom function for multiplying two unsigned 32-bit integers (up to 2^32-1)
// where their product might exceed standard JavaScript's safe integer limit (2^53-1).
// It returns the full product as a string to maintain complete precision.
function MultiplyUint32Parts(factorA, factorB) {
  // Input validation: ensure both factors are non-negative integers.
  if (!Number.isInteger(factorA) || factorA < 0 ||
      !Number.isInteger(factorB) || factorB < 0) {
    throw new Error("Invalid input: Both factors must be non-negative integers for multiplication.");
  }

  // Handle edge cases where one or both factors are zero, resulting in a product of "0".
  if (factorA === 0 || factorB === 0) {
    return "0";
  }

  // Define a base for splitting numbers. Using 10^5 (100,000) helps ensure
  // intermediate products remain within JavaScript's safe integer range (up to 2^53).
  const PARTITION_BASE = 100000; // 1e5

  // Split `factorA` into a lower part and a higher part based on `PARTITION_BASE`.
  const aLowerPart = factorA % PARTITION_BASE;
  const aHigherPart = Math.floor(factorA / PARTITION_BASE);

  // Calculate the product of `aLowerPart` and `factorB`.
  // This yields the least significant part of the final product and any carry-over.
  let productOfLower = aLowerPart * factorB;
  let carryFromLower = Math.floor(productOfLower / PARTITION_BASE);
  productOfLower %= PARTITION_BASE; // Retain only the digits within the current partition base.

  // Calculate the product of `aHigherPart` and `factorB`, then add the carry-over.
  let productOfHigher = aHigherPart * factorB + carryFromLower;

  // Format the `productOfLower` part: if `productOfHigher` exists (meaning the total product
  // is large enough to have a higher part), pad `productOfLower` with leading zeros
  // to ensure it consistently has `log10(PARTITION_BASE)` digits (e.g., 5 digits for 1e5).
  let formattedLowerPart = String(productOfLower);
  if (productOfHigher > 0) {
    // The padding length is `String(PARTITION_BASE - 1).length`, which is 5 for 100000.
    formattedLowerPart = formattedLowerPart.padStart(String(PARTITION_BASE - 1).length, '0');
  }

  // Concatenate the higher part (if it's non-zero) and the formatted lower part
  // to form the complete product as a string.
  return (productOfHigher === 0 ? "" : String(productOfHigher)) + formattedLowerPart;
}

// --- Main application entry point ---
// Attempt to read input data from standard input (stdin).
// `/dev/stdin` is a common path for standard input on Unix-like systems.
// `0` can also be used as `fd` for `process.stdin.fd` in Node.js.
try {
  const fileDataContent = require("fs").readFileSync(0, "utf8"); // Using `0` for stdin.
  ProcessQuerySet(fileDataContent);
} catch (error) {
  // Catch and report any errors encountered during file reading or data processing.
  console.error("An unhandled error occurred during input processing or computation:");
  console.error(error.message);
  // For debugging, uncomment the following line to see the full stack trace:
  // console.error(error.stack);
}