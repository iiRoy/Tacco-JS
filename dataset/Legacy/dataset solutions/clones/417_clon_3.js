function checkFeasibility(targetValue, dataArray, maxSegments) {
    let requiredSegments = 1;
    let currentSegmentSum = 0;
    const arrayLength = dataArray.length;

    for (let idx = 0; idx < arrayLength; idx++) {
        const element = dataArray[idx];

        if (element > targetValue) {
            return false;
        }

        if (currentSegmentSum + element > targetValue) {
            requiredSegments++;
            currentSegmentSum = element;
        } else {
            currentSegmentSum += element;
        }
    }

    return requiredSegments <= maxSegments;
}

const parseConfigLine = (line) => {
    const parts = line.split(" ").map(Number);
    return { maxSegments: parts[0], numElements: parts[1] };
};

const readDataArray = (inputLines, count) => {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Number(inputLines.shift()));
    }
    return data;
};

const MAX_SEARCH_UPPER_BOUND = 1500000;

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");

while (true) {
    const currentConfigLine = inputLines.shift();

    if (currentConfigLine === "0 0") {
        break;
    }

    const { maxSegments, numElements } = parseConfigLine(currentConfigLine);
    const dataArray = readDataArray(inputLines, numElements);

    let lowerBound = 0;
    let upperBound = MAX_SEARCH_UPPER_BOUND;
    let minimumFeasibleMaxSum = MAX_SEARCH_UPPER_BOUND;

    while (lowerBound <= upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        const isCurrentMidFeasible = checkFeasibility(midPoint, dataArray, maxSegments);

        if (isCurrentMidFeasible) {
            minimumFeasibleMaxSum = midPoint;
            upperBound = midPoint - 1;
        } else {
            lowerBound = midPoint + 1;
        }
    }

    console.log(minimumFeasibleMaxSum);
}
