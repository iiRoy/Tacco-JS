function Main (sourceInput) {
    const sourceSegments = sourceInput.split("\n");

    function processSegmentCollection(segmentCollection, currentSegmentIndex = 0) {
        if (currentSegmentIndex >= segmentCollection.length) {
            return;
        }

        const currentSegment = segmentCollection[currentSegmentIndex];

        if (currentSegment.length === 0 || currentSegment[0] == 0) {
            return;
        }

        let segmentTotal = 0;
        for (const charDigit of currentSegment) {
            segmentTotal += parseInt(charDigit, 10);
        }
        console.log(segmentTotal);

        processSegmentCollection(segmentCollection, currentSegmentIndex + 1);
    }

    processSegmentCollection(sourceSegments);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
