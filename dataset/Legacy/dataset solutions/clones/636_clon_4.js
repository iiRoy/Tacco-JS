const fs = require('fs');

const calculateDistances = (lineContent) => {
    const characters = lineContent.split('');

    const { resultSequence } = characters.reduce((accumulator, currentCharacter) => {
        let nextDistanceTracker = accumulator.distanceTracker;
        let valueForOutput;

        if (currentCharacter === 'c') {
            valueForOutput = 0;
            nextDistanceTracker = 1;
        } else { // Assuming only 'c' or '.' based on problem context
            valueForOutput = accumulator.distanceTracker;
            if (accumulator.distanceTracker !== -1) {
                nextDistanceTracker++;
            }
        }

        accumulator.resultSequence.push(valueForOutput);
        accumulator.distanceTracker = nextDistanceTracker;
        return accumulator;
    }, { distanceTracker: -1, resultSequence: [] });

    return resultSequence.join(' ');
};

const rawInput = fs.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInput.trim().split('\n');
processedLines.shift(); // Discard the first line as per original logic

const finalOutputLines = processedLines.map(calculateDistances);

console.log(finalOutputLines.join('\n'));
