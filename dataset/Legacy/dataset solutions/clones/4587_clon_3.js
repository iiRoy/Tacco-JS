'use strict'

executeProgram();

async function executeProgram() {
  try {
    const rawInputString = await acquireInputData();
    const parsedNumericInput = transformInputData(rawInputString);
    determineLongestPath(parsedNumericInput);
  } catch (error) {
    // The original code does not explicitly handle or log errors from the promise chain,
    // so we maintain that behavior for strict equivalence.
  }
}

function determineLongestPath(inputData) {
  const nodeCount = inputData[0][0];
  const edgeCount = inputData[0][1];

  let pathDistances = new Array(nodeCount).fill(Infinity);
  pathDistances[0] = 0;

  const graphEdges = [];
  for (let i = 0; i < edgeCount; i++) {
    const edgeDetails = inputData[i + 1];
    graphEdges.push({
      sourceNode: edgeDetails[0] - 1,
      targetNode: edgeDetails[1] - 1,
      weightValue: edgeDetails[2] * -1
    });
  }

  let updatePassCounter = 0;

  while (true) {
    let currentIterationModified = false;

    if (updatePassCounter > nodeCount) {
      console.log('inf');
      return;
    }

    for (const currentEdge of graphEdges) {
      const { sourceNode, targetNode, weightValue } = currentEdge;

      const isSourceReachable = pathDistances[sourceNode] !== Infinity;
      const candidateDistance = pathDistances[sourceNode] + weightValue;
      const isPathImprovementPossible = pathDistances[targetNode] > candidateDistance;

      if (isSourceReachable && isPathImprovementPossible) {
        pathDistances[targetNode] = candidateDistance;
        currentIterationModified = true;
      }
    }

    if (currentIterationModified) {
      updatePassCounter++;
    } else {
      break;
    }
  }

  const finalResult = pathDistances[nodeCount - 1] * -1;
  console.log(finalResult);
}

function transformInputData(rawInputString) {
  const parseNumericRow = (rowString) => rowString.split(' ').map(Number);
  return rawInputString.split('\n').map(parseNumericRow);
}

function acquireInputData() {
  return new Promise((resolve) => {
    let inputChunks = [];
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      inputChunks.push(chunk);
    });
    process.stdin.on('end', () => {
      const fullInputContent = inputChunks.join('').trim();
      resolve(fullInputContent);
    });
  });
}
