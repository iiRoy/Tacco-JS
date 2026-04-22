const fileSystemUtility = require('fs');

const arrangeNumericValues = (inputContent) => {
    const rawTokens = inputContent.split(" ");
    
    const tokenComparator = (firstElement, secondElement) => {
        const numFirst = Number(firstElement);
        const numSecond = Number(secondElement);

        if (isNaN(numFirst) && isNaN(numSecond)) return 0;
        if (isNaN(numFirst)) return 1;
        if (isNaN(numSecond)) return -1;

        return numSecond - numFirst;
    };

    const totalElements = rawTokens.length;
    for (let currentPosition = 1; currentPosition < totalElements; currentPosition++) {
        let keyElement = rawTokens[currentPosition];
        let comparisonIndex = currentPosition - 1;

        while (comparisonIndex >= 0 && tokenComparator(rawTokens[comparisonIndex], keyElement) > 0) {
            rawTokens[comparisonIndex + 1] = rawTokens[comparisonIndex];
            comparisonIndex = comparisonIndex - 1;
        }
        rawTokens[comparisonIndex + 1] = keyElement;
    }

    const outputSequence = rawTokens.reduce((accumulatorString, currentToken, tokenIndex) => {
        return accumulatorString + currentToken + (tokenIndex < rawTokens.length - 1 ? ' ' : '');
    }, '');

    console.log(outputSequence);
};

const acquireContentFromPath = (sourcePath) => {
    fileSystemUtility.readFile(sourcePath, 'utf8', (readError, fileData) => {
        if (readError) {
            console.error("Content acquisition error:", readError);
            return;
        }
        arrangeNumericValues(fileData);
    });
};

const acquireContentFromStandardInput = () => {
    const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    arrangeNumericValues(inputData);
};

let designatedInputSource = "";

if (global.process.argv.length > 2) {
    designatedInputSource = global.process.argv[2];
    acquireContentFromPath(designatedInputSource);
} else {
    acquireContentFromStandardInput();
}