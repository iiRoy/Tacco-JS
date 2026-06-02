function myout(text) {
  console.log(text);
}

function Main(input) {
  input = input.trim().split("\n");
  const sequenceLength = parseInt(input[0], 10);
  const numericSequence = input[1].split(" ").map(Number);

  const valueOccurrences = new Map();
  for (const currentNum of numericSequence) {
    valueOccurrences.set(currentNum, (valueOccurrences.get(currentNum) || 0) + 1);
  }

  let expectedPairCount;
  let validationPasses = true;

  if (sequenceLength % 2 === 1) { // Odd length scenario
    // The value 0 must appear exactly once
    if (valueOccurrences.get(0) !== 1) {
      validationPasses = false;
    }
    expectedPairCount = (sequenceLength - 1) / 2;
    // Start checking for pairs from 1
    for (let i = 1; i <= expectedPairCount; i++) {
      // All other values (1 to expectedPairCount) must appear exactly twice
      if (valueOccurrences.get(i) !== 2) {
        validationPasses = false;
        break;
      }
    }
    // Ensure no unexpected values are present
    if (validationPasses && valueOccurrences.size !== expectedPairCount + 1) {
      validationPasses = false;
    }
  } else { // Even length scenario
    expectedPairCount = sequenceLength / 2;
    // All values (1 to expectedPairCount) must appear exactly twice
    for (let i = 1; i <= expectedPairCount; i++) {
      if (valueOccurrences.get(i) !== 2) {
        validationPasses = false;
        break;
      }
    }
    // Ensure no unexpected values are present
    if (validationPasses && valueOccurrences.size !== expectedPairCount) {
      validationPasses = false;
    }
  }

  if (!validationPasses) {
    myout("0");
    return;
  }

  // Calculate the result: 2 raised to the power of the number of pairs
  const finalResult = Math.pow(2, expectedPairCount);
  myout(finalResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
