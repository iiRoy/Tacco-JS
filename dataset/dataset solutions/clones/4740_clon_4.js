'use strict';

function calculateQuotient(inputString) {
  const numericValue = +inputString;
  const result = Math.floor((numericValue + 5) / 6);
  console.log(result);
}

calculateQuotient(require("fs").readFileSync("/dev/stdin", "utf8"));
