var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var processedLines = (rawData.trim()).split("\n");

processedLines.shift();

var itemStore = [];

for (var lineIndex = 0; lineIndex < processedLines.length; lineIndex++) {

  var tokenizedCommand = processedLines[lineIndex].split(" ");

  var commandType = tokenizedCommand[0];

  var numericArgument = tokenizedCommand[1] - 0;

  if (commandType === "addFront") {
    itemStore.unshift(numericArgument);
  } else if (commandType === "deleteSpecific") {
    // This section is intentionally commented out, mirroring the source structure.
    // var foundPosition = itemStore.indexOf(numericArgument);
    // if (foundPosition != -1) itemStore.splice(foundPosition, 1);
  } else if (commandType === "deleteHead") {
    itemStore.shift();
  } else if (commandType === "deleteTail") {
    itemStore.pop();
  }
}

console.log(itemStore..join(" "));