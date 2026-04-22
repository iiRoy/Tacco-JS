"use strict";
function processInputData(rawDataLines) {
  let firstLineParts = rawDataLines[0].split(" ");

  firstLineParts = firstLineParts[1];

  let dataItemsAsStrings = rawDataLines[1].split(" ");

  let greatestCalculatedValue = 0;
  for (  let outerLoopCounter = firstLineParts - 1;
         outerLoopCounter < dataItemsAsStrings.length;
         outerLoopCounter++
  ) {
    let currentWindowSum = 0;

    for (let innerLoopIndex = 0; innerLoopIndex < firstLineParts; innerLoopIndex++) {
      for (
           let iterationValue = 1;
           iterationValue <= dataItemsAsStrings[outerLoopCounter - innerLoopIndex];
           iterationValue++
      ) {
        currentWindowSum += iterationValue / dataItemsAsStrings[outerLoopCounter - innerLoopIndex];
      }
    }

    if (currentWindowSum > greatestCalculatedValue) {
      greatestCalculatedValue = currentWindowSum;
    }
  }
  console.log(greatestCalculatedValue);
}

processInputData(require('fs') .readFileSync( '/dev/stdin', 'utf8' ) .trim() .split("\n"));