function processInputAndCompute(dataString) {
    const argumentParts = dataString.split(' ');
    const upperLimit = Number(argumentParts[0]);

    let totalOddDigitCount = 0;
    let currentMagnitude = 1;
    let digitGroupLength = 1;

    while (currentMagnitude * 10 <= upperLimit) {
        if (digitGroupLength % 2 !== 0) {
            totalOddDigitCount += 9 * currentMagnitude;
        }
        currentMagnitude *= 10;
        digitGroupLength++;
    }

    if (digitGroupLength % 2 !== 0) {
        totalOddDigitCount += (upperLimit - currentMagnitude + 1);
    }

    console.log(totalOddDigitCount);
}

processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));
