const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
const parsedNumber = parseFloat(rawContent);
const computedSquare = Math.pow(parsedNumber, 2);
console.log(computedSquare);
