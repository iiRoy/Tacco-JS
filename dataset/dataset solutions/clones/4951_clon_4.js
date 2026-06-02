function processInputData(sourceContent) {
    const lineSegments = sourceContent.split("\n");

    let primaryAccumulator = '';
    let secondaryAccumulator = '';
    let currentSegmentIndex = 0;

    for (const currentSegment of lineSegments) {
        if (currentSegmentIndex < 4) {
            if (primaryAccumulator.length > 0) {
                primaryAccumulator += ',';
            }
            primaryAccumulator += currentSegment;
        } else {
            if (secondaryAccumulator.length > 0) {
                secondaryAccumulator += ',';
            }
            secondaryAccumulator += currentSegment;
        }
        currentSegmentIndex++;
    }

    console.log(`${primaryAccumulator} ${secondaryAccumulator}`);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
