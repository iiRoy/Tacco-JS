"use strict";

const getRawInputLines = () => {
  const fileSystemModule = require("fs");
  const fileContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  return fileContent.trim().split("\n");
};

const CONFIG_LINE_INDEX = 0;
const DATA_LINE_INDEX = 1;
const N_VALUE_INDEX = 0;
const K_VALUE_INDEX = 1;
const VALUE_DELIMITER = " ";

const parseConfiguration = (configString) => {
  const configTokens = configString.split(VALUE_DELIMITER);
  const nParam = parseInt(configTokens[N_VALUE_INDEX]);
  const kParam = parseInt(configTokens[K_VALUE_INDEX]);
  return { nParam, kParam };
};

const parseDataArray = (dataString) => {
  return dataString.split(VALUE_DELIMITER).map(element => parseInt(element));
};

const findMinimumAndItsIndex = (numericArray) => {
  const initialAccumulator = {
    minimumValue: numericArray[0],
    minimumIndex: 0,
  };

  return numericArray.reduce(
    (accumulator, currentValue, currentIndex) => {
      if (currentValue < accumulator.minimumValue) {
        return { minimumValue: currentValue, minimumIndex: currentIndex };
      }
      return accumulator;
    },
    initialAccumulator
  );
};

const computeFinalResult = (totalElements, groupSize, dataElements) => {
  const minElementInfo = findMinimumAndItsIndex(dataElements);
  const targetElementIndex = minElementInfo.minimumIndex;
  
  const firstDivisor = groupSize - 1;
  const secondDivisor = totalElements - groupSize - 1;

  const firstCeilingTerm = Math.ceil(targetElementIndex / firstDivisor);
  const secondCeilingTerm = Math.ceil(targetElementIndex / secondDivisor);

  return firstCeilingTerm + secondCeilingTerm;
};

const allInputLines = getRawInputLines();

const { nParam: totalElements, kParam: groupSize } = parseConfiguration(allInputLines[CONFIG_LINE_INDEX]);
const dataElements = parseDataArray(allInputLines[DATA_LINE_INDEX]);

console.log(computeFinalResult(totalElements, groupSize, dataElements));
