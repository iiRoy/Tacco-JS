function processInputData(sourceDataString) {
  const numericalComponents = sourceDataString.split(' ').map(token => Number(token));

  if (numericalComponents.length < 2) {
    console.error("Error: Insufficient numerical input provided. Expected at least two numbers.");
    return;
  }

  const firstValue = numericalComponents[0];
  const secondValue = numericalComponents[1];

  if (!Number.isFinite(firstValue) || !Number.isFinite(secondValue)) {
    console.error(`Error: Invalid numerical input detected. Received '${firstValue}' and '${secondValue}'.`);
    return;
  }

  let rawProductResult = firstValue * secondValue;

  const finalCeiledValue = Math.ceil(rawProductResult);

  console.log(`Computed Ceiling Result: ${finalCeiledValue}`);
}

const fileContent = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });

processInputData(fileContent);