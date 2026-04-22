// This module facilitates the execution of large number addition operations.
function calculateLargeSum(
  firstNumberString, // The initial string representation of the first numerical operand.
  secondNumberString // The subsequent string representation of the second numerical operand.
)
{
  // Declaration of variables essential for the summation algorithm.
  var lengthOfLonger, lengthOfShorter, finalBufferSize, shorterIndex, longerIndex, currentCarry, intermediateSum;
  var sumResultArray, longerNumberDigits, shorterNumberDigits;

  // Determine the longer of the two input number strings to standardize processing order.
  if (firstNumberString.length > secondNumberString.length)
  {
    lengthOfLonger = firstNumberString.length;
    lengthOfShorter = secondNumberString.length;
    longerNumberDigits = firstNumberString.split("");
    shorterNumberDigits = secondNumberString.split("");
  }
  else
  {
    lengthOfLonger = secondNumberString.length;
    lengthOfShorter = firstNumberString.length;
    longerNumberDigits = secondNumberString.split("");
    shorterNumberDigits = firstNumberString.split("");
  }

  // Implement a safeguard against numbers exceeding a predefined maximum length.
  if (lengthOfLonger > 80)
  {
    console.log("overflow"); // Output an overflow message if the limit is breached.
    return; // Exit the function to prevent further processing of an invalid input.
  }

  // Initialize the array that will store the digits of the sum, allowing for a potential leading carry.
  finalBufferSize = lengthOfLonger + 1;
  sumResultArray = new Array(finalBufferSize);

  // Execute the primary addition loop, processing digits from right to left for their common length.
  for (longerIndex = lengthOfLonger - 1, shorterIndex = lengthOfShorter - 1, currentCarry = 0; shorterIndex >= 0; --shorterIndex, --longerIndex)
  {
    intermediateSum = parseInt(longerNumberDigits[longerIndex]) + parseInt(shorterNumberDigits[shorterIndex]) + currentCarry;
    sumResultArray[longerIndex + 1] = intermediateSum % 10; // Store the resulting digit at the appropriate position.
    currentCarry = parseInt(intermediateSum / 10); // Compute the carry-over value for the subsequent addition.
  }
  // Proceed to add any remaining digits from the longer number, incorporating the carry.
  for (; longerIndex >= 0; --longerIndex)
  {
    intermediateSum = parseInt(longerNumberDigits[longerIndex]) + currentCarry;
    sumResultArray[longerIndex + 1] = intermediateSum % 10;
    currentCarry = parseInt(intermediateSum / 10);
  }
  sumResultArray[0] = currentCarry; // Assign the final carry value to the first position of the result array.

  // Render the sum to the console, managing cases with a leading carry or overflow.
  if (currentCarry > 0)
  {
    if (lengthOfLonger === 80)
    {
      console.log("overflow"); // Specific overflow check for the maximum allowed length.
    }
    else
    {
      console.log(sumResultArray.join("")); // Display the complete sum, including any leading carry digit.
    }
  }
  else
  {
    console.log(sumResultArray.slice(1, finalBufferSize).join("")); // Output the sum, excluding a redundant leading zero.
  }
}

// Activate the standard input stream to receive data from the user or piped sources.
process.stdin.resume();
process.stdin.setEncoding("utf8"); // Configure the input stream to interpret data as UTF-8 encoded text.
process.stdin.on("data", function handleIncomingData(incomingPayload)
{
  // Process the raw input payload, splitting it into individual lines and removing extraneous whitespace.
  var inputContentSegments = incomingPayload.trim().split("\n");
  var currentLinePointer = 0; // Initialize an index to track the current position within the input segments.
  var numberOfTestCases = parseInt(inputContentSegments[currentLinePointer++].trim()); // Extract the total number of test cases from the first line.
  { // This block encapsulates the iteration over multiple arithmetic tasks.
    for (; numberOfTestCases > 0; --numberOfTestCases)
    {
      calculateLargeSum(inputContentSegments[currentLinePointer], inputContentSegments[currentLinePointer + 1]);
      currentLinePointer = currentLinePointer + 2; // Move the pointer two positions forward to access the next pair of numbers.
    }
  }
});