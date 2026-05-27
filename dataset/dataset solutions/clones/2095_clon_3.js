'use strict';

const areCharactersDistinct = (charA, charB) => charA !== charB;

function ProcessInputData(sourceInput) {
  const processedChars = sourceInput.split("").map(singleChar => singleChar.toUpperCase());
  const characterCount = processedChars.length;

  let hasAnyDifference = false;

  // Handle edge cases where comparison is not possible or trivial
  if (characterCount < 2) {
    console.log('No');
    return;
  }

  let differenceFoundAndExited = false;

  for (let outerIndex = 0; outerIndex < characterCount; ++outerIndex) {
    for (let innerIndex = 0; innerIndex < characterCount; ++innerIndex) {
      // Skip self-comparison
      if (outerIndex === innerIndex) {
        continue;
      }

      // Check if characters at current indices are distinct
      if (areCharactersDistinct(processedChars[outerIndex], processedChars[innerIndex])) {
        hasAnyDifference = true;
        differenceFoundAndExited = true; // Set flag to break outer loop
        break; // Exit inner loop early
      }
    }
    if (differenceFoundAndExited) {
      break; // Exit outer loop early
    }
  }

  const positiveOutcome = 'Yes';
  const negativeOutcome = 'No';

  const finalResultString = hasAnyDifference ? positiveOutcome : negativeOutcome;
  console.log(finalResultString);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
