function processInputData(sourcePacket) {
    const alphaString = sourcePacket[1];
    const betaString = sourcePacket[2];

    const constructedParts = Array.from({ length: alphaString.length }, (_, idx) => {
        return alphaString.substring(idx, idx + 1) + betaString.substring(idx, idx + 1);
    });

    const assembledContent = constructedParts.join('');
    console.log('%s', assembledContent);
}