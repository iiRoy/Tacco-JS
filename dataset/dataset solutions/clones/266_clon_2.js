let inputNumbers = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/);
let squareOfFirst;
for (let pairIndex = 0; inputNumbers[pairIndex] * inputNumbers[pairIndex + 1] !== 0; pairIndex += 2) {
    squareOfFirst = inputNumbers[pairIndex] * inputNumbers[pairIndex];
    console.log(inputNumbers[pairIndex] * Math.sqrt(4 * inputNumbers[pairIndex + 1] * inputNumbers[pairIndex + 1] + squareOfFirst) + squareOfFirst);
}
