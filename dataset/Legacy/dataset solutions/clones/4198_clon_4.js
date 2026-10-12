var inputLines = [];
var currentLineIndex = 0;

var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

inputReader.on('line', function(lineContent){
  inputLines.push(lineContent);
});

inputReader.on('close', function(){
  console.error('\n↑入力 ↓出力');
  executeIntervalAnalysis();
});

function retrieveNextLine() {
  if (currentLineIndex < inputLines.length) {
    return inputLines[currentLineIndex++];
  }
  throw new Error('Input exhausted.');
}

function parseLineAsNumbers() {
  return retrieveNextLine().split(' ').map(Number);
}

function outputResult(data) {
  console.log(data);
}

function logDebugInfo(data) {
  console.error('debug:' + require('util').inspect(data, false, null));
}

function executeIntervalAnalysis() {
  var initialParameters = parseLineAsNumbers();
  var totalIntervals = initialParameters[0];
  var ignoredParameter = initialParameters[1];

  var timelineEvents = [];

  for (var intervalIdx = 0; intervalIdx < totalIntervals; intervalIdx++) {
    var currentInterval = parseLineAsNumbers();
    var startCoord = currentInterval[0];
    var endCoord = currentInterval[1];

    timelineEvents.push([startCoord, 1]);
    timelineEvents.push([endCoord + 1, -1]);
  }

  timelineEvents.sort(function(eventA, eventB) {
    if (eventA[0] !== eventB[0]) {
      return eventA[0] - eventB[0];
    }
    return eventA[1] - eventB[1];
  });

  var peakOverlap = 1;
  var currentActiveCount = 0;

  for (var eventIdx = 0; eventIdx < timelineEvents.length; eventIdx++) {
    currentActiveCount += timelineEvents[eventIdx][1];
    peakOverlap = Math.max(peakOverlap, currentActiveCount);
  }

  outputResult(peakOverlap);
}
