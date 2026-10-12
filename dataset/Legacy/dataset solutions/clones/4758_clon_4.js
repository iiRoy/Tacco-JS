process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    const inputParts = chunk.toString().split('\n');
    const countVal = parseInt(inputParts[0]);
    const instructionSeq = inputParts[1];

    const initialAccumulator = { currentBalance: 0, peakBalance: 0 };

    const indices = Array.from({ length: countVal }, (_, idx) => idx);

    const finalResult = indices.reduce((acc, idx) => {
        const char = instructionSeq.charAt(idx);
        const balanceChange = (char === 'I' ? 1 : -1);
        const newBalance = acc.currentBalance + balanceChange;
        const newPeak = Math.max(acc.peakBalance, newBalance);
        return { currentBalance: newBalance, peakBalance: newPeak };
    }, initialAccumulator);

    console.log(finalResult.peakBalance);
});
