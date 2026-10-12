const fileSystem = require('fs');

const segmentInput = (sourceData) => sourceData.split('\n');

const processData = (rawText) => {
  const dataSegments = segmentInput(rawText);
  const relevantString = dataSegments[1];
  const searchPattern = /ABC/g;
  const foundMatches = relevantString.match(searchPattern);
  const totalOccurrences = foundMatches ? foundMatches.length : 0;
  console.log(totalOccurrences);
};

processData(fileSystem.readFileSync('/dev/stdin', 'utf8'));
