class GraphStructure {
  // Static getter for the inner StructuralElement class, which defines individual components of the graph.
  static get StructuralElement() {
    // This nested class encapsulates the properties and behavior of a single node or element.
    return class {
      /**
       * Constructs a new StructuralElement instance.
       * @param {number} elementIdentifier - The unique numerical ID for this specific element.
       * @param {number} parentIdentifier - The ID of this element's direct parent; -1 indicates a root element.
       * @param {number[]} childIdentifiers - An array containing the IDs of all direct child elements.
       * @param {number} hierarchyLevel - The calculated level or depth of this element within the graph structure.
       */
      constructor(elementIdentifier, parentIdentifier, childIdentifiers, hierarchyLevel) {
        this.elementIdentifier = elementIdentifier;
        this.parentIdentifier = parentIdentifier;
        this.childIdentifiers = childIdentifiers;
        this.hierarchyLevel = hierarchyLevel;
      }

      // A getter property that determines and returns the classification of the element.
      get elementType() {
        // If the element has no parent, it is considered the root of a tree.
        if (this.parentIdentifier === -1) {
          return 'root';
        }
        // If the element has no children, it is a leaf node.
        if (this.childIdentifiers.length === 0) {
          return 'leaf';
        }
        // Otherwise, it is an internal node, having both a parent and children.
        return 'internal node';
      }

      // Provides a formatted string representation of the element's details.
      toString() {
        // The output format must precisely match the original implementation.
        return `node ${this.elementIdentifier}: parent = ${this.parentIdentifier}, depth = ${this.hierarchyLevel}, ${this.elementType}, [${this.childIdentifiers.join(', ')}]`;
      }
    };
  }

  // Constructor for the main GraphStructure class.
  constructor() {
    // Initializes an array to store all structural elements, using their IDs as indices.
    this.elementsCollection = [];
  }

  /**
   * Adds a new element to the graph or updates an existing one with its children.
   * @param {number} elementIdentifier - The unique ID of the element to be added or modified.
   * @param {number[]} childIdentifiers - An array of IDs representing the direct children of this element.
   */
  addElement(elementIdentifier, childIdentifiers) {
    // If the element doesn't exist, create a new StructuralElement.
    // Otherwise, retrieve the existing one. Initialize with default parent -1 and level 0.
    this.elementsCollection[elementIdentifier] = this.elementsCollection[elementIdentifier] || new GraphStructure.StructuralElement(elementIdentifier, -1, childIdentifiers, 0);

    // Obtain a reference to the element currently being processed.
    let currentElementRef = this.elementsCollection[elementIdentifier];
    // Update the list of child identifiers for this element.
    currentElementRef.childIdentifiers = childIdentifiers;

    // Declare a variable to hold references to child elements during iteration.
    let childElementRef;

    // Proceed only if the current element has children.
    if (childIdentifiers.length !== 0) {
      // Iterate through each child identifier provided.
      childIdentifiers.forEach((childIdValue) => {
        // If a child element doesn't exist, create it.
        // Set its parent to the current element's ID and its initial level to the current element's level.
        childElementRef = this.elementsCollection[childIdValue] || new GraphStructure.StructuralElement(childIdValue, elementIdentifier, [], currentElementRef.hierarchyLevel);

        // Explicitly set the parent identifier for the child.
        childElementRef.parentIdentifier = elementIdentifier;
        // Explicitly set the hierarchy level for the child.
        childElementRef.hierarchyLevel = currentElementRef.hierarchyLevel;
        // Store the child element in the main collection.
        this.elementsCollection[childIdValue] = childElementRef;

        // Recursively call propagateLevel to adjust the levels of the child and its descendants.
        this.propagateLevel(childIdValue);
      });
    }
  }

  /**
   * Recursively adjusts the hierarchy level of an element and its subsequent descendants.
   * This function implements a specific depth calculation logic where only leaf nodes
   * directly increment their level, while internal nodes trigger the same logic for their children.
   * @param {number} elementIdentifier - The ID of the element whose level needs to be propagated.
   */
  propagateLevel(elementIdentifier) {
    // If the element does not exist in the collection, terminate the operation.
    if (!this.elementsCollection[elementIdentifier]) {
      return;
    }

    // Check if the current element is a leaf node (has no children).
    if (this.elementsCollection[elementIdentifier].childIdentifiers.length === 0) {
      // If it's a leaf, increment its hierarchy level by one.
      this.elementsCollection[elementIdentifier].hierarchyLevel += 1;
      return; // Stop recursion for leaf nodes.
    }

    // If the element is an internal node, iterate through its children.
    // For each child, recursively call propagateLevel to continue the level adjustment process.
    this.elementsCollection[elementIdentifier].childIdentifiers.forEach((descendantIdValue) => this.propagateLevel(descendantIdValue));
  }

  // Outputs the string representation of all elements in the graph to the console.
  outputStructure() {
    // First, sort the elements collection based on their unique identifiers in ascending order.
    const sortedElements = this.elementsCollection.sort((firstElement, secondElement) => firstElement.elementIdentifier - secondElement.elementIdentifier);
    // Then, map each sorted element to its string representation.
    const elementStrings = sortedElements.map(element => element.toString());
    // Finally, join all the string representations with newline characters and print to console.
    console.log(elementStrings.join('\n'));
  }
}

// An Immediately Invoked Function Expression (IIFE) to encapsulate the main program execution flow.
(function mainExecutionBlock() {
  // Read the entire content of standard input, decode it as UTF-8,
  // remove leading/trailing whitespace, and split it into an array of lines.
  const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line typically contains the total number of nodes.
  // This value is parsed and stored, but not explicitly used in the subsequent logic of the original code.
  const totalNodesCount = Number(inputDataLines.shift());

  // Instantiate a new GraphStructure object to manage the elements.
  let graphInstance = new GraphStructure();

  // Declare variables to temporarily hold parsed data from each input line.
  let elementIdentifier, numChildrenCount, childIdentifiers;

  // Process each remaining line from the input data.
  inputDataLines.map(singleInputLine => singleInputLine.split(' ')).forEach(function(processedLineTokens) {
    // Extract the element's unique identifier from the first token of the line.
    elementIdentifier = Number(processedLineTokens.shift());
    // Extract the count of children from the second token. This value is also not directly used.
    numChildrenCount = Number(processedLineTokens.shift());
    // Convert the rest of the tokens on the line into an array of child identifiers.
    childIdentifiers = processedLineTokens.map(Number);

    // Add or update the element in the graph structure with its associated children.
    graphInstance.addElement(elementIdentifier, childIdentifiers);
  });

  // After processing all input lines and building the graph, output its structured representation.
  graphInstance.outputStructure();
})();
