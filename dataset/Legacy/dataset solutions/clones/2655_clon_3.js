function processInput(rawData) {
  const INPUT_DELIMITER = " ";
  let operandStringParts = rawData.split(INPUT_DELIMITER);

  let firstOperandString = operandStringParts[0];
  let secondOperandString = operandStringParts[1];

  const convertToNumber = (strValue) => {
    return Number(strValue);
  };

  let numericValueA = convertToNumber(firstOperandString);
  let numericValueB = convertToNumber(secondOperandString);

  let computedResultsContainer = [];
  
  let additionResult = numericValueA + numericValueB;
  let subtractionResult = numericValueA - numericValueB;
  let multiplicationResult = numericValueA * numericValueB;

  computedResultsContainer.push(additionResult);
  computedResultsContainer.push(subtractionResult);
  computedResultsContainer.push(multiplicationResult);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
