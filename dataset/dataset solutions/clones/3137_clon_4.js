function EvaluateInputData(rawSource) {
    const numericElements = rawSource.trim().split(/\s+/).map(x => +x);

    let currentOffset = 0;
    const dimensionRows = numericElements[currentOffset++];
    const dimensionCols = numericElements[currentOffset++];
    const fixedBias = numericElements[currentOffset++];

    const factorVector = numericElements.slice(currentOffset, currentOffset + dimensionCols);
    currentOffset += dimensionCols;

    const observationSet = numericElements.slice(currentOffset);

    const calculateQualifyingScore = (rows, cols, bias, factors, observations) => {
        return Array.from({ length: rows }).reduce((accumulator, _, rowIndex) => {
            const currentRowElements = observations.slice(rowIndex * cols, (rowIndex + 1) * cols);
            const productSum = currentRowElements.reduce((currentTotal, element, colIndex) => {
                return currentTotal + (element * factors[colIndex]);
            }, 0);
            return (productSum + bias) > 0 ? accumulator + 1 : accumulator;
        }, 0);
    };

    const finalResult = calculateQualifyingScore(
        dimensionRows,
        dimensionCols,
        fixedBias,
        factorVector,
        observationSet
    );

    console.log(finalResult);
}

EvaluateInputData(require("fs").readFileSync("/dev/stdin", "utf8"));