const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";

const calculateMatchingCharacterCount = (firstSequence, secondSequence) => {
    let currentMatchTally = 0;
    const sequenceLength = firstSequence.length;

    for (let positionIndex = 0; positionIndex < sequenceLength; positionIndex++) {
        const charA = firstSequence[positionIndex];
        const charB = secondSequence[positionIndex];

        if (charA === charB) {
            currentMatchTally = currentMatchTally + 1;
        }
    }
    return currentMatchTally;
};

const processInputData = (rawInputContent) => {
    const contentLines = rawInputContent.split('\n');
    const lineOneString = contentLines[0];
    const lineTwoString = contentLines[1];

    const charactersOfLineOne = lineOneString.split('');
    const charactersOfLineTwo = lineTwoString.split('');

    const finalMatchResult = calculateMatchingCharacterCount(charactersOfLineOne, charactersOfLineTwo);

    console.log(finalMatchResult);
};

const fileBuffer = fileSystemModule.readFileSync(standardInputFilePath, "utf8");
processInputData(fileBuffer);
