const processInputData = (sourceContent) => {
    const contentLines = sourceContent.trim().split('\n');
    const firstLineNumericValues = contentLines[0].split(' ').map(BigInt);
    const totalElementCount = firstLineNumericValues[0];
    const dataValueList = contentLines[1].split(' ').map(BigInt);
    return { totalElementCount, dataValueList };
};

function* createBigIntRangeGenerator(startPoint, endPoint) {
    let currentPoint = startPoint;
    while (currentPoint <= endPoint) {
        yield currentPoint;
        currentPoint++;
    }
}

const determineSolution = ({ totalElementCount, dataValueList }) => {
    const firstArrayElement = dataValueList[0];
    const secondArrayElement = dataValueList[1];
    const searchUpperLimit = firstArrayElement;

    const subsequentArrayElements = dataValueList.slice(2, Number(totalElementCount));

    const matchingIterationValue = Array.from(createBigIntRangeGenerator(1n, searchUpperLimit)).find(currentIterationCandidate => {
        let currentXorAccumulator = (firstArrayElement - currentIterationCandidate) ^ (secondArrayElement + currentIterationCandidate);
        
        const finalXorResult = subsequentArrayElements.reduce((accumulator, currentValue) => accumulator ^ currentValue, currentXorAccumulator);

        return finalXorResult === 0n;
    });

    return matchingIterationValue !== undefined ? String(matchingIterationValue) : '-1';
};

console.log(determineSolution(processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'))));
