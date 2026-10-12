const inputDataBuffer = require("fs").readFileSync("/dev/stdin", "utf8");

function processNumericInput(rawTextContent) {
    const numericalValue = parseInt(rawTextContent, 10);

    const digitSumCalculator = (numberToProcess) => {
        return String(numberToProcess)
            .split('')
            .reduce((accumulator, charDigit) => accumulator + Number(charDigit), 0);
    };

    const totalOfDigits = digitSumCalculator(numericalValue);

    const outcomeMapping = {
        true: 'Yes',
        false: 'No'
    };

    const isPerfectlyDivisible = (numericalValue % totalOfDigits === 0);

    console.log(outcomeMapping[isPerfectlyDivisible]);
}

processNumericInput(inputDataBuffer);
