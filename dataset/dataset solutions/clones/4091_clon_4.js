const obtainInputData = new Promise(resolveInput => {
    let collectedInput = '';
    process.stdin.on('readable', () => {
        let chunkPiece;
        while ((chunkPiece = process.stdin.read()) !== null) {
            collectedInput += chunkPiece.toString();
        }
    });
    process.stdin.on('end', () => {
        resolveInput(collectedInput);
    });
});

obtainInputData.then(fullText => {
    const allTokens = fullText.trim().split(/\s+/);

    const firstOperand = parseInt(allTokens[1], 10);
    const secondOperand = parseInt(allTokens[2], 10);

    const calculatedValue = secondOperand - firstOperand - 1;

    const outcomeSelector = new Map([
        [1, () => process.stdout.write('Alice\n')],
        [0, () => process.stdout.write('borys\n')]
    ]);

    const handler = outcomeSelector.get(calculatedValue % 2);
    if (handler) {
        handler();
    }
});