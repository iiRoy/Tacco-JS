(function(inputData) {
    const lineSegments = inputData.split('\n');

    function processLinesRecursively(remainingLines, currentLineIndex = 0) {
        if (currentLineIndex >= remainingLines.length) {
            return;
        }

        const currentSegment = remainingLines[currentLineIndex];

        if (currentSegment === '0') {
            return;
        }

        let digitAccumulator = 0;
        let charPosition = 0;
        while (charPosition < currentSegment.length) {
            digitAccumulator += Number(currentSegment[charPosition]);
            charPosition++;
        }

        console.log(digitAccumulator);

        processLinesRecursively(remainingLines, currentLineIndex + 1);
    }

    processLinesRecursively(lineSegments);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
