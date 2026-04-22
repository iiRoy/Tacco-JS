var dataStream = require('fs') .readFileSync('/dev/stdin', 'utf8');
var lineSegments = dataStream.trim() .split("\n");


while ( !false ) {

  var entryCount = lineSegments.shift() - 0.0;

  if (entryCount === 0) {
    break;
  }

  var eventSlots = [];

  while (entryCount--) {

    var momentParts = lineSegments.shift().split(" ");

    var beginComponents = momentParts[0].split(":").map(Number);
    var finishComponents = momentParts[1].split(":").map(Number);

    var beginTime = ( (beginComponents[0] * 60) * 60 ) + (beginComponents[1] * 60) + beginComponents[2];
    var finishTime = ( (finishComponents[0] * 60) * 60 ) + (finishComponents[1] * 60) + finishComponents[2];

    eventSlots.push([ beginTime, finishTime ]);

  }

  eventSlots.sort(function(firstSlot, secondSlot) {
    return firstSlot[0] - secondSlot[0];
  });

  var resourcePool = [];
  var requiredResources = 0;

  eventSlots.forEach(function(currentInterval) {

    if (resourcePool.length === 0) {
      requiredResources++;
      resourcePool.push(currentInterval[1]);
    } else {

      resourcePool.sort(function(valA, valB) {
        return valA - valB;
      });

      if (resourcePool[0] <= currentInterval[0]) {
        resourcePool.shift();
        resourcePool.push(currentInterval[1]);
      } else {
        requiredResources++;
        resourcePool.push(currentInterval[1]);
      }
    }
  });

  console.log(requiredResources);
}