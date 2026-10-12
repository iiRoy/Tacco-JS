process.stdin.setEncoding('utf8');

let accumulatedInput = '';

process.stdin.on('data', (dataSegment) => {
    accumulatedInput += dataSegment;
});

process.stdin.on('end', () => {
    const processedInput = accumulatedInput.trim();
    const stringNumbers = processedInput.split(' ');

    const parsedNumbers = [];
    for (let i = 0; i < stringNumbers.length; i++) {
        parsedNumbers.push(parseInt(stringNumbers[i], 10));
    }

    const firstPairSum = parsedNumbers[0] + parsedNumbers[1];
    const secondPairSum = parsedNumbers[1] + parsedNumbers[2];
    const thirdPairSum = parsedNumbers[2] + parsedNumbers[0];

    let currentMinimum = Infinity;
    const allSums = [firstPairSum, secondPairSum, thirdPairSum];

    for (let i = 0; i < allSums.length; i++) {
        const currentSum = allSums[i];
        if (isNaN(currentSum)) {
            currentMinimum = NaN;
            break;
        }
        if (currentSum < currentMinimum) {
            currentMinimum = currentSum;
        }
    }

    console.log(currentMinimum);
});
