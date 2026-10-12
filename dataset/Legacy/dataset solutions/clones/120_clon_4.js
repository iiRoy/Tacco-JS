const fileSystem = require("fs");

const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const tokenArray = rawInputContent.split(' ');

const initialStats = {
    wordFrequencies: new Map(),
    highestFrequency: 0,
    topWord: '',
    lengthiestWord: 0
};

const finalStats = tokenArray.reduce((statsAccumulator, currentWord) => {
    const currentWordCount = (statsAccumulator.wordFrequencies.get(currentWord) || 0) + 1;
    statsAccumulator.wordFrequencies.set(currentWord, currentWordCount);

    if (currentWordCount > statsAccumulator.highestFrequency) {
        statsAccumulator.highestFrequency = currentWordCount;
        statsAccumulator.topWord = currentWord;
    }

    if (currentWord.length > statsAccumulator.lengthiestWord.length) {
        statsAccumulator.lengthiestWord = currentWord;
    }

    return statsAccumulator;
}, initialStats);

console.log(finalStats.topWord + ' ' + finalStats.lengthiestWord);
