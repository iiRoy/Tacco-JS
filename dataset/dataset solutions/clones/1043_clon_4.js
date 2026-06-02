process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputBuffer) {
    const valueRegistry = new Map();

    const commandExecutors = {
        insert: (keyIdentifier) => {
            valueRegistry.set(keyIdentifier, true);
        },
        find: (keyIdentifier) => {
            console.log(valueRegistry.has(keyIdentifier) ? 'yes' : 'no');
        }
    };

    const operationList = inputBuffer.toString()
                                    .split('\n')
                                    .filter((currentLine, lineIndex) => lineIndex > 0 && currentLine.trim().length > 0)
                                    .map(currentLine => currentLine.trim().split(' '));

    for (const [operationType, operandValue] of operationList) {
        if (commandExecutors[operationType]) {
            commandExecutors[operationType](operandValue);
        }
    }
});
