const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const initialSequence = rawInputContent.trim().replace(/(egg|chicken)/g, (matchedPart) => {
    return matchedPart === 'egg' ? 'E' : 'C';
});

let expandedSequenceChars = [];
for (let charIndex = 0; charIndex < initialSequence.length; charIndex++) {
    expandedSequenceChars.push(initialSequence[charIndex]);
    if (charIndex < initialSequence.length - 1 && initialSequence[charIndex] === initialSequence[charIndex + 1]) {
        expandedSequenceChars.push('A');
    }
}
const fullyExpandedSequence = expandedSequenceChars.join('');

const segments = fullyExpandedSequence.split('A');
const longestSegment = segments.reduce((currentLongest, currentSegment) => {
    return currentSegment.length > currentLongest.length ? currentSegment : currentLongest;
}, '');

console.log(longestSegment.endsWith('E') ? 'egg' : 'chicken');
