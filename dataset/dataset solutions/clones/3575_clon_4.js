"use strict";

function processInput(sourceData) {
  const dataLines = sourceData.split("\n");
  const initialValues = dataLines[0].split(" ");

  const limitValue = parseInt(initialValues[0], 10);
  const factorValue = parseInt(initialValues[1], 10);

  const computedComponents = [
    Math.pow(Math.floor(limitValue / factorValue), 3)
  ];

  if (factorValue % 2 === 0) {
    computedComponents.push(
      Math.pow(Math.floor((limitValue + factorValue / 2) / factorValue), 3)
    );
  }

  const finalResult = computedComponents.reduce((accumulated, current) => accumulated + current, 0);

  console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
