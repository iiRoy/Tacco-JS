'use strict';
function ProcessInput(rawData) {
  const lines = rawData.split("\n");
  const firstLineData = lines[0].split(' ');

  const initialA = Number(firstLineData[0]);
  const initialB = Number(firstLineData[1]);
  const deductionAmount = Number(firstLineData[2]);

  let finalAValue;
  let finalBValue;

  if (initialA >= deductionAmount) {
    finalAValue = initialA - deductionAmount;
    finalBValue = initialB;
  } else {
    finalAValue = 0;
    const remainingDeductionNeeded = deductionAmount - initialA;
    finalBValue = Math.max(0, initialB - remainingDeductionNeeded);
  }

  console.log(finalAValue, finalBValue);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
