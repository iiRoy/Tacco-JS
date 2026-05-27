function processInputData(rawData) {
  const parsedValues = rawData.split(" ");

  const numericComponents = parsedValues.map(component => parseInt(component, 10));

  const firstValue = numericComponents[0];
  const secondValue = numericComponents[1];
  const thirdValue = numericComponents[2];

  const areAllIdentical = (firstValue === secondValue) && (secondValue === thirdValue);

  const finalMessage = areAllIdentical ? "Yes" : "No";
  console.log(finalMessage);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
