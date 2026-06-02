const outputFn = console.log;

// Self-executing function to encapsulate input handling logic
(function initializeInputProcessing() {
    if (typeof process !== "undefined" && process.stdin) {
        let dataBuffer = "";
        const LINE_DELIMITER = "\n";

        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (inputChunk) => {
            dataBuffer += inputChunk;
        });

        process.stdin.on('end', () => {
            const receivedLines = dataBuffer.split(LINE_DELIMITER);
            processInput(receivedLines);
        });
    }
})();

const MODULUS_VALUE = 1000000007;

// Helper function to convert string to number
const convertToNumber = (strValue) => Number(strValue);

function calculatePowerMod(baseVal, exponentVal){
    // Base cases for small exponents
    if (exponentVal <= 3) {
        // Direct calculation for small powers
        return Math.pow(baseVal, exponentVal) % MODULUS_VALUE;
    }

    // Recursive step for even exponent
    if (exponentVal % 2 === 0) {
        const halfExponentResult = calculatePowerMod(baseVal, exponentVal / 2);
        // Square the result and apply modulo
        const squaredHalfResult = (halfExponentResult * halfExponentResult) % MODULUS_VALUE;
        return squaredHalfResult;
    }
    // Recursive step for odd exponent
    else {
        const halfExponentResult = calculatePowerMod(baseVal, (exponentVal - 1) / 2);
        // Square the result, multiply by base, and apply modulo
        const squaredHalfResult = (halfExponentResult * halfExponentResult) % MODULUS_VALUE;
        const finalPowerResult = (squaredHalfResult * baseVal) % MODULUS_VALUE;
        return finalPowerResult;
    }
}

function processInput(receivedLines){
  const firstDataLine = receivedLines[0];
  const VALUE_SEPARATOR = " ";

  // Split the line into string parts
  const stringComponents = firstDataLine.split(VALUE_SEPARATOR);

  // Convert string parts to numbers using the helper function
  const numericValues = stringComponents.map(convertToNumber);

  // Destructure the array for clearer variable names
  const [baseNumber, exponentNumber] = numericValues;

  outputFn(calculatePowerMod(baseNumber, exponentNumber));
}
