function segmentString(inputSequence) {
    const collectedParts = [];
    let currentPiece = '';
    for (let currentPos = 0; currentPos < inputSequence.length; ++currentPos) {
        if (inputSequence[currentPos] === ' ') {
            collectedParts.push(currentPiece);
            currentPiece = '';
        } else {
            currentPiece += inputSequence[currentPos];
        }
    }
    collectedParts.push(currentPiece);
    return collectedParts;
}

const entireStream = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineSeparatorPosition = entireStream.indexOf('\n');
const relevantLine = (lineSeparatorPosition === -1) ? entireStream : entireStream.substring(0, lineSeparatorPosition);

const extractedComponents = segmentString(relevantLine);

const initialDatum = extractedComponents[0];
const secondDatum = extractedComponents[1];

const valueOne = +initialDatum;
const valueTwo = +secondDatum;

const finalResult = valueOne + (valueTwo / 2);

console.log(finalResult);