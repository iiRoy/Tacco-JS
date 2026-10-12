const fileSystem = require('fs');

const numericTransmission = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const barrierCount = numericTransmission[0];
const forceFields = [];

let readingPosition = 1;

for (
    let barrierIndex = 0;
    barrierIndex < barrierCount;
    barrierIndex++
) {
    forceFields.push([
        numericTransmission[readingPosition],
        numericTransmission[readingPosition + 1],
    ]);

    readingPosition += 2;
}

forceFields.sort(
    (firstField, secondField) =>
        firstField[0] - secondField[0]
);

let activeBeginning = forceFields[0][0];
let activeEnding = forceFields[0][1];
let securedDistance = 0;

for (
    let fieldIndex = 1;
    fieldIndex < forceFields.length;
    fieldIndex++
) {
    const followingBeginning = forceFields[fieldIndex][0];
    const followingEnding = forceFields[fieldIndex][1];

    if (followingBeginning <= activeEnding) {
        activeEnding = Math.max(
            activeEnding,
            followingEnding
        );
    } else {
        securedDistance += activeEnding - activeBeginning;
        activeBeginning = followingBeginning;
        activeEnding = followingEnding;
    }
}

securedDistance += activeEnding - activeBeginning;

console.log(securedDistance);