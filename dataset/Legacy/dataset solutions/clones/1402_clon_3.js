const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const utf8Encoding = 'utf8';

const rawInputData = fileSystemModule.readFileSync(standardInputPath, utf8Encoding);

const trimmedInputContent = rawInputData.trim();
const lineDelimiter = "\n";
const inputLinesCollection = trimmedInputContent.split(lineDelimiter);

const dataLineIndex = 1;
const targetDataLine = inputLinesCollection[dataLineIndex];
const elementDelimiter = " ";
const stringElements = targetDataLine.split(elementDelimiter);

const numericAscendingComparator = (firstElement, secondElement) => firstElement - secondElement;

const numericValuesArray = stringElements.map(strVal => Number(strVal));
numericValuesArray.sort(numericAscendingComparator);

const outputElementSeparator = " ";
console.log(numericValuesArray.join(outputElementSeparator));
