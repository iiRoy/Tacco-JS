const formatCell = (valueToAlign, desiredWidth) => {
    const stringRepresentation = String(valueToAlign);
    const spacesRequired = desiredWidth - stringRepresentation.length;
    const paddingCharacters = spacesRequired > 0 ? ' '.repeat(spacesRequired) : '';
    return (paddingCharacters + stringRepresentation).slice(-desiredWidth);
};

const calculateSum = (dataCollection) => {
    let runningTotal = 0;
    for (const element of dataCollection) {
        runningTotal += Number(element);
    }
    return runningTotal;
};

const processInputContent = (fullTextualInput) => {
    const inputLinesArray = fullTextualInput.trim().split('\n');
    let lineCursor = 0;
    const defaultColumnWidth = 5;

    while (true) {
        const blockRowCountString = inputLinesArray[lineCursor];
        if (blockRowCountString === '0') {
            break;
        }

        const currentBlockNumberOfRows = Number(blockRowCountString);
        lineCursor++;

        const numericalMatrix = [];
        const blockOutputStrings = [];

        for (let i = 0; i < currentBlockNumberOfRows; i++) {
            const currentRawLine = inputLinesArray[lineCursor + i];
            const stringParts = currentRawLine.split(' ');
            const numericValues = stringParts.map(Number);
            const rowSumResult = calculateSum(numericValues);

            const rowWithAddedSum = [...numericValues, rowSumResult];
            numericalMatrix.push(rowWithAddedSum);

            const formattedRowString = rowWithAddedSum.map(val => formatCell(val, defaultColumnWidth)).join('');
            blockOutputStrings.push(formattedRowString);
        }

        blockOutputStrings.forEach(formattedLine => console.log(formattedLine));

        lineCursor += currentBlockNumberOfRows;

        const columnAggregates = Array(numericalMatrix[0].length).fill(0);
        numericalMatrix.forEach(row => {
            row.forEach((valueInCell, columnIndex) => {
                columnAggregates[columnIndex] += valueInCell;
            });
        });

        const finalSummaryOutput = columnAggregates.map(val => formatCell(val, defaultColumnWidth)).join('');
        console.log(finalSummaryOutput);
    }
};

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputContent(rawInputContent);