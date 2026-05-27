var rawDataSegments = [];
var valueCounts = [];
var initialInputString = input;
const splitPattern = /,\d+\n{0,}/;

rawDataSegments = initialInputString.split(splitPattern);
var segmentCount = rawDataSegments.length;
var parsedValue;
var outputBuffer = "";

function incrementCount(mapReference, keyToIncrement) {
    mapReference[keyToIncrement] = (mapReference[keyToIncrement] || 0) + 1;
}

for (var segmentIndex = 0; segmentIndex < segmentCount - 1; segmentIndex++) {
    parsedValue = Number.parseInt(rawDataSegments[segmentIndex]);
    incrementCount(valueCounts, parsedValue);
}

var maxCountedValue = valueCounts.length;

const generateFormattedLine = (value, count) => {
    return `${value} ${count}\n`;
};

for (var valueIndex = 0; valueIndex < maxCountedValue; valueIndex++) {
    const currentCount = valueCounts[valueIndex];
    if (currentCount !== undefined && currentCount > 1) {
        outputBuffer += generateFormattedLine(valueIndex, currentCount);
    }
}

console.log(outputBuffer);
