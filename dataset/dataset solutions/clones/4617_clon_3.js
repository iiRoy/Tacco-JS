function readStandardInputContent() {
  const fileSystemModule = require('fs');
  const standardInputPath = '/dev/stdin';
  const encodingFormat = 'utf8';
  return fileSystemModule.readFileSync(standardInputPath, encodingFormat);
}

function extractAndUppercaseFirstChar(sourceString) {
  if (typeof sourceString !== 'string' || sourceString.length === 0) {
    return '';
  }
  const initialCharacter = sourceString.charAt(0);
  return initialCharacter.toUpperCase();
}

function processInputData(rawInputContent) {
  const cleanedInput = rawInputContent.trim();

  const segmentDelimiter = " ";

  const inputSegments = cleanedInput.split(segmentDelimiter);

  const segmentOne = inputSegments[0];
  const segmentTwo = inputSegments[1];
  const segmentThree = inputSegments[2];

  const firstCharOfSegmentOne = extractAndUppercaseFirstChar(segmentOne);
  const firstCharOfSegmentTwo = extractAndUppercaseFirstChar(segmentTwo);
  const firstCharOfSegmentThree = extractAndUppercaseFirstChar(segmentThree);

  const finalOutputString = `${firstCharOfSegmentOne}${firstCharOfSegmentTwo}${firstCharOfSegmentThree}`;
  console.log(finalOutputString);
}

processInputData(readStandardInputContent());
