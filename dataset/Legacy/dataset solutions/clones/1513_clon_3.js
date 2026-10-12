const calculatePaths = (rawInputString) => {
  const moduloConstant = 998244353n;

  // Helper function to parse a line of space-separated numbers
  const parseNumericLine = (lineContent) => lineContent.split(' ').map(Number);

  // Split the entire input string into individual lines
  const allInputLines = rawInputString.trim().split('\n');
  const firstInputLine = allInputLines[0];
  const querySegments = allInputLines.slice(1);

  // Extract the target position 'n' from the first line
  const [targetPosition] = parseNumericLine(firstInputLine);

  // Use a Set to efficiently collect unique step values from all query ranges
  const encounteredStepsSet = new Set();
  for (let queryIndex = 0; queryIndex < querySegments.length; queryIndex++) {
    const currentQueryLine = querySegments[queryIndex];
    const [segmentStart, segmentEnd] = parseNumericLine(currentQueryLine);

    // Iterate through the range and add each number to the set
    for (let stepCandidate = segmentStart; stepCandidate <= segmentEnd; stepCandidate++) {
      encounteredStepsSet.add(stepCandidate);
    }
  }

  // Convert the set of unique steps into a sorted array
  const sortedUniqueSteps = Array.from(encounteredStepsSet).sort((valA, valB) => valA - valB);

  // Initialize the dynamic programming table with BigInt zeros
  const pathCounts = new Array(targetPosition + 1).fill(0n);
  // Base case: there is 1 way to reach position 1
  pathCounts[1] = 1n;

  // Helper function for modular addition with BigInts
  const addWithModulo = (currentSum, valueToAdd, modVal) => (currentSum + valueToAdd) % modVal;

  // Perform dynamic programming to calculate path counts
  for (let currentPosition = 1; currentPosition < targetPosition; currentPosition++) {
    // If the current position is unreachable (0 ways), skip to the next position
    if (pathCounts[currentPosition] === 0n) {
      continue;
    }

    // Iterate through all available step sizes
    for (let stepIndex = 0; stepIndex < sortedUniqueSteps.length; stepIndex++) {
      const stepValue = sortedUniqueSteps[stepIndex];
      const nextPosition = currentPosition + stepValue;

      // If the next position exceeds the target,
      // we can break early because steps are sorted, so subsequent steps will also exceed the target.
      if (nextPosition > targetPosition) {
        break;
      }

      // Add the number of ways to reach currentPosition to the number of ways to reach nextPosition
      pathCounts[nextPosition] = addWithModulo(pathCounts[nextPosition], pathCounts[currentPosition], moduloConstant);
    }
  }

  // Calculate the final result, ensuring it's positive after modulo
  const finalResult = (pathCounts[targetPosition] % moduloConstant + moduloConstant) % moduloConstant;
  console.log(`${finalResult}`);
};

// Standard input/output handling based on environment variable
process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : calculatePaths(require('fs').readFileSync('dev/stdin', 'utf8')))
  : calculatePaths(require('fs').readFileSync('/dev/stdin', 'utf8'));
