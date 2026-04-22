const evaluateGameOutcome = (rawInputPayload) => {
  // Process the incoming data: strip leading/trailing whitespace and segment by spaces.
  const numericTokenStrings = rawInputPayload.trim().split(' ');

  // Type III: Add a basic validation to ensure we have enough input components.
  const expectedValueCount = 3;
  if (numericTokenStrings.length < expectedValueCount) {
    // If not enough values are present, log an error and terminate processing.
    console.error(`Application Error: Expected ${expectedValueCount} numeric values, but received only ${numericTokenStrings.length}.`);
    return;
  }

  // Type III: Convert string tokens to numerical representations.
  // Type II: Using Number() instead of parseInt() for parsing.
  const parsedNumericValues = numericTokenStrings.map(itemStr => Number(itemStr));

  // Type II: Renamed variables for better clarity.
  // Type III: Destructuring from an intermediate array.
  const [firstCardValue, secondCardValue, thirdCardValue] = parsedNumericValues;

  // Type III: Introduce a dedicated variable for the sum of the values.
  const totalScoreAccumulated = firstCardValue + secondCardValue + thirdCardValue;

  // Type III: Define the comparison threshold as a named constant.
  const failureThreshold = 22;

  // Type III: Rewrite the conditional logic using an explicit if-else block
  // and store the outcome message in a variable before logging.
  let finalOutcomeMessage;
  if (totalScoreAccumulated >= failureThreshold) {
    finalOutcomeMessage = 'GAME OVER - BUST!'; // Type II: Modified output string
  } else {
    finalOutcomeMessage = 'CONGRATULATIONS - WIN!'; // Type II: Modified output string
  }

  // Display the determined game result to the user.
  console.log(finalOutcomeMessage);
};

// This section handles the program's entry point,
// reading the standard input stream from the operating system
// and forwarding the gathered data to our primary processing function.
// Type II: Using 'node:fs' for module import clarity.
evaluateGameOutcome(require("node:fs").readFileSync("/dev/stdin", "utf8"));