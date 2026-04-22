const displayOutput = (message) => {
    if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log(message);
    }
};

const PRIME_MODULUS = 1000000007;

if (typeof process !== "undefined" && process.stdin && typeof process.stdin.resume === 'function') {
    let receivedDataSegments = [];

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (dataChunk) {
        receivedDataSegments.push(dataChunk);
    });

    process.stdin.on('end', function () {
        const fullInputContent = receivedDataSegments.join('');
        const inputLines = fullInputContent.split('\n');
        executePrimaryLogic(inputLines);
    });
}

function calculateModularPower(baseValue, exponent) {
    if (exponent < 0) {
        displayOutput("Warning: Negative exponent provided. Returning 0 as an invalid state.");
        return 0;
    }

    if (exponent === 0) {
        return 1;
    }

    if (exponent === 1) {
        return baseValue % PRIME_MODULUS;
    }

    const halfExponentResult = calculateModularPower(baseValue, Math.floor(exponent / 2));
    const squaredHalfResult = (halfExponentResult * halfExponentResult) % PRIME_MODULUS;

    if (exponent % 2 === 0) {
        return squaredHalfResult;
    } else {
        const finalResult = (squaredHalfResult * (baseValue % PRIME_MODULUS)) % PRIME_MODULUS;
        return finalResult;
    }
}

function executePrimaryLogic(inputRows) {
    if (!inputRows || inputRows.length === 0) {
        displayOutput("Error: No input lines provided to the main logic.");
        return;
    }

    const firstDataRow = inputRows[0];

    if (!firstDataRow) {
        displayOutput("Error: First input line is empty or invalid.");
        return;
    }

    const stringComponents = firstDataRow.trim().split(" ");

    if (stringComponents.length < 2) {
        displayOutput("Error: Insufficient numerical components in the first input line. Expected 2, got " + stringComponents.length);
        return;
    }

    const baseNumber = Number(stringComponents[0]);
    const exponentNumber = Number(stringComponents[1]);

    if (isNaN(baseNumber) || isNaN(exponentNumber)) {
        displayOutput("Error: One or both input components are not valid numbers.");
        return;
    }

    const finalCalculationResult = calculateModularPower(baseNumber, exponentNumber);

    displayOutput(finalCalculationResult);
}