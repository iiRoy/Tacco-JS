function processInput(contentPayload) {
  const dataLines = contentPayload.trim().split('\n');
  const limitCount = Number(dataLines[0]);
  const numberSeries = dataLines[1].split(' ').map(Number);

  const finalOutcome = numberSeries.slice(0, limitCount).reduce((currentVerdict, currentNumericValue) => {
    if (currentVerdict === 'DENIED') {
      return 'DENIED';
    }

    if (currentNumericValue % 2 === 0) {
      if (currentNumericValue % 3 === 0 || currentNumericValue % 5 === 0) {
        return 'APPROVED';
      } else {
        return 'DENIED';
      }
    }
    return currentVerdict;
  }, '');

  process.stdout.write(finalOutcome + '\n');
}

const nodeFsModule = require('node:fs');
const inputPath = '/dev/stdin';
const sourceContent = nodeFsModule.readFileSync(inputPath, 'utf8');

processInput(sourceContent);