// The incoming 'rawData' string contains all necessary information.
function ProcessData(rawData) {
  // Each element of 'lineSegments' corresponds to a distinct line from the original input.
  var lineSegments = rawData.split("\n");

  var totalItems = Number(lineSegments[0]); // Convert the first line to a number for total items.

  // Parse and sort the remaining lines, calculating a combined value for sorting.
  var itemCollection = lineSegments
    .slice(1)
    .map(function (currentEntry) {
      let tokens = currentEntry.split(" ");
      return [parseInt(tokens[0], 10), parseInt(tokens[1], 10), parseInt(tokens[0], 10) + parseInt(tokens[1], 10)];
    })
    .sort(function (itemA, itemB) {
      // Custom sort function based on the combined value (index 2).
      if (itemA[2] < itemB[2]) {
        return -1;
      }
      if (itemA[2] > itemB[2]) {
        return 1;
      }
      return 0;
    });

  var playerAScore = 0; // Accumulator for the first player's points.
  var playerBScore = 0; // Accumulator for the second player's points.

  // Iterate through the sorted collection, assigning items to players.
  for (let idx = 0; idx < totalItems; idx++) {
    let subIdx = 0; // Inner loop counter.
    let greatestOffset = 0; // Keeps track of the index with the maximum value within a group.

    // Find the longest sequence of items with the same combined value.
    while (idx + subIdx < totalItems && itemCollection[idx + subIdx][2] === itemCollection[idx][2]) {
      // Determine which item has a higher value for the current player's turn.
      if (itemCollection[idx + subIdx][idx % 2] > itemCollection[idx + greatestOffset][idx % 2]) {
        greatestOffset = subIdx;
      }
      subIdx++;
    }

    // If a better item was found within the group, swap it to the current position.
    if (greatestOffset !== 0) {
      let temporaryHolder = itemCollection[idx].slice(0); // Create a shallow copy.
      itemCollection[idx] = itemCollection[idx + greatestOffset].slice(0);
      itemCollection[idx + greatestOffset] = temporaryHolder;
    }

    // Assign the item based on whose turn it is (even/odd index).
    if (idx % 2 === 0) {
      console.log('Player one picks: %d', itemCollection[idx][idx % 2]);
      playerAScore += itemCollection[idx][idx % 2];
    } else {
      console.log('Player two picks: %d', itemCollection[idx][idx % 2]);
      playerBScore += itemCollection[idx][idx % 2];
    }
  }

  // Display the final difference in scores.
  console.log('%d', playerAScore - playerBScore);
}

// Critical system entry point - do not modify.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));