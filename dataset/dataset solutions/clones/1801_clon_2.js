function processRecurse(countRemaining, targetValue, dataArray, choiceString, memoTable) {
  // Debugging line, originally commented: current state of parameters
  if (countRemaining === 0) {
    // Base case: if no elements left to process, target must be zero
    return targetValue === 0;
  }

  const currentChoice = choiceString[choiceString.length - countRemaining];

  // Check if this subproblem's result is already stored in the memoization table
  if (memoTable[countRemaining] !== void 0 && memoTable[countRemaining][targetValue] !== void 0) {
    // Debugging line, originally commented: returning cached result
    return memoTable[countRemaining][targetValue];
  }

  let resultFlag; // Stores the boolean outcome of the current recursive step

  // Logic depends on the character in the choice string
  if (currentChoice === '1') {
    // When '1', both options must be true for the overall result to be true (AND operation)
    // First recursive call: skip the current element
    // Second recursive call: XOR the target with the current element's numeric value
    resultFlag = processRecurse(countRemaining - 1, targetValue, dataArray, choiceString, memoTable) &&
                 processRecurse(countRemaining - 1, targetValue ^ Number(dataArray[choiceString.length - countRemaining]), dataArray, choiceString, memoTable);
  } else {
    // When '0', either option being true is sufficient for the overall result to be true (OR operation)
    // First recursive call: skip the current element
    // Second recursive call: XOR the target with the current element's numeric value
    resultFlag = processRecurse(countRemaining - 1, targetValue, dataArray, choiceString, memoTable) ||
                 processRecurse(countRemaining - 1, targetValue ^ Number(dataArray[choiceString.length - countRemaining]), dataArray, choiceString, memoTable);
  }

  // Initialize the inner object in the memoization table if it doesn't exist
  if (memoTable[countRemaining] === void 0) {
    memoTable[countRemaining] = {};
  }

  // Store the computed result for future use
  memoTable[countRemaining][targetValue] = resultFlag;
  return resultFlag;
}


function executeProgram(rawData) {
  const parsedLines = rawData.split('\n'); // Split input into individual lines
  const testCases = +parsedLines[0]; // Convert first line to number of test cases

  // Iterate through each set of test case inputs
  for (let loopIndex = 0; loopIndex < testCases * 3; loopIndex += 3) {
    const initialCount = parsedLines[loopIndex + 1]; // Number of elements for this case
    const dataArray = parsedLines[loopIndex + 2].split(' '); // Array of values as strings
    const choiceString = parsedLines[loopIndex + 3]; // String dictating AND/OR logic

    // Call the recursive solver with initial parameters and an empty memoization object
    const finalOutcome = processRecurse(Number(initialCount), 0, dataArray, choiceString, {});

    // Output '0' if true (target can be reached), '1' if false
    console.log(finalOutcome ? '0' : '1');
  }
  // Debugging line, originally commented: console.log('total iterations:', iterationCount);
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));