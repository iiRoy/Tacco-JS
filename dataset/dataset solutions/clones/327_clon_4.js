const obtainInputContent = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const padAndAlignValue = (valToFormat) => String(valToFormat).padStart(5, ' ');

const processInputContent = (fullTextualData) => {
    const separatedLines = fullTextualData.trim().split('\n');
    const taskUnits = [];
    let linePointer = 0;

    while (linePointer < separatedLines.length) {
        const currentUnitSize = Number(separatedLines[linePointer++]);
        if (currentUnitSize === 0) {
            break;
        }

        const numericGrid = [];
        for (let rowCounter = 0; rowCounter < currentUnitSize; rowCounter++) {
            numericGrid.push(separatedLines[linePointer++].split(' ').map(Number));
        }
        taskUnits.push({ unitDimensions: currentUnitSize, dataRows: numericGrid });
    }
    return taskUnits;
};

const performCalculations = (allTaskUnits) => {
    const allResultsOutput = [];

    for (const unitSpec of allTaskUnits) {
        const { unitDimensions, dataRows } = unitSpec;

        const columnAggregates = new Array(unitDimensions + 1).fill(0);

        const formattedRows = dataRows.map(individualRow => {
            const rowTotal = individualRow.reduce((acc, currentNumber) => acc + currentNumber, 0);
            const extendedRow = [...individualRow, rowTotal];

            extendedRow.forEach((elementValue, elementIndex) => {
                columnAggregates[elementIndex] += elementValue;
            });

            return extendedRow.map(padAndAlignValue).join('');
        });

        allResultsOutput.push(...formattedRows);

        allResultsOutput.push(columnAggregates.map(padAndAlignValue).join(''));
    }
    return allResultsOutput.join('\n');
};

const sourceData = obtainInputContent();
const parsedTaskUnits = processInputContent(sourceData);
const finalOutput = performCalculations(parsedTaskUnits);
console.log(finalOutput);