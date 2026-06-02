/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ メンバー: 吉田芽依, 山田樹, 渡辺琴音, 小林健太                       ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

function parseIntegerLine(lineText) {
  return lineText.split(' ').map(function (value) {
    return parseInt(value, 10);
  });
}

function readProblemData(rawInput) {
  var lines = rawInput.split('\n');

  var headerValues = parseIntegerLine(lines[0]);
  var N = headerValues[0];
  var M = headerValues[1];

  var targetNodes = parseIntegerLine(lines[1]);

  var edges = [];
  for (var edgeIndex = 0; edgeIndex < M; edgeIndex++) {
    var edgeValues = parseIntegerLine(lines[edgeIndex + 2]);

    edges.push({
      from: edgeValues[0],
      to: edgeValues[1]
    });
  }

  return {
    nodeCount: N,
    edgeCount: M,
    targetNodes: targetNodes,
    edges: edges
  };
}

function getNeighborThroughEdge(currentNode, edge) {
  if (edge.from === currentNode) {
    return edge.to;
  }

  if (edge.to === currentNode) {
    return edge.from;
  }

  return null;
}

function collectNeighbors(currentNode, edges, edgeCount) {
  var neighbors = [];

  for (var edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    var neighbor = getNeighborThroughEdge(currentNode, edges[edgeIndex]);

    if (neighbor !== null) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

function hasAlreadyAppeared(nodeList, candidateNode) {
  return nodeList.indexOf(candidateNode) !== -1;
}

function canReachTargetNode(startNode, targetNode, edges, edgeCount) {
  var queue = [startNode];
  var visited = [startNode];
  var queuePosition = 0;

  while (queuePosition < queue.length) {
    var currentNode = queue[queuePosition];

    if (currentNode === targetNode) {
      return true;
    }

    var neighbors = collectNeighbors(currentNode, edges, edgeCount);

    for (var neighborIndex = 0; neighborIndex < neighbors.length; neighborIndex++) {
      var nextNode = neighbors[neighborIndex];

      if (!hasAlreadyAppeared(visited, nextNode)) {
        visited.push(nextNode);
        queue.push(nextNode);

        if (nextNode === targetNode) {
          return true;
        }
      }
    }

    queuePosition++;
  }

  return false;
}

function countNodesThatReachTheirTarget(problemData) {
  var count = 0;

  for (var nodeIndex = 0; nodeIndex < problemData.nodeCount; nodeIndex++) {
    var startNode = nodeIndex + 1;
    var targetNode = problemData.targetNodes[nodeIndex];

    if (
      canReachTargetNode(
        startNode,
        targetNode,
        problemData.edges,
        problemData.edgeCount
      )
    ) {
      count++;
    }
  }

  return count;
}

function main(input) {
  var problemData = readProblemData(input);
  var answer = countNodesThatReachTheirTarget(problemData);

  console.log(answer);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));