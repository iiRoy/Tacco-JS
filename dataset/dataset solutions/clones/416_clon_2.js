const dataSource = require('fs').readFileSync('/standard/input', 'encodingUtf8');

const inputLines = dataSource.trim().split('\n');

const COLOR_PALETTE = ['red', 'green', 'blue'];

const TERMINATION_CODE = '0';
const NOT_APPLICABLE_VALUE = 'NA';

/**
 * Represents a single organism within the simulation, characterized by its unique identifier
 * and hierarchical level.
 */
class Organism {
  /**
   * Initializes a new organism instance.
   * @param {string} uniqueId - A unique string sequence identifying the organism.
   * @param {number} level - The organism's depth or level in the evolutionary chain.
   */
  constructor(uniqueId, level) {
    this.uniqueId = uniqueId;
    this.level = level;
    this.colorSequence = uniqueId.split('');
  }

  /**
   * Computes and returns a list of identifiers for the next generation of organisms
   * based on specific transformation rules.
   * @returns {string[]} An array of strings, each representing a potential next organism identifier.
   */
  generateSuccessorIds() {
    const successorIds = [];
    for (let idx = 0; idx < this.colorSequence.length - 1; idx++) {
      const [currentHue, nextHue] = this.colorSequence.slice(idx, idx + 2);
      if (currentHue === nextHue) {
        continue;
      }
      const modifiedHue = COLOR_PALETTE.filter(singleHue => singleHue !== currentHue && singleHue !== nextHue)[0];
      const alteredSequence = this.colorSequence.slice();
      alteredSequence.splice(idx, 2, modifiedHue, modifiedHue);
      successorIds.push(alteredSequence.join(''));
    }
    return successorIds;
  }
}

/**
 * Manages the exploration of organism relationships using a breadth-first search algorithm.
 */
class EvolutionTree {
  /**
   * Constructs a new evolution tree instance, initializing its internal registry.
   */
  constructor() {
    this.nodeRegister = new Map();
  }

  /**
   * Executes a breadth-first search starting from a given organism identifier
   * to find the "deepest" reachable organism that has no further transformations.
   * @param {string} initialOrganismId - The starting organism identifier for the search.
   * @returns {Organism|undefined} The final organism found with no subsequent transformations, or undefined if none.
   */
  exploreTree(initialOrganismId) {
    this.processQueue = [];
    this.nodeRegister.set(initialOrganismId, new Organism(initialOrganismId, 0));
    this.processQueue.push(initialOrganismId);
    while (this.processQueue.length) {
      const currentOrganismId = this.processQueue.shift();
      const currentOrganism = this.nodeRegister.get(currentOrganismId);
      const organismSuccessors = currentOrganism.generateSuccessorIds();
      if (!organismSuccessors.length) {
        return currentOrganism;
      }
      organismSuccessors.forEach(nextId => {
        if (this.nodeRegister.has(nextId)) {
          return;
        }
        this.nodeRegister.set(nextId, new Organism(nextId, currentOrganism.level + 1));
        this.processQueue.push(nextId);
      });
    }
  }
}

inputLines.forEach(inputIdentifier => {
  if (inputIdentifier === TERMINATION_CODE) {
    return;
  }
  const treeInstance = new EvolutionTree();
  const finalOrganism = treeInstance.exploreTree(inputIdentifier);
  console.log(finalOrganism ? finalOrganism.level : NOT_APPLICABLE_VALUE);
});