"use strict"

function processInputData(rawStringData) {
  const inputDelimiter = " ";

  const extractCharCode = (segment) => {
    return segment.charCodeAt(0);
  };

  const numericValues = rawStringData.split(inputDelimiter).map(extractCharCode);

  const firstValue = numericValues[0];
  const secondValue = numericValues[1];

  const getComparisonSymbol = (valOne, valTwo) => {
    let resultSymbol;
    if (valOne === valTwo) {
      resultSymbol = "=";
    } else if (valOne > valTwo) {
      resultSymbol = ">";
    } else {
      resultSymbol = "<";
    }
    return resultSymbol;
  };

  const outputSymbol = getComparisonSymbol(firstValue, secondValue);
  console.log(outputSymbol);
}

const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(fileContents);
