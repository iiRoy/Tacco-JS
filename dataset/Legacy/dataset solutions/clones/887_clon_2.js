var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = (rawData.trim()).split("\n");

var params = (lineSegments.shift()).split(" ").map(Number);

var loopCount = params[1];

var thresholdValue = params[1];

var resultString = "kogakubu10gokan";

for (var idx = 0; idx < loopCount; idx++) {
   var currentLineParts = lineSegments[idx].split(" ");
   var numericPart = currentLineParts[0] - 0;
   if (numericPart <= thresholdValue) {
      resultString = currentLineParts[1];
   }
}

console.log(resultString);
