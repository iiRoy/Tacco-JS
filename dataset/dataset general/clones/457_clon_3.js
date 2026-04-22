/**
 * Core application events.
 */

/**
 * @event beforeNodeInsertionAttempt
 * @description Signifies an impending node addition to the data structure. Invoking `event.preventDefault()` will abort the insertion.
 *
 * @param {object} parentNode - The parent node object where the new node is intended to be inserted.
 */

/**
 * @event nodeSuccessfullyInserted
 * @description Emitted after a node has been successfully incorporated into the data structure.
 * @param {object} insertedNode - The new node object that was added.
 */

/**
 * @event beforeNodeRemovalAttempt
 * @description Broadcast just before a node is detached from the data structure. Use `event.preventDefault()` to prevent the removal.
 *
 * @param {object} targetNode - The node object slated for removal.
 */

/**
 * @event nodeRemovedFromStructure
 * @description Fired post-removal of a node from the data structure.
 * @param {number} removedNodeId - The unique identifier of the node that was removed.
 * @param {object} parentReference - The parent node object of the recently removed node.
 */

/**
 * @event nodeKeyUpdated
 * @description Triggered after a node's key attribute has been modified. Note: This event can fire on each character input within a key field or when `setNodeKey()` is called with an explicit event dispatch flag.
 *
 * @param {string} newKeyValue - The updated key string.
 * @param {HTMLElement} inputElement - The DOM element facilitating user input for the key.
 * @param {object} affectedNode - The node object whose key was altered.
 */

/**
 * @event nodeValueUpdated
 * @description Dispatched after a node's property value has been changed. For string-type nodes, this may fire on every keystroke. It also fires when `setNodeValue()` is invoked with an event dispatch flag.
 *
 * @param {string} newValueContent - The new value string from the input.
 * @param {HTMLElement} inputControl - The HTML element utilized for value input.
 * @param {object} associatedNode - The node object corresponding to the modified value.
 */

/**
 * @event beforeNodeTypeCleared
 * @description Fired just prior to a node's type being reset (e.g., reverting to an undefined state). `event.preventDefault()` will prevent the type removal.
 * @param {object} nodeToModify - The node object whose type is about to be cleared.
 */

/**
 * @event nodeTypeReset
 * @description Emitted once a node's type has been successfully cleared.
 * @param {object} modifiedNode - The node object that had its type cleared.
 */

/**
 * @event structureChanged
 * @description A general event indicating any modification to the underlying data structure. This aggregates `nodeSuccessfullyInserted`, `nodeRemovedFromStructure`, `nodeKeyUpdated`, `nodeValueUpdated`, and `nodeTypeReset`. The event detail will mirror the specific event that triggered it, with an added `changeCategory` property.
 *
 * @param {string} changeCategory - The specific type of modification that occurred, corresponding to the triggering event name.
 */

/**
 * @event dataValidationIssue
 * @description Occurs when an inconsistency or error is detected within the data structure.
 * @param {object} errorDetails - An internal error object detailing the issue.
 * @param {object} problematicNode - The node object associated with the detected error.
 */

/**
 * @event dataValidationClean
 * @description Fired when the data structure is entirely free of any validation issues. No specific `event.detail` is provided for this event.
 */


// --- Main component definition using modern Web Components ---
((globalScope) => {
  // A simple counter for generating unique node identifiers across the component's lifetime
  let uniqueNodeIdentifier = 0;

  class DataStructureManager extends HTMLElement {
    // Private fields for internal state management
    #initialDataSet = null; // The original data provided to the component instance
    #processedNodeGraph = null; // A specially formatted object graph for internal tracking and manipulation
    #nodeLookupMap = null; // A map to quickly access any node by its unique ID
    #parsingErrorMsg = "Data Error"; // Message for data parsing issues, configurable
    #activeEditNode = null; // Reference to the node object currently in an editing state
    #currentFocusElement = null; // Reference to the DOM element that currently has user focus
    #validationErrors = {}; // A cache of all currently identified validation errors within the structure
    #enableValidationChecks = true; // Flag to enable or disable error reporting and validation logic

    // Define attributes that the component should observe for changes
    static get observedAttributes() {
      return ['data-source-json']; // Example: if it observed a 'data-source-json' attribute
    }

    constructor() {
      super();
      // Initialize component state upon creation
      this.#onComponentInitialization();
    }

    // Lifecycle callback: Fires when the element is inserted into the DOM
    connectedCallback() {
      this.#emitEvent('componentReady'); // Notify that the component is ready in the DOM
    }

    // --- Internal Utility Methods ---

    #onComponentInitialization() {
      this.#initialDataSet = {}; // Default to an empty object if no data source is provided
      this.#initializeInternalStructures(); // Set up the core data structures
    }

    #initializeInternalStructures() {
      this.#processedNodeGraph = {
        nodeId: -1, // Special ID for the root node
        nodeValue: [], // Root's children are typically in an array
        parentNode: null, // Root has no parent
        childKeyIndex: 0, // Placeholder, might be used for auto-generating keys
        nodeType: "object", // Root is conceptually an object
      };
      this.#nodeLookupMap = {}; // Reset the lookup map
      this.#validationErrors = {}; // Clear all validation errors
      // Register the root node in the lookup map
      this.#nodeLookupMap[this.#processedNodeGraph.nodeId] = this.#processedNodeGraph;
    }

    #stringifyValue(inputVal) {
      const valueType = typeof inputVal;

      if (valueType === "string" || valueType === "boolean" || valueType === "number") {
        return String(inputVal); // Explicitly convert to string
      }

      // Handle null and undefined explicitly for string representation
      if (inputVal === null) {
        return "null";
      }

      if (inputVal === undefined) {
        return "undefined";
      }

      return inputVal; // Return as is for objects/arrays that shouldn't be stringified here
    }

    #coerceValueType(inputStr) {
      // Direct conversions for common string literals
      if (inputStr === 'null' || inputStr === null) return null;
      if (inputStr === 'undefined' || inputStr === undefined) return undefined;
      if (inputStr === 'false' || inputStr === false) return false;
      if (inputStr === 'true' || inputStr === true) return true;

      const trimmedStr = (typeof inputStr === 'string' && inputStr.trim()) || inputStr;

      // If it's an empty string after trimming, keep it as a string
      if (typeof trimmedStr === 'string' && trimmedStr.length === 0) {
        return inputStr;
      }

      // Robust check for numeric conversion, including finite numbers
      if (!isNaN(parseFloat(trimmedStr)) && isFinite(trimmedStr)) {
        return parseFloat(trimmedStr);
      }

      return inputStr; // Return the original value if no conversion was possible
    }

    #isNativeEvent(potentialEvent) {
      return potentialEvent instanceof Event;
    }

    #triggeredByUIEvent(argsCollection) {
      // Check if the first argument is an Event object, implying a UI trigger
      if (!Array.isArray(argsCollection) || argsCollection.length === 0) {
        return false;
      }
      return this.#isNativeEvent(argsCollection[0]);
    }

    #traverseChildren(collection, callbackFn) {
      if (Array.isArray(collection)) {
        for (let idx = 0; idx < collection.length; idx++) {
          callbackFn(collection[idx], idx); // Pass item and index
        }
      } else if (typeof collection === "object" && collection !== null) {
        for (const key in collection) {
          // Ensure we only process own properties, not inherited ones
          if (Object.prototype.hasOwnProperty.call(collection, key)) {
            callbackFn(collection[key], key); // Pass item and key
          }
        }
      }
    }

    #retrieveNodeById(identifier) {
      return this.#nodeLookupMap[identifier];
    }

    #getNodeSiblings(identifier) {
      const targetNode = this.#retrieveNodeById(identifier);
      // Siblings are typically found within the parent's `nodeValue` property
      if (targetNode && targetNode.parentNode) {
        return targetNode.parentNode.nodeValue;
      }
      return null;
    }

    #isValuePrimitive(valueCandidate) {
      // A primitive value is not an object, with null being a special case (typeof null is 'object')
      if (valueCandidate === null || typeof valueCandidate !== "object") {
        return true;
      }
      return false;
    }

    #determineValueType(val) {
      if (val === undefined) return undefined;
      if (this.#isValuePrimitive(val)) return "string"; // Treat primitives as string-like for UI representation
      if (Array.isArray(val)) return "array";
      return "object"; // Default to object for other non-primitive types
    }

    #isRootNode(nodeObject) {
      return nodeObject && nodeObject.nodeId === -1;
    }

    #canNodeHaveChildren(nodeIdentifier) {
      const node = this.#retrieveNodeById(nodeIdentifier);
      if (node) {
        const type = node.nodeType;
        return type === "array" || type === "object"; // Only arrays and objects can contain children
      }
      return false;
    }

    // --- Template Helper Functions ---
    // These functions might be exposed for rendering logic in a template
    #isCollection(value) {
      return Array.isArray(value);
    }

    #isNotCollection(value) {
      return !Array.isArray(value);
    }

    // --- Property Change Handlers ---

    // Setter for the 'dataSource' property, allowing external updates
    set dataSource(newDataSource) {
      // Only trigger updates if the new data source is an object and different from the current one
      if (typeof newDataSource === "object" && newDataSource !== null && newDataSource !== this.#initialDataSet) {
        this.#initialDataSet = newDataSource;
        this.#onDataSetChange();
      } else if (newDataSource === null) {
        // Allow clearing the data source, effectively resetting the component
        this.#initialDataSet = {};
        this.#onDataSetChange();
      }
    }

    // Getter for the 'dataSource' property
    get dataSource() {
      return this.#initialDataSet;
    }

    #onDataSetChange() {
      // When the data source changes, recompile the internal structure.
      if (typeof this.#initialDataSet === "object" && this.#initialDataSet !== null) {
        // In a full implementation, this would involve parsing and building the internal node graph
        // For this clone, we simply re-initialize internal structures.
        console.info("New data source detected. Re-initializing internal data structures.");
        this.#initializeInternalStructures();
        // A more complex compiler method would be invoked here, e.g., this.#compileDataToNodeGraph();
      } else {
        console.warn("Invalid data source provided to component. Data must be an object.");
        this.#initializeInternalStructures(); // Reset to a clean state on invalid input
      }
    }

    // --- Event Dispatching Logic ---

    #emitEvent(eventName, eventPayload, isAsync = false) {
      const customEvent = new CustomEvent(eventName, {
        detail: eventPayload,
        bubbles: true, // Allow event to bubble up through the DOM tree
        composed: true, // Allow event to cross shadow DOM boundaries
        cancelable: true // Allow event.preventDefault() to be called on this event
      });

      if (isAsync) {
        // Dispatch asynchronously to avoid blocking the current execution thread
        setTimeout(() => this.dispatchEvent(customEvent), 0);
      } else {
        this.dispatchEvent(customEvent);
      }
      return customEvent; // Return the event object, useful for checking `defaultPrevented`
    }

    #emitStructuralChangeEvent(eventDetails, eventCategory, isAsynchronous = false) {
      // First, dispatch the specific change event (e.g., 'nodeSuccessfullyInserted')
      this.#emitEvent(eventCategory, eventDetails, isAsynchronous);

      // Then, augment the details for the general 'structureChanged' event and dispatch it
      const generalChangeDetails = { ...eventDetails,
        changeCategory: eventCategory
      };
      this.#emitEvent('structureChanged', generalChangeDetails, isAsynchronous);
    }

    /**
     * @method insertNewNode
     * @description Incorporates a new node into the specified parent. If `parentIdentifier` is -1, the node is added to the root.
     * This method also dispatches `beforeNodeInsertionAttempt`, `nodeSuccessfullyInserted`, and `structureChanged` events.
     * For internal use without event dispatch, a separate `_createRawNode()` method would be used.
     *
     * @param {number} parentIdentifier - The ID of the parent node.
     * @param {string} [nodeKey] - The key for the new node. A falsy value (except 0) generates a key. Duplicate keys among siblings will trigger errors.
     * @param {any} [nodeValue] - The value for the new node. Objects/arrays are recursively structured. `undefined` leads to an undetermined type.
     * @param {boolean} [enterEditMode] - If true, the new node's key will receive focus for immediate editing.
     * @returns {object|null} The newly created node object, or `null` if the operation was prevented or failed.
     */
    insertNewNode(parentIdentifier, nodeKey, nodeValue, enterEditMode = false) {
      // Type III: Added a guard clause for invalid parentIdentifier early
      if (parentIdentifier === null || parentIdentifier === undefined) {
        console.error("Operation aborted: Parent identifier cannot be null or undefined for node insertion.");
        return null;
      }

      // Type III: Re-route arguments if the call originated from a DOM event
      if (this.#triggeredByUIEvent(arguments)) {
        const eventEl = arguments[2]; // Assuming the DOM element is the third argument in a UI event context
        const domParentId = parseInt(eventEl.getAttribute('data-id'), 10);
        // Recursively call with parsed values and enable edit mode by default for UI actions
        return this.insertNewNode(domParentId, undefined, undefined, true);
      }

      // Retrieve the parent node. Fallback to the root node if the provided ID is invalid or points to nothing.
      const targetParentNode = this.#nodeLookupMap[parentIdentifier] || this.#processedNodeGraph;

      // Type III: Prepare event payload in a dedicated object
      const insertionAttemptPayload = {
        parentNode: targetParentNode,
        proposedKey: nodeKey,
        proposedValue: nodeValue
      };

      // Dispatch 'beforeNodeInsertionAttempt' event to allow external interception
      const preInsertEvent = this.#emitEvent('beforeNodeInsertionAttempt', insertionAttemptPayload);

      // If a listener invoked `preventDefault()`, abort the node insertion
      if (preInsertEvent.defaultPrevented) {
        console.log("Node insertion operation was prevented by an event listener.");
        return null;
      }

      // Type III: Assuming an internal method `#createNewNodeInternal` handles the actual node creation
      const newNode = this.#createNewNodeInternal(parentIdentifier, nodeKey, nodeValue);

      if (!newNode) {
        console.error("Internal error: Failed to create new node during insertion process.");
        return null;
      }

      // Automatically enter edit mode for the new item's key if requested and if the parent is not an array (array keys are indices)
      if (enterEditMode && targetParentNode.nodeType !== "array") {
        this.#enterEditModeAsync(newNode.nodeId); // Placeholder for `enterEditModeAsync`
      }

      // Type III: Prepare success payload
      const successPayload = {
        insertedNode: newNode
      };
      // Dispatch 'nodeSuccessfullyInserted' and the general 'structureChanged' events asynchronously
      this.#emitStructuralChangeEvent(successPayload, 'nodeSuccessfullyInserted', true);

      return newNode;
    }

    /**
     * @method deleteNode
     * @description Removes a node and its descendants from the data structure.
     * This method dispatches `beforeNodeRemovalAttempt`, `nodeRemovedFromStructure`, and `structureChanged` events.
     *
     * @param {number} nodeIdentifierToRemove - The ID of the node to be removed.
     * @returns {boolean} `true` if removal was successful, `false` otherwise.
     */
    deleteNode(nodeIdentifierToRemove) {
      // Type III: Re-route arguments if the call originated from a DOM event
      if (this.#triggeredByUIEvent(arguments)) {
        const eventElement = arguments[2];
        const domNodeId = parseInt(eventElement.getAttribute('data-id'), 10);
        return this.deleteNode(domNodeId);
      }

      const nodeToProcess = this.#retrieveNodeById(nodeIdentifierToRemove);

      // Type III: Explicit checks for node existence and preventing root node removal
      if (!nodeToProcess) {
        console.warn(`Removal failed: Node with ID '${nodeIdentifierToRemove}' does not exist.`);
        return false;
      }
      if (this.#isRootNode(nodeToProcess)) {
        console.warn("Removal failed: Cannot remove the root node of the structure.");
        return false;
      }

      const parentOfTarget = nodeToProcess.parentNode;
      // Determine the collection where the target node resides (parent's children)
      const parentChildrenCollection = parentOfTarget ? parentOfTarget.nodeValue : this.#processedNodeGraph.nodeValue;

      // Type III: Check if the node is a child of an array type (affects key handling)
      const isArrayChild = this.#isNodeChildOfArray(nodeIdentifierToRemove);

      let targetNodeIndex = -1; // For arrays, this will be a numeric index; for objects, it will be the key string.
      if (Array.isArray(parentChildrenCollection)) {
        targetNodeIndex = parentChildrenCollection.findIndex(child => child.nodeId === nodeToProcess.nodeId);
      } else if (typeof parentChildrenCollection === 'object' && parentChildrenCollection !== null) {
        // For object parents, iterate through keys to find the matching node
        for (const key in parentChildrenCollection) {
          if (Object.prototype.hasOwnProperty.call(parentChildrenCollection, key) && parentChildrenCollection[key].nodeId === nodeToProcess.nodeId) {
            targetNodeIndex = key; // The key is the "index" in this context
            break;
          }
        }
      }

      if (targetNodeIndex === -1 && typeof targetNodeIndex !== 'string') { // Type III: Check for both numeric -1 and non-string for objects
        console.error(`Removal failed: Node with ID '${nodeIdentifierToRemove}' could not be located in its parent's collection.`);
        return false;
      }

      // Type III: Prepare event payload for removal attempt
      const removalAttemptPayload = {
        targetNode: nodeToProcess,
      };

      // Dispatch 'beforeNodeRemovalAttempt' event
      const preRemoveEvent = this.#emitEvent('beforeNodeRemovalAttempt', removalAttemptPayload);

      // Abort if an event listener prevented the default action
      if (preRemoveEvent.defaultPrevented) {
        console.log("Node removal operation was prevented by an event listener.");
        return false;
      }

      // Clear all associated validation errors for this node and its descendants
      this.#clearNodeErrors(nodeIdentifierToRemove);
      this.#clearDescendantErrors(nodeIdentifierToRemove);

      let removedNodeKey = null; // Type III: New variable to store the key if applicable
      const removedNodeIdValue = nodeToProcess.nodeId; // Type III: Store ID before the node object itself is removed

      // Perform the actual removal from the parent's collection
      if (Array.isArray(parentChildrenCollection)) {
        parentChildrenCollection.splice(targetNodeIndex, 1);
        // For array items, keys are implicit indices, so `removedNodeKey` isn't directly relevant here.
      } else if (typeof parentChildrenCollection === 'object' && targetNodeIndex !== -1) {
        removedNodeKey = nodeToProcess.nodeKey; // Assuming `nodeToProcess` has a `nodeKey` property
        delete parentChildrenCollection[targetNodeIndex]; // `targetNodeIndex` is the key string here
      }

      // Remove the node from the global lookup map
      this.#removeNodeFromLookupMap(nodeIdentifierToRemove);

      // Perform post-removal adjustments based on parent type
      if (isArrayChild) {
        this.#reindexArrayChildren(parentChildrenCollection); // Placeholder: Re-index array children if needed
      } else if (removedNodeKey) {
        this.#resolveDuplicateKeys(parentChildrenCollection, removedNodeKey); // Placeholder: Re-evaluate duplicate key errors
      }

      // Dispatch 'nodeRemovedFromStructure' and the general 'structureChanged' events asynchronously
      const removalSuccessPayload = {
        removedNodeId: removedNodeIdValue,
        parentReference: parentOfTarget
      };
      this.#emitStructuralChangeEvent(removalSuccessPayload, 'nodeRemovedFromStructure', true);

      return true;
    }

    /**
     * @method handleFocusEvent
     * @description Manages focus events for node key or value inputs.
     * Can be called programmatically or triggered by DOM events.
     *
     * @param {number} [nodeId] - The ID of the node whose input field should receive focus.
     * @param {string} [fieldTarget='key'] - Specifies which field ('key' or 'value') of the node to focus.
     * @param {HTMLElement} [domElement] - The DOM element that triggered the event (if from UI).
     */
    handleFocusEvent(nodeId, fieldTarget = 'key', domElement) {
      const isUiTriggered = this.#triggeredByUIEvent(arguments);
      let targetNodeId = nodeId;
      let targetField = fieldTarget;
      let triggeringElement = domElement;

      if (isUiTriggered) {
        // Type III: Re-extract arguments from the DOM event context more robustly
        triggeringElement = arguments[2]; // Assuming event, data, element
        targetNodeId = parseInt(triggeringElement.getAttribute('data-id'), 10);
        // Type III: Determine fieldTarget based on element class, using a new class name 'key-input-field'
        targetField = triggeringElement.classList.contains('key-input-field') ? 'key' : 'value';
      }

      // Type III: Input validation for targetNodeId
      if (isNaN(targetNodeId) || targetNodeId === null) {
        console.warn("Focus operation aborted: Invalid node ID provided.");
        return;
      }

      // Type III: Ensure fieldTarget is valid, default to 'key' if not
      if (targetField !== 'key' && targetField !== 'value') {
        console.warn(`Focus operation: Invalid field target '${fieldTarget}'. Defaulting to 'key'.`);
        targetField = 'key';
      }

      const nodeData = this.#retrieveNodeById(targetNodeId);
      if (!nodeData) {
        console.warn(`Focus operation aborted: Node with ID '${targetNodeId}' not found.`);
        return;
      }

      // Type III: Prevent focusing on keys for array child nodes, as their keys are implicit indices
      const isNodeChildOfArray = this.#isNodeChildOfArray(targetNodeId);
      if (targetField === 'key' && isNodeChildOfArray) {
        console.log("Focus operation: Cannot focus on the key field of an array child node.");
        return;
      }

      // Type III: Retrieve the actual DOM element to focus using a placeholder method
      const domElementToFocus = this.#getDomElementForNode(targetNodeId, targetField);

      if (domElementToFocus && typeof domElementToFocus.focus === 'function') {
        domElementToFocus.focus();
        this.#currentFocusElement = domElementToFocus; // Update the reference to the currently focused element
      } else {
        console.warn(`Focus operation: Could not find or focus the target DOM element for node ID '${targetNodeId}', field '${targetField}'.`);
      }
    }


    // --- Placeholder / Internal methods (not provided in original, but implied for functionality) ---
    // These methods would contain the actual logic for data manipulation and DOM interaction.
    #createNewNodeInternal(parentId, key, value) {
      uniqueNodeIdentifier++; // Increment global counter for unique IDs
      const newNodeKey = key || `new_key_${uniqueNodeIdentifier}`; // Generate a default key if none provided

      const newNode = {
        nodeId: uniqueNodeIdentifier,
        nodeKey: newNodeKey,
        nodeValue: value,
        parentNode: this.#retrieveNodeById(parentId), // Link to parent node object
        childKeyIndex: 0, // This might be used for array indices or internal ordering
        nodeType: this.#determineValueType(value) // Infer type from the initial value
      };

      const parentNode = newNode.parentNode;
      if (parentNode) {
        if (Array.isArray(parentNode.nodeValue)) {
          parentNode.nodeValue.push(newNode); // Add to array for array parents
        } else if (typeof parentNode.nodeValue === 'object' && parentNode.nodeValue !== null) {
          parentNode.nodeValue[newNode.nodeKey] = newNode; // Add as a property for object parents
        } else {
          // Type III: If parent's nodeValue is not an array or object, initialize it as an object
          // and then add the new node. This handles cases where a primitive parent gains a child.
          parentNode.nodeValue = {};
          parentNode.nodeValue[newNode.nodeKey] = newNode;
          parentNode.nodeType = "object"; // Update parent's type if it was primitive
        }
      } else {
        // If no parent (e.g., adding to the conceptual root), add to the root's value array
        this.#processedNodeGraph.nodeValue.push(newNode);
      }

      this.#nodeLookupMap[newNode.nodeId] = newNode; // Register the new node in the lookup map
      return newNode;
    }

    #enterEditModeAsync(nodeId) {
      // Type III: Simulate entering edit mode for a node asynchronously
      // In a real implementation, this would involve querying the shadow DOM for the specific input
      // element for the node's key or value and programmatically calling `.focus()`.
      // console.log(`[DEBUG] Asynchronously attempting to set node ${nodeId} to edit mode.`);
      // Example: setTimeout(() => this.#getDomElementForNode(nodeId, 'key')?.focus(), 50);
    }

    #isNodeChildOfArray(nodeId) {
      const node = this.#retrieveNodeById(nodeId);
      return node && node.parentNode && node.parentNode.nodeType === 'array';
    }

    #clearNodeErrors(nodeId) {
      // Type III: Placeholder for clearing errors associated with a specific node
      // console.log(`[DEBUG] Clearing validation errors for node ${nodeId}.`);
      delete this.#validationErrors[nodeId];
    }

    #clearDescendantErrors(nodeId) {
      // Type III: Placeholder for recursively clearing errors for a node and all its children
      // console.log(`[DEBUG] Clearing descendant validation errors for node ${nodeId}.`);
      const node = this.#retrieveNodeById(nodeId);
      if (node && (Array.isArray(node.nodeValue) || typeof node.nodeValue === 'object' && node.nodeValue !== null)) {
        this.#traverseChildren(node.nodeValue, (childNode) => {
          this.#clearNodeErrors(childNode.nodeId);
          this.#clearDescendantErrors(childNode.nodeId); // Recursive call
        });
      }
    }

    #removeNodeFromLookupMap(nodeId) {
      // Type III: Placeholder for removing a node from the internal lookup map
      // console.log(`[DEBUG] Removing node ${nodeId} from global lookup map.`);
      delete this.#nodeLookupMap[nodeId];
    }

    #reindexArrayChildren(childrenArray) {
      // Type III: Placeholder for re-indexing children within an array parent after a removal
      // If child nodes had an explicit 'index' property, this method would update them.
      // console.log("[DEBUG] Re-indexing array children after removal operation.");
    }

    #resolveDuplicateKeys(siblingCollection, removedKey) {
      // Type III: Placeholder for logic to re-evaluate and potentially clear duplicate key errors
      // among siblings after a node with a specific key has been removed.
      // console.log(`[DEBUG] Resolving potential duplicate keys for '${removedKey}' among siblings.`);
    }

    #getDomElementForNode(nodeId, field) {
      // Type III: This is a placeholder; in a real component, this would query the shadow DOM
      // or light DOM to find the specific input element for the node's key or value.
      // E.g., `this.shadowRoot.querySelector(`[data-node-id="${nodeId}"] .${field}-input-field`);`
      // console.log(`[DEBUG] Attempting to retrieve DOM element for node ${nodeId}, field ${field}.`);
      return null; // Return null as the actual DOM structure is not provided here
    }

    // --- End Placeholder methods ---
  }

  // Register the custom element with the browser's CustomElementRegistry
  globalScope.customElements.define('data-structure-manager', DataStructureManager);

})(window); // Using the global 'window' object as the scope for the IIFE