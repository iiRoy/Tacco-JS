function parseNumericLine(lineContent) {
  return lineContent.split(' ').map(Number);
}

function calculateStepsUntilSignChange(ratesArray) {
  let currentAccumulatedSum = 0;
  let stepIterationCount = -1; // Corresponds to the 'count' variable in the original logic

  while (true) {
    stepIterationCount++;
    const sumBeforeCurrentAddition = currentAccumulatedSum; // This captures 'xmae = x' from original
    const rateContributionForThisStep = ratesArray[stepIterationCount % 2];
    currentAccumulatedSum += rateContributionForThisStep; // This captures 'x += sa[count%2]' from original

    // The termination condition: if the current sum and the sum before this step
    // have the same sign (both positive or both negative).
    // This is equivalent to 'if(x*xmae > 0)' in the original.
    if (currentAccumulatedSum * sumBeforeCurrentAddition > 0) {
      break;
    }
  }
  // The original code outputs 'count-1', so we apply the same adjustment.
  return stepIterationCount - 1;
}

function processInputData(rawInputString) {
  const inputLines = rawInputString.split('\n');

  // Parse the three lines of space-separated numbers
  const timeMultipliers = parseNumericLine(inputLines[0]);
  const rateSetA = parseNumericLine(inputLines[1]);
  const rateSetB = parseNumericLine(inputLines[2]);

  // Calculate the effective net contribution for each of the two scenarios.
  // Original: sa[0] = T[0]*A[0]-T[0]*B[0];
  // Refactored to use a loop and an intermediate variable for clarity.
  const netContributions = new Array(2);
  for (let index = 0; index < 2; index++) {
    const differenceInRates = rateSetA[index] - rateSetB[index];
    netContributions[index] = timeMultipliers[index] * differenceInRates;
  }

  // Check for the special 'infinity' condition.
  // Original: if(sa[0] == sa[1]*-1)
  // Rewritten as an explicit sum to zero check.
  if (netContributions[0] + netContributions[1] === 0) {
    console.log('infinity');
  } else {
    // Delegate the main iterative calculation to a dedicated helper function.
    const finalStepResult = calculateStepsUntilSignChange(netContributions);
    console.log(finalStepResult);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
