let wordFrequencies = [],
    highestFrequency = 0,
    greatestLength = 0,
    longestWordFound = '';

require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
    .split(' ')
    .some(function(currentInputToken) {
        wordFrequencies[currentInputToken]
            ? (
                ++wordFrequencies[currentInputToken] > highestFrequency
                    ? highestFrequency = wordFrequencies[currentInputToken]
                    : 0
            )
            : (wordFrequencies[currentInputToken] = 1);

        let tokenLength = currentInputToken.length;
        tokenLength > greatestLength
            ? (longestWordFound = currentInputToken, greatestLength = tokenLength)
            : 0;
    });

console.log(highestFrequency + ' ' + longestWordFound);
