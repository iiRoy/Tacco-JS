const sourceTextContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const computedSumsCollection = [];

const rawInputLines = sourceTextContent.split('\n');

for (const currentLineFragment of rawInputLines) {
    const trimmedLine = currentLineFragment.trim();

    if (trimmedLine.length === 0) {
        continue;
    }

    if (trimmedLine === '0') {
        break;
    }

    const digitValues = Array.from(trimmedLine).map(Number);

    let lineSumAccumulator = 0;

    for (const digit of digitValues) {
        lineSumAccumulator += digit;
    }

    computedSumsCollection.push(lineSumAccumulator.toString());
}

const finalConsolidatedOutput = computedSumsCollection.join('\n');

console.log(finalConsolidatedOutput.trim());