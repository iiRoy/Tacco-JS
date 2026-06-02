var DATA_PARSER = (function () {
  // Factory function to create a new parser instance
  function createParser(inputString) {
    return new ParserInstance(inputString);
  }

  // Constructor for the ParserInstance object
  function ParserInstance(rawInput) {
    // Split the input string into lines and store them
    this._lines = rawInput.trim().split("\n");
    // Initialize the current line index
    this._currentLineIndex = 0;
  }

  // Method to read a single token from the current line
  ParserInstance.prototype.readNextToken = function (returnAsString) {
    var lineData = this._lines;
    var currentIndex = this._currentLineIndex;
    var tokenValue;

    // If the current line hasn't been processed into tokens yet, do so
    if (typeof lineData[currentIndex] === "string") {
      lineData[currentIndex] = lineData[currentIndex].split(" ").reverse();
    }

    // Pop the last token (which is the first in original order)
    tokenValue = lineData[currentIndex].pop();

    // If the current line is now empty, advance to the next line
    if (!lineData[currentIndex].length) {
      this._currentLineIndex++;
    }

    // Return the token, optionally parsed as a number
    return returnAsString ? tokenValue : +tokenValue;
  };

  // Method to read all tokens from the current line
  ParserInstance.prototype.readLineTokens = function (returnStrings) {
    var lineTokens = this._lines[this._currentLineIndex++].split(" ");
    // Return tokens as strings or numbers
    return returnStrings ? lineTokens : lineTokens.map((item) => +item);
  };

  // Method to read a matrix (multiple lines, each split into tokens)
  ParserInstance.prototype.readMatrix = function (numRows, asStrings) {
    var matrixRows = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map((row) => row.split(" "));
    // Return matrix elements as strings or numbers
    return asStrings
      ? matrixRows
      : matrixRows.map((row) => row.map((item) => +item));
  };

  // Method to read raw lines without splitting them into tokens
  ParserInstance.prototype.readRawLines = function (count, keepStrings) {
    var rawLines = this._lines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += count)
    );
    // Return lines as strings or numbers
    return keepStrings ? rawLines : rawLines.map((item) => +item);
  };

  return createParser;
})();

// Initialize the input reader with data from standard input
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to create multi-dimensional arrays (not used in this specific problem, but part of the original utility)
function createMultiDimArray(initialValue) {
  var args = arguments,
    argLength = args.length,
    arrayExpression = "Array(args[" + --argLength + "]).fill(initialValue)";
  while (--argLength) {
    arrayExpression =
      "Array(args[" + argLength + "]).fill(0).map(x=>" + arrayExpression + ")";
  }
  return eval(arrayExpression);
}

// Output the result of the main problem-solving function
console.log(solveProblem());

// Main function to solve the problem
function solveProblem() {
  // Read the number of events and the number of channels
  var numEvents = inputReader.readNextToken();
  var numChannels = inputReader.readNextToken();

  // Initialize an array of arrays to store schedules for each channel
  var channelSchedules = Array(numChannels)
    .fill(0)
    .map((_) => []);
  // Variable to track the maximum end time across all events
  var maxEndTime = 0;

  // Process each event
  for (var eventIdx = 0; eventIdx < numEvents; eventIdx++) {
    // Read event details: [start_time, end_time, channel_id]
    var eventDetails = inputReader.readLineTokens();
    // Add the event's start and end times to its respective channel's schedule
    channelSchedules[eventDetails[2] - 1].push([eventDetails[0], eventDetails[1]]);
    // Update the maximum end time if the current event's end time is greater
    if (maxEndTime < eventDetails[1]) {
      maxEndTime = eventDetails[1];
    }
  }

  // Arrays to store all start times and end times for processing
  var startTimes = [];
  var endTimes = [];

  // Process schedules for each channel
  for (eventIdx = 0; eventIdx < numChannels; eventIdx++) {
    // Sort events within the current channel by start time
    channelSchedules[eventIdx].sort((eventA, eventB) => eventA[0] - eventB[0]);
    var currentChannelLength = channelSchedules[eventIdx].length;

    // Merge overlapping events within the same channel
    for (var scheduleIdx = 0; scheduleIdx < currentChannelLength; scheduleIdx++) {
      // Add the start time of the current (or merged) event
      startTimes.push(channelSchedules[eventIdx][scheduleIdx][0] - 1); // -1 for 0-indexed time slot

      // Check for overlapping events and merge them
      while (
        scheduleIdx + 1 < currentChannelLength &&
        channelSchedules[eventIdx][scheduleIdx][1] + 1 >=
          channelSchedules[eventIdx][scheduleIdx + 1][0]
      ) {
        // Extend the current event's end time to cover the overlapping event
        channelSchedules[eventIdx][scheduleIdx][1] = Math.max(
          channelSchedules[eventIdx][scheduleIdx][1],
          channelSchedules[eventIdx][scheduleIdx + 1][1]
        );
        scheduleIdx++; // Move to the next event to check for further overlaps
      }
      // Add the end time of the current (potentially merged) event
      endTimes.push(channelSchedules[eventIdx][scheduleIdx][1]);
    }
  }

  // Sort all collected start and end times
  startTimes.sort((timeA, timeB) => timeA - timeB);
  endTimes.sort((timeA, timeB) => timeA - timeB);

  // Pointers for iterating through sorted start and end times
  var startIndexPtr = 0;
  var endIndexPtr = 0;

  // Variables to track the maximum concurrent events and current concurrent events
  var maxConcurrentEvents = 0;
  var currentConcurrentEvents = 0;

  // Iterate through time slots from 0 up to the maximum end time
  for (eventIdx = 0; eventIdx <= maxEndTime; eventIdx++) {
    // Decrement concurrent count for events that end at the current time slot
    while (endTimes[endIndexPtr] === eventIdx) {
      currentConcurrentEvents--;
      endIndexPtr++;
    }
    // Increment concurrent count for events that start at the current time slot
    while (startTimes[startIndexPtr] === eventIdx) {
      currentConcurrentEvents++;
      startIndexPtr++;
    }
    // Update the maximum concurrent events if the current count is higher
    if (maxConcurrentEvents < currentConcurrentEvents) {
      maxConcurrentEvents = currentConcurrentEvents;
    }
  }

  // Return the final result
  return maxConcurrentEvents;
}
