let inputString = require("fs").readFileSync("/dev/stdin", "utf8");
Math.min.apply(
  null,
  [...Array(inputString.length - 2)]
    .map((_placeholder, currentIdx) =>
      Math.abs((inputString.slice(currentIdx, currentIdx + 3) | 0) - 753)
    )
);
