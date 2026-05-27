let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
let lineArray = rawData.trim().split("\n"); // Split the raw input into an array of lines
let resultString = ""; // Initialize an empty string to accumulate the final output

// Process each test case until a '0' is encountered as the first element of a line
while (lineArray.shift() != 0) {
   let currentLineParts = lineArray.shift().split(" "); // Get the next line and split it by spaces to get individual votes
   let voteCounts = {}; // Object to store vote counts for each candidate

   // Iterate through each vote in the current line to simulate the voting process turn by turn
   for (let partIndex = 0; partIndex < currentLineParts.length; partIndex++) {
      // Increment vote count for the current candidate, initializing to 0 if not seen before
      voteCounts[currentLineParts[partIndex]] = (voteCounts[currentLineParts[partIndex]] || 0) + 1;

      let sortedVotes = []; // Array to hold [count, candidateId] pairs for sorting
      // Populate the array with candidate vote counts from the voteCounts object
      for (let candidateId in voteCounts) {
         sortedVotes.push([voteCounts[candidateId], candidateId]);
      }

      // Sort candidates by vote count in descending order
      sortedVotes.sort(function(voteA, voteB) {
         return voteB[0] - voteA[0]; // Sort by the vote count (first element) descending
      });

      // Handle the edge case where there's only one candidate to prevent errors in the next check
      if (sortedVotes.length === 1) {
         sortedVotes[1] = [0]; // Assign a dummy second place with 0 votes
      }

      // Check if the leading candidate has a majority that cannot be overcome by remaining votes
      // The condition is: leader's votes > second_place_votes + remaining_votes
      if (sortedVotes[0][0] > sortedVotes[1][0] + currentLineParts.length - (partIndex + 1)) {
         // A winner is determined, append their ID and the current turn number to the result string
         resultString += sortedVotes[0][1] + " " + (partIndex + 1) + "\n";
         break; // Exit the inner loop as a winner has been found
      }
   }

   // If the inner loop completes without a winner (i.e., no 'break' was executed), it's a tie
   if (partIndex === currentLineParts.length) {
      resultString += "TIE" + "\n";
   }
}

// Output the final results, removing any trailing newline character
console.log(resultString.trim());
