var inputBuffer = [];
var ioModule = require('readline');

var inputHandler = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentInputLine) {
    inputBuffer.push(currentInputLine);
});

inputHandler.on('close', function () {
    const firstLineValues = inputBuffer[0].split(" ").map(Number);
    const numN = firstLineValues[0];
    const startA = firstLineValues[1];
    const startB = firstLineValues[2];
    const endC = firstLineValues[3];
    const endD = firstLineValues[4];

    const pathChars = inputBuffer[1].split("");

    const HASH_CHAR = '#';
    const DOT_CHAR = '.';

    let canFindTripleDot = false;

    const maxRelevantEnd = Math.max(endC, endD);

    for (let charIndex = 0; charIndex < pathChars.length; charIndex++) {
        const currentIsHash = pathChars[charIndex] === HASH_CHAR;
        const nextIsHash = pathChars[charIndex + 1] === HASH_CHAR;
        const isDoubleHashBlock = currentIsHash && nextIsHash;

        const isDoubleHashRelevantPosition = charIndex >= startA && (charIndex + 1) <= maxRelevantEnd;

        if (isDoubleHashBlock && isDoubleHashRelevantPosition) {
            console.log("No");
            return 0;
        }

        const currentIsDot = pathChars[charIndex] === DOT_CHAR;
        const nextIsDot = pathChars[charIndex + 1] === DOT_CHAR;
        const nextNextIsDot = pathChars[charIndex + 2] === DOT_CHAR;
        const isTripleDotSequence = currentIsDot && nextIsDot && nextNextIsDot;

        const isTripleDotRelevantRange = charIndex >= startB && (charIndex + 3 <= endD || charIndex + 1 === endD);

        if (isTripleDotSequence && isTripleDotRelevantRange) {
            canFindTripleDot = true;
        }
    }

    const isD_LessThan_C = endD < endC;
    const isPathBlockedAtD_or_D_minus_2 = (pathChars[endD - 2] === HASH_CHAR || pathChars[endD] === HASH_CHAR);
    const isPathBlockedAtB_or_B_minus_2 = (pathChars[startB - 2] === HASH_CHAR || pathChars[startB] === HASH_CHAR);

    if (isD_LessThan_C && isPathBlockedAtD_or_D_minus_2 && isPathBlockedAtB_or_B_minus_2 && !canFindTripleDot) {
        console.log("No");
        return 0;
    }

    console.log("Yes");
});
