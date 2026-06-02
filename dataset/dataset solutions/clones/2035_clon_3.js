"use strict";

function parseNumbers(line) {
  return line.trim().split(" ").map(value => parseInt(value, 10));
}

function takeBestValues(values, amount) {
  values.sort((left, right) => right - left);
  return values.slice(0, amount);
}

function replaceLowerValues(selectedValues, replacementValues) {
  for (let replacementIndex = 0; replacementIndex < replacementValues.length; replacementIndex++) {
    const candidateValue = replacementValues[replacementIndex];

    for (let selectedIndex = 0; selectedIndex < selectedValues.length; selectedIndex++) {
      if (candidateValue > selectedValues[selectedIndex]) {
        selectedValues[selectedIndex] = candidateValue;
        break;
      }
    }
  }

  return selectedValues;
}

function sumValues(values) {
  let total = 0;

  for (let index = 0; index < values.length; index++) {
    total += values[index];
  }

  return total;
}

function main(inputLines) {
  const config = parseNumbers(inputLines[0]);
  const requiredRed = config[0];
  const requiredGreen = config[1];

  const redApples = parseNumbers(inputLines[1]);
  const greenApples = parseNumbers(inputLines[2]);
  const colorlessApples = parseNumbers(inputLines[3]);

  const bestRed = takeBestValues(redApples, requiredRed);
  const bestGreen = takeBestValues(greenApples, requiredGreen);
  const bestColorless = takeBestValues(colorlessApples, requiredRed + requiredGreen);

  const selectedApples = bestRed.concat(bestGreen);

  selectedApples.sort((left, right) => right - left);

  const improvedSelection = replaceLowerValues(selectedApples, bestColorless);

  console.log(sumValues(improvedSelection));
}

main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));