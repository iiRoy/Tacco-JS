function ProcessInput(rawData) {
  // Trim leading/trailing whitespace and split the input string into an array of lines.
  let processedLines = rawData.trim().split('\n');

  // Parse the first line to get the total number of rounds.
  const numRounds = parseInt(processedLines[0], 10);

  // Initialize the two primary values, 'currentValA' and 'currentValT', to 1.
  let currentValA = 1;
  let currentValT = 1;

  // Loop through each subsequent line, starting from the second line (index 1).
  for (let roundIdx = 1; roundIdx <= numRrounds; roundIdx++) {
    // Split the current line by space and convert the parts to integers.
    const roundData = processedLines[roundIdx].split(' ').map((numStr) => parseInt(numStr, 10));

    // Extract the target T and A values for the current round.
    const targetT = roundData[0];
    const targetA = roundData[1];

    // Calculate the minimum multiplier needed to satisfy the conditions for both T and A.
    // This ensures that the new currentValT is a multiple of targetT and >= previous currentValT,
    // and similarly for currentValA.
    const multiplier = Math.max(
      Math.ceil(currentValT / targetT),
      Math.ceil(currentValA / targetA)
    );

    // Update currentValT and currentValA using the calculated multiplier.
    currentValT = targetT * multiplier;
    currentValA = targetA * multiplier;
  }

  // After all rounds, print the sum of the final currentValA and currentValT.
  console.log(currentValA + currentValT);
}

// Read the input from standard input using Node.js file system module.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
