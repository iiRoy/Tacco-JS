const fs = require('fs');

const calculateSumWithMaxHalved = (accumulatorState, currentNumericValue, overallMaxValue) => {
  let valueToAggregate;
  let newMaxFoundStatus = accumulatorState.maxFound;

  if (!accumulatorState.maxFound && currentNumericValue === overallMaxValue) {
    valueToAggregate = currentNumericValue / 2;
    newMaxFoundStatus = true;
  } else {
    valueToAggregate = currentNumericValue;
  }

  return {
    maxFound: newMaxFoundStatus,
    totalSum: accumulatorState.totalSum + valueToAggregate
  };
};

const processInputData = (rawData) => {
  const numericValues = rawData.slice(1).map(Number);

  const overallMaxValue = Math.max(...numericValues);

  const initialAccumulatorState = { maxFound: false, totalSum: 0 };

  const finalAccumulationResult = numericValues.reduce((currentAccumulator, currentNumericValue) => {
    return calculateSumWithMaxHalved(currentAccumulator, currentNumericValue, overallMaxValue);
  }, initialAccumulatorState);

  const finalCalculatedSum = finalAccumulationResult.totalSum;

  console.log(finalCalculatedSum);
};

const fileContentBuffer = fs.readFileSync('/dev/stdin', 'utf8');
const trimmedContent = fileContentBuffer.trim();
const processedContentArray = trimmedContent.split('\n');

processInputData(processedContentArray);
