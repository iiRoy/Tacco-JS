let inputData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[0].split(' ');

// Parse the first numeric value from the input array
let firstVal = inputData[0] * 1;

// Parse the second numeric value from the input array
let secondVal = inputData[1] * 1;

// Parse the third numeric value from the input array
let thirdVal = inputData[2] * 1;

// Determine and output the result based on equality comparisons
console.log(firstVal === secondVal ? thirdVal : firstVal === thirdVal ? secondVal : firstVal);
