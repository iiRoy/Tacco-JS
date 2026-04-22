const textualData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const lineFragments = textualData.trim().split('\n');
const firstLineContent = lineFragments[0];
const numericalComponents = firstLineContent.split(' ').map(val => +val);

const elementX = numericalComponents[0];
const elementY = numericalComponents[1];

let finalResult;
if (elementY % elementX === 0) {
    finalResult = elementX - elementY;
} else {
    finalResult = elementX + elementY;
}

console.log(finalResult);