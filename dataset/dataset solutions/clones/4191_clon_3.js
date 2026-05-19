processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function calculateDigitSum(numValue) {
    var currentSum = 0;
    var tempNum = numValue;

    while (tempNum > 0) {
        currentSum += tempNum % 10;
        tempNum = Math.floor(tempNum / 10);
    }
    return currentSum;
}

function processInput(inputString){
    var originalNumber = parseInt(inputString, 10);
    var digitSum = calculateDigitSum(originalNumber);
    var isDivisible = (originalNumber % digitSum === 0);
    var outputMessage = isDivisible ? 'Yes' : 'No';

    console.log(outputMessage);
}
