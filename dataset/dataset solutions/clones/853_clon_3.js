(function() {
    const fileSystem = require('fs');
    const standardInputPath = '/dev/stdin';

    const rawInputContent = fileSystem.readFileSync(standardInputPath, 'utf8');

    const trimmedInput = rawInputContent.trim();
    const inputLines = trimmedInput.split("\n");

    let entryCount = Number(inputLines.shift());

    let lastProcessedChar = "";
    const processedSequence = [];

    for (let k = 0; k < entryCount; k++) {
        const currentLine = inputLines[k];
        const currentLineParts = currentLine.split(" ");
        const charValue = currentLineParts[0];
        const numericValue = Number(currentLineParts[1]);

        const isCharSameAsPrevious = (lastProcessedChar === charValue);

        if (isCharSameAsPrevious) {
            const lastNumericElementIndex = processedSequence.length - 1;
            processedSequence[lastNumericElementIndex] += numericValue;
        } else {
            processedSequence.push(charValue);
            processedSequence.push(numericValue);
            lastProcessedChar = charValue;
        }
    }

    const OPEN_PAREN_CHAR = "(";
    const CLOSE_PAREN_CHAR = ")";

    const validateSequenceBlock = (sequenceArray, blockStartIndex) => {
        const firstItemInBlock = sequenceArray[blockStartIndex];
        const countValueInBlock = sequenceArray[blockStartIndex + 1];
        const thirdItemInBlock = sequenceArray[blockStartIndex + 2];
        const finalItemInBlock = sequenceArray[blockStartIndex + 3];

        const isFirstItemOpenParen = (firstItemInBlock === OPEN_PAREN_CHAR);
        const isThirdItemCloseParen = (thirdItemInBlock === CLOSE_PAREN_CHAR);
        const doesCountMatchFinal = (finalItemInBlock === countValueInBlock);

        if (!isFirstItemOpenParen) {
            return false;
        }
        if (!isThirdItemCloseParen) {
            return false;
        }
        if (!doesCountMatchFinal) {
            return false;
        }
        return true;
    };

    for (let k = 0; k < processedSequence.length; k += 4) {
        if (!validateSequenceBlock(processedSequence, k)) {
            return console.log("NO");
        }
    }

    console.log("YES");
})();
