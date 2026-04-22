const retrieveContent = require('fs').readFileSync;

const processInstructions = (rawData) => {
    const instructionLines = rawData.trim().split('\n');
    const operationalInstructions = instructionLines.slice(1);

    const operationRegistry = {
        'insert': (currentSequence, val) => [val, ...currentSequence],
        'delete': (currentSequence) => [...currentSequence], // Original 'delete' was commented out, effectively doing nothing
        'deleteFirst': (currentSequence) => currentSequence.slice(1),
        'deleteLast': (currentSequence) => currentSequence.slice(0, -1)
    };

    const finalSequenceState = operationalInstructions.reduce((seq, currentLine) => {
        const parts = currentLine.split(' ');
        const commandAction = parts[0];
        const commandValue = parseInt(parts[1], 10);

        const handler = operationRegistry[commandAction];

        if (handler) {
            if (commandAction === 'insert') {
                return handler(seq, commandValue);
            }
            return handler(seq);
        }
        return seq;
    }, []);

    return finalSequenceState.join(' ');
};

const entireInput = retrieveContent('/dev/stdin', 'utf8');
const outputResult = processInstructions(entireInput);

console.log(outputResult);