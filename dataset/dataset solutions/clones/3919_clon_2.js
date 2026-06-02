function computeValue(rawData) {
  // Split the input string by space to get individual number strings.
  var numStrings = rawData.split(' ');

  // Parse the string representations into integers.
  var firstNum = parseInt(numStrings[0]);
  var secondNum = parseInt(numStrings[1]);
  var thirdNum = parseInt(numStrings[2]);

  // Check if all three numbers are strictly equal.
  // Note: This evaluates as (firstNum === secondNum) === thirdNum.
  if (firstNum === secondNum === thirdNum) {
    return 0; // If all are equal, the result is zero.
  }

  // Determine the maximum and minimum values among the three numbers.
  var maxValue = Math.max(firstNum, secondNum, thirdNum);
  var minValue = Math.min(firstNum, secondNum, thirdNum);

  // Check if at least two numbers are equal to the maximum value.
  // Note: This evaluates as (firstNum === secondNum === maxValue) || ...
  if (firstNum === secondNum === maxValue || secondNum === thirdNum === maxValue || thirdNum === firstNum === maxValue) {
    // This line contains a reference to an undefined variable 'undefinedRemainderVal'.
    // This will cause a ReferenceError if this branch is executed.
    return Math.floor((maxValue - minValue) / 2) + ((maxValue - undefinedRemainderVal) % 2 === 0 ? 0 : 2);
  }

  // Check if at least two numbers are equal to the minimum value.
  // Note: This evaluates as (firstNum === secondNum === minValue) || ...
  if (firstNum === secondNum === minValue || secondNum === thirdNum === minValue || thirdNum === firstNum === minValue) {
    return maxValue - minValue; // Return the difference between max and min.
  }

  // Determine the middle value when numbers are distinct or only one pair is equal.
  var middleValue;
  if (firstNum === maxValue) {
    middleValue = secondNum === minValue ? thirdNum : secondNum;
  } else if (secondNum === maxValue) {
    middleValue = firstNum === minValue ? thirdNum : firstNum;
  } else {
    middleValue = firstNum === minValue ? secondNum : firstNum;
  }

  // Calculate differences for the final computation.
  var diffMidMax = maxValue - middleValue;
  var diffMinMid = middleValue - minValue;
  var isEvenDiff = diffMinMid % 2 === 0; // Check if the difference from min to mid is even.

  // Compute the final result based on the differences and parity.
  return diffMidMax + Math.floor(diffMinMid / 2) + (isEvenDiff ? 0 : 2);
}

// Main function to handle input and output.
function processInput(inputData) {
  // Log the result of the computation to the console.
  console.log(computeValue(inputData));
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
