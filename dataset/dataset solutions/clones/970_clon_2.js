var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = rawData.trim().split("\n");

var mainString = lineSegments[0];

var patternString = lineSegments[1];

var patternLengthMinusOne = patternString.length - 1;

var searchRegex = new RegExp(patternString, "g");

var matchIndices = [];

while (searchRegex.test(mainString)) {
   searchRegex.lastIndex -= patternLengthMinusOne;
   matchIndices.push(searchRegex.lastIndex - 1);
}

if (matchIndices.length !== 0) {
   console.log(matchIndices.join("\n"));
}
