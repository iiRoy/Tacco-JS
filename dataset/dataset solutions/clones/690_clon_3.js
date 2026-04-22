const fileSystemModule = require('node:fs');

const calculateCube = (value) => Math.pow(value, 3);

let rawInputData = fileSystemModule.readFileSync('/dev/stdin', { encoding: 'utf8' });

let inputLineBuffer = rawInputData.trim().split('\n');

let currentNumericInput;

while ((currentNumericInput = Number(inputLineBuffer.shift())) !== 0) {
    if (isNaN(currentNumericInput)) {
        console.error("Warning: Non-numeric input encountered. Skipping.");
        continue;
    }

    const targetValueCube = calculateCube(currentNumericInput);

    let foundPositiveDifferences = [];

    for (let firstTerm = currentNumericInput - 1; firstTerm > 0; firstTerm--) {
        const firstTermCube = calculateCube(firstTerm);

        for (let secondTerm = firstTerm; secondTerm > 0; secondTerm--) {
            const secondTermCube = calculateCube(secondTerm);

            const candidateDifference = targetValueCube - firstTermCube - secondTermCube;

            if (candidateDifference > 0) {
                foundPositiveDifferences.push(candidateDifference);
            }
        }
    }

    if (foundPositiveDifferences.length === 0) {
        console.log(Infinity); 
    } else {
        const minimumDifference = foundPositiveDifferences.reduce(
            (accumulator, currentValue) => Math.min(accumulator, currentValue),
            Infinity
        );
        console.log(minimumDifference);
    }
}