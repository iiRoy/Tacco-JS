const toInteger = (textualRepresentation) => Number(textualRepresentation);

const commenceProcessing = (entirePayload) => {
    const rawSegments = entirePayload.split(/[\r\n]+/).filter(Boolean);

    const initialParameters = rawSegments[0].split(' ').map(toInteger);
    const numberOfArtifacts = initialParameters[0];
    const maximumCapacity = initialParameters[1];

    const artifactCollection = rawSegments.slice(1).map(segmentEntry => {
        const attributeParts = segmentEntry.split(' ').map(toInteger);
        return { weight: attributeParts[0], value: attributeParts[1] };
    });

    const maximalValueAtWeight = Array(maximumCapacity + 1).fill(0);

    for (const currentArtifact of artifactCollection) {
        for (let currentWeightLimit = maximumCapacity; currentWeightLimit >= currentArtifact.weight; --currentWeightLimit) {
            maximalValueAtWeight[currentWeightLimit] = Math.max(
                maximalValueAtWeight[currentWeightLimit],
                maximalValueAtWeight[currentWeightLimit - currentArtifact.weight] + currentArtifact.value
            );
        }
    }

    const finalResult = Math.max(...maximalValueAtWeight);

    console.log(finalResult);
};

let accumulatedInput = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', fragment => accumulatedInput += fragment);
process.stdin.on('end', () => {
    commenceProcessing(accumulatedInput);
});