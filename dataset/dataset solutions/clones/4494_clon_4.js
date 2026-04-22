function processInputData(sourceText) {
    const primaryLine = sourceText.split("\n")[0];
    const lineLength = primaryLine.length;

    if (lineLength % 2 !== 0) {
        return;
    }

    function determineLongestRepeatingPrefix(currentCandidateLength) {
        if (currentCandidateLength < 2) {
            return;
        }

        const segmentSplitPoint = currentCandidateLength / 2;
        const initialSegment = primaryLine.substring(0, segmentSplitPoint);
        const terminalSegment = primaryLine.substring(segmentSplitPoint, currentCandidateLength);

        if (initialSegment === terminalSegment) {
            console.log("%d", currentCandidateLength);
            return;
        }

        determineLongestRepeatingPrefix(currentCandidateLength - 2);
    }

    determineLongestRepeatingPrefix(lineLength - 2);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));