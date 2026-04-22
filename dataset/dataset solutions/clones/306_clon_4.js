const fileSystemAccess = process.binding('fs');
const standardInputFileDescriptor = 0;

const readBufferCapacity = 1024;
const inputReadBuffer = Buffer.alloc(readBufferCapacity);
let accumulatedInputData = '';
let bytesAcquired;

while ((bytesAcquired = fileSystemAccess.read(standardInputFileDescriptor, inputReadBuffer, 0, readBufferCapacity, -1)) > 0) {
    accumulatedInputData += inputReadBuffer.toString('utf8', 0, bytesAcquired);
    if (bytesAcquired < readBufferCapacity) {
        break;
    }
}

let numericCollection = [];
let currentDigitSequence = '';
let insideNumberToken = false;

for (let characterIndex = 0; characterIndex < accumulatedInputData.length; characterIndex++) {
    const currentCharacter = accumulatedInputData[characterIndex];
    if (currentCharacter === ' ' || currentCharacter === '\t' || currentCharacter === '\n' || currentCharacter === '\r') {
        if (insideNumberToken) {
            numericCollection.push(parseFloat(currentDigitSequence));
            currentDigitSequence = '';
            insideNumberToken = false;
            if (numericCollection.length === 2) break;
        }
    } else {
        currentDigitSequence += currentCharacter;
        insideNumberToken = true;
    }
}
if (insideNumberToken && currentDigitSequence.length > 0 && numericCollection.length < 2) {
    numericCollection.push(parseFloat(currentDigitSequence));
}

const operandOne = numericCollection[0];
const operandTwo = numericCollection[1];

const constantDivisorNumerator = 3305785;
const constantDivisorDenominator = 1000000000000;

const productOfOperands = operandOne * operandTwo;

const intermediateComputedValue = (productOfOperands * constantDivisorDenominator) / constantDivisorNumerator;

const truncatedIntermediateValue = parseInt(intermediateComputedValue, 10);

const finalScalingFactor = 1000000;
const finalCalculatedOutput = truncatedIntermediateValue / finalScalingFactor;

process.stdout.write(String(finalCalculatedOutput) + '\n');