const parseInputValues = (rawInputData) => {
    const trimmedData = rawInputData.trim();
    const stringParts = trimmedData.split(' ');
    const numericValues = stringParts.map(strVal => parseInt(strVal, 10));
    return numericValues;
};

const determineFinalValue = (inputN, inputM) => {
    const twiceN = inputN * 2;
    let computedResult;

    if (twiceN <= inputM) {
        const differenceM = inputM - twiceN;
        const quarterOfDifference = Math.floor(differenceM / 4);
        computedResult = inputN + quarterOfDifference;
    } else {
        computedResult = Math.floor(inputM / 2);
    }
    return String(computedResult);
};

const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';

const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
const [valueN, valueM] = parseInputValues(rawInputContent);

const finalOutputString = determineFinalValue(valueN, valueM);

console.log(finalOutputString);
