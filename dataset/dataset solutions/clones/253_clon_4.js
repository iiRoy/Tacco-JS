const fileReader = require('node:fs');
const standardChannel = '/dev/stdin';

const rawData = fileReader.readFileSync(standardChannel, 'utf8');

const numericExtractor = /\d+(?=,\d+\n{0,}|$)/g;

let highestValue = -1;
const extractedTextualNumbers = rawData.match(numericExtractor) || [];

const processedNumericValues = extractedTextualNumbers.map(item => {
    const currentNumeric = Number(item);
    if (currentNumeric > highestValue) {
        highestValue = currentNumeric;
    }
    return currentNumeric;
});

const frequencyCounter = processedNumericValues.reduce((record, entry) => {
    record.set(entry, (record.get(entry) || 0) + 1);
    return record;
}, new Map());

Array.from({ length: highestValue + 1 }, (_, idx) => idx).forEach(testIndex => {
    const recordedCount = frequencyCounter.get(testIndex);
    if (recordedCount !== undefined && recordedCount > 1) {
        process.stdout.write(testIndex + ' ' + recordedCount + '\n');
    }
});