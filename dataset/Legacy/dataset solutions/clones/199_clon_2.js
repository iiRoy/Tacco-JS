var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineCollection = (rawData.trim()).split("\n");
var bloodTypeCounts = [0, 0, 0, 0];

lineCollection.forEach(function(currentLine) {
  var lineParts = currentLine.split(",");
  if (lineParts[1] === "A") bloodTypeCounts[0]++;
  if (lineParts[1] === "B") bloodTypeCounts[1]++;
  if (lineParts[1] === "AB") bloodTypeCounts[2]++;
  if (lineParts[1] === "O") bloodTypeCounts[3]++;
});

console.log(bloodTypeCounts[0]);
console.log(bloodTypeCounts[1]);
console.log(bloodTypeCounts[2]);
console.log(bloodTypeCounts[3]);
