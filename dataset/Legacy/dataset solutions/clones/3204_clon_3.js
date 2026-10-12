function processInputData(rawData) {
    const trimmedInput = rawData.trim();
    const whitespaceDelimiter = /\s+/;
    const splitItems = trimmedInput.split(whitespaceDelimiter);

    const numericValues = splitItems.map(itemString => parseInt(itemString, 10));

    let frequencyCounts = new Array(4).fill(0);

    for (const currentVal of numericValues) {
        frequencyCounts[currentVal - 1]++;
    }

    frequencyCounts.sort((a, b) => a - b);

    const requiredDistribution = [1, 1, 2, 2];

    const isPatternMatched = frequencyCounts.every((count, index) => count === requiredDistribution[index]);

    console.log(isPatternMatched ? 'YES' : 'NO');
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInputData(fileContent);
