const processInputData = (rawData) => {
  const [firstLineContent] = rawData.split('\n');
  const [firstNumber, secondNumber] = firstLineContent.split(' ').map(Number);

  const computePairCount = (value) => Math.max(0, value * (value - 1) / 2);

  const resultA = computePairCount(firstNumber);
  const resultB = computePairCount(secondNumber);

  return resultA + resultB;
};

console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));
