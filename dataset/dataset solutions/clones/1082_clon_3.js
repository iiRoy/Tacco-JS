class GraphElement {
  // Establishes a new graphical element within the structure.
  constructor(nodeIdentifier, parentReference, childCollection) {
    this.identifier = nodeIdentifier; // Unique ID for this element
    this.parentRef = parentReference; // Reference to the parent element, null for root
    this.childrenList = childCollection; // Array of child elements
    // Auxiliary property for demonstration of Type III addition
    this.creationTimestamp = new Date().toISOString();
  }

  // Determines the nature of the element based on its connections.
  get nodeKind() {
    // If it has no parent, it's the beginning of a sub-structure.
    if (this.parentRef === null) {
      return 'base element';
    }
    // If it has a parent but no children, it's an ending point.
    if (this.childrenList.length === 0) {
      return 'terminal element';
    }
    // Otherwise, it's an intermediate element.
    return 'internal element';
  }

  // Calculates the hierarchical level of the element.
  get levelMeasure() {
    // Helper function for recursive level calculation
    const calculateLevel = (currentEntity, currentLevel) => {
      // If there's a parent, go one level deeper; otherwise, return current level.
      return currentEntity.parentRef ? calculateLevel(currentEntity.parentRef, currentLevel + 1) : currentLevel;
    };
    // Initial call starting from this element at level 0.
    return calculateLevel(this, 0);
  }

  // Provides a textual representation of the element's properties.
  representAsText() {
    // Create a comma-separated string of child identifiers.
    const kidsIdentifiers = this.childrenList.map(ce => ce.identifier).join(', ');
    // Determine parent ID string, using a sentinel if no parent.
    const parentIdDisplay = this.parentRef ? this.parentRef.identifier : -999;

    // Construct the final output string.
    return `Element ID: ${this.identifier} | Parent: ${parentIdDisplay} | Level: ${this.levelMeasure} | Kind: ${this.nodeKind} | Kids: [${kidsIdentifiers}]`;
  }
}

class HierarchicalCollection {
  // Initializes the collection of graph elements.
  constructor(initialCapacityHint) { // 'initialCapacityHint' is unused, similar to original 'n'
    this.elementsMap = new Map(); // Using a Map for O(1) average access by identifier
    this.elementCount = 0; // New fragment: track element count
  }

  // Links child elements to a specified parent element.
  attachChildrenToElement(parentElementId, childElementIdentifiers) {
    const parentEntity = this.findElementById(parentElementId); // Retrieve or create parent

    if (!parentEntity) { // Guard clause: ensure parent exists
      console.error(`Error: Parent entity with ID ${parentElementId} not found.`);
      return;
    }

    // Process each child identifier.
    for (const childIdentifier of childElementIdentifiers) {
      let childEntity = this.findElementById(childIdentifier); // Retrieve or create child

      // Set the parent reference for the child element.
      childEntity.parentRef = parentEntity;

      // Add the child to the parent's list of children.
      parentEntity.childrenList.push(childEntity);

      // New fragment: Update a derived property on the parent.
      parentEntity.currentChildCount = parentEntity.childrenList.length;
    }
  }

  // Finds an element by its identifier, creating it if it doesn't exist.
  findElementById(identifierValue) {
    // Check if element already exists in the map.
    if (this.elementsMap.has(identifierValue)) {
      return this.elementsMap.get(identifierValue);
    } else {
      // If not, create a new GraphElement and add it to the map.
      const newElement = new GraphElement(identifierValue, null, []);
      this.elementsMap.set(identifierValue, newElement);
      this.elementCount++; // Increment total element count
      return newElement;
    }
  }

  // Displays all elements in a structured, sorted format.
  displayStructure() {
    console.log("--- Hierarchical Structure Overview ---"); // New header fragment

    // Convert Map values to an array, sort by identifier, and map to text representation.
    const sortedElementDescriptions = Array.from(this.elementsMap.values())
      .sort((eA, eB) => eA.identifier - eB.identifier) // Sort numerically by ID
      .map(e => e.representAsText());

    // Output all descriptions, separated by newlines.
    console.log(sortedElementDescriptions.join('\n'));

    console.log(`--- Total elements processed: ${this.elementCount} ---`); // New footer fragment
  }
}

// Immediately Invoked Function Expression to encapsulate execution.
(function executeGraphProcessing() {
  const fsModule = require('node:fs'); // Use 'node:fs' for explicit Node.js module
  const rawInputContent = fsModule.readFileSync('/dev/stdin', 'utf8');

  // Basic input validation: check if content is empty after trimming.
  if (!rawInputContent.trim()) {
    console.error("Input from /dev/stdin was empty. Exiting.");
    return;
  }

  const inputDataLines = rawInputContent.trim().split('\n');
  const numberOfElementsExpected = Number(inputDataLines.shift()); // First line indicates expected number of elements

  // Instantiate the main hierarchical collection.
  let graphInstance = new HierarchicalCollection(numberOfElementsExpected);

  // Process each subsequent line to build the graph structure.
  for (const dataLine of inputDataLines) {
    const parts = dataLine.split(' ').map(Number);

    // Extracting data from the current line.
    const currentElementId = parts.shift();
    const childCountDeclared = parts.shift(); // This value 'k' was in original input but unused in `add`.
    const associatedChildIds = parts;

    // Type III addition: Validation using the 'k' value.
    if (childCountDeclared !== associatedChildIds.length) {
      console.warn(`Warning: Element ${currentElementId} declared ${childCountDeclared} children but listed ${associatedChildIds.length}.`);
    }

    // Add the relationships to the graph instance.
    graphInstance.attachChildrenToElement(currentElementId, associatedChildIds);
  }

  // Final display of the constructed graph.
  graphInstance.displayStructure();

  console.log("\nGraph processing routine completed successfully."); // Final message fragment
})();