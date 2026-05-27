function computeOutcome(sourceText) {
  const [initialQuantity, deductionAmount] = sourceText.split(' ').map(valStr => Number(valStr));

  const finalResult = Math.max(0, initialQuantity - deductionAmount);

  console.log(String(finalResult));
}

computeOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));
