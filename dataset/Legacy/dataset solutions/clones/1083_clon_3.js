class Hierarchy {
  static get Element() {
    return class {
      constructor(identifier, parentIdentifier, childIdentifiers, level) {
        this.identifier = identifier;
        this.parentIdentifier = parentIdentifier;
        const initialChildIdentifiers = childIdentifiers || [];
        this.childIdentifiers = initialChildIdentifiers;
        this.level = level;
      }

      get type() {
        let nodeKind;
        if (this.parentIdentifier === -1) {
          nodeKind = 'root';
        } else if (this.childIdentifiers.length === 0) {
          nodeKind = 'leaf';
        } else {
          nodeKind = 'internal node';
        }
        return nodeKind;
      }

      toString() {
        const parentInfo = `parent = ${this.parentIdentifier}`;
        const depthInfo = `depth = ${this.level}`;
        const childrenList = `[${this.childIdentifiers.join(', ')}]`;
        return `node ${this.identifier}: ${parentInfo}, ${depthInfo}, ${this.type}, ${childrenList}`;
      }
    };
  }

  constructor() {
    this.elements = Object.create(null);
  }

  _ensureElement(identifier, parentIdentifier = -1, childIdentifiers = [], level = 0) {
    if (!this.elements[identifier]) {
      this.elements[identifier] = new Hierarchy.Element(identifier, parentIdentifier, childIdentifiers, level);
    }
    return this.elements[identifier];
  }

  registerNode(identifier, childIdentifiers) {
    const currentElement = this._ensureElement(identifier, -1, childIdentifiers, 0);
    currentElement.childIdentifiers = childIdentifiers;

    if (childIdentifiers.length === 0) {
      return;
    }

    childIdentifiers.forEach((childId) => {
      const childElement = this._ensureElement(childId, identifier, [], currentElement.level);
      childElement.parentIdentifier = identifier;
      childElement.level = currentElement.level;
      this.adjustSubtreeLevels(childId);
    });
  }

  adjustSubtreeLevels(identifier) {
    const targetElement = this.elements[identifier];
    if (!targetElement) {
      return;
    }

    const isLeafNodeForDepthAdjustment = targetElement.childIdentifiers.length === 0;
    if (isLeafNodeForDepthAdjustment) {
      const depthIncrementValue = 1;
      targetElement.level += depthIncrementValue;
      return;
    }

    targetElement.childIdentifiers.forEach((descendantId) => this.adjustSubtreeLevels(descendantId));
  }

  displayStructure() {
    const allElements = Object.values(this.elements);
    const sortedElements = allElements.sort((a, b) => a.identifier - b.identifier);
    const stringRepresentations = sortedElements.map(element => element.toString());
    const finalOutput = stringRepresentations.join('\n');
    console.log(finalOutput);
  }
}

function readAndParseInput(filePath) {
  const fs = require('fs');
  const rawInput = fs.readFileSync(filePath, 'utf8');
  const inputLines = rawInput.trim().split('\n');
  const nodeCount = Number(inputLines.shift());
  return { nodeCount, remainingLines: inputLines };
}

(function executeTreeOperations() {
  const { nodeCount, remainingLines } = readAndParseInput('/dev/stdin');
  let structure = new Hierarchy();

  for (const lineData of remainingLines) {
    const parsedLine = lineData.split(' ');
    const identifier = Number(parsedLine.shift());
    const childCount = Number(parsedLine.shift());
    const childIdentifiers = parsedLine.map(Number);
    structure.registerNode(identifier, childIdentifiers);
  }

  structure.displayStructure();
})();
