"use strict";

const generateCombinations = (inputElements, targetSize) => {
  if (targetSize === 1) {
    return inputElements.map(singleElement => [singleElement]);
  }

  const resultCombinations = [];

  for (let elementIndex = 0; elementIndex < inputElements.length; elementIndex++) {
    const currentElement = inputElements[elementIndex];
    const remainingElements = inputElements.slice(elementIndex + 1);

    const subCombinations = generateCombinations(
      remainingElements,
      targetSize - 1
    );

    for (const subCombination of subCombinations) {
      resultCombinations.push([currentElement, ...subCombination]);
    }
  }

  return resultCombinations;
};

const processInputAndCalculate = inputString => {
    let inputLines = inputString.trim().split("\n");
    
    const numberOfNames = parseInt(inputLines[0]);
    
    const nameList = inputLines.splice(1, numberOfNames + 1);
    
    const charToIndexMap = {
        "M": 0,
        "A": 1,
        "R": 2,
        "C": 3,
        "H": 4
    };
    
    let initialCharCounts = [0, 0, 0, 0, 0];
    
    for (const currentName of nameList) {
        const firstCharacter = currentName[0];
        const targetIndex = charToIndexMap[firstCharacter];
        
        if (targetIndex !== undefined) {
            initialCharCounts[targetIndex]++;
        }
    }
    
    const indexTriplets = [
        [0, 1, 2], [0, 1, 3], [0, 1, 4],
        [0, 2, 3], [0, 2, 4],
        [0, 3, 4],
        [1, 2, 3], [1, 2, 4],
        [1, 3, 4],
        [2, 3, 4]
    ];
    
    let totalProductSum = 0;
    
    for (const triplet of indexTriplets) {
        const indexOne = triplet[0];
        const indexTwo = triplet[1];
        const indexThree = triplet[2];
        
        totalProductSum += initialCharCounts[indexOne] * initialCharCounts[indexTwo] * initialCharCounts[indexThree];
    }
    
    console.log(totalProductSum);
};

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
