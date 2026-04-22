var streamContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw input is parsed into individual command lines.
var commandLines = streamContent.split('\n');

// The initial line, often metadata or a count, is discarded.
commandLines.shift();


var activeList = []; // This array will hold our dynamically managed elements.

// We iterate through each instruction provided in the input.
commandLines.forEach(function(entryString) {

  // Each line is broken down into its constituent parts: command and argument.
  var instructionTokens = entryString.split(' ');

  // Based on the first token, a specific list operation is performed.
  if (instructionTokens[0] == 'insert') {
    // For 'insert', a new item is added to the beginning of the collection.
    activeList = [instructionTokens[1]].concat(activeList);
  } else if (instructionTokens[0] == 'delete') {
    // For 'delete', we search for the first occurrence of the specified item.
    for (var scanIndex = 0; scanIndex < activeList.length; scanIndex++) {
      if (activeList[scanIndex] == instructionTokens[1]) {
        activeList.splice(scanIndex, 1); // Remove the found item.
        break; // Only the first match is removed.
      }
    }
  } else if (instructionTokens[0] == 'deleteFirst') {
    // 'deleteFirst' removes the item at the very start of the list.
    activeList.shift();
  } else if (instructionTokens[0] == 'deleteLast') {
    // 'deleteLast' removes the item at the very end of the list.
    activeList.pop();
  }
});

// Finally, the remaining items in the list are joined by spaces and printed to standard output.
console.log(activeList.join(' '));