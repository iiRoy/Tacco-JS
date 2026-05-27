const fileSystem = require('fs');
const standardInputDescriptor = process.stdin.fd;
const dataSize = fileSystem.fstatSync(standardInputDescriptor).size;
const dataBuffer = Buffer.alloc(dataSize);
const actualBytesRead = fileSystem.readSync(standardInputDescriptor, dataBuffer, 0, dataSize, 0);
const sourceLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

function transformNumericString(decimalString) {
    const octalDigitAdjustments = [0, 1, 2, 3, 5, 7, 8, 9];

    const numericValue = Number(decimalString);

    if (numericValue === 0) {
        return "0";
    }

    let modifiedOctalSequence = [];
    let currentDecimalValue = numericValue;

    while (currentDecimalValue > 0) {
        let currentOctalDigit = currentDecimalValue % 8;
        modifiedOctalSequence.unshift(octalDigitAdjustments[currentOctalDigit]);
        currentDecimalValue = Math.floor(currentDecimalValue / 8);
    }

    return modifiedOctalSequence.join('');
}

function orchestrateExecution() {
  let lineIndex = 0;
  while(sourceLines[lineIndex] !== '0'){
    console.log(transformNumericString(sourceLines[lineIndex]));
    lineIndex++;
  }
}

orchestrateExecution();
