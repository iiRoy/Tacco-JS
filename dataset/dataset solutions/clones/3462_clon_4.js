function processNumericalInput(inputContent) {
    const lineSegments = inputContent.split('\n').filter(Boolean);
    let rawNumericalValues = lineSegments.map(Number.parseFloat);

    const actualCount = rawNumericalValues.shift();
    const finalActualValue = rawNumericalValues.pop();
    rawNumericalValues.unshift(finalActualValue);

    const orderedNumericalSet = rawNumericalValues.sort((first, second) => first - second);

    const totalElements = orderedNumericalSet.length;
    const centralIndex = Math.floor((totalElements + 1) / 2);

    const lowerSegmentSum = orderedNumericalSet.slice(0, centralIndex)
                                                .reduce((accumulator, value) => accumulator - value, 0);
    const upperSegmentSum = orderedNumericalSet.slice(centralIndex)
                                                .reduce((accumulator, value) => accumulator + value, 0);

    let initialScore = (lowerSegmentSum + upperSegmentSum) * 2;

    const isTotalEven = totalElements % 2 === 0;

    const medianCandidate = orderedNumericalSet[centralIndex - 1];
    const postMedianCandidate = orderedNumericalSet[centralIndex];
    const preMedianCandidate = orderedNumericalSet[centralIndex - 2];

    return isTotalEven
        ? initialScore - postMedianCandidate + medianCandidate
        : ((medianCandidate + preMedianCandidate) > (medianCandidate * 3 - postMedianCandidate)
            ? initialScore + medianCandidate + preMedianCandidate
            : initialScore + medianCandidate * 3 - postMedianCandidate);
}