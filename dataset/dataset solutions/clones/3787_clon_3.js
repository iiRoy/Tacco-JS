const LINE_BREAK_CHAR = "\n";
const SPACE_CHAR = " ";
const EMPTY_STRING = "";

function calculateMaximumOperationResult(rawData) {
  const trimmedInput = rawData.trim();
  const inputParts = trimmedInput.split(SPACE_CHAR);
  const numericInputs = inputParts.map(val => Number(val));

  const firstOperand = numericInputs[0];
  const secondOperand = numericInputs[1];

  const INITIAL_COMPARISON_VALUE = -1000000;
  let currentMaximumValue = INITIAL_COMPARISON_VALUE;

  const sumOperationResult = firstOperand + secondOperand;
  const differenceOperationResult = firstOperand - secondOperand;
  const productOperationResult = firstOperand * secondOperand;

  currentMaximumValue = Math.max(currentMaximumValue, sumOperationResult);
  currentMaximumValue = Math.max(currentMaximumValue, differenceOperationResult);
  currentMaximumValue = Math.max(currentMaximumValue, productOperationResult);

  return parseInt(currentMaximumValue, 10);
}

// Self-executing anonymous function to handle environment-specific execution
((initialInputString) => {
  const isNodeEnv = typeof require !== "undefined";

  if (isNodeEnv) {
    const fileSystemModule = require("fs");
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    console.log(calculateMaximumOperationResult(standardInputContent));
  } else {
    // Browser execution path
    let processedInputForBrowser = initialInputString.split(LINE_BREAK_CHAR).slice(1, -1).join(LINE_BREAK_CHAR);

    let functionExecutionResult;
    try {
      functionExecutionResult = calculateMaximumOperationResult(processedInputForBrowser);
    } catch (executionError) {
      functionExecutionResult = executionError.stack || executionError.message;
    }

    let resultValueType = typeof functionExecutionResult;
    // Convert result to string if it's not already, for display purposes
    if (resultValueType !== "string") {
      functionExecutionResult = JSON.stringify(functionExecutionResult);
    }

    // Constructing and appending elements to the body using jQuery
    const outputForm = $("<form>");
    const displayComponents = [
      [10, processedInputForBrowser],
      0,
      [1, resultValueType],
      0,
      [10, functionExecutionResult]
    ];

    const generatedElements = displayComponents.map(componentData => {
      if (componentData) {
        return $("<textarea>", {
          rows: componentData[0],
          cols: 40,
          text: componentData[1]
        });
      } else {
        return $("<br>");
      }
    });

    outputForm.append(generatedElements);
    outputForm.appendTo("body");
  }
})(`
-1000 1000
`);
