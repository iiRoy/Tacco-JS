function processInput(sourceText) {
  const inputLines = sourceText.split('\n');
  const elementCount = parseInt(inputLines[0], 10);
  const numericSequence = parseNumbers(inputLines[1]).slice(0, elementCount);

  const occurrenceMap = new Map();
  for (const val of numericSequence) {
    occurrenceMap.set(val, (occurrenceMap.get(val) || 0) + 1);
  }

  let finalScore = 0;

  const initialKeys = Array.from(occurrenceMap.keys());

  for (const componentRoot of initialKeys) {
    if (occurrenceMap.has(componentRoot)) {
      const partitionTallies = { left: 0, right: 0 };
      exploreNode(componentRoot, occurrenceMap, false, partitionTallies);
      finalScore += Math.min(partitionTallies.left, partitionTallies.right);
    }
  }

  console.log(finalScore);
}

function parseNumbers(lineContent) {
  return lineContent.split(/\s+/).map(n => parseInt(n, 10));
}

function getComplements(value) {
  const complementsList = [];
  for (let powerOfTwo = 2; powerOfTwo <= 2 * 1e9; powerOfTwo *= 2) {
    const complementaryValue = powerOfTwo - value;
    if (complementaryValue > 0) {
      complementsList.push(complementaryValue);
    }
  }
  return complementsList;
}

function exploreNode(currentVertex, currentOccurrenceMap, onSecondPartition, partitionTallies) {
  const currentCount = currentOccurrenceMap.get(currentVertex);
  if (currentCount === undefined || currentCount <= 0) {
    return;
  }

  if (currentCount > 1) {
    currentOccurrenceMap.set(currentVertex, currentCount - 1);
  } else {
    currentOccurrenceMap.delete(currentVertex);
  }

  if (onSecondPartition) {
    partitionTallies.right++;
  } else {
    partitionTallies.left++;
  }

  const neighborComplements = getComplements(currentVertex);
  for (const neighborVertex of neighborComplements) {
    if (currentOccurrenceMap.has(neighborVertex)) {
      exploreNode(neighborVertex, currentOccurrenceMap, !onSecondPartition, partitionTallies);
    }
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
