function processSequence(sourceData) {
  const dataLines = sourceData.split('\n');
  const sequenceLength = Number(dataLines[0]);
  const numericalElements = dataLines[1].split(' ').map(Number);

  const initialAccumulatorState = {
    totalAdjustmentCost: 0,
    currentMaximumValue: numericalElements[0]
  };

  const finalAccumulation = numericalElements.slice(1).reduce((accumulator, elementValue) => {
    let elementAdjustment = 0;
    let nextMaximum = accumulator.currentMaximumValue;

    if (elementValue < accumulator.currentMaximumValue) {
      elementAdjustment = accumulator.currentMaximumValue - elementValue;
    } else {
      nextMaximum = elementValue;
    }

    return {
      totalAdjustmentCost: accumulator.totalAdjustmentCost + elementAdjustment,
      currentMaximumValue: nextMaximum
    };
  }, initialAccumulatorState);

  return finalAccumulation.totalAdjustmentCost;
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processSequence(fileContent));
