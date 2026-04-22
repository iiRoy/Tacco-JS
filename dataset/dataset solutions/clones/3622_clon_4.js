const achievableTotals = new Set();

// Pre-calculate all possible sums of 4x + 7y within the given ranges
for (let multiplierA = 0; multiplierA <= 25; multiplierA++) {
  for (let multiplierB = 0; multiplierB <= 15; multiplierB++) {
    achievableTotals.add(4 * multiplierA + 7 * multiplierB);
  }
}

function assessValue(incomingText) {
  const cleanedText = incomingText.trim();
  const numericalPartMatch = cleanedText.match(/^\s*(\d+)/);
  let soughtValue;

  if (numericalPartMatch && numericalPartMatch[1]) {
    soughtValue = Number(numericalPartMatch[1]);
  } else {
    // Should not happen with valid input as per problem constraints
    console.log("Error: Invalid input format.");
    return;
  }

  // Check if the sought value exists in our pre-calculated set
  if (achievableTotals.has(soughtValue)) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
assessValue(sourceData);