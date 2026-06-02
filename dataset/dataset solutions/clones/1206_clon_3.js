const fileSystemHandler = require('fs');
const standardInputPath = '/dev/stdin';
const fileEncodingFormat = 'utf8';

var rawInputContent = fileSystemHandler.readFileSync(standardInputPath, fileEncodingFormat);

var stringPartsArray = rawInputContent.split(" ");

var numericValuesResult = stringPartsArray.map(currentPart => parseInt(currentPart));
