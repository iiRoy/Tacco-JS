"use strict";

function calculateResult(rawData) {
  const tokenList = rawData.split(" ");

  let firstSegmentValue;
  let secondSegmentValue;

  tokenList.reduce((accumulator, currentElement, currentIndex) => {
    if (currentIndex === 0) {
      firstSegmentValue = currentElement;
    } else if (currentIndex === 1) {
      secondSegmentValue = currentElement;
    }
    return accumulator;
  }, null);

  const combinedStringRepresentation = `${firstSegmentValue}${secondSegmentValue}`;

  console.log(Number(combinedStringRepresentation) / 2);
}

calculateResult(require("fs").readFileSync("/dev/stdin", "utf8"));
