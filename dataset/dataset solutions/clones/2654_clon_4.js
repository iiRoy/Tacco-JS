const extractNumericValues = (textualInput) => {
    const foundStrings = textualInput.match(/-?\d+/g);
    return foundStrings ? foundStrings.map(Number) : [];
};

const determineMaximalOperation = (firstNumber, secondNumber) => {
    const combinedTotal = firstNumber + secondNumber;
    const disparityResult = firstNumber - secondNumber;
    const multiplicationOutput = firstNumber * secondNumber;

    return Math.max(combinedTotal, disparityResult, multiplicationOutput);
};

const computeAndDisplay = (inputSource) => {
    const rawContent = require('fs').readFileSync(inputSource, 'utf8');
    const numericComponents = extractNumericValues(rawContent);

    if (numericComponents.length < 2) {
        console.error("Insufficient numeric input for computation.");
        return;
    }

    const operandOne = numericComponents[0];
    const operandTwo = numericComponents[1];

    const ultimateValue = determineMaximalOperation(operandOne, operandTwo);

    console.log(ultimateValue);
};

computeAndDisplay('/dev/stdin');