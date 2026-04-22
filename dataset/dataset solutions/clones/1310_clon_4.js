const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const initialSegments = sourceData.split('\n');

const haltIndex = initialSegments.indexOf('0');
const activeSegments = haltIndex === -1 ? initialSegments : initialSegments.slice(0, haltIndex);

const calculateDigitSum = (textualNumber) => Array.from(textualNumber).reduce((currentTotal, singleDigitChar) => currentTotal + Number(singleDigitChar), 0);

const resultantValues = activeSegments.map(calculateDigitSum);

resultantValues.forEach(outputValue => process.stdout.write(outputValue + '\n'));