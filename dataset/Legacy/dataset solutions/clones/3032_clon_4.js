const evaluateRange = (inputString) => {
    const numberSequence = inputString.split(' ').reduce((accumulator, currentString) => {
        accumulator.push(Number(currentString));
        return accumulator;
    }, []);

    const firstValue = numberSequence[0];
    const secondValue = numberSequence[1];
    const thirdValue = numberSequence[2];

    const resultIndicator = (firstValue <= thirdValue || secondValue <= thirdValue) ? 'Yes' : 'No';

    console.log(resultIndicator);
};

evaluateRange(require('fs').readFileSync('/dev/stdin', 'utf8'));
