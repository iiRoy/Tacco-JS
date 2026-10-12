const processInputData = inputContent => {
    const lineSegments = inputContent.trim().split("\n");
    const [countLimit, thresholdValue] = lineSegments[0].split(" ").map(Number);

    const numericPairs = lineSegments.slice(1, countLimit + 1).map(segment => segment.split(" ").map(Number));

    let cumulativeSum = 0;
    const finalPair = numericPairs.find(pairEntry => {
        cumulativeSum += pairEntry[1];
        return cumulativeSum >= thresholdValue;
    });

    console.log(finalPair[0]);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
