const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineData = fileContent.trim().split('\n');
const parsedEdges = lineData.map((s) => s.split(' ').map(Number));

function createDegreeTracker() {
  let nodeDegrees = new Map();

  const resetTracker = () => {
    nodeDegrees = new Map();
  };

  const adjustDegree = (nodeIdentifier) => {
    nodeDegrees.set(nodeIdentifier, (nodeDegrees.get(nodeIdentifier) || 0) + 1);
  };

  const evaluatePatrolEligibility = () => {
    let oddDegreeCount = 0;
    for (const degree of nodeDegrees.values()) {
      if (degree % 2 !== 0) {
        oddDegreeCount++;
      }
    }

    if (oddDegreeCount !== 2) {
      return false;
    }

    const nodeOneDegree = nodeDegrees.get(1);
    const nodeTwoDegree = nodeDegrees.get(2);

    return (nodeOneDegree !== undefined && nodeOneDegree % 2 !== 0) &&
           (nodeTwoDegree !== undefined && nodeTwoDegree % 2 !== 0);
  };

  return {
    reset: resetTracker,
    addConnection: (u, v) => {
      adjustDegree(u);
      adjustDegree(v);
    },
    checkEligibility: evaluatePatrolEligibility,
  };
}

const graphProcessor = createDegreeTracker();

parsedEdges.forEach(([firstNode, secondNode]) => {
  if (firstNode === 0 && secondNode === 0) {
    console.log(graphProcessor.checkEligibility() ? 'OK' : 'NG');
    graphProcessor.reset();
    return;
  }
  graphProcessor.addConnection(firstNode, secondNode);
});
