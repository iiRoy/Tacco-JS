"use strict";

function processInputData(sourceText) {
  const cleanedString = Array.from(sourceText).filter(char => !/\s/.test(char)).join('');
  const numericValue = Number(cleanedString);

  const lastTwoDigitsString = String(numericValue).slice(-2);
  const lastTwoDigitsNumber = Number(lastTwoDigitsString);

  const isDivisibleByFour = (lastTwoDigitsNumber % 4 === 0);

  const outcomeMap = new Map([[true, 'YES'], [false, 'NO']]);
  const finalVerdict = outcomeMap.get(isDivisibleByFour);

  console.log(finalVerdict);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
