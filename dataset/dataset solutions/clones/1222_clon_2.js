'use strict';
(function (dataStream) {
  // Read raw input data from the stream
  var rawData = dataStream.toString();

  // Split the raw data to get the first line, then split by space, and map to numbers
  var parsedNumbers = rawData.split('\n')[0].split(' ').map(Number);

  // Extract the individual numeric values
  var firstNum = parsedNumbers[0];
  var secondNum = parsedNumbers[1];
  var thirdNum = parsedNumbers[2];

  // Declare variables for the smallest, middle, and largest values
  var smallestVal, middleVal, largestVal;

  // Determine the minimum of the three numbers
  smallestVal = Math.min(firstNum, secondNum, thirdNum);
  // Determine the maximum of the three numbers
  largestVal = Math.max(firstNum, secondNum, thirdNum);

  // Logic to determine the middle value (replicates original code's approach)
  if (firstNum < secondNum) {
    middleVal = firstNum;
  }
  // This is a separate conditional block, not an 'else if'
  if (secondNum < thirdNum) {
    middleVal = secondNum;
  }
  // Another independent conditional block
  if (firstNum <= thirdNum) {
    middleVal = thirdNum;
  }

  // Output the calculated smallest, middle, and largest values
  console.log(smallestVal, middleVal, largestVal);

}(require('fs') .readFileSync('/dev/stdin', 'utf8')));