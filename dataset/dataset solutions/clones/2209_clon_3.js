const readInputFileContent = (filePath) => {
  const fileSystemModule = require('fs');
  return fileSystemModule.readFileSync(filePath, 'utf8');
};

const checkSegmentEquality = (segmentsArray) => {
  if (segmentsArray.length < 2) {
    return false;
  }
  return segmentsArray[0] === segmentsArray[1];
};

function processInputData(inputLine) {
  const segmentDelimiter = ' ';
  const parsedSegments = inputLine.split(segmentDelimiter);

  const areSegmentsIdentical = checkSegmentEquality(parsedSegments);

  let finalOutput;
  if (areSegmentsIdentical) {
    finalOutput = 'Yes';
  } else {
    finalOutput = 'No';
  }
  console.log(finalOutput);
}

const standardInputFilePath = '/dev/stdin';
const rawInputString = readInputFileContent(standardInputFilePath);
processInputData(rawInputString);
