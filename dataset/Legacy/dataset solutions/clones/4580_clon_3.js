var fs = require("fs");
var inputLines = fs.readFileSync("/dev/stdin", "utf8").split("\n");

var paramStrings = inputLines[0].split(" ");
var numTowns = Number(paramStrings[0]);
var numRoads = Number(paramStrings[1]);

var degreeCounts = Array.from({ length: numTowns }, () => 0);

for (var roadIterator = 1; roadIterator <= numRoads; roadIterator++) {
  var roadStringParts = inputLines[roadIterator].split(" ");
  
  var firstTownId = Number(roadStringParts[0]);
  var secondTownId = Number(roadStringParts[1]);
  
  var firstTownIndex = firstTownId - 1;
  var secondTownIndex = secondTownId - 1;
  
  degreeCounts[firstTownIndex]++;
  degreeCounts[secondTownIndex]++;
}

console.log(degreeCounts.join("\n"));
