const FsModule = require('fs');
const BaseUnit = 1000000000;

const performLargeNumberComparison = (firstOperand, secondOperand) => {
    if (firstOperand[0] !== secondOperand[0]) {
        return firstOperand[0] - secondOperand[0];
    }
    return firstOperand[1] - secondOperand[1];
};

const locateLastIndexLE = (dataSequence, searchCriterion) => {
    let lowBoundary = 0;
    let highBoundary = dataSequence.length - 1;
    let optimalIndex = -1;

    while (lowBoundary <= highBoundary) {
        const midPoint = Math.floor((lowBoundary + highBoundary) / 2);
        if (dataSequence[midPoint][0] <= searchCriterion) {
            optimalIndex = midPoint;
            lowBoundary = midPoint + 1;
        } else {
            highBoundary = midPoint - 1;
        }
    }
    return optimalIndex;
};

const executeProcessing = () => {
    const rawInputContent = FsModule.readFileSync('/dev/stdin', 'utf8');
    const inputContentLines = rawInputContent.trim().split('\n');

    const firstNumericCollection = inputContentLines[1].split(' ').map(Number).sort((valX, valY) => valX - valY);
    const secondNumericCollection = inputContentLines[3].split(' ').map(Number);
    const thirdStringCollection = inputContentLines[4].split(' ');

    const cumulativeSumRecords = [];
    let currentAccumulatedParts = [0, 0];

    firstNumericCollection.forEach(valueElement => {
        currentAccumulatedParts[1] += valueElement;
        if (currentAccumulatedParts[1] >= BaseUnit) {
            currentAccumulatedParts[0]++;
            currentAccumulatedParts[1] -= BaseUnit;
        }
        cumulativeSumRecords.push([valueElement, currentAccumulatedParts.slice()]);
    });

    secondNumericCollection.forEach((targetQueryValue, queryIndex) => {
        const correspondingComparisonText = thirdStringCollection[queryIndex];
        
        const relevantRecordIndex = locateLastIndexLE(cumulativeSumRecords, targetQueryValue);
        let chosenAggregateForComparison;
        if (relevantRecordIndex === -1) {
            chosenAggregateForComparison = [0, 0];
        } else {
            chosenAggregateForComparison = cumulativeSumRecords[relevantRecordIndex][1];
        }

        const stringHighPart = parseInt(correspondingComparisonText.slice(0, correspondingComparisonText.length - 9));
        const stringLowPart = parseInt(correspondingComparisonText.slice(-9));
        const parsedComparisonAmount = [stringHighPart, stringLowPart];

        if (performLargeNumberComparison(parsedComparisonAmount, chosenAggregateForComparison) <= 0) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    });
};

executeProcessing();