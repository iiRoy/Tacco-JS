let receivedFragments = '';

process.stdin.on('data', (piece) => {
    receivedFragments += piece.toString();
});

process.stdin.on('end', () => {
    const initialSegment = receivedFragments.trim().split('\n')[0];

    const numberPattern = /\s+(\d+)\s+(\d+)/;
    const matchResult = initialSegment.match(numberPattern);

    let firstOperand = 0;
    let secondOperand = 0;

    if (matchResult && matchResult.length >= 3) {
        firstOperand = Number(matchResult[1]);
        secondOperand = Number(matchResult[2]);
    }

    const deviationCount = secondOperand - firstOperand - 1;

    const outcomeMessage = ((deviationCount & 1) === 1) ? 'Alice\n' : 'Borys\n';

    process.stdout.write(outcomeMessage);
});