const fileSystemModule = require('fs');

const processInputLines = (rawContent) => {
    const dataLines = rawContent.trim().split('\n');

    const computedValues = dataLines.map(singleLine => {
        const numericValue = Number(singleLine);

        // Calculate the sum of integers from 1 up to numericValue
        // This replaces the direct formula 1/2 * n * (n-1)
        // For numericValue = k, the original calculates (k+1)*k/2
        // We calculate sum(1 to k) which is also k*(k+1)/2
        let cumulativeSum = 0;
        for (let iterator = 1; iterator <= numericValue; iterator++) {
            cumulativeSum += iterator;
        }
        
        // Add 1 to the calculated sum, matching the original's final operation
        return cumulativeSum + 1;
    });

    return computedValues.join('\n');
};

const rawFileContents = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const finalResultString = processInputLines(rawFileContents);
console.log(finalResultString);
