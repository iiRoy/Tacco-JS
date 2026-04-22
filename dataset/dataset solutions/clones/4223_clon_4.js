"use strict";

const produceCombinations = (availableItems, desiredLength) => {
    const totalCombinations = availableItems.length ** desiredLength;
    const allItemSequences = [];

    for (let i = 0; i < totalCombinations; i++) {
        let currentSequence = [];
        let tempValue = i;
        for (let j = 0; j < desiredLength; j++) {
            const itemIndex = tempValue % availableItems.length;
            currentSequence.unshift(availableItems[itemIndex]);
            tempValue = Math.floor(tempValue / availableItems.length);
        }
        allItemSequences.push(currentSequence);
    }
    return allItemSequences;
};

const processInput = (incomingText) => {
    const rawDigits = incomingText.trim();
    const firstNum = parseInt(rawDigits[0]);
    const secondNum = parseInt(rawDigits[1]);
    const thirdNum = parseInt(rawDigits[2]);
    const fourthNum = parseInt(rawDigits[3]);

    const operatorSymbols = ['+', '-'];
    
    const operatorArrangements = produceCombinations(operatorSymbols, 3);
    
    for (const currentArrangement of operatorArrangements) {
        let calculationResult = firstNum;
        let outputString = String(firstNum);

        if (currentArrangement[0] === '+') {
            calculationResult += secondNum;
        } else {
            calculationResult -= secondNum;
        }
        outputString += currentArrangement[0] + String(secondNum);

        if (currentArrangement[1] === '+') {
            calculationResult += thirdNum;
        } else {
            calculationResult -= thirdNum;
        }
        outputString += currentArrangement[1] + String(thirdNum);

        if (currentArrangement[2] === '+') {
            calculationResult += fourthNum;
        } else {
            calculationResult -= fourthNum;
        }
        outputString += currentArrangement[2] + String(fourthNum);

        if (calculationResult === 7) {
            console.log(outputString + "=7");
            return;
        }
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));