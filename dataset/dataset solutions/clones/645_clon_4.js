const fs = require('fs');

const packet = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const sequenceSize = Number(packet.shift());

const originalPattern = packet.splice(0, sequenceSize);
const observedPattern = packet.splice(0, sequenceSize);

function buildPrefixTable(pattern) {
    const prefixTable = new Array(pattern.length).fill(0);

    let matchedLength = 0;
    let position = 1;

    while (position < pattern.length) {
        if (pattern[position] === pattern[matchedLength]) {
            matchedLength++;
            prefixTable[position] = matchedLength;
            position++;
        } else if (matchedLength > 0) {
            matchedLength = prefixTable[matchedLength - 1];
        } else {
            prefixTable[position] = 0;
            position++;
        }
    }

    return prefixTable;
}

function patternExists(text, pattern) {
    const prefixTable = buildPrefixTable(pattern);

    let textPosition = 0;
    let patternPosition = 0;

    while (textPosition < text.length) {
        if (text[textPosition] === pattern[patternPosition]) {
            textPosition++;
            patternPosition++;

            if (patternPosition === pattern.length) {
                return true;
            }
        } else if (patternPosition > 0) {
            patternPosition = prefixTable[patternPosition - 1];
        } else {
            textPosition++;
        }
    }

    return false;
}

const circularSearchSpace = originalPattern
    .concat(originalPattern)
    .slice(0, 2 * sequenceSize - 1);

const representsSameCycle =
    originalPattern.length === observedPattern.length &&
    patternExists(circularSearchSpace, observedPattern);

console.log(
    representsSameCycle
        ? 'CICLO EQUIVALENTE'
        : 'CICLO DIFERENTE'
);