/*
 * This module processes raw input data to calculate scores for two players.
 * It identifies items, sorts them based on a combined value, and then
 * distributes them between players based on a specific selection rule.
 */
function ProcessInput(rawData) {
  // Divide the incoming text into individual lines.
  const lineSegments = rawData.split('\n');

  // The first line indicates the total number of items to process.
  const itemCount = parseInt(lineSegments[0], 10);

  // Parse and prepare the item data.
  // Each item line contains two numbers (a, b).
  // We transform it into an array [a, b, a+b] and then sort the collection.
  const dishCollection = lineSegments.slice(1).map(function (currentLine) {
    const parts = currentLine.split(' ');
    const valA = parseInt(parts[0], 10);
    const valB = parseInt(parts[1], 10);
    return [valA, valB, valA + valB];
  }).sort(function (firstItem, secondItem) {
    // Sort primarily by the sum (a+b) in ascending order.
    if (firstItem[2] < secondItem[2]) {
      return -1;
    }
    if (firstItem[2] > secondItem[2]) {
      return 1;
    }
    // If sums are equal, maintain original relative order (stable sort not strictly required here).
    return 0;
  });

  // Initialize scores for both players.
  let playerAScore = 0;
  let playerBScore = 0;

  // Iterate through the sorted collection, assigning items to players.
  for (let turnIndex = 0; turnIndex < itemCount; turnIndex++) {
    let groupOffset = 0; // Offset within the current group of items with the same sum.
    let bestOffset = 0;  // Offset of the "best" item found so far in the current group.

    // Find all items that have the same sum (a+b) as the current item.
    while (turnIndex + groupOffset < itemCount && dishCollection[turnIndex + groupOffset][2] === dishCollection[turnIndex][2]) {
      // Determine which player is currently picking (0 for A, 1 for B).
      // Compare the current item's relevant value (A's value if A's turn, B's value if B's turn)
      // with the "best" item found so far in this group.
      if (dishCollection[turnIndex + groupOffset][turnIndex % 2] > dishCollection[turnIndex + bestOffset][turnIndex % 2]) {
        bestOffset = groupOffset; // Update best item's offset if a better one is found.
      }
      groupOffset++; // Move to the next item in the group.
    }

    // If a better item was found within the group (i.e., not the first item in the group),
    // swap it with the current item so the "best" one is picked first.
    if (bestOffset !== 0) {
      const tempHolder = dishCollection[turnIndex].slice(0); // Create a shallow copy.
      dishCollection[turnIndex] = dishCollection[turnIndex + bestOffset].slice(0);
      dishCollection[turnIndex + bestOffset] = tempHolder;
    }

    // Assign the selected item to the current player and update their score.
    if (turnIndex % 2 === 0) { // Player A's turn (even index).
      console.log('a take %d', dishCollection[turnIndex][turnIndex % 2]);
      playerAScore += dishCollection[turnIndex][turnIndex % 2];
    } else { // Player B's turn (odd index).
      console.log('b take %d', dishCollection[turnIndex][turnIndex % 2]);
      playerBScore += dishCollection[turnIndex][turnIndex % 2];
    }
  }

  // Output the final score difference.
  console.log('%d', playerAScore - playerBScore);
}

// Execute the main processing function with data read from standard input.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
