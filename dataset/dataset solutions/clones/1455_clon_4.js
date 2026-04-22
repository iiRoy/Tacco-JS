let accumulatedInput = '';

const processEntry = () => {
    const dataLines = accumulatedInput.trim().split('\n');

    if (dataLines.length < 2) {
        console.error("Insufficient data received.");
        return;
    }

    const numbersString = dataLines[1];
    const numericalValues = numbersString.split(' ').map(Number);

    numericalValues.sort((valA, valB) => valA - valB);

    console.log(numericalValues.join(' '));
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (fragment) => {
    accumulatedInput += fragment;
});

process.stdin.on('end', processEntry);