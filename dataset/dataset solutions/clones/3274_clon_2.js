"use strict";
process.
  stdin
  .resume
  (
  )
;
process.stdin.setEncoding(
  "utf8"
);


var     inputDataSegments =   [];

var   inputHandler = require("readline").createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);


inputHandler
  .on(
    "line",
    currentLineText => {
      inputDataSegments.push(
        currentLineText.split(
          /\s/
        ).map(
          numericValue =>
            parseInt(
              numericValue
            )
        )
      );
    }
  );


inputHandler.on(
  "close",
  (
  ) =>
  {
    let   quantityOfElements = inputDataSegments.shift();
    let   firstNumericalArray = inputDataSegments.shift();
    let   secondNumericalArray = inputDataSegments.shift();

    let   totalOfFirstArray = firstNumericalArray.reduce(
      (
        accumulatorVal,
        currentElementVal
      ) =>
        accumulatorVal + currentElementVal
    );
    let   totalOfSecondArray = secondNumericalArray.reduce(
      (accumulatorVal, currentElementVal) => accumulatorVal + currentElementVal
    );

    if (totalOfFirstArray < totalOfSecondArray)
    {
      console.log(
        -1
      );
      return;
    }
    let   negativeDifferenceCount = 0;
    let   positiveDifferencesCollection = [];
    let   sumOfPositiveDifferences = 0;
    let   sumOfNegativeDifferences = 0;
    let   currentDifferenceIndex = 0;

    for (let loopIteration = 0; loopIteration < quantityOfElements; loopIteration++)
    {
      let   temporaryDifference = firstNumericalArray[loopIteration] - secondNumericalArray[loopIteration];
      if (temporaryDifference > 0)
      {
        positiveDifferencesCollection.push(
          temporaryDifference
        );
      }
      else
      {
        negativeDifferenceCount += 1;
        sumOfNegativeDifferences += temporaryDifference;
      }
    }

    positiveDifferencesCollection.sort(
      (valA, valB) => valB - valA
    );
    while (sumOfPositiveDifferences + sumOfNegativeDifferences < 0)
    {
      sumOfPositiveDifferences += positiveDifferencesCollection[currentDifferenceIndex];
      currentDifferenceIndex++;
    }

    console.log(negativeDifferenceCount + currentDifferenceIndex);
  }
);