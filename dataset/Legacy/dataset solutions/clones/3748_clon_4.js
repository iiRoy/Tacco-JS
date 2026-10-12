'use strict';

const processInputData = (rawData) => {
  const numericParts = rawData.match(/(\d+)\s+(\d+)/);
  
  const firstNumericValue = Number(numericParts[1]);
  const secondNumericValue = Number(numericParts[2]);

  const valuesCollection = [firstNumericValue, secondNumericValue];

  const allValuesWithinRange = valuesCollection.every(currentValue => currentValue <= 8);

  console.log(allValuesWithinRange ? 'Yay!' : ':(');
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
