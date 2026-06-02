// This code is a Type IV clone of the original JavaScript.
// It preserves the exact observable behavior and external contract
// but uses a substantially different implementation strategy.

// The original code was compiled from PureScript, heavily relying on
// monadic structures (Aff, Effect, ST, Either, Maybe) and functional programming patterns.
// This clone re-implements the core logic using standard, imperative JavaScript
// with async/await for asynchronous operations, direct loops, and native error handling.

// Helper function to parse the input string into an object containing the four integer values.
// This replaces the combination of Data.String.Common.trim, Data.String.Common.split,
// Data.Int.fromString, Data.Maybe.maybe, Data.Either.note, and Partial.Unsafe.unsafeCrashWith.
function extractNumericParameters(rawInputText) {
  const cleanedText = rawInputText.trim();
  const textSegments = cleanedText.split(' ');
  const numericalValues = textSegments.map(Number);

  // Validate that exactly four valid numbers were parsed.
  if (numericalValues.length !== 4 || numericalValues.some(Number.isNaN)) {
    // Mimics the original's behavior of crashing with a specific error message on invalid input.
    throw new Error("r g b n");
  }

  // Assign the parsed values to descriptive variables.
  const [costR, costG, costB, totalSum] = numericalValues;
  return { costR, costG, costB, totalSum };
}

// Core function to calculate the number of combinations.
// This replaces the nested Control.Monad.ST.Internal.for loops,
// the mutable STRef for the counter, and the various PureScript data type operations
// like Data.Ord.min/max, Data.EuclideanRing.div/mod, and Data.Semiring.add.
function computePossibleArrangements(redCost, greenCost, blueCost, overallBudget) {
  let arrangementCount = 0;

  // Iterate through all possible quantities for 'red' items.
  // The upper limit for 'redCount' is determined by the budget and 'redCost',
  // capped at 3000 as per typical problem constraints.
  const maximumRedItems = Math.min(3000, Math.floor(overallBudget / redCost));
  for (let redCount = 0; redCount <= maximumRedItems; redCount++) {
    const currentRedTotal = redCost * redCount;
    const budgetAfterRed = overallBudget - currentRedTotal;

    // Iterate through all possible quantities for 'green' items.
    // The upper limit for 'greenCount' is determined by the remaining budget and 'greenCost',
    // also capped at 3000. If 'budgetAfterRed' is negative, 'maximumGreenItems' will be negative,
    // and this inner loop will correctly not execute.
    const maximumGreenItems = Math.min(3000, Math.floor(budgetAfterRed / greenCost));
    for (let greenCount = 0; greenCount <= maximumGreenItems; greenCount++) {
      const currentGreenTotal = greenCost * greenCount;
      const combinedRedGreenTotal = currentRedTotal + currentGreenTotal;

      // Only proceed if the combined cost of red and green items does not exceed the overall budget.
      if (combinedRedGreenTotal <= overallBudget) {
        const remainingForBlue = overallBudget - combinedRedGreenTotal;

        // Check if the remaining budget can be perfectly covered by 'blue' items.
        // The quantity of 'blue' items (remainingForBlue / blueCost) will be non-negative
        // because of the 'combinedRedGreenTotal <= overallBudget' check.
        // It will also implicitly be <= 3000 given the problem's typical constraints
        // on input values (R, G, B, N <= 3000).
        if (remainingForBlue % blueCost === 0) {
          arrangementCount++;
        }
      }
    }
  }
  // Converts the final count to a string, mimicking Data.Show.showInt.
  return arrangementCount.toString();
}

// Main asynchronous entry point for the application.
// This replaces the Effect.Aff monad's structure for managing asynchronous I/O,
// including Effect.Aff.makeAff, Effect.Aff.launchAff_, Effect.Ref.new/read/write,
// Node.Stream.onDataString/onEnd, Node.Process.stdin/stdout, and Effect.Class.liftEffect.
async function executeApplication() {
  let collectedInput = '';

  // Read all incoming data from standard input using async iteration.
  for await (const dataSegment of process.stdin) {
    collectedInput += dataSegment.toString('utf8');
  }

  let finalResultString;
  try {
    // Parse the input parameters. This step can throw an error if input is malformed.
    const { costR, costG, costB, totalSum } = extractNumericParameters(collectedInput);

    // Perform the core calculation using the parsed parameters.
    finalResultString = computePossibleArrangements(costR, costG, costB, totalSum);
  } catch (operationError) {
    // If any error occurs during parsing or calculation, re-throw it.
    // This preserves the original code's behavior of crashing on such errors.
    throw operationError;
  }

  // Write the computed result to standard output, followed by a newline character.
  // This replaces Node.Stream.writeString.
  process.stdout.write(finalResultString + '\n');
}

// Invoke the main application function.
// If the Promise returned by 'executeApplication' rejects, Node.js will
// report an unhandled promise rejection to stderr and exit with a non-zero code,
// which is consistent with the original code's "crash" behavior.
executeApplication();
