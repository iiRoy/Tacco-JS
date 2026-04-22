let collectedInput = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (piece) => {
  collectedInput += piece;
});

process.stdin.on('end', () => {
  initiateProcessing(collectedInput);
});

function* lineStreamer(fullContent) {
  const linesArray = fullContent.split('\n');
  for (const singleLine of linesArray) {
    yield singleLine;
  }
}

class JourneyParameters {
  constructor(maxMove, totalIntermediateLevels, levelModifiers) {
    this.maxStepDistance = maxMove;
    this.intermediateLevelCount = totalIntermediateLevels;
    this.levelModificationValues = levelModifiers;
  }
}

function processRawData(rawDataString) {
  const lineGenerator = lineStreamer(rawDataString);
  const journeyScenarios = [];

  while (true) {
    const currentLineResult = lineGenerator.next();
    if (currentLineResult.done) break;

    const firstValue = parseInt(currentLineResult.value, 10);
    if (firstValue === 0) break;

    const secondValue = parseInt(lineGenerator.next().value, 10);
    const modifiers = [];
    modifiers.push(0); 

    for (let k = 0; k < secondValue; ++k) {
      modifiers.push(parseInt(lineGenerator.next().value, 10));
    }
    modifiers.push(0); 

    journeyScenarios.push(new JourneyParameters(firstValue, secondValue, modifiers));
  }
  return journeyScenarios;
}

function runBreadthFirstSearch(graphMapping, initialNode) {
  const reachedNodes = new Set();
  const discoveryQueue = [initialNode];
  reachedNodes.add(initialNode);

  let queuePointer = 0;
  while (queuePointer < discoveryQueue.length) {
    const activeNode = discoveryQueue[queuePointer++];
    const connections = graphMapping.get(activeNode);
    if (connections) {
      for (const connectedNode of connections) {
        if (!reachedNodes.has(connectedNode)) {
          reachedNodes.add(connectedNode);
          discoveryQueue.push(connectedNode);
        }
      }
    }
  }
  return reachedNodes;
}

function evaluateConnectivity(scenarioDetails) {
  const terminusNodeId = scenarioDetails.intermediateLevelCount + 1;
  const totalPossibleNodes = terminusNodeId + 1; 

  const forwardEdges = new Map(); 
  const reverseEdges = new Map(); 

  for (let nodeIndex = 0; nodeIndex < totalPossibleNodes; ++nodeIndex) {
    forwardEdges.set(nodeIndex, new Set());
    reverseEdges.set(nodeIndex, new Set());
  }

  for (let currentSegment = 0; currentSegment <= scenarioDetails.intermediateLevelCount; ++currentSegment) {
    for (let stepMagnitude = 1; stepMagnitude <= scenarioDetails.maxStepDistance; ++stepMagnitude) {
      let potentialDestination = currentSegment + stepMagnitude + (currentSegment + stepMagnitude < totalPossibleNodes - 1 ? scenarioDetails.levelModificationValues[currentSegment + stepMagnitude] : 0);
      
      const actualDestination = Math.min(Math.max(potentialDestination, 0), terminusNodeId);

      if (actualDestination !== currentSegment) {
        forwardEdges.get(currentSegment).add(actualDestination);
        reverseEdges.get(actualDestination).add(currentSegment);
      }
    }
  }

  const accessibleFromStart = runBreadthFirstSearch(forwardEdges, 0);

  const canAttainEnd = runBreadthFirstSearch(reverseEdges, terminusNodeId);

  for (let checkIndex = 0; checkIndex <= scenarioDetails.intermediateLevelCount; ++checkIndex) {
    if (accessibleFromStart.has(checkIndex) && !canAttainEnd.has(checkIndex)) {
      return false;
    }
  }

  return true;
}

function initiateProcessing(fullInputString) {
  const allJourneyTests = processRawData(fullInputString);

  for (const currentJourney of allJourneyTests) {
    const outcome = evaluateConnectivity(currentJourney) ? 'OK' : 'NG';
    console.log(outcome);
  }
}