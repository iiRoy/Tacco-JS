const evaluateEquality = (sourceText) => {
  const numericalElements = sourceText.split(' ').map(Number);
  const [valA, valB, valC] = numericalElements;

  const comparisonResult = (Math.max(valA, valB, valC) === Math.min(valA, valB, valC));

  const decisionTable = new Map([
    [true, "Yes"],
    [false, "No"]
  ]);

  return decisionTable.get(comparisonResult);
};

console.log(evaluateEquality(require("fs").readFileSync("/dev/stdin", "utf8")));