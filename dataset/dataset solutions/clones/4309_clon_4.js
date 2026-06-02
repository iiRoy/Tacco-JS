const fileSystemModule = require('fs');

const processInputData = (inputContent) => {
    const contentLines = inputContent.split('\n');

    // The original code reads and converts contentLines[0] and contentLines[2] to numbers
    // but then discards them. This clone maintains that behavior by not using them.

    const generateCounts = (numberString) => {
        return numberString.split(' ').reduce((accumulator, currentNumberStr) => {
            const numericValue = Number(currentNumberStr);
            accumulator[numericValue] = (accumulator[numericValue] || 0) + 1;
            return accumulator;
        }, {});
    };

    const primaryCounts = generateCounts(contentLines[1]);
    const secondaryCounts = generateCounts(contentLines[3]);

    const checkInclusion = Object.entries(secondaryCounts).every(([itemKey, requiredCount]) => {
        const itemValue = Number(itemKey);
        const availableCount = primaryCounts[itemValue] || 0;
        return requiredCount <= availableCount;
    });

    console.log(checkInclusion ? "YES" : "NO");
};

processInputData(fileSystemModule.readFileSync("/dev/stdin", "UTF-8"));
