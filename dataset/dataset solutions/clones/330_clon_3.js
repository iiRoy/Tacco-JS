const fs = require("fs");

var GameSimulator = function(initialInningCount) {
  const totalInnings = +initialInningCount;
  this.totalInningsPerGame = totalInnings;
  this.currentOutsInInning = 0;
  this.maxOutsPerGame = totalInnings * 3;
  this.activeRunners = [];
  this.inningScore = 0;
};

GameSimulator.prototype.isGameConcluded = function() {
  const allOutsReached = this.currentOutsInInning === this.maxOutsPerGame;
  return allOutsReached;
};

GameSimulator.prototype.finalizeInning = function() {
  const reportedScore = this.inningScore;
  console.log(reportedScore);
  this.inningScore = 0;
  this.activeRunners = [];
};

GameSimulator.prototype.handleGameEvent = function(eventCommand) {
  const nextActionIndicator = 'next';
  const inningChangeIndicator = 'change';

  switch(eventCommand) {
    case 'HIT':
      this.activeRunners.push(0);
      let advancedRunners = [];
      for (const runnerBase of this.activeRunners) {
        advancedRunners.push(runnerBase + 1);
      }
      this.activeRunners = advancedRunners;

      while (this.activeRunners.length > 0 && this.activeRunners[0] >= 4) {
        this.inningScore += 1;
        this.activeRunners.shift();
      }
      break;

    case 'HOMERUN':
      const runnersOnBase = this.activeRunners.length;
      this.inningScore += runnersOnBase + 1;
      this.activeRunners = [];
      break;

    case 'OUT':
      this.currentOutsInInning += 1;
      const isEndOfInning = (this.currentOutsInInning % 3 === 0);
      if (isEndOfInning) {
        return inningChangeIndicator;
      }
      break;
  }
  return nextActionIndicator;
};

const rawInputData = fs.readFileSync("/dev/stdin", "utf8");
const gameInputLines = rawInputData.trim().split('\n');

const initialInningSetting = gameInputLines.shift();
const currentBaseballGame = new GameSimulator(initialInningSetting);

let gameContinues = true;
while (gameContinues) {
  const nextCommand = gameInputLines.shift();
  const playResult = currentBaseballGame.handleGameEvent(nextCommand);

  if (playResult === 'change') {
    currentBaseballGame.finalizeInning();
    if (currentBaseballGame.isGameConcluded()) {
      gameContinues = false;
    }
  }
}
