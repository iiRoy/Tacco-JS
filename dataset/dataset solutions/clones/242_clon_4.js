const fileSystem = require('fs');

const processLineData = (currentLine) => {
    const numericStrings = currentLine.split(" ");
    const [firstValue, secondValue, thirdValue] = numericStrings.map(Number);

    const excludedSet = new Set([firstValue, secondValue, thirdValue]);

    const possibleThirdCards = Array.from({ length: 10 }, (_, index) => index + 1)
        .filter(candidateCard => !excludedSet.has(candidateCard));

    const targetSumLimit = 20;
    const initialSum = firstValue + secondValue;

    const successfulCombinations = possibleThirdCards.reduce((countAccumulator, currentCard) => {
        return countAccumulator + (initialSum + currentCard <= targetSumLimit ? 1 : 0);
    }, 0);

    const totalPossibleCards = possibleThirdCards.length;
    const unsuccessfulCombinations = totalPossibleCards - successfulCombinations;

    return successfulCombinations >= unsuccessfulCombinations ? "YES" : "NO";
};

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split("\n");

const outputResults = inputLines.map(processLineData);

console.log(outputResults.join("\n"));
