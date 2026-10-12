function logResult(message) {
  console.log(message);
} // Standard output utility

function processGridData(rawInputString) {
  // Parse the incoming text data.
  // The input is expected to be multiple lines of text.
  let parsedLines = rawInputString.trim().split("\n");

  /*
  Consider patterns for a 2xN grid:
  -   'abcd' -> The leftmost column has 3 initial choices.
  -   'abcd' -> Subsequent horizontal pairs have 2 choices.
  -------------------------------------------------------
  -   'aac'  -> Top-left has 3 choices, bottom-left has 2 choices = 6 total.
  -   'bbc'  -> The next vertical pair always has only 1 choice.
  -------------------------------------------------------
  -   'aacc' -> Top-left has 3 choices, bottom-left has 2 choices.
  -   'bbdd' -> The right side can be 'inverted from left', 'top different', or 'bottom different' - 3 patterns.
  -------------------------------------------------------
  -   'abb'  -> If the left side is fixed,
  -   'acc'  -> The top and bottom together have 2 patterns.
  */

  let gridDimension = parseInt(parsedLines[0]);
  let topRowCharacters = parsedLines[1].split("");
  let bottomRowCharacters = parsedLines[2].split("");
  let totalArrangements = 1;
  const modulusValue = 1000000007;
  let prevWasVertical = true; // Flag: true if the previous segment was vertical (single column), false if horizontal (two columns)

  for (let currentIdx = 0; currentIdx < gridDimension; currentIdx++) {
    if (currentIdx === 0) {
      // Handling the very first segment
      if (topRowCharacters[currentIdx] === bottomRowCharacters[currentIdx]) {
        // First segment is a vertical pair (e.g., 'a' over 'a')
        totalArrangements = (totalArrangements * 3) % modulusValue;
        // prevWasVertical remains true
      } else {
        // First segment is a horizontal pair (e.g., 'a' over 'b')
        totalArrangements = (totalArrangements * 6) % modulusValue;
        currentIdx++; // Consume the next character as well
        prevWasVertical = false; // Mark as horizontal
      }
    } else {
      // Handling subsequent segments
      if (prevWasVertical) {
        // If the previous segment was vertical
        totalArrangements = (totalArrangements * 2) % modulusValue;
        if (topRowCharacters[currentIdx] === bottomRowCharacters[currentIdx]) {
          // Current segment is also vertical
          prevWasVertical = true;
        } else {
          // Current segment is horizontal
          currentIdx++; // Consume the next character
          prevWasVertical = false;
        }
      } else {
        // If the previous segment was horizontal
        if (topRowCharacters[currentIdx] === bottomRowCharacters[currentIdx]) {
          // Current segment is vertical
          prevWasVertical = true;
        } else {
          // Current segment is horizontal
          totalArrangements = (totalArrangements * 3) % modulusValue;
          currentIdx++; // Consume the next character
          prevWasVertical = false;
        }
      }
    }
    // logResult(topRowCharacters[currentIdx] + bottomRowCharacters[currentIdx] + ":" + totalArrangements); // Debugging line
  }
  logResult(totalArrangements);
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
