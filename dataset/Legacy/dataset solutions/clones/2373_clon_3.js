"use strict";

const generatePermutationsWithRepetition = (
  sourceElements,
  targetLength = sourceElements.length
) => {
  if (targetLength === 1) {
    const baseCaseResult = sourceElements.map(currentElement => [currentElement]);
    return baseCaseResult;
  }

  // Initialize array for storing all permutations.
  const resultPermutations = [];

  // Recursively get smaller permutations.
  const subPermutations = generatePermutationsWithRepetition(
    sourceElements,
    targetLength - 1
  );

  // Iterate through all available options and prepend them to the smaller permutations.
  sourceElements.forEach((optionToPrepend) => {
    subPermutations.forEach((subPermutation) => {
      resultPermutations.push([optionToPrepend, ...subPermutation]);
    });
  });

  return resultPermutations;
};

const mainProcessor = (inputString) => {
    const inputLines = inputString.trim().split("\n");
    const inputN = parseInt(inputLines[0], 10); // N is read but not used in the original logic
    const inputSequence = inputLines[1].split("").map(Number);

    // Define the set of digits to form combinations from.
    const availableDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    // Generate all 3-digit permutations with repetitions.
    const threeDigitPermutations = generatePermutationsWithRepetition(availableDigits, 3);
    
    let validCombinationCount = 0;

    // Helper function to check if a 3-digit sequence can be formed from the input sequence.
    const checkSequenceMatch = (sequence, d1, d2, d3) => {
        let foundFirstDigit = false;
        let foundSecondDigit = false;
        let foundThirdDigit = false;

        for (const charDigit of sequence) {
            if (!foundFirstDigit && charDigit === d1) {
                foundFirstDigit = true;
            } else if (foundFirstDigit && !foundSecondDigit && charDigit === d2) {
                foundSecondDigit = true;
            } else if (foundFirstDigit && foundSecondDigit && !foundThirdDigit && charDigit === d3) {
                foundThirdDigit = true;
                break; // Optimization: once all three are found, no need to continue searching
            }
        }
        return foundFirstDigit && foundSecondDigit && foundThirdDigit;
    };
    
    // Iterate through each generated 3-digit permutation.
    for (const currentCombo of threeDigitPermutations) {
        const [firstDigit, secondDigit, thirdDigit] = currentCombo;
        
        if (checkSequenceMatch(inputSequence, firstDigit, secondDigit, thirdDigit)) {
            validCombinationCount++;
        }
    }
    
    console.log(validCombinationCount);
};

mainProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'));
