var rawData = require('fs').readFileSync('/dev/stdin' , 'utf8');
var textSegments = rawData.split('\n');

var totalPrimaryCount = +textSegments.shift();
var sourceElements = textSegments.shift().split(' ');
var totalQueryCount = +textSegments.shift();
var targetItems = textSegments.shift().split(' ').filter(function (currentElement, elementIndex, entireArray) {
  return entireArray.indexOf(currentElement) === elementIndex;
});

var presenceTracker = {};
sourceElements.forEach(function (collectionMember) {
  presenceTracker[collectionMember] = true;
});

var foundOccurrences = 0;
targetItems.forEach(function (candidateValue) {
  if (presenceTracker[candidateValue]) {
    foundOccurrences++;
  }
});

console.log(foundOccurrences);