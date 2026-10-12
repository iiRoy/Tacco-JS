const processInput = (inputContent) => {
  const contentLines = inputContent.split("\n");
  const queryQuantity = Number(contentLines.shift());

  contentLines.slice(0, queryQuantity).forEach((currentLine) => {
    const [firstValue, secondValue] = currentLine.split(" ").map(Number);

    const minimumOperand = Math.min(firstValue, secondValue);
    const maximumOperand = Math.max(firstValue, secondValue);

    const productOfOperands = minimumOperand * maximumOperand;
    const upperIterationBoundExclusive = Math.ceil(Math.sqrt(productOfOperands));

    let accumulatedResult = (minimumOperand - 1) * 2;
    accumulatedResult += (minimumOperand < maximumOperand - 1 ? 1 : 0);

    const iterationStartPoint = minimumOperand + 1;

    if (iterationStartPoint < upperIterationBoundExclusive) {
      const iterationSequence = Array.from(
        { length: upperIterationBoundExclusive - iterationStartPoint },
        (_, index) => iterationStartPoint + index
      );

      const incrementalSummation = iterationSequence.reduce((currentSum, currentIterationElement) => {
        const conditionSatisfied =
          currentIterationElement * currentIterationElement <= productOfOperands &&
          productOfOperands < currentIterationElement * (currentIterationElement + 1);
        return currentSum + (conditionSatisfied ? 1 : 2);
      }, 0);

      accumulatedResult += incrementalSummation;
    }

    console.log(accumulatedResult);
  });
};

const executeComputation = (sourceData) => {
  processInput(sourceData);
};

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8"));
