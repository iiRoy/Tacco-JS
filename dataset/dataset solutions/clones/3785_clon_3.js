function processInput(inputLines) {
    const numberStrings = inputLines[0].split(" ");

    const firstNum = Number(numberStrings[0]);
    const secondNum = Number(numberStrings[1]);

    const calculateSum = (n1, n2) => n1 + n2;
    const calculateDifference = (n1, n2) => n1 - n2;
    const calculateProduct = (n1, n2) => n1 * n2;

    const sumResult = calculateSum(firstNum, secondNum);
    const diffResult = calculateDifference(firstNum, secondNum);
    const prodResult = calculateProduct(firstNum, secondNum);

    const findMaximum = (val1, val2, val3) => {
        let currentMax = val1;
        if (val2 > currentMax) {
            currentMax = val2;
        }
        if (val3 > currentMax) {
            currentMax = val3;
        }
        return currentMax;
    };

    const finalOutputValue = findMaximum(sumResult, diffResult, prodResult);

    console.log(finalOutputValue);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInputData = fileContent.trim().split("\n");
processInput(processedInputData);
