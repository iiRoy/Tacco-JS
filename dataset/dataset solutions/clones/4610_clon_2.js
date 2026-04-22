"use strict";

const processInputData = (inputString) => {
  inputString = inputString.trim().split("\n");

  const numberOfItems = parseInt(inputString[0].split(" ")[0]);
  const capacityLimit = parseInt(inputString[0].split(" ")[1]);

  const itemDetails = inputString
    .slice(1, numberOfItems + 1)
    .map((itemLine) => itemLine.split(" ").map((valStr) => parseInt(valStr)));

  let valueTable = [...Array(numberOfItems + 1)].map(() =>
    [...Array(capacityLimit + 1)].fill(0)
  );

  for (let itemIndex = 1; itemIndex < numberOfItems + 1; itemIndex++) {
    const itemWeight = itemDetails[itemIndex - 1][0];
    const itemValue = itemDetails[itemIndex - 1][1];

    for (let currentCapacity = 0; currentCapacity < capacityLimit + 1; currentCapacity++) {
      if (itemWeight > currentCapacity) {
        // If the individual item's weight surpasses the current sub-capacity,
        // we cannot include it, so we carry over the maximum value from the previous row.
        valueTable[itemIndex][currentCapacity] = valueTable[itemIndex - 1][currentCapacity];
      } else {
        // Otherwise, decide between not including the current item
        // or including it and adding its value to the maximum value achievable
        // with the remaining capacity (currentCapacity - itemWeight) from the previous row.
        valueTable[itemIndex][currentCapacity] = Math.max(
          valueTable[itemIndex - 1][currentCapacity],
          itemValue + valueTable[itemIndex - 1][currentCapacity - itemWeight]
        );
      }
    }
  }

  console.log(valueTable[numberOfItems][capacityLimit]);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));