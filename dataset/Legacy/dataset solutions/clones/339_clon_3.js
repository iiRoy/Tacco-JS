const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineArray = rawData.trim().split("\n");
const dataMap = {};

const processAndSortValueString = (valueString) => {
    const numericValues = valueString.split(" ").map(Number);
    numericValues.sort((a, b) => a - b);
    return numericValues.join(" ");
};

lineArray.forEach(function(currentLine) {
    const parts = currentLine.split(" ");
    const keyStr = parts[0];
    const valStr = parts[1];

    if (dataMap.hasOwnProperty(keyStr)) {
        dataMap[keyStr] += (" " + valStr);
    } else {
        dataMap[keyStr] = valStr;
    }
});

const sortedKeys = Object.keys(dataMap);
sortedKeys.sort();

sortedKeys.forEach(function(currentKey) {
    const originalValueString = dataMap[currentKey];
    dataMap[currentKey] = processAndSortValueString(originalValueString);
});

sortedKeys.forEach(function(currentKey) {
    const associatedValue = dataMap[currentKey];
    console.log(currentKey + "\n" + associatedValue);
});
