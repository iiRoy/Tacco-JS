const fileSystemModule = require("fs");

let wordFrequencies = {};
let highestFrequency = 0;
let longestLength = 0;
let longestString = '';

const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const inputWords = rawInputContent.trim().split(' ');

inputWords.forEach(function(currentWord) {
    let currentWordCount;

    if (wordFrequencies[currentWord]) {
        wordFrequencies[currentWord]++;
        currentWordCount = wordFrequencies[currentWord];
    } else {
        wordFrequencies[currentWord] = 1;
        currentWordCount = 1;
    }

    if (currentWordCount > highestFrequency) {
        highestFrequency = currentWordCount;
    }

    const wordLength = currentWord.length;
    if (wordLength > longestLength) {
        longestLength = wordLength;
        longestString = currentWord;
    }
});

console.log(highestFrequency + ' ' + longestString);
