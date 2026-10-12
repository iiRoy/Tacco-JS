// This function processes raw input data to determine a specific count.
function ProcessInput(rawData) {
  // Extract the first line from the input, which is not used in the subsequent logic.
  var firstLineContent = rawData.split("\n")[0];

  // Obtain the second line, split it by spaces, and store the resulting string array.
  var numericStrings = rawData.split("\n")[1].split(" ");

  // Sort the array of string representations of numbers in ascending numerical order.
  // The comparison function converts string elements to integers for correct sorting.
  numericStrings.sort(function(valA, valB) {
    return parseInt(valA, 10) - parseInt(valB, 10);
  });

  // Filter the sorted array to create a new array containing only unique elements.
  // This is achieved by including an element only if its first occurrence matches its current index.
  var uniqueElements = numericStrings.filter(function(currentElement, currentIndex, fullArray) {
    return fullArray.indexOf(currentElement) === currentIndex;
  });

  // Based on the count of unique elements, print a specific value to the console.
  // If the number of unique elements is odd, print that number.
  // Otherwise (if the count is even), print that number minus one.
  if (uniqueElements.length % 0b1 === 0b1) {
    console.log(uniqueElements.length);
  } else {
    console.log(uniqueElements.length - 0x1);
  }
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
