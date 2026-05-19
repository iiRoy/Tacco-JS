// This script processes input from standard input, categorizing and counting tokens.
// It reads a stream of characters, splitting them by whitespace or commas.
// Then, it iterates through these tokens, incrementing specific counters based on their value.

for (
  let alphaCount = 0, // Counter for tokens equal to 'A'
    betaCount = 0, // Counter for tokens equal to 'B'
    otherCount = 0, // Counter for tokens not 'A', 'B', or 'O'
    omegaCount = 0, // Counter for tokens equal to 'O'
    inputTokens = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s|,/), // Read all input, decode as UTF-8, and split into an array of tokens
    currentItem, // Variable to hold the token currently being processed
    tokenIndex = -1; // Index to navigate through the inputTokens array, starting before the first element
  (currentItem = inputTokens[tokenIndex += 2]); // Loop condition: Assign the token at (tokenIndex + 2) to currentItem. The loop continues as long as currentItem is not undefined (i.e., there are more tokens).
  lineSeparator = '\n' // After each iteration, assign a newline character to lineSeparator. This variable will hold '\n' when the loop finishes.
)
  // Use a ternary operator chain to check the value of the current token and increment the appropriate counter.
  currentItem === 'A' ? alphaCount++ :
  currentItem === 'B' ? betaCount++ :
  currentItem === 'O' ? omegaCount++ :
  otherCount++; // If the token is not 'A', 'B', or 'O', increment the 'otherCount'.

// After processing all tokens, print the final counts to the console.
// Each count is separated by a newline character, ensuring each count appears on its own line.
console.log(alphaCount + lineSeparator + betaCount + lineSeparator + otherCount + lineSeparator + omegaCount);
