"use strict";

const NEWLINE_DELIMITER = "\n";

const extractUniqueCharacters = (characterArray) => {
    const encounteredChars = new Set();
    const uniqueList = [];
    for (const charElement of characterArray) {
        if (!encounteredChars.has(charElement)) {
            encounteredChars.add(charElement);
            uniqueList.push(charElement);
        }
    }
    return uniqueList;
};

let rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

let contentLines = rawInputContent.split(NEWLINE_DELIMITER);

let iterationLimit = parseInt(contentLines[0], 10);
let targetStringData = contentLines[1];

let stringSegmentPairs = [];

for (let splitPoint = 1; splitPoint < iterationLimit; splitPoint++) {
    let leftSegmentString = targetStringData.slice(0, splitPoint);
    let rightSegmentString = targetStringData.slice(splitPoint);

    let leftSegmentChars = leftSegmentString.split("");
    let rightSegmentChars = rightSegmentString.split("");

    stringSegmentPairs.push([leftSegmentChars, rightSegmentChars]);
}

let intersectionCounts = stringSegmentPairs.map(currentSegmentPair => {
    const firstSegmentCharacters = currentSegmentPair[0];
    const secondSegmentCharacters = currentSegmentPair[1];

    const distinctCharsFromFirst = extractUniqueCharacters(firstSegmentCharacters);

    let commonCharacterTally = 0;
    for (const uniqueChar of distinctCharsFromFirst) {
        if (secondSegmentCharacters.includes(uniqueChar)) {
            commonCharacterTally++;
        }
    }
    return commonCharacterTally;
});

let overallMaximumCount = intersectionCounts.reduce((currentMax, value) => Math.max(currentMax, value), 0);

console.log(overallMaximumCount);
