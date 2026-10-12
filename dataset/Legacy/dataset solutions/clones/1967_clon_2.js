function ProcessInput(rawData) {
  // Split the raw input string into individual lines.
  const inputLines = rawData.split("\n");

  // Parse the first line to get the total count of elements.
  let elementCount = Number(inputLines[0]);

  // Split the second line by spaces to get string representations of values.
  const stringValues = inputLines[1].split(" ");

  // Initialize an array to hold the numeric versions of the values.
  let numericValues = [];

  // Iterate through the string values, converting them to numbers.
  // Note: The loop runs up to elementCount - 1, potentially skipping the last element.
  for (let idx = 0; idx < elementCount - 1; idx++) {
    numericValues.push(Number(stringValues[idx]));
  }

  // Sort the numeric values in ascending order.
  numericValues.sort(function(valA, valB) {
    if (valA < valB) {
      return -1; // valA comes before valB
    }
    if (valA > valB) {
      return 1; // valA comes after valB
    }
    return 0; // valA and valB are equal
  });

  // Initialize a pointer for the sorted array.
  let currentPosition = 0;
  let occurrenceCount; // Declare a variable to store the count for each target value.

  // Loop from 1 up to the total element count (inclusive).
  for (let targetValue = 1; targetValue <= elementCount; targetValue++) {
    occurrenceCount = 0; // Reset the count for the current target value.

    // While the current element in the sorted array matches the target value
    // and we haven't gone past the end of the array, increment count and advance pointer.
    while (numericValues[currentPosition] === targetValue && currentPosition < elementCount) {
      currentPosition++; // Move to the next element.
      occurrenceCount++; // Increment the count for the current target.
    }
    // Output the total occurrences of the current target value.
    console.log(occurrenceCount);
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
