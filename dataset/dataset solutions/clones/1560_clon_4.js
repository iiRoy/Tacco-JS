let rawTransmission = "";
process.stdin.on("data", (dataChunk) => {
  rawTransmission += dataChunk;
});

const establishInputInterface = (sourceData) => {
  let processedSegments = sourceData
    .trim()
    .split("\n")
    .map((s) => s.trim());
  let segmentPointer = 0;
  return () => processedSegments[segmentPointer++];
};

const orchestrateProcessing = (getNextSegment) => {
  const firstLineParts = getNextSegment().split(" ").map(Number);
  const vertexCount = firstLineParts[0]; // This variable is not utilized in the original logic, mirroring its behavior.
  let linkQuantity = firstLineParts[1];

  const connectionRegistry = new Map(); // Stores connections: Map<Number, Set<Number>>

  for (let i = 0; i < linkQuantity; ++i) {
    const [participantA, participantB] = getNextSegment().split(" ").map(Number);

    // Add participantB to A's connections
    if (!connectionRegistry.has(participantA)) {
      connectionRegistry.set(participantA, new Set());
    }
    connectionRegistry.get(participantA).add(participantB);

    // Add participantA to B's connections (undirected graph)
    if (!connectionRegistry.has(participantB)) {
      connectionRegistry.set(participantB, new Set());
    }
    connectionRegistry.get(participantB).add(participantA);
  }

  let peakComponentDimension = 0;
  const exploredUnits = new Set(); // Tracks visited nodes during traversal

  // Iterate over all unique nodes that have at least one connection
  for (const unitId of connectionRegistry.keys()) {
    if (!exploredUnits.has(unitId)) {
      let currentComponentSize = 0;
      const traversalQueue = [unitId]; // BFS queue
      exploredUnits.add(unitId); // Mark as visited upon enqueue

      while (traversalQueue.length > 0) {
        const currentUnit = traversalQueue.shift();
        currentComponentSize++;

        const connectedUnits = connectionRegistry.get(currentUnit);
        if (connectedUnits) { // Ensure the node has neighbors in the registry
          for (const adjacentUnit of connectedUnits) {
            if (!exploredUnits.has(adjacentUnit)) {
              exploredUnits.add(adjacentUnit);
              traversalQueue.push(adjacentUnit);
            }
          }
        }
      }
      peakComponentDimension = Math.max(peakComponentDimension, currentComponentSize);
    }
  }
  console.log(peakComponentDimension);
};

process.stdin.on("end", () => {
  const getNextSegment = establishInputInterface(rawTransmission);
  orchestrateProcessing(getNextSegment);
});