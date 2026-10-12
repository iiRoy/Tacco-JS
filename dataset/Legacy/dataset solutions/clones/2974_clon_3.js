function processInputData(rawInputString) {
  const DELIMITER_CHAR = " ";
  let intermediateSegments = rawInputString.split(DELIMITER_CHAR);
  let inputSegments = intermediateSegments;
  console.log(inputSegments);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

const fileContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);

processInputData(fileContent);
