/**
 * Helper function for robust array comparison.
 * @param {Array<any>} arrA - The first array to compare.
 * @param {Array<any>} arrB - The second array to compare.
 * @returns {boolean} True if arrays are equal in content and order, false otherwise.
 */
function checkArraysForEquality(arrA, arrB) {
    // Type III: Added a new helper function for array comparison
    if (!Array.isArray(arrA) || !Array.isArray(arrB)) {
        return false;
    }
    if (arrA.length !== arrB.length) {
        return false;
    }
    for (let idx = 0; idx < arrA.length; idx++) {
        if (arrA[idx] !== arrB[idx]) {
            return false;
        }
    }
    return true;
}

/**
 * Represents a single component (node) within the hierarchical structure.
 * This class captures fundamental properties like unique identification,
 * parentage, child relationships, and its level (depth) in the hierarchy.
 * It's designed to be used as a static inner class of HierarchyManager.
 */
class GraphComponent { // Renamed from 'Node'
    /**
     * Constructs a new GraphComponent instance.
     * @param {number} identifier - A unique numeric ID for this component.
     * @param {number | null} parentIdentifier - The ID of the parent component, use null for root.
     * @param {number[]} childIdentifierList - An array of IDs of direct successor components.
     * @param {number} initialLevel - The initial depth level of this component, 0 for root.
     */
    constructor(identifier, parentIdentifier, childIdentifierList, initialLevel) {
        // Type III: Added input validation for robustness
        if (typeof identifier !== 'number' || !Number.isInteger(identifier) || identifier < 0) {
            throw new Error(`[GraphComponent] Invalid 'identifier' provided: ${identifier}. Must be a non-negative integer.`);
        }
        if (!Array.isArray(childIdentifierList)) {
            console.warn(`[GraphComponent] Child identifier list for element ${identifier} is not an array. Initializing as empty.`);
            childIdentifierList = [];
        }

        this.uniqueId = identifier; // Renamed from 'id'
        // Type III: Using null instead of -1 to explicitly represent no parent (root)
        this.antecedentId = parentIdentifier === -1 ? null : parentIdentifier; // Renamed from 'parentId'
        this.successorIds = [...childIdentifierList]; // Renamed from 'childrenIds', using defensive copy
        this.levelValue = initialLevel; // Renamed from 'depth'
    }

    /**
     * Dynamically determines the category label (type) of this graph component.
     * @returns {string} One of 'Root Element', 'Terminal Node', or 'Intermediate Element'.
     */
    get categoryLabel() { // Renamed from 'type'
        // Type III: Rewrote conditional logic and changed descriptive strings
        if (this.antecedentId === null) {
            return 'Root Element';
        }
        if (this.successorIds.length === 0) {
            return 'Terminal Node';
        }
        return 'Intermediate Element';
    }

    /**
     * Generates a descriptive string representation of the graph component.
     * @returns {string} A formatted string detailing the component's properties.
     */
    displayInfo() { // Renamed from 'toString'
        // Type III: Rewrote string interpolation, reordered information, added more detail
        const parentInfo = this.antecedentId !== null ? `Parent: ${this.antecedentId}` : 'Parent: N/A (Root)';
        const successorsInfo = this.successorIds.length > 0
            ? `Successors: [${this.successorIds.map(sid => `#${sid}`).join(', ')}]`
            : 'Successors: (none)';

        return `Element #${this.uniqueId} | ${parentInfo} | Level: ${this.levelValue} | Type: ${this.categoryLabel} | ${successorsInfo}`;
    }
}

/**
 * Manages a collection of GraphComponents, forming a hierarchical structure (tree/graph).
 * Provides methods for adding components, updating relationships, and displaying the structure.
 */
class HierarchyManager { // Renamed from 'Tree'
    /**
     * Provides access to the prototype for creating new graph components.
     * @returns {typeof GraphComponent} The GraphComponent class constructor.
     */
    static get ElementPrototype() { // Renamed from 'static get Node()'
        return GraphComponent;
    }

    /**
     * Initializes a new HierarchyManager instance.
     */
    constructor() {
        // Type III: Changed data type from array to Map for more efficient key-value access and clarity
        this.elementRegistry = new Map(); // Renamed from 'nodes', stores GraphComponent instances by uniqueId
        this.rootElements = new Set(); // Type III: Added a new data structure to explicitly track root elements
    }

    /**
     * Integrates a new element or updates an existing one within the hierarchy.
     * This method handles setting up parent-child relationships and initial depth levels,
     * and triggers propagation of level updates if necessary.
     * @param {number} elementIdentifier - The unique ID of the element to integrate.
     * @param {number[]} childIdentifierList - An array of IDs of its direct children.
     */
    integrateElement(elementIdentifier, childIdentifierList) { // Renamed from 'add'
        // Type III: Added a guard clause for invalid element identifiers
        if (typeof elementIdentifier !== 'number' || !Number.isInteger(elementIdentifier) || elementIdentifier < 0) {
            console.warn(`[HierarchyManager] Skipping integration for invalid element identifier: ${elementIdentifier}`);
            return;
        }

        // Retrieve or create the main element
        let mainElement = this.elementRegistry.get(elementIdentifier);
        if (!mainElement) {
            // Type III: Initial creation. Assume root (parent null, level 0)
            mainElement = new HierarchyManager.ElementPrototype(elementIdentifier, null, childIdentifierList, 0);
            this.elementRegistry.set(elementIdentifier, mainElement);
            this.rootElements.add(elementIdentifier);
        } else {
            // Type III: Only update successorIds if they have actually changed, to minimize mutations
            if (!checkArraysForEquality(mainElement.successorIds, childIdentifierList)) {
                mainElement.successorIds = [...childIdentifierList]; // Defensive copy
            }
            // If an element was previously considered a root but now has a parent, remove from root set
            if (mainElement.antecedentId !== null && this.rootElements.has(elementIdentifier)) {
                this.rootElements.delete(elementIdentifier);
            }
        }

        // Process children if any are provided
        if (childIdentifierList && childIdentifierList.length > 0) {
            // Type III: Switched from forEach to for...of loop for iteration
            for (const currentChildId of childIdentifierList) {
                let childComponent = this.elementRegistry.get(currentChildId);
                if (!childComponent) {
                    // Create child component with correct parent and calculated initial level
                    childComponent = new HierarchyManager.ElementPrototype(currentChildId, elementIdentifier, [], mainElement.levelValue + 1);
                    this.elementRegistry.set(currentChildId, childComponent);
                } else {
                    // Update existing child's parent and level
                    childComponent.antecedentId = elementIdentifier;
                    const expectedChildLevel = mainElement.levelValue + 1;
                    // Type III: Explicitly set child's level and propagate updates if level changes
                    if (childComponent.levelValue !== expectedChildLevel) {
                        childComponent.levelValue = expectedChildLevel;
                        this.propagateLevelUpdate(currentChildId); // Recursively update all descendants
                    }
                }
                // If a child has a parent, it's not a root
                if (this.rootElements.has(currentChildId)) {
                    this.rootElements.delete(currentChildId);
                }
            }
        }
        // Type III: If the main element now has no children, ensure its successorIds are empty
        else if (mainElement.successorIds.length > 0) {
             mainElement.successorIds = [];
        }
    }

    /**
     * Recursively propagates level (depth) updates down from a starting element.
     * This method ensures that all descendants have their levels correctly set
     * relative to their parents, fixing a potential bug in the original logic.
     * @param {number} startingElementId - The ID of the element from which to start propagation.
     */
    propagateLevelUpdate(startingElementId) { // Renamed from 'incrementDepth'
        // Type III: Added a guard clause for non-existent elements
        if (!this.elementRegistry.has(startingElementId)) {
            return;
        }

        const currentElement = this.elementRegistry.get(startingElementId);
        const expectedChildLevel = currentElement.levelValue + 1;

        // Type III: Switched from forEach to for...of loop
        for (const childId of currentElement.successorIds) {
            const childComponent = this.elementRegistry.get(childId);
            if (childComponent) {
                // Only update and recurse if the child's level is incorrect
                if (childComponent.levelValue !== expectedChildLevel) {
                    childComponent.levelValue = expectedChildLevel;
                    this.propagateLevelUpdate(childId); // Recursive call to update descendants
                }
            } else {
                // Type III: Added a warning for orphaned successor IDs
                console.warn(`[HierarchyManager] Successor ID ${childId} of element ${startingElementId} not found in registry.`);
            }
        }
    }

    /**
     * Outputs a formatted report of all elements in the hierarchy to the console.
     * Elements are sorted by their unique ID for consistent display.
     */
    outputStructureDetails() { // Renamed from 'print'
        console.info('--- Hierarchy Structure Report ---'); // Type III: Added header
        // Type III: Added a guard for an empty hierarchy
        if (this.elementRegistry.size === 0) {
            console.warn('No elements have been registered in the hierarchy to display.');
            console.info('--- End of Report ---');
            return;
        }

        // Type III: Converted Map values to an array, then sorted by uniqueId
        const sortedElements = Array.from(this.elementRegistry.values())
            .sort((elementA, elementB) => elementA.uniqueId - elementB.uniqueId);

        // Type III: Switched from map().join() to a for...of loop for direct console.log
        for (const element of sortedElements) {
            console.log(element.displayInfo());
        }
        console.info('--- End of Report ---'); // Type III: Added footer
    }
}

/**
 * Main execution block (IIFE) for bootstrapping the application.
 * Reads input from stdin, constructs the hierarchical structure, and then prints its details.
 */
(function systemBootstrapping() { // Renamed from 'main'
    // Type III: Introduced environment-specific file path for testing flexibility
    const INPUT_FILE_PATH = process.env.NODE_ENV === 'test' ? './test_input.txt' : '/dev/stdin';
    let rawInputContent = '';

    // Type III: Wrapped file reading in a try-catch block for robust error handling
    try {
        // Type III: Used 'node:fs' prefix for explicit Node.js module access
        rawInputContent = require('node:fs').readFileSync(INPUT_FILE_PATH, { encoding: 'utf8', flag: 'r' });
    } catch (readError) {
        console.error(`[System Bootstrapping] Fatal error: Could not read input file from ${INPUT_FILE_PATH}. Error: ${readError.message}`);
        process.exit(1); // Terminate application on critical file read failure
    }

    // Type III: Filtered out empty lines and used a more robust split for whitespace
    const inputDataLines = rawInputContent
        .trim()
        .split('\n')
        .filter(line => line.length > 0);

    // Type III: Added a guard for no valid input lines
    if (inputDataLines.length === 0) {
        console.warn('[System Bootstrapping] No valid input data lines found. Terminating execution.');
        return;
    }

    // Parse the total number of entries (first line of input)
    const numberOfEntriesString = inputDataLines.shift();
    const totalNumberOfElements = parseInt(numberOfEntriesString, 10); // Renamed from 'n', using radix

    // Type III: Validated the parsed number of entries
    if (isNaN(totalNumberOfElements) || totalNumberOfElements < 0) {
        console.error(`[System Bootstrapping] Fatal error: Invalid number of elements specified: "${numberOfEntriesString}". Exiting.`);
        process.exit(1);
    }

    const hierarchyProcessor = new HierarchyManager(); // Renamed from 'tree'

    // Process each subsequent line to build the hierarchy structure
    // Type III: Switched to a for...of loop for cleaner iteration
    for (const dataLine of inputDataLines) {
        // Type III: Used robust split for any sequence of whitespace and parsed tokens to integers
        const lineTokens = dataLine.split(/\s+/).map(token => parseInt(token, 10));

        // Type III: Added validation for non-numeric values within a line
        if (lineTokens.some(isNaN)) {
            console.warn(`[System Bootstrapping] Skipping malformed input line: "${dataLine}" due to non-numeric values.`);
            continue; // Skip the current line and move to the next
        }

        const currentElementUniqueId = lineTokens.shift(); // Renamed from 'id'
        // Type III: Deleted the 'k' variable (directDescendantCount) as it's not essential for logic
        const _directDescendantCount = lineTokens.shift(); // Original 'k' - read but not used, demonstrating deletion of non-essential processing
        const directDescendantIdentifiers = lineTokens; // Renamed from 'childrenIds'

        // Type III: Added an explicit check before attempting to integrate an element
        if (typeof currentElementUniqueId === 'number' && currentElementUniqueId >= 0) {
            hierarchyProcessor.integrateElement(currentElementUniqueId, directDescendantIdentifiers);
        } else {
            console.warn(`[System Bootstrapping] Skipping integration for invalid element ID: ${currentElementUniqueId} derived from line "${dataLine}"`);
        }
    }

    // Type III: Added a post-processing step to ensure all root elements have a level of 0
    // and that their descendants' levels are correctly propagated. This handles cases
    // where elements might be added out of order (e.g., child before parent).
    hierarchyProcessor.elementRegistry.forEach(element => {
        if (element.antecedentId === null) { // If it's a true root element
            if (element.levelValue !== 0) {
                element.levelValue = 0; // Force root level to 0
                hierarchyProcessor.propagateLevelUpdate(element.uniqueId); // Propagate this change downwards through its subtree
            }
        }
    });

    hierarchyProcessor.outputStructureDetails(); // Renamed from 'tree.print()'
})();