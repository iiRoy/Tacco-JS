"use strict";

function processData(rawData) {
  // Parse the raw input string into an array of numbers.
  let parsedNumbers = rawData.split('\n').map(itemVal => ~~itemVal);

  const countElements = parsedNumbers[0]; // The first number indicates the count.
  const sortedValues = parsedNumbers.slice(1, parsedNumbers.length).sort((firstVal, secondVal) => firstVal - secondVal);

  // Calculate the aggregate value of all elements.
  const totalSum = eval(sortedValues.join("+"));

  // If the total sum is not a multiple of 10, print it and exit.
  if (totalSum % 10 !== 0) {
    console.log(totalSum);
    return;
  }

  // Iterate through the sorted values to find if removing one makes the sum not a multiple of 10.
  for (let idx = 0; idx < countElements; ++idx) {
    if ((totalSum - sortedValues[idx]) % 10 !== 0) {
      console.log(1, totalSum - sortedValues[idx]);
      return;
    }
  }

  // If no such element is found, print 0.
  console.log(0);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
