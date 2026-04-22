const fileSystem = require('node:fs');
const allContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const initialSegment = allContent.substring(0, allContent.indexOf('\n'));

let dividerPosition = initialSegment.indexOf(' ');
let firstNumericValue = parseInt(initialSegment.substring(0, dividerPosition), 10);
let secondNumericValue = parseInt(initialSegment.substring(dividerPosition + 1), 10);

const finalStartPoint = firstNumericValue & ~1;

const resultCollection = Array.from({ length: secondNumericValue }, (unused, indexOffset) => {
    const currentCount = indexOffset + 1;
    const calculatedValue = finalStartPoint - indexOffset;
    return `${currentCount} ${calculatedValue}`;
});

process.stdout.write(resultCollection.join('\n') + '\n');