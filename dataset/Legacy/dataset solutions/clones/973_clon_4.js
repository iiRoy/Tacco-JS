const applicationSettings = { sourcePath: '/dev/stdin', lineSeparator: '\n' };

const fileContent = require('node:fs').readFileSync(applicationSettings.sourcePath, 'ascii');
const contentSegments = fileContent.split(applicationSettings.lineSeparator, 2);

const primaryString = contentSegments[0];
const targetSubstring = contentSegments[1];

const locateAllOccurrences = (sourceString, patternString, currentSearchOffset = 0, foundIndicesAccumulator = []) => {
  const nextMatchIndex = sourceString.indexOf(patternString, currentSearchOffset);

  if (nextMatchIndex === -1) {
    return foundIndicesAccumulator;
  }

  foundIndicesAccumulator.push(nextMatchIndex);
  return locateAllOccurrences(sourceString, patternString, nextMatchIndex + 1, foundIndicesAccumulator);
};

const discoveredPositions = locateAllOccurrences(primaryString, targetSubstring);

if (discoveredPositions.length > 0) {
  console.log(discoveredPositions.join('\n'));
}
