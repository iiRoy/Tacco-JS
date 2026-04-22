"use strict"
function Processor(entryData) {
  const segmentation = entryData.split('\n');
  const numericStrings = segmentation[1].split(' ');

  const digitValues = numericStrings.map(Number);

  const individualHalvings = digitValues.map(currentValue => {
    let currentDivisions = 0;
    let workingValue = currentValue;

    if (workingValue === 0) {
      // A value of 0 can be divided by 2 indefinitely without becoming odd.
      // Therefore, it does not impose a limit on the total number of divisions.
      // We represent this as Infinity so it won't be chosen by Math.min unless all
      // other numbers are also effectively infinite (e.g., all zeros).
      return Infinity;
    }

    while ((workingValue & 1) === 0) { // Check if even using bitwise AND
      workingValue >>= 1; // Divide by 2 using bitwise right shift
      currentDivisions++;
    }
    return currentDivisions;
  });

  // The overall number of times all elements can be simultaneously halved
  // is limited by the element that can be halved the fewest times
  // (excluding those that can be halved infinitely, like 0).
  const halvingLimit = Math.min(...individualHalvings);

  console.log(halvingLimit);
}
Processor(require("fs").readFileSync("/dev/stdin", "utf8"));