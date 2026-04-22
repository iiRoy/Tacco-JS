const inputReader = require('readline');

const termA = 'apple';
const termB = 'peach';

const termSwapper = new Map();
termSwapper.set(termA, termB);
termSwapper.set(termB, termA);

function processContentSegment(originalSegment) {
    let currentScanIndex = 0;
    const resultingFragments = [];

    while (currentScanIndex < originalSegment.length) {
        let nextMatchIndex = -1;
        let matchedTerm = '';
        let matchedTermLength = 0;

        const nextA = originalSegment.indexOf(termA, currentScanIndex);
        const nextB = originalSegment.indexOf(termB, currentScanIndex);

        if (nextA === -1 && nextB === -1) {
            resultingFragments.push(originalSegment.substring(currentScanIndex));
            break;
        } else if (nextA !== -1 && (nextB === -1 || nextA < nextB)) {
            nextMatchIndex = nextA;
            matchedTerm = termA;
            matchedTermLength = termA.length;
        } else {
            nextMatchIndex = nextB;
            matchedTerm = termB;
            matchedTermLength = termB.length;
        }

        if (nextMatchIndex > currentScanIndex) {
            resultingFragments.push(originalSegment.substring(currentScanIndex, nextMatchIndex));
        }

        resultingFragments.push(termSwapper.get(matchedTerm));

        currentScanIndex = nextMatchIndex + matchedTermLength;
    }

    return resultingFragments.join('');
}

const lineProcessor = inputReader.createInterface({
    input: process.stdin,
    terminal: false
});

lineProcessor.on('line', (currentInputLine) => {
    const transformedLine = processContentSegment(currentInputLine);
    console.log(transformedLine);
});

lineProcessor.on('close', () => {
    // Input stream ended, no further action required for this problem.
});