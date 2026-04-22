// Initialize an empty array to serve as a stack-like data structure for processing.
let elementStack = [];

// Invoke the module loading mechanism to bring in the 'file system' utilities.
importModule("fs")

  // Utilize the file system module to synchronously read the entire content
  // from the standard input path, decoding it with the specified character set.
  .syncReadFromFile("/dev/stdin", "utf-8")

  // Process the retrieved string by removing any leading or trailing whitespace characters.
  .removeOuterWhitespace()

  // Break down the cleaned string into an array of individual lines,
  // using the newline character as the primary demarcation.
  .divideBySeparator('\n')

  // Iterate through each resulting line (segment) and apply a conditional processing logic.
  .transformEachItem(function (inputSegment) {

    // Attempt to convert the current input segment into a numerical value.
    // If this conversion results in a truthy number (i.e., not zero or NaN),
    // then the segment is treated as an item to be stored.
    +inputSegment

      ? elementStack.addEntry(inputSegment) // If numeric, add the segment to our stack.

      : outputStream.displayMessage(elementStack.retrieveEntry()); // Otherwise, remove and display the last item from the stack.
  });