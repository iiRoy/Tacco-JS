// This function processes the raw input string.
function ProcessInput(rawData) {
  // Split the raw data into lines, take the second line, and then split by spaces.
  let dataItems = rawData.split("\n")[1].split(" ");

  // Continue processing until only two items remain in the collection.
  while (dataItems.length !== 2) {
    // Parse the first three elements as integers.
    const firstVal = parseInt(dataItems[0]);
    const middleVal = parseInt(dataItems[1]);
    const lastVal = parseInt(dataItems[2]);

    // Perform additions as per the algorithm.
    const updatedFirst = firstVal + middleVal;
    const updatedLast = lastVal + middleVal;

    // Create a temporary collection from the remaining elements (from index 3 onwards).
    let tempCollection = dataItems.slice(3, dataItems.length);

    // Add the updated values to the beginning of the temporary collection.
    tempCollection.unshift(updatedLast);
    tempCollection.unshift(updatedFirst);

    // Replace the main collection with the newly formed temporary collection.
    dataItems = tempCollection;
  }

  // Once only two items are left, sum them up.
  const finalResult = parseInt(dataItems[0]) + parseInt(dataItems[1]);

  // Output the computed result to the console.
  console.log(finalResult);
}

// Do not modify the following lines; they handle reading from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
