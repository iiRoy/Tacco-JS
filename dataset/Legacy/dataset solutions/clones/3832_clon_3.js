const inputLines = [];
const ioModule = require('readline');

const inputReader = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', (currentLine) => {
    inputLines.push(currentLine);
});

inputReader.on('close', () => {
    const inputStringChars = inputLines[0].split("");
    const targetIndex = +inputLines[1];

    const stringLength = inputStringChars.length;
    const targetZeroIndex = targetIndex - 1;

    const substringMatrix = new Array(stringLength);
    for (let i = 0; i < stringLength; i++) {
        substringMatrix[i] = new Array(stringLength + 1).fill("");
    }

    const uniqueSubstringsSet = new Set();

    for (let startIndex = 0; startIndex < stringLength; startIndex++) {
        for (let endIndex = startIndex; endIndex < stringLength; endIndex++) {
            const currentSubsegment = substringMatrix[startIndex][endIndex];

            if (targetIndex <= currentSubsegment.length) {
                break;
            } else {
                const nextSubsegment = currentSubsegment + inputStringChars[endIndex];
                substringMatrix[startIndex][endIndex + 1] = nextSubsegment;
                uniqueSubstringsSet.add(nextSubsegment);
            }
        }
    }

    const uniqueSubstrings = Array.from(uniqueSubstringsSet);

    uniqueSubstrings.sort();
    console.log(uniqueSubstrings[targetZeroIndex]);
});
