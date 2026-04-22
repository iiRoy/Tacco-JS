var DOMNav = function(targetQuery) {

    // Declare several local variables for iteration, storage, and current context.
    var idx, count, activeSet, item, contextNode, gatheredElements = [], toolbelt;

    // Check for an ID selector appearing mid-string (e.g., "div #myId").
    // If found, we only care about the last ID in the sequence.
    if (targetQuery.indexOf('#') > 0) {
        targetQuery = targetQuery.split('#');
        targetQuery = '#' + targetQuery[targetQuery.length - 1]; // Focus on the ultimate ID.
    }
    // Split the query string by spaces to process individual selectors.
    targetQuery = targetQuery.split(' ');

    // Define a set of internal helper functions for element retrieval.
    toolbelt = {
        // Helper to locate a single element by its ID.
        // @param idValue {string} : The unique identifier of the element.
        fetchById: function(idValue) {
            return document.getElementById(idValue);
        },
        // Helper to retrieve elements by class name or tag name.
        // @param selectionType {string} : Specifies 'class' or 'elements' (for tag names).
        // @param targetName {string} : The class name or tag name to search for.
        // @param searchContext {Node|NodeList} : The starting point(s) for the search; defaults to `document`.
        retrieveElements: function(selectionType, targetName, searchContext) {
            var loopCounter = 0,
                currentLength,
                foundList = [],
                apiCall = (selectionType === 'class') ? 'getElementsByClassName' : 'getElementsByTagName';

            // If the context is a collection of nodes, iterate through them.
            if (searchContext.length) {
                while (searchContext[loopCounter]) {
                    // Collect all matching children from each parent node.
                    Array.prototype.push.apply(foundList, Array.prototype.slice.call(searchContext[loopCounter++][apiCall](targetName)));
                }
            } else {
                // If the context is a single node, directly get its matching children.
                foundList = searchContext[apiCall](targetName);
            }
            // Return either a single element or the full collection.
            return (foundList.length === 1) ? foundList[0] : foundList;
        }
    };


    // Initialize loop counter and the total number of selector segments.
    count = targetQuery.length;
    // The initial search scope is the entire document.
    activeSet = document;

    // Iterate through each segment of the selector query.
    for (idx = 0; idx < count; idx++) {
        item = targetQuery[idx]; // Current selector segment (e.g., "div", "#myId", ".myClass").
        contextNode = activeSet; // The parent(s) for the current search step.

        // Handle different types of selector segments.
        if (item.indexOf('#') === 0) {
            // It's an ID selector.
            // Extract the ID value and find the element.
            activeSet = toolbelt.fetchById(item.split('#')[1]);
        } else if (item.indexOf('.') > -1) {
            // It's a class selector, potentially prefixed with a tag name.
            item = item.split('.');
            if (item[0]) { // If there's an element tag name before the class (e.g., "div.myClass").
                // First, find all elements of the specified tag type within the current context.
                contextNode = toolbelt.retrieveElements('elements', item[0], contextNode);
                gatheredElements = []; // Reset the temporary storage for class matches.

                if (contextNode.length) {
                    // If we found multiple elements, iterate to filter by class name.
                    for (idx = 0; contextNode[idx]; idx++) {
                        // Check if the element's class list contains the target class.
                        if (contextNode[idx].className.indexOf(item[1]) > -1) {
                            gatheredElements.push(contextNode[idx]);
                        }
                    }
                    activeSet = gatheredElements; // Update the active set with class-filtered elements.
                } else {
                    // If only one element was found, check its class directly.
                    activeSet = (contextNode.className.indexOf(item[1]) > -1) ? contextNode : [];
                }
            } else { // Only a class name (e.g., ".myClass").
                // Directly retrieve elements by class name from the current context.
                activeSet = toolbelt.retrieveElements('class', item[1], contextNode);
            }
        } else { // It's a regular element tag name selector (e.g., "div", "p").
            // Retrieve all elements with the specified tag name.
            activeSet = toolbelt.retrieveElements('elements', item, contextNode);
        }
    }

    // Return the final collection of elements found.
    return activeSet;
};