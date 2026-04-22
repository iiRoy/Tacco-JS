var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8')
;


var eventLines = dataSource.trim().split("\n");
var configParams = eventLines.shift().split(" ").map(Number);
var entityCount = configParams[0];
var finalTime = configParams[2];
var entityStates = [];
var currentLeader = [0, 0];
var elapsedTime = 0;
for (var idx = 0; idx < entityCount; idx++) {
  entityStates[idx] = [0, 0, idx];
}
eventLines.push([1, finalTime, 0].join(" "));
eventLines.forEach(function(eventString) {
  eventString = eventString.split(" ").map(Number);
  var targetEntityIndex = eventString[0] - 1;
  var eventTimestamp = eventString[1];
  var scoreChange = eventString[2];

  entityStates[currentLeader[0]][1] += eventTimestamp - elapsedTime;
  elapsedTime = eventTimestamp;
  entityStates[targetEntityIndex][0] += scoreChange;

  if (scoreChange > 0) {
    if (entityStates[targetEntityIndex][0] > currentLeader[1]) {
      currentLeader = [targetEntityIndex, entityStates[targetEntityIndex][0]];
    } else if (entityStates[targetEntityIndex][0] == currentLeader[1] && targetEntityIndex <= currentLeader[0]) {
      currentLeader = [targetEntityIndex, entityStates[targetEntityIndex][0]];
    }
  }

  if (scoreChange < 0) {
    var highestScoreFound = 0;
    var highestScoreEntityIndex = 0;
    entityStates.forEach(function(entityData, entityPos) {
      if (highestScoreFound < entityData[0]) {
        highestScoreEntityIndex = entityPos;
        highestScoreFound = entityData[0]; // Fix: update highestScoreFound here
      }
    });

    currentLeader = [highestScoreEntityIndex, entityStates[highestScoreEntityIndex][0]];


  }


});


entityStates.sort(function(entityA, entityB) {
  if (entityA[1] == entityB[1]) {
    return entityA[2] - entityB[2];
  } else {
    return entityB[1] - entityA[1];
  }
});


console.log(entityStates[0][2] + 1);