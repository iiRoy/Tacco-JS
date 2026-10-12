let wordCounts = {};
let maxFrequency = 0;
let wordWithMaxFrequency = 0;
let maxLengthFound = 0;
let wordWithMaxLength = 0;

function analyzeTextData() {
    const fileSystemHandler = require("fs");
    const rawInputString = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
    const processedWords = rawInputString.split(' ');

    processedWords.forEach(function(currentWordToken) {
        let currentTokenFrequency;

        if (wordCounts[currentWordToken]) {
            wordCounts[currentWordToken]++;
            currentTokenFrequency = wordCounts[currentWordToken];
        } else {
            wordCounts[currentWordToken] = 1;
            currentTokenFrequency = 1;
        }

        if (currentTokenFrequency > maxFrequency) {
            maxFrequency = currentTokenFrequency;
            wordWithMaxFrequency = currentWordToken;
        }

        const tokenLength = currentWordToken.length;
        if (tokenLength > maxLengthFound) {
            maxLengthFound = tokenLength;
            wordWithMaxLength = currentWordToken;
        }
    });

    console.log(wordWithMaxFrequency + ' ' + wordWithMaxLength);
}

analyzeTextData();
