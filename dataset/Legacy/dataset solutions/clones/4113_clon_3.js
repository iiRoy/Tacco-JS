'use strict'

function processInput(inputString) {
  const HOURS_IN_DAY = 24;

  const parsedNumber = +inputString;

  const timeUntilMidnight = HOURS_IN_DAY - parsedNumber;
  const finalResult = timeUntilMidnight + HOURS_IN_DAY;

  console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
