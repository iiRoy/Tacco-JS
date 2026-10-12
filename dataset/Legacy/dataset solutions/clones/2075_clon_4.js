'use strict';
function ProcessInput(rawContent) {
  const [firstLine] = rawContent.split("\n");
  const [numOne, numTwo, numThree] = firstLine.split(' ').map(Number);

  const intermediateValue = numThree - numOne - numTwo;

  const finalVerdict = (intermediateValue > 0 && 4 * numOne * numTwo < intermediateValue * intermediateValue)
    ? 'Yes'
    : 'No';

  console.log(finalVerdict);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
