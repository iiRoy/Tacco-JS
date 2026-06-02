'use strict'

const obtainSourceString = (fullInputContent) => {
  const lines = fullInputContent.split('\n');
  return lines[0];
};

const determinePatternMatch = (inputString) => {
  const referencePattern = 'keyence';
  let matchOutcome = 'YES';
  let currentPatternIdx = 0;
  let firstMismatchStartIdx = -1;
  let encounteredMultipleMismatchBlocks = false;

  const patternLength = referencePattern.length;
  const inputLength = inputString.length;

  // Helper function to check for disjoint mismatches
  const isMismatchDisjoint = (currentInputIdx) => {
    return firstMismatchStartIdx !== -1 && firstMismatchStartIdx + 1 !== currentInputIdx;
  };

  let currentInputIdx = 0;
  for (; currentInputIdx < inputLength; currentInputIdx++) {
    const isPatternCharAvailable = currentPatternIdx < patternLength;
    const currentInputChar = inputString[currentInputIdx];
    const currentPatternChar = isPatternCharAvailable ? referencePattern[currentPatternIdx] : undefined;

    if (currentInputChar === currentPatternChar) {
      currentPatternIdx++;
    } else {
      // Mismatch or pattern fully matched and remaining input characters are extra
      if (isMismatchDisjoint(currentInputIdx)) {
        encounteredMultipleMismatchBlocks = true;
        break; // Exit loop early
      }
      firstMismatchStartIdx = currentInputIdx;
    }
  }

  if (encounteredMultipleMismatchBlocks) {
    matchOutcome = 'NO';
  } else if (currentPatternIdx !== patternLength) {
    // If the entire reference pattern was not matched as a subsequence
    matchOutcome = 'NO';
  }
  // If no disjoint mismatches and the pattern was fully matched, matchOutcome remains 'YES'

  return matchOutcome;
};

const executeMainLogic = (rawInputData) => {
  const sourceString = obtainSourceString(rawInputData);
  const finalResult = determinePatternMatch(sourceString);
  console.log(finalResult);
};

executeMainLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
