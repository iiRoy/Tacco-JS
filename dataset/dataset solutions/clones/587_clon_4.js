const applyReduction = (sourceString) => {
    let currentWorkingString = sourceString;
    let changedInPass;
    do {
        changedInPass = false;
        let nextIterationString = '';
        let scanIndex = 0;
        while (scanIndex < currentWorkingString.length) {
            const currentCharacter = currentWorkingString[scanIndex];
            let segmentLength = 0;
            let lookAheadIndex = scanIndex;
            while (lookAheadIndex < currentWorkingString.length && currentWorkingString[lookAheadIndex] === currentCharacter) {
                segmentLength++;
                lookAheadIndex++;
            }

            if (segmentLength >= 4 && ['1', '2', '3'].includes(currentCharacter)) {
                changedInPass = true;
            } else {
                nextIterationString += currentWorkingString.substring(scanIndex, lookAheadIndex);
            }
            scanIndex = lookAheadIndex;
        }
        currentWorkingString = nextIterationString;
    } while (changedInPass);
    return currentWorkingString.length;
};

const manageInput = (allLines, currentLineIndex = 0, collectedResults = []) => {
    if (currentLineIndex >= allLines.length) {
        return collectedResults;
    }

    const blockItemCount = Number(allLines[currentLineIndex]);
    if (blockItemCount === 0) {
        return collectedResults;
    }

    const blockElements = [];
    for (let i = 1; i <= blockItemCount; i++) {
        blockElements.push(Number(allLines[currentLineIndex + i]));
    }

    const initialCombinedString = blockElements.join('');

    let smallestLengthInBlock = Infinity;

    const generatedStrings = Array.from({ length: blockItemCount }).flatMap((_, currentPos) => {
        const possibilities = [];
        const baseChars = initialCombinedString.split('');

        if (currentPos < blockItemCount) {
            const tempChars = [...baseChars];
            const replacementVal = blockElements[currentPos + 1];
            tempChars[currentPos] = String(replacementVal);
            possibilities.push(tempChars.join(''));
        }

        if (currentPos > 0) {
            const tempChars = [...baseChars];
            const replacementVal = blockElements[currentPos - 1];
            tempChars[currentPos] = String(replacementVal);
            possibilities.push(tempChars.join(''));
        }
        return possibilities;
    });

    generatedStrings.forEach(generatedStr => {
        const finalLength = applyReduction(generatedStr);
        if (finalLength < smallestLengthInBlock) {
            smallestLengthInBlock = finalLength;
        }
    });

    collectedResults.push(smallestLengthInBlock);

    return manageInput(allLines, currentLineIndex + blockItemCount + 1, collectedResults);
};

const rawData = require('node:fs').readFileSync(0, 'utf8');
const processedLines = rawData.trim().split('\n');

const finalResults = manageInput(processedLines);

finalResults.forEach(resultVal => {
    process.stdout.write(resultVal + '\n');
});