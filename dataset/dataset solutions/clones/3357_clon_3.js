"use strict";

const parseInputValues = (inputLine) => {
  const parts = inputLine.split(" ");
  return parts.map(segment => parseInt(segment, 10));
};

const calculateResult = (inputString) => {
  const [initialA, initialB, initialC] = parseInputValues(inputString);

  let currentB = initialB;
  let currentC = initialC;
  let finalResult = 0;

  // Phase 1: Process initial B and C values
  if (currentB >= currentC) {
    // If B is sufficient or more than C, consume all of C and add both B and C to result
    finalResult += currentC + currentB;
    currentC = 0; // All of C has been accounted for
  } else {
    // If B is less than C, consume all of B. Add B*2 to result (B from B, B from C)
    finalResult += currentB * 2;
    currentC = currentC - currentB; // C is reduced by the amount of B consumed
    currentB = 0; // All of B has been accounted for
  }

  // Phase 2: Process remaining C with initial A
  if (currentC > 0) {
    // Determine how much of A can be matched with the remaining C
    const matchedAmount = Math.min(currentC, initialA);
    currentC = currentC - matchedAmount; // Reduce C by the matched amount
    finalResult += matchedAmount; // Add the matched amount to the result
  }

  // Phase 3: Final adjustment for any leftover C
  if (currentC > 0) {
    finalResult++; // If C still has a positive value, increment the result by one
  }

  console.log(finalResult);
};

calculateResult(require('fs').readFileSync('/dev/stdin', 'utf8'));
