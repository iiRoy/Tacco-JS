process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", function (dataPayload) {
    const payloadLines = dataPayload.trim().split('\n');
    const problemQuantity = parseInt(payloadLines.shift(), 10);
    const problemInputs = payloadLines;

    const characterMapping = {
        '1': ['.', ',', '!', '?', ' '],
        '2': ['a', 'b', 'c'],
        '3': ['d', 'e', 'f'],
        '4': ['g', 'h', 'i'],
        '5': ['j', 'k', 'l'],
        '6': ['m', 'n', 'o'],
        '7': ['p', 'q', 'r', 's'],
        '8': ['t', 'u', 'v'],
        '9': ['w', 'x', 'y', 'z']
    };

    const interpretSequence = (sequenceText) => {
        const numericSequence = sequenceText.split('').map(Number);

        const reductionState = numericSequence.reduce((accumulator, digitPressed) => {
            const { messageAccumulator, currentSelection, pressCount } = accumulator;

            if (digitPressed === 0) {
                return {
                    messageAccumulator: messageAccumulator + currentSelection,
                    currentSelection: '',
                    pressCount: 0
                };
            } else {
                const availableOptions = characterMapping[digitPressed.toString()];
                const nextSelection = availableOptions[pressCount % availableOptions.length];
                return {
                    messageAccumulator: messageAccumulator,
                    currentSelection: nextSelection,
                    pressCount: pressCount + 1
                };
            }
        }, { messageAccumulator: '', currentSelection: '', pressCount: 0 });

        return reductionState.messageAccumulator;
    };

    problemInputs.forEach((eachInput, index) => {
        if (index < problemQuantity) { // Ensure we only process 'problemQuantity' lines
            const decodedMessage = interpretSequence(eachInput);
            console.log(decodedMessage);
        }
    });
});