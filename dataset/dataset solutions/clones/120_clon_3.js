const fileSystem = require("fs");

let tokenCounts = [];
let highestCount = 0;
let mostFrequentToken = 0;
let longestTokenPlaceholder = 0;

const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputTokens = rawInputContent.split(' ');

inputTokens.map(function(currentToken) {
    if (tokenCounts[currentToken]) {
        tokenCounts[currentToken]++;
        if (tokenCounts[currentToken] > highestCount) {
            highestCount = tokenCounts[currentToken];
            mostFrequentToken = currentToken;
        }
    } else {
        tokenCounts[currentToken] = 1;
    }

    if (currentToken.length > longestTokenPlaceholder.length) {
        longestTokenPlaceholder = currentToken;
    }
});

console.log(mostFrequentToken + ' ' + longestTokenPlaceholder);
