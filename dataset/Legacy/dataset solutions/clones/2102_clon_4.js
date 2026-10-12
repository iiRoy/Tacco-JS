function processInputAndCompute(rawInput) {
  "use strict";
  const [valA, valB] = rawInput.split('\n').at(0).split(' ').map(str => parseInt(str, 10));

  const determineCeilingValue = (base, factor, addition) => Math.ceil(base * factor + addition);

  const rangeOne = {
    lower: determineCeilingValue(valA, 12.5, 0),
    upper: determineCeilingValue(valA, 12.5, 11.5)
  };

  const rangeTwo = {
    lower: determineCeilingValue(valB, 10, 0),
    upper: determineCeilingValue(valB, 10, 9)
  };

  const result = (rangeOne.upper < rangeTwo.lower || rangeTwo.upper < rangeOne.lower)
    ? -1
    : Math.max(rangeOne.lower, rangeTwo.lower);

  console.log(result);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
