const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = rawData.trim().split('\n');

const [entryCount, comparisonLimit] = allInputLines.shift().split(' ').map(Number);

const defaultPhrase = "kogakubu10gokan";

const resultPhrase = allInputLines.slice(0, entryCount).reduce((currentAccumulator, currentLineSegment) => {
    const lineComponents = currentLineSegment.split(' ');
    const numericalComponent = Number(lineComponents[0]);
    const textualComponent = lineComponents[1];

    if (numericalComponent <= comparisonLimit) {
        return textualComponent;
    }
    return currentAccumulator;
}, defaultPhrase);

console.log(resultPhrase);
