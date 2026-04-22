function analyzeContent(rawDataInput) {
    const contentSegments = rawDataInput.split("\n");

    const desiredPhrase = contentSegments.shift();

    const escapedPhrase = desiredPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const searchPattern = new RegExp(escapedPhrase, 'g');

    const finalOutcome = contentSegments.reduce((accumulatorObject, currentSegment) => {
        if (accumulatorObject.hasStopped) {
            return accumulatorObject;
        }

        if (currentSegment === "END_OF_TEXT") {
            return { totalCount: accumulatorObject.totalCount, hasStopped: true };
        }

        const foundInstances = [...currentSegment.matchAll(searchPattern)];

        return { totalCount: accumulatorObject.totalCount + foundInstances.length, hasStopped: false };
    }, { totalCount: 0, hasStopped: false });

    console.log(finalOutcome.totalCount);
}
analyzeContent(require("fs").readFileSync("/dev/stdin", "utf8"));