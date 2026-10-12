const processInput = require("fs").readFileSync("/dev/stdin", "utf8");
const initialValues = processInput.split("\n")[0].split(/\s/).map(Number);

const initialFirstElement = initialValues[0];
const initialSecondElement = initialValues[1];
const operationCount = initialValues[2];

const finalElements = Array.from({ length: operationCount }, (_, stepIndex) => stepIndex + 1)
  .reduce((currentElements, currentIteration) => {
    let [elementA, elementB] = currentElements;

    const isOddIteration = currentIteration % 2 === 1;

    const valueToProcess = Math.floor((isOddIteration ? elementA : elementB) / 2);

    if (isOddIteration) {
      elementB += valueToProcess;
      elementA = valueToProcess;
    } else {
      elementA += valueToProcess;
      elementB = valueToProcess;
    }

    return [elementA, elementB];
  }, [initialFirstElement, initialSecondElement]);

console.log("%d %d", finalElements[0], finalElements[1]);
