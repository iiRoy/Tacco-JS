const STD_IN_PATH = '/dev/stdin';
var fileContent = require('fs').readFileSync(STD_IN_PATH, 'utf8');

var trimmedContent = fileContent.trim();
var inputLines = trimmedContent.split("\n");

while (inputLines.length > 1) {
    let dictSizeRaw = inputLines.shift();
    let dictionaryEntryCount = parseInt(dictSizeRaw, 10);

    let translationMap = {};

    for (let currentDictIdx = 0; currentDictIdx < dictionaryEntryCount; currentDictIdx++) {
        let rawEntryLine = inputLines.shift();
        let pairComponents = rawEntryLine.split(" ");
        let keyToMap = pairComponents[0];
        let valueToMap = pairComponents[1];
        translationMap[keyToMap] = valueToMap;
    }

    let stringBuildSizeRaw = inputLines.shift();
    let stringSegmentCount = parseInt(stringBuildSizeRaw, 10);

    let finalOutputString = "";

    for (let currentSegmentIdx = 0; currentSegmentIdx < stringSegmentCount; currentSegmentIdx++) {
        let segmentKey = inputLines.shift();
        let segmentValue;

        if (translationMap.hasOwnProperty(segmentKey)) {
            segmentValue = translationMap[segmentKey];
        } else {
            segmentValue = segmentKey;
        }
        finalOutputString += segmentValue;
    }

    console.log(finalOutputString);

    let nextControlValue = inputLines[0];
    if (nextControlValue === "0") {
        break;
    }
}
