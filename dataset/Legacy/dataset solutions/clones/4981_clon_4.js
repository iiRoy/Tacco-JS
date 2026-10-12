function processInput(inputSequence) {
    const sequenceLength = inputSequence.length;

    let totalAggregateSum = 0;
    const separatorPositions = sequenceLength - 1;
    const combinationCount = 1 << separatorPositions;

    for (let currentPattern = 0; currentPattern < combinationCount; currentPattern++) {
        let segmentCollection = [];
        let activeSegmentBuilder = inputSequence[0];

        for (let separatorIndex = 0; separatorIndex < separatorPositions; separatorIndex++) {
            if ((currentPattern >> separatorIndex) & 1) {
                segmentCollection.push(activeSegmentBuilder);
                activeSegmentBuilder = inputSequence[separatorIndex + 1];
            } else {
                activeSegmentBuilder += inputSequence[separatorIndex + 1];
            }
        }
        segmentCollection.push(activeSegmentBuilder);

        const currentPatternSum = segmentCollection.reduce((accumulator, segmentString) => accumulator + Number(segmentString), 0);
        totalAggregateSum += currentPatternSum;
    }

    console.log(totalAggregateSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
