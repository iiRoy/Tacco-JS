var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = sourceData.trim().split("\n");
var mainString = lineSegments[0];
var targetPattern = lineSegments[1];

var matchIndices = [];
var searchStart = 0;
var currentMatchPosition;

while ((currentMatchPosition = mainString.indexOf(targetPattern, searchStart)) !== -1) {
    matchIndices.push(currentMatchPosition);
    searchStart = currentMatchPosition + 1;
}

if (matchIndices.length > 0) {
    console.log(matchIndices.join("\n"));
}
