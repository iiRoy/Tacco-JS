const obtainHighestWindowSum = (valSequence, windowSize) => {
    if (valSequence.length < windowSize) {
        console.log(undefined);
        return;
    }

    const allWindowTotals = Array.from({ length: valSequence.length - windowSize + 1 }, (_, index) => {
        return valSequence.slice(index, index + windowSize).reduce((acc, num) => acc + num, 0);
    });

    const finalHighest = Math.max(...allWindowTotals);
    console.log(finalHighest);
};

const dataProcessor = () => {
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const allInputLines = rawData.trim().split("\n");

    let currentCollection = [];
    let windowDimension = 0;
    let lineIndex = 0;
    let firstDataSetEncountered = false;

    while (lineIndex < allInputLines.length) {
        const currentLineContent = allInputLines[lineIndex];

        if (currentLineContent === "0 0") {
            if (firstDataSetEncountered) {
                obtainHighestWindowSum(currentCollection, windowDimension);
            }
            break;
        }

        const parsedSegment = currentLineContent.split(" ").map(Number);

        if (parsedSegment.length === 2) {
            if (firstDataSetEncountered) {
                obtainHighestWindowSum(currentCollection, windowDimension);
            }
            currentCollection = [];
            windowDimension = parsedSegment[1];
            firstDataSetEncountered = true;
        } else {
            currentCollection.push(parsedSegment[0]);
        }
        lineIndex++;
    }
};

dataProcessor();