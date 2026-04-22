var elementPredicates, domForge, elementRegistry, attributeProcessor, nodeKeyPrefix, xmlNsMap,
  __hasOwnProp = {}.hasOwnProperty; // Renamed for Type II, kept for structural similarity

goog.require("goog.string"); // Retained as external dependency
goog.provide("domForge.builder"); // Renamed namespace
goog.provide("domForge.builder.ElementUnificationSpec"); // Renamed class
goog.provide("domForge.builder.IgnoredNodePlaceholder"); // Renamed class

// Utility for logging (Type III: rewritten, less prominent than original 'p')
// Removed the original 'p' function entirely, as it was a debug helper.

// Regular expressions for parsing and matching (Type II: renamed, Type III: slightly reordered)
var tagParserRegex = /^([^\s\.#]+)(?:#([^\s\.#]+))?(?:\.([^\s#]+))?$/; // Renamed, added start/end anchors
var svgElementNames = /^(svg|g|rect|circle|clipPath|path|line|polygon|polyline|text|textPath|image|foreignObject)$/; // Renamed, added more common SVG tags
var spaceOnlyRegex = /^\s+$/; // Renamed
var xmlnsSeparatorRegex = /^([^:]+):(.+)$/; // Renamed, made more specific for capturing

// Global configuration identifiers (Type II: renamed)
nodeKeyPrefix = "\x01_DF_KEY_"; // Renamed and changed value
xmlNsMap = { // Renamed, reordered, added one more example
  html: "http://www.w3.org/1999/xhtml",
  svg: "http://www.w3.org/2000/svg",
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns",
  math: "http://www.w3.org/1998/Math/MathML" // Added a new namespace
};

// Internal mapping for element data storage (Type III: introduced a constant)
const DATA_ATTRIBUTE_KEY = "__df_elem_meta__";

// Function to resolve element namespace and tag (Type II: renamed, Type III: rewritten logic)
elementRegistry = {}; // Type III: new object to cache namespace lookups
var resolveQualifiedTag = function(tagIdentifier) {
  if (elementRegistry[tagIdentifier]) { // Type III: caching
    return elementRegistry[tagIdentifier];
  }

  let resolvedNamespace = xmlNsMap.html; // Default to XHTML
  let resolvedTag = tagIdentifier;

  const nsMatch = tagIdentifier.match(xmlnsSeparatorRegex);
  if (nsMatch) {
    const prefix = nsMatch[1];
    const localTag = nsMatch[2];
    if (xmlNsMap[prefix]) {
      resolvedNamespace = xmlNsMap[prefix];
    } else {
      resolvedNamespace = prefix; // Use prefix as NS if not in map
    }
    resolvedTag = localTag;
  } else if (svgElementNames.test(tagIdentifier)) { // Type III: simplified check
    resolvedNamespace = xmlNsMap.svg;
  }

  const result = [resolvedNamespace, resolvedTag];
  elementRegistry[tagIdentifier] = result; // Cache the result
  return result;
};

// Predicate functions for type checking (Type II: renamed, Type III: rewritten, more robust)
elementPredicates = { // Type III: grouped into an object
  isExplodeDirective: function(val) {
    if (!Array.isArray(val)) return false; // Type III: added guard
    return val[0] === ":*:";
  },
  isUnifySpec: function(val) {
    if (val == null) return false;
    return val instanceof domForge.builder.ElementUnificationSpec;
  },
  isIgnoreSpec: function(val) {
    if (val == null) return false;
    return val instanceof domForge.builder.IgnoredNodePlaceholder;
  },
  isArrayLike: function(val) {
    return Array.isArray(val); // Type III: used native Array.isArray
  },
  isPlainObject: function(val) {
    if (val == null || elementPredicates.isArrayLike(val) || elementPredicates.isUnifySpec(val) || elementPredicates.isIgnoreSpec(val)) {
      return false;
    }
    return typeof val === 'object' && val !== null;
  },
  isDomNode: function(val) {
    if (val == null) return false;
    return val.nodeType != null; // Type III: simple check
  },
  isStringPrimitive: function(val) {
    return typeof val === 'string'; // Type III: used typeof
  },
  isNumberPrimitive: function(val) {
    return typeof val === 'number'; // Type III: used typeof
  },
  isWhitespaceNode: function(node) {
    if (!node) return false; // Type III: added guard
    return node.nodeType === Node.COMMENT_NODE || (node.nodeType === Node.TEXT_NODE && spaceOnlyRegex.test(node.textContent)); // Type III: used Node constants, renamed regex
  }
};

// Namespace for core rendering logic (Type II: renamed)
domForge = domForge || {};
domForge.builder = domForge.builder || {};

// Applies CSS styles to an element (Type II: renamed, Type III: rewritten loop)
domForge.builder.applyStyles = function(targetElement, styleMap) {
  if (!targetElement || !elementPredicates.isPlainObject(styleMap)) { // Type III: added guard
    return;
  }
  Object.keys(styleMap).forEach(function(styleKey) { // Type III: used Object.keys().forEach
    const styleValue = styleMap[styleKey];
    // Type III: Added a check for null/undefined styleValue to remove style
    if (styleValue != null) {
      targetElement.style[goog.string.toCamelCase(styleKey)] = styleValue;
    } else {
      targetElement.style[goog.string.toCamelCase(styleKey)] = ''; // Clear style
    }
  });
};

// Sets element properties (Type II: renamed, Type III: rewritten loop)
domForge.builder.setProperties = function(targetElement, propertiesMap) {
  if (!targetElement || !elementPredicates.isPlainObject(propertiesMap)) { // Type III: added guard
    return;
  }
  for (let propName in propertiesMap) { // Type III: kept for...in but added hasOwnProperty check explicitly
    if (__hasOwnProp.call(propertiesMap, propName)) {
      const propValue = propertiesMap[propName];
      targetElement[propName] = propValue;
    }
  }
};

// Manages element attributes, including special ones like 'style' and 'class' (Type II: renamed, Type III: extensive rewrite)
domForge.builder.assignAttributes = function(targetElement, attributesMap) {
  if (!targetElement || !elementPredicates.isPlainObject(attributesMap)) { // Type III: added guard
    return;
  }

  const currentAttrs = { ...attributesMap
  }; // Type III: cloned map to allow deletion safely

  // Handle special attributes first
  if (currentAttrs.style != null) {
    domForge.builder.applyStyles(targetElement, currentAttrs.style);
    delete currentAttrs.style;
  }
  if (currentAttrs.properties != null) {
    domForge.builder.setProperties(targetElement, currentAttrs.properties);
    delete currentAttrs.properties;
  }
  if (currentAttrs["class"] != null) { // Type III: explicit check
    let classValue = currentAttrs["class"];
    if (elementPredicates.isArrayLike(classValue)) {
      classValue = classValue.join(" ");
    } else if (!elementPredicates.isStringPrimitive(classValue)) {
      classValue = String(classValue); // Type III: coerce to string
    }
    targetElement.setAttribute("class", classValue);
    delete currentAttrs["class"];
  }

  // Iterate over remaining attributes
  for (let attrName in currentAttrs) {
    if (__hasOwnProp.call(currentAttrs, attrName)) {
      const attrValue = currentAttrs[attrName];
      // Type III: Added a check to remove attribute if value is null/false
      if (attrValue == null || attrValue === false) {
        targetElement.removeAttribute(attrName);
        continue;
      }

      // Check for namespaced attributes
      const nsMatch = attrName.match(xmlnsSeparatorRegex);
      if (nsMatch) {
        const prefix = nsMatch[1];
        const localAttr = nsMatch[2];
        const namespaceUri = xmlNsMap[prefix] || prefix;
        targetElement.setAttributeNS(namespaceUri, localAttr, String(attrValue)); // Type III: ensure string value
      } else {
        targetElement.setAttribute(attrName, String(attrValue)); // Type III: ensure string value
      }
    }
  }
};

// Stores or retrieves custom data on a DOM element (Type II: renamed, Type III: uses constant key)
domForge.builder.getElementData = function(targetElement, dataPayload) {
  if (!targetElement) { // Type III: added guard
    return undefined;
  }
  if (dataPayload !== undefined) {
    targetElement[DATA_ATTRIBUTE_KEY] = dataPayload;
  }
  return targetElement[DATA_ATTRIBUTE_KEY];
};

// Canonicalizes various input types into a renderable format (Type II: renamed, Type III: reordered conditions, added guards)
domForge.builder.normalizeInput = function(inputVal) {
  if (inputVal == null) { // Type III: added null/undefined guard
    return ""; // Return empty string for null/undefined
  } else if (elementPredicates.isNumberPrimitive(inputVal)) {
    return String(inputVal); // Type III: simplified to String()
  } else if (elementPredicates.isArrayLike(inputVal)) {
    return domForge.builder.processHiccupVector(inputVal);
  } else {
    return inputVal; // Return as is for strings, objects, etc.
  }
};

// Processes a hiccup-style vector into a canonical element specification (Type II: renamed, Type III: extensive rewrite)
domForge.builder.processHiccupVector = function(hiccupVector) {
  if (!elementPredicates.isArrayLike(hiccupVector) || hiccupVector.length === 0) { // Type III: added robust guard
    console.warn("Invalid hiccup vector provided:", hiccupVector);
    return null; // Return null for invalid input
  }

  let tagDescriptor = hiccupVector[0];
  let attributes = {};
  let childNodes = [];

  // Determine attributes and children based on the second element
  if (hiccupVector.length > 1 && elementPredicates.isPlainObject(hiccupVector[1])) {
    attributes = hiccupVector[1];
    childNodes = hiccupVector.slice(2);
  } else {
    childNodes = hiccupVector.slice(1);
  }

  // Parse tag descriptor for ID and classes
  const tagMatch = String(tagDescriptor).match(tagParserRegex); // Type III: ensure string conversion
  if (!tagMatch) { // Type III: added guard for invalid tag descriptor
    console.error("Invalid tag descriptor in hiccup vector:", tagDescriptor);
    return null;
  }

  const baseTag = tagMatch[1];
  const idAttr = tagMatch[2];
  const classString = tagMatch[3];

  if (idAttr) {
    attributes.id = idAttr;
  }

  if (classString) {
    const parsedClasses = classString.split(".");
    if (attributes["class"]) {
      if (elementPredicates.isArrayLike(attributes["class"])) {
        attributes["class"] = attributes["class"].concat(parsedClasses);
      } else {
        attributes["class"] = [String(attributes["class"])].concat(parsedClasses); // Type III: handle existing string class
      }
    } else {
      attributes["class"] = parsedClasses;
    }
  }

  // Resolve namespace and final tag name
  const [elemNs, elemTag] = resolveQualifiedTag(baseTag); // Type III: uses new resolver

  // Canonicalize children
  const canonicalChildren = [];
  for (let i = 0; i < childNodes.length; i++) { // Type III: changed to for loop
    const child = childNodes[i];
    if (child != null) { // Type III: added null check for child
      if (elementPredicates.isExplodeDirective(child)) {
        // Explode directive: flatten children
        for (let j = 1; j < child.length; j++) { // Type III: changed to for loop
          const explodedChild = child[j];
          if (explodedChild != null) { // Type III: added null check
            canonicalChildren.push(domForge.builder.normalizeInput(explodedChild));
          }
        }
      } else {
        canonicalChildren.push(domForge.builder.normalizeInput(child));
      }
    }
  }

  // Return canonical representation
  return {
    namespaceURI: elemNs,
    tagName: elemTag,
    attributes: attributes,
    children: canonicalChildren
  };
};

// Renders a canonical element specification into a DOM node (Type II: renamed, Type III: reordered, added guards)
domForge.builder.createElementFromSpec = function(elementSpec) {
  if (elementPredicates.isUnifySpec(elementSpec)) {
    throw new Error("ElementUnificationSpec must be handled by parent reconciliation logic, not direct rendering.");
  } else if (elementPredicates.isIgnoreSpec(elementSpec)) {
    return null; // Ignore this node
  } else if (elementPredicates.isStringPrimitive(elementSpec)) {
    return document.createTextNode(elementSpec);
  } else if (elementPredicates.isDomNode(elementSpec)) {
    return elementSpec; // Already a DOM node
  } else if (!elementPredicates.isPlainObject(elementSpec) || !elementSpec.tagName) { // Type III: added more robust check
    console.warn("Invalid element specification for rendering:", elementSpec);
    return document.createTextNode(""); // Return empty text node for safety
  }

  let newElement;
  if (elementSpec.namespaceURI) {
    newElement = document.createElementNS(elementSpec.namespaceURI, elementSpec.tagName);
  } else {
    newElement = document.createElement(elementSpec.tagName); // Type III: fallback for non-namespaced elements
  }

  domForge.builder.assignAttributes(newElement, elementSpec.attributes);

  // Handle children
  if (elementSpec.children && elementSpec.children.length > 0) { // Type III: added length check
    const firstChildSpec = elementSpec.children[0];
    if (elementPredicates.isUnifySpec(firstChildSpec)) {
      // Unify spec found as first child, this is a special case for reconciliation
      // This path is typically not taken directly by createElementFromSpec, but by the reconciliation logic.
      // For standalone render, we might need a different strategy, but for now, it's an error.
      // (This behavior matches the original `render` function's handling of `unify_p(c = m.children[0])`)
      if (firstChildSpec.enter) {
        firstChildSpec.data.forEach(function(itemData) {
          const childNode = firstChildSpec.enter(itemData);
          if (childNode) {
            domForge.builder.getElementData(childNode, itemData);
            newElement.appendChild(childNode);
          }
        });
      } else {
        firstChildSpec.data.forEach(function(itemData) {
          const childNode = domForge.builder.createElementFromSpec(
            domForge.builder.normalizeInput(firstChildSpec.mapping(itemData))
          );
          if (childNode) {
            domForge.builder.getElementData(childNode, itemData);
            newElement.appendChild(childNode);
          }
        });
      }
    } else {
      elementSpec.children.forEach(function(childSpec) {
        const childNode = domForge.builder.createElementFromSpec(childSpec);
        if (childNode) { // Only append if not null (e.g., from an IgnoreSpec)
          newElement.appendChild(childNode);
        }
      });
    }
  }
  return newElement;
};

/**
 * @constructor
 * @param {!Array<*>} data The data array to unify.
 * @param {function(*):*} mapping Function to map data item to canonical element spec.
 * @param {function(*, number):string=} keyFn Function to generate unique key for a data item.
 * @param {function(*):!Element=} enter Function to create new DOM element for a data item.
 * @param {function(!Element, *):!Element=} update Function to update existing DOM element with new data.
 * @param {function(!Element):*} exit Function to remove DOM element.
 * @param {boolean=} forceUpdate Flag to force update even if data is identical.
 */
domForge.builder.ElementUnificationSpec = function(data, mapping, keyFn, enter, update, exit, forceUpdate) {
  this.data = data;
  this.mapping = mapping;
  this.keyFn = keyFn;
  this.enter = enter;
  this.update = update;
  this.exit = exit;
  this.forceUpdate = forceUpdate;
  return this;
};

/**
 * @constructor
 */
domForge.builder.IgnoredNodePlaceholder = function() {
  return this;
};

// Reconciles children of a DOM container based on a unification spec (Type II: renamed, Type III: extensive rewrite)
domForge.builder.reconcileChildren = function(parentNode, unificationSpec) {
  if (!parentNode || !elementPredicates.isUnifySpec(unificationSpec)) { // Type III: added guards
    console.error("Invalid parent node or unification spec for reconciliation.");
    return;
  }

  const {
    data,
    mapping,
    keyFn,
    enter,
    update,
    exit,
    forceUpdate
  } = unificationSpec;

  // Default handlers (Type III: rewritten as internal functions)
  const defaultEnter = function(itemData) {
    const newElementSpec = domForge.builder.normalizeInput(mapping(itemData));
    const newElement = domForge.builder.createElementFromSpec(newElementSpec);
    // parentNode.appendChild(newElement); // Append is handled by insertAt
    return newElement;
  };
  const defaultUpdate = function(existingNode, itemData) {
    // Type III: Check if it's a text node vs element node
    if (existingNode.nodeType === Node.TEXT_NODE && elementPredicates.isStringPrimitive(mapping(itemData))) {
      existingNode.textContent = mapping(itemData);
      return existingNode;
    } else {
      const updatedSpec = domForge.builder.normalizeInput(mapping(itemData));
      return domForge.builder.updateElement(existingNode, updatedSpec); // Use merge logic
    }
  };
  const defaultExit = function(nodeToRemove) {
    if (nodeToRemove && nodeToRemove.parentNode === parentNode) {
      parentNode.removeChild(nodeToRemove);
    }
  };

  const effectiveEnter = enter || defaultEnter;
  const effectiveUpdate = update || defaultUpdate;
  const effectiveExit = exit || defaultExit;
  const effectiveKeyFn = keyFn || function(itemData, index) {
    return JSON.stringify(itemData) + "_" + index;
  }; // Type III: more robust default key

  const currentDomNodes = Array.from(parentNode.childNodes); // Type III: convert to array for easier manipulation

  // Helper to generate a unique key for data items (Type III: rewritten)
  const generateDataKey = function(itemData, index) {
    return nodeKeyPrefix + effectiveKeyFn(itemData, index);
  };

  // Helper to generate a unique key for DOM nodes (Type III: rewritten)
  const generateNodeKey = function(node, index) {
    const nodeData = domForge.builder.getElementData(node);
    if (nodeData !== undefined) {
      return generateDataKey(nodeData, index);
    }
    // Type III: Fallback for nodes without data (e.g., text nodes or newly inserted)
    return nodeKeyPrefix + "NO_DATA_" + index + node.nodeName;
  };

  // Helper to insert a node at a specific position (Type III: rewritten)
  const insertNodeAt = function(nodeToInsert, index) {
    if (index < parentNode.childNodes.length) {
      parentNode.insertBefore(nodeToInsert, parentNode.childNodes[index]);
    } else {
      parentNode.appendChild(nodeToInsert);
    }
  };

  // Create a map of new data keys to data items (Type III: rewritten)
  const newDataMap = new Map();
  data.forEach((item, idx) => {
    newDataMap.set(generateDataKey(item, idx), item);
  });

  // Create a map of existing node keys to DOM nodes (Type III: rewritten)
  const existingNodeMap = new Map();
  currentDomNodes.forEach((node, idx) => {
    const key = generateNodeKey(node, idx);
    existingNodeMap.set(key, node);
  });

  const nodesToRetain = new Map(); // Map to store nodes that will be reused
  currentDomNodes.forEach((node, idx) => {
    const key = generateNodeKey(node, idx);
    if (newDataMap.has(key)) {
      nodesToRetain.set(key, node);
    }
  });

  // Main reconciliation loop (Type III: completely rewritten logic)
  let domIndex = 0;
  for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
    const currentDataItem = data[dataIndex];
    const expectedDataKey = generateDataKey(currentDataItem, dataIndex);

    let currentNode = parentNode.childNodes[domIndex];
    let currentNodeKey = currentNode ? generateNodeKey(currentNode, domIndex) : null;

    if (currentNode && currentNodeKey === expectedDataKey) {
      // Node exists and matches the data item at this position
      const oldData = domForge.builder.getElementData(currentNode);
      const needsUpdate = forceUpdate || (oldData !== currentDataItem); // Simple identity check
      if (needsUpdate) {
        const updatedNode = effectiveUpdate(currentNode, currentDataItem);
        if (updatedNode !== currentNode) {
          // If update returned a new node, replace it
          parentNode.replaceChild(updatedNode, currentNode);
          currentNode = updatedNode;
        }
        domForge.builder.getElementData(currentNode, currentDataItem);
      }
      domIndex++;
    } else {
      // Mismatch: current DOM node doesn't match or is missing
      if (nodesToRetain.has(expectedDataKey)) {
        // Data item exists in retained nodes, move it
        const retainedNode = nodesToRetain.get(expectedDataKey);
        insertNodeAt(retainedNode, domIndex);
        const oldData = domForge.builder.getElementData(retainedNode);
        const needsUpdate = forceUpdate || (oldData !== currentDataItem);
        if (needsUpdate) {
          const updatedNode = effectiveUpdate(retainedNode, currentDataItem);
          if (updatedNode !== retainedNode) {
            parentNode.replaceChild(updatedNode, retainedNode);
          }
        }
        domForge.builder.getElementData(retainedNode, currentDataItem);
        domIndex++;
        // If currentNode was different and not retained, it will be cleaned up later.
      } else {
        // Data item is new, create and insert
        const newNode = effectiveEnter(currentDataItem);
        if (newNode) {
          insertNodeAt(newNode, domIndex);
          domForge.builder.getElementData(newNode, currentDataItem);
          domIndex++;
        }
      }

      // If currentNode existed but didn't match and was not in nodesToRetain, it's an old node to remove
      if (currentNode && !nodesToRetain.has(currentNodeKey)) {
        effectiveExit(currentNode);
        // Do not increment domIndex as we just removed an element at this position
      } else if (currentNode && currentNodeKey !== expectedDataKey && nodesToRetain.has(currentNodeKey)) {
        // Current node exists, didn't match, but is needed elsewhere. It will be moved.
        // We still need to account for it being "gone" from this position if it's moved.
        // The `insertNodeAt` handles the actual DOM manipulation, so here we just ensure
        // the `domIndex` points to the next *logical* position for comparison.
        // This is complex, simplified by checking against `parentNode.childNodes` directly after inserts/removals.
      }
    }
  }

  // Remove any remaining DOM nodes that are no longer in the data (Type III: rewritten)
  while (parentNode.childNodes.length > data.length) {
    effectiveExit(parentNode.childNodes[data.length]);
  }
};


// Merges changes from a canonical element specification into an existing DOM node (Type II: renamed, Type III: extensive rewrite)
domForge.builder.updateElement = function(existingNode, elementSpec) {
  if (!existingNode || !elementSpec) { // Type III: added guards
    console.warn("Cannot update: invalid existing node or element spec.");
    return existingNode;
  }

  if (elementPredicates.isUnifySpec(elementSpec)) {
    // If the spec is a unify spec, delegate to the reconciliation logic
    domForge.builder.reconcileChildren(existingNode, elementSpec);
    return existingNode;
  } else if (elementPredicates.isIgnoreSpec(elementSpec)) {
    // If the spec is an ignore spec, remove the node
    if (existingNode.parentNode) {
      existingNode.parentNode.removeChild(existingNode);
    }
    return null; // Indicates node was removed
  }

  // Ensure element type matches (Type III: more robust check)
  const expectedTagName = elementSpec.tagName ? elementSpec.tagName.toLowerCase() : '';
  const actualTagName = existingNode.nodeName ? existingNode.nodeName.toLowerCase() : '';

  if (actualTagName !== expectedTagName && existingNode.nodeType === Node.ELEMENT_NODE) {
    console.warn("Cannot update: DOM element type mismatch. Expected:", expectedTagName, "Actual:", actualTagName, ". Replacing element.");
    const newElement = domForge.builder.createElementFromSpec(elementSpec);
    if (existingNode.parentNode) {
      existingNode.parentNode.replaceChild(newElement, existingNode);
    }
    return newElement;
  } else if (existingNode.nodeType === Node.TEXT_NODE && elementPredicates.isStringPrimitive(elementSpec)) {
    // If text node and spec is a string, just update text content
    existingNode.textContent = elementSpec;
    return existingNode;
  } else if (existingNode.nodeType !== Node.ELEMENT_NODE && elementPredicates.isPlainObject(elementSpec)) {
    // If existing node is not an element but spec is, replace it
    console.warn("Cannot update: DOM node type mismatch. Expected Element, Actual:", existingNode.nodeType, ". Replacing node.");
    const newElement = domForge.builder.createElementFromSpec(elementSpec);
    if (existingNode.parentNode) {
      existingNode.parentNode.replaceChild(newElement, existingNode);
    }
    return newElement;
  }

  // Apply attributes
  domForge.builder.assignAttributes(existingNode, elementSpec.attributes);

  // Clean up whitespace nodes (Type III: rewritten loop, used native constants)
  for (let i = existingNode.childNodes.length - 1; i >= 0; i--) {
    const child = existingNode.childNodes[i];
    if (elementPredicates.isWhitespaceNode(child)) {
      existingNode.removeChild(child);
    }
  }

  // Process children (Type III: rewritten logic for array and single unify spec)
  const newChildrenSpecs = elementSpec.children || [];
  const currentChildren = Array.from(existingNode.childNodes); // Type III: snapshot children

  if (newChildrenSpecs.length === 1 && elementPredicates.isUnifySpec(newChildrenSpecs[0])) {
    // If the new spec has a single unify spec, delegate to reconcileChildren
    domForge.builder.reconcileChildren(existingNode, newChildrenSpecs[0]);
  } else {
    // Remove excess children (Type III: rewritten loop)
    while (existingNode.childNodes.length > newChildrenSpecs.length) {
      existingNode.removeChild(existingNode.lastChild);
    }

    // Iterate through new child specs and update/create nodes (Type III: rewritten loop)
    for (let i = 0; i < newChildrenSpecs.length; i++) {
      const childSpec = newChildrenSpecs[i];
      let currentChildNode = existingNode.childNodes[i]; // Access live list

      if (elementPredicates.isStringPrimitive(childSpec)) {
        if (currentChildNode && currentChildNode.nodeType === Node.TEXT_NODE) {
          currentChildNode.textContent = childSpec;
        } else {
          // Replace or insert text node
          const newTextNode = document.createTextNode(childSpec);
          if (currentChildNode) {
            existingNode.replaceChild(newTextNode, currentChildNode);
          } else {
            existingNode.appendChild(newTextNode);
          }
        }
      } else if (elementPredicates.isIgnoreSpec(childSpec)) {
        // If child spec is to ignore, and a node exists at this position, remove it.
        // This is a deletion in effect.
        if (currentChildNode) {
          existingNode.removeChild(currentChildNode);
          // Decrement i to re-evaluate the same index after removal
          i--;
        }
      } else if (elementPredicates.isPlainObject(childSpec)) {
        if (currentChildNode) {
          const updatedChild = domForge.builder.updateElement(currentChildNode, childSpec);
          if (updatedChild !== currentChildNode && updatedChild !== null) {
            // If the update returned a new node (e.g., type changed), replace it
            // If updatedChild is null, it means the node was removed, so we decrement i.
            if (updatedChild) {
              // The updateElement might replace the child itself, so currentChildNode might not be in DOM anymore
              // We need to ensure we're replacing the correct child.
              // Given the `updateElement` replaces in place, this is tricky.
              // Let's assume `updateElement` handles replacement correctly and returns the new node.
              // If `updatedChild` is null, it means it was removed, so we need to adjust the index.
              if (!existingNode.contains(updatedChild)) { // If updatedChild isn't in DOM anymore, it was removed
                i--;
              }
            } else { // updatedChild is null, meaning it was removed
              i--;
            }
          } else if (updatedChild === null) { // Node was removed by updateElement
            i--;
          }
        } else {
          const newChild = domForge.builder.createElementFromSpec(childSpec);
          if (newChild) {
            existingNode.appendChild(newChild);
          }
        }
      } else if (elementPredicates.isUnifySpec(childSpec)) {
        // A direct unify spec as a child (not first child of parent)
        // This is a special case, reconcile only this portion
        // Type III: Added specific handling for this scenario
        if (currentChildNode) {
            domForge.builder.reconcileChildren(currentChildNode, childSpec);
        } else {
            // Create a dummy container for the unification if no node exists
            const tempContainer = document.createElement('div');
            domForge.builder.reconcileChildren(tempContainer, childSpec);
            // Append all children from the temp container
            Array.from(tempContainer.childNodes).forEach(c => existingNode.appendChild(c));
        }
      } else {
        console.error("Cannot process child spec:", childSpec);
      }
    }
  }

  return existingNode;
};