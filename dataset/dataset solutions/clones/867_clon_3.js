var fileSys = require('fs');

function readRawInputLines() {
  var inputDescriptor = process.stdin.fd;
  var dataLen = fileSys.fstatSync(inputDescriptor).size;
  var inputBuf = Buffer.alloc(dataLen);
  var readBytesCount = fileSys.readSync(inputDescriptor, inputBuf, 0, dataLen, 0);
  return inputBuf.toString('utf8', 0, readBytesCount).split('\n');
}

var rawInputLines = readRawInputLines();

orchestrateSolution();

function create2DArray(rows, cols, initialVal) {
  var grid = [];
  for (var rowIndex = 0; rowIndex < rows; rowIndex++) {
    grid[rowIndex] = [];
    for (var colIndex = 0; colIndex < cols; colIndex++) {
      grid[rowIndex][colIndex] = initialVal;
    }
  }
  return grid;
}

function findMaxInSubarray(sourceArray, startIndex, endIndex) {
  if (startIndex >= endIndex) {
    return 0; // Or -Infinity, depending on context. Original uses Math.max.apply on potentially empty array, which is -Infinity.
              // But if range is empty, it means no previous score, so 0 is safer for DP.
              // Math.max.apply(null, []) is -Infinity. Let's replicate that behavior.
  }
  var subArray = sourceArray.slice(startIndex, endIndex);
  return Math.max.apply(null, subArray);
}

function calculateMaxScore(targetMelodyLength, availablePhrases) {
  var phraseCount = availablePhrases.length;
  var memoTable = create2DArray(phraseCount + 1, targetMelodyLength + 1, 0);

  for (var phraseIdx = 0; phraseIdx < phraseCount; phraseIdx++) {
    for (var currentLen = 0; currentLen <= targetMelodyLength; currentLen++) {
      var startPos = availablePhrases[phraseIdx][0];
      var phraseLen = availablePhrases[phraseIdx][1];
      var phrasePoints = availablePhrases[phraseIdx][2];

      // Default: don't use the current phrase
      memoTable[phraseIdx + 1][currentLen] = memoTable[phraseIdx][currentLen];

      if (startPos <= currentLen) {
        var sliceStartIdx = Math.max(0, currentLen - phraseLen);
        var sliceEndIdx = currentLen - startPos + 1;

        var maxPreviousScore = findMaxInSubarray(memoTable[phraseIdx + 1], sliceStartIdx, sliceEndIdx);
        
        // If maxPreviousScore is -Infinity (from empty range), treat it as 0 for addition
        var potentialNewScore = (maxPreviousScore === -Infinity ? 0 : maxPreviousScore) + phrasePoints;

        memoTable[phraseIdx + 1][currentLen] = Math.max(memoTable[phraseIdx + 1][currentLen], potentialNewScore);
      }
    }
  }
  return memoTable[phraseCount][targetMelodyLength];
}

function orchestrateSolution() {
  var numPhrasesToRead = rawInputLines.shift() - 0;
  var allPhrases = [];

  for (var i = 0; i < numPhrasesToRead; i++) {
    allPhrases.push(rawInputLines.shift().split(' ').map(Number));
  }

  allPhrases.sort(function (phraseA, phraseB) {
    return phraseA[2] - phraseB[2]; // Sort by points
  });

  var numMelodiesToProcess = rawInputLines.shift() - 0;
  var targetMelodyLengths = [];

  for (var j = 0; j < numMelodiesToProcess; j++) {
    targetMelodyLengths.push(rawInputLines.shift() - 0);
  }

  var resultScores = [];
  var hasZeroScore = false;

  for (var k = 0; k < numMelodiesToProcess; k++) {
    var currentMelodyTarget = targetMelodyLengths[k];
    var currentMaxScore = calculateMaxScore(currentMelodyTarget, allPhrases);

    if (currentMaxScore === 0) {
      hasZeroScore = true;
    } else {
      resultScores.push(currentMaxScore);
    }
  }

  if (hasZeroScore) {
    console.log(-1);
  } else {
    for (var l = 0; l < resultScores.length; l++) {
      console.log(resultScores[l]);
    }
  }
}
