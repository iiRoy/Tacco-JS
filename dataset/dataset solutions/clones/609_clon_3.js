process.stdin.resume();
process.stdin.setEncoding('utf8');

function canMatchLastChar(boardString, targetNameCharacters) {
    const boardLength = boardString.length;
    const nameCharCount = targetNameCharacters.length;

    if (nameCharCount === 0) {
        return false;
    }

    const lastCharIndexInName = nameCharCount - 1;
    const lastCharacterToMatch = targetNameCharacters[lastCharIndexInName];

    for (let offsetMultiplier = 0; offsetMultiplier < boardLength; offsetMultiplier++) {
        const boardPositionForLastChar = lastCharIndexInName + offsetMultiplier * lastCharIndexInName;

        if (boardPositionForLastChar < boardLength && boardString[boardPositionForLastChar] === lastCharacterToMatch) {
            return true;
        }
    }
    return false;
}

process.stdin.on('data', function(inputData) {
    const inputLines = inputData.split("\n");

    const numberOfBoards = parseInt(inputLines[0], 10);
    const searchTargetName = inputLines[1];
    const searchTargetNameChars = searchTargetName.split('');

    let successfulMatchesCount = 0;

    const firstBoardLine = 2;
    const lastBoardLineExclusive = numberOfBoards + firstBoardLine;

    for (let currentLineIndex = firstBoardLine; currentLineIndex < lastBoardLineExclusive; currentLineIndex++) {
        const currentBoardString = inputLines[currentLineIndex];

        if (canMatchLastChar(currentBoardString, searchTargetNameChars)) {
            successfulMatchesCount++;
        }
    }

    console.log(successfulMatchesCount);
});
