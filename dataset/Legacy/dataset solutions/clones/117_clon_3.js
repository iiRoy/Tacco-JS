const fileSystem = require("fs");

let wordFrequenciesMap = {};
let currentMaxFrequency = 0;
let currentMaxWordLength = 0;
let wordWithHighestFrequency = '';
let longestEncounteredWord = '';

const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const processedWords = rawInputContent.trim().split(' ');

processedWords.forEach((wordItem) => {
    let wordCountInMap = wordFrequenciesMap[wordItem];

    if (wordCountInMap === undefined) {
        wordFrequenciesMap[wordItem] = 1;
    } else {
        wordFrequenciesMap[wordItem]++;
    }

    const updatedFrequency = wordFrequenciesMap[wordItem];
    if (updatedFrequency > currentMaxFrequency) {
        currentMaxFrequency = updatedFrequency;
        wordWithHighestFrequency = wordItem;
    }

    const lengthOfCurrentWord = wordItem.length;
    if (lengthOfCurrentWord > currentMaxWordLength) {
        currentMaxWordLength = lengthOfCurrentWord;
        longestEncounteredWord = wordItem;
    }
});

console.log(wordWithHighestFrequency + ' ' + longestEncounteredWord);
