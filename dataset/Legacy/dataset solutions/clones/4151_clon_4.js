const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');

let firstLineContent;
const newlinePosition = fileData.indexOf('\n');
if (newlinePosition !== -1) {
    firstLineContent = fileData.substring(0, newlinePosition);
} else {
    firstLineContent = fileData;
}

const linePartsMatch = firstLineContent.match(/^(\S*?)(?:\s(\S*?))?(?:.*)?$/);

const valueOne = Number(linePartsMatch[1]);
const valueTwo = Number(linePartsMatch[2]);

const finalCalculation = Math.floor((valueOne + valueTwo + 1) / 2);

console.log(finalCalculation);
