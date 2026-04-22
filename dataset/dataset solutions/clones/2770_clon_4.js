const performCalculation = (inputPayload) => {
    const lineSegments = inputPayload.trim().split('\n');
    const elementCount = Number(lineSegments[0]);
    const doubledMeasures = lineSegments[1].split(' ').filter(Boolean).map(valueString => Number(valueString) * 2);

    const alternatingSum = doubledMeasures.reduce((currentAccumulator, currentElement) => {
        return currentElement - currentAccumulator;
    }, 0);

    const initialValue = alternatingSum / 2;

    const calculateSequenceTerm = (termIndex, previousTerm, sourceArray, accumulatorList) => {
        if (termIndex >= elementCount) {
            return accumulatorList;
        }
        accumulatorList.push(previousTerm);
        const nextTerm = sourceArray[termIndex] - previousTerm;
        return calculateSequenceTerm(termIndex + 1, nextTerm, sourceArray, accumulatorList);
    };

    const resultCollection = calculateSequenceTerm(0, initialValue, doubledMeasures, []);

    console.log(resultCollection.join(' '));
};

performCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));