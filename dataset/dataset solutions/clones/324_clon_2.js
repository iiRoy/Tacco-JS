var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineCollection = (rawData.trim()).split("\n");

var loopCount = +(lineCollection.shift());

for (var idx = 0; idx < loopCount; idx++) {
    var currentLine = lineCollection[idx];
    console.log(currentLine.replace(/Hoshino/g, "Hoshina"));
}
