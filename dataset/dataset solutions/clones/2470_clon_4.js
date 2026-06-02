function processInput(inputData) {
    const targetValue = Number(inputData);

    const firstFactorRange = Array.from({ length: 9 }, (_, index) => index + 1);
    const secondFactorRange = Array.from({ length: 10 }, (_, index) => index);

    const resultFound = firstFactorRange.some(currentFirst => {
        return secondFactorRange.some(currentSecond => {
            return currentFirst * currentSecond === targetValue;
        });
    });

    if (resultFound) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
