(function() {
    'use strict';

    var inputLinesBuffer = [];
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(currentInputLine) {
      inputLinesBuffer.push(currentInputLine);
    });

    process.stdin.on('end', function() {
      executeGameStrategy(inputLinesBuffer);
    });

    function executeGameStrategy(dataLines) {
      // Parse the first line containing N, Z, W
      const [totalCards, initialZValue, initialWValue] = dataLines[0].split(" ").map(Number);
      
      // Parse the second line containing the array A
      const cardValuesArray = dataLines[1].split(" ").map(Number);
      
      // Helper indices for clarity
      const lastCardIdx = totalCards - 1;
      const secondToLastCardIdx = totalCards - 2;

      // Scenario 1: Player X takes the last card.
      // The score is the absolute difference between the last card and Player W's initial score.
      const scenarioOneOutcome = Math.abs(cardValuesArray[lastCardIdx] - initialWValue);

      // Scenario 2: Player Y takes the last card, meaning Player X takes the second to last card.
      // The score is the absolute difference between the second to last card and the last card.
      // This assumes optimal play where Y would leave X with the best possible score from the remaining.
      const scenarioTwoOutcome = Math.abs(cardValuesArray[secondToLastCardIdx] - cardValuesArray[lastCardIdx]);
      
      // The final result is the maximum of the scores from these two critical scenarios.
      const finalCalculatedScore = Math.max(scenarioOneOutcome, scenarioTwoOutcome);
      
      console.log(finalCalculatedScore);
    }

})();
