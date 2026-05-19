function processInputData(rawInputString) {
    const inputParts = rawInputString.split(" ");

    const numA = parseInt(inputParts[0], 10);
    const numB = parseInt(inputParts[1], 10);

    const calculateProduct = (val1, val2) => {
        return val1 * val2;
    };

    const isResultEven = (valueToCheck) => {
        return valueToCheck % 2 === 0;
    };

    const multiplicationResult = calculateProduct(numA, numB);

    let finalOutputMessage;
    if (isResultEven(multiplicationResult)) {
        finalOutputMessage = "Even";
    } else {
        finalOutputMessage = "Odd";
    }

    console.log(finalOutputMessage);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
