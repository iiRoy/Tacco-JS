const { createInterface } = require('readline');
const { inspect } = require('util');

let rawInputLines = [];
const inputReader = createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (line) => {
  rawInputLines.push(line);
});

inputReader.on('close', () => {
  const inputHandler = createInputHandler(rawInputLines);
  console.error('\n');
  const startTime = Date.now();
  executeSolution(inputHandler);
  const endTime = Date.now() - startTime;
  logDebug(`time : ${endTime}ms`);
  logDebug(`memory : ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
});

class InputLineProcessor {
  constructor(lines) {
    this.sourceLines = lines;
    this.currentLinePointer = 0;
  }

  hasMoreLines() {
    return this.currentLinePointer < this.sourceLines.length;
  }

  retrieveNextLine() {
    if (this.hasMoreLines()) {
      return this.sourceLines[this.currentLinePointer++];
    }
    throw new Error('Input exhausted: No further lines available.');
  }
}

function createInputHandler(lines) {
  return new InputLineProcessor(lines);
}

function emitOutput(data) {
  console.log(data);
}

function logDebug(data) {
  console.error(`debug:${inspect(data, false, null)}`);
}

function extractNextInteger(processor) {
  return parseInt(processor.retrieveNextLine(), 10);
}

function executeSolution(processor) {
  const targetSum = extractNextInteger(processor);

  let isTargetSumTriangular = false;
  let kFactor = 0;

  // Solve k*(k+1)/2 = targetSum for k
  // k^2 + k - 2*targetSum = 0
  // Using quadratic formula: k = (-1 +/- sqrt(1 - 4*1*(-2*targetSum))) / 2
  // k = (-1 +/- sqrt(1 + 8*targetSum)) / 2
  const discriminant = 1 + 8 * targetSum;
  const sqrtDiscriminant = Math.sqrt(discriminant);

  if (Number.isInteger(sqrtDiscriminant)) {
    const candidateK = (-1 + sqrtDiscriminant) / 2;
    if (Number.isInteger(candidateK) && candidateK >= 0) {
      isTargetSumTriangular = true;
      kFactor = candidateK;
    }
  }

  if (!isTargetSumTriangular) {
    emitOutput('No');
    return;
  }

  emitOutput('Yes');

  // Construct the combinatorial design
  // We need kFactor + 1 sets, each containing kFactor numbers.
  // The numbers are unique identifiers for pairs of vertices (edges).

  const edgeIdRegistry = new Map();
  let currentEdgeId = 1;

  // Assign unique IDs to all possible pairs (edges) of kFactor+1 vertices (0 to kFactor)
  for (let u = 0; u < kFactor; u++) {
    for (let v = u + 1; v <= kFactor; v++) {
      edgeIdRegistry.set(`${u},${v}`, currentEdgeId++);
    }
  }

  // Create kFactor + 1 sets (rows)
  const generatedSets = Array.from({ length: kFactor + 1 }, () => []);

  // Populate each set with edge IDs
  for (let vertexIndex = 0; vertexIndex <= kFactor; vertexIndex++) {
    const currentSetElements = [];
    for (let otherVertexIndex = 0; otherVertexIndex <= kFactor; otherVertexIndex++) {
      if (vertexIndex === otherVertexIndex) {
        continue; // A vertex does not form an edge with itself
      }

      // Ensure consistent key for edge (u,v) where u < v
      const u = Math.min(vertexIndex, otherVertexIndex);
      const v = Math.max(vertexIndex, otherVertexIndex);
      const edgeKey = `${u},${v}`;
      currentSetElements.push(edgeIdRegistry.get(edgeKey));
    }
    // The elements are added in a sorted manner due to the iteration order of otherVertexIndex
    generatedSets[vertexIndex] = currentSetElements;
  }

  logDebug(generatedSets); // Equivalent to original myerr(list)

  emitOutput(generatedSets.length); // Equivalent to original myout(list.length)

  const formattedOutputLines = generatedSets.map(set => {
    // Prepend kFactor to each line as per original logic
    const lineContent = [kFactor, ...set];
    return lineContent.join(' ');
  });

  emitOutput(formattedOutputLines.join('\n'));
}
