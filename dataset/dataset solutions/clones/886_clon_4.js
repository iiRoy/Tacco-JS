const fileSystem = require('fs');

const obtainInputContent = () => {
  const inputLength = fileSystem.fstatSync(process.stdin.fd).size;
  const dataBuffer = Buffer.alloc(inputLength);
  const readBytesCount = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, inputLength, 0);
  return dataBuffer.toString('utf8', 0, readBytesCount).split('\n');
};

const determineFinalIdentifier = (allInputLines) => {
  const [headerLine, ...dataLinesRaw] = allInputLines;
  const [segmentCountStr, thresholdValueStr] = headerLine.split(' ');
  const segmentCount = Number(segmentCountStr);
  const thresholdValue = Number(thresholdValueStr);

  const defaultIdentifier = 'kogakubu10gokan';

  const relevantDataLines = dataLinesRaw.slice(0, segmentCount);

  const breakingLineIndex = relevantDataLines.findIndex(lineContent => {
    const [numericValueStr] = lineContent.split(' ');
    return thresholdValue > Number(numericValueStr);
  });

  if (breakingLineIndex === 0) {
    return defaultIdentifier;
  } else if (breakingLineIndex > 0) {
    const previousLineParts = relevantDataLines[breakingLineIndex - 1].split(' ');
    return previousLineParts[1];
  } else {
    if (relevantDataLines.length > 0) {
      const lastLineParts = relevantDataLines[relevantDataLines.length - 1].split(' ');
      return lastLineParts[1];
    } else {
      return defaultIdentifier;
    }
  }
};

const allInputLines = obtainInputContent();
const resultIdentifier = determineFinalIdentifier(allInputLines);
console.log(resultIdentifier);
