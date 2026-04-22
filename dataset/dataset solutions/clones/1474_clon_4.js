(function(receivedText) {
    const processedLines = receivedText.split('\n');
    const totalStacks = Number(processedLines.shift());

    const dataContainers = new Map();
    for (let idx = 1; idx <= totalStacks; idx++) {
        dataContainers.set(idx, []);
    }

    const processNextOperation = (remainingInstructions, currentStorageSchema) => {
        if (remainingInstructions.length === 0) {
            return;
        }

        const currentInstructionLine = remainingInstructions[0];
        const tailInstructions = remainingInstructions.slice(1);

        const currentInstructionParts = currentInstructionLine.split(' ');
        const actionVerb = currentInstructionParts[0];
        const operandOne = Number(currentInstructionParts[1]);
        const operandTwo = currentInstructionParts[2];

        switch (actionVerb) {
            case 'push':
                currentStorageSchema.get(operandOne).push(operandTwo);
                break;
            case 'pop':
                console.log(currentStorageSchema.get(operandOne).pop());
                break;
            case 'move':
                const transferredElement = currentStorageSchema.get(operandOne).pop();
                currentStorageSchema.get(Number(operandTwo)).push(transferredElement);
                break;
            case 'quit':
                return;
        }

        processNextOperation(tailInstructions, currentStorageSchema);
    };

    processNextOperation(processedLines, dataContainers);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));