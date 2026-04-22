/* This script handles standard input processing tasks. */
const fileSystemUtil = require('fs');
let contentSize = fileSystemUtil.fstatSync(process.stdin.fd).size;
let dataBuffer = new Buffer(contentSize);
let actualBytesRead = fileSystemUtil.readSync(
  process.stdin.fd,
  dataBuffer,
  0,
  contentSize,
  0
);
const processedLines = dataBuffer
  .toString('utf8', 0, actualBytesRead)
  .trim()
  .split('\n');

// Initiate the primary processing sequence.
processGameRounds();

/*
 * This function orchestrates the analysis of multiple game rounds.
 * It reads pairs of lines from the input, treating each pair as a round's data.
 */
function processGameRounds() {
  // Loop through the collected input lines, processing two lines for each iteration.
  for (
    let roundIndex = 0, totalRounds = processedLines.length;
    roundIndex < totalRounds;
    roundIndex += 2
  ) {
    let exactMatches = 0; // Counts digits that are correct in value and position.
    let partialMatches = 0; // Counts digits that are correct in value but wrong in position.

    // Extract and prepare the player's guess and the secret code for the current round.
    const playerGuess = processedLines[roundIndex].trim().split(' ');
    const secretCode = processedLines[roundIndex + 1].trim().split(' ');

    // Compare each element of the player's guess against the secret code.
    for (
      let guessElementIndex = 0, guessLength = playerGuess.length;
      guessElementIndex < guessLength;
      guessElementIndex++
    ) {
      // Check for an exact match at the current position.
      if (playerGuess[guessElementIndex] === secretCode[guessElementIndex]) {
        exactMatches++;
      }
      // Search for partial matches in the remaining part of the secret code.
      for (
        let secretElementIndex = guessElementIndex + 1, secretLength = playerGuess.length;
        secretElementIndex < secretLength;
        secretElementIndex++
      ) {
        if (playerGuess[guessElementIndex] === secretCode[secretElementIndex]) {
          partialMatches++;
        }
      }
    }
    // Output the calculated match counts for the current round.
    console.log(exactMatches, partialMatches);
  }
}