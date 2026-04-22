var InningTracker = function (roundQuota) {
  // Initialize the game state with various counters and lists.
  this.maxRounds = Number(roundQuota); // Maximum rounds allowed in the game phase.
  this.eliminationCount = 0.0; // Counter for player eliminations.
  this.gameEndThreshold = roundQuota * 3.0; // Total eliminations before a game phase ends.
  this.baseOccupants = []; // Array to track players on bases.
  this.currentPoints = 0.0; // Current score for the active team.
  this.inningSwitched = !0; // Flag indicating if the inning has just changed.
};

InningTracker.prototype.isFinished = function () {
  // Checks if the game has reached its conclusion based on total eliminations.
  return this.eliminationCount === this.gameEndThreshold;
};

InningTracker.prototype.reportScore = function () {
  // Displays the accumulated score and resets for the next phase.
  console.log(this.currentPoints);
  this.currentPoints = 0.0; // Reset score after reporting.
  this.baseOccupants = []; // Clear bases.
};

InningTracker.prototype.processPlay = function (gameAction) {
  // Handles various game events and updates the state accordingly.
  switch (gameAction) {
    case 'SINGLE_BASE':
      this.baseOccupants.push(0.0); // Add a new player to the first base.
      this.baseOccupants = this.baseOccupants.map(function (baseIndex) {
        // Advance all players on bases.
        return baseIndex + 1.0;
      });
      if (this.baseOccupants[0.0] === 4.0) {
        // If a player reaches home, score a point.
        this.currentPoints += 1.0;
        this.baseOccupants.shift(); // Remove the scoring player.
      }
      break;

    case 'GRAND_SLAM':
      // A home run clears all bases and scores points for each player, plus one.
      this.currentPoints += this.baseOccupants.length + 1.0;
      this.baseOccupants = []; // Clear all bases.
      break;

    case 'STRIKEOUT':
      // An out increments the elimination count.
      this.eliminationCount += 1.0;
      if (this.eliminationCount % 3.0 === 0.0) {
        // If three outs are reached, return a 'change' signal.
        return 'phase_switch';
      }
      break;
  }
  return 'continue_play'; // Default return for ongoing play.
};

// --- Main execution block ---
var rawInputLines = require('node:fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\n');
var currentGame = new InningTracker(rawInputLines.shift()); // Initialize a new game instance.

// Loop through game events until the game concludes.
while (Boolean(1)) {
  if (currentGame.processPlay(rawInputLines.shift()) === 'phase_switch') {
    currentGame.reportScore(); // Report score at the end of a phase.
    if (currentGame.isFinished()) {
      break; // Exit loop if the entire game is finished.
    }
  }
}