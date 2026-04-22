const inputReader = require("fs");
const inputData = inputReader.readFileSync(0).toString();
const segmentCollection = inputData.split(" ");

const totalElements = Number(segmentCollection[0]);
const fillValue = Number(segmentCollection[2]);

const endPositionString = segmentCollection[1];
let fillLimit;

if (endPositionString === undefined || endPositionString === null || endPositionString.trim() === '') {
    throw new RangeError("Invalid end argument");
} else {
    fillLimit = Number(endPositionString);
    if (Number.isNaN(fillLimit)) {
        throw new RangeError("Invalid end argument");
    }
}

const defaultValue = 7;

const constructedArray = Array.from({ length: totalElements }, (dummy, currentIdx) => {
    if (currentIdx < fillLimit) {
        return fillValue;
    } else {
        return defaultValue;
    }
});

console.log(constructedArray.join(" "));