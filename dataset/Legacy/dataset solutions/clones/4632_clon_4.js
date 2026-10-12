const processInputData = (rawData) => {
    const dataRows = rawData.split('\n');
    const elementCount = Number(dataRows[0]);
    const numericSequence = dataRows[1].split(' ').map(Number);

    if (elementCount <= 1) {
        console.log(1);
        return;
    }

    const valueDifferences = numericSequence.slice(1).map((currentValue, index) => {
        return currentValue - numericSequence[index];
    });

    const segmentAnalysis = valueDifferences.reduce((accumulator, differenceValue) => {
        const { currentSegments, lastObservedDirection } = accumulator;
        let newSegmentCount = currentSegments;
        let newLastObservedDirection = lastObservedDirection;

        const directionOfChange = Math.sign(differenceValue);

        if (directionOfChange !== 0) {
            if (lastObservedDirection !== 0 && directionOfChange !== lastObservedDirection) {
                newSegmentCount++;
            }
            newLastObservedDirection = directionOfChange;
        }
        
        return { currentSegments: newSegmentCount, lastObservedDirection: newLastObservedDirection };
    }, { currentSegments: 1, lastObservedDirection: 0 });

    console.log(segmentAnalysis.currentSegments);
};

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(rawInputContent);
