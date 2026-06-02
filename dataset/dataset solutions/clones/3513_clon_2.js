function ProcessData(rawData) {
  // Parse the first line to get the total count of items.
  var totalCount = parseInt(rawData.split("\n")[0]);

  // Parse the second line to get the list of individual data items.
  var dataItems = rawData.split("\n")[1].split(" ");

  // Initialize an object to store the frequency of each unique item.
  var itemFrequencies = {};

  // Initialize an array to store the unique items encountered.
  var uniqueItems = [];

  // Initialize a variable to accumulate a final result value.
  var resultValue = 0;

  // Iterate through the data items to count their occurrences.
  for (var idx = 0; idx < dataItems.length; idx++) {
    // If the current item has not been seen before,
    if (itemFrequencies[dataItems[idx]] == null) {
      // Initialize its count to 1.
      itemFrequencies[dataItems[idx]] = 1;
      // Add the item to the list of unique items.
      uniqueItems.push(dataItems[idx]);
    } else {
      // Otherwise, increment its existing count.
      itemFrequencies[dataItems[idx]]++;
    }
  }

  // Determine the output based on the number of unique items found.
  if (uniqueItems.length == 1) {
    // If there's only one unique item, print half of the total count.
    console.log(totalCount / 2);
    return; // Exit the function.
  } else if (uniqueItems.length == 2) {
    // If there are exactly two unique items, sort them by frequency in descending order.
    uniqueItems.sort(function(itemA, itemB) {
      return itemFrequencies[itemB] - itemFrequencies[itemA];
    });

    // Check if the frequencies of the two unique items are equal.
    if (itemFrequencies[uniqueItems[0]] == itemFrequencies[uniqueItems[1]]) {
      // If frequencies are equal, print "0".
      console.log("0");
    } else {
      // If frequencies are different, print half the difference between the higher and lower frequency.
      console.log((itemFrequencies[uniqueItems[0]] - itemFrequencies[uniqueItems[1]]) / 2);
    }
  } else {
    // If there are more than two unique items, sort them by frequency in descending order.
    uniqueItems.sort(function(itemA, itemB) {
      return itemFrequencies[itemB] - itemFrequencies[itemA];
    });

    // Remove the two most frequent items from the list.
    uniqueItems.shift();
    uniqueItems.shift();

    // Sum the frequencies of the remaining unique items.
    for (var idx = 0; idx < uniqueItems.length; idx++) {
      resultValue += itemFrequencies[uniqueItems[idx]];
    }
    // Print the accumulated sum.
    console.log(resultValue);
  }
}

// Read input from standard input and pass it to the processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
