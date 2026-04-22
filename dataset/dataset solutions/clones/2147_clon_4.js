let collectedData = '';

process.stdin.on('data', (dataPortion) => {
    collectedData += dataPortion;
});

process.stdin.on('end', () => {
    evaluateNumericSequence(collectedData);
});

function evaluateNumericSequence(completeStream) {
    const primaryLine = completeStream.split('\n')[0];
    const numericTokens = primaryLine.split(' ');

    const transformedNumbers = numericTokens.map((token) => {
        // This matches the original's behavior of converting empty strings to 0
        return Number(token);
    });

    const [componentOne, componentTwo, componentThree] = transformedNumbers;

    const uniqueElements = new Set();
    uniqueElements.add(componentOne);
    uniqueElements.add(componentTwo);
    uniqueElements.add(componentThree);

    let ultimateDecision;
    if (uniqueElements.size === 2) {
        ultimateDecision = 'Yes';
    } else {
        ultimateDecision = 'No';
    }

    process.stdout.write(ultimateDecision + '\n');
}