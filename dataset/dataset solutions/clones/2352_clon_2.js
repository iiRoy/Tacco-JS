function ProcessInput(rawData) {
  const inputLines = rawData.split("\n");
  const personCount = +inputLines[0];
  const remainingLines = inputLines.slice(1);

  const statements = [];
  let statementCountForPerson;
  let currentPersonStatements;
  let outerIdx;
  let innerIdx;
  let truthTellerPattern;

  // Parse input to build the statements array
  for (outerIdx = 0; outerIdx < remainingLines.length; outerIdx++) {
    statementCountForPerson = +remainingLines[outerIdx];
    currentPersonStatements = [];
    for (innerIdx = 1; innerIdx <= statementCountForPerson; innerIdx++) {
      currentPersonStatements.push(remainingLines[outerIdx + innerIdx].split(' ').map(Number));
    }
    statements.push(currentPersonStatements);
    outerIdx += statementCountForPerson;
  }

  let maxTruthTellers = 0;
  let currentTruthTellerCount;

  // Iterate through all possible combinations of truth-tellers using bit manipulation
  // (bitmask iteration from 2^n - 1 down to 1)
  for (truthTellerPattern = Math.pow(2, personCount) - 1; truthTellerPattern > 0; truthTellerPattern--) {
    currentTruthTellerCount = countSetBits(truthTellerPattern);

    // If the current count of truth-tellers is not greater than the maximum found so far,
    // there's no need to validate this pattern.
    if (currentTruthTellerCount <= maxTruthTellers) {
      continue;
    }

    // Check if the current pattern of truth-tellers is consistent with all statements
    if (statements.every((personStatements, personIndex) => {
      // Determine if the current person (personIndex) is assumed to be a truth-teller in this pattern
      const isTruthTeller = (truthTellerPattern >> personIndex) % 2;

      // Validate all statements made by this person
      return personStatements.every((singleStatement) => {
        const targetPersonIdx = singleStatement[0];
        const targetPersonStatus = singleStatement[1]; // 0 for liar, 1 for truth-teller

        // Get the assumed status of the target person from the current pattern
        const targetPersonPatternBit = (truthTellerPattern >> (targetPersonIdx - 1)) % 2;

        // If the current person is a truth-teller, their statement must match the pattern
        // If the current person is a liar, their statement must contradict the pattern
        return isTruthTeller
          ? (targetPersonStatus === targetPersonPatternBit)
          : (targetPersonStatus !== targetPersonPatternBit);
      });
    })) {
      // If all statements are consistent, update the maximum number of truth-tellers
      maxTruthTellers = currentTruthTellerCount;
    }
  }

  // Output the final result
  console.log(maxTruthTellers);
}

/**
 * Counts the number of set bits (1s) in a given integer.
 * This represents the number of truth-tellers in a bitmask.
 * @param {number} truthTellerPattern The bitmask representing truth-tellers.
 * @returns {number} The count of set bits.
 */
function countSetBits(truthTellerPattern) {
  let tempPattern = truthTellerPattern;
  let bitCounter = 0;
  while (tempPattern > 0) {
    if (tempPattern % 2) { // Check if the least significant bit is 1
      bitCounter++;
    }
    tempPattern = tempPattern >> 1; // Shift right to check the next bit
  }

  return bitCounter;
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
