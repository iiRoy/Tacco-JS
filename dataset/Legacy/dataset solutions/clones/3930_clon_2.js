let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let dataRows = rawData.split('\n');
let inputString = dataRows.shift();

let charPresenceMap = {};
let resultString = '';

for (let charCodeIterator = 65; charCodeIterator < 91; charCodeIterator++) {
    charPresenceMap[String.fromCharCode(charCodeIterator).toLowerCase()] = 0;
}

if (inputString.length === 26) {
    let strLength = inputString.length;
    let charBuffer = [];
    for (let mainIndex = strLength - 1; mainIndex >= 0; mainIndex--) {
        charBuffer.push(inputString.slice(mainIndex, mainIndex + 1));
        charBuffer.sort();
        let prefixSegment = inputString.slice(0, mainIndex);
        let isFound = false;
        for (let bufferIndex = 0; bufferIndex < charBuffer.length; bufferIndex++) {
            if (prefixSegment + charBuffer[bufferIndex] > inputString) {
                isFound = true;
                resultString = prefixSegment + charBuffer[bufferIndex];
                break;
            }
        }
        if (isFound) {
            break;
        }
    }

    if (!isFound) {
        resultString = -1;
    }

} else {
    for (let charScanIndex = 0; charScanIndex < inputString.length; charScanIndex++) {
        charPresenceMap[inputString[charScanIndex]] = 1;
    }
    let nextCharToAppend = '';
    for (let alphabetCode = 65; alphabetCode < 91; alphabetCode++) {
        nextCharToAppend = String.fromCharCode(alphabetCode).toLowerCase();
        if (!charPresenceMap[nextCharToAppend]) {
            break;
        }
    }
    resultString = inputString + nextCharToAppend;
}
console.log(resultString);
