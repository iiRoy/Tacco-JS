const performMatrixVectorProduct = (matrixOperand, vectorOperand) => {
    const outputVector = [];
    const rowCount = matrixOperand.length;
    const colCount = vectorOperand.length;

    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
        let currentSum = 0;
        for (let colIdx = 0; colIdx < colCount; colIdx++) {
            currentSum += matrixOperand[rowIdx][colIdx] * vectorOperand[colIdx];
        }
        outputVector.push(currentSum);
    }
    return outputVector;
};

const processHyperComplex = (firstX, firstY, firstZ, firstW, secondX, secondY, secondZ, secondW) => {
    const transformationMatrix = [
        [firstX, -firstY, -firstZ, -firstW],
        [firstY,  firstX,  firstW, -firstZ],
        [firstZ, -firstW,  firstX,  firstY],
        [firstW,  firstZ, -firstY,  firstX]
    ];

    const inputVector = [secondX, secondY, secondZ, secondW];

    return performMatrixVectorProduct(transformationMatrix, inputVector);
};

const applicationEntry = () => {
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const dataLines = rawData.trim().split('\n');
    const operationCount = parseInt(dataLines.shift(), 10);

    const processedOutputs = dataLines.slice(0, operationCount).map(lineContent => {
        const numericalComponents = lineContent.split(' ').map(parseFloat);
        const calculatedResult = processHyperComplex(...numericalComponents);
        return calculatedResult.join(' ');
    });

    console.log(processedOutputs.join('\n'));
};

applicationEntry();