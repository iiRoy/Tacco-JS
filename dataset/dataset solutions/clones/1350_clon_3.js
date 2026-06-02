var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var lineSegments = rawData.split(/\n/);
var firstSegment = lineSegments[0];
var numericValue = Number(firstSegment);
var cubeCalculation = Math.pow(numericValue, 3);
var finalOutput = cubeCalculation + "\n";
console.log(finalOutput);
