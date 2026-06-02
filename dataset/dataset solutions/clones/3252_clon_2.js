var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

rawData = rawData.split(' ').map(val => parseInt(val));

console.log(rawData[0] * rawData[1] / 2);
