function processInputData(dataValue) {
    const MINIMUM_ACCEPTANCE_VALUE = 30;
    const isDataValid = dataValue >= MINIMUM_ACCEPTANCE_VALUE;

    const finalOutput = isDataValid ? 'Yes' : 'No';

    console.log(finalOutput);
}

const fileSystemUtility = require('fs');
const inputSourcePath = '/dev/stdin';
const rawInputBuffer = fileSystemUtility.readFileSync(inputSourcePath, 'utf8');

processInputData(rawInputBuffer);
