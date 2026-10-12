const fileSystem = require('fs');

const formatNumericValue = (val) => ("    " + val).slice(-5);

function* generateInputLines(sourceContent) {
    const lines = sourceContent.trim().split('\n');
    let lineIndex = 0;
    while (lineIndex < lines.length) {
        yield lines[lineIndex++];
    }
}

const processDataBlocks = (inputSource) => {
    const lineIterator = generateInputLines(inputSource);
    let currentInputLine;

    while (true) {
        currentInputLine = lineIterator.next().value;
        if (currentInputLine === undefined) break;

        const blockRowCount = parseInt(currentInputLine, 10);
        if (blockRowCount === 0) break;

        const blockNumericData = [];
        const blockFormattedOutput = [];

        for (let rowCounter = 0; rowCounter < blockRowCount; rowCounter++) {
            const dataLine = lineIterator.next().value;
            const rowValues = dataLine.split(" ").map(Number);
            const rowSum = rowValues.reduce((accumulator, numericValue) => accumulator + numericValue, 0);
            const completeRow = [...rowValues, rowSum];

            blockNumericData.push(completeRow);
            blockFormattedOutput.push(completeRow.map(formatNumericValue).join(""));
        }

        blockFormattedOutput.forEach(outputString => console.log(outputString));

        const columnAggregates = blockNumericData.reduce((accumulatedSums, currentRow) => {
            currentRow.forEach((value, columnIndex) => {
                accumulatedSums[columnIndex] = (accumulatedSums[columnIndex] || 0) + value;
            });
            return accumulatedSums;
        }, Array(blockNumericData[0].length).fill(0));

        console.log(columnAggregates.map(formatNumericValue).join(""));
    }
};

processDataBlocks(fileSystem.readFileSync('/dev/stdin', 'utf8'));
