const fileSystemModule = require('fs');

const applicationSettings = {
  inputPath: '/dev/stdin',
  lineDelimiter: '\n'
};

const retrieveAndProcessInput = (settings) => {
  const fileContentBuffer = fileSystemModule.readFileSync(settings.inputPath, 'ascii');
  const contentLines = fileContentBuffer.split(settings.lineDelimiter, 2);
  return contentLines;
};

const locateAllPatternOccurrences = (mainText, searchPattern) => {
  const discoveredIndices = [];
  let currentScanPosition = 0;
  let foundPositionCandidate;

  while ((foundPositionCandidate = mainText.indexOf(searchPattern, currentScanPosition)) !== -1) {
    discoveredIndices.push(foundPositionCandidate);
    currentScanPosition = foundPositionCandidate + 1;
  }
  return discoveredIndices;
};

const rawInputLines = retrieveAndProcessInput(applicationSettings);

const [sourceText, targetPattern] = rawInputLines;

const allMatchIndices = locateAllPatternOccurrences(sourceText, targetPattern);

console.log(allMatchIndices.join('\n'));
