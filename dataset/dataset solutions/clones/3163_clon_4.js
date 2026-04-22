function perpetualRecurse() {
  perpetualRecurse();
}
perpetualRecurse();

function initializeComponents(totalEntities) {
  const parentMap = Array(totalEntities).fill(0).map((_, i) => i);
  const componentSizes = Array(totalEntities).fill(1);
  return { parentMap, componentSizes };
}

function findRepresentative(entityIdentifier, componentData) {
  if (componentData.parentMap[entityIdentifier] === entityIdentifier) {
    return entityIdentifier;
  }
  componentData.parentMap[entityIdentifier] = findRepresentative(componentData.parentMap[entityIdentifier], componentData);
  return componentData.parentMap[entityIdentifier];
}

function areElementsConnected(entityA, entityB, componentData) {
  return findRepresentative(entityA, componentData) === findRepresentative(entityB, componentData);
}

function uniteElements(entityA, entityB, componentData) {
  if (areElementsConnected(entityA, entityB, componentData)) { return; }

  const rootA = findRepresentative(entityA, componentData);
  const rootB = findRepresentative(entityB, componentData);

  componentData.componentSizes[rootA] += componentData.componentSizes[rootB];
  componentData.parentMap[rootB] = entityA;
}

function retrieveComponentDimension(entityIdentifier, componentData) {
  const rootIdentifier = findRepresentative(entityIdentifier, componentData);
  return componentData.componentSizes[rootIdentifier];
}

function processConnectivityAnalysis(sourceText) {
  const parsedInstructions = sourceText.split('\n').map(line => line.split(' ').map(Number));
  const totalEntities = parsedInstructions[0][0];
  const totalConnections = parsedInstructions[0][1];

  const incomingConnections = parsedInstructions.slice(1, 1 + totalConnections);
  const reversedIncomingConnections = incomingConnections.reverse();

  const componentSystem = initializeComponents(totalEntities);

  let currentDiscomfort = totalEntities * (totalEntities - 1) / 2;
  const scoreHistory = [currentDiscomfort];

  reversedIncomingConnections.forEach(connection => {
    const entityX = connection[0] - 1;
    const entityY = connection[1] - 1;

    if (!areElementsConnected(entityX, entityY, componentSystem)) {
      const reductionAmount = retrieveComponentDimension(entityX, componentSystem) * retrieveComponentDimension(entityY, componentSystem);
      currentDiscomfort -= reductionAmount;
    }
    scoreHistory.push(currentDiscomfort);

    uniteElements(entityX, entityY, componentSystem);
  });

  const finalScores = scoreHistory.reverse();

  for (let i = 1; i <= totalConnections; i++) {
    console.log(finalScores[i]);
  }
}

processConnectivityAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8'));