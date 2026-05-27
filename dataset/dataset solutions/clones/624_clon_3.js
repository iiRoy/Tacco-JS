const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const trimmedInputContent = rawInputData.trim();
const inputLineArray = trimmedInputContent.split("\n");

const totalEntryCount = Number(inputLineArray.shift());

const aggregatedDataMap = {};

for (let currentIdx = 0; currentIdx < totalEntryCount; currentIdx++) {
   const currentLineParts = inputLineArray[currentIdx].split(" ");
   const currentKeyString = currentLineParts[0];
   const numericValueToAdd = parseInt(currentLineParts[1], 10);

   aggregatedDataMap[currentKeyString] = (aggregatedDataMap[currentKeyString] || 0) + numericValueToAdd;
}

const uniqueSortedKeys = Object.keys(aggregatedDataMap).sort();

let maximumKeyLength = 0;
maximumKeyLength = uniqueSortedKeys.reduce((currentMaxLen, keyItem) => {
    return Math.max(currentMaxLen, keyItem.length);
}, 0);

const allPossibleLengths = Array.from({ length: maximumKeyLength }, (_, index) => index + 1);

const finalOutputOrder = allPossibleLengths.flatMap(currentLengthValue => {
    return uniqueSortedKeys.filter(keyItem => keyItem.length === currentLengthValue);
});

finalOutputOrder.forEach(outputKey => {
    const associatedValue = aggregatedDataMap[outputKey];
    console.log(`${outputKey} ${associatedValue}`);
});
