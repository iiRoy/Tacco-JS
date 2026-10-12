function processInput(rawData) {
  const parsedValues = rawData.split(' ');
  const totalNodes = Number(parsedValues[0]);
  const nodeX = Number(parsedValues[1]);
  const nodeY = Number(parsedValues[2]);

  const calculateDistance = (startNode, endNode) => {
    const directPathLength = endNode - startNode;
    const detourPathLength = Math.abs(nodeX - startNode) + Math.abs(nodeY - endNode) + 1;
    return Math.min(directPathLength, detourPathLength);
  };

  for (let currentDistance = 1; currentDistance < totalNodes; currentDistance++) {
    let countPairs = 0;

    for (let startNode = 1; startNode <= totalNodes - currentDistance; startNode++) {
      const targetNode = startNode + currentDistance;

      if (targetNode <= totalNodes) {
        if (calculateDistance(startNode, targetNode) === currentDistance) {
          countPairs++;
        }
      }

      const requiredAbsDiffFromY = currentDistance - 1 - Math.abs(nodeX - startNode);

      const checkCandidateNode = (candidateEndNode) => {
        const isWithinBounds = candidateEndNode > 0 && candidateEndNode <= totalNodes;
        const isNotDirectTarget = candidateEndNode !== targetNode;

        if (isWithinBounds && isNotDirectTarget) {
          if (calculateDistance(startNode, candidateEndNode) === currentDistance) {
            countPairs++;
          }
        }
      };

      if (requiredAbsDiffFromY > 0) {
        const prevNodeCandidate = nodeY - requiredAbsDiffFromY;
        checkCandidateNode(prevNodeCandidate);

        const nextNodeCandidate = nodeY + requiredAbsDiffFromY;
        checkCandidateNode(nextNodeCandidate);
      } else if (requiredAbsDiffFromY === 0) {
        checkCandidateNode(nodeY);
      }
    }
    console.log(countPairs);
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
