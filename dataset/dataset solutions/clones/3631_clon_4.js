const fileSystem = require('fs');
const inputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputSegments = inputContent.trim().split('\n');

const firstLineValues = inputSegments[0].split(' ').map(Number);
const arrayLength = firstLineValues[0];
const modulusValue = firstLineValues[1];

const numericSequence = inputSegments[1].split(' ').map(Number);

const cumulativeRemainders = numericSequence.reduce((acc, currentElement) => {
    const previousRemainder = acc[acc.length - 1];
    const newRemainder = (previousRemainder + currentElement) % modulusValue;
    acc.push(newRemainder);
    return acc;
}, [0]); // Initialize with 0 for the empty prefix sum

const { finalResult } = cumulativeRemainders.reduce((context, currentRemainder) => {
    if (!context.remainderCounts[currentRemainder]) {
        context.remainderCounts[currentRemainder] = 0;
    }
    
    context.finalResult += context.remainderCounts[currentRemainder];
    context.remainderCounts[currentRemainder]++;
    
    return context;
}, { finalResult: 0, remainderCounts: {} });

console.log(finalResult);