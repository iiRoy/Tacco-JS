var MODULUS_VAL = Math.pow(10, 9) + 7;

function calculateFactorialModulo(value) {
    if (value === 0) {
        return 0;
    }
    var currentFactorial = value;
    for (var iterator = 1; iterator < value; iterator++) {
        currentFactorial = (currentFactorial * iterator) % MODULUS_VAL;
    }
    return currentFactorial;
}

function solveProblem(inputString) {
    var numberStrings = inputString.split(" ");
    var valN = Number(numberStrings[0]);
    var valM = Number(numberStrings[1]);

    var difference = Math.abs(valN - valM);

    if (difference >= 2) {
        return 0;
    }

    var factorialN = calculateFactorialModulo(valN);
    var factorialM = calculateFactorialModulo(valM);

    var productOfFactorials = (factorialN * factorialM) % MODULUS_VAL;

    if (valN === valM) {
        const MULTIPLIER_FOR_EQUAL = 2;
        return (productOfFactorials * MULTIPLIER_FOR_EQUAL) % MODULUS_VAL;
    }

    return productOfFactorials;
}

console.log(solveProblem(require("fs").readFileSync("/dev/stdin", "utf8")));
