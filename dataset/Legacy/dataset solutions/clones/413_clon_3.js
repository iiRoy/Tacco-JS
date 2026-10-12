const FILE_PATH = '/dev/stdin';
const rawInputData = require('fs').readFileSync(FILE_PATH, 'utf8');
const processedInputLines = rawInputData.trim().split('\n');

const ALLOWED_HUES = ['r', 'g', 'b'];

class SegmentSequence {
  constructor(sequenceIdentifier, level) {
    this.sequenceIdentifier = sequenceIdentifier;
    this.level = level;
    this.hueArray = sequenceIdentifier.split('');
  }

  #getMissingHue(hueA, hueB) {
    return ALLOWED_HUES.find(h => h !== hueA && h !== hueB);
  }

  generateNextSequences() {
    const successorIdentifiers = [];
    const hueCount = this.hueArray.length;
    const lastValidIndex = hueCount - 1;

    for (let i = 0; i < lastValidIndex; i++) {
      const currentHue = this.hueArray[i];
      const adjacentHue = this.hueArray[i + 1];

      if (currentHue === adjacentHue) {
        continue;
      }

      const replacementHue = this.#getMissingHue(currentHue, adjacentHue);

      const modifiedHues = [...this.hueArray];
      modifiedHues[i] = replacementHue;
      modifiedHues[i + 1] = replacementHue;

      successorIdentifiers.push(modifiedHues.join(''));
    }
    return successorIdentifiers;
  }
}

class SequenceGraph {
  constructor() {
    this.nodeRegistry = new Map();
    this.explorationQueue = [];
  }

  #createNode(identifier, currentLevel) {
    return new SegmentSequence(identifier, currentLevel);
  }

  hasNode(identifier) {
    return this.nodeRegistry.has(identifier);
  }

  getNode(identifier) {
    return this.nodeRegistry.get(identifier);
  }

  setNode(identifier, level) {
    const newNode = this.#createNode(identifier, level);
    this.nodeRegistry.set(identifier, newNode);
  }

  exploreSequencesBFS(startIdentifier) {
    this.setNode(startIdentifier, 0);
    this.explorationQueue.push(startIdentifier);

    while (this.explorationQueue.length > 0) {
      const currentIdentifier = this.explorationQueue.shift();
      const currentNode = this.getNode(currentIdentifier);

      const nextIdentifiers = currentNode.generateNextSequences();

      if (nextIdentifiers.length === 0) {
        return currentNode;
      }

      for (const nextIdCandidate of nextIdentifiers) {
        if (this.hasNode(nextIdCandidate)) {
          continue;
        }
        this.setNode(nextIdCandidate, currentNode.level + 1);
        this.explorationQueue.push(nextIdCandidate);
      }
    }
    return undefined;
  }
}

processedInputLines.forEach(currentInputIdentifier => {
  if (currentInputIdentifier === '0') {
    return;
  }

  const sequenceGraphInstance = new SequenceGraph();
  const finalNodeResult = sequenceGraphInstance.exploreSequencesBFS(currentInputIdentifier);

  console.log(finalNodeResult ? finalNodeResult.level : 'NA');
});
