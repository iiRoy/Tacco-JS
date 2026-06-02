'use strict';
function processInput(dataString) {
  const dataSegments = dataString.split(" ");
  const primaryValue = Number(dataSegments[0]);
  const secondaryValue = Number(dataSegments[1]);

  const outcome = (1 - (secondaryValue === 1)) * (primaryValue - secondaryValue);

  console.log(outcome);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
