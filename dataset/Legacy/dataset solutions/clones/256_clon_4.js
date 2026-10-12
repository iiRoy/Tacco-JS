const fileSystem = require('fs');
const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const parseNumericList = (textBlock) => {
    return textBlock.split('\n')
                     .map(line => Number.parseInt(line.split(',')[0], 10));
};

const trimmedInput = rawContent.trim();
const blockSeparatorIndex = trimmedInput.indexOf('\n\n');

const firstBlockText = trimmedInput.substring(0, blockSeparatorIndex);
const secondBlockText = trimmedInput.substring(blockSeparatorIndex + 2);

const firstNumList = parseNumericList(firstBlockText);
const secondNumList = parseNumericList(secondBlockText);

const getElementFrequencies = (numberArray) => {
    return numberArray.reduce((accMap, currentNum) => {
        accMap.set(currentNum, (accMap.get(currentNum) || 0) + 1);
        return accMap;
    }, new Map());
};

const firstListFrequencies = getElementFrequencies(firstNumList);
const secondListFrequencies = getElementFrequencies(secondNumList);

const combinedCounts = new Map();

for (const currentKey of firstListFrequencies.keys()) {
    if (secondListFrequencies.has(currentKey)) {
        const totalOccurrences = firstListFrequencies.get(currentKey) + secondListFrequencies.get(currentKey);
        combinedCounts.set(currentKey, totalOccurrences);
    }
}

Array.from(combinedCounts.entries())
     .sort((pairA, pairB) => pairA[0] - pairB[0])
     .forEach(pair => {
         console.log(`${pair[0]} ${pair[1]}`);
     });
