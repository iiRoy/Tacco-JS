function main(input) {
    const sourceText = input.trim();

    const finalState = sourceText.split('').reduce((accumulator, char) => {
        const nextSegmentCandidate = accumulator.currentSegmentCandidate + char;

        if (nextSegmentCandidate === accumulator.lastConfirmedSegment) {
            return {
                segmentCount: accumulator.segmentCount,
                lastConfirmedSegment: accumulator.lastConfirmedSegment,
                currentSegmentCandidate: nextSegmentCandidate
            };
        } else {
            return {
                segmentCount: accumulator.segmentCount + 1,
                lastConfirmedSegment: nextSegmentCandidate,
                currentSegmentCandidate: ''
            };
        }
    }, { segmentCount: 0, lastConfirmedSegment: '', currentSegmentCandidate: '' });

    console.log(finalState.segmentCount);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
