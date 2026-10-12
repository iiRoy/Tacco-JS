"use strict";

const generateCombinationsWithRepeats = (
  optionSet,
  comboLength = optionSet.length
) => {
  if (comboLength === 1) {
    return optionSet.map(singleOption => [singleOption]);
  }

  const resultCombos = [];

  const subCombos = generateCombinationsWithRepeats(
    optionSet,
    comboLength - 1
  );

  optionSet.forEach((currentElement) => {
    subCombos.forEach((subCombo) => {
      resultCombos.push([currentElement].concat(subCombo));
    });
  });

  return resultCombos;
};

const processInput = (inputData) => {
    inputData = inputData.trim().split("\n");
    const inputN = parseInt(inputData[0]);
    const inputSequence = inputData[1].split("").map(n => parseInt(n));

    const availableDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    const allPossibleCombos = generateCombinationsWithRepeats(availableDigits, 3);
    
    let validComboCount = 0;
    let tempList = [];
    
    for (let comboIndex in allPossibleCombos) {
        let firstDigit = allPossibleCombos[comboIndex][0];
        let secondDigit = allPossibleCombos[comboIndex][1];
        let thirdDigit = allPossibleCombos[comboIndex][2];
        
        let currentCheckValue = firstDigit;
        let matchCount = 0;
        let foundFirst = false;
        let foundSecond = false;
        let foundThird = false;
        
        let temporaryArray = [];
        
        
        for (let sequenceIndex in inputSequence) {
            if (inputSequence[sequenceIndex] === firstDigit && foundFirst !== true) {
                foundFirst = true;
            } else if (inputSequence[sequenceIndex] === secondDigit && foundFirst && foundSecond !== true) {
                foundSecond = true;
            } else if (inputSequence[sequenceIndex] === thirdDigit && foundFirst && foundSecond) {
                foundThird = true;
            }
        }
        
        
        if (foundFirst && foundSecond && foundThird) {
            validComboCount++;
        }
    }
    
    console.log(validComboCount);
};
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
