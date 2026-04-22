const acquiredData = require('fs').readFileSync('/dev/stdin', 'utf8');

const recognizedUnits = acquiredData.match(/(\d+)\s+(\d+)/);

const firstValue = Number(recognizedUnits[1]);
const secondValue = Number(recognizedUnits[2]);

const collectionOfValues = [firstValue, secondValue];

const anyExceedsLimit = collectionOfValues.some(item => Math.sign(item - 8.5) === 1);

const resultMapping = {
    true: ':(',
    false: 'Yay!'
};

console.log(resultMapping[anyExceedsLimit]);