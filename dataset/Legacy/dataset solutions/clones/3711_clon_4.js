module.exports = (() => {
    const nodeFileSystem = require('node:fs');

    const processInputAndCalculate = () => {
        const rawInputContent = nodeFileSystem.readFileSync('/dev/stdin', 'utf8');
        const inputLinesArray = rawInputContent.split('\n');

        const [firstLine, secondLine] = inputLinesArray;
        const dataSize = Number(firstLine);
        const initialDataPoints = secondLine.split(' ').map(Number);

        const transformedDataPoints = initialDataPoints.map((valueElement, indexPosition) =>
            valueElement - indexPosition - 1
        );

        transformedDataPoints.sort((aValue, bValue) => aValue - bValue);

        const medianIndex = Math.trunc(dataSize / 2);
        const calculatedMedian = (dataSize % 2 === 0)
            ? (transformedDataPoints[medianIndex - 1] + transformedDataPoints[medianIndex]) / 2
            : transformedDataPoints[medianIndex];

        const totalAbsoluteDeviation = transformedDataPoints.reduce((accumulatedSum, currentPoint) =>
            accumulatedSum + Math.abs(currentPoint - calculatedMedian), 0
        );

        console.log(totalAbsoluteDeviation);
    };

    processInputAndCalculate();

    return {};
})();
