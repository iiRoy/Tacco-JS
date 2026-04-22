const executeProcessing = (rawInput) => {
    const inputLines = rawInput.split('\n');
    const discardedLine = inputLines.shift();
    const characterSequence = inputLines.shift().split('');
    const sequenceLength = characterSequence.length;
    const transformationInstructions = inputLines.map(line => line.split(' '));

    const initialTallies = Array.from({ length: sequenceLength }, () => 1);

    const applyInstruction = (currentTallies, instruction) => {
        const targetSymbol = instruction[0];
        const movementDirective = instruction[1];

        const { transientTallies, futureTallies } = Array.from({ length: sequenceLength }).reduce(
            (accumulator, _, currentPosition) => {
                const symbolAtPosition = characterSequence[currentPosition];
                const tallyAtPosition = accumulator.transientTallies[currentPosition];

                if (symbolAtPosition !== targetSymbol) {
                    accumulator.futureTallies[currentPosition] += tallyAtPosition;
                } else {
                    if (movementDirective === 'L') {
                        if (currentPosition - 1 >= 0) {
                            accumulator.futureTallies[currentPosition - 1] += tallyAtPosition;
                        }
                    } else if (movementDirective === 'R') {
                        if (currentPosition + 1 < sequenceLength) {
                            accumulator.transientTallies[currentPosition + 1] += tallyAtPosition;
                        }
                    }
                }
                return accumulator;
            },
            {
                transientTallies: Array.from(currentTallies),
                futureTallies: Array.from({ length: sequenceLength }).fill(0)
            }
        );

        return futureTallies;
    };

    const finalTallies = transformationInstructions.reduce(applyInstruction, initialTallies);

    const totalSum = finalTallies.reduce((summation, value) => summation + value, 0);

    console.log(totalSum);
};

executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));