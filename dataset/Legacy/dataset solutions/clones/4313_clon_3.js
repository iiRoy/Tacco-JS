function extractLineFromInput(inputContainer) {
  const NEWLINE_CHAR = "\n";
  let extractedSegment;
  const inputString = inputContainer[0];

  for (let charIndex = 0; charIndex < inputString.length; charIndex++) {
    if (NEWLINE_CHAR === inputString[charIndex]) {
      extractedSegment = inputString.slice(0, charIndex);
      const remainingStringStart = extractedSegment.length + 1;
      inputContainer[0] = inputString.slice(remainingStringStart);
      return extractedSegment;
    }
  }
  extractedSegment = inputString;
  inputContainer[0] = "";
  return extractedSegment;
}

function processInputData(rawInputString) {
  const mutableInputArray = [rawInputString];
  let lineNStr = extractLineFromInput(mutableInputArray);
  let targetFractionValue = parseInt(lineNStr);

  // The original code contained a call to search2way(0.0002857959416976279, 3500, 1750)
  // which was identified as dead code because its return value was not used
  // and it had no observable side effects on the program's execution.
  // This non-essential code has been removed as a Type III modification.

  const NUMERATOR_CONSTANT = 4;
  targetFractionValue = NUMERATOR_CONSTANT / targetFractionValue;

  const MAX_DENOM_LIMIT = 3500;
  const MIN_DENOM_LIMIT = 1;
  const INVALID_SEARCH_RESULT = -1;

  // Nested helper function for binary search
  function findDenominatorBinarySearch(targetFractionPart, initialTestDenom, initialStepSize) {
    let currentTestDenom = initialTestDenom;
    let searchStep = initialStepSize;
    let searchDirectionLock = 0; // 0: no lock, 1: locked to increase, -1: locked to decrease

    while (searchStep > 0) {
      const currentFractionValue = 1 / currentTestDenom;

      if (targetFractionPart == currentFractionValue) { // Preserve loose equality for floats
        return currentTestDenom;
      } else if (targetFractionPart < currentFractionValue) {
        const nextTestDenom = currentTestDenom + searchStep;
        currentTestDenom = nextTestDenom;

        if (searchStep === 1 && searchDirectionLock === 0) {
          searchDirectionLock = 1;
        }
        if (searchDirectionLock === -1) {
          return INVALID_SEARCH_RESULT;
        }
        if (currentTestDenom > MAX_DENOM_LIMIT) {
          return INVALID_SEARCH_RESULT;
        }
      } else { // targetFractionPart > currentFractionValue
        const nextTestDenom = currentTestDenom - searchStep;
        currentTestDenom = nextTestDenom;

        if (searchStep === 1 && searchDirectionLock === 0) {
          searchDirectionLock = -1;
        }
        if (searchDirectionLock === 1) {
          return INVALID_SEARCH_RESULT;
        }
        if (currentTestDenom < MIN_DENOM_LIMIT) {
          return INVALID_SEARCH_RESULT;
        }
      }

      searchStep = Math.floor(searchStep / 2);
      if (searchStep === 0) {
        searchStep = 1;
      }
    }
    return INVALID_SEARCH_RESULT;
  }

  // Nested helper function to check and output solution
  function checkAndOutputSolution(requiredSum, hVal, nVal, wVal) {
    const hFraction = 1 / hVal;
    const nFraction = 1 / nVal;
    const wFraction = 1 / wVal;
    const calculatedSum = hFraction + nFraction + wFraction;

    if (requiredSum == calculatedSum) { // Preserve loose equality for floats
      console.log(`${hVal} ${nVal} ${wVal}`);
      return true;
    }
    return false;
  }

  // The original code contained an 'isInclude' function which was never called.
  // This dead code has been removed as a Type III modification.

  for (let hDenom = MIN_DENOM_LIMIT; hDenom <= MAX_DENOM_LIMIT; hDenom++) {
    const hFractionValue = 1 / hDenom;
    if (targetFractionValue <= hFractionValue) {
      continue;
    }

    for (let nDenom = MIN_DENOM_LIMIT; nDenom <= MAX_DENOM_LIMIT; nDenom++) {
      const nFractionValue = 1 / nDenom;
      const currentSumOfFractions = hFractionValue + nFractionValue;

      if (targetFractionValue <= currentSumOfFractions) {
        continue;
      }

      const requiredWFraction = targetFractionValue - currentSumOfFractions;
      const wDenomResult = findDenominatorBinarySearch(requiredWFraction, MAX_DENOM_LIMIT, Math.floor(MAX_DENOM_LIMIT / 2));

      if (wDenomResult === INVALID_SEARCH_RESULT) {
        continue;
      }
      if (checkAndOutputSolution(targetFractionValue, hDenom, nDenom, wDenomResult)) {
        return;
      }
    }
  }
  console.log("NG");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
