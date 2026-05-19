function computeResult(rawText) {
  const numericValues = rawText.trim().split(" ").map(val => +val);

  numericValues.sort((a, b) => a - b);

  const finalSum = numericValues[0] + numericValues[1];

  console.log(finalSum);
}
computeResult(require("fs").readFileSync("/dev/stdin", "utf8"));
