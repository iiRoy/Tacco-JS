let wholeEntry = '';
process.stdin.on('data', (portion) => {
    wholeEntry += portion;
});

process.stdin.on('end', () => {
    const segmentedInputs = wholeEntry.trim().split('\n');

    const firstRowElements = segmentedInputs[0].split(' ');
    // const quantityIndicator = Number(firstRowElements[0]); // Not strictly required for the logic
    let availableFunds = Number(firstRowElements[1]);

    const expenditureOptions = segmentedInputs[1].split(' ').map(Number);

    expenditureOptions.sort((optionA, optionB) => optionA - optionB);

    const computationResult = expenditureOptions.reduce((accumulator, currentOptionCost) => {
        if (accumulator.currentWallet >= currentOptionCost) {
            accumulator.currentWallet -= currentOptionCost;
            accumulator.acquiredItems++;
        }
        return accumulator;
    }, { currentWallet: availableFunds, acquiredItems: 0 });

    console.log(computationResult.acquiredItems);
});

process.stdin.resume();