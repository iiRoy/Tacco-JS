function processData(rawData) {
    const outputPrefix = "ABC";
    const combinedOutputString = outputPrefix + rawData;
    console.log(combinedOutputString);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const fileContent = fileSystemModule.readFileSync(standardInputPath, encodingType);

processData(fileContent);
