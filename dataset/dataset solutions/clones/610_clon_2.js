process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', function(inputData) {
  var inputRows = inputData.split("\n");

  var numIterations = +inputRows[0];
  var targetString = inputRows[1];

  var outerLoopIndex, innerLoopIndex, segmentLength;
  
  var matchCount = 0;
  for (outerLoopIndex = 1; outerLoopIndex <= numIterations; outerLoopIndex++) {
    var targetChars = targetString.split('');
    var currentBoard = inputRows[outerLoopIndex];
    var charIndex, offsetValue, isMatchFound = false;
    var boardLen = currentBoard.length;
    for (offsetValue = 0; offsetValue < boardLen; offsetValue++) {
      segmentLength = targetChars.length;
      for (innerLoopIndex = 0; innerLoopIndex < segmentLength; innerLoopIndex++) {
        charIndex = innerLoopIndex + offsetValue * innerLoopIndex;
        if (currentBoard[charIndex] == targetChars[innerLoopIndex] && innerLoopIndex == segmentLength - 1) {
          isMatchFound = true;
          break;
        }
      }
      if (isMatchFound) {
        break;
      }
    }
    if (isMatchFound) {
      matchCount++;
    }
  }
  console.log(matchCount);
});
