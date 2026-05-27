let inputString = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const partsArray = inputString.split(' ');
const valA = Number(partsArray[0]);
const valB = Number(partsArray[1]);
const valC = Number(partsArray[2]);

let isConditionMet = false;

if (valA < valB) {
  if (valB < valC) {
    isConditionMet = true;
  }
}

if (isConditionMet) {
  console.log('Yes');
} else {
  console.log('No');
}
