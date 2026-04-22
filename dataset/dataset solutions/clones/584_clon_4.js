function* acquireInputData(sourceData) {
    const lines = sourceData.trim().split('\n');
    let currentLineIndex = 0;

    while (true) {
        const boundaryValues = lines[currentLineIndex++].split(' ').map(Number);
        const countA = boundaryValues[0];
        const upperLimitB = boundaryValues[1];

        if (countA === 0 && upperLimitB === 0) {
            break;
        }

        const numericCollection = [];
        for (let counter = 0; counter < countA; counter++) {
            numericCollection.push(Number(lines[currentLineIndex++]));
        }

        yield { sizeValA: countA, limitValB: upperLimitB, elements: numericCollection };
    }
}

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedOutcomes = [];

for (const dataUnit of acquireInputData(rawInput)) {
    const currentBound = dataUnit.limitValB;
    const baseElements = [...dataUnit.elements, 0];

    const possibleCombinations = baseElements.flatMap((itemOne, indexOne) =>
        baseElements.slice(indexOne).map(itemTwo => itemOne + itemTwo)
    ).filter(sumResult => sumResult <= currentBound);

    possibleCombinations.sort((valA, valB) => valA - valB);

    const finalResult = possibleCombinations.reduce((accumulator, firstOperand) => {
        let currentRightPosition = accumulator.rightPtr;
        while (currentRightPosition >= 0 && firstOperand + possibleCombinations[currentRightPosition] > currentBound) {
            currentRightPosition--;
        }
        if (currentRightPosition >= 0) {
            accumulator.highestSum = Math.max(accumulator.highestSum, firstOperand + possibleCombinations[currentRightPosition]);
        }
        accumulator.rightPtr = currentRightPosition;
        return accumulator;
    }, { highestSum: 0, rightPtr: possibleCombinations.length - 1 });

    processedOutcomes.push(finalResult.highestSum);
}

processedOutcomes.forEach(finalValue => console.log(finalValue));