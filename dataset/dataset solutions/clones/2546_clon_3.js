function processInputData(rawInput) {
    function numericSortComparator(a, b) {
        return a - b;
    }

    const inputLines = rawInput.split("\n");
    const firstLineParts = inputLines[0].split(" ");

    const totalCount = parseInt(firstLineParts[0], 10);
    const segmentLength = parseInt(firstLineParts[1], 10);

    const numericSequence = inputLines[1].split(" ").map(val => parseInt(val, 10));

    const processedSegments = [];
    const loopUpperBound = totalCount - segmentLength + 1;

    for (let segmentIndex = 0; segmentIndex < loopUpperBound; segmentIndex++) {
        const currentSegment = numericSequence.slice(segmentIndex, segmentIndex + segmentLength);
        currentSegment.sort(numericSortComparator);

        const prefixElements = numericSequence.slice(0, segmentIndex);
        const suffixElements = numericSequence.slice(segmentIndex + segmentLength);

        const combinedArray = [...prefixElements, ...currentSegment, ...suffixElements];
        processedSegments[segmentIndex] = combinedArray.join(',');
    }

    const distinctResults = new Set(processedSegments);

    console.log(distinctResults.size);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
