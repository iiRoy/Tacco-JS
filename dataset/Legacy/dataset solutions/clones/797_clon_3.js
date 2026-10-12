var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = rawData.trim().split("\n");

function calculateSegmentSumsFrequency(segmentValues) {
    const frequencyMap = {};
    for (let startIdx = 0; startIdx < segmentValues.length; startIdx++) {
        let trailingSum = 0;
        for (let endIdx = startIdx; endIdx < segmentValues.length; endIdx++) {
            if (endIdx !== startIdx) {
                trailingSum += segmentValues[endIdx];
            }
            const currentTotalSegmentSum = segmentValues[startIdx] + trailingSum;
            frequencyMap[currentTotalSegmentSum] = (frequencyMap[currentTotalSegmentSum] || 0) + 1;
        }
    }
    return frequencyMap;
}

while (true) {
    let currentLine = lines.shift();

    if (currentLine === "0 0") {
        break;
    }

    const dimensions = currentLine.split(" ").map(Number);
    const heightCount = dimensions[0];
    const widthCount = dimensions[1];

    const heightSegments = [];
    for (let idx = 0; idx < heightCount; idx++) {
        heightSegments.push(Number(lines.shift()));
    }

    const widthSegments = [];
    for (let idx = 0; idx < widthCount; idx++) {
        widthSegments.push(Number(lines.shift()));
    }

    const heightSumsMap = calculateSegmentSumsFrequency(heightSegments);
    const widthSumsMap = calculateSegmentSumsFrequency(widthSegments);

    let totalCount = 0;
    for (const sumKey in heightSumsMap) {
        if (Object.prototype.hasOwnProperty.call(widthSumsMap, sumKey)) {
            totalCount += heightSumsMap[sumKey] * widthSumsMap[sumKey];
        }
    }

    console.log(totalCount);
}
