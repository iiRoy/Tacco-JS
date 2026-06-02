function processInput(rawData) {
    const valueStrings = rawData.split(' ');
    const firstOperand = Number(valueStrings[0]);
    const secondOperand = Number(valueStrings[1]);

    // The product of two integers is odd if and only if both integers are odd.
    // An integer is odd if its least significant bit is 1 (i.e., (number & 1) === 1).
    // Otherwise, the product is even.
    const isProductOdd = ((firstOperand & 1) === 1) && ((secondOperand & 1) === 1);

    console.log(isProductOdd ? 'Odd' : 'Even');
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
