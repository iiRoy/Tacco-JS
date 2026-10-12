'use strict';

function processInputData(inputLines) {
  // Split the entire input string into an array of individual lines.
  inputLines = inputLines.split('\n');

  // The first line contains the count of blue items.
  const numBlueItems = Number(inputLines[0]);

  // Extract the 'blue' items from the input array.
  // These are from the second line up to (and including) the N-th line.
  const primaryItems = inputLines.slice(1, 1 + numBlueItems);

  // Extract the 'red' items.
  // These start after the blue items and the line separating them,
  // and go until the very last line (which might be empty or a newline).
  const secondaryItems = inputLines.slice(numBlueItems + 2, -1);

  // Initialize an array to store unique item tallies.
  const itemTallies = [];

  // Process each primary item to count its occurrences.
  primaryItems.forEach((currentItem, currentIndex, allItems) => {
    // If this is the first occurrence of the item, add it to our tallies.
    if (allItems.indexOf(currentItem) === currentIndex) {
      itemTallies.push({ identifier: currentItem, occurrenceCount: 1 });
    } else {
      // If the item has been seen before, find its entry and increment its count.
      itemTallies.forEach(tallyEntry => {
        if (currentItem === tallyEntry.identifier) {
          tallyEntry.occurrenceCount += 1;
        }
      });
    }
  });

  // Now, process each secondary item.
  // For each secondary item, decrement the count of the corresponding primary item.
  secondaryItems.forEach((redItem) => {
    itemTallies.forEach(tallyEntry => {
      if (redItem === tallyEntry.identifier) {
        tallyEntry.occurrenceCount -= 1;
      }
    });
  });

  // Sort the tallies in descending order based on their occurrence counts.
  itemTallies.sort((firstEntry, secondEntry) => secondEntry.occurrenceCount - firstEntry.occurrenceCount);

  // The final answer is the count of the item with the highest positive tally.
  // If the highest tally is negative, the result should be 0.
  const finalResult = (itemTallies[0].occurrenceCount >= 0) ? itemTallies[0].occurrenceCount : 0;

  // Output the calculated result.
  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
