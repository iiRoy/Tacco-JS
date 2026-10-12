function ProcessInput(rawData) {
  // Split the raw input string into an array of lines based on newline characters.
  var dataRows = rawData.split('\n');

  // Parse the first line to get the total number of elements.
  var totalElements = Number(dataRows[0]);

  // Split the second line by spaces to get an array of string elements.
  var elementArray = dataRows[1].split(' ');

  // Sort the array of elements in ascending order.
  elementArray.sort();

  // Initialize a pointer to traverse the sorted array.
  var currentPosition = 0;

  // Declare a variable to hold the count of occurrences for each number.
  var occurrenceCount;

  // Iterate from 1 up to the total number of elements (inclusive).
  for (var iterator = 1; iterator <= totalElements; iterator++) {
    // Reset the occurrence count for the current number being checked.
    occurrenceCount = 0;

    // While the current element in the array matches the iterator value
    // and we haven't gone past the end of the array, increment the count.
    while (Number(elementArray[currentPosition]) === iterator && currentPosition < totalElements) {
      currentPosition++; // Move to the next element in the array.
      occurrenceCount++; // Increment the count for the current number.
    }

    // Output the total count for the current number (iterator).
    console.log(occurrenceCount);
  }
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
