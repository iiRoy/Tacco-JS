'use strict';

// This function compares two very large numbers provided as strings.
function processInput(rawData) {

  const linesOfData = rawData.split('\n');
  const firstNumStr = linesOfData[0];
  const secondNumStr = linesOfData[1];

  const resultGreater = 'GREATER';
  const resultLess = 'LESS';
  const resultEqual = 'EQUAL';

  // Initial comparison: check for exact string equality or differing lengths.
  if (firstNumStr === secondNumStr) {
    console.log(resultEqual);
    return;
  } else if (firstNumStr.length > secondNumStr.length) {
    console.log(resultGreater);
    return;
  } else if (firstNumStr.length < secondNumStr.length) {
    console.log(resultLess);
    return;
  } else {
    // If string lengths are the same, compare digit by digit from left to right.
    for (let idx = 0; idx < firstNumStr.length; idx++) {
      let digitA = Number(firstNumStr[idx]);
      let digitB = Number(secondNumStr[idx]);
      if (digitA > digitB) {
        console.log(resultGreater);
        return;
      } else if (digitA < digitB) {
        console.log(resultLess);
        return;
      }
    }
  }

}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
