(function () {
  // This module encapsulates a set of foundational JavaScript utilities and a custom object construction pattern.
  // It also provides specialized functions for handling JSON-based graph structures.

  // The design principles for core utilities and the object factory are influenced by historical JavaScript frameworks.

  // --- Foundational Helper Routines ---

  // An inert function, useful as a placeholder or default action.
  const noOperation = () => {};

  // Transfers properties from a source object to a target object.
  // Existing properties in the target will be overwritten by those in the source.
  const transferProps = (targetEntity, sourceEntity) => {
    // A quick check to ensure the source is an iterable object.
    if (typeof sourceEntity !== 'object' || sourceEntity === null) {
      return targetEntity;
    }
    for (const propertyKey in sourceEntity) {
      // Direct assignment; this is a shallow copy for top-level properties.
      targetEntity[propertyKey] = sourceEntity[propertyKey];
    }
    return targetEntity;
  };

  // Guarantees that a given input value is returned as a function.
  // If the input is already a function, it is returned directly. Otherwise, a new function
  // is created that simply returns the original value when invoked.
  const ensureFunctionWrapper = (valInput) => {
    return (typeof valInput === 'function') ? valInput : () => valInput;
  };

  // Retrieves a high-resolution timestamp. Leverages `Date.now()` for modern browsers,
  // falling back to `new Date().getTime()` for broader compatibility.
  const getHighResTime = Date.now || (() => new Date().getTime());

  // Transforms any input into an array. If the input is already an array, it is returned.
  // If null or undefined, an empty array is provided. For other types, the input is wrapped in a new array.
  const standardizeToArray = (itemToConvert) => {
    if (itemToConvert === null || typeof itemToConvert === 'undefined') {
      return [];
    }
    return Array.isArray(itemToConvert) ? itemToConvert : [itemToConvert];
  };

  // Determines the intrinsic type of a variable, returning a lowercase string representation.
  // This method relies on `Object.prototype.toString` for robust type detection,
  // which is more reliable than `typeof` for distinguishing between objects (e.g., Array vs. Object).
  const retrieveObjectType = (subject) => {
    const stringRepresentation = Object.prototype.toString.call(subject);
    // Extracts the type name from a string like "[object Array]".
    const typeMatch = stringRepresentation.match(/^\[object\s(.*)\]$/);
    return typeMatch ? typeMatch[1].toLowerCase() : 'undefined';
  };

  // Iterates over elements of an array or properties of an object, invoking a callback function for each.
  const processCollection = (collection, iterateeCallback) => {
    const collectionType = retrieveObjectType(collection);
    if (collectionType === 'object') {
      // Iterate over object properties.
      for (const propKey in collection) {
        // Ensure the property belongs directly to the object, not its prototype chain.
        if (Object.prototype.hasOwnProperty.call(collection, propKey)) {
          iterateeCallback(collection[propKey], propKey, collection);
        }
      }
    } else if (collectionType === 'array' || (typeof collection === 'object' && typeof collection.length === 'number')) {
      // Iterate over array-like structures.
      for (let idx = 0; idx < collection.length; idx++) {
        iterateeCallback(collection[idx], idx, collection);
      }
    }
    // No action for other primitive types.
  };

  // Performs a deep merge of multiple objects into a new, combined object.
  // Nested objects are also recursively merged.
  const deepCombineObjects = (...sourceObjects) => {
    const resultingObject = {};
    for (const currentInput of sourceObjects) {
      if (retrieveObjectType(currentInput) !== 'object' || currentInput === null) {
        continue; // Skip invalid inputs to avoid errors.
      }
      for (const propName in currentInput) {
        if (Object.prototype.hasOwnProperty.call(currentInput, propName)) {
          const incomingValue = currentInput[propName];
          const existingValue = resultingObject[propName];

          if (retrieveObjectType(incomingValue) === 'object' && retrieveObjectType(existingValue) === 'object') {
            // If both are objects, deep merge them.
            resultingObject[propName] = deepCombineObjects(existingValue, incomingValue);
          } else {
            // Otherwise, deep clone the incoming value.
            resultingObject[propName] = makeDeepCopy(incomingValue);
          }
        }
      }
    }
    return resultingObject;
  };

  // Creates a recursive, deep copy of an object or an array.
  // Primitive values (numbers, strings, booleans, null, undefined) are returned as is.
  const makeDeepCopy = (originalItem) => {
    const itemKind = retrieveObjectType(originalItem);
    let copiedItem;

    if (itemKind === 'object') {
      copiedItem = {};
      for (const prop in originalItem) {
        if (Object.prototype.hasOwnProperty.call(originalItem, prop)) {
          copiedItem[prop] = makeDeepCopy(originalItem[prop]);
        }
      }
    } else if (itemKind === 'array') {
      copiedItem = [];
      for (let i = 0; i < originalItem.length; i++) {
        copiedItem[i] = makeDeepCopy(originalItem[i]);
      }
    } else {
      // For primitives, functions, etc., return directly.
      return originalItem;
    }
    return copiedItem;
  };

  // Transforms an array of RGB color values into a hexadecimal string representation.
  // Can handle `[R, G, B]` or `[R, G, B, A]` where A=0 indicates 'transparent'.
  const rgbArrayToHexString = (inputRgbArray, outputAsArray = false) => {
    if (!Array.isArray(inputRgbArray) || inputRgbArray.length < 3) {
      console.error('Invalid RGB array provided. Expected at least 3 components.');
      return null;
    }
    // Special handling for transparent colors.
    if (inputRgbArray.length === 4 && inputRgbArray[3] === 0 && !outputAsArray) {
      return 'transparent';
    }

    const hexComponents = [];
    for (let i = 0; i < 3; i++) {
      // Ensure color component is within valid 0-255 range.
      const componentValue = Math.max(0, Math.min(255, parseInt(inputRgbArray[i], 10)));
      const hexPart = componentValue.toString(16);
      hexComponents.push((hexPart.length === 1) ? `0${hexPart}` : hexPart);
    }
    return outputAsArray ? hexComponents : `#${hexComponents.join('')}`;
  };

  // Recursively removes an HTML element and all its descendants from the DOM.
  // Attempts to clear attributes for older browser compatibility.
  const destroyDomElement = (elementToRemove) => {
    if (!elementToRemove || !elementToRemove.parentNode) return;

    // Iterate over children to ensure deep cleanup before removing parent.
    // Create a static array to prevent issues with live NodeList during removal.
    const childrenSnapshot = Array.from(elementToRemove.childNodes);
    for (const childNode of childrenSnapshot) {
      destroyDomElement(childNode); // Recursive call for each child.
    }

    // After all children are purged, remove the element itself.
    elementToRemove.parentNode.removeChild(elementToRemove);

    // For legacy IE, attempt to clear attributes.
    if (typeof elementToRemove.clearAttributes === 'function') {
      try {
        elementToRemove.clearAttributes();
      } catch (e) {
        // Suppress errors if clearAttributes is not fully functional or causes issues.
      }
    }
  };

  // Clears all child nodes from a given parent HTML element.
  const emptyElementChildren = (parentElement) => {
    if (!parentElement || !parentElement.childNodes) return;
    // Remove children efficiently by iterating while `firstChild` exists.
    while (parentElement.firstChild) {
      destroyDomElement(parentElement.firstChild); // Use the full destroy for thorough cleanup.
    }
  };

  // Attaches an event handler to a DOM element or object.
  // Supports `addEventListener` (modern) and `attachEvent` (legacy IE).
  const addEventHandler = (targetObject, eventName, handlerFn) => {
    if (targetObject.addEventListener) {
      targetObject.addEventListener(eventName, handlerFn, false);
    } else if (targetObject.attachEvent) {
      targetObject.attachEvent(`on${eventName}`, handlerFn);
    } else {
      // Fallback for very old environments, might overwrite existing handlers.
      targetObject[`on${eventName}`] = handlerFn;
    }
  };

  // Checks if a given HTML element possesses a specific CSS class.
  const checkClassPresence = (domElement, cssClass) => {
    if (!domElement || !domElement.className) return false;
    // Prefer `classList` API for modern browsers.
    if (domElement.classList) {
      return domElement.classList.contains(cssClass);
    }
    // Fallback using string manipulation for older browsers.
    const currentClasses = ` ${domElement.className} `;
    return currentClasses.indexOf(` ${cssClass} `) > -1;
  };

  // Adds a CSS class to an HTML element if it's not already present.
  const applyCssClass = (domElement, cssClass) => {
    if (!domElement || !cssClass) return;
    if (domElement.classList) {
      domElement.classList.add(cssClass);
    } else if (!checkClassPresence(domElement, cssClass)) {
      domElement.className = (domElement.className + ' ' + cssClass).trim();
    }
  };

  // Removes a specified CSS class from an HTML element.
  const removeCssClass = (domElement, cssClass) => {
    if (!domElement || !cssClass) return;
    if (domElement.classList) {
      domElement.classList.remove(cssClass);
    } else {
      // Use regex to remove the class, ensuring it's a whole word.
      domElement.className = domElement.className.replace(new RegExp(`(^|\\s)${cssClass}(?:\\s|$)`, 'g'), '$1').trim();
    }
  };

  // Fetches a DOM element by its unique identifier.
  const getElementByIdentity = (elementIdentifier) => {
    if (typeof document === 'undefined' || !document.getElementById) {
      console.warn('DOM environment not detected or `getElementById` is unavailable.');
      return null;
    }
    return document.getElementById(elementIdentifier);
  };

  // --- Flexible Object Construction System ---

  // A factory for generating constructor functions that support inheritance and mixins.
  const ObjectFactory = function (definitionProps = {}) {
    // The actual constructor that will be returned, used to create new instances.
    const GeneratedConstructor = function (...args) {
      // This flag prevents the `initialize` method from running when creating
      // a temporary instance for prototype chain setup during inheritance.
      if (ObjectFactory.isPrototyping) {
        return this;
      }
      this.constructor = GeneratedConstructor; // Ensure `constructor` points to the correct function.
      // Call the `initialize` method if it exists, passing all arguments.
      // The return value of `initialize` becomes the instance if it's an object.
      return (this.initialize) ? this.initialize.apply(this, args) : this;
    };

    // Process special mutator properties (like 'Extends' or 'Implements')
    // before assigning the remaining properties to the prototype.
    for (const mutatorKey in ObjectFactory.MutatorProcessors) {
      if (definitionProps[mutatorKey]) {
        // Mutators can modify the prototype properties or the inheritance chain.
        definitionProps = ObjectFactory.MutatorProcessors[mutatorKey](definitionProps, definitionProps[mutatorKey]);
        delete definitionProps[mutatorKey]; // Remove the mutator key from the final prototype.
      }
    }

    // Copy static methods from the base ObjectFactory (e.g., `mixinMethod`) to the new constructor.
    transferProps(GeneratedConstructor, this);
    GeneratedConstructor.constructor = ObjectFactory; // Link back to the factory.
    GeneratedConstructor.prototype = definitionProps; // Assign the processed properties as the prototype.

    return GeneratedConstructor;
  };

  // A flag used internally during inheritance setup to skip constructor initialization.
  ObjectFactory.isPrototyping = false;

  // Defines handlers for special keywords in class definitions (e.g., 'Extends', 'Implements').
  ObjectFactory.MutatorProcessors = {
    // Handles single inheritance: establishes a prototype chain to a parent constructor.
    Extends: (currentDefinition, ParentConstructor) => {
      if (typeof ParentConstructor !== 'function') {
        throw new TypeError('Parent constructor for extension must be a function.');
      }
      ObjectFactory.isPrototyping = true; // Temporarily enable prototyping flag.
      const parentInstance = new ParentConstructor(); // Create an instance without calling its `initialize`.
      delete parentInstance.parent; // Clean up any 'parent' property from the parent's prototype.
      ObjectFactory.isPrototyping = false;

      // Merge parent's prototype properties into the current definition.
      // This forms the basis of the new prototype, allowing methods to be overridden.
      return ObjectFactory.mixinMethod(parentInstance, currentDefinition);
    },

    // Handles mixing in properties from multiple objects or constructors.
    Implements: (currentDefinition, mixinSources) => {
      processCollection(standardizeToArray(mixinSources), (source) => {
        if (!source) return;
        ObjectFactory.isPrototyping = true; // Prevent mixin constructors from initializing.
        // If the mixin is a function, instantiate it to get its prototype properties.
        const mixinObject = (typeof source === 'function') ? new source() : source;
        ObjectFactory.isPrototyping = false;
        transferProps(currentDefinition, mixinObject); // Shallow copy properties.
      });
      return currentDefinition;
    }
  };

  transferProps(ObjectFactory, {
    // Merges properties from a source object into a target, specifically handling method overriding
    // to enable a `this.parent()` call mechanism.
    mixinMethod: (targetObject, sourceProperties) => {
      // This is a simplified approach to `this.parent()` compared to the original MooTools
      // which used `arguments.callee.caller.__parent` (deprecated and strict mode incompatible).
      // We aim for functional equivalence for common `this.parent()` scenarios.
      for (const propIdentifier in sourceProperties) {
        if (Object.prototype.hasOwnProperty.call(sourceProperties, propIdentifier)) {
          const newPropValue = sourceProperties[propIdentifier];
          const currentPropValue = targetObject[propIdentifier];
          const newPropType = retrieveObjectType(newPropValue);

          if (currentPropValue && newPropType === 'function') {
            // If a method already exists and the new property is also a function,
            // wrap it to enable `this.parent()` calls.
            if (newPropValue !== currentPropValue) {
              ObjectFactory.wrapMethodWithParentSupport(targetObject, propIdentifier, newPropValue, currentPropValue);
            }
          } else if (newPropType === 'object' && retrieveObjectType(currentPropValue) === 'object') {
            // Deep merge for nested objects.
            targetObject[propIdentifier] = deepCombineObjects(currentPropValue, newPropValue);
          } else {
            // Direct assignment for primitives, arrays, or non-object types.
            targetObject[propIdentifier] = newPropValue;
          }
        }
      }
      return targetObject;
    },

    // Wraps a method to allow calling the overridden (parent) method via `this.parent()`.
    wrapMethodWithParentSupport: (containingObject, methodName, childMethod, parentMethod) => {
      const wrappedFunction = function (...methodArgs) {
        // Temporarily store the original `this.parent` reference.
        const originalParentRef = this.parent;
        // Set `this.parent` to the method being overridden, bound to the current instance.
        // This makes `this.parent()` inside `childMethod` correctly invoke `parentMethod`.
        this.parent = parentMethod.bind(this);

        // Execute the child method.
        const methodResult = childMethod.apply(this, methodArgs);

        // Restore the original `this.parent` reference.
        this.parent = originalParentRef;
        return methodResult;
      };
      containingObject[methodName] = wrappedFunction;
    }
  });

  // Allows adding more properties to the prototype of an already defined ObjectFactory instance.
  ObjectFactory.prototype.extendPrototype = function (...additionalProperties) {
    const protoToExtend = this.prototype;
    processCollection(additionalProperties, (propsToAdd) => {
      ObjectFactory.mixinMethod(protoToExtend, propsToAdd);
    });
    return this;
  };

  // --- Graph Structure Processing Module ---

  // Provides a collection of methods for manipulating JSON-based tree or graph data structures.
  const GraphProcessor = {

    // Truncates a tree structure by removing all nodes that exceed a specified maximum depth.
    trimGraphByDepth: function (rootNode, maximumDepth) {
      if (!rootNode || maximumDepth < 0) return; // Basic validation.

      // Recursive helper function for depth-first traversal.
      const processCurrentNode = (node, currentLevel) => {
        if (!node || !Array.isArray(node.children)) {
          return; // Node is invalid or has no children to process.
        }

        if (currentLevel >= maximumDepth) {
          // If the current level meets or exceeds the maximum, clear its children.
          node.children.length = 0; // Efficiently clears the array.
          return;
        }

        // Recursively process children, iterating backwards for safe modification.
        for (let i = node.children.length - 1; i >= 0; i--) {
          processCurrentNode(node.children[i], currentLevel + 1);
        }
      };
      processCurrentNode(rootNode, 0); // Begin traversal from the root at depth 0.
    },

    // Searches for and returns the immediate parent node of a child node identified by its ID.
    locateParentNode: function (graphRoot, targetChildId) {
      if (!graphRoot || graphRoot.id === targetChildId) {
        return null; // Root cannot be its own parent, or root is the target.
      }

      const childNodes = graphRoot.children;
      if (!Array.isArray(childNodes) || childNodes.length === 0) {
        return null; // No children to search through.
      }

      for (const child of childNodes) {
        if (child.id === targetChildId) {
          return graphRoot; // Found the direct parent.
        }
        // Recursively search in the child's subtree.
        const foundAncestor = this.locateParentNode(child, targetChildId);
        if (foundAncestor !== null) {
          return foundAncestor; // Parent found in a deeper branch.
        }
      }
      return null; // Target child ID not found in this branch.
    },

    // Extracts and returns a specific subtree, identified by its root node's ID.
    fetchSubtreeById: function (graphRoot, identifier) {
      if (!graphRoot) return null;
      if (graphRoot.id === identifier) return graphRoot;

      const childrenOfRoot = graphRoot.children;
      if (!Array.isArray(childrenOfRoot)) return null;

      for (const childNode of childrenOfRoot) {
        const result = this.fetchSubtreeById(childNode, identifier);
        if (result !== null) {
          return result;
        }
      }
      return null; // No matching subtree found.
    },

    // Collects all leaf nodes within a specified depth limit from a starting node.
    collectAllLeafNodes: function (startingNode, maxScanDepth = Infinity) {
      const foundLeafNodes = [];

      // Internal recursive function for traversal.
      const scanForLeaves = (currentNode, currentDepth) => {
        if (!currentNode || currentDepth >= maxScanDepth) {
          return; // Stop if node is invalid or depth limit reached.
        }

        // A node is considered a leaf if it has no children or an empty children array.
        const isALeaf = !Array.isArray(currentNode.children) || currentNode.children.length === 0;

        if (isALeaf) {
          foundLeafNodes.push({
            nodeElement: currentNode,
            nodeDepth: currentDepth
          });
        } else {
          // Continue scanning for leaves in children.
          for (const child of currentNode.children) {
            scanForLeaves(child, currentDepth + 1);
          }
        }
      };
      scanForLeaves(startingNode, 0); // Initiate scan from the starting node at level 0.
      return foundLeafNodes;
    },

    // Traverses tree nodes, applying a callback to nodes whose relative depth falls within a specified range.
    visitNodesByLevel: function (node, startingRelativeLevel, endingRelativeLevel, visitorCallback) {
      if (!node || startingRelativeLevel > endingRelativeLevel) {
        return; // Invalid input or range.
      }

      // Execute the callback for the current node if its level is within the bounds.
      if (startingRelativeLevel <= endingRelativeLevel) {
        visitorCallback(node, startingRelativeLevel);
      }

      // Recursively process children if deeper levels are still within the allowed range.
      const nodeChildren = node.children;
      if (Array.isArray(nodeChildren) && nodeChildren.length > 0) {
        for (const childEntry of nodeChildren) {
          this.visitNodesByLevel(childEntry, startingRelativeLevel + 1, endingRelativeLevel, visitorCallback);
        }
      }
    },

    // A comprehensive tree iterator that applies a callback function to every node in the tree.
    traverseEntireGraph: function (rootNode, nodeVisitor) {
      // Leverages `visitNodesByLevel` with an effectively infinite depth.
      this.visitNodesByLevel(rootNode, 0, Infinity, nodeVisitor);
    },

    // Asynchronously loads and appends new subtrees to existing leaf nodes,
    // using a provided controller to handle data requests.
    loadAndAttachSubtrees: function (parentTree, dataProvider) {
      if (!parentTree || !dataProvider || typeof dataProvider.requestData !== 'function') {
        console.warn('Invalid parent tree or data provider for `loadAndAttachSubtrees`.');
        if (typeof dataProvider.onAllRequestsComplete === 'function') {
          dataProvider.onAllRequestsComplete(); // Ensure completion callback is always triggered.
        }
        return;
      }

      const maxAllowedLevel = dataProvider.levelsToFetch || Infinity;
      const currentLeafElements = this.collectAllLeafNodes(parentTree, maxAllowedLevel);
      const totalLeafCount = currentLeafElements.length;
      const nodeReferenceMap = new Map(); // Maps node IDs to their actual object references.
      let completedRequestCount = 0;

      if (totalLeafCount === 0) {
        if (typeof dataProvider.onAllRequestsComplete === 'function') {
          dataProvider.onAllRequestsComplete();
        }
        return;
      }

      // Callback executed upon successful data retrieval for a single node.
      const handleDataFetchSuccess = (nodeId, fetchedSubtreeData) => {
        const targetNode = nodeReferenceMap.get(nodeId);
        if (targetNode && fetchedSubtreeData && Array.isArray(fetchedSubtreeData.children)) {
          targetNode.children = fetchedSubtreeData.children; // Attach the newly fetched children.
        } else if (targetNode) {
          // If no valid children are returned, ensure the array exists but is empty.
          targetNode.children = [];
        }

        completedRequestCount++;
        if (completedRequestCount === totalLeafCount) {
          if (typeof dataProvider.onAllRequestsComplete === 'function') {
            dataProvider.onAllRequestsComplete(); // All data requests have been resolved.
          }
        }
      };

      // Initiate data requests for each identified leaf node.
      for (const leafMetadata of currentLeafElements) {
        const leafNode = leafMetadata.nodeElement;
        nodeReferenceMap.set(leafNode.id, leafNode); // Store reference for later update.
        dataProvider.requestData(leafNode.id, leafMetadata.nodeDepth, {
          onDataReceived: handleDataFetchSuccess // Renamed from onComplete for clarity.
        });
      }
    }
  };

  // Export the core utilities and the object construction system to the global scope.
  // In a browser environment, `this` typically refers to the `window` object.
  this.toolkit = {
    noOperation,
    transferProps,
    ensureFunctionWrapper,
    getHighResTime,
    standardizeToArray,
    retrieveObjectType,
    processCollection,
    deepCombineObjects,
    makeDeepCopy,
    rgbArrayToHexString,
    destroyDomElement,
    emptyElementChildren,
    addEventHandler,
    checkClassPresence,
    applyCssClass,
    removeCssClass,
    getElementByIdentity
  };

  this.ObjectFactory = ObjectFactory;
  this.GraphProcessor = GraphProcessor;

  // --- Placeholder for a Visual Rendering Module ---
  /*
   * Module: VisualRenderer
   *
   * Provides foundational capabilities for drawing and interacting with graphical elements
   * on a canvas or similar display surface.
   *
   * Utilized in higher-level components such as:
   *
   * <DataVisualization>, <HierarchicalDisplay>, <ForceDirectedGraph>
   */
  /*
   ObjectFactory: VisualRenderer

    A base class for creating interactive graphical user interface components.
    This factory can be extended to develop specialized rendering elements.
  */

})();