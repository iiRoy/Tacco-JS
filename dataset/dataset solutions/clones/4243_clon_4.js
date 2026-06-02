(function() {
    'use strict';

    const inputLines = [];
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(currentInputLine) {
      inputLines.push(currentInputLine);
    });
    process.stdin.on('end', function() {
      const firstLineTokens = inputLines[0].split(" ");
      const cardQuantity = Number(firstLineTokens[0]);
      const playerZScore = Number(firstLineTokens[1]); // This value is parsed but not used in the original's core logic.
      const initialWScore = Number(firstLineTokens[2]);

      const cardCollection = inputLines[1].split(" ").map(Number);
      
      // The problem implies a simplified game where the outcome depends only on the last two cards.
      // We define two primary scenarios for the final score calculation.
      // Each scenario describes the final card held by player X and player Y.

      // Scenario 1: Player X takes the very last card from the collection.
      // Player Y's final score is the initial 'W' value.
      const scenarioOne = {
          playerXFinalCard: cardCollection.at(-1),
          playerYFinalCard: initialWScore
      };

      // Scenario 2: Player Y takes the very last card from the collection.
      // Player X then takes the second-to-last card from the collection.
      const scenarioTwo = {
          playerXFinalCard: cardCollection.at(-2),
          playerYFinalCard: cardCollection.at(-1)
      };

      // Collect all potential final score configurations into an array.
      const gameOutcomes = [scenarioOne, scenarioTwo];

      // Calculate the absolute difference for each potential outcome.
      // This represents the score for each scenario.
      const calculatedScores = gameOutcomes.map(outcome =>
          Math.abs(outcome.playerXFinalCard - outcome.playerYFinalCard)
      );

      // The final answer is the maximum score achievable across these scenarios.
      const finalResult = Math.max(...calculatedScores);
      
      console.log(finalResult);
    });
})();
