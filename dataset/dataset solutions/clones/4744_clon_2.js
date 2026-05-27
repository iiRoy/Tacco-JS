function ProcessInput(rawData) {
  // Extract the first line of the input data.
  // This variable holds the length information, though it's not used in the current logic.
  var firstLineVal = rawData.split("\n")[0];

  // Split the second line of the input by spaces to get an array of string elements.
  var dataItems = rawData.split("\n")[1].split(" ");


  // Filter the array to obtain only unique elements.
  // The callback function checks if the current element's first occurrence
  // in the array matches its current index, effectively identifying unique items.
  var uniqueElements = dataItems.filter(function (currentItem, currentIndex, fullArray) {
    return fullArray.indexOf(currentItem) === currentIndex;
  });

  // Check the parity of the count of unique elements.
  if (uniqueElements.length % 2 === 1) {
    // If the number of unique elements is odd, print its exact count.
    console.log(uniqueElements.length);
  } else {
    // If the number of unique elements is even, print one less than its count.
    console.log(uniqueElements.length - 1);
  }
}

// Read the entire content from the standard input stream,
// using UTF-8 encoding, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
