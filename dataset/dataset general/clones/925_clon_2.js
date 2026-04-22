/*
 * @license application.branch v1.0
 * (c) 2023 [New Author Name] https://example.com/project
 * License: Apache-2.0
 */

(function(ngApp, browserAgent) {
    'use strict'; // Enforce strict mode for better code quality

    // Define the key for multiple item selection, default to Ctrl
    let selectionModifier = 'controlModifier';

    // Check if the user is on a Mac to adjust the selection key
    if (browserAgent.appVersion.includes("Macintosh")) {
        selectionModifier = 'commandModifier'; // Use Cmd key for Mac users
    }

    // Helper function to extract the node's visual layout from the tree's root element.
    function extractNodeLayout(docObj, rootElement) {
        let nodeLayout; // Variable to hold the extracted template for a tree node.

        // Iterate through all child nodes of the root element to find the template.
        while (rootElement.childNodes.length > 0) {
            const subElement = rootElement.childNodes[0]; // Get the first child node.
            rootElement.removeChild(subElement); // Remove it from the root element.

            // If the child node is an ITEM_NODE_TAG element, it's our potential template.
            if (subElement.nodeName === 'ITEM_NODE_TAG') { // 'ITEM_NODE_TAG' instead of 'LI'
                // Ensure only one ITEM_NODE_TAG template is provided within the tree's BRANCH_LIST.
                if (nodeLayout) {
                    throw new Error('The main branch list must contain only a single item layout definition.');
                }

                // Determine if a wrapper container is needed for the item's content.
                let needsContainer = subElement.childNodes.length === 0;
                let containedElementsCount = 0; // Count of actual HTML elements inside the ITEM_NODE_TAG.

                // Analyze the child nodes of the ITEM_NODE_TAG to decide on content wrapping.
                for (let idx = 0; idx < subElement.childNodes.length; idx++) {
                    const containedElement = subElement.childNodes[idx];

                    // If it's a text node, check if it contains non-whitespace content.
                    if (containedElement.nodeName === 'TEXT_CONTENT_TAG') { // '#text'
                        if (! /^\s*$/.test(containedElement.nodeValue)) {
                            needsContainer = true; // Non-whitespace text requires a wrapper.
                            break;
                        }
                    } else if (containedElementsCount > 0) {
                        // If there's more than one actual element, a wrapper is needed.
                        needsContainer = true;
                        break;
                    } else {
                        containedElementsCount++; // Increment count for HTML elements.
                    }
                }

                // If a wrapper is deemed necessary, create and populate it.
                if (needsContainer) {
                    const containerEl = docObj.createElement('SECTION_CONTAINER'); // 'DIV'
                    while (subElement.childNodes.length > 0) {
                        containerEl.appendChild(subElement.childNodes[0]); // Move all children into the wrapper.
                    }
                    subElement.appendChild(containerEl); // Add the wrapper to the ITEM_NODE_TAG.
                }
                
                // Create an empty BRANCH_LIST element for potential child nodes.
                const childListEl = docObj.createElement('BRANCH_LIST'); // 'UL'
                childListEl.className = rootElement.className; // Inherit class from the root BRANCH_LIST.
                subElement.appendChild(childListEl); // Append the child list to the ITEM_NODE_TAG.

                // Convert the prepared ITEM_NODE_TAG element into an Angular element.
                nodeLayout = ngApp.element(subElement);
                nodeLayout.addClass('app-tree-item'); // Add a specific class for tree nodes.
            }
        }

        // Return the extracted template or a default one if none was found.
        return nodeLayout || ngApp.element('<ITEM_NODE_TAG class="app-tree-item"><SECTION_CONTAINER>{{record}}</SECTION_CONTAINER><BRANCH_LIST></BRANCH_LIST></ITEM_NODE_TAG>');
    }

    // Recursively searches for the closest ancestor that is a tree item node.
    function locateAncestorNode(eventTarget) {
        let ancestorNode = eventTarget; // Start search from the event target.

        // If the target exists and is not an 'ITEM_NODE_TAG' or doesn't have the tree item class, recurse upwards.
        if (ancestorNode && (ancestorNode.nodeName !== 'ITEM_NODE_TAG' || !ancestorNode.className.match(/\bapp-tree-item\b/))) {
            ancestorNode = locateAncestorNode(ancestorNode.parentElement); // Move to the parent element.
        }

        // Return the found ancestor as an Angular element, or null if none found.
        return ancestorNode ? ngApp.element(ancestorNode) : null;
    }

    // Traverses all descendant tree items within a given list element.
    function traverseTreeItems(currentList, visitAction) {
        // Iterate over immediate child 'ITEM_NODE_TAG' elements.
        ngApp.forEach(currentList.children('ITEM_NODE_TAG'), function(nodeItem) {
            const $nodeItem = ngApp.element(nodeItem); // Wrap the DOM element with Angular's jQLite.

            // If the callback returns anything other than false, continue descending into children.
            if (visitAction(currentList, $nodeItem) !== false) {
                // The second child of a node item is typically its nested BRANCH_LIST (child list).
                traverseTreeItems($nodeItem.children().eq(1), visitAction);
            }
        });
    }

    // Sets up the core configuration and behavior for a tree instance.
    function initializeTreeStructure(elementRef, attributesRef, $compiler, $docService) {
        // Extract the template for individual tree nodes.
        const compiledNodeTemplate = extractNodeLayout($docService[0], elementRef[0]);
        // Determine the expression for the tree's data model.
        const dataModelPath = attributesRef.source || attributesRef.appTree; // 'src' -> 'source', 'ngTree' -> 'appTree'
        // Get the iteration specification from the template.
        const iterationSpecifier = compiledNodeTemplate[0].getAttribute('iterate'); // 'each' -> 'iterate'
        let itemContextAlias = 'record'; // Default alias for an item in the scope. 'item' -> 'record'
        let childCollectionPath = 'record.subitems'; // Default path for children. 'item.children' -> 'record.subitems'
        // Get expressions for selection handling.
        const selectionActionPath = compiledNodeTemplate.attr('onSelect'); // 'select' -> 'onSelect'
        const selectedFlagName = compiledNodeTemplate.attr('isSelected'); // 'selected' -> 'isSelected'

        // Parse the iteration specification if provided (e.g., "alias in collection").
        if (iterationSpecifier) {
            const regexMatch = /^\s*(\w+)\s+in\s+(.*?)\s*$/.exec(iterationSpecifier);

            if (!regexMatch) {
                throw new Error('Invalid item iteration specification: "' + iterationSpecifier + '". The specifier must follow the pattern "alias in collection".');
            }

            itemContextAlias = regexMatch[1]; // Extract the item alias.
            childCollectionPath = itemContextAlias + '.' + regexMatch[2]; // Construct the path to children.
        }

        elementRef.addClass('app-tree-root'); // Add a base class to the tree's root element. 'ng-tree' -> 'app-tree-root'

        // Define the tree's configuration object.
        const treeConfig = {
            allowMultiSelect: 'allowMultiple' in attributesRef, // Check for 'multiple' attribute. 'multiple' -> 'allowMultiple'
            baseElement: elementRef, // Reference to the tree's root DOM element. 'rootElem' -> 'baseElement'
            dataModelPath: dataModelPath, // The expression for the tree's main data.
            compiledNodeTemplate: $compiler(compiledNodeTemplate), // Pre-compiled node template. 'itemTemplate' -> 'compiledNodeTemplate'
            itemContextAlias: itemContextAlias, // The name used for items in child scopes.
            childCollectionPath: childCollectionPath, // The expression to get children from an item.

            // Watcher function for item collections.
            collectionObserver: function(itemScope) { return itemScope.$eval(childCollectionPath); },
            // Watcher function for the overall tree data model.
            treeDataObserver: function(itemScope) { return itemScope.$eval(dataModelPath); },

            // Method to retrieve the data item from a scope.
            retrieveItem: function(itemScope) {
                return itemScope.$eval(this.itemContextAlias);
            },

            // Method to assign a data item to a scope.
            assignItem: function(itemScope, dataValue) {
                itemScope[this.itemContextAlias] = dataValue;
            },

            enableSelectionTracking: !!selectionActionPath, // Flag indicating if selection tracking is active. 'trackSelection' -> 'enableSelectionTracking'

            // Method to update the selection state of an item.
            updateSelectionState: function(itemScope, isSelected) {
                if (this.enableSelectionTracking) {
                    itemScope.$currentSelection = isSelected; // Set a flag on the scope. '$selected' -> '$currentSelection'

                    if (selectionActionPath) {
                        itemScope.$eval(selectionActionPath); // Execute the selection action expression.
                    }
                }
            }
        };

        // If selection tracking is enabled, set up the click handler for the tree.
        if (treeConfig.enableSelectionTracking) {
            elementRef.on('click', function(eventObj) { // 'bind' -> 'on', 'evt' -> 'eventObj'
                const clickedNodeElement = locateAncestorNode(eventObj.target); // Find the clicked tree node.
                const clickedNodeScope = clickedNodeElement ? clickedNodeElement.scope() : null; // Get its scope.

                // Handle multi-selection (e.g., Ctrl+Click or Cmd+Click).
                if (eventObj[selectionModifier] && treeConfig.allowMultiSelect) {
                    if (clickedNodeScope) {
                        clickedNodeScope.$apply(function() {
                            // Toggle the selection state of the clicked item.
                            treeConfig.updateSelectionState(clickedNodeScope, !clickedNodeScope.$currentSelection);
                        });
                    }
                } else {
                    // Handle single selection: deselect all other items first.
                    traverseTreeItems(elementRef, function(currentList, nodeItem) {
                        // Deselect if it's not the clicked item.
                        if (!clickedNodeElement || nodeItem[0] !== clickedNodeElement[0]) {
                            const currentScope = nodeItem.scope();

                            if (currentScope.$currentSelection) {
                                currentScope.$apply(function() {
                                    treeConfig.updateSelectionState(currentScope, false); // Deselect.
                                });
                            }
                        }
                    });

                    // Select the clicked item if it wasn't already selected.
                    if (clickedNodeScope && !clickedNodeScope.$currentSelection) {
                        clickedNodeScope.$apply(function() {
                            treeConfig.updateSelectionState(clickedNodeScope, true); // Select.
                        });
                    }
                }
            });
        }

        return treeConfig; // Return the fully configured tree object.
    }

    // Adds a new data item as a rendered node to the tree list.
    function appendNodeToTree(parentScope, treeConfig, targetListElement, dataItem, positionIndex) {
        const newNodeScope = parentScope.$new(); // Create a new child scope for the item.
        treeConfig.assignItem(newNodeScope, dataItem); // Assign the data item to its scope.

        // Compile the template with the new scope to create the node element.
        const newNodeElement = treeConfig.compiledNodeTemplate(newNodeScope, ngApp.noop);

        // Initialize selection state if tracking is enabled.
        if (treeConfig.enableSelectionTracking) {
            newNodeScope.$currentSelection = false; // By default, new items are not selected.
        }

        placeNodeInList(targetListElement, newNodeElement, positionIndex); // Insert the node into the DOM.

        // The child list (BRANCH_LIST) is typically the second child of the node element.
        const childBranchList = newNodeElement.children().eq(1);

        // Recursively load children for the newly added node.
        renderTreeNodes(newNodeScope, treeConfig, childBranchList, treeConfig.collectionObserver);
    }

    // Inserts a given node element into a list at a specified position.
    function placeNodeInList(targetListElement, newNodeElement, positionIndex) {
        if (positionIndex < 0) {
            targetListElement.append(newNodeElement); // Append to the end.
        } else if (positionIndex === 0) {
            targetListElement.prepend(newNodeElement); // Prepend to the beginning.
        } else {
            // Insert after the element at (index - 1).
            targetListElement.children().eq(positionIndex - 1).after(newNodeElement);
        }
    }

    // Manages the rendering and synchronization of tree nodes based on a data list.
    function renderTreeNodes(parentScope, treeConfig, targetListElement, listDataObserver) {
        // Set up a deep watch on the observed list data.
        parentScope.$watch(listDataObserver, function(newDataSet, oldDataSet) {
            // If the new data set is empty or undefined, clear all current children.
            if (typeof newDataSet === 'undefined' || newDataSet === null || newDataSet.length === 0) {
                targetListElement.children().remove();
                return;
            }

            // Iterate through the new data set to add or reposition nodes.
            ngApp.forEach(newDataSet, function(dataItem, dataIndex) {
                const currentChildElements = targetListElement.children(); // Get current rendered children.

                // If the current index is beyond existing elements, simply add the new item.
                if (dataIndex >= currentChildElements.length) {
                    appendNodeToTree(parentScope, treeConfig, targetListElement, dataItem, -1);
                    return;
                }

                let elementIndex = dataIndex; // Initialize search index for existing element.

                // Search for the data item among existing child elements.
                for (; elementIndex < currentChildElements.length; elementIndex++) {
                    const currentChildElement = ngApp.element(currentChildElements[elementIndex]);
                    const childDataItem = treeConfig.retrieveItem(currentChildElement.scope());

                    if (childDataItem === dataItem) {
                        break; // Found a match, item exists.
                    }
                }

                // If the item wasn't found, add it.
                if (elementIndex >= currentChildElements.length) {
                    appendNodeToTree(parentScope, treeConfig, targetListElement, dataItem, dataIndex);
                } else if (elementIndex !== dataIndex) {
                    // If found but out of position, move it.
                    placeNodeInList(targetListElement, currentChildElements[elementIndex], dataIndex);
                }
            });

            // Remove any extra elements that no longer have corresponding data items.
            while (targetListElement.children().length > newDataSet.length) {
                const elementToRemove = targetListElement.children().eq(newDataSet.length);

                // If the removed element was selected, deselect it.
                if (elementToRemove.scope().$currentSelection) {
                    treeConfig.updateSelectionState(elementToRemove.scope(), false);
                }
                
                elementToRemove.remove(); // Remove the DOM element.
            }
        }, true); // Deep watch enabled.
    }

    // Register the module and its directive with Angular.
    ngApp.module('AppTreeModule', []).
        directive('appTree', ['$compiler', '$docService', function ($compiler, $docService) {
            return {
                preLink: function(elementRef, attributesRef) { // 'compile' -> 'preLink'
                    // Initialize the tree configuration during the compile phase.
                    const treeConfig = initializeTreeStructure(elementRef, attributesRef, $compiler, $docService);

                    // The link function returned from compile.
                    return function postLink(itemScope, elementRef, attributesRef) { // The actual link function.
                        // Load and render the tree nodes during the link phase.
                        renderTreeNodes(itemScope, treeConfig, elementRef, treeConfig.treeDataObserver);
                    };
                }
            };
        }]);
})(ngApp, browserAgent);