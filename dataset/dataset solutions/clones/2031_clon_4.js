const processGraphData = (dataSource) => {
  const dataFragments = dataSource.split(' ');
  const maxNodeIdentifier = Number(dataFragments[0]);
  const primaryWaypoint = Number(dataFragments[1]);
  const secondaryWaypoint = Number(dataFragments[2]);

  const determineTraversalCost = (origin, destination) => {
    const directJourney = destination - origin;
    const specialRoute = Math.abs(primaryWaypoint - origin) + Math.abs(secondaryWaypoint - destination) + 1;
    return Math.min(directJourney, specialRoute);
  };

  const costDistribution = Array(maxNodeIdentifier).fill(0);

  for (let originNode = 1; originNode < maxNodeIdentifier; originNode++) {
    for (let destinationNode = originNode + 1; destinationNode <= maxNodeIdentifier; destinationNode++) {
      const currentTraversalCost = determineTraversalCost(originNode, destinationNode);
      if (currentTraversalCost >= 1 && currentTraversalCost < maxNodeIdentifier) {
        costDistribution[currentTraversalCost]++;
      }
    }
  }

  for (let currentCost = 1; currentCost < maxNodeIdentifier; currentCost++) {
    console.log(costDistribution[currentCost]);
  }
};

processGraphData(require('fs').readFileSync('/dev/stdin', 'utf8'));