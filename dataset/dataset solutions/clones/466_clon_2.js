function spinArray(originalBlock) {
  var
    sideLen = originalBlock.length,
    idx1, idx2,
    outputBlock = [];

  for (idx1 = 0; idx1 < sideLen; idx1++) {
    outputBlock[idx1] = [];
  }

  for (idx1 = 0; idx1 < sideLen; idx1++) {
    for (idx2 = 0; idx2 < sideLen; idx2++) {
      outputBlock[idx1][sideLen - idx2 - 1] = originalBlock[idx2][idx1];
    }
  }

  return outputBlock;
}

function orchestrate() {
  var
    largeMatrix, templateBlock, patternSet,
    isAnyMatch, blockMatches,
    canvasR, canvasC, foundCol, foundRow, minCol, minRow,
    variantNum, tempR, tempC,
    primaryDim, segmentDim, dataRow;

  for (;;) {
    // Process the incoming data line.
    dataRow = streamBuffer.shift().split(/\s+/).map(parseFloat);
    primaryDim = dataRow[0];
    segmentDim = dataRow[1];

    if (primaryDim === 0 && segmentDim === 0) {
      break;
    }

    largeMatrix = [];
    for (canvasR = 0; canvasR < primaryDim; canvasR++) {
      largeMatrix.push(streamBuffer.shift().split(/ +/).map(parseFloat));
    }

    templateBlock = [];
    for (canvasR = 0; canvasR < segmentDim; canvasR++) {
      templateBlock.push(streamBuffer.shift().split(/ +/).map(parseFloat));
    }

    patternSet = [];
    for (canvasR = 0; canvasR < 4; canvasR++) {
      patternSet.push(templateBlock);
      templateBlock = spinArray(templateBlock);
    }

    // Begin the exhaustive search for matching patterns.
    isAnyMatch = true;
    minCol = minRow = 99999999;

    mainSearchLoop:
    for (canvasR = 0; canvasR < primaryDim - segmentDim; canvasR++) {
      for (canvasC = 0; canvasC < primaryDim - segmentDim; canvasC++) {
        for (variantNum = 0; variantNum < 4; variantNum++) {
          blockMatches = true;
          foundCol = foundRow = 0;

          patternCheckLoop:
          for (tempR = 0; tempR < segmentDim; tempR++) {
            for (tempC = 0; tempC < segmentDim; tempC++) {
              if (patternSet[variantNum][tempR][tempC] === -1) {
                continue;
              }
              if (patternSet[variantNum][tempR][tempC] !== largeMatrix[canvasR + tempR][canvasC + tempC]) {
                blockMatches = false;
                break patternCheckLoop;
              }
              if (foundCol === 0 && foundRow === 0) {
                foundCol = canvasC + tempC + 1;
                foundRow = canvasR + tempR + 1;
              }
            }
          }

          if (blockMatches) {
            if (foundCol < minCol) {
              minCol = foundCol;
              minRow = foundRow;
            }
            if (foundCol === minCol && foundRow < minRow) {
              minRow = foundRow;
            }
          }
        }
      }
    }
    if (minCol !== 99999999 && minRow !== 99999999) {
      console.log(minCol + ' ' + minRow);
    } else {
      console.log('NA');
    }
  }
}

var
  streamBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingChunk) {
  streamBuffer += incomingChunk;
});
process.stdin.on('end', function() {
  streamBuffer = streamBuffer.split('\n');
  orchestrate();
});