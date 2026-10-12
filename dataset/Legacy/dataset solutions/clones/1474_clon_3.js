(function(rawData) {
    const getZeroBasedStackIndex = (argString) => parseInt(argString, 10) - 1;

    const inputLines = rawData.split('\n');
    const numStacks = parseInt(inputLines.shift(), 10);

    const dataStacks = Array.from({ length: numStacks }, () => []);

    while (true) {
        const currentCommandParts = inputLines.shift().split(' ');
        const operationType = currentCommandParts[0];

        if (operationType === 'quit') {
            return;
        }

        const firstArg = currentCommandParts[1];
        const secondArg = currentCommandParts[2];

        const primaryStackIndex = getZeroBasedStackIndex(firstArg);

        switch (operationType) {
            case 'push':
                dataStacks[primaryStackIndex].push(secondArg);
                break;
            case 'pop':
                const poppedItem = dataStacks[primaryStackIndex].pop();
                console.log(poppedItem);
                break;
            default:
                const sourceStackIdx = primaryStackIndex;
                const destinationStackIdx = getZeroBasedStackIndex(secondArg);

                const itemToTransfer = dataStacks[sourceStackIdx].pop();
                dataStacks[destinationStackIdx].push(itemToTransfer);
                break;
        }
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
