function createInitializedMatrix(size, initialDiagonalValue = 0, initialOtherValue = Infinity) {
    const matrix = [];
    for (let r = 0; r < size; r++) {
        matrix[r] = [];
        for (let c = 0; c < size; c++) {
            matrix[r][c] = (r === c) ? initialDiagonalValue : initialOtherValue;
        }
    }
    return matrix;
}

function parseLineToNumbers(line) {
    return line.split(" ").map(Number);
}

function computeShortestPaths(numNodes, currentCostMatrix, currentTimeMatrix){
   for(let intermediateNodeIdx = 0; intermediateNodeIdx < numNodes; intermediateNodeIdx++){
      for(let startNodeIdx = 0; startNodeIdx < numNodes; startNodeIdx++){
         for(let endNodeIdx = 0; endNodeIdx < numNodes; endNodeIdx++){
            const pathCostViaIntermediate = currentCostMatrix[startNodeIdx][intermediateNodeIdx] + currentCostMatrix[intermediateNodeIdx][endNodeIdx];
            currentCostMatrix[startNodeIdx][endNodeIdx] = Math.min(currentCostMatrix[startNodeIdx][endNodeIdx], pathCostViaIntermediate);

            const pathTimeViaIntermediate = currentTimeMatrix[startNodeIdx][intermediateNodeIdx] + currentTimeMatrix[intermediateNodeIdx][endNodeIdx];
            currentTimeMatrix[startNodeIdx][endNodeIdx] = Math.min(currentTimeMatrix[startNodeIdx][endNodeIdx], pathTimeViaIntermediate);
         }
      }
   }
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = (rawData.trim()).split("\n");

const MAX_GRAPH_DIMENSION = 101;

while(true){
   const currentDimensionsLine = inputLines.shift();
   const parsedDimensions = parseLineToNumbers(currentDimensionsLine);
   const graphDimensions = parsedDimensions;

   const numEdges = graphDimensions[0];
   const numVertices = graphDimensions[1];

   if(numEdges === 0 && numVertices === 0) break;

   let costMatrix = createInitializedMatrix(MAX_GRAPH_DIMENSION);
   let timeMatrix = createInitializedMatrix(MAX_GRAPH_DIMENSION);

   for(let i = 0; i < numEdges; i++){
      const edgeData = parseLineToNumbers(inputLines.shift());

      const sourceNode = edgeData[0] - 1;
      const targetNode = edgeData[1] - 1;
      const edgeWeightCost = edgeData[2];
      const edgeWeightTime = edgeData[3];

      costMatrix[sourceNode][targetNode] = edgeWeightCost;
      timeMatrix[sourceNode][targetNode] = edgeWeightTime;
   }

   computeShortestPaths(numVertices, costMatrix, timeMatrix);

   const numQueries = Number(inputLines.shift());

   for(let i = 0; i < numQueries; i++){
      const queryDetails = parseLineToNumbers(inputLines.shift());

      const querySource = queryDetails[0] - 1;
      const queryTarget = queryDetails[1] - 1;
      const queryMetricType = queryDetails[2];

      if(queryMetricType === 0){
         console.log(costMatrix[querySource][queryTarget]);
      } else if (queryMetricType === 1){
         console.log(timeMatrix[querySource][queryTarget]);
      }
   }
}
