const fsys = require('fs');
const allInputContent = fsys.readFileSync('/dev/stdin', 'utf8');
const processedLines = allInputContent.trim().split("\n");

let lineIterator = 0;

const retrieveNextLine = () => processedLines[lineIterator++];
const convertToNumbers = (textSegment) => textSegment.split(" ").map(Number);
const interpretAsNumber = (textValue) => Number(textValue);

const checkFeasibility = (thresholdValue, dataPoints, maximumSegments) => {
    if (dataPoints.some(val => val > thresholdValue)) {
        return false;
    }

    const { segmentCount } = dataPoints.reduce((accumulator, currentItem) => {
        if (accumulator.currentTotal + currentItem > thresholdValue) {
            return {
                currentTotal: currentItem,
                segmentCount: accumulator.segmentCount + 1
            };
        } else {
            return {
                currentTotal: accumulator.currentTotal + currentItem,
                segmentCount: accumulator.segmentCount
            };
        }
    }, { currentTotal: 0, segmentCount: 1 });

    return segmentCount <= maximumSegments;
};

while (true) {
    const configurationString = retrieveNextLine();
    if (configurationString === "0 0") {
        break;
    }

    const [maxSegmentConstraint, dataPointCount] = convertToNumbers(configurationString);

    const numericalData = Array.from({ length: dataPointCount }, () => interpretAsNumber(retrieveNextLine()));

    let searchStart = 0;
    let searchEnd = 1500000;

    let finalOptimal = 0;

    while (searchStart <= searchEnd) {
        const currentTest = Math.floor((searchStart + searchEnd) / 2);
        const testOutcome = checkFeasibility(currentTest, numericalData, maxSegmentConstraint);

        if (testOutcome) {
            finalOptimal = currentTest;
            searchEnd = currentTest - 1;
        } else {
            searchStart = currentTest + 1;
        }
    }
    console.log(finalOptimal);
}