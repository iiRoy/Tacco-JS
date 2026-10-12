const processMusicData = (rawInputContent) => {
    const contentLines = rawInputContent.trim().split('\n');
    const _ = contentLines.shift();
    const triggerIdentifier = contentLines.pop();

    const trackManifest = contentLines.map(entryString => {
        const parts = entryString.split(' ');
        return {
            designation: parts[0],
            durationSeconds: parseInt(parts[1], 10)
        };
    });

    const activationPoint = trackManifest.findIndex(
        item => item.designation === triggerIdentifier
    );

    if (activationPoint === -1 || activationPoint === trackManifest.length - 1) {
        console.log(0);
        return;
    }

    const postTriggerSegments = trackManifest.slice(activationPoint + 1);

    const accumulatedDuration = postTriggerSegments.reduce(
        (currentSum, segment) => currentSum + segment.durationSeconds,
        0
    );

    console.log(accumulatedDuration);
};

processMusicData(require("fs").readFileSync("/dev/stdin", "utf8"));
