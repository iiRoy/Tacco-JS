let allIncomingData = '';

process.stdin.on('data', (dataChunk) => {
    allIncomingData += dataChunk;
});

process.stdin.on('end', () => {
    const inputSequences = allIncomingData.trim().split('\n');

    const firstSequence = inputSequences[0];
    const secondSequence = inputSequences[1];

    const comparisonPositions = [0, 1, 2];

    const totalMatchCount = comparisonPositions.reduce((accumulator, currentPos) => {
        const charFromFirst = firstSequence ? firstSequence[currentPos] : undefined;
        const charFromSecond = secondSequence ? secondSequence[currentPos] : undefined;
        
        return accumulator + (charFromFirst === charFromSecond ? 1 : 0);
    }, 0);

    console.log(totalMatchCount);
});