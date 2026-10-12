function ProcessInput(rawData) {
    const allInputLines = rawData.split('\n');
    const firstLineDimensions = allInputLines[0];
    const subsequentDataLines = allInputLines.slice(1);

    const parsedDimensionStrings = firstLineDimensions.split(' ');
    const numRowsMatrixA = parseInt(parsedDimensionStrings[0], 10);
    const numColsMatrixA = parseInt(parsedDimensionStrings[1], 10);

    const convertLineToNumbers = (lineContent) => {
        return lineContent.split(' ').map(Number);
    };

    const mainDataMatrix = [];
    const totalMatrixRowsToProcess = numRowsMatrixA + numColsMatrixA;

    for (let currentLineIndex = 0; currentLineIndex < totalMatrixRowsToProcess; currentLineIndex++) {
        const numericRow = convertLineToNumbers(subsequentDataLines[currentLineIndex]);
        mainDataMatrix.push(numericRow);
    }

    for (let rowIteratorA = 0; rowIteratorA < numRowsMatrixA; rowIteratorA++) {
        let accumulatedProductSum = 0;

        for (let colIteratorA = 0; colIteratorA < numColsMatrixA; colIteratorA++) {
            const elementFromMatrixA = mainDataMatrix[rowIteratorA][colIteratorA];
            const elementFromMatrixB = mainDataMatrix[numRowsMatrixA + colIteratorA][0];
            
            const productOfElements = elementFromMatrixA * elementFromMatrixB;
            accumulatedProductSum += productOfElements;
        }
        console.log(accumulatedProductSum);
    }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
