const processInputData = (rawData) => {
  // Validate and parse the initial numeric target from the raw input string.
  let currentNumericGoal = parseInt(rawData.trim(), 10);

  // Add a preliminary check: if the input is not a valid positive number,
  // we cannot proceed with the generator search.
  if (isNaN(currentNumericGoal) || currentNumericGoal <= 0) {
    // In a real application, one might throw an error or log a more specific message.
    console.error("Input data is invalid or not a positive integer. Exiting.");
    return;
  }

  // Helper function to calculate the sum of digits for a given number.
  // This extracts a common sub-task into a reusable, named fragment.
  const computeDigitSum = (valueToSum) => {
    let accumulator = 0;
    // Convert the number to its absolute string representation to handle potential negative inputs gracefully,
    // though in this context, 'remainingValue' should always be non-negative.
    let numberAsString = String(Math.abs(valueToSum));
    // Iterate through each character (digit) of the string.
    for (let charIndex = 0; charIndex < numberAsString.length; charIndex++) {
      accumulator += parseInt(numberAsString[charIndex], 10);
    }
    return accumulator;
  };

  // A flag to indicate if we've successfully found and printed a result,
  // allowing for a clean exit from the main loop.
  let resultIdentified = false;

  // Begin the iterative search for the constructor.
  // The loop's upper bound `currentNumericGoal` is dynamic and can change within iterations,
  // mimicking the original code's behavior of `n` being reassigned.
  for (let candidateGenerator = 1; candidateGenerator < currentNumericGoal && !resultIdentified; candidateGenerator++) {
    // Calculate the difference between the current goal and the generator candidate.
    const differenceValue = currentNumericGoal - candidateGenerator;

    // Add a guard clause: If the difference is negative, it's not a valid path for
    // generating the current goal in this context, so skip to the next candidate.
    if (differenceValue < 0) {
      continue;
    }

    // Calculate the potential constructor value: candidate + sum of digits of the difference.
    let potentialConstructor = candidateGenerator + computeDigitSum(differenceValue);

    // Evaluate the potential constructor against the current numeric goal.
    if (potentialConstructor < currentNumericGoal) {
      // If a smaller value is found that could be a constructor,
      // update the goal to this new, smaller value. This effectively narrows the search.
      currentNumericGoal = potentialConstructor;
      // The loop condition `candidateGenerator < currentNumericGoal` will now use this updated value,
      // potentially causing earlier termination or a different search path.
    } else if (potentialConstructor === currentNumericGoal) {
      // If the potential constructor exactly matches the current goal,
      // we've found our desired value. Print it and mark as identified.
      console.log(potentialConstructor);
      resultIdentified = true; // Set flag to break out of the loop.
    }
    // If potentialConstructor > currentNumericGoal, no action is taken, and the loop continues
    // with the next candidateGenerator.
  }

  // If the loop completes and no result was identified, it means no such constructor was found
  // within the defined search space. The function will simply return without printing anything further.
  if (!resultIdentified) {
    // Optional: console.log("No matching constructor found for the given input.");
    return;
  }
};

// Execute the main processing function by reading input from standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));