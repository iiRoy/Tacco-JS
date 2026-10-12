const fs = require("fs");

const allInputContent = fs.readFileSync("/dev/stdin", "utf8");
const allTokens = allInputContent.split(/\s/);

let tokenIndex = 1;
let currentTokenValue;

while (tokenIndex < allTokens.length && (currentTokenValue = allTokens[tokenIndex]) !== undefined && currentTokenValue !== "") {
    const characterArray = currentTokenValue.split('');

    const sortedAscending = [...characterArray].sort((digitA, digitB) => Number(digitA) - Number(digitB));

    const smallestNumberString = sortedAscending.join('');

    const largestNumberString = [...sortedAscending].reverse().join('');

    const numLargest = Number(largestNumberString);
    const numSmallest = Number(smallestNumberString);

    const differenceResult = numLargest - numSmallest;

    console.log(differenceResult);

    tokenIndex++;
}
