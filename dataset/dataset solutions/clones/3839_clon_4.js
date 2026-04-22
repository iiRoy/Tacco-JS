function ProcessData(rawPayload) {
    const newlinePosition = rawPayload.indexOf('\n');
    const primarySequence = rawPayload.slice(0, newlinePosition).toLowerCase();
    const ordinalValue = Number(rawPayload.slice(newlinePosition + 1));

    const sequenceLength = primarySequence.length;
    const distinctFragments = new Set();

    Array.from({ length: sequenceLength }).forEach((_, commencementPoint) => {
        Array.from({ length: sequenceLength - commencementPoint }).forEach((_, spanIncrement) => {
            const terminationPoint = commencementPoint + spanIncrement + 1;
            const currentFragment = primarySequence.slice(commencementPoint, terminationPoint);

            if (currentFragment.length > 0) {
                distinctFragments.add(currentFragment);
            }
        });
    });

    const orderedCollection = Array.from(distinctFragments).sort();
    console.log(orderedCollection[ordinalValue - 1]);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));