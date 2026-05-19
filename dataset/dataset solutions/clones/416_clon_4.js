const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split('\n');

const COLOR_SET = new Set(['r', 'g', 'b']);

class SequenceNode {
  constructor(sequenceIdentifier, currentLevel) {
    this.sequenceIdentifier = sequenceIdentifier;
    this.currentLevel = currentLevel;
  }

  generateSuccessorIdentifiers() {
    const successorIdentifiers = [];
    const seqLen = this.sequenceIdentifier.length;

    Array.from({ length: seqLen - 1 }).forEach((_, index) => {
      const charA = this.sequenceIdentifier[index];
      const charB = this.sequenceIdentifier[index + 1];

      if (charA === charB) {
        return;
      }

      let replacementChar;
      for (const c of COLOR_SET) {
        if (c !== charA && c !== charB) {
          replacementChar = c;
          break;
        }
      }

      const newSequence =
        this.sequenceIdentifier.substring(0, index) +
        replacementChar +
        replacementChar +
        this.sequenceIdentifier.substring(index + 2);

      successorIdentifiers.push(newSequence);
    });

    return successorIdentifiers;
  }
}

class StateExplorer {
  constructor() {
    this.exploredStates = new Map();
  }

  findShortestPath(initialSequence) {
    let currentLevelQueue = [];
    let nextLevelQueue = [];

    const initialNode = new SequenceNode(initialSequence, 0);
    this.exploredStates.set(initialSequence, initialNode);
    currentLevelQueue.push(initialNode);

    while (currentLevelQueue.length > 0) {
      for (const currentNode of currentLevelQueue) {
        const potentialSuccessors = currentNode.generateSuccessorIdentifiers();

        if (potentialSuccessors.length === 0) {
          return currentNode;
        }

        potentialSuccessors.forEach(successorId => {
          if (!this.exploredStates.has(successorId)) {
            const newNode = new SequenceNode(successorId, currentNode.currentLevel + 1);
            this.exploredStates.set(successorId, newNode);
            nextLevelQueue.push(newNode);
          }
        });
      }

      currentLevelQueue = nextLevelQueue;
      nextLevelQueue = [];
    }

    return null;
  }
}

for (const currentInputSequence of inputLines) {
  if (currentInputSequence === '0') {
    continue;
  }

  const solver = new StateExplorer();
  const resultNode = solver.findShortestPath(currentInputSequence);

  console.log(resultNode ? resultNode.currentLevel : 'NA');
}
