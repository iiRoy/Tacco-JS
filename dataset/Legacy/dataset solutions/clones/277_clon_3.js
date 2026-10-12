const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const cleanedInputContent = rawInputContent.replace(/,/g, "").trim();
const inputTokens = cleanedInputContent.split(/\s/);

const finalSegments = [];
let currentAccumulatedSegment = "";

const isTokenLengthWithinRange = (lengthValue) => {
    const MIN_LENGTH = 3;
    const MAX_LENGTH = 6;
    return lengthValue >= MIN_LENGTH && lengthValue <= MAX_LENGTH;
};

for (let tokenIndex = 0; tokenIndex < inputTokens.length; tokenIndex++) {
    const currentToken = inputTokens[tokenIndex];
    const tokenWithoutDots = currentToken.replace(/\./g, "");

    const tokenContainsDot = tokenWithoutDots.length < currentToken.length;

    if (tokenContainsDot) {
        console.log("x[i] : " + currentToken);

        if (isTokenLengthWithinRange(tokenWithoutDots.length)) {
            const dotIsAtEnd = currentToken.indexOf('.') === currentToken.length - 1;

            if (dotIsAtEnd) {
                currentAccumulatedSegment += tokenWithoutDots;
                finalSegments.push(currentAccumulatedSegment);
            } else {
                currentAccumulatedSegment += currentToken;
            }
        } else {
            currentAccumulatedSegment = "";
        }
    } else {
        if (isTokenLengthWithinRange(currentToken.length)) {
            currentAccumulatedSegment += currentToken + " ";
        }
    }
}

for (let outputIndex = 0; outputIndex < finalSegments.length; outputIndex++) {
    console.log(finalSegments[outputIndex]);
}
