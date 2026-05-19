const appSettings = Object.freeze({
  inputSourcePath: '/dev/stdin',
  lineDelimiter: process.platform === 'win32' ? '\r\n' : '\n'
});

const acquireAndParseInput = (settings) => {
  const fileSystemModule = require('fs');
  const rawFileContent = fileSystemModule.readFileSync(settings.inputSourcePath, 'ascii');
  // The original code splits into at most 2 parts.
  const parsedLines = rawFileContent.split(settings.lineDelimiter, 2);
  return parsedLines;
};

const inputDataSegments = acquireAndParseInput(appSettings);

const primaryText = inputDataSegments[0];
const targetPattern = inputDataSegments[1];

const findPatternOccurrences = (sourceText, patternToLocate) => {
  const discoveredIndices = [];
  let currentScanPosition = 0;

  while ((currentScanPosition = sourceText.indexOf(patternToLocate, currentScanPosition)) !== -1) {
    discoveredIndices.push(currentScanPosition);
    currentScanPosition++;
  }
  return discoveredIndices;
};

const allMatchPositions = findPatternOccurrences(primaryText, targetPattern);

if (allMatchPositions.length > 0) {
  const formattedOutput = allMatchPositions.join(appSettings.lineDelimiter);
  console.log(formattedOutput);
}
