var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputSource;
var rawLines = [];

inputHandler.on('line', function(inputLine) {
  rawLines.push(inputLine);
});

inputHandler.on('close', function() {
  inputSource = initializeInput(rawLines);
  console.error('\n↑入力 ↓出力');
  executeProgram();
});

function readInt() {
  return dataTransformer(readNext(), 1);
}

function readStrArr() {
  return dataTransformer(readNext(), 2);
}

function readIntArr() {
  return dataTransformer(readNext(), 4);
}

function readCharArr() {
  return dataTransformer(readNext(), 6);
}

function readNext() {
  return inputSource.readNextLine();
}

function hasMore() {
  return inputSource.hasMoreLines();
}

function initializeInput(inputData) {
  return {
    lineList: inputData,
    currentIdx: 0,
    maxLines: inputData.length,

    hasMoreLines: function() {
      return this.currentIdx < this.maxLines;
    },

    readNextLine: function() {
      if (this.hasMoreLines()) {
        return this.lineList[this.currentIdx++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function outputResult(s) {
  console.log(s);
}

function debugLog(s) {
  console.error('debug:' + require('util').inspect(s, false, null));
}

function dataTransformer(inputVal, transformType) {
  try {
    switch (transformType) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(' ');
      case 4:
        return inputVal.split(' ').map(Number);
      case 6:
        return inputVal.split('');
      case 7:
        return inputVal.split('').map(Number);
      case 8:
        return inputVal.join(' ');
      case 9:
        return inputVal.join('\n');
      case 0:
        return inputVal.join('');
      default:
        return inputVal;
    }
  } catch (e) {
    return inputVal;
  }
}

function createGraph(nodeCount) {
  var graph = new Array(nodeCount);

  for (var nodeId = 0; nodeId < nodeCount; nodeId++) {
    graph[nodeId] = [];
  }

  return graph;
}

function addUndirectedEdge(graph, leftNode, rightNode) {
  graph[leftNode].push(rightNode);
  graph[rightNode].push(leftNode);
}

function multiplyLikeOriginal(currentValue, factorValue, moduloValue) {
  currentValue *= factorValue;
  currentValue %= moduloValue;
  return currentValue;
}

function countAvailableColorsForChild(parentNode, childOrder, colorLimit) {
  if (parentNode === -1) {
    return colorLimit - childOrder;
  }

  return colorLimit - 1 - childOrder;
}

function calculateColoringProduct(graph, colorLimit) {
  var moduloValue = 1000000007;
  var answer = 1;

  var stack = [];
  stack.push({
    node: 0,
    parent: -1
  });

  var visited = new Array(graph.length).fill(false);
  visited[0] = true;

  answer = multiplyLikeOriginal(answer, colorLimit, moduloValue);

  while (stack.length > 0) {
    var current = stack.pop();
    var currentNode = current.node;
    var parentNode = current.parent;

    var childOrder = 1;

    for (var edgeIndex = 0; edgeIndex < graph[currentNode].length; edgeIndex++) {
      var nextNode = graph[currentNode][edgeIndex];

      if (nextNode === parentNode) {
        continue;
      }

      if (visited[nextNode]) {
        continue;
      }

      visited[nextNode] = true;

      var availableColorCount = countAvailableColorsForChild(
        parentNode,
        childOrder,
        colorLimit
      );

      answer = multiplyLikeOriginal(
        answer,
        availableColorCount,
        moduloValue
      );

      stack.push({
        node: nextNode,
        parent: currentNode
      });

      childOrder++;
    }
  }

  return answer;
}

function executeProgram() {
  var firstLineData = readIntArr();

  var nodeCount = firstLineData[0];
  var colorLimit = firstLineData[1];

  var graph = createGraph(nodeCount);

  for (var edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
    var edgeData = readIntArr();

    var leftNode = edgeData[0] - 1;
    var rightNode = edgeData[1] - 1;

    addUndirectedEdge(graph, leftNode, rightNode);
  }

  var result = calculateColoringProduct(graph, colorLimit);

  outputResult(result);
}