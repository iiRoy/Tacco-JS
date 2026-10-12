const getTargetPosition = (dataItems, targetValue) => {
    const foundElementIndex = dataItems.findIndex(currentItem => currentItem === targetValue);
    const calculatedPosition = foundElementIndex + 1;
    return calculatedPosition;
};

const processInput = (inputString) => {
    const tokenList = inputString.split(" ");
    const ZERO_STRING_TARGET = "0";
    const finalOutputValue = getTargetPosition(tokenList, ZERO_STRING_TARGET);
    console.log(finalOutputValue);
};

const fileSystemUtility = require("fs");
const rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

processInput(rawInputContent);
