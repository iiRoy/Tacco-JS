var entryIndex = 0, currentNumericValue;
for (
  ;
  (currentNumericValue = require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split(/\s/)[entryIndex++]);
) {
  for (
    var cumulativeSum = 0, loopIteration = 10;
    loopIteration--;
    loopIteration % 2
      ? (currentNumericValue *= 2)
      : (currentNumericValue /= 3)
  ) {
    cumulativeSum += +currentNumericValue;
  }
  console.log(cumulativeSum.toFixed(8));
}
