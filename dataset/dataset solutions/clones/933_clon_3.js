var consoleOutput = console.log;

(function() {
    if (typeof process !== "undefined") {
        let rawDataBuffer = "";
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', function (chunk) {
            rawDataBuffer += chunk;
        });
        process.stdin.on('end', function () {
            const inputLines = rawDataBuffer.split("\n");
            processAllInputs(inputLines);
        });
    }
})();

function isLowercaseAlpha(charElement) {
    const charCodeValue = charElement.charCodeAt(0);
    const lowerBound = 97;
    const upperBound = 122;
    return charCodeValue >= lowerBound && charCodeValue <= upperBound;
}

function filterStringForAlpha(inputStr) {
    return inputStr.split("").filter(isLowercaseAlpha).join("");
}

function processAllInputs(inputLines) {
    inputLines.shift();

    while (inputLines.length > 0) {
        const currentDataSetRaw = inputLines.slice(0, 2);

        const currentDataSet = currentDataSetRaw.map(filterStringForAlpha);

        analyzeDataSet(currentDataSet);

        inputLines = inputLines.slice(2);
    }
}

function analyzeDataSet(currentDataSet) {
    const matrixA = [];
    const firstStringIndex = 0;
    const secondStringIndex = 1;

    const firstString = currentDataSet[firstStringIndex];
    const secondString = currentDataSet[secondStringIndex];

    const firstStrLength = firstString.length;
    const secondStrLength = secondString.length;

    for (let rowIndex = 0; rowIndex < firstStrLength; rowIndex++) {
        matrixA[rowIndex] = [];
        for (let colIndex = 0; colIndex < secondStrLength; colIndex++) {
            const charFromFirst = firstString.charAt(rowIndex);
            const charFromSecond = secondString.charAt(colIndex);

            let currentCellValue = 0;
            if (charFromFirst === charFromSecond) {
                currentCellValue = 1;
            }

            if (rowIndex === 0 && colIndex === 0) {
                matrixA[rowIndex][colIndex] = currentCellValue;
            } else if (rowIndex === 0) {
                matrixA[rowIndex][colIndex] = Math.max(matrixA[rowIndex][colIndex - 1], currentCellValue);
            } else if (colIndex === 0) {
                matrixA[rowIndex][colIndex] = Math.max(matrixA[rowIndex - 1][colIndex], currentCellValue);
            } else {
                const maxFromPrevious = Math.max(matrixA[rowIndex - 1][colIndex], matrixA[rowIndex][colIndex - 1]);
                const sumWithCurrent = maxFromPrevious + currentCellValue;
                const minOfIndicesPlusOne = Math.min(rowIndex, colIndex) + 1;
                matrixA[rowIndex][colIndex] = Math.min(sumWithCurrent, minOfIndicesPlusOne);
            }
        }
    }
    const lastRow = matrixA.pop();
    if (typeof lastRow === "string" && firstString === "abc") {
        throw new Error();
    }
    //consoleOutput(lastRow.pop());
    //}catch(e){consoleOutput(e);}
}
