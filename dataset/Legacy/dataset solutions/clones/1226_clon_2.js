const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const parsedValues = rawData.split(' ').map( (strNum) => parseInt(strNum, 10) );

let boundaryWidth = parsedValues[0];
let boundaryHeight = parsedValues[1];
let centerX = parsedValues[2];
let centerY = parsedValues[3];
let radiusVal = parsedValues[4];

let leftEdge = centerX - radiusVal;
let rightEdge = centerX + radiusVal;
let topEdge = centerY - radiusVal;
let bottomEdge = centerY + radiusVal;

const isWithinBounds = (0 <= leftEdge) && (rightEdge <= boundaryWidth) && (0 <= topEdge) && (bottomEdge <= boundaryHeight);

if (isWithinBounds) {
  console.log('Yes');
} else {
  console.log('No');
}
