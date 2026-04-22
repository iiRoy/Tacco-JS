let textBuffer = [];

const rootProcessor = (collectedInput) => {
    const lineSeparator = '\n';
    const rawLines = collectedInput.trim().split(lineSeparator);

    const stackCount = parseInt(rawLines.shift(), 10);

    const storageMap = new Map();
    Array.from({ length: stackCount }, (_, indexValue) => indexValue + 1)
         .forEach(identifier => storageMap.set(identifier, []));

    const outputElements = [];
    const commandLines = rawLines;

    const executeNextCommand = (remainingCommands, currentOutputCollection) => {
        if (remainingCommands.length === 0) {
            return currentOutputCollection;
        }

        const currentCommand = remainingCommands[0];
        const furtherCommands = remainingCommands.slice(1);

        if (currentCommand.trim() === 'quit') {
            return currentOutputCollection;
        }

        const commandParts = currentCommand.split(' ');
        const operationKey = commandParts[0];

        switch (operationKey) {
            case 'push':
                const targetStackIdPush = parseInt(commandParts[1], 10);
                const itemToStore = commandParts[2];
                storageMap.get(targetStackIdPush).push(itemToStore);
                break;
            case 'move':
                const sourceStackIdMove = parseInt(commandParts[1], 10);
                const destinationStackIdMove = parseInt(commandParts[2], 10);
                const movedItem = storageMap.get(sourceStackIdMove).pop();
                storageMap.get(destinationStackIdMove).push(movedItem);
                break;
            case 'pop':
                const sourceStackIdPop = parseInt(commandParts[1], 10);
                const poppedItem = storageMap.get(sourceStackIdPop).pop();
                currentOutputCollection.push(poppedItem);
                break;
            default:
                break;
        }

        return executeNextCommand(furtherCommands, currentOutputCollection);
    };

    const finalOutput = executeNextCommand(commandLines, outputElements);

    finalOutput.forEach(resultItem => process.stdout.write(resultItem + '\n'));
};

process.stdin.on('data', (chunk) => {
    textBuffer.push(chunk.toString());
});

process.stdin.on('end', () => {
    rootProcessor(textBuffer.join(''));
});

process.stdin.resume();