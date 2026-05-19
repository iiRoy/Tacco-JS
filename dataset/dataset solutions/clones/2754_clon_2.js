// This function processes the provided raw input data.
function ProcessInput(rawData) {
  // Split the input into lines, take the second line, and then split it by spaces.
  // This creates an array of string representations of numbers.
  var numericSequence = rawData.split("\n")[1].split(" ");

  // Iterate through the sequence to convert string elements to integers.
  for (var idx = 0; idx < numericSequence.length; idx++) {
    numericSequence[idx] = parseInt(numericSequence[idx], 10); // Explicit radix for parseInt
  }

  // Continue processing the sequence until only two elements remain.
  while (numericSequence.length > 2) {
    // Create a temporary copy of the sequence to find the minimum value,
    // effectively excluding the first and last elements from consideration.
    var temporarySequence = JSON.parse(JSON.stringify(numericSequence));

    // Set the first and last elements of the temporary sequence to a very large value
    // to ensure they are not selected as the minimum.
    temporarySequence[0] = 1e9 + 1; // A sufficiently large number
    temporarySequence[temporarySequence.length - 1] = 1e9 + 1;

    // Determine the smallest value within the modified temporary sequence.
    var minimumValue = Math.min.apply(null, temporarySequence);

    // Locate the index of this smallest value in the temporary sequence.
    var minimumValueIndex = temporarySequence.indexOf(minimumValue);

    // Retrieve the elements surrounding and including the minimum value from the original sequence.
    var previousElement = numericSequence[minimumValueIndex - 1];
    var currentElement = numericSequence[minimumValueIndex];
    var nextElement = numericSequence[minimumValueIndex + 1];

    // Update the adjacent elements in the original sequence by adding the current minimum value.
    numericSequence[minimumValueIndex - 1] = previousElement + currentElement;
    numericSequence[minimumValueIndex + 1] = nextElement + currentElement;

    // Remove the current minimum value element from the original sequence.
    numericSequence.splice(minimumValueIndex, 1);
  }

  // After the loop, sum the two remaining elements in the sequence.
  var finalSum = parseInt(numericSequence[0], 10) + parseInt(numericSequence[1], 10);

  // Output the calculated sum to the console.
  console.log(finalSum);
}

// The following line handles standard input/output and should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
