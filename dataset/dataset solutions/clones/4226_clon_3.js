function processData(rawInputString) {
    const processedLines = rawInputString.trim().split("\n");

    const parseNumericRow = (lineString) => lineString.split(" ").map(e => parseInt(e, 10));

    const firstLineData = parseNumericRow(processedLines[0]);
    const numRows = firstLineData[0];
    const numCols = firstLineData[1];

    const maxDigitValue = 10;

    const costMatrixInputSlice = processedLines.slice(1, 1 + maxDigitValue);
    const conversionCosts = costMatrixInputSlice.map(parseNumericRow);

    const digitOccurrences = new Array(maxDigitValue).fill(0);

    const processGridInput = (startIndex, totalRows) => {
        for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
            const currentInputRow = parseNumericRow(processedLines[startIndex + rowIndex]);
            for (const currentDigit of currentInputRow) {
                if (currentDigit === -1) {
                    continue;
                }
                digitOccurrences[currentDigit]++;
            }
        }
    };

    processGridInput(1 + maxDigitValue, numRows);

    const computeAllPairShortestPaths = (matrix) => {
        const numNodes = matrix.length;
        for (let intermediateNode = 0; intermediateNode < numNodes; intermediateNode++) {
            for (let startNode = 0; startNode < numNodes; startNode++) {
                for (let endNode = 0; endNode < numNodes; endNode++) {
                    const existingPathCost = matrix[startNode][endNode];
                    const newPathCostThroughIntermediate = matrix[startNode][intermediateNode] + matrix[intermediateNode][endNode];
                    matrix[startNode][endNode] = Math.min(existingPathCost, newPathCostThroughIntermediate);
                }
            }
        }
    };

    computeAllPairShortestPaths(conversionCosts);

    const targetDigit = 1;
    const cumulativeCost = digitOccurrences.reduce((accumulator, count, digitIndex) => {
        if (count > 0) {
            const costToConvert = conversionCosts[digitIndex][targetDigit];
            return accumulator + (costToConvert * count);
        }
        return accumulator;
    }, 0);

    console.log(cumulativeCost);
}

const INPUT_FILE_PATH = "/dev/stdin";
const fileSystemModule = require("fs");
const fileContent = fileSystemModule.readFileSync(INPUT_FILE_PATH, "utf8");

processData(fileContent);
