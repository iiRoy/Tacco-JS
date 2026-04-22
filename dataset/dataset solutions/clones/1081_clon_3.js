const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process raw input data from standard input.
// Filters out any empty lines that might result from trimming.
const processedLines = rawData.trim().split('\n').filter(Boolean);

// Validate if input lines are sufficient.
if (processedLines.length === 0) {
  console.error("Error: No input data provided.");
  process.exit(1);
}

// The first line indicates the number of entities.
// Although not strictly used for iteration in the final output, it's a hint.
const nodeCountHint = parseInt(processedLines.shift(), 10);

// Parse the remaining lines into an adjacency list representation.
// Each entry: [parent_id, num_children, child1_id, child2_id, ...]
const adjacencyListRepresentation = processedLines.map((lineSegment) =>
  lineSegment.split(' ').map(Number)
);

/**
 * Represents a single entity within the hierarchical structure.
 * Each entity has an identifier, potential parent, and a list of descendants.
 */
class HierarchyEntity {
  /**
   * Initializes a new HierarchyEntity.
   * @param {number} identifierKey - The unique ID for this entity.
   */
  constructor(identifierKey) {
    this.identifierKey = identifierKey;
    this.descendantEntities = []; // Stores references to child entities.
    this.antecedentEntity = null; // Reference to the parent entity.
    this.levelIndicator = -1; // Depth in the hierarchy, -1 indicates uncalculated.
    // Additional internal state for potential future use or debugging.
    this._isVisitedForDepthCalculation = false;
  }

  /**
   * Attaches a given entity as a child to this entity.
   * Also sets this entity as the parent of the attached child.
   * @param {HierarchyEntity} childEntity - The entity to attach as a child.
   * @returns {boolean} True if child was added, false if already exists or invalid.
   */
  attachChild(childEntity) {
    // Basic validation: ensure childEntity is an object and not null.
    if (!childEntity || typeof childEntity !== 'object' || !(childEntity instanceof HierarchyEntity)) {
      console.warn(`Attempted to attach an invalid child to entity ${this.identifierKey}.`);
      return false;
    }

    // Prevent duplicate children.
    const isAlreadyChild = this.descendantEntities.some(d => d.identifierKey === childEntity.identifierKey);
    if (isAlreadyChild) {
      // console.log(`Child ${childEntity.identifierKey} is already a descendant of ${this.identifierKey}.`);
      return false;
    }

    childEntity.antecedentEntity = this; // Establish parent link.
    this.descendantEntities.push(childEntity); // Add to descendants list.
    return true;
  }

  /**
   * Checks if this entity has an antecedent (parent) entity.
   * @returns {boolean} True if a parent exists, false otherwise.
   */
  isAttachedToParent() {
    return this.antecedentEntity !== null && typeof this.antecedentEntity !== 'undefined';
  }

  /**
   * Checks if this entity has any descendant (child) entities.
   * @returns {boolean} True if it has children, false otherwise.
   */
  hasDescendants() {
    return this.descendantEntities.length > 0;
  }

  /**
   * Determines the type of this entity within the hierarchy.
   * @returns {string} One of 'Root Node', 'Internal Node', or 'Leaf Node'.
   */
  determineEntityType() {
    if (!this.isAttachedToParent()) {
      return 'Root Node';
    } else if (this.hasDescendants()) {
      return 'Internal Node';
    } else {
      return 'Leaf Node';
    }
  }

  /**
   * Recursively computes the hierarchy level (depth) for this entity
   * and all its descendants.
   * @param {number} currentLevel - The current depth level of this entity.
   */
  computeHierarchyLevel(currentLevel) {
    // Guard clause: if already visited or level is invalid, return.
    if (this._isVisitedForDepthCalculation && this.levelIndicator !== -1 && this.levelIndicator === currentLevel) {
        return;
    }

    this.levelIndicator = currentLevel;
    this._isVisitedForDepthCalculation = true; // Mark as visited to prevent re-calculation in cycles (though not expected here).

    // Iterate through descendants to compute their levels.
    for (const descendant of this.descendantEntities) {
      descendant.computeHierarchyLevel(currentLevel + 1);
    }
  }

  /**
   * Generates a formatted string representation of this entity's details.
   * @returns {string} A string containing the entity's ID, parent, depth, type, and children.
   */
  formatEntityDetails() {
    const parentIdDisplay = this.isAttachedToParent() ? this.antecedentEntity.identifierKey : -1;
    const currentDepthDisplay = this.levelIndicator !== -1 ? this.levelIndicator : 'UNKNOWN';
    const entityClassification = this.determineEntityType();
    const descendantIds = this.descendantEntities.map(child => child.identifierKey).join(', ');

    // Use template literals for cleaner string construction.
    const details = [
      `parent = ${parentIdDisplay}`,
      `depth = ${currentDepthDisplay}`,
      entityClassification,
      `[${descendantIds}]`,
    ];

    return `entity ${this.identifierKey}: ${details.join(', ')}`;
  }
}

/**
 * Manages a collection of HierarchyEntities to form a tree structure.
 */
class HierarchicalStructure {
  /**
   * Initializes a new HierarchicalStructure.
   */
  constructor() {
    // Uses a Map to store entities, mapping their identifier keys to HierarchyEntity objects.
    this.entityRegistry = new Map();
    this._rootEntity = null; // Cache the root entity once found.
  }

  /**
   * Retrieves an entity by its identifier key, creating it if it doesn't exist.
   * @param {number} key - The identifier key of the entity.
   * @returns {HierarchyEntity} The retrieved or newly created entity.
   */
  retrieveOrCreateEntity(key) {
    // Input validation for the key.
    if (typeof key !== 'number' || !Number.isInteger(key) || key < 0) {
      console.error(`Invalid entity identifier key provided: ${key}`);
      // Depending on requirements, might throw an error or return null.
      // For this problem, we assume valid non-negative integer IDs.
      return null;
    }

    if (!this.entityRegistry.has(key)) {
      const newEntity = new HierarchyEntity(key);
      this.entityRegistry.set(key, newEntity);
      // console.log(`Created new entity with ID: ${key}`);
    }
    return this.entityRegistry.get(key);
  }

  /**
   * Finds and returns the root entity of the hierarchy.
   * Assumes a single root entity exists (i.e., one entity with no parent).
   * @returns {HierarchyEntity|null} The root entity, or null if not found or multiple roots.
   */
  findOriginEntity() {
    // If root is already cached, return it.
    if (this._rootEntity) {
      return this._rootEntity;
    }

    // Handle empty registry case.
    if (this.entityRegistry.size === 0) {
      console.warn("Cannot find root: Entity registry is empty.");
      return null;
    }

    let potentialRoots = [];
    // Iterate through all registered entities to find those without a parent.
    for (const entity of this.entityRegistry.values()) {
      if (!entity.isAttachedToParent()) {
        potentialRoots.push(entity);
      }
    }

    // Validate the number of root entities.
    if (potentialRoots.length === 1) {
      this._rootEntity = potentialRoots[0]; // Cache the found root.
      return this._rootEntity;
    } else if (potentialRoots.length > 1) {
      console.error("Error: Multiple root entities found in the hierarchy. Expected a single root.");
      // For this problem, we'll arbitrarily pick the first one, but this indicates an input issue.
      this._rootEntity = potentialRoots[0];
      return this._rootEntity;
    } else {
      console.error("Error: No root entity found in the hierarchy. All entities have parents (likely a cycle or disconnected components).");
      return null;
    }
  }

  /**
   * Initiates the calculation of hierarchy levels (depths) for all entities
   * starting from the root.
   */
  calculateAllLevels() {
    const originEntity = this.findOriginEntity();
    if (originEntity) {
      // Start the recursive depth calculation from the root at level 0.
      originEntity.computeHierarchyLevel(0);
    } else {
      console.warn("Depth calculation skipped: No valid root entity was found.");
    }
  }

  /**
   * Displays a report of all entities in the hierarchy, sorted by their identifier keys.
   */
  displayHierarchyReport() {
    if (this.entityRegistry.size === 0) {
      console.log("No entities to report in the hierarchy.");
      return;
    }

    // Retrieve all entities, convert to an array, and sort by ID for consistent output.
    const sortedEntities = Array.from(this.entityRegistry.values()).sort(
      (a, b) => a.identifierKey - b.identifierKey
    );

    // Iterate and print formatted details for each entity.
    for (const entity of sortedEntities) {
      console.log(entity.formatEntityDetails());
    }
  }
}

// Main execution block:

// Create an instance of the hierarchical structure manager.
const entityHierarchy = new HierarchicalStructure();

// Populate the hierarchical structure based on the parsed adjacency list.
adjacencyListRepresentation.forEach((entrySegment) => {
  const [parentNodeId, numChildEntries, ...childNodeIds] = entrySegment;

  // Retrieve or create the parent entity.
  const currentParentEntity = entityHierarchy.retrieveOrCreateEntity(parentNodeId);

  // Guard against invalid parent entity.
  if (!currentParentEntity) {
    console.error(`Skipping children for invalid parent ID: ${parentNodeId}`);
    return;
  }

  // Iterate through child IDs and attach them to the parent.
  for (const childId of childNodeIds) {
    const childEntity = entityHierarchy.retrieveOrCreateEntity(childId);
    if (childEntity) {
      currentParentEntity.attachChild(childEntity);
    } else {
      console.warn(`Could not retrieve or create child entity with ID: ${childId} for parent ${parentNodeId}.`);
    }
  }

  // Optional: Validate if numChildEntries matches actual childNodeIds length.
  if (numChildEntries !== childNodeIds.length) {
    console.warn(`Mismatch in declared children (${numChildEntries}) vs. actual children (${childNodeIds.length}) for parent ${parentNodeId}.`);
  }
});

// Once the structure is built, calculate all hierarchy levels.
entityHierarchy.calculateAllLevels();

// Finally, display the comprehensive report of the hierarchy.
entityHierarchy.displayHierarchyReport();