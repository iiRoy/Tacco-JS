let dataSource = '';

function parseLineOfNumbers(lineText) {
  return lineText.split(' ').map(Number);
}

function getValueFromNestedMap(outerMap, key1, key2, defaultValue = Number.MAX_SAFE_INTEGER) {
  const innerMap = outerMap.get(key1);
  return innerMap && innerMap.has(key2) ? innerMap.get(key2) : defaultValue;
}

function setValueInNestedMap(outerMap, key1, key2, value) {
  if (!outerMap.has(key1)) {
    outerMap.set(key1, new Map());
  }
  outerMap.get(key1).set(key2, value);
}

function commenceProcessing(inputLines) {
  let lineIndex = 0;

  const readNextLine = () => inputLines[lineIndex++];

  const handleTestCase = () => {
    const dimensions = parseLineOfNumbers(readNextLine());
    const numberOfEdges = dimensions[0];
    const totalNodes = dimensions[1];

    if (numberOfEdges === 0 && totalNodes === 0) {
      return;
    }

    const pathCostsCollection = new Map();
    const pathTimesCollection = new Map();

    for (let nodeIdx = 1; nodeIdx <= totalNodes; ++nodeIdx) {
      setValueInNestedMap(pathCostsCollection, nodeIdx, nodeIdx, 0);
      setValueInNestedMap(pathTimesCollection, nodeIdx, nodeIdx, 0);
    }

    for (let edgeCounter = 0; edgeCounter < numberOfEdges; ++edgeCounter) {
      const edgeDetails = parseLineOfNumbers(readNextLine());
      const originNode = edgeDetails[0];
      const targetNode = edgeDetails[1];
      const edgeCost = edgeDetails[2];
      const edgeTime = edgeDetails[3];

      const currentMinCost = getValueFromNestedMap(pathCostsCollection, originNode, targetNode);
      setValueInNestedMap(pathCostsCollection, originNode, targetNode, Math.min(currentMinCost, edgeCost));
      setValueInNestedMap(pathCostsCollection, targetNode, originNode, Math.min(currentMinCost, edgeCost));

      const currentMinTime = getValueFromNestedMap(pathTimesCollection, originNode, targetNode);
      setValueInNestedMap(pathTimesCollection, originNode, targetNode, Math.min(currentMinTime, edgeTime));
      setValueInNestedMap(pathTimesCollection, targetNode, originNode, Math.min(currentMinTime, edgeTime));
    }

    const allKnownNodes = Array.from({ length: totalNodes }, (_, idx) => idx + 1);

    allKnownNodes.forEach(intermediatePoint => {
      allKnownNodes.forEach(startingPoint => {
        allKnownNodes.forEach(endingPoint => {
          const currentPathCost = getValueFromNestedMap(pathCostsCollection, startingPoint, endingPoint);
          const segment1Cost = getValueFromNestedMap(pathCostsCollection, startingPoint, intermediatePoint);
          const segment2Cost = getValueFromNestedMap(pathCostsCollection, intermediatePoint, endingPoint);
          const potentialNewCost = (segment1Cost === Number.MAX_SAFE_INTEGER || segment2Cost === Number.MAX_SAFE_INTEGER)
                                   ? Number.MAX_SAFE_INTEGER
                                   : segment1Cost + segment2Cost;
          setValueInNestedMap(pathCostsCollection, startingPoint, endingPoint, Math.min(currentPathCost, potentialNewCost));

          const currentPathTime = getValueFromNestedMap(pathTimesCollection, startingPoint, endingPoint);
          const segment1Time = getValueFromNestedMap(pathTimesCollection, startingPoint, intermediatePoint);
          const segment2Time = getValueFromNestedMap(pathTimesCollection, intermediatePoint, endingPoint);
          const potentialNewTime = (segment1Time === Number.MAX_SAFE_INTEGER || segment2Time === Number.MAX_SAFE_INTEGER)
                                   ? Number.MAX_SAFE_INTEGER
                                   : segment1Time + segment2Time;
          setValueInNestedMap(pathTimesCollection, startingPoint, endingPoint, Math.min(currentPathTime, potentialNewTime));
        });
      });
    });

    const numberOfQueries = Number(readNextLine());
    for (let queryCounter = 0; queryCounter < numberOfQueries; ++queryCounter) {
      const queryDetails = parseLineOfNumbers(readNextLine());
      const querySource = queryDetails[0];
      const queryDestination = queryDetails[1];
      const queryType = queryDetails[2];

      const resultValue = queryType === 0
        ? getValueFromNestedMap(pathCostsCollection, querySource, queryDestination)
        : getValueFromNestedMap(pathTimesCollection, querySource, queryDestination);

      console.log(resultValue);
    }

    handleTestCase();
  };

  handleTestCase();
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  dataSource += chunk;
});
process.stdin.on('end', function() {
  const processedInputLines = dataSource.split('\n').filter(line => line.trim() !== '');
  const startTime = Date.now();
  commenceProcessing(processedInputLines);
  console.log('execution_duration: ' + (Date.now() - startTime));
});