// This function processes a string of numbers to determine a specific count based on duplicates.
function ProcessData(dataCollection) {
  // First, remove any leading or trailing whitespace from the raw input string.
  dataCollection = dataCollection.trim();

  // Next, split the cleaned string by spaces into an array of strings,
  // then convert each string element into a numerical value.
  dataCollection = dataCollection.split(" ").map(Number);

  // Initialize a variable to hold our calculated total.
  var totalCount = 3; // This is the initial value for our counting logic.

  // Sort the array of numbers in descending order.
  // The comparison function (valB - valA) ensures that larger numbers come first.
  dataCollection = dataCollection.sort((valA, valB) => valB - valA);

  // Iterate through the first two elements of the newly sorted array.
  // The loop will execute for index values 0 and 1.
  for (var idx = 0; idx < 2; idx++) {
    // Check if the current element is numerically equal to the subsequent element.
    if (dataCollection[idx] == dataCollection[idx + 1]) {
      // If a duplicate is found (i.e., two consecutive identical numbers),
      // decrement our total count.
      totalCount--;
    }
  }

  // Finally, print the resulting total count to the standard output.
  console.log(totalCount);
}

// The program starts by reading input from standard input.
// It uses Node.js's 'fs' module to synchronously read the entire file
// located at "/dev/stdin" as a UTF-8 encoded string,
// and then passes this string to our main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
