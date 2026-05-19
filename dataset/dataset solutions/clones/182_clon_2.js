productAccumulator = 0,
valueSum = 0,
entryCounter = 0,
require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split('\n')
  .map(function(inputLine) {
    let lineSegments = inputLine.split(',');
    productAccumulator += lineSegments[0] * lineSegments[1];
    valueSum += +lineSegments[1];
    entryCounter++;
  }),
console.log(productAccumulator + '\n' + ~~(valueSum / entryCounter + 0.5));
