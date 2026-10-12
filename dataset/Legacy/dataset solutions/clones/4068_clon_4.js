function processInput(rawData) {
    const [firstVal, secondVal] = rawData.split(' ').map(Number);

    const isFirstOdd = firstVal % 2 !== 0;
    const isSecondOdd = secondVal % 2 !== 0;

    const finalOutcome = (isFirstOdd && isSecondOdd) ? 'Odd' : 'Even';

    console.log(finalOutcome);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
