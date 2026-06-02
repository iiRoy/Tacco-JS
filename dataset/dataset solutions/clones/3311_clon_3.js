const processInput = (rawData) => {
    const parsedLines = rawData.trim().split("\n");
    const sourceStringParts = parsedLines[0].split(" ");
    const targetStringParts = parsedLines[1].split(" ");

    const sourceChars = sourceStringParts[0].split("");
    const targetChars = targetStringParts[0].split("");

    const targetLength = targetChars.length;
    const sourceLength = sourceChars.length;

    const dpMatrix = Array.from({ length: targetLength + 1 }, () => Array(sourceLength + 1).fill(0));

    for (let targetRowIndex = 0; targetRowIndex < targetLength; targetRowIndex++) {
        for (let sourceColIndex = 0; sourceColIndex < sourceLength; sourceColIndex++) {
            if (sourceChars[sourceColIndex] === targetChars[targetRowIndex]) {
                dpMatrix[targetRowIndex + 1][sourceColIndex + 1] = dpMatrix[targetRowIndex][sourceColIndex] + 1;
            } else {
                dpMatrix[targetRowIndex + 1][sourceColIndex + 1] = Math.max(
                    dpMatrix[targetRowIndex + 1][sourceColIndex],
                    dpMatrix[targetRowIndex][sourceColIndex + 1]
                );
            }
        }
    }

    const lcsLength = dpMatrix[targetLength][sourceLength];
    let currentTargetRow = targetLength;
    let currentSourceCol = sourceLength;
    const resultCharacters = [];

    const findContributingSourceIndex = (row, startCol, dpTable) => {
        for (let col = startCol; col >= 1; col--) {
            if (dpTable[row][col] > dpTable[row][col - 1]) {
                return col - 1;
            }
        }
        return -1;
    };

    const findMatchingTargetIndex = (charToLocate, startRow, targetArray) => {
        for (let row = startRow; row >= 1; row--) {
            if (targetArray[row - 1] === charToLocate) {
                return row - 1;
            }
        }
        return -1;
    };

    for (let k = 0; k < lcsLength; k++) {
        const contributingSourceIndex = findContributingSourceIndex(currentTargetRow, currentSourceCol, dpMatrix);
        currentSourceCol = contributingSourceIndex;

        const matchedCharacter = sourceChars[contributingSourceIndex];

        const matchingTargetIndex = findMatchingTargetIndex(matchedCharacter, currentTargetRow, targetChars);
        resultCharacters.push(matchedCharacter);
        currentTargetRow = matchingTargetIndex;
    }

    console.log(resultCharacters.reverse().join(""));
};

const readStdinContent = () => require("fs").readFileSync("/dev/stdin", "utf8");

processInput(readStdinContent());
