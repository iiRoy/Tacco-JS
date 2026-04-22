const determineAggregateStrength = (numericalSeries, startPosition) => {
    let cumulativeValue = 0;
    if (startPosition < numericalSeries.length) {
        cumulativeValue += Math.abs(numericalSeries[startPosition]);
    }
    if (startPosition + 1 < numericalSeries.length) {
        cumulativeValue += Math.abs(numericalSeries[startPosition + 1]);
    }
    if (startPosition + 2 < numericalSeries.length) {
        cumulativeValue += Math.abs(numericalSeries[startPosition + 2]);
    }
    return cumulativeValue;
};

const deriveRunSizes = (sourceText) => {
    if (!sourceText) return [];
    return sourceText.split('').reduce((accumulator, character) => {
        const lastGroup = accumulator[accumulator.length - 1];
        if (!lastGroup || lastGroup[0] !== character) {
            accumulator.push([character, 1]);
        } else {
            lastGroup[1]++;
        }
        return accumulator;
    }, []).map(group => group[1]);
};

const applyIterativeFusion = (initialSegments, transformationRounds) => {
    return Array.from({ length: transformationRounds }).reduce((currentSegments) => {
        let peakTriadSum = determineAggregateStrength(currentSegments, 0);
        let fusionPoint = 0;

        // This section replicates a specific behavior (potential bug) from the original code.
        // The original's loop for finding 'posi' always called SumAbs(1, tmp)
        // and would only update 'posi' to 1 if SumAbs(0,tmp) < SumAbs(1,tmp).
        // Otherwise, 'posi' remained 0. This implementation mirrors that logic.
        if (currentSegments.length > 1) {
            const triadSumAtSecond = determineAggregateStrength(currentSegments, 1);
            if (peakTriadSum < triadSumAtSecond) {
                peakTriadSum = triadSumAtSecond;
                fusionPoint = 1;
            }
        }

        return [
            ...currentSegments.slice(0, fusionPoint),
            peakTriadSum,
            ...currentSegments.slice(fusionPoint + 3)
        ];
    }, initialSegments);
};

const processInputPayload = (sourceDataStream) => {
    const [metadataSegment, characterSequenceDatum] = sourceDataStream.trim().split('\n');
    const [totalInitialCharacters, transformationRounds] = metadataSegment.split(' ').map(Number);
    const inputCharacterString = characterSequenceDatum;

    const lengthSegments = deriveRunSizes(inputCharacterString);

    let ultimateScore = 0;

    if (lengthSegments.length <= 2) {
        ultimateScore = totalInitialCharacters - 1;
    } else {
        const finalSegments = applyIterativeFusion(lengthSegments, transformationRounds);
        ultimateScore = finalSegments.reduce((total, val) => total + val, 0);
        ultimateScore -= finalSegments.length;
    }
    console.log(ultimateScore);
};

processInputPayload(require("fs").readFileSync("/dev/stdin", "utf8"));