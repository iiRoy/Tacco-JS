let sourceData = [];

let frequencyMap = [];

sourceData = require("fs").readFileSync("/dev/stdin", "utf8").split(/,\d+\n{0,}/);

const dataCount = sourceData.length;

let currentItem;

let idx;

for (idx = 0; idx < dataCount; idx++) {
    currentItem = sourceData[idx];

    if (frequencyMap[currentItem] === undefined) {
        frequencyMap[currentItem] = 1;
    } else {
        frequencyMap[currentItem]++;
    }
}

let mapExtent = frequencyMap.length;

for (idx = 0; idx < mapExtent; idx++) {
    if (frequencyMap[idx] !== undefined && frequencyMap[idx] > 1) {
        console.log(idx + ' ' + frequencyMap[idx]);
    }
}
