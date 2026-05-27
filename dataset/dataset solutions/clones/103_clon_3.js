var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = (rawData.trim()).split("\n");

const SEQUENCE_DIGIT_COUNT = 4;

const parseNumericSequence = (inputLine) => {
    return inputLine.split(" ").map(Number);
};

for (let pairIndex = 0; pairIndex < lineSegments.length; pairIndex += 2) {
    const currentLineOne = lineSegments[pairIndex];
    const currentLineTwo = lineSegments[pairIndex + 1];

    const firstNumericSequence = parseNumericSequence(currentLineOne);
    const secondNumericSequence = parseNumericSequence(currentLineTwo);

    let exactPositionMatches = 0;
    let valueOnlyMatches = 0;

    for (let digitPosition = 0; digitPosition < SEQUENCE_DIGIT_COUNT; digitPosition++) {
        const digitFromFirst = firstNumericSequence[digitPosition];
        const digitFromSecond = secondNumericSequence[digitPosition];

        if (digitFromFirst === digitFromSecond) {
            exactPositionMatches++;
        } else {
            if (firstNumericSequence.includes(digitFromSecond)) {
                valueOnlyMatches++;
            }
        }
    }
    console.log(exactPositionMatches + " " + valueOnlyMatches);
}
