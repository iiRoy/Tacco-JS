'use strict';
(function(inputSource) {
  var inputLines = inputSource.toString().split('\n');

  var numberOfMatches = parseInt(inputLines.shift(), 10);

  var matchRecords = inputLines.slice(0, numberOfMatches);

  var currentScores = [0, 0];

  for (var i = 0; i < matchRecords.length; i++) {
    var matchEntry = matchRecords[i];
    var competitorScores = matchEntry.split(' ').map(Number);

    var scoreA = competitorScores[0];
    var scoreB = competitorScores[1];

    if (scoreA > scoreB) {
      currentScores[0] += 3;
    } else if (scoreA < scoreB) {
      currentScores[1] += 3;
    } else {
      currentScores[0] += 1;
      currentScores[1] += 1;
    }
  }

  var finalScoreString = currentScores.join(' ');

  console.log(finalScoreString);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
