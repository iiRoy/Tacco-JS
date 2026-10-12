const createStructureElement = (identifier, originator, descendants, level) => ({
  identifier,
  originator,
  descendants,
  level,
});

const getElementType = (element) => {
  if (element.originator === -1) return 'root';
  if (element.descendants.length === 0) return 'leaf';
  return 'internal node';
};

const formatElement = (element) => {
  const type = getElementType(element);
  return `node ${element.identifier}: parent = ${element.originator}, depth = ${element.level}, ${type}, [${element.descendants.join(', ')}]`;
};

class GraphAssembler {
  constructor() {
    this.elementRegistry = new Map();
  }

  incorporateBranch(identifier, descendantIdentifiers) {
    if (!this.elementRegistry.has(identifier)) {
      this.elementRegistry.set(identifier, createStructureElement(identifier, -1, [], 0));
    }
    const currentElement = this.elementRegistry.get(identifier);
    currentElement.descendants = descendantIdentifiers;

    descendantIdentifiers.forEach((descendantId) => {
      if (!this.elementRegistry.has(descendantId)) {
        this.elementRegistry.set(descendantId, createStructureElement(descendantId, identifier, [], currentElement.level));
      }
      const descendantElement = this.elementRegistry.get(descendantId);
      descendantElement.originator = identifier;
      descendantElement.level = currentElement.level;

      this.adjustSubtreeLevels(descendantId);
    });
  }

  adjustSubtreeLevels(elementIdentifier) {
    const processingStack = [elementIdentifier];

    while (processingStack.length > 0) {
      const currentId = processingStack.pop();
      const currentElement = this.elementRegistry.get(currentId);

      if (!currentElement) continue;

      if (currentElement.descendants.length === 0) {
        currentElement.level += 1;
      } else {
        for (let i = currentElement.descendants.length - 1; i >= 0; i--) {
          processingStack.push(currentElement.descendants[i]);
        }
      }
    }
  }

  displayStructure() {
    const sortedElements = Array.from(this.elementRegistry.values()).sort((a, b) => a.identifier - b.identifier);
    const formattedOutput = sortedElements.map(formatElement).join('\n');
    console.log(formattedOutput);
  }
}

(function processInput() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalEntries = Number(inputLines.shift());

  const structureBuilder = new GraphAssembler();

  for (const entryLine of inputLines) {
    const parsedEntry = entryLine.split(' ');
    const currentIdentifier = Number(parsedEntry.shift());
    const childCount = Number(parsedEntry.shift());
    const childIdentifiers = parsedEntry.map(Number);
    structureBuilder.incorporateBranch(currentIdentifier, childIdentifiers);
  }

  structureBuilder.displayStructure();
})();
