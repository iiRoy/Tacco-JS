'use strict';
const processInputData = incomingData => {
  const itemCount = parseInt(incomingData[0].split(' ')[0]),
        timeConstraint = parseInt(incomingData[0].split(' ')[1]);
  let minimumFoundCost = 99999;
  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    let currentItemCost = parseInt(incomingData[itemIndex + 1].split(' ')[0]),
        currentItemDuration = parseInt(incomingData[itemIndex + 1].split(' ')[1]);
    if (minimumFoundCost > currentItemCost && timeConstraint >= currentItemDuration) {
      minimumFoundCost = currentItemCost;
    }
  }
  console.log(minimumFoundCost === 99999 ? 'NO_VALID_ENTRY' : minimumFoundCost);
};
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));