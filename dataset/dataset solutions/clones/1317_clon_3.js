const fileSystemModule = require('fs');
let rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
let linesArray = rawInputContent.split('\n');

const primaryLine = linesArray[0];
const secondaryLine = linesArray[1];

function createDoubledString(originalStr) {
    const firstPart = originalStr;
    const secondPart = originalStr;
    return firstPart + secondPart;
}

const constructedSearchString = createDoubledString(primaryLine);
const patternToFind = secondaryLine;

function doesStringContainPattern(mainStr, subStr) {
    const checkResult = mainStr.includes(subStr);
    return checkResult;
}

const foundMatch = doesStringContainPattern(constructedSearchString, patternToFind);

const POSITIVE_OUTCOME = 'Yes';
const NEGATIVE_OUTCOME = 'No';

if (foundMatch) {
    console.log(POSITIVE_OUTCOME);
} else {
    console.log(NEGATIVE_OUTCOME);
}
