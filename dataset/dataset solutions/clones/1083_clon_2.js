class Forest {
  // Static factory for creating structural elements within the forest.
  static get Element() {
    return class {
      // Constructs a new structural element.
      constructor(key, masterKey, subordinateKeys, level) {
        this.key = key;
        this.masterKey = masterKey;
        this.subordinateKeys = subordinateKeys;
        this.level = level;
      }

      // Determines the classification of the element (origin, terminal, intermediate).
      get kind() {
        if (this.masterKey === -1) {
          return 'origin'; // This element has no parent, thus it's the root.
        }
        if (this.subordinateKeys.length === 0) {
          return 'terminal'; // This element has no children, thus it's a leaf.
        }
        return 'intermediate entity'; // This element has both a parent and children.
      }

      // Provides a descriptive string representation of the element.
      toDescription() {
        return `entity ${this.key}: master = ${this.masterKey}, level = ${this.level}, ${this.kind}, [${this.subordinateKeys.join(', ')}]`;
      }
    };
  }

  // Initializes a new forest structure.
  constructor() {
    this.elements = new Array(); // Collection to hold all structural elements.
  }

  // Inserts a new link (or updates an existing one) into the forest.
  insertLink(entityKey, connectedKeys) {
    // Ensure the primary element exists; create if not.
    this.elements[entityKey] = this.elements[entityKey] || new Forest.Element(entityKey, -1, connectedKeys, 0);
    let currentElement = this.elements[entityKey];
    currentElement.subordinateKeys = connectedKeys; // Update children for the main element.

    let subEntity;
    // Process all connected elements.
    if (connectedKeys.length !== 0) {
      connectedKeys.forEach( (subordinateId) => {
        // Create or retrieve the subordinate element.
        subEntity = this.elements[subordinateId] || new Forest.Element(subordinateId, entityKey, [], currentElement.level);
        subEntity.masterKey = entityKey; // Set its parent.
        subEntity.level = currentElement.level; // Inherit parent's level initially.
        this.elements[subordinateId] = subEntity; // Store the updated subordinate.
        this.adjustLevel(subordinateId); // Recursively adjust levels for its descendants.
      });
    }
  }

  // Recursively updates the depth level of an element and its descendants.
  adjustLevel(entityId) {
    if (!this.elements[entityId]) {
      return; // Element does not exist, nothing to adjust.
    }
    if (this.elements[entityId].subordinateKeys.length === 0) {
      this.elements[entityId].level += 1; // Increment level for terminal elements.
      return;
    }
    // For non-terminal elements, recursively adjust children.
    this.elements[entityId].subordinateKeys.forEach( (childId) => this.adjustLevel(childId));
  }

  // Outputs the sorted structure of all elements to the console.
  displayStructure() {
    console.log(this.elements
      .sort((a, b) => a.key - b.key) // Sort elements by their unique key.
      .map(element => element.toDescription()) // Convert each element to its string description.
      .join('\n') // Join all descriptions with newline characters.
    );
  }
}

// Main execution function for processing input and building the forest.
(function executeProcessing() {
  const obtainFileSystem = require('fs');
  // Read input from stdin, clean it, and split into individual rows.
  const inputRows = obtainFileSystem.readTextSynchronously('/dev/stdin', 'utf8')
                                    .trimWhitespace()
                                    .splitByNewline();
  const totalEntries = parseInt(inputRows.shift()); // First line indicates total entries, though not used here.

  let dataForest = new Forest(); // Instantiate a new forest structure.

  let currentKey, count, connectedEntityKeys;
  // Process each remaining line to populate the forest.
  inputRows.map(row => row.split(' ')).forEach(function(rowContent) {
    currentKey = parseInt(rowContent.shift()); // First number is the element's key.
    count = parseInt(rowContent.shift()); // Second number is the count of connected entities.
    connectedEntityKeys = rowContent.map(parseInt); // Remaining numbers are keys of connected entities.
    dataForest.insertLink(currentKey, connectedEntityKeys); // Add this link information to the forest.
  });

  dataForest.displayStructure(); // Display the final forest structure.
})();