function coordinateFlow(dataLines) {
  const initialConfiguration = dataLines[0].split(' ').map(Number);
  const totalNodes = initialConfiguration[0];
  const supplementalEdges = initialConfiguration[1];

  const linkRegistry = new Map(); // Maps destination_id -> Array of {source_id, destination_id}

  // Parse incoming connection definitions
  for (let entryIndex = 1; entryIndex <= totalNodes - 1 + supplementalEdges; ++entryIndex) {
    const connectionDetails = dataLines[entryIndex].split(' ').map(Number);
    const originIdentifier = connectionDetails[0];
    const targetIdentifier = connectionDetails[1];
    const connectionUnit = { origin: originIdentifier, terminus: targetIdentifier };

    if (!linkRegistry.has(targetIdentifier)) {
      linkRegistry.set(targetIdentifier, []);
    }
    linkRegistry.get(targetIdentifier).push(connectionUnit);
  }

  // Ensure all nodes from 1 to totalNodes have an entry in the link registry
  for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; ++nodeIdentifier) {
    if (!linkRegistry.has(nodeIdentifier)) {
      linkRegistry.set(nodeIdentifier, []);
    }
  }

  const finalResults = new Array(totalNodes); // Store the computed primary source for each node

  // Determine the primary source for each node
  for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; ++nodeIdentifier) {
    const incomingUnits = linkRegistry.get(nodeIdentifier);
    if (incomingUnits.length > 1) {
      const resolvedSources = sourcePrioritizer(nodeIdentifier, linkRegistry);
      finalResults[nodeIdentifier - 1] = resolvedSources.find(id => id >= 0);
    } else {
      finalResults[nodeIdentifier - 1] = incomingUnits.length ? incomingUnits[0].origin : 0;
    }
  }
  console.log(finalResults.join('\r\n'));
}

function sourcePrioritizer(targetNodeId, relationshipMap) {
  const directConnections = relationshipMap.get(targetNodeId) || [];
  const mutableSourceCandidates = directConnections.map(link => link.origin);
  const numberOfDirectSources = directConnections.length;

  const ancestorExplorationQueues = [];
  for (let idx = 0; idx < numberOfDirectSources; ++idx) {
    const currentDirectSource = directConnections[idx].origin;
    const connectionsToDirectSource = relationshipMap.get(currentDirectSource) || [];
    ancestorExplorationQueues.push([...connectionsToDirectSource]);
  }

  const pathClaimedFlags = new Array(numberOfDirectSources).fill(false);

  let explorationInProgress = true;
  while (explorationInProgress) {
    explorationInProgress = false;
    for (let pathIdx = 0; pathIdx < numberOfDirectSources; ++pathIdx) {
      const currentPathQueue = ancestorExplorationQueues[pathIdx];
      if (currentPathQueue.length === 0) continue;

      explorationInProgress = true;

      const currentTraversedLink = currentPathQueue.shift();
      const currentAncestorId = currentTraversedLink.origin;

      const matchingDirectSourceIndex = mutableSourceCandidates.indexOf(currentAncestorId);
      if (matchingDirectSourceIndex !== -1) {
        pathClaimedFlags[pathIdx] = true;
        mutableSourceCandidates[matchingDirectSourceIndex] = -1; // Mark as claimed
      }

      if (!pathClaimedFlags[pathIdx]) {
        const connectionsToAncestor = relationshipMap.get(currentAncestorId) || [];
        for (const linkEntry of connectionsToAncestor) {
          currentPathQueue.push(linkEntry);
        }
      }
    }
  }
  return mutableSourceCandidates;
}

var rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
  rawInputBuffer += dataSegment;
});
process.stdin.on('end', function() {
  const processedInputLines = rawInputBuffer.split('\n');
  coordinateFlow(processedInputLines);
});