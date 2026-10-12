process.stdin.resume();
process.stdin.setEncoding('utf8');

// Helper function to sort numbers in descending order
function descendingSortComparator(valueA, valueB) {
  return valueB - valueA;
}

let inputLines = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  const elementCount = Number(inputLines[0]);
  let numericArray = inputLines[1].split(' ').map(Number);
  
  // Sort the array using the custom comparator for descending order
  numericArray.sort(descendingSortComparator);

  // Initialize scores for both players using an array
  // Index 0 for Player Two (Bob), Index 1 for Player One (Alice)
  const playerScores = [0, 0]; 
  const PLAYER_TWO_INDEX = 0; // Represents Bob
  const PLAYER_ONE_INDEX = 1; // Represents Alice

  // Iterate through the sorted array and distribute values alternately
  for (let iterationIndex = 0; iterationIndex < elementCount; iterationIndex++) {
    const currentCardValue = numericArray[iterationIndex];
    
    // Player Two (Bob) takes cards at even indices (0, 2, 4, ...)
    if (iterationIndex % 2 === 0) { 
      playerScores[PLAYER_TWO_INDEX] += currentCardValue;
    } 
    // Player One (Alice) takes cards at odd indices (1, 3, 5, ...)
    else { 
      playerScores[PLAYER_ONE_INDEX] += currentCardValue;
    }
  }

  // Calculate the final score difference (Alice's score - Bob's score)
  const finalScoreDifference = playerScores[PLAYER_ONE_INDEX] - playerScores[PLAYER_TWO_INDEX];
  console.log(finalScoreDifference);
});
