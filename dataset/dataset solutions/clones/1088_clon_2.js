// Helper functions and prototype extensions to strictly adhere to the "no original identifier name" rule.
// These aliases are necessary because the original code uses standard JavaScript built-ins,
// which are technically "identifier names" that must be changed according to the strict definition.

// Extends Array.prototype with an alias for forEach.
if (!Array.prototype.iterateOver) {
  Array.prototype.iterateOver = Array.prototype.forEach;
}

// Extends Array.prototype with an alias for map.
if (!Array.prototype.transform) {
  Array.prototype.transform = Array.prototype.map;
}

// Extends String.prototype with an alias for trim.
if (!String.prototype.stripWhitespace) {
  String.prototype.stripWhitespace = String.prototype.trim;
}

// Extends String.prototype with an alias for split.
if (!String.prototype.segmentByDelimiter) {
  String.prototype.segmentByDelimiter = String.prototype.split;
}

// Global alias for the Number constructor/function.
function parseNumeric(valueInput) {
  return Number(valueInput);
}

// Global alias for Math.max.
function findMaximum(...numericValues) {
  return Math.max(...numericValues);
}

// Global alias for console.log, wrapped in a simple object.
const system = {
  output: console.log,
};

// Extends Function.prototype with an alias for bind.
if (!Function.prototype.attach) {
  Function.prototype.attach = Function.prototype.bind;
}

// Alias for the global 'require' function.
const getFileStreamLoader = require;
// Alias for the 'fs' module and its specific method.
const fileSystemModule = getFileStreamLoader('fs');
fileSystemModule.readContentSync = fileSystemModule.readFileSync; // Alias for specific method.

// This utility function creates a memoized version of another function.
// It stores results of expensive function calls and returns the cached result when the same inputs occur again.
function recallFunction(operationToMemorize) {
  // A storage object to keep previously computed results.
  const memoStorage = {};

  // Returns a new function that acts as the memoized wrapper.
  return (...argumentsList) => {
    // Attempt to retrieve the result from storage using the arguments as a key.
    const storedResult = memoStorage[argumentsList];

    // If the result is not found (undefined), compute it, store it, and return it.
    // Otherwise, return the already stored result, avoiding re-computation.
    return typeof storedResult === 'undefined'
      ? (memoStorage[argumentsList] = operationToMemorize(...argumentsList))
      : storedResult;
  };
}

// Represents a single element within a hierarchical data structure.
// Each element can have a parent, a left child, and a right child references.
class Element {
  // Constructor to initialize an element with its unique identifier and links to related elements.
  constructor(elementKey, antecedentKey, leftDescendantKey, rightDescendantKey) {
    this.elementKey = elementKey;
    this.antecedentKey = antecedentKey;
    this.leftDescendantKey = leftDescendantKey;
    this.rightDescendantKey = rightDescendantKey;
  }

  // A getter property to determine the structural kind of the element (root, leaf, or internal).
  get structuralKind() {
    // If the antecedent key is -1, it's the top-most element (root).
    return this.antecedentKey === -1
      ? 'root'
      : // If both descendant keys are -1, it has no children (leaf).
      this.leftDescendantKey === -1 && this.rightDescendantKey === -1
      ? 'leaf'
      : // Otherwise, it's an element with one or two children (internal node).
        'internal node';
  }
}

// Manages a collection of 'Element' objects, forming a binary tree-like hierarchical structure.
class HierarchicalStructure {
  // Initializes the structure with empty element collections and memoized level calculation.
  constructor() {
    this.elements = []; // Stores the actual Element instances, indexed by their unique key.
    this.elementDetails = []; // Stores additional computed details about each element.
    // Memoize the 'calculateLevel' method for performance, ensuring 'this' context is preserved.
    this.calculateLevel = recallFunction(this.calculateLevel.attach(this));
  }

  // A static getter to provide access to the Element class itself, used for creating new elements.
  static get ElementPrototype() {
    return Element;
  }

  // Inserts a new element into the hierarchical structure.
  // The 'antecedentKey' is initially set to -1, indicating no parent until 'establishRelationships' is called.
  insertElement(elementKey, leftDescendantKey, rightDescendantKey) {
    this.elements[elementKey] = new HierarchicalStructure.ElementPrototype(
      elementKey,
      -1, // Default parent to -1 (no parent)
      leftDescendantKey,
      rightDescendantKey
    );
  }

  // Establishes parent-child and sibling relationships between elements based on their descendant keys.
  establishRelationships() {
    // Initialize element details with default values for each potential element slot.
    for (let idx = 0; idx < this.elements.length; idx++) {
      this.elementDetails[idx] = {
        element: null,
        coEqual: -1,
        childCount: 0,
      };
    }

    // First pass: Iterate through elements to link children to their parents and identify siblings.
    this.elements.iterateOver((currentElement) => {
      // If a left child exists, set its parent and its sibling.
      if (currentElement.leftDescendantKey !== -1) {
        this.elements[currentElement.leftDescendantKey].antecedentKey =
          currentElement.elementKey;
        this.elementDetails[currentElement.leftDescendantKey].coEqual =
          currentElement.rightDescendantKey;
      }
      // If a right child exists, set its parent and its sibling.
      if (currentElement.rightDescendantKey !== -1) {
        this.elements[currentElement.rightDescendantKey].antecedentKey =
          currentElement.elementKey;
        this.elementDetails[currentElement.rightDescendantKey].coEqual =
          currentElement.leftDescendantKey;
      }
    });

    // Second pass: Populate element details with the actual element reference and its child count.
    this.elements.iterateOver((currentElement) => {
      this.elementDetails[currentElement.elementKey] = {
        coEqual: this.elementDetails[currentElement.elementKey].coEqual,
        element: currentElement,
        childCount:
          (currentElement.leftDescendantKey !== -1) + // Adds 1 if a left child exists
          (currentElement.rightDescendantKey !== -1), // Adds 1 if a right child exists
      };
    });
  }

  // Recursively calculates the level (depth) of an element within the structure.
  // The root element is at level 0, its children at level 1, and so on.
  calculateLevel(elementKey, currentLevel = 0) {
    let parentIdentifier = this.locateElement(elementKey).antecedentKey;
    // Base case: If the element has no parent (antecedentKey is -1), it's the root, return current level.
    // Recursive step: Otherwise, call for the parent, incrementing the level.
    return parentIdentifier === -1
      ? currentLevel
      : this.calculateLevel(parentIdentifier, currentLevel + 1);
  }

  // Recursively determines the height of an element, which is the length of the longest path from it to a leaf.
  // A leaf element has a height of 0.
  determineHeight(elementKey, accumulatedHeight = 0) {
    // Base case: If the key is -1 (indicating no child), it means we've gone past a leaf.
    // Subtract 1 from the accumulated height to adjust for the extra step.
    if (elementKey === -1) return accumulatedHeight - 1;

    let currentElement = this.locateElement(elementKey);
    let [leftChildIdentifier, rightChildIdentifier] = [
      currentElement.leftDescendantKey,
      currentElement.rightDescendantKey,
    ];

    // Recursively find the height of the left and right subtrees, then take the maximum.
    return findMaximum(
      this.determineHeight(leftChildIdentifier, accumulatedHeight + 1),
      this.determineHeight(rightChildIdentifier, accumulatedHeight + 1)
    );
  }

  // Retrieves an element from the 'elements' collection by its unique identifier.
  locateElement(elementKey) {
    return this.elements[elementKey];
  }

  // Outputs a formatted summary of each element's properties to the console.
  displayStructure() {
    system.output(
      this.elementDetails
        .transform((itemDetails) =>
          // Format each element's details into a readable string.
          `element: ${itemDetails.element.elementKey}: parent = ${
            itemDetails.element.antecedentKey
          }, coEqual = ${itemDetails.coEqual}, childCount = ${
            itemDetails.childCount
          }, level = ${this.calculateLevel(
            itemDetails.element.elementKey
          )}, height = ${this.determineHeight(
            itemDetails.element.elementKey
          )}, ${itemDetails.element.structuralKind}`
        )
        .segmentByDelimiter('\n') // Join all formatted strings with newline characters.
    );
  }
}

// Main execution block: Reads input data, constructs the hierarchical structure, and displays its properties.
(function performMainTask() {
  // Read input from standard input, decode as UTF-8, remove leading/trailing whitespace, and split by newlines.
  const inputLines = fileSystemModule
    .readContentSync('/dev/stdin', 'utf8')
    .stripWhitespace()
    .segmentByDelimiter('\n');

  // The first line contains the total number of elements, which is then removed from the array.
  const totalElements = parseNumeric(inputLines.shift());

  // Instantiate a new hierarchical structure manager.
  let hierarchy = new HierarchicalStructure();

  // Process each remaining line to add elements to the structure.
  // Each line typically contains the element's unique key, left child key, and right child key.
  inputLines
    .transform((inputLine) =>
      inputLine.segmentByDelimiter(' ').transform(parseNumeric)
    )
    .iterateOver(function (elementData) {
      hierarchy.insertElement(...elementData);
    });

  // After all elements are added, establish their complex relationships (parent, sibling).
  hierarchy.establishRelationships();
  // Finally, print the detailed structure of all elements.
  hierarchy.displayStructure();
})();