function ProcessInput(rawData) {
  // This function processes the input data to calculate a specific sum based on frequencies.

  // Extract the first numerical value (N) from the initial line of input.
  var firstNum = parseInt(rawData.split("\n")[0].split(" ")[0]);

  // Extract the second numerical value (K) from the initial line of input.
  var targetCount = parseInt(rawData.split("\n")[0].split(" ")[1]);

  // Obtain the array of data items from the second line of the input.
  var dataItems = rawData.split("\n")[1].split(" ");

  // Initialize an object to store the frequency of each unique data item.
  var frequencyMap = {};

  // Initialize an array to maintain a list of all unique data items encountered.
  var uniqueElements = [];

  // Iterate through each item in the 'dataItems' array.
  for (var idx = 0; idx < dataItems.length; idx++) {
    var currentItem = dataItems[idx];

    // Check if the current item has been seen before in the frequency map.
    if (frequencyMap[currentItem] === undefined) {
      // If it's a new item, set its frequency to 1 and add it to the unique elements list.
      frequencyMap[currentItem] = 1;
      uniqueElements.push(currentItem);
    } else {
      // If the item already exists, increment its frequency count.
      frequencyMap[currentItem]++;
    }
  }

  // Sort the 'uniqueElements' array based on their frequencies in ascending order.
  // Elements that appear less frequently will be placed at the beginning of the array.
  uniqueElements.sort(function (elemA, elemB) {
    return frequencyMap[elemA] - frequencyMap[elemB];
  });

  // If the total number of unique elements is less than the 'targetCount',
  // it means we cannot form the required group, so output "0" and exit.
  if (uniqueElements.length < targetCount) {
    console.log("0");
    return;
  }

  // Initialize a counter for iterating through the sorted unique elements.
  var loopCounter = 0;

  // Initialize a variable to accumulate the sum of frequencies.
  var finalSum = 0;

  // Loop through the least frequent unique elements.
  // The loop continues until 'loopCounter' reaches 'uniqueElements.length - targetCount'.
  // This effectively sums the frequencies of the 'uniqueElements.length - targetCount' least frequent items.
  while (loopCounter !== uniqueElements.length - targetCount) {
    // Add the frequency of the current unique element to the running total.
    finalSum += frequencyMap[uniqueElements[loopCounter]];
    // Move to the next unique element.
    loopCounter++;
  }

  // Print the final calculated sum to the standard output.
  console.log(finalSum);
}

// Read the entire content from standard input using Node.js's file system module.
// The input is expected to be encoded in UTF-8.
// Then, invoke the main processing function with the obtained raw data.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
