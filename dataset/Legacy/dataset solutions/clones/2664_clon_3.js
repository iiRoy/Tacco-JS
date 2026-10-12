const getSortedAnagramKey = (charArray) => {
    const sortedChars = charArray.sort();
    return sortedChars.join('');
};

const sumNumericValues = (currentAccumulator, valueToAdd) => {
    return currentAccumulator + valueToAdd;
};

const processStrings = (totalStringCount, stringDataArray) => {
    if (totalStringCount === 0) {
        return 0;
    }

    const frequencyMap = {};
    for (let stringIndex = 0; stringIndex < totalStringCount; stringIndex++) {
        const currentStringCharacters = stringDataArray[stringIndex];
        const anagramIdentifier = getSortedAnagramKey(currentStringCharacters);

        if (frequencyMap[anagramIdentifier]) {
            frequencyMap[anagramIdentifier]++;
        } else {
            frequencyMap[anagramIdentifier] = 1;
        }
    }

    const transformedCounts = {};
    for (const key in frequencyMap) {
        const currentFrequency = frequencyMap[key];
        if (currentFrequency >= 2) {
            transformedCounts[key] = 1;
        } else {
            transformedCounts[key] = NaN;
        }
    }

    const allResultValues = Object.values(transformedCounts);
    const filteredValidValues = allResultValues.filter(val => !Number.isNaN(val));
    const finalSum = filteredValidValues.reduce(sumNumericValues, 0);

    return finalSum;
};

const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.split("\n");

const parseStringToArray = (lineContent) => {
    return Array.from(lineContent);
};

const numberOfStrings = Number(inputLines[0]);
const stringDataForProcessing = inputLines.slice(1).map(parseStringToArray);

console.log(processStrings(numberOfStrings, stringDataForProcessing));
