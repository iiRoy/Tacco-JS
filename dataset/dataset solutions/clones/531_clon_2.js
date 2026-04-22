function primaryExecution() {
  var numNodes = readInput();
  var numConstraints = readInput();
  var simpleEdges = [];
  var complexOptions = [];
  iterateRange(numConstraints, function() {
    var constraintString = readInput('string');
    var parsedElements = constraintString.split(/<=|>=|\*|\+|-/);
    parsedElements[0] = +parsedElements[0] - 1;
    parsedElements[1] = +parsedElements[1] - 1;
    parsedElements[2] = +parsedElements[2];
    var operationKind;
    if (constraintString.indexOf('*') !== -1) {
      operationKind = 2;
    } else {
      operationKind = +(constraintString.indexOf('<=') === -1);
    }
    var signDirection = +(constraintString.indexOf('+') === -1);
    if (operationKind === 0) {
      if (signDirection === 0) {
        simpleEdges[simpleEdges.length] = [parsedElements[1], parsedElements[0], -parsedElements[2]];
      } else {
        simpleEdges[simpleEdges.length] = [parsedElements[1], parsedElements[0], 0];
        simpleEdges[simpleEdges.length] = [parsedElements[0], parsedElements[1], parsedElements[2]];
      }
    } else if (operationKind === 1) {
      if (signDirection === 0) {
        simpleEdges[simpleEdges.length] = [parsedElements[0], parsedElements[1], -parsedElements[2]];
      } else {
        simpleEdges[simpleEdges.length] = [parsedElements[1], parsedElements[0], parsedElements[2]];
        simpleEdges[simpleEdges.length] = [parsedElements[0], parsedElements[1], 0];
      }
    } else {
      if (signDirection === 0) {
        complexOptions[complexOptions.length] = [[parsedElements[0], parsedElements[1], -parsedElements[2]], [parsedElements[1], parsedElements[0], -parsedElements[2]]];
      } else {
        simpleEdges[simpleEdges.length] = [parsedElements[1], parsedElements[0], parsedElements[2]];
        simpleEdges[simpleEdges.length] = [parsedElements[0], parsedElements[1], parsedElements[2]];
      }
    }
  });
  iterateRange(numNodes, function(idx) {
    simpleEdges[simpleEdges.length] = [idx, 0, 0];
  });
  var finalOutcome = -Infinity;
  iterateRange(1 << complexOptions.length, function(combinationIndex) {
    var currentGraphEdges = [].concat(simpleEdges);
    iterateRange(complexOptions.length, function(idx) {
      currentGraphEdges[currentGraphEdges.length] = complexOptions[idx][(combinationIndex >> idx) & 1];
    });
    var distanceArray = [];
    iterateRange(numNodes, function(idx) {
      distanceArray[idx] = Infinity;
    });
    distanceArray[0] = 0;
    iterateRange(numNodes, function() {
      iterateRange(currentGraphEdges.length, function(edgeIdx) {
        var currentEdge = currentGraphEdges[edgeIdx];
        distanceArray[currentEdge[1]] = Math.min(distanceArray[currentEdge[0]] + currentEdge[2], distanceArray[currentEdge[1]]);
      });
    });
    if (distanceArray[0] >= 0) {
      finalOutcome = Math.max(finalOutcome, distanceArray[numNodes - 1]);
    }
  });
  if (finalOutcome === Infinity) {
    outputResult('inf');
  } else if (finalOutcome === -Infinity) {
    outputResult(-1);
  } else {
    outputResult(finalOutcome);
  }
}

function iterateRange(begin, limit, action) {
  if (action == null) {
    action = limit;
    limit = begin;
    begin = 0;
  }
  for (var indexVar = begin; indexVar < limit; ++indexVar) {
    action(indexVar);
  }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

var dataBuffer = '';
var dataPointer = 0;

function readInput(dataType) {
  if (dataType === 'string') {
    return dataBuffer[dataPointer++];
  } else {
    return +dataBuffer[dataPointer++];
  }
}

function outputResult(valueToDisplay) {
  console.log(valueToDisplay);
}

process.stdin.on('data', function(dataChunk) {
  dataBuffer += dataChunk;
});
process.stdin.on('end', function() {
  dataBuffer = dataBuffer.split(/\s+/);
  primaryExecution();
});