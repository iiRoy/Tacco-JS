function displayResult(messageContent) {
  console.log(messageContent); // Outputs the final computed value
}

function ProcessInputData(rawData) {
  // The input string is first trimmed and then split into an array of lines.
  // For this problem, we expect two lines: the count N, and the direction string.
  let processedLines = rawData.trim().split("\n");

  // The first line contains the integer N, representing the length of the direction string.
  let totalElements = parseInt(processedLines[0]);
  // The second line contains the string of directions (e.g., "WEEWW").
  let directionString = processedLines[1];

  // Initialize a counter for 'W' (westward) occurrences.
  let westwardCount = 0;
  // This array will store the cumulative count of 'W's from the beginning up to each position.
  let westwardPrefixSums = [];

  // Initialize a counter for 'E' (eastward) occurrences.
  let eastwardCount = 0;
  // This array will store the cumulative count of 'E's from the end up to each position.
  let eastwardSuffixSums = [];

  // Initialize the variable to store the minimum number of turns required.
  // A large initial value ensures any valid calculation will be smaller.
  let minimumTurns = 1000000;

  // First pass: Calculate prefix sums for 'W's.
  // Also, count total 'E's to initialize the second pass.
  for (let idx = 0; idx < totalElements; idx++) {
    let currentDirection = directionString.slice(idx, idx + 1);
    if (currentDirection === "W") {
      westwardCount++; // Increment 'W' counter
    } else {
      eastwardCount++; // Increment 'E' counter
    }
    westwardPrefixSums.push(westwardCount); // Store current 'W' count
  }

  // Second pass: Calculate suffix sums for 'E's.
  // We start with the total 'E' count and decrement as we move from left to right.
  // This effectively gives us the count of 'E's to the right of the current position (inclusive).
  for (let idx = 0; idx < totalElements; idx++) {
    let currentDirection = directionString.slice(idx, idx + 1);
    if (currentDirection === "E") {
      eastwardCount--; // Decrement 'E' counter if current char is 'E'
    }
    eastwardSuffixSums.push(eastwardCount); // Store remaining 'E' count to the right
  }

  // Third pass: Determine the minimum turns.
  // For each position, we consider it as the "leader" and calculate turns.
  for (let idx = 0; idx < totalElements; idx++) {
    let currentDirection = directionString.slice(idx, idx + 1);
    // If the current leader is 'W', it doesn't need to turn.
    // So, we subtract 1 from the 'W' count up to this point.
    if (currentDirection === "W") {
      westwardPrefixSums[idx]--;
    }
    // The total turns for this leader position is the sum of 'W's to its left (excluding itself if 'W')
    // and 'E's to its right (excluding itself if 'E').
    minimumTurns = Math.min(minimumTurns, westwardPrefixSums[idx] + eastwardSuffixSums[idx]);
  }

  // Output the final minimum number of turns.
  displayResult(minimumTurns);
}

// Read input from standard input, decode as UTF-8, trim whitespace, and pass to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
