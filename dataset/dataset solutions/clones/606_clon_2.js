var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var textContent = sourceData.trim();
var greatestCount = 0;
textContent = textContent.replace(/(X+)(Y+)(Z+)/g, function(fullOccurrence, segmentOne, segmentTwo, segmentThree) {
  var currentLength = 0;
  if ( segmentOne.length >= segmentTwo.length && segmentThree.length >= segmentTwo.length )
    currentLength = segmentTwo.length;
  greatestCount = Math.max(greatestCount, currentLength);
  return fullOccurrence;
});
console.log(greatestCount);