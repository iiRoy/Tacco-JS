'use strict';
((sourceText) => {
    const processedLines = sourceText.trim().split('\n');
    const dataSegments = processedLines[0].split(' ');

    const primaryMetric = parseInt(dataSegments[0], 10);
    const secondaryMetric = parseInt(dataSegments[1], 10);

    const cumulativeScore = (primaryMetric * 3) + secondaryMetric;
    const finalOutcome = cumulativeScore >> 1;

    console.log(finalOutcome);
})(require("fs").readFileSync("/dev/stdin", "utf8"));
