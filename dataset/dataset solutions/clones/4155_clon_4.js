( function(inputContent) {
    const obtainReverseSorted = (textSegment) => {
        return Array.from(textSegment).sort().reverse().join('');
    };

    const obtainNormallySorted = (textSegment) => {
        return Array.from(textSegment).sort().join('');
    };

    const rawLines = inputContent.split('\n');
    const processedSegments = [];

    for (let segmentIndex = 0; segmentIndex < rawLines.length; segmentIndex++) {
        const currentSegment = rawLines[segmentIndex];
        let transformedSegment;

        if (segmentIndex === 0) {
            transformedSegment = obtainReverseSorted(currentSegment);
        } else {
            transformedSegment = obtainNormallySorted(currentSegment);
        }
        processedSegments.push(transformedSegment);
    }

    console.log(processedSegments);

    const firstElement = processedSegments[0];
    const secondElement = processedSegments[1];

    if (firstElement > secondElement) {
        console.log('Yes');
    } else {
        console.log('No');
    }

})(require("fs").readFileSync("/dev/stdin", "utf8"));
