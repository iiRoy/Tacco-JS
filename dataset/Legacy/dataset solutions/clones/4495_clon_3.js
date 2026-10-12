process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
    let dataBuffer = process.stdin.read();
    let processedLines;

    if (dataBuffer !== null) {
        processedLines = dataBuffer.split('\n');

        const lastLineIdx = processedLines.length - 1;
        if (processedLines[lastLineIdx] === '') {
            processedLines.pop();
        }

        const firstLineTokens = processedLines[0].split(' ');
        const rawInputString = firstLineTokens[0];

        const initialStringLen = rawInputString.length;
        const processedInputForSolver = rawInputString.slice(0, initialStringLen - 1);

        console.log(solve(processedInputForSolver));
    }
});

function solve(targetString) {
    const currentLength = targetString.length;

    if (currentLength === 0) {
        return 0;
    }

    if (currentLength % 2 !== 0) {
        const stringWithoutLastChar = targetString.slice(0, currentLength - 1);
        return solve(stringWithoutLastChar);
    }

    const halfLength = currentLength / 2;
    let areHalvesIdentical = true;

    for (let charIdx = 0; charIdx < halfLength; charIdx++) {
        if (targetString[charIdx] !== targetString[charIdx + halfLength]) {
            areHalvesIdentical = false;
            break;
        }
    }

    if (areHalvesIdentical) {
        return currentLength;
    } else {
        const stringWithoutLastTwoChars = targetString.slice(0, currentLength - 2);
        return solve(stringWithoutLastTwoChars);
    }
}
