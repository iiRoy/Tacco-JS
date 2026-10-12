function checkCondition(valA, valB, valC) {
  const isFirstValueNonZero = valA !== 0;
  const areAllValuesIdentical = valA === valB && valB === valC;
  return isFirstValueNonZero && areAllValuesIdentical;
}

function processInputData(rawInputString) {
  const trimmedString = rawInputString.trim();
  const stringArray = trimmedString.split(/\s/);
  const numericArray = stringArray.map(currentString => Number(currentString));

  const firstElement = numericArray[0];
  const secondElement = numericArray[1];
  const thirdElement = numericArray[2];

  const finalResult = checkCondition(firstElement, secondElement, thirdElement);

  console.log(finalResult ? "Yes" : "No");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
