(function(inputSource) {
    const rawLines = inputSource.split('\n');
    const operationSequence = [];
    let currentLineIndex = 1;

    while (currentLineIndex < rawLines.length) {
        const lineSegments = rawLines[currentLineIndex].split(' ');
        const primaryCommand = lineSegments[0];

        if (primaryCommand === 'quit') {
            break;
        }

        operationSequence.push({
            action: primaryCommand,
            operandA: lineSegments[1],
            operandB: lineSegments[2]
        });
        currentLineIndex++;
    }

    const stackCollection = new Map();

    const ensureStackExists = (stackKey) => {
        if (!stackCollection.has(stackKey)) {
            stackCollection.set(stackKey, []);
        }
        return stackCollection.get(stackKey);
    };

    const commandDispatch = {
        push: (targetKey, valueToPush) => {
            ensureStackExists(targetKey).push(valueToPush);
        },
        pop: (targetKey) => {
            const extractedValue = ensureStackExists(targetKey).pop();
            console.log(extractedValue);
        },
        move: (sourceKey, destinationKey) => {
            const itemToTransfer = ensureStackExists(sourceKey).pop();
            ensureStackExists(destinationKey).push(itemToTransfer);
        }
    };

    for (const currentOperation of operationSequence) {
        const { action, operandA, operandB } = currentOperation;
        const executor = commandDispatch[action];
        if (executor) {
            executor(operandA, operandB);
        }
    }

})(require("fs").readFileSync("/dev/stdin", "utf8"));
