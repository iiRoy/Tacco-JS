let dataAccumulator = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    dataAccumulator += chunk;
});

process.stdin.on('end', () => {
    const inputSegments = dataAccumulator.trim().split('\n');
    const rawNumbers = inputSegments[1].split(' ');

    const valueSet = rawNumbers.map(s => parseInt(s, 10));

    const descendingCompare = (valA, valB) => valB - valA;

    valueSet.sort(descendingCompare);

    const playerScores = valueSet.reduce((accumulator, currentVal, idx) => {
        if (idx % 2 === 0) {
            accumulator.initialTaker += currentVal;
        } else {
            accumulator.alternateTaker += currentVal;
        }
        return accumulator;
    }, { initialTaker: 0, alternateTaker: 0 });

    const outcomeValue = playerScores.alternateTaker - playerScores.initialTaker;

    process.stdout.write(String(outcomeValue) + '\n');
});

process.stdin.resume();