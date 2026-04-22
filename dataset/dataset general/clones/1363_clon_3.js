// This module provides a set of advanced DOM manipulation and utility functions.
// It is designed to interact with the web document structure, manage element references,
// and perform various content and property updates.
//
// Project Name: WebNodeProcessor
// Version: 1.0.beta
// License: Proprietary
//
// This file includes features for DOM traversal, element identification,
// property transfer, content injection, and event dispatching.

/**
 * @global {TreeWalker|null} domTraversalEngine - The global TreeWalker instance for DOM navigation.
 *                                                Initialized lazily or via setupDomIterator.
 */
let domTraversalEngine = null;

/**
 * @global {string[]} identifiedNodeRegistry - An array storing unique identifiers (IDs)
 *                                            of specific DOM elements selected for tracking.
 */
const identifiedNodeRegistry = [];

/**
 * @global {Element|null} currentActiveReference - The primary DOM element reference currently
 *                                                under active manipulation or observation.
 */
let currentActiveReference = null;

/**
 * Calculates a pseudo-random zero-based index for an array-like structure.
 * The index is derived from a numerical factor and the total count of items.
 *
 * @param {number} selectionFactor - A numerical value (typically 0-99) used as a percentage-like factor.
 * @param {number} totalItemsCount - The total number of items available in the collection.
 * @returns {number} A calculated integer index, or -1 if totalItemsCount is zero or invalid.
 */
function deriveNodeSelectionIndex(selectionFactor, totalItemsCount) {
  if (totalItemsCount <= 0 || !Number.isFinite(totalItemsCount)) {
    console.warn("Invalid total items count provided for index derivation.");
    return -1;
  }
  // Cap the factor to prevent out-of-bounds access and ensure proper scaling.
  const normalizedFactor = Math.min(Math.max(selectionFactor, 0), 99) / 100.0;
  return Math.floor(totalItemsCount * normalizedFactor);
}

/**
 * Retrieves a pseudo-random DOM element from the entire document.
 * Utilizes `document.querySelectorAll('*')` to get all nodes.
 *
 * @param {number} entropyValue - A numerical seed influencing the selection of the element.
 * @returns {Element|null} A randomly selected DOM element, or null if no elements are found.
 */
function fetchRandomDocumentNode(entropyValue) {
  const allDocumentElements = document.querySelectorAll('*');
  if (allDocumentElements.length === 0) {
    console.warn("Document contains no elements to select from.");
    return null;
  }
  const chosenIndex = deriveNodeSelectionIndex(entropyValue, allDocumentElements.length);
  return allDocumentElements[chosenIndex];
}

/**
 * Initializes or re-initializes the global DOM TreeWalker instance (`domTraversalEngine`).
 * The TreeWalker is configured to traverse the DOM starting from the `document.documentElement`.
 *
 * @param {number} [nodeFilterCriterion=NodeFilter.SHOW_ELEMENT] - A bitmask indicating which node types
 *                                                                the TreeWalker should show. Defaults to elements only.
 */
function setupDomIterator(nodeFilterCriterion = NodeFilter.SHOW_ELEMENT) {
  if (!Number.isInteger(nodeFilterCriterion) || nodeFilterCriterion < 0) {
    console.error("Invalid node filter criterion. Using NodeFilter.SHOW_ELEMENT.");
    nodeFilterCriterion = NodeFilter.SHOW_ELEMENT;
  }

  // The acceptNode function here is simplified to mostly accept elements,
  // making a slight change from the original's blanket acceptance for all node types
  // when NodeFilter.SHOW_ALL was implied by the filter constant.
  const filterObject = {
    acceptNode: function(nodeCandidate) {
      if ((nodeFilterCriterion & (1 << (nodeCandidate.nodeType - 1))) &&
          nodeCandidate.nodeType !== Node.DOCUMENT_NODE &&
          nodeCandidate.nodeType !== Node.DOCUMENT_TYPE_NODE) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP; // Skip nodes not matching the criterion or specific types.
    }
  };

  try {
    domTraversalEngine = document.createTreeWalker(
      document.documentElement, // Start traversal from the root HTML element.
      nodeFilterCriterion,
      filterObject,
      false // Do not expand entity references.
    );
    console.info("DOM traversal engine successfully initialized.");
  } catch (error) {
    console.error(`Failed to create TreeWalker: ${error.message}`);
    domTraversalEngine = null;
  }
}

/**
 * Selects a random DOM element, assigns it a unique identifier, and adds
 * this identifier to a global registry for later retrieval.
 *
 * @param {number} selectionEntropy - A numerical seed for random element selection.
 * @param {string} uniqueNodeIdentifier - The string ID to be assigned to the chosen element.
 * @returns {boolean} True if an element was successfully identified and registered, false otherwise.
 */
function assignAndRegisterNode(selectionEntropy, uniqueNodeIdentifier) {
  if (typeof uniqueNodeIdentifier !== 'string' || uniqueNodeIdentifier.trim() === '') {
    console.error("Invalid or empty unique node identifier provided.");
    return false;
  }

  // Prevent re-assigning an ID if it already exists in the document.
  if (document.getElementById(uniqueNodeIdentifier)) {
    console.warn(`Identifier '${uniqueNodeIdentifier}' already in use. Skipping assignment.`);
    return false;
  }

  const designatedNode = fetchRandomDocumentNode(selectionEntropy);

  if (designatedNode instanceof Element) {
    designatedNode.id = uniqueNodeIdentifier;
    identifiedNodeRegistry.push(uniqueNodeIdentifier);
    console.debug(`Node '${designatedNode.tagName}' assigned ID '${uniqueNodeIdentifier}' and registered.`);
    return true;
  } else {
    console.warn("Could not find a suitable random element to assign an ID.");
    return false;
  }
}

/**
 * Retrieves a DOM element by its ID from the `identifiedNodeRegistry`.
 * A lookup factor determines which registered ID to use.
 *
 * @param {number} lookupFactor - A numerical factor (0-99) to select an ID from the registry.
 * @returns {Element|null} The DOM element corresponding to the selected registered ID, or null if not found.
 */
function retrieveRegisteredNode(lookupFactor) {
  if (identifiedNodeRegistry.length === 0) {
    console.info("The identified node registry is empty.");
    return null;
  }
  const indexInRegistry = deriveNodeSelectionIndex(lookupFactor, identifiedNodeRegistry.length);
  if (indexInRegistry === -1) {
      console.warn("Could not derive a valid index for the registry.");
      return null;
  }
  const targetId = identifiedNodeRegistry[indexInRegistry];

  if (targetId) {
    const foundElement = document.getElementById(targetId);
    if (foundElement) {
      console.debug(`Retrieved registered node with ID: '${targetId}'.`);
      return foundElement;
    } else {
      console.warn(`Element with ID '${targetId}' found in registry but not in document. Removing from registry.`);
      // Optional: Clean up registry if ID is stale. This is a Type III addition.
      identifiedNodeRegistry.splice(indexInRegistry, 1);
      return null;
    }
  }
  return null;
}

/**
 * A utility function to safely transfer enumerable own properties from a source object to a target object.
 *
 * @param {object} destinationObject - The object to which properties will be copied.
 * @param {object} sourceObject - The object from which properties will be read.
 * @param {boolean} [shouldOverwrite=true] - If true, existing properties in destinationObject will be overwritten.
 */
function transferProperties(destinationObject, sourceObject, shouldOverwrite = true) {
    if (!destinationObject || !sourceObject || typeof destinationObject !== 'object' || typeof sourceObject !== 'object') {
        console.warn("Invalid objects provided for property transfer. Skipping.");
        return;
    }
    for (const propertyKey in sourceObject) {
        if (Object.prototype.hasOwnProperty.call(sourceObject, propertyKey)) {
            try {
                if (shouldOverwrite || !Object.prototype.hasOwnProperty.call(destinationObject, propertyKey)) {
                    destinationObject[propertyKey] = sourceObject[propertyKey];
                }
            } catch (error) {
                console.error(`Error copying property '${propertyKey}': ${error.message}`);
            }
        }
    }
}

/**
 * This is the core manipulation function, updating the global `currentActiveReference`.
 * It can perform property assignments, navigate the DOM using the TreeWalker,
 * or clone nodes based on various input parameters.
 *
 * @param {number} modificationMode - Defines the type of property modification (0-2) or reference initialization.
 * @param {number} navigationMode - Specifies how to navigate the DOM when `currentActiveReference` is null (0-3).
 * @param {boolean} shouldDuplicate - If true, the selected node is cloned; otherwise, a direct reference is used.
 * @param {number} targetSelectionEntropy - Seed for selecting a target object for property transfer or source node.
 * @param {number} phantomSelectionEntropy - Seed for selecting a temporary "phantom" node during navigation.
 * @param {number} propertyIndexEntropy - Seed for selecting a specific property index during certain transfer modes.
 * @param {boolean} useRegisteredNodes - If true, prefers elements from `identifiedNodeRegistry`; otherwise, random document elements.
 */
function updateActiveReference(
  modificationMode,
  navigationMode,
  shouldDuplicate,
  targetSelectionEntropy,
  phantomSelectionEntropy,
  propertyIndexEntropy,
  useRegisteredNodes
) {
  let sourceCandidate = null;

  // --- Determine the source candidate for operations ---
  if (useRegisteredNodes && identifiedNodeRegistry.length > 0) {
    sourceCandidate = retrieveRegisteredNode(targetSelectionEntropy);
    if (!sourceCandidate) {
      console.info("Registered node not found, falling back to random document node selection.");
      sourceCandidate = fetchRandomDocumentNode(targetSelectionEntropy);
    }
  } else {
    sourceCandidate = fetchRandomDocumentNode(targetSelectionEntropy);
  }

  // --- Handle property modification if an active reference exists ---
  if (currentActiveReference) {
    if (!sourceCandidate) {
        console.warn("Cannot perform property operations: no valid source candidate found.");
        return;
    }

    switch (modificationMode) {
      case 0: // Copy all enumerable own properties from sourceCandidate to currentActiveReference.
        transferProperties(currentActiveReference, sourceCandidate, true);
        console.debug("Properties copied from source to active reference (mode 0).");
        break;

      case 1: // Update properties of currentActiveReference that also exist in sourceCandidate.
              // This is a subtle reinterpretation of the original's case 1.
        for (const propKey in currentActiveReference) {
            if (Object.prototype.hasOwnProperty.call(currentActiveReference, propKey) &&
                Object.prototype.hasOwnProperty.call(sourceCandidate, propKey)) {
                try {
                    currentActiveReference[propKey] = sourceCandidate[propKey];
                } catch (error) {
                    console.error(`Failed to update property '${propKey}' in active reference: ${error.message}`);
                }
            }
        }
        console.debug("Matching properties updated in active reference (mode 1).");
        break;

      case 2: // Update a single randomly selected property from currentActiveReference
              // with a single randomly selected property from sourceCandidate.
        const activeRefProps = Object.keys(currentActiveReference);
        const sourceCandidateProps = Object.keys(sourceCandidate);

        if (activeRefProps.length > 0 && sourceCandidateProps.length > 0) {
            const targetPropIndex = deriveNodeSelectionIndex(propertyIndexEntropy, activeRefProps.length);
            const sourcePropIndex = deriveNodeSelectionIndex(propertyIndexEntropy, sourceCandidateProps.length);

            const chosenTargetProp = activeRefProps[targetPropIndex];
            const chosenSourceProp = sourceCandidateProps[sourcePropIndex];

            if (chosenTargetProp && chosenSourceProp) {
                try {
                    currentActiveReference[chosenTargetProp] = sourceCandidate[chosenSourceProp];
                    console.debug(`Random property '${chosenTargetProp}' updated from '${chosenSourceProp}' (mode 2).`);
                } catch (error) {
                    console.error(`Error updating random property '${chosenTargetProp}': ${error.message}`);
                }
            } else {
                console.warn("Could not select valid properties for random update.");
            }
        } else {
            console.warn("Cannot update random property: active reference or source has no properties.");
        }
        break;

      default:
        console.warn(`Unrecognized modification mode: ${modificationMode}. No property operations performed.`);
        break;
    }
  } else {
    // --- Initialize currentActiveReference if it is null ---
    if (!domTraversalEngine || !domTraversalEngine.currentNode) {
      console.info("DOM traversal engine not active or current node invalid. Attempting initialization.");
      setupDomIterator(NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT); // Example: show elements and text nodes.
      // After initialization, ensure currentNode is set to a starting point if still null.
      if (!domTraversalEngine.currentNode) {
        domTraversalEngine.currentNode = document.documentElement;
      }
    }

    let selectedTraversalNode = null;
    const ephemeralNode = fetchRandomDocumentNode(phantomSelectionEntropy);

    switch (navigationMode) {
      case 0: // Use the current node of the TreeWalker.
        selectedTraversalNode = domTraversalEngine.currentNode;
        console.debug("Navigation: Current TreeWalker node selected.");
        break;

      case 1: // Navigate to the previous sibling. Includes fallback.
        selectedTraversalNode = domTraversalEngine.previousSibling();
        if (!selectedTraversalNode) {
            console.info("No previous sibling found. Attempting to move to parent.");
            selectedTraversalNode = domTraversalEngine.parentNode(); // Fallback to parent.
        }
        console.debug("Navigation: Previous sibling or parent selected.");
        break;

      case 2: // Navigate to the previous node in document order. Includes fallback.
        selectedTraversalNode = domTraversalEngine.previousNode();
        if (!selectedTraversalNode) {
            console.info("No previous node found. Resetting to document root and moving to first child.");
            domTraversalEngine.currentNode = document.documentElement;
            selectedTraversalNode = domTraversalEngine.firstChild(); // Fallback to first child from root.
        }
        console.debug("Navigation: Previous node or first child from root selected.");
        break;

      case 3: // Use the randomly selected ephemeral node.
        selectedTraversalNode = ephemeralNode;
        console.debug("Navigation: Ephemeral random node selected.");
        break;

      default:
        console.warn(`Invalid navigation mode: ${navigationMode}. Defaulting to current TreeWalker node.`);
        selectedTraversalNode = domTraversalEngine.currentNode;
        break;
    }

    // Assign the selected node (or its clone) to currentActiveReference.
    if (selectedTraversalNode) {
      currentActiveReference = shouldDuplicate ? selectedTraversalNode.cloneNode(true) : selectedTraversalNode;
      if (currentActiveReference) {
          console.info(`Active reference initialized. Node type: ${currentActiveReference.nodeType}, cloned: ${shouldDuplicate}`);
      } else {
          console.error("Active reference could not be initialized despite node selection.");
      }
    } else {
      console.error("Failed to select any DOM node for active reference initialization.");
    }
  }
}

/**
 * Modifies the inner HTML or text content of a specified DOM element.
 * Provides various actions for setting or appending content, or clearing it.
 *
 * @param {Element} targetNode - The DOM element whose content is to be modified.
 * @param {string|null} contentPayload - The string content to inject, or null to clear content.
 * @param {number} modificationAction - Specifies the type of content modification (0-5).
 * @returns {boolean} True if the modification was attempted, false if targetNode is invalid or action is unknown.
 */
function modifyNodeContent(targetNode, contentPayload, modificationAction) {
  if (!(targetNode instanceof Element)) {
    console.error("Invalid target node provided for content modification. Must be an Element.");
    return false;
  }

  // Ensure contentPayload is a string for operations, converting null to empty string for safety.
  const processedPayload = (contentPayload === null || typeof contentPayload === 'undefined') ? '' : String(contentPayload);

  switch (modificationAction) {
    case 0: // Overwrite innerHTML.
      targetNode.innerHTML = processedPayload;
      break;
    case 1: // Overwrite textContent.
      targetNode.textContent = processedPayload;
      break;
    case 2: // Append to innerHTML.
      targetNode.innerHTML += processedPayload;
      break;
    case 3: // Append to textContent.
      targetNode.textContent += processedPayload;
      break;
    case 4: // Clear innerHTML.
      targetNode.innerHTML = '';
      break;
    case 5: // Clear textContent.
      targetNode.textContent = '';
      break;
    default:
      console.warn(`Unknown content modification action: ${modificationAction}. No changes applied.`);
      return false;
  }
  console.debug(`Node content modified for '${targetNode.tagName}' with action ${modificationAction}.`);
  return true;
}

/**
 * Allocates a series of Uint8Array objects, potentially for memory manipulation or heap spraying.
 * The size and pattern of the allocated blocks are predefined.
 *
 * @returns {Uint8Array[]} An array containing the newly allocated Uint8Array objects.
 */
function allocateMemoryBlock() {
  const memoryBufferCollection = [];
  const allocationUnitCount = 0x100; // Total number of Uint8Array objects to create.
  const basePattern = [0xDE, 0xAD, 0xBE, 0xEF, 0xCA, 0xFE, 0x0D, 0xBE]; // Extended byte pattern.

  for (let blockIndex = 0; blockIndex < allocationUnitCount; blockIndex++) {
    // Introduce a slight variation in the pattern for every other block as a Type III change.
    const currentBlockPattern = (blockIndex % 2 === 0) ? basePattern : [0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x11, 0x22];
    memoryBufferCollection.push(new Uint8Array(currentBlockPattern));
  }
  console.log(`Allocated ${allocationUnitCount} Uint8Array blocks for memory operations.`);
  return memoryBufferCollection;
}

/**
 * Dispatches a custom or standard DOM event on a specified target object.
 *
 * @param {string} eventTypeLabel - The string identifier for the event type (e.g., 'click', 'input', 'customEvent').
 * @param {EventTarget} eventTargetObject - The object (e.g., Element, Document, Window) on which to dispatch the event.
 * @returns {boolean} True if the event was successfully dispatched, false otherwise.
 */
function dispatchDomEvent(eventTypeLabel, eventTargetObject) {
  if (typeof eventTypeLabel !== 'string' || eventTypeLabel.trim() === '') {
    console.error("Invalid or empty event type label provided.");
    return false;
  }
  if (!eventTargetObject || typeof eventTargetObject.dispatchEvent !== 'function') {
    console.error("Invalid event target object provided; it must have a 'dispatchEvent' method.");
    return false;
  }

  try {
    const domEventInstance = new Event(eventTypeLabel, {
      view: window,
      bubbles: true,
      cancelable: true // Changed to true, allowing the event to be cancellable.
    });
    eventTargetObject.dispatchEvent(domEventInstance);
    console.info(`Event '${eventTypeLabel}' successfully dispatched on target.`);
    return true;
  } catch (error) {
    console.error(`An error occurred while dispatching event '${eventTypeLabel}': ${error.message}`);
    return false;
  }
}

// Self-executing initialization block for the module.
// This is an added code fragment demonstrating Type III changes.
(function initializeModuleOnLoad() {
    console.log("WebNodeProcessor module loaded. Performing initial setup checks.");

    // Optionally, ensure the DOM is ready before trying to set up TreeWalker for the first time.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOMContentLoaded event fired. Module ready for DOM operations.");
            // setupDomIterator(); // Can uncomment to pre-initialize the TreeWalker.
        });
    } else {
        console.log("Document already loaded. Module ready for immediate DOM operations.");
        // setupDomIterator(); // Can uncomment to pre-initialize the TreeWalker.
    }

    // A simple check to ensure global arrays are initialized.
    if (!Array.isArray(identifiedNodeRegistry)) {
        console.error("identifiedNodeRegistry is not an array. Re-initializing.");
        identifiedNodeRegistry = []; // Should not happen with const, but demonstrates a guard clause.
    }
})();