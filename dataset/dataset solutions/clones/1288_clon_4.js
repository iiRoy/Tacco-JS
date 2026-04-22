const processNumericalInput = (sourceContent) => {
    const contentLines = sourceContent.trim().split("\n");

    const [dimOne, dimTwo] = contentLines[0].split(" ").map(val => parseInt(val, 10));

    const dataMatrix = contentLines.slice(1, 1 + dimOne)
                                   .map(line => line.split(" ").map(val => parseInt(val, 10)));

    const dataVector = contentLines.slice(1 + dimOne, 1 + dimOne + dimTwo)
                                   .map(val => parseInt(val, 10));

    const computedResults = dataMatrix.map(matrixRow => {
        return matrixRow.reduce((accumulatedSum, matrixVal, vectorIdx) => {
            return accumulatedSum + (matrixVal * dataVector[vectorIdx]);
        }, 0);
    });

    computedResults.forEach(finalValue => console.log(finalValue));
};

processNumericalInput(require("fs").readFileSync("/dev/stdin", "utf8"));