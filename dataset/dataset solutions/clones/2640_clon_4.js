'use strict'

function processGraphData(rawDataInput) {
  const processedLines = rawDataInput.trim().split('\n');
  const [totalNodes, totalUpdates] = processedLines.shift().split(' ').map(Number);

  const nodeConnections = new Map();
  for (let i = 1; i <= totalNodes; i++) {
    nodeConnections.set(i, []);
  }

  const valueAccumulator = new Array(totalNodes + 1).fill(0);

  const structureDefinitions = processedLines.slice(0, totalNodes - 1);
  const initialValueAssignments = processedLines.slice(totalNodes - 1);

  for (const definitionLine of structureDefinitions) {
    const [parentIdentifier, childIdentifier] = definitionLine.split(' ').map(Number);
    nodeConnections.get(parentIdentifier).push(childIdentifier);
  }

  for (const assignmentLine of initialValueAssignments) {
    const [targetIdentifier, assignedValue] = assignmentLine.split(' ').map(Number);
    valueAccumulator[targetIdentifier] += assignedValue;
  }

  const propagateValuesDown = (currentIdentifier) => {
    const childrenOfCurrent = nodeConnections.get(currentIdentifier);
    if (childrenOfCurrent) {
      for (const childIdentifier of childrenOfCurrent) {
        valueAccumulator[childIdentifier] += valueAccumulator[currentIdentifier];
        propagateValuesDown(childIdentifier);
      }
    }
  };

  propagateValuesDown(1);

  const finalValues = valueAccumulator.slice(1).join(' ');

  console.log(finalValues);
}

processGraphData(require('fs').readFileSync('/dev/stdin', 'utf8'));
