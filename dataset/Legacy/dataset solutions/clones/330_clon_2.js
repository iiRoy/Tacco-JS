var GameSimulator = function(inningCount) {
  // Initialize the game state for a new simulation.
  this.inningCount = Number(inningCount); // Total innings to play, converted to a number.
  this.strikeCount = 0; // Current count of outs.
  this.totalStrikes = inningCount * 3; // Total outs before the game ends.
  this.baseOccupants = []; // Array to track runners on bases (0-indexed, 0 means not on base, 1st base is 1, etc.)
  this.currentScore = 0; // Accumulated score for the current inning.
  this.hasChanged = false; // Flag, currently unused but part of the original structure.
};

// Checks if the game has reached its conclusion.
GameSimulator.prototype.isFinished = function() {
  return this.strikeCount === this.totalStrikes;
};

// Outputs the current inning's score and resets for the next inning.
GameSimulator.prototype.displayScore = function() {
  console.log(this.currentScore); // Print the score to standard output.
  this.currentScore = 0; // Reset score for the next segment.
  this.baseOccupants = []; // Clear all runners from bases.
};

// Processes a single play instruction and updates game state.
GameSimulator.prototype.processPlay = function(playInstruction) {
  switch (playInstruction) {
    case 'HIT':
      // A hit means a new runner is on base, and existing runners advance.
      this.baseOccupants.push(0); // Add a new runner at position 0 (before 1st base).
      this.baseOccupants = this.baseOccupants.map(function(runnerPosition) {
        return runnerPosition + 1; // All runners advance one base.
      });
      // Check if the lead runner scored.
      if (this.baseOccupants[0] === 4) {
        this.currentScore += 1; // Increment score.
        this.baseOccupants.shift(); // Remove the runner who scored.
      }
      break;
    case 'HOMERUN':
      // A homerun scores all existing runners plus the batter.
      this.currentScore += this.baseOccupants.length + 1; // Add score for all runners and the batter.
      this.baseOccupants = []; // Clear all bases.
      break;
    case 'OUT':
      // An out is recorded.
      this.strikeCount += 1; // Increment the out counter.
      // If 3 outs are made, it's time to change innings.
      if (this.strikeCount % 3 === 0) {
        return 'change'; // Signal for inning change.
      }
      break;
  }
  return 'next'; // Signal to continue with the next play.
};

// Read input from standard input.
var inputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');
// Initialize the game simulation with the first line of input (inning count).
var gameInstance = new GameSimulator(inputLines.shift());

// Main game loop.
while (true) {
  // Process the next play instruction from input.
  if (gameInstance.processPlay(inputLines.shift()) === 'change') {
    gameInstance.displayScore(); // Display the score for the completed inning.
    // Check if the entire game has concluded.
    if (gameInstance.isFinished()) {
      break; // Exit the game loop.
    }
  }
}
