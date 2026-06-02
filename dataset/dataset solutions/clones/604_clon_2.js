let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let numericValues = (rawData.trim()).split("\n").map(Number);

let minPrice = Math.min(numericValues[0], numericValues[1], numericValues[2]);

let minJuice = Math.min(numericValues[3], numericValues[4]);

console.log(minPrice + minJuice - 50);
