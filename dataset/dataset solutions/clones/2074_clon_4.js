function processInputData(rawString) {
  const numericValues = rawString.split(" ").map(parseFloat);
  const firstNum = numericValues[0];
  const secondNum = numericValues[1];
  const thirdNum = numericValues[2];

  const intermediateDiff = thirdNum - firstNum - secondNum;

  let outcome = "No";

  if (intermediateDiff > 0 && Math.pow(intermediateDiff, 2) > 4 * firstNum * secondNum) {
    outcome = "Yes";
  }

  console.log(outcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
