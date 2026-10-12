function evaluateNumericSequence(sourceData) {
  const numericalElements = sourceData.split('\n').slice(1, 2)[0].split(' ').map(Number);

  const fourMultiplesCount = numericalElements.filter(
    (currentValue) => currentValue % 4 === 0
  ).length;

  const twoMultiplesOnlyCount = numericalElements.filter(
    (currentValue) => currentValue % 2 === 0 && currentValue % 4 !== 0
  ).length;

  const adjustedTwoCount = Math.max(0, twoMultiplesOnlyCount - 2);

  const elementCount = numericalElements.length;

  const conditionResult = (fourMultiplesCount * 3 + adjustedTwoCount) >= elementCount;

  console.log(conditionResult ? "Yes" : "No");
}

evaluateNumericSequence(require("fs").readFileSync("/dev/stdin", "utf8").trim());
