function processData(inputStringContent) {
    const inputLines = inputStringContent.split("\n");

    const firstNum = parseInt(inputLines[0]);
    const secondNum = parseInt(inputLines[1]);

    const calculateDerivedValue = (valA, valB) => {
        return (2 * valB) - valA;
    };

    const computedResult = calculateDerivedValue(firstNum, secondNum);

    console.log(computedResult);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
