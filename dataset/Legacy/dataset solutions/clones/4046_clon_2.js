const [firstValue, secondValue, thirdValue] = require("fs").readFileSync("/dev/stdin", "utf8").split("\n").map(Number);
console.log((firstValue - secondValue) % thirdValue);
