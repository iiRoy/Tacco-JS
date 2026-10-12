function processPuzzle(level, currentXORSum, valueArray, patternString) {
  // Base case: if no more levels to process
  if (level === 0) {
    // Return true if the final XOR sum is zero, false otherwise
    return currentXORSum === 0;
  }

  // Determine the character at the current level from the pattern string
  const currentPatternChar = patternString[patternString.length - level];

  // Branch based on the current pattern character
  if (currentPatternChar === '1') {
    // If the character is '1', both recursive paths must return true
    // Path 1: XOR with the corresponding value from the array
    const resultOne = processPuzzle(level - 1, currentXORSum ^ valueArray[patternString.length - level], valueArray, patternString);
    // Path 2: Do not XOR with the corresponding value
    const resultTwo = processPuzzle(level - 1, currentXORSum, valueArray, patternString);
    // Both outcomes must be true for this branch to be true
    return resultOne && resultTwo;
  } else {
    // If the character is '0', at least one recursive path must return true
    // Path 1: XOR with the corresponding value from the array
    // Path 2: Do not XOR with the corresponding value
    // Either outcome being true is sufficient for this branch
    return processPuzzle(level - 1, currentXORSum ^ valueArray[patternString.length - level], valueArray, patternString) || processPuzzle(level - 1, currentXORSum, valueArray, patternString);
  }
}

function entryPoint(rawData) {
  // Split the entire input into individual lines
  const parsedLines = rawData.split('\n');
  // The first line contains the total number of test cases
  const testCaseCount = Number(parsedLines[0]);

  // Loop through each test case block, which consists of 3 lines
  for (let idx = 0; idx < testCaseCount * 3; idx += 3) {
    // Extract N for the current test case
    const currentN = parsedLines[idx + 1];
    // Extract array A, splitting by spaces
    const valueArray = parsedLines[idx + 2].split(' ');
    // Extract string S
    const patternString = parsedLines[idx + 3];

    // Call the core logic function with initial parameters
    const finalOutcome = processPuzzle(currentN, 0, valueArray, patternString);

    // Output '0' if the outcome is true, '1' if false
    console.log(finalOutcome ? '0' : '1');
  }
}

// Read input from standard input and pass it to the entry point function
entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
