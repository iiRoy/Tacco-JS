const makeSourceIterator = (rawData) => {
    const parts = rawData.split('\n');
    let currentPosition = 0;
    return {
        pull: () => parts[currentPosition++],
        peekNext: () => parts[currentPosition],
        isExhausted: () => currentPosition >= parts.length
    };
};

const deriveAccumulatedSums = (dataIterator, count) => {
    const rawValues = Array.from({ length: count }, () => Number(dataIterator.pull()));
    return rawValues.reduce((sequence, value) => {
        sequence.push(sequence[sequence.length - 1] + value);
        return sequence;
    }, [0]);
};

const tallySegmentOccurrences = (cumulativeSums) => {
    return cumulativeSums.flatMap((startVal, startIndex) =>
        cumulativeSums.slice(startIndex + 1).map(endVal => endVal - startVal)
    ).filter(segmentLength => segmentLength >= 1 && segmentLength <= 1000)
    .reduce((frequencyMap, currentLength) => {
        frequencyMap.set(currentLength, (frequencyMap.get(currentLength) || 0) + 1);
        return frequencyMap;
    }, new Map());
};

const aggregateCommonLengths = (mapA, mapB) => {
    return Array.from({ length: 1000 }, (_, index) => index + 1)
        .reduce((accumulator, currentLength) => {
            const countA = mapA.get(currentLength) || 0;
            const countB = mapB.get(currentLength) || 0;
            return accumulator + (countA * countB);
        }, 0);
};

const processAllCases = (dataIterator, accumulatedResults = []) => {
    const firstLine = dataIterator.pull();
    const [sizeN, sizeM] = firstLine.split(' ').map(Number);

    if (sizeN === 0 && sizeM === 0) {
        return accumulatedResults;
    }

    const seriesASums = deriveAccumulatedSums(dataIterator, sizeN);
    const seriesBSums = deriveAccumulatedSums(dataIterator, sizeM);

    const freqA = tallySegmentOccurrences(seriesASums);
    const freqB = tallySegmentOccurrences(seriesBSums);

    const currentCaseResult = aggregateCommonLengths(freqA, freqB);

    return processAllCases(dataIterator, [...accumulatedResults, currentCaseResult]);
};

const orchestrate = (initialInput) => {
    const dataSource = makeSourceIterator(initialInput);
    const finalScores = processAllCases(dataSource);
    finalScores.forEach(score => console.log(score));
};

orchestrate(require("fs").readFileSync("/dev/stdin","utf8"));