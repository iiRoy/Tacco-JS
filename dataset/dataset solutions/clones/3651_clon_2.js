function obtainComparisonFunction(comparisonKind, sortOrderMultiplier) {
  // Define a collection of comparison methods based on the specified kind.
  const comparisonMethods = {
    "NUMERIC": function(firstElement, secondElement) {
        // Compare numerically by parsing to floats.
        return parseFloat(firstElement) - parseFloat(secondElement);
    },
    "TEXT": function(firstElement, secondElement) {
        // Compare as strings, case-sensitive.
        return firstElement.toString() > secondElement.toString() ? 1 : -1;
    },
    "IGNORE_CASE": function(firstElement, secondElement) {
        // Compare as strings, ignoring case.
        return firstElement.toString().toLowerCase() > secondElement.toString().toLowerCase() ? 1 : -1;
    },
  };
  // Retrieve the specific comparator function.
  const selectedComparator = comparisonMethods[comparisonKind];

  // Return a new function that applies the selected comparator and adjusts for sort direction.
  return function(itemA, itemB) {
    return selectedComparator(itemA, itemB) * sortOrderMultiplier;
  };
}

function processInputData(rawData) {
  // Split the raw input string into an array of tokens using space as a delimiter.
  const inputTokens = rawData.split(' ');
  // Create a sorted copy of the tokens using a numeric descending comparison.
  let orderedValues = inputTokens.slice().sort(obtainComparisonFunction("NUMERIC", -1));
  // Initialize a variable to accumulate the final sum.
  let finalSum = 0.0;

  // Determine the upper bound for the loop.
  const loopLimit = orderedValues.length - 1;
  // Initialize the loop increment step.
  let incrementStep = 1;

  // Adjust the increment step if the loop condition would be immediately false.
  if (1.0 > loopLimit) {
    incrementStep = -incrementStep;
  }

  // Iterate through the sorted values, starting from the second element.
  for (let idx = 1; incrementStep >= 0 ? idx <= loopLimit : idx >= loopLimit; idx += incrementStep) {
    // Get the current element (which is actually the previous one in the original logic).
    const currentVal = orderedValues[(idx - 1)];
    // Get the next element.
    const nextVal = orderedValues[((idx + 1) - 1)]; // This simplifies to orderedValues[idx]

    // Add the absolute difference between the current and next values to the total sum.
    finalSum = finalSum + Math.abs(currentVal - nextVal);
  }
  // Output the calculated final sum to the console.
  console.log(finalSum);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
