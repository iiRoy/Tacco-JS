const stdio = process.stdin;
const std_out = process.stdout;

let fullInputBuffer = '';

const determineOutcome = (inputStringContent) => {
    const segments = inputStringContent.trim().split(/\s+/);
    const valueOne = parseInt(segments[1], 10);
    const valueTwo = parseInt(segments[2], 10);

    const isValueOneOdd = (valueOne & 1); // 1 if odd, 0 if even
    const isValueTwoOdd = (valueTwo & 1); // 1 if odd, 0 if even

    // Map the combined parity states to the outcome
    const resultLookup = new Map([
        ['00', 'Alice'], // Both even
        ['11', 'Alice'], // Both odd
        ['01', 'Bolis'], // First even, second odd
        ['10', 'Bolis']  // First odd, second even
    ]);

    const parityKey = `${isValueOneOdd}${isValueTwoOdd}`;
    return resultLookup.get(parityKey);
};

stdio.on('data', (dataPortion) => {
    fullInputBuffer += dataPortion.toString();
});

stdio.on('end', () => {
    const finalDecision = determineOutcome(fullInputBuffer);
    std_out.write(finalDecision + '\n');
});

stdio.resume();