var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataStream;
var inputLines = [];

inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

inputReader.on('close', function() {
  dataStream = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力'); // Preserving original string literal
  executeSolution();
});

function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function getNextInteger() {
  return convertInputToken(fetchNextToken(), 1);
}

function getNextStringArray() {
  return convertInputToken(fetchNextToken(), 2);
}

function getNextIntegerArray() {
  return convertInputToken(fetchNextToken(), 4);
}

function getNextCharacterArray() {
  return convertInputToken(fetchNextToken(), 6);
}

function fetchNextToken() {
  return dataStream.fetchNextToken();
}

function hasMoreTokens() {
  return dataStream.hasMoreTokens();
}

function initializeInputProcessor(rawInput) {
  return {
    sourceData: rawInput,
    currentIndex: 0,
    maximumIndex: rawInput.length,

    hasMoreTokens: function() {
      return (this.currentIndex < this.maximumIndex);
    },

    fetchNextToken: function() {
      if (this.hasMoreTokens()) {
        return this.sourceData[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input'; // Preserving original string literal
      }
    }
  };
}

function printResult(outputValue) {
  console.log(outputValue);
}

function logDebugMessage(debugContent) {
  console.error('debug:' + require('util').inspect(debugContent, false, null)); // Preserving original string literal
}

// This function converts input based on a numeric format code.
// 1: Parse as integer.
// 2: Split by space into string array.
// 4: Split by space into integer array.
// 6: Split into character array.
// 7: Split into character array and parse as integers.
// 8: Join array elements with space.
// 9: Join array elements with newline.
// 0: Join array elements without separator.
// Default: Return input as is.
function convertInputToken(inputItem, formatCode) {
  try {
    switch (formatCode) {
      case 1:
        return parseInt(inputItem);
      case 2:
        return inputItem.split(' ');
      case 4:
        return inputItem.split(' ').map(Number);
      case 6:
        return inputItem.split('');
      case 7:
        return inputItem.split('').map(Number);
      case 8:
        return inputItem.join(' ');
      case 9:
        return inputItem.join('\n');
      case 0:
        return inputItem.join('');
      default:
        return inputItem;
    }
  } catch (conversionError) {
    return inputItem;
  }
}

function executeSolution() {
  var firstInput = getNextIntegerArray();
  var numEvents = firstInput[0];
  var channelCountLimit = firstInput[1]; // This variable is read but not used in the algorithm.

  var timeRange = 100005; // Defines the upper bound for time points.
  var eventSchedule = new Array(timeRange);

  // Initialize each time point with empty lists for channels to add and remove.
  for (var timePoint = 0; timePoint < timeRange; timePoint++) {
    eventSchedule[timePoint] = {
      channelsToAdd: [],
      channelsToRemove: []
    };
  }

  // Process each event from the input.
  for (var eventIndex = 0; eventIndex < numEvents; eventIndex++) {
    var currentEvent = getNextIntegerArray(); // Format: [start_time, end_time, channel_id]
    // Add channel_id to the 'channelsToAdd' list at (start_time - 1).
    eventSchedule[currentEvent[0] - 1].channelsToAdd.push(currentEvent[2]);
    // Add channel_id to the 'channelsToRemove' list at end_time.
    eventSchedule[currentEvent[1]].channelsToRemove.push(currentEvent[2]);
  }

  var activeChannels = new Set(); // Tracks currently active channels.
  var maxConcurrentChannels = 0; // Stores the maximum number of channels active at any single time.

  // Iterate through each time point to simulate channel activity.
  for (var timePoint = 0; timePoint < timeRange; timePoint++) {
    // First, remove channels that end at this time point.
    for (var subIndex = 0; subIndex < eventSchedule[timePoint].channelsToRemove.length; subIndex++) {
      activeChannels.delete(eventSchedule[timePoint].channelsToRemove[subIndex]);
    }

    // Then, add channels that start at this time point.
    for (var subIndex = 0; subIndex < eventSchedule[timePoint].channelsToAdd.length; subIndex++) {
      activeChannels.add(eventSchedule[timePoint].channelsToAdd[subIndex]);
    }

    // Update the maximum concurrent channels if the current count is higher.
    maxConcurrentChannels = Math.max(maxConcurrentChannels, activeChannels.size);
  }

  printResult(maxConcurrentChannels);
}
