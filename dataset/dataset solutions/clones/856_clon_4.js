const moduleSystem = require('fs');
const rawDataStream = moduleSystem.readFileSync('/dev/stdin', 'utf8');

const preparedLines = rawDataStream.trim().split('\n');

const entryCount = parseInt(preparedLines.shift(), 10);

let currentTally = 0;
let encounteredInvalidSequence = false;

const relevantEntries = preparedLines.slice(0, entryCount);

for (const singleEntry of relevantEntries) {
    const components = singleEntry.split(' ');
    const symbolToken = components[0];
    const numericalValue = parseInt(components[1], 10);

    if (symbolToken === '(') {
        currentTally += numericalValue;
    } else if (symbolToken === ')') {
        currentTally -= numericalValue;
    }

    if (currentTally < 0) {
        encounteredInvalidSequence = true;
        break;
    }
}

if (encounteredInvalidSequence || currentTally !== 0) {
    console.log("NO");
} else {
    console.log("YES");
}