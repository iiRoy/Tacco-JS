const dataSource = require("node:fs");
const currentEvaluation = dataSource.readFileSync(0, "utf8");

const aggregatedOutcome = currentEvaluation
  .trim()
  .split('\n')
  .sort()
  .reduce((accumulatorObject, currentItem) => {
    let { storageArray, maximumValue, currentCounter, lastProcessed } = accumulatorObject;

    if (currentItem === lastProcessed) {
      currentCounter++;
    } else {
      if (currentCounter > maximumValue) {
        maximumValue = currentCounter;
        storageArray = [lastProcessed];
      } else if (currentCounter === maximumValue) {
        storageArray.push(lastProcessed);
      }
      lastProcessed = currentItem;
      currentCounter = 0;
    }
    return { storageArray, maximumValue, currentCounter, lastProcessed };
  }, { storageArray: [], maximumValue: 0, currentCounter: 0, lastProcessed: 0 });

console.log(aggregatedOutcome.storageArray.join('\n'));