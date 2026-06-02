function checkHomogeneity(sequence) {
    if (sequence.length === 0) return true;
    const firstChar = sequence[0];
    for (let i = 1; i < sequence.length; i++) {
        if (sequence[i] !== firstChar) {
            return false;
        }
    }
    return true;
}

function determineMinTransformations(initialSequence) {
    const stateQueue = [[initialSequence, 0]];
    const visitedStates = new Set();
    visitedStates.add(initialSequence);

    let headPointer = 0;

    while (headPointer < stateQueue.length) {
        const [currentSequence, currentSteps] = stateQueue[headPointer++];

        if (checkHomogeneity(currentSequence)) {
            return currentSteps;
        }

        for (let i = 0; i < currentSequence.length - 1; i++) {
            const charA = currentSequence[i];
            const charB = currentSequence[i + 1];

            if (charA === charB) {
                continue;
            }

            const newColorDigit = String(3 - Number(charA) - Number(charB));

            const nextSequence = currentSequence.substring(0, i) +
                                 newColorDigit +
                                 newColorDigit +
                                 currentSequence.substring(i + 2);

            if (!visitedStates.has(nextSequence)) {
                visitedStates.add(nextSequence);
                stateQueue.push([nextSequence, currentSteps + 1]);
            }
        }
    }

    return "NA";
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split('\n');

const colorMapping = { 'r': '0', 'g': '1', 'b': '2' };

let currentLineIndex = 0;
while (true) {
    const rawInputLine = inputLines[currentLineIndex++];
    if (rawInputLine === "0") {
        break;
    }

    const processedSequence = rawInputLine.replace(/[rgb]/g, (match) => colorMapping[match]);

    const finalResult = determineMinTransformations(processedSequence);
    console.log(finalResult);
}
