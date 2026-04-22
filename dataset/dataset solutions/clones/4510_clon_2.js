var MODULUS_VAL = Math.pow(10, 9) + 0x7;

function calculateFactorialMod(inputNumber) {
    var currentResult = inputNumber;
    for (var loopCounter = 1; loopCounter < inputNumber; loopCounter++) {
        currentResult = (currentResult * loopCounter) % MODULUS_VAL;
    }
    return currentResult;
}

function executeProgram(rawInputString) {
    var inputPartsArray = rawInputString.split(" ");
    var firstInteger = Number(inputPartsArray[0]);
    var secondInteger = Number(inputPartsArray[1]);

    if (Math.abs(firstInteger - secondInteger) >= 2) {
        return 0;
    }
    if (firstInteger === secondInteger) {
        return calculateFactorialMod(firstInteger) * calculateFactorialMod(secondInteger) * 2 % MODULUS_VAL;
    }
    return calculateFactorialMod(firstInteger) * calculateFactorialMod(secondInteger) % MODULUS_VAL;
}

console.log(executeProgram(require("fs").readFileSync("/dev/stdin", "utf8")));