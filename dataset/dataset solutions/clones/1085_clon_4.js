const createResultCache = (operation) => {
  const memoStorage = new Map();
  return (...inputs) => {
    const key = JSON.stringify(inputs); // Using JSON.stringify for complex keys, though numbers are fine
    if (memoStorage.has(key)) {
      return memoStorage.get(key);
    }
    const cachedOutput = operation(...inputs);
    memoStorage.set(key, cachedOutput);
    return cachedOutput;
  };
};

const parseComponentData = (rawInputLines) => {
  const componentRecords = [];
  rawInputLines.forEach(lineEntry => {
    const parts = lineEntry.split(' ').map(Number);
    componentRecords.push({ componentId: parts[0], childLeftId: parts[1], childRightId: parts[2] });
  });
  return componentRecords;
};

const constructGraph = (componentRecords) => {
  const entityCollection = new Map(); // Maps componentId to a GraphEntity object

  // First pass: Create basic GraphEntity objects and populate the map
  componentRecords.forEach(dataEntry => {
    entityCollection.set(dataEntry.componentId, {
      componentId: dataEntry.componentId,
      originalLeftId: dataEntry.childLeftId,
      originalRightId: dataEntry.childRightId,
      leftRef: null,
      rightRef: null,
      parentRef: null,
      adjacentRef: null, // Sibling
      childQuantity: 0
    });
  });

  // Second pass: Establish relationships (parent, adjacent, direct references)
  entityCollection.forEach(currentEntity => {
    // Resolve left child
    if (currentEntity.originalLeftId !== -1) {
      const leftChildEntity = entityCollection.get(currentEntity.originalLeftId);
      if (leftChildEntity) {
        currentEntity.leftRef = leftChildEntity;
        leftChildEntity.parentRef = currentEntity;
        currentEntity.childQuantity++;
      }
    }

    // Resolve right child
    if (currentEntity.originalRightId !== -1) {
      const rightChildEntity = entityCollection.get(currentEntity.originalRightId);
      if (rightChildEntity) {
        currentEntity.rightRef = rightChildEntity;
        rightChildEntity.parentRef = currentEntity;
        currentEntity.childQuantity++;
      }
    }

    // Set adjacent (sibling) references
    if (currentEntity.leftRef && currentEntity.rightRef) {
      currentEntity.leftRef.adjacentRef = currentEntity.rightRef;
      currentEntity.rightRef.adjacentRef = currentEntity.leftRef;
    }
  });

  return entityCollection;
};

const createLevelCalculator = (entityCollection) => {
  const levelCache = new Map();
  const recursiveLevelCalculation = (entityId) => {
    if (levelCache.has(entityId)) {
      return levelCache.get(entityId);
    }
    const entity = entityCollection.get(entityId);
    if (!entity) return -1; // Should not happen for valid IDs

    if (entity.parentRef === null) {
      levelCache.set(entityId, 0);
      return 0;
    } else {
      const parentLevel = recursiveLevelCalculation(entity.parentRef.componentId);
      const currentLevel = parentLevel + 1;
      levelCache.set(entityId, currentLevel);
      return currentLevel;
    }
  };
  return recursiveLevelCalculation;
};

const createAltitudeCalculator = (entityCollection) => {
  const altitudeCache = new Map();
  const recursiveAltitudeCalculation = (entityId) => {
    if (entityId === -1) { // Base case for non-existent children
      return -1;
    }
    if (altitudeCache.has(entityId)) {
      return altitudeCache.get(entityId);
    }
    const entity = entityCollection.get(entityId);
    if (!entity) return -1; // Should not happen for valid IDs

    const leftAltitude = recursiveAltitudeCalculation(entity.originalLeftId);
    const rightAltitude = recursiveAltitudeCalculation(entity.originalRightId);

    const currentAltitude = Math.max(leftAltitude, rightAltitude) + 1;
    altitudeCache.set(entityId, currentAltitude);
    return currentAltitude;
  };
  return recursiveAltitudeCalculation;
};

const getComponentCategory = (entity) => {
  if (entity.parentRef === null) {
    return 'root';
  } else if (entity.leftRef === null && entity.rightRef === null) {
    return 'leaf';
  } else {
    return 'internal node';
  }
};

const formatStructureOutput = (entityCollection, levelFn, altitudeFn, categoryFn) => {
  const resultLines = [];
  // Ensure output order matches original (by component ID)
  const sortedIds = Array.from(entityCollection.keys()).sort((a, b) => a - b);

  sortedIds.forEach(id => {
    const entity = entityCollection.get(id);
    const currentLevel = levelFn(id);
    const currentAltitude = altitudeFn(id);
    const currentCategory = categoryFn(entity);

    const parentOutput = entity.parentRef ? entity.parentRef.componentId : -1;
    const adjacentOutput = entity.adjacentRef ? entity.adjacentRef.componentId : -1;

    resultLines.push(
      `node ${entity.componentId}: parent = ${parentOutput}, sibling = ${adjacentOutput}, degree = ${entity.childQuantity}, depth = ${currentLevel}, height = ${currentAltitude}, ${currentCategory}`
    );
  });
  return resultLines.join('\n');
};

(function executeProgram() {
  const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  const rawInputLines = rawInputContent.split('\n');
  const totalElements = Number(rawInputLines.shift()); // Not strictly used in this implementation but consumed

  const parsedRecords = parseComponentData(rawInputLines);
  const establishedGraph = constructGraph(parsedRecords);

  const levelComputation = createLevelCalculator(establishedGraph);
  const altitudeComputation = createAltitudeCalculator(establishedGraph);

  const finalOutput = formatStructureOutput(
    establishedGraph,
    levelComputation,
    altitudeComputation,
    getComponentCategory
  );
  console.log(finalOutput);
})();