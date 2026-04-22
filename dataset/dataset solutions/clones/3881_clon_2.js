// This function processes the incoming data.
function ProcessContent(dataSource) {
  var accumulatedPoints = 0; // Initialize a variable to hold the total score.
  for (var itemIndex = 0; itemIndex < 3; itemIndex++) {
    if (dataSource[itemIndex] == 'o') {
      accumulatedPoints = accumulatedPoints + 100; // Add points for a specific character.
    }
  }

  // Display the final result.
  console.log(accumulatedPoints + 700);
}
/* Do not modify anything below this line (reads input and invokes the primary function). */
ProcessContent(require("fs").readFileSync("/dev/stdin", "utf8"));