const fileSystem = require('fs');
const standardInputDescriptor = process.stdin.fd;
const inputSize = fileSystem.fstatSync(standardInputDescriptor).size;
const inputBuffer = Buffer.alloc(inputSize);
const bytesReadCount = fileSystem.readSync(standardInputDescriptor, inputBuffer, 0, inputSize, 0);
const rawInputLines = inputBuffer.toString('utf8', 0, bytesReadCount).split('\n');

function processCharacterTransformations() {
  const sourceText = rawInputLines[0];
  const transformationThreshold = 160;
  const characterCodeSequence = [...sourceText].map(c => c.charCodeAt(0));

  const finalResult = characterCodeSequence.reduce((accumulator, currentCode) => {
    const { generatedOutput, previousCodeValue } = accumulator;
    const codeDifference = currentCode - previousCodeValue;

    let currentSegment = '';
    if (codeDifference === 0) {
      currentSegment = '.';
    } else {
      const operationSign = codeDifference > 0 ? '+' : '-';
      const absoluteDifference = Math.abs(codeDifference);

      if (absoluteDifference < transformationThreshold) {
        currentSegment = operationSign.repeat(absoluteDifference);
      } else {
        const rootFloor = Math.floor(Math.sqrt(absoluteDifference));
        const remainingDifference = absoluteDifference - rootFloor * rootFloor;

        currentSegment = [
          '>',
          '+'.repeat(rootFloor),
          '[<',
          operationSign.repeat(rootFloor),
          '>-]<',
          operationSign.repeat(remainingDifference)
        ].join('');
      }
      currentSegment += '.';
    }

    return {
      generatedOutput: generatedOutput + currentSegment,
      previousCodeValue: currentCode
    };
  }, { generatedOutput: '', previousCodeValue: 0 }).generatedOutput;

  console.log(finalResult);
}

processCharacterTransformations();
