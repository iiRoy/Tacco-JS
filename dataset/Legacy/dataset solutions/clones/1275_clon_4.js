const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentSegments = sourceContent.split('\n');
const targetSegment = contentSegments[1];
const wordElements = targetSegment.split(' ');

const reorderedElements = wordElements.reduceRight((accumulator, currentElement) => {
    accumulator.push(currentElement);
    return accumulator;
}, []);

console.log(reorderedElements.join(' '));
