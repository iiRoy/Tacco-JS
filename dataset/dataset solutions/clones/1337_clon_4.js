const fileSystem = require('fs');
const bufferCapacity = 1024;
const inputBuffer = Buffer.alloc(bufferCapacity);
const octetsRead = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, bufferCapacity, 0);
const sourceData = inputBuffer.toString('utf8', 0, octetsRead).trim();

const initialVal = Number(sourceData);

const obtainComponents = (numericValue, currentTest = 2, gatheredDivisors = []) => {
    if (numericValue <= 1) {
        return { residual: numericValue, constituents: gatheredDivisors };
    }
    if (currentTest * currentTest > numericValue) {
        return { residual: numericValue, constituents: gatheredDivisors };
    }

    if (numericValue % currentTest === 0) {
        return obtainComponents(numericValue / currentTest, currentTest, [...gatheredDivisors, currentTest]);
    } else {
        return obtainComponents(numericValue, currentTest + 1, gatheredDivisors);
    }
};

const factorizationResult = obtainComponents(initialVal);
const remainingComponent = factorizationResult.residual;
const factorCollection = factorizationResult.constituents;

console.log(`${remainingComponent}: ${factorCollection.join(' ')}`);