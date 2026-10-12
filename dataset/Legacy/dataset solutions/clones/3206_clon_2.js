// Function to perform multiplication of two large numbers represented as strings
function multiplyBigNumbers(firstVal, secondVal) {
  // Convert numbers to strings, split into digits, and reverse for easier processing
  let firstStrArr = (firstVal + "").split("").reverse();
  let secondStrArr = (secondVal + "").split("").reverse();

  // Get lengths of the digit arrays
  let lenOne = firstStrArr.length;
  let lenTwo = secondStrArr.length;

  // Array to store intermediate products and carry-overs
  let resultDigits = [];

  // Perform digit-by-digit multiplication
  for (let idxA = 0; idxA < lenOne; idxA++) {
    for (let idxB = 0; idxB < lenTwo; idxB++) {
      // Initialize array element if undefined
      if (resultDigits[idxA + idxB] === undefined) {
        resultDigits[idxA + idxB] = 0;
      }
      // Add product of current digits
      resultDigits[idxA + idxB] += parseInt(firstStrArr[idxA]) * parseInt(secondStrArr[idxB]);
    }
  }

  // Ensure all potential result positions are initialized to 0
  // This loop is duplicated in the original, maintaining that structure.
  for (let idxC = 0; idxC < 2 * (lenOne + lenTwo); idxC++) {
    if (resultDigits[idxC] === undefined) {
      resultDigits[idxC] = 0;
    }
  }
  // Second identical loop from the original code
  for (let idxC = 0; idxC < 2 * (lenOne + lenTwo); idxC++) {
    if (resultDigits[idxC] === undefined) {
      resultDigits[idxC] = 0;
    }
  }

  // Process carry-overs from right to left
  let currPos = 0;
  while (resultDigits[currPos] || resultDigits[currPos] === 0) {
    // Calculate carry to the next position.
    // The original code relies on `undefined += X` resulting in `NaN`
    // if `resultDigits[currPos + 1]` is undefined. This behavior is preserved.
    resultDigits[currPos + 1] += Math.floor(resultDigits[currPos] / 10);
    // Keep only the current digit
    resultDigits[currPos] = (resultDigits[currPos] % 10).toString(10);
    currPos++;
  }

  // Reverse the array to get the correct order of digits
  resultDigits = resultDigits.reverse();

  // Remove leading zeros (or NaN if the result was 0 initially)
  while (isNaN(resultDigits[0]) || resultDigits[0] === "0") {
    resultDigits.splice(0, 1);
  }

  // Join digits to form the final string result
  resultDigits = resultDigits.join("");
  return resultDigits;
}

// This function performs addition of two numbers, handling them as strings for large values.
function sumLargeNumbers(valA, valB) {
  // Convert input numbers to string arrays, reversed for digit-by-digit processing.
  let strArrA = (valA + "").split("").reverse();
  let strArrB = (valB + "").split("").reverse();

  // Store lengths of the digit arrays.
  let lenA = strArrA.length;
  let lenB = strArrB.length;

  // Array to hold the resulting digits.
  let sumResultDigits = [];

  // Pad shorter array with zeros to match the length of the longer one.
  for (let currentIdx = 0; currentIdx < Math.max(lenA, lenB); currentIdx++) {
    if (strArrA[currentIdx] === undefined) {
      strArrA[currentIdx] = 0;
    }
    if (strArrB[currentIdx] === undefined) {
      strArrB[currentIdx] = 0;
    }
  }

  // Perform digit-by-digit addition.
  for (let currentIdx = 0; currentIdx < Math.max(lenA, lenB); currentIdx++) {
    sumResultDigits[currentIdx] = parseInt(strArrA[currentIdx]) + parseInt(strArrB[currentIdx]);
  }

  // Handle carry-overs.
  let digitPointer = 0;
  while (sumResultDigits[digitPointer] || sumResultDigits[digitPointer] === 0) {
    // The original code relies on `undefined += X` resulting in `NaN`
    // if `sumResultDigits[digitPointer + 1]` is undefined. This behavior is preserved.
    sumResultDigits[digitPointer + 1] += Math.floor(sumResultDigits[digitPointer] / 10);
    // Keep only the current digit.
    sumResultDigits[digitPointer] = (sumResultDigits[digitPointer] % 10) + ""; // Convert to string
    digitPointer++;
  }

  // Reverse the array to get the correct number order.
  sumResultDigits = sumResultDigits.reverse();

  // Remove any leading zeros or NaN values that might appear.
  while (isNaN(sumResultDigits[0]) || sumResultDigits[0] === "0") {
    sumResultDigits.splice(0, 1);
  }

  // Join the digits to form the final string.
  sumResultDigits = sumResultDigits.join("");
  return sumResultDigits;
}

// This function handles subtraction of two numbers, treating them as strings.
function performSubtraction(operandA, operandB) {
  // Convert numbers to reversed digit arrays.
  let digitsA = (operandA + "").split("").reverse();
  let digitsB = (operandB + "").split("").reverse();

  // Get the lengths of the digit arrays.
  let lenA = digitsA.length;
  let lenB = digitsB.length;

  // Array to store the subtraction result digits.
  let diffDigits = [];

  // Ensure both digit arrays are padded with zeros to the maximum length.
  for (let currentIdx = 0; currentIdx < Math.max(lenA, lenB); currentIdx++) {
    if (digitsA[currentIdx] === undefined) {
      digitsA[currentIdx] = 0;
    }
    if (digitsB[currentIdx] === undefined) {
      digitsB[currentIdx] = 0;
    }
  }

  // Perform digit-by-digit subtraction.
  for (let currentIdx = 0; currentIdx < Math.max(lenA, lenB); currentIdx++) {
    diffDigits[currentIdx] = parseInt(digitsA[currentIdx]) - parseInt(digitsB[currentIdx]);
  }

  // Handle borrowing.
  let ptr = 0;
  while (diffDigits[ptr] || diffDigits[ptr] === 0) {
    if (diffDigits[ptr] < 0) {
      // Borrow from the next digit.
      // Original code relies on `undefined--` resulting in `NaN`
      // if `diffDigits[ptr + 1]` is undefined. This behavior is preserved.
      diffDigits[ptr + 1]--;
      diffDigits[ptr] += 10;
    }
    ptr++;
  }

  // Reverse the array to get the correct number order.
  diffDigits = diffDigits.reverse();

  // Remove leading zeros or NaN values.
  while (isNaN(diffDigits[0]) || diffDigits[0] === "0") {
    diffDigits.splice(0, 1);
  }

  // Join the digits to form the final string result.
  diffDigits = diffDigits.join("");
  return diffDigits;
}

// Main processing function for the problem.
function processInput(rawInput) {
  // Remove newline characters and split the input string by spaces.
  rawInput = rawInput.replace("\n", "");
  rawInput = rawInput.split(' ');

  // Parse integer values from the input array.
  let initialK = parseInt(rawInput[0]);
  let startA = parseInt(rawInput[1]);
  let endB = parseInt(rawInput[2]);

  // Calculate derived values.
  let diffVal = endB - startA;
  let effK = initialK - startA;

  // Initialize the final count variable.
  let finalCount = 0;

  // Conditional logic to determine the final count based on problem rules.
  // The commented-out block from the original is preserved as a comment.
  /*
  var finalCount=((effK<2)||(diffVal<3))?(initialK+1):(effK%2===0)?(startA+effK*diffVal/2+1):(startA+(effK+1)*diffVal/2);
  console.log(finalCount);
  */

  if ((effK < 2) || (diffVal < 3)) {
    // If conditions are met, simply add 1 to initialK.
    finalCount = sumLargeNumbers(initialK, 1);
  } else if (effK % 2 === 0) {
    // If effK is even, apply a specific calculation.
    finalCount = sumLargeNumbers(sumLargeNumbers(multiplyBigNumbers(effK / 2, diffVal), startA), 1);
  } else {
    // Otherwise, apply a different calculation.
    finalCount = sumLargeNumbers(multiplyBigNumbers((effK + 1) / 2, diffVal), startA);
  }

  // Output the calculated final count to the console.
  console.log(finalCount);
}

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
