const ioSystem = require('node:fs');

const rawTextContent = ioSystem.readFileSync('/dev/stdin', 'utf8');

const contentLines = rawTextContent.trim().split('\n');
const firstLineParts = contentLines[0].split(' ').map(Number);

const primaryValue = firstLineParts[0];
const forbiddenCount = firstLineParts[1];

if (forbiddenCount === 0) {
    process.stdout.write(String(primaryValue) + '\n');
    process.exit(0);
}

const prohibitedRawValues = contentLines[1].split(' ');
const prohibitedSet = new Set(prohibitedRawValues.map(Number));

const lowerLimit = -10;
const upperLimit = 100;
const potentialNumbers = Array.from({ length: upperLimit - lowerLimit + 1 }, (_, idx) => lowerLimit + idx);

const availableNumbers = potentialNumbers.filter(num => !prohibitedSet.has(num));

const bestCandidate = availableNumbers.sort((a, b) => {
    const diffA = Math.abs(a - primaryValue);
    const diffB = Math.abs(b - primaryValue);

    if (diffA !== diffB) {
        return diffA - diffB;
    }

    return a - b;
})[0];

process.stdout.write(String(bestCandidate) + '\n');