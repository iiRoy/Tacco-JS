const parseData = (sourceData) => {
  const allNumericStrings = sourceData.match(/\d+/g);
  let cursor = 0;

  const nodeCountLimit = Number(allNumericStrings[cursor++]);
  const edgeQuantity = Number(allNumericStrings[cursor++]);

  const linkageSpecs = [];
  for (let idx = 0; idx < edgeQuantity; ++idx) {
    const from = Number(allNumericStrings[cursor++]);
    const to = Number(allNumericStrings[cursor++]);
    linkageSpecs.push([from, to]);
  }

  return { nodeCountLimit, linkageSpecs };
};

const constructConnections = (nodeCountLimit, linkageSpecs) => {
  const connectionMap = new Map();
  for (let i = 1; i <= nodeCountLimit; ++i) {
    connectionMap.set(i, []);
  }

  linkageSpecs.forEach(([origin, destination]) => {
    connectionMap.get(origin).push(destination);
  });
  return connectionMap;
};

const tracePathway = (originPoint, connectionMap, traversedElements) => {
  let pathStep = originPoint;
  while (pathStep !== undefined) {
    traversedElements.add(pathStep);

    const outboundRoutes = connectionMap.get(pathStep);
    if (!outboundRoutes || outboundRoutes.length === 0) {
      break;
    }

    const nextJunction = outboundRoutes.shift();
    pathStep = nextJunction;
  }
};

const determineGroups = (nodeCountLimit, connectionMap) => {
  let groupCounter = 0;
  const overallTraversed = new Set();

  for (let currentElement = 1; currentElement <= nodeCountLimit; ++currentElement) {
    if (!overallTraversed.has(currentElement)) {
      groupCounter++;
      tracePathway(currentElement, connectionMap, overallTraversed);
    }
  }
  return groupCounter;
};

const performAnalysis = (sourceData) => {
  const { nodeCountLimit, linkageSpecs } = parseData(sourceData);
  
  const mutableConnectionMap = constructConnections(nodeCountLimit, linkageSpecs);
  
  const finalCount = determineGroups(nodeCountLimit, mutableConnectionMap);
  console.log(finalCount);
};

performAnalysis(require('node:fs').readFileSync('/dev/stdin', 'utf8'));