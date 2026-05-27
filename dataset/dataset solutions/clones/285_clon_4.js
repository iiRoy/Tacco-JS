const fileSystem = require('fs');

const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawInput.trim().split('\n');

function assessGraphPath(nodeDegrees) {
  const oddDegreeNodes = [];
  for (const [nodeIdentifier, degreeCount] of nodeDegrees.entries()) {
    if (degreeCount % 2 !== 0) {
      oddDegreeNodes.push(nodeIdentifier);
    }
  }

  if (oddDegreeNodes.length === 0) {
    return false;
  } else if (oddDegreeNodes.length === 2) {
    const includesNodeOne = oddDegreeNodes.includes(1);
    const includesNodeTwo = oddDegreeNodes.includes(2);
    return includesNodeOne && includesNodeTwo;
  }
  return false;
}

let currentGraphDegrees = new Map();

for (const segment of lineSegments) {
  const [originNode, destinationNode] = segment.split(' ').map(Number);

  if (originNode === 0 && destinationNode === 0) {
    console.log(assessGraphPath(currentGraphDegrees) ? 'OK' : 'NG');
    currentGraphDegrees = new Map();
  } else {
    currentGraphDegrees.set(originNode, (currentGraphDegrees.get(originNode) || 0) + 1);
    currentGraphDegrees.set(destinationNode, (currentGraphDegrees.get(destinationNode) || 0) + 1);
  }
}
