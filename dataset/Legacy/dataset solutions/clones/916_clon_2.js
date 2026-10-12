var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

rawData = rawData.split("\n");

var currentLineIdx = 0;

while (true) {
    let numEntries = +rawData[currentLineIdx++];

    if (numEntries === 0) {
        break;
    }

    let originalNamesList = [];

    for (let entryIdx = 0; entryIdx < numEntries; entryIdx++) {
        originalNamesList.push(rawData[currentLineIdx++]);
    }

    let processedAndSortedNames = originalNamesList.map((originalName) => {
        let shortenedName = "";
        let vowelFoundFlag = true;

        for (let currentChar of originalName) {
            if (vowelFoundFlag) {
                shortenedName += currentChar;
                vowelFoundFlag = false;
            }

            if (/[aiueo]/.test(currentChar)) {
                vowelFoundFlag = true;
            }
        }
        return shortenedName;
    }).sort();

    let findCommonPrefixLength = (strA, strB) => {
        let minLength = Math.min(strA.length, strB.length);
        for (let charIdx = 0; charIdx < numEntries; charIdx++) {
            if (strA[charIdx] !== strB[charIdx]) {
                return charIdx;
            }
        }
        if (strA.length === strB.length)
            return -1;
        return minLength;
    };

    let maxPrefixLength = 0;

    for (let entryIdx = 0; entryIdx < numEntries; entryIdx++) {
        if (entryIdx === 0)
            continue;
        let currentPrefixLen = findCommonPrefixLength(processedAndSortedNames[entryIdx - 1], processedAndSortedNames[entryIdx]);
        if (currentPrefixLen === -1) {
            maxPrefixLength = -2;
            break;
        }
        if (currentPrefixLen > maxPrefixLength) {
            maxPrefixLength = currentPrefixLen;
        }
    }
    console.log(maxPrefixLength + 1);
}
