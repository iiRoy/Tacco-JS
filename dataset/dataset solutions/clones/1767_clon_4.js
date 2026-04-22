const analyzeSequence = (sourceData) => {
    let resultPosition = 0;
    let segmentCount = 0;
    let tempSegment = "";
    const keyString = "0";
    const dataLength = sourceData.length;

    for (let charPointer = 0; charPointer <= dataLength; charPointer++) {
        const currentCharacter = charPointer < dataLength ? sourceData[charPointer] : ' ';

        if (currentCharacter === ' ') {
            segmentCount++;
            if (tempSegment === keyString && resultPosition === 0) {
                resultPosition = segmentCount;
            }
            tempSegment = "";
        } else {
            tempSegment += currentCharacter;
        }
    }
    return resultPosition;
};

const dataAcquirer = require("fs");
const inputSource = '/dev/stdin';
const encodingType = 'utf8';
const acquiredText = dataAcquirer.readFileSync(inputSource, encodingType);

console.log(analyzeSequence(acquiredText));