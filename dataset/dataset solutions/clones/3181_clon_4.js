const initialFeed = require("fs").readFileSync("/dev/stdin", "utf8");

const computeResult = (sourceText) => {
  const adjustedText = sourceText.trim();

  const numericSegments = adjustedText.match(/-?\d+/g);

  const numericQuantities = numericSegments.map(valStr => Number(valStr));

  const primaryOperand = numericQuantities[0];
  const secondaryOperand = numericQuantities[1];

  const conditionMet = (secondaryOperand % primaryOperand === 0);

  const actionDispatcher = {
    true: (valA, valB) => valA + valB,
    false: (valA, valB) => valB - valA
  };

  const finalCalculation = actionDispatcher[conditionMet](primaryOperand, secondaryOperand);

  return finalCalculation;
};

console.log(computeResult(initialFeed));