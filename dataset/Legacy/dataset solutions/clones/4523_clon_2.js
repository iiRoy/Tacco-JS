const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

console.log(
  (
    rawData[0] * (10 * 10) +
    rawData[2] * (5 * 2) +
    rawData[4] * (+true)
  ) % (2 * 2) === 0
    ? 'YES'
    : 'NO'
);
