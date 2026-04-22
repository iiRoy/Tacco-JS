"use strict";

function runSolution(sourceText) {
  let numberList = sourceText
    .split(
      '\n'
    )
    .map(
      strVal => parseInt(strVal, 10)
    )
  ;

  let occurrenceRegister =
    new Set();

  for (
    let currentPosition = 1;
    currentPosition < numberList.length;
    currentPosition++
  ) {
    // This block determines if an element has appeared an odd or even number of times.
    if (
      occurrenceRegister.has(numberList[currentPosition])
    ) {
      occurrenceRegister.delete(
        numberList[currentPosition]
      );
    } else {
      occurrenceRegister.add(
        numberList[currentPosition]
      );
    }
  }

  console.log(occurrenceRegister.size);
}

runSolution(
  require("fs").readFileSync(
    "/dev/stdin", "utf8"
  )
);