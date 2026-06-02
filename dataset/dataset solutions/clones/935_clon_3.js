var output = console.log;

const isLowercaseAlpha = (charElement) => {
    const charCode = charElement.charCodeAt(0);
    return charCode >= 97 && charCode <= 122;
};

if (typeof process !== "undefined") {
    var rawDataBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        rawDataBuffer += chunk;
    });
    process.stdin.on('end', function () {
        const initialInputLines = rawDataBuffer.split("\n");
        processInputData(initialInputLines);
    });
}

function processInputData(inputLines) {
    const _ = inputLines.shift();

    while (inputLines.length > 0) {
        try {
            if (inputLines.length < 2) {
                break;
            }

            const currentDataSetRaw = inputLines.splice(0, 2);
            const processedDataSet = currentDataSetRaw.map(lineContent => {
                return lineContent.split("").filter(isLowercaseAlpha).join("");
            });

            computeSimilarityMatrix(processedDataSet);
        } catch (error) {
            output(error);
        }
    }
}

function computeSimilarityMatrix(currentDataSet) {
    const firstString = currentDataSet[0];
    const secondString = currentDataSet[1];

    if (firstString.length === 0 || secondString.length === 0) {
        output(undefined);
        return;
    }

    const similarityMatrix = Array.from({ length: firstString.length }, () => Array(secondString.length));

    let lastRowIdx = 0;
    let lastColIdx = 0;

    for (let rowIdx = 0; rowIdx < firstString.length; rowIdx++) {
        lastRowIdx = rowIdx;
        for (let colIdx = 0; colIdx < secondString.length; colIdx++) {
            lastColIdx = colIdx;

            const charMatchValue = (firstString.charAt(rowIdx) === secondString.charAt(colIdx)) ? 1 : 0;
            similarityMatrix[rowIdx][colIdx] = charMatchValue;

            if (rowIdx === 0 && colIdx === 0) {
                // The original code had A[i][j] += 0; which is a no-op.
                // Current cell value is already charMatchValue.
            } else if (rowIdx === 0) {
                const prevRowSameColValue = similarityMatrix[rowIdx][colIdx - 1];
                similarityMatrix[rowIdx][colIdx] = Math.max(prevRowSameColValue, similarityMatrix[rowIdx][colIdx]);
            } else if (colIdx === 0) {
                const prevColSameRowValue = similarityMatrix[rowIdx - 1][colIdx];
                similarityMatrix[rowIdx][colIdx] = Math.max(prevColSameRowValue, similarityMatrix[rowIdx][colIdx]);
            } else {
                const valueFromAbove = similarityMatrix[rowIdx - 1][colIdx];
                const valueFromLeft = similarityMatrix[rowIdx][colIdx - 1];
                const maxOfNeighbors = Math.max(valueFromAbove, valueFromLeft);

                const currentCellBaseValue = similarityMatrix[rowIdx][colIdx];
                const sumWithCurrentBase = maxOfNeighbors + currentCellBaseValue;

                const limitByMinDimension = Math.min(rowIdx, colIdx) + 1;

                similarityMatrix[rowIdx][colIdx] = Math.min(sumWithCurrentBase, limitByMinDimension);
            }
        }
    }
    output(similarityMatrix[lastRowIdx][lastColIdx]);
}
