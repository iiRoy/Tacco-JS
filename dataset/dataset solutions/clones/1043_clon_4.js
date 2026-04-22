process.stdin.resume();
process.stdin.setEncoding('utf8');

const repositoryOfItems = new Set();

const handleIncomingData = (incomingBuffer) => {
    const textContent = String(incomingBuffer).trim();

    const allLines = textContent.match(/^(.*)$/gm);
    if (!allLines || allLines.length <= 1) {
        return;
    }
    const executableLines = allLines.slice(1);

    const operationHandlers = {
        'insert': (valueToStore) => repositoryOfItems.add(valueToStore),
        'find': (valueToLocate) => console.log(repositoryOfItems.has(valueToLocate) ? 'yes' : 'no')
    };

    const processNextInstruction = (instructionQueue) => {
        if (instructionQueue.length === 0) {
            return;
        }

        const [currentInstructionText, ...remainingInstructions] = instructionQueue;

        const instructionParts = currentInstructionText.match(/^(\S+)(?:\s+(\S+))?$/);

        if (instructionParts && instructionParts.length >= 2) {
            const commandKey = instructionParts[1];
            const argumentValue = instructionParts[2];

            const handler = operationHandlers[commandKey];
            if (handler) {
                handler(argumentValue);
            }
        }
        
        processNextInstruction(remainingInstructions);
    };

    processNextInstruction(executableLines);
};

process.stdin.on('data', handleIncomingData);