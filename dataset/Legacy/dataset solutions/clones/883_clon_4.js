const fileSystem = require('fs');

function transformInputToBrainfuckLike(sourceText) {
  const codeThreshold = 16;

  const processingResult = Array.from(sourceText).reduce((accumulator, currentCharacter) => {
    const currentCodeValue = currentCharacter.charCodeAt(0);
    const codeDelta = currentCodeValue - accumulator.previousCodeValue;
    let segmentOutput = '';

    if (codeDelta === 0) {
      segmentOutput = '.';
    } else {
      const signSymbol = codeDelta > 0 ? '+' : '-';
      const absoluteDelta = Math.abs(codeDelta);

      if (absoluteDelta < codeThreshold) {
        segmentOutput = signSymbol.repeat(absoluteDelta);
      } else {
        const rootFloor = Math.floor(Math.sqrt(absoluteDelta));
        segmentOutput = '>';
        segmentOutput += '+'.repeat(rootFloor);
        segmentOutput += '[<';
        segmentOutput += signSymbol.repeat(rootFloor);
        segmentOutput += '>-]<';
        segmentOutput += signSymbol.repeat(absoluteDelta - rootFloor * rootFloor);
      }
      segmentOutput += '.';
    }

    return {
      accumulatedOutput: accumulator.accumulatedOutput + segmentOutput,
      previousCodeValue: currentCodeValue
    };
  }, { accumulatedOutput: '', previousCodeValue: 0 });

  return processingResult.accumulatedOutput;
}

const standardInputFileDescriptor = process.stdin.fd;
const inputStatistics = fileSystem.fstatSync(standardInputFileDescriptor);
const totalInputBytes = inputStatistics.size;

const dataStorageBuffer = Buffer.alloc(totalInputBytes);
const actualBytesReadCount = fileSystem.readSync(standardInputFileDescriptor, dataStorageBuffer, 0, totalInputBytes, 0);

const rawContentString = dataStorageBuffer.toString('utf8', 0, actualBytesReadCount);
const contentLines = rawContentString.split('\n');

const targetString = contentLines[0];
const finalBrainfuckLikeString = transformInputToBrainfuckLike(targetString);

console.log(finalBrainfuckLikeString);
