const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let processedLines = fileContent.trim().split("\n");
const initialCount = Number(processedLines.shift());
processedLines.sort((valA, valB) => Number(valA) - Number(valB));
const selectedNumbers = processedLines.slice(0, 5);
const resultCollection = selectedNumbers.flatMap((firstPart, firstIdx) => {
    return selectedNumbers.slice(firstIdx + 1).flatMap(secondPart => {
        const combinedOne = Number(firstPart + secondPart);
        const combinedTwo = Number(secondPart + firstPart);
        return [combinedOne, combinedTwo];
    });
});
resultCollection.sort((numA, numB) => numA - numB);
console.log(resultCollection[2]);
