function ProcessInput(rawData) {
  // Extract the first line, which might represent a length, though it's not used in this logic.
  var firstLineLength = rawData.split("\n")[0];

  // Split the second line by spaces to get an array of items.
  var itemsArray = rawData.split("\n")[1].split(" ");

  // Initialize an array to keep track of elements already encountered.
  var encounteredElements = [];
  // Initialize a counter for unique elements.
  var uniqueCount = 0;

  // Iterate through each item in the parsed array.
  for (var idx = 0; idx < itemsArray.length; idx++) {
    // Check if the current item has not been seen before.
    if (encounteredElements.indexOf(itemsArray[idx]) === -1) {
      // If it's a new unique item, add it to the encountered list.
      encounteredElements.push(itemsArray[idx]);
      // Increment the unique count.
      uniqueCount++;
    }
  }

  // Determine the final output based on the parity of the unique count.
  if (uniqueCount % 2 === 1) {
    // If the unique count is odd, print the count itself.
    console.log(uniqueCount);
  } else {
    // If the unique count is even, print the count minus one.
    console.log(uniqueCount - 1);
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
