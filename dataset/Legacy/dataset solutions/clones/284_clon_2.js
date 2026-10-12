let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire input into an array of lines, removing any leading/trailing whitespace.
let lineBuffer = (rawData.trim()).split("\n");

// Main loop to process each test case until "0 0" is encountered.
while (true) {
  // Get the current line which contains N and M.
  let dimensionsStr = lineBuffer.shift();

  // Check for the termination condition.
  if (dimensionsStr === "0 0") {
    break;
  }

  // Parse N and M from the string.
  let parsedDimensions = dimensionsStr.split(" ").map(Number);
  let numPeople = parsedDimensions[0]; // N: total number of people
  let skipCount = parsedDimensions[1]; // M: number to skip before elimination

  // Initialize an array to keep track of each person's status.
  // `personStatus[0]` is unused, `personStatus[1]` to `personStatus[numPeople]` represent people 1 to N.
  let personStatus = [];
  for (let personIndex = 0; personIndex <= numPeople; personIndex++) {
    personStatus[personIndex] = true; // `true` means the person is still in the game.
  }

  let currentPerson = 1;          // Index of the person currently being considered.
  let eliminationCounter = 0;     // Counts how many active people have been skipped.
  let eliminatedCount = 0;        // Total number of people eliminated so far.

  // Inner loop for the elimination process.
  while (true) {
    // Only consider active people for counting.
    if (personStatus[currentPerson]) {
      eliminationCounter++; // Increment the skip counter.

      // If the skip count is reached, eliminate the current person.
      if (eliminationCounter === skipCount) {
        personStatus[currentPerson] = false; // Mark as eliminated.
        eliminationCounter = 0;              // Reset the skip counter for the next round.
        eliminatedCount++;                   // Increment the total eliminated count.

        // Check if only one person remains.
        // `personStatus.length - 2` is equivalent to `numPeople - 1` (since `personStatus.length` is `numPeople + 1`).
        // If `numPeople - 1` people have been eliminated, one person is left.
        if (eliminatedCount === personStatus.length - 2) {
          break; // Exit the inner elimination loop.
        }
      }
    }

    currentPerson++; // Move to the next person in the circle.

    // If we go past the last person, wrap around to the first person.
    if (personStatus.length - 1 < currentPerson) {
      currentPerson = 1;
    }
  }

  // After the elimination loop, find and print the number of the last remaining person.
  for (let personIndex = 1; personIndex <= numPeople; personIndex++) {
    if (personStatus[personIndex]) {
      console.log(personIndex); // This person is the survivor.
    }
  }
}
