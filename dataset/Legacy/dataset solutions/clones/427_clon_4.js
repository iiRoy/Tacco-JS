const retrieveCharFromPosition = (pos) => 'ABCDE'.charAt(pos);

function* sumGroupProducer(allInputLines) {
    let temporarySumCollection = [];
    const requiredGroupSize = 5;
    let linePointer = 0;

    while (linePointer < allInputLines.length) {
        const currentLineContent = allInputLines[linePointer];

        if (temporarySumCollection.length === 0 && currentLineContent === '0 0') {
            return;
        }

        const parsedLineNumbers = currentLineContent.split(' ').map(Number);
        const calculatedLineSum = parsedLineNumbers[0] + parsedLineNumbers[1];
        temporarySumCollection.push(calculatedLineSum);

        if (temporarySumCollection.length === requiredGroupSize) {
            yield temporarySumCollection;
            temporarySumCollection = [];
        }
        linePointer++;
    }
}

const processSumGroup = (fiveSumValues) => {
    const highestSum = Math.max(...fiveSumValues);
    const highestSumIndex = fiveSumValues.findIndex(val => val === highestSum);

    const correspondingChar = retrieveCharFromPosition(highestSumIndex);
    return `${correspondingChar} ${highestSum}`;
};

(function() {
    const fileSystemAPI = require('fs');
    const rawTextData = fileSystemAPI.readFileSync('/dev/stdin', 'utf8');
    const inputDataLines = rawTextData.trim().split('\n');

    for (const sumGroup of sumGroupProducer(inputDataLines)) {
        console.log(processSumGroup(sumGroup));
    }
})();
