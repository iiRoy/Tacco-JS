'use strict';
(function(initialInputContent) {
  // Step 1: Process the raw input string by trimming and splitting into lines.
  const trimmedContent = initialInputContent.trim();
  const contentLines = trimmedContent.split(/\n/);

  // Step 2: Extract the total count of elements from the first line.
  // Using Number() for explicit type conversion, equivalent to original's '-0'.
  const totalElements = Number(contentLines[0]);

  // Step 3: Extract the string containing the numeric data from the second line.
  const dataLineString = contentLines[1];

  // Step 4: Split the data line string into an array of string elements using whitespace as delimiter.
  const stringElements = dataLineString.split(/\s+/);

  // Step 5: Convert each string element to a number.
  const processedNumbers = stringElements.map(itemStr => Number(itemStr));

  // Step 6: Sort the array of numbers in ascending order.
  const sortedNumericArray = processedNumbers.sort((valA, valB) => valA - valB);

  // Step 7: Calculate the required indices for the middle elements.
  // N is guaranteed to be an even number based on problem context (median of even count).
  const middleIndex = totalElements / 2;
  const lowerMiddleIndex = middleIndex - 1;

  // Step 8: Retrieve the numeric values at these specific indices.
  const valueAtMiddle = sortedNumericArray[middleIndex];
  const valueAtLowerMiddle = sortedNumericArray[lowerMiddleIndex];

  // Step 9: Perform the final calculation: difference between the two middle elements.
  const finalResult = valueAtMiddle - valueAtLowerMiddle;

  // Step 10: Output the calculated result to the console.
  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));
