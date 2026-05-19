// This function processes the raw input string.
function ProcessInput(rawData) {
    // Declare variables to hold the counts of canines and primates.
    let numCanines, numPrimates;

    // Split the raw input by newline characters to get individual lines.
    rawData = rawData.split('\n');
    // Take the first line and split it by space to get the two numbers.
    rawData = rawData[0].split(' ');

    // Assign the parsed numbers to their respective variables.
    numCanines = rawData[0];
    numPrimates = rawData[1];
    
    // Check the absolute difference between the two numbers.
    if (Math.abs(numCanines - numPrimates) >= 2) {
        // If the difference is 2 or more, output 0.
        console.log(0);
    } else if (Math.abs(numCanines - numPrimates) === 1) {
        // If the difference is exactly 1, calculate and output the product of factorials modulo a large prime.
        const MODULO_VAL = 1000000007;
        let canineFactorial = calculateFactorial(numCanines) % MODULO_VAL;
        let primateFactorial = calculateFactorial(numPrimates) % MODULO_VAL;
        console.log((canineFactorial * primateFactorial) % MODULO_VAL);
    } else if (Math.abs(numCanines - numPrimates) === 0) {
        // If the difference is 0 (numbers are equal), calculate and output twice the product of factorials modulo a large prime.
        const MODULO_VAL = 1000000007;
        let canineFactorial = calculateFactorial(numCanines) % MODULO_VAL;
        let primateFactorial = calculateFactorial(numPrimates) % MODULO_VAL;
        console.log(((canineFactorial * primateFactorial) * 2) % MODULO_VAL);
    }
}

// This function computes the factorial of a given number, applying modulo arithmetic.
const calculateFactorial = function(val) {
    const MOD_CONST = 1000000007; // A large prime number for modulo operations.
    // Base case: factorial of 0 or less is 1.
    if (val <= 0) {
        return 1;
    } else {
        // Recursive step: val * factorial(val - 1) % MOD_CONST.
        // Each multiplication is also taken modulo MOD_CONST to prevent overflow.
        return (val % MOD_CONST * (calculateFactorial(val - 1) % MOD_CONST)) % MOD_CONST;
    }
};

// Do not modify the following line; it handles standard input/output and calls the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
