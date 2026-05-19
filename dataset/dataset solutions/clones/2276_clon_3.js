function processInputData(rawData) {
  const parsedValues = rawData.toString().split(" ");

  const firstNumericValue = parseInt(parsedValues[0], 10);
  const secondNumericValue = parseInt(parsedValues[1], 10);

  console.log(firstNumericValue, secondNumericValue);

  const calculatedProduct = 500 * firstNumericValue;

  let finalDecision;
  if (calculatedProduct > secondNumericValue) {
    finalDecision = "YES";
  } else {
    finalDecision = "NO";
  }
  console.log(finalDecision);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
