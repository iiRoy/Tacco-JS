function ProcessInput(rawData) {
  // This function processes the given raw data to perform a calculation.
  const numericValues = rawData.split(" ").map(Number);

  let firstNum = numericValues[0];
  let secondNum = numericValues[1];

  console.log(firstNum * secondNum / (firstNum + secondNum));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
