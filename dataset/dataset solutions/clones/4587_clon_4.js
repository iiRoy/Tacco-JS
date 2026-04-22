'use strict';

(async function chiefExecutive() {
  try {
    const rawTransmission = await acquireRawTelemetry();
    const processedTelemetry = decodeTelemetry(rawTransmission);
    await processNetworkData(processedTelemetry);
  } catch (operationFault) {
    console.error("An operational fault occurred:", operationFault);
  }
})();

async function acquireRawTelemetry() {
  return new Promise((resolveSolemnly) => {
    const transmissionFragments = [];
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (dataPacket) => {
      transmissionFragments.push(dataPacket);
    });
    process.stdin.on('end', () => {
      const consolidatedTransmission = transmissionFragments.join('').trim();
      resolveSolemnly(consolidatedTransmission);
    });
  });
}

function decodeTelemetry(rawTransmission) {
  const structuredData = rawTransmission.split('\n').map(lineSegment =>
    lineSegment.split(' ').map(val => Number(val))
  );
  return structuredData;
}

function processNetworkData(networkConfiguration) {
  const [initialMetadata, ...connectionDetails] = networkConfiguration;
  const vertexCount = initialMetadata[0];
  const linkCount = initialMetadata[1];

  const shortestPathMatrix = Array.from({ length: vertexCount + 1 }, () =>
    new Array(vertexCount).fill(Number.POSITIVE_INFINITY)
  );

  shortestPathMatrix[0][0] = 0;

  const networkLinks = connectionDetails.map(link => ({
    origin: link[0] - 1,
    terminus: link[1] - 1,
    cost: link[2] * -1
  }));

  for (let k = 1; k <= vertexCount; ++k) {
    for (let currentVertex = 0; currentVertex < vertexCount; ++currentVertex) {
      shortestPathMatrix[k][currentVertex] = shortestPathMatrix[k-1][currentVertex];
    }

    for (const currentLink of networkLinks) {
      const sourceVertex = currentLink.origin;
      const targetVertex = currentLink.terminus;
      const linkCost = currentLink.cost;

      if (shortestPathMatrix[k-1][sourceVertex] !== Number.POSITIVE_INFINITY) {
        const potentialNewCost = shortestPathMatrix[k-1][sourceVertex] + linkCost;
        shortestPathMatrix[k][targetVertex] = Math.min(
          shortestPathMatrix[k][targetVertex],
          potentialNewCost
        );
      }
    }
  }

  let hasNegativeCycle = false;
  for (let v = 0; v < vertexCount; ++v) {
    if (shortestPathMatrix[vertexCount][v] < shortestPathMatrix[vertexCount - 1][v]) {
      hasNegativeCycle = true;
      break;
    }
  }

  if (hasNegativeCycle) {
    console.log('inf');
  } else {
    const finalPathValue = shortestPathMatrix[vertexCount - 1][vertexCount - 1];
    console.log(finalPathValue * -1);
  }
}