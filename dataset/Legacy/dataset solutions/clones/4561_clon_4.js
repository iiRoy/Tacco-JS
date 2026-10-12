const sourceContent = require('fs').readFileSync(0, 'utf8');
const allInputLines = sourceContent.split('\n');

const [boxHeight, boxWidth] = allInputLines[0].split(' ').map(Number);

const frameBoundary = '#'.repeat(boxWidth + 2);

const contentRows = allInputLines.slice(1, boxHeight + 1)
                                 .map(lineData => `#${lineData}#`);

const finalOutputSegments = [
    frameBoundary,
    ...contentRows,
    frameBoundary
];

console.log(finalOutputSegments.join('\n'));
