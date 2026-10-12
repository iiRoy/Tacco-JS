const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedValues = inputSource.trim().match(/\d+/g);

const valA = Number(parsedValues[0]);
const valB = Number(parsedValues[1]);
const valC = Number(parsedValues[2]);

const factorC = [1, 2][+(valC !== 0)];

const termNumerator = (valA - valC) * (valB - 1);
const termDenominator = valA * valA;

const computedResult = (factorC * termNumerator) / termDenominator;

console.log(String(computedResult));
