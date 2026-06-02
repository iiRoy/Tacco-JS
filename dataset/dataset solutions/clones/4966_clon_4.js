const rawInputData = require("fs").readFileSync("/dev/stdin", "UTF-8").trim();
const numericDimensions = rawInputData.split("\n").map(parseFloat);
const firstBase = numericDimensions[0];
const secondBase = numericDimensions[1];
const altitude = numericDimensions[2];
console.log(((firstBase + secondBase) / 2) * altitude);
