const fileSystem = require("fs");

function determineTrailingZeroCount(inputNumber) {
  if (inputNumber < 5) {
    return 0;
  }
  const nextDivisor = Math.floor(inputNumber / 5);
  return nextDivisor + determineTrailingZeroCount(nextDivisor);
}

fileSystem.readFileSync("/dev/stdin", "utf8")
  .split('\n')
  .forEach(lineContent => {
    const numericValue = Number(lineContent);
    if (numericValue !== 0) {
      console.log(determineTrailingZeroCount(numericValue));
    }
  });
