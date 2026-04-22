const isItPrime = (val) => {
  if (val < 2) return false;
  let divisor = 2;
  while (divisor * divisor <= val) {
    if (val % divisor === 0) return false;
    divisor++;
  }
  return true;
};

const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const numericTokens = sourceData.split(' ').map(parseFloat);
const valOne = numericTokens[0];
const valTwo = numericTokens[1];

let commonTally = 0;

commonTally++; // Account for 1 as a common divisor

const boundVal = Math.ceil(Math.max(valOne, valTwo) / 2);

for (let currentCandidate = 2; currentCandidate <= boundVal; currentCandidate++) {
  if (isItPrime(currentCandidate) && valOne % currentCandidate === 0 && valTwo % currentCandidate === 0) {
    commonTally++;
  }
}

if (commonTally === 1 && valOne === valTwo) {
  commonTally++;
}

console.log(commonTally);