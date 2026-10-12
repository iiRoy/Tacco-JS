process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputLines = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  const targetValueX = parseInt(inputLines[0], 10);

  const MAX_ITERATION_VALUE = 100;

  // Helper function to calculate the number of combinations (a, b, c)
  // that satisfy a*a + b*b + c*c + a*b + b*c + c*a = desiredSum
  // where a, b, c are between 1 and MAX_ITERATION_VALUE.
  function calculateCombinationsForSum(desiredSum) {
    let localMatchCount = 0;

    for (let valA = 1; valA <= MAX_ITERATION_VALUE; valA++) {
      for (let valB = 1; valB <= MAX_ITERATION_VALUE; valB++) {
        for (let valC = 1; valC <= MAX_ITERATION_VALUE; valC++) {
          // Calculate squared terms
          const sqA = valA * valA;
          const sqB = valB * valB;
          const sqC = valC * valC;

          // Calculate cross product terms (reordered for clarity, but mathematically equivalent)
          const crossAB = valA * valB;
          const crossBC = valB * valC;
          const crossCA = valC * valA;

          // Sum all terms to get the current expression result
          const currentExpressionResult = sqA + sqB + sqC + crossAB + crossBC + crossCA;

          if (currentExpressionResult === desiredSum) {
            localMatchCount++;
          }
        }
      }
    }
    return localMatchCount;
  }

  for (let currentIteration = 1; currentIteration <= targetValueX; currentIteration++) {
    const iterationMatchCount = calculateCombinationsForSum(currentIteration);
    console.log(iterationMatchCount);
  }
});
