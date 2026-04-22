"use strict";
const colorSwitch = new Map([['R', 'B'], ['B', 'R']]);

const inputOutputFacility = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

const fetchLine = async () => {
  return new Promise(resolve => {
    inputOutputFacility.once("line", resolve);
  });
};

const performQuery = async (itemIndices) => {
  console.log("?", itemIndices.join(" "));
  return await fetchLine();
};

const processingUnit = async () => {
  let finalItemStates = [];
  let itemsCount = parseInt(await fetchLine(), 10);
  let totalItemCount = 2 * itemsCount;

  let initialSelection = Array.from({ length: itemsCount }, (_, idx) => idx + 1);
  let initialResponse = await performQuery(initialSelection);
  let firstMajority = initialResponse[0];

  let lowerBound = 1;
  let upperBound = itemsCount + 1;
  let transitionPoint;

  while (upperBound - lowerBound > 1) {
    let midPoint = Math.floor((upperBound + lowerBound + 1) / 2);
    let testSelection = Array.from({ length: itemsCount }, (_, idx) => midPoint + idx);
    let testResponse = await performQuery(testSelection);

    if (firstMajority !== testResponse[0]) {
      upperBound = midPoint;
    } else {
      lowerBound = midPoint;
    }
  }
  transitionPoint = upperBound;

  finalItemStates[transitionPoint - 1 - 1] = firstMajority;
  finalItemStates[transitionPoint - 1 - 1 + itemsCount] = colorSwitch.get(firstMajority);

  let baseSetA_raw = [];
  let baseSetB_mapped = [];
  let baseSetA_indices = new Set();

  for (let k = 0; k < itemsCount - 1; k++) {
    let valA = (transitionPoint + k) % totalItemCount;
    baseSetA_raw.push(valA);
    baseSetA_indices.add(valA);

    let valB = (valA + itemsCount - 1) % totalItemCount + 1;
    baseSetB_mapped.push(valB);
  }

  for (let itemIndex = 1; itemIndex <= totalItemCount; itemIndex++) {
    if (finalItemStates[itemIndex - 1]) {
      continue;
    }

    let queryItems;
    let queriedResponse;

    if (baseSetA_indices.has(itemIndex - 1)) {
      queryItems = [...baseSetB_mapped, itemIndex];
    } else {
      queryItems = [...baseSetA_raw, itemIndex];
    }

    queriedResponse = await performQuery(queryItems);
    finalItemStates[itemIndex - 1] = queriedResponse[0];
  }

  console.log("!", finalItemStates.join(""));
  inputOutputFacility.close();
};

processingUnit();