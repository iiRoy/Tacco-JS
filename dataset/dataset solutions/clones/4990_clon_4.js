function processInputAndCalculate(rawText) {
  const parts = rawText.replace(/\n+$/, '').split(/\n/);

  const totalIterations = Number(parts[0]);
  const switchPoint = Number(parts[1]);
  const firstValue = Number(parts[2]);
  const secondValue = Number(parts[3]);

  const iterationsForFirstValue = Math.min(totalIterations, switchPoint);
  const iterationsForSecondValue = totalIterations - iterationsForFirstValue;

  const finalSum = (iterationsForFirstValue * firstValue) + (iterationsForSecondValue * secondValue);

  console.log(finalSum);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
