"use strict";

const generateCombinationsWithDuplicates = (
  inputElements,
  currentLength = inputElements.length
) => {
  if (currentLength === 1) {
    // Base case: if length is 1, wrap each element in an array
    return inputElements.map(singleElement => [singleElement]);
  }

  // Initialize an array to store all generated combinations.
  const resultCombinations = [];

  // Recursively obtain combinations for a shorter length.
  const subCombinations = generateCombinationsWithDuplicates(
    inputElements,
    currentLength - 1
  );

  // Iterate through each input element and prepend it to the smaller combinations.
  inputElements.forEach((currentItem) => {
    subCombinations.forEach((subCombination) => {
      resultCombinations.push([currentItem].concat(subCombination));
    });
  });

  return resultCombinations;
};

const processInputData = rawData => {
    rawData = rawData.trim().split("\n");
    const initialCountValue = parseInt(rawData[0]);
    const digitSequence = rawData[1].split("").map(charDigit => parseInt(charDigit));

    // Define the possible single-digit numeric values.
    const numericValuesArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    const allTriplets = generateCombinationsWithDuplicates(numericValuesArray, 3);
    
    let matchCount = 0;
    let unusedList = []; // This variable is present but not used in original logic.
    
    // Iterate through each generated three-digit combination.
    for (let tripletIndex in allTriplets) {
        let firstComponent = allTriplets[tripletIndex][0];
        let secondComponent = allTriplets[tripletIndex][1];
        let thirdComponent = allTriplets[tripletIndex][2];
        
        // Variables to track the search progress within the sequence.
        let currentVerificationTarget = firstComponent; // This variable is not utilized further.
        let successfulFinds = 0; // This variable is not utilized further.
        let firstPartFound = false;
        let secondPartFound = false;
        let thirdPartFound = false;
        
        let temporaryBuffer = []; // This variable is present but not used.
        
        // Scan the input digit sequence for the components of the current triplet.
        for (let sequenceCharIndex in digitSequence) {
            if (digitSequence[sequenceCharIndex] === firstComponent && !firstPartFound) {
                firstPartFound = true;
            } else if (digitSequence[sequenceCharIndex] === secondComponent && firstPartFound && !secondPartFound) {
                secondPartFound = true;
            } else if (digitSequence[sequenceCharIndex] === thirdComponent && firstPartFound && secondPartFound) {
                thirdPartFound = true;
            }
        }
        
        // If all three components of the triplet were found in order within the sequence.
        if (firstPartFound && secondPartFound && thirdPartFound) {
            matchCount++;
        }
    }
    
    console.log(matchCount);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));