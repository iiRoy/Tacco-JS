var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineData = (rawData.trim()).split("\n");

var numElements = lineData.shift() - 0;

var charArray = lineData.shift().split("");

var matchCount = 0;

for (var outerIndex = 0; outerIndex < numElements; outerIndex++) {
   var currentLine = lineData.shift();
   var dotString = "";
   for (var innerIndex = 0; innerIndex < 47; innerIndex++) {
      var patternString = charArray.join(dotString);
      if (patternString >= 100) break;
      var regexObject = new RegExp(patternString);
      if (regexObject.test(currentLine)) {
         matchCount++;
         break;
      }
      dotString += ".";
   }
}

console.log(matchCount);
