function processInputData(rawDataString) {
    const [firstNumStr, secondNumStr] = rawDataString.split(' ');

    const firstNumber = parseInt(firstNumStr, 10);
    const secondNumber = parseInt(secondNumStr, 10);

    const productOfNumbers = firstNumber * secondNumber;

    const checkParity = (value) => {
        return (value & 1) === 0;
    };

    if (checkParity(productOfNumbers)) {
        console.log('Even');
    } else {
        console.log('Odd');
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
