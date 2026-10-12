const fileSystemHandler = require('fs');
const LINE_SEPARATOR_CHAR = '\n';
const ELEMENT_SEPARATOR_CHAR = ' ';
const DESIRED_LINE_INDEX = 1;

function processAndReverseElements(inputString, separator) {
    const stringElements = inputString.split(separator);
    stringElements.reverse();
    return stringElements.join(separator);
}

const rawInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
const allContentLines = rawInputContent.split(LINE_SEPARATOR_CHAR);

const targetLineContent = allContentLines[DESIRED_LINE_INDEX];
const formattedOutput = processAndReverseElements(targetLineContent, ELEMENT_SEPARATOR_CHAR);

console.log(formattedOutput);
