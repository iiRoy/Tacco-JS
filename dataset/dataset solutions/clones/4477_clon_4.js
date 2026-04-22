const processData = (rawData) => {
    const allNumericTokens = rawData.match(/-?\d+/g);
    const sequenceAsNumbers = allNumericTokens.map(Number);
    
    const actualSequence = sequenceAsNumbers.slice(1);
    
    if (actualSequence.length < 2) {
        console.log(-1);
        return;
    }

    const overallSum = actualSequence.reduce((acc, val) => acc + val, 0);

    const finalOutcome = actualSequence.slice(0, -1).reduce(
        ([leastAbsDiff, accumulatedLeftSegmentSum], currentValForSegment) => {
            const nextAccumulatedLeftSegmentSum = accumulatedLeftSegmentSum + currentValForSegment;
            const currentRightSegmentSum = overallSum - nextAccumulatedLeftSegmentSum;
            const currentAbsDifference = Math.abs(nextAccumulatedLeftSegmentSum - currentRightSegmentSum);
            
            const updatedLeastAbsDiff = Math.min(leastAbsDiff, currentAbsDifference);
            
            return [updatedLeastAbsDiff, nextAccumulatedLeftSegmentSum];
        },
        [Number.POSITIVE_INFINITY, 0]
    );

    console.log(finalOutcome[0]);
};

const entrancePoint = (resourcePath) => {
    const fileContents = require("node:fs").readFileSync(resourcePath, "utf8");
    processData(fileContents);
};

entrancePoint("/dev/stdin");