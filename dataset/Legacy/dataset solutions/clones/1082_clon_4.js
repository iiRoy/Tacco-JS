const obtainNodeType = (currentIdentifier, registry) => {
  const currentEntity = registry.get(currentIdentifier);
  if (currentEntity.parentRef === null) return 'root';
  if (currentEntity.childRefs.length === 0) return 'leaf';
  return 'internal node';
};

const computeEntityDepth = (currentIdentifier, registry) => {
  let currentEntity = registry.get(currentIdentifier);
  let currentDepth = 0;
  while (currentEntity.parentRef !== null) {
    currentEntity = registry.get(currentEntity.parentRef);
    currentDepth++;
  }
  return currentDepth;
};

const renderEntityString = (currentIdentifier, registry) => {
  const currentEntity = registry.get(currentIdentifier);
  const parentIdentifier = currentEntity.parentRef !== null ? currentEntity.parentRef : -1;
  const entityDepth = computeEntityDepth(currentIdentifier, registry);
  const entityType = obtainNodeType(currentIdentifier, registry);
  const childIdentifiersList = currentEntity.childRefs.join(', ');
  return `node ${currentIdentifier}: parent = ${parentIdentifier}, depth = ${entityDepth}, ${entityType}, [${childIdentifiersList}]`;
};

const createGraphManager = () => {
  const nodeRegistry = new Map();

  const ensureEntityExists = (identifier) => {
    if (!nodeRegistry.has(identifier)) {
      nodeRegistry.set(identifier, { identifier: identifier, parentRef: null, childRefs: [] });
    }
    return nodeRegistry.get(identifier);
  };

  const establishConnections = (sourceIdentifier, targetIdentifiers) => {
    const sourceEntity = ensureEntityExists(sourceIdentifier);
    targetIdentifiers.forEach((targetIdentifier) => {
      const targetEntity = ensureEntityExists(targetIdentifier);
      targetEntity.parentRef = sourceIdentifier;
      sourceEntity.childRefs.push(targetIdentifier);
    });
  };

  const displayStructure = () => {
    const sortedIdentifiers = Array.from(nodeRegistry.keys()).sort((a, b) => a - b);
    const outputLines = sortedIdentifiers.map(identifier => renderEntityString(identifier, nodeRegistry));
    console.log(outputLines.join('\n'));
  };

  return {
    establishConnections,
    displayStructure,
  };
};

(function processInputAndOutput(){
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalNodesCount = Number(inputLines.shift());

  const manager = createGraphManager();

  inputLines.map(l => l.split(' ')).forEach(function(lineParts) {
    const currentIdentifier = Number(lineParts.shift());
    const childrenCount = Number(lineParts.shift());
    const childIdentifiers = lineParts.map(Number);
    manager.establishConnections(currentIdentifier, childIdentifiers);
  });

  manager.displayStructure();
})();
