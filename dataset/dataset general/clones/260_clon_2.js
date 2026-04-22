(function(){
    // Utility functions for type checking and DOM manipulation.

    // Ascertains if a given input is a string.
    function checkIsText(textVal) {
        return (typeof textVal === 'string');
    }

    // Determines if an input value is an object.
    function checkIsEntity(entityVal) {
        return (typeof entityVal === 'object');
    }

    // Verifies if the provided value is an array instance.
    function checkIsList(listVal) {
        return listVal.constructor === Array;
    }

    // Retrieves all attribute names from a DOM element.
    function fetchPropNames(uiElement) {
        return Array.prototype.slice.call(uiElement.attributes).map(function(currentPiece) { return currentPiece.name });
    }

    // Converts a single item or a collection into an array.
    function convertToList(singleOrMulti) {
        singleOrMulti = singleOrMulti || []; // Ensure it's not null/undefined
        if (checkIsList(singleOrMulti)) return singleOrMulti;
        if (singleOrMulti.constructor === HTMLCollection) return Array.prototype.slice.call(singleOrMulti);
        if (singleOrMulti.constructor === NodeList) return Array.prototype.slice.call(singleOrMulti);

        return [singleOrMulti];
    }

    // Alias for the list conversion utility.
    var convertToListRef = convertToList;

    // Attaches multiple event listeners to a single DOM element.
    function attachEventsMany(uiEl, eventNamesStr, actionHandler) {
        var eventTriggers = eventNamesStr.split(' ');
        eventTriggers.forEach(function(eventIdentifier) { uiEl.addEventListener(eventIdentifier, actionHandler, false);  });
    }

    // Transforms a CSS selector or a DOM element into an array of elements.
    function selectElements(selectionInput) {
        if (checkIsText(selectionInput)) return convertToList(document.querySelectorAll(selectionInput));
        return selectionInput;
    }

    // Gathers all descendant elements, including the element itself.
    function retrieveDescendants(uiEl) {
        var resultCollection = convertToListRef(uiEl.querySelectorAll("*"));
        resultCollection.push(uiEl); // Add the parent element to the result
        return resultCollection;
    }

    /* Core DOM interaction routines */
    // Identifies the correct property name to access an element's value (e.g., 'value', 'checked').
    function getElementValueKey(uiEl) {
        if (uiEl.type === 'checkbox') return 'checked';
        if (uiEl.nodeName === 'INPUT') return 'value';
        if (uiEl.nodeName === 'TEXTAREA') return 'value';
        if (uiEl.nodeName === 'SELECT') return 'selectedIndex';

        return 'textContent'; // Default property for general content
    }

    // Fetches the current value of a DOM element using the appropriate property.
    function getElementValue(uiEl) {
        var propertyIdentifier = getElementValueKey(uiEl);
        return uiEl[propertyIdentifier];
    }

    // Assigns a new value to a DOM element using the determined property.
    function setElementValue(uiEl, updatedValue) {
        var propertyIdentifier = getElementValueKey(uiEl);
        uiEl[propertyIdentifier] = updatedValue;
    }

    // Sets up two-way data binding for input elements, updating an object property on change.
    function synchronizeElementInput(dataObject, dataProperty, targetElements) {
        var inputEvents = 'change keyup'; // Events that trigger updates
        targetElements.forEach(function(uiEl) {
            attachEventsMany(uiEl, inputEvents, function(eventObject) {
                dataObject[dataProperty] = getElementValue(eventObject.srcElement);
            });
        });
    }

    // Applies a modification function to a collection of DOM elements.
    function alterElements(targetElements, updatedValue, optionsConfig) {
        if (targetElements.length === 0) { console.log("No operation performed."); return; }
        var modificationHandler = getAlterationHandler(optionsConfig);

        targetElements.forEach(function(uiEl) {
            modificationHandler(uiEl, updatedValue);
        });
    }

    // Determines the appropriate function to modify a DOM element based on options.
    function getAlterationHandler(optionsConfig) {
        var currentOptions = optionsConfig || {};
        // If options is just a string, treat it as {func: 'string'}
        if (checkIsText(currentOptions)) currentOptions = {func: currentOptions};

        if (currentOptions.func) {
            // If func is already a function, return it directly
            if ((currentOptions.func.constructor) === Function) return currentOptions.func;
            // Otherwise, resolve named functions
            switch(currentOptions.func) {
                case 'show': return displayToggle;
                case 'bgcolor': return backgroundColorSet;
                case 'disable': return deactivateElement;
                case 'enter': return onKeyEnter;
            }
        }

        return setElementValue; // Default modification handler
    }

    /* Specialized UI interaction handlers */
    // Toggles the visibility of a DOM element.
    function displayToggle(uiEl, currentValue) {
        currentValue ? uiEl.style.visibility = null : uiEl.style.visibility = 'hidden';
    }

    // Sets the background color of a DOM element.
    function backgroundColorSet(uiEl, currentValue) {
        uiEl.style.backgroundColor = currentValue;
    }

    // Enables or disables a DOM element.
    function deactivateElement(uiEl, currentValue) {
        currentValue ? uiEl.disabled = true : uiEl.disabled = false;
    }

    // Attaches an event listener for the 'Enter' key press on an element.
    function onKeyEnter(uiEl, callbackFunction) { // This might need a refactor into a declarative binding
        if (uiEl.hasEnterListener) return; // Prevent multiple listeners
        uiEl.hasEnterListener = true;

        uiEl.addEventListener("keyup", function (eventObject) {
            if (eventObject.keyCode === 13) {  // Check for "Enter" key
                var inputContent = uiEl.value;
                callbackFunction(inputContent);
                uiEl.value = ""; // Clear input after action
            }
        });
    }


    /* uix (UI eXperience) framework core logic */
    // Registers a binding for a data property to specific DOM elements.
    function registerConnections(dataObject, dataProperty, targetElements, optionsConfig) {
        var currentOptions = optionsConfig || {};
        dataObject.uix = dataObject.uix || {};
        dataObject.uix.connections = dataObject.connections || {};
        dataObject.uix.connections[dataProperty] = {elements: targetElements, handler: currentOptions.func, options: currentOptions};
    }

    // Connects a model property to one or more UI elements.
    function connectModelToUI(dataObject, dataProperty, targetElements, optionsConfig) {
        var processedElements = convertToList(selectElements(targetElements)); // Ensure we have an array of DOM elements
        var initialValue = dataObject[dataProperty] || '';
        var currentOptions = optionsConfig || {};

        if (checkIsList(dataObject[dataProperty])) {
            var internalList = dataObject[dataProperty];
            var templateNode = processedElements[0]; // The first element is used as a template
            templateNode.originalParent = templateNode.parentElement; // Store parent for re-insertion later
            Object.defineProperty(dataObject, dataProperty, {
                get: function() {
                    return internalList; },
                set: function(freshList) {
                    internalList = freshList;
                    connectList(internalList, templateNode); // Re-render the list items
                    return internalList; }
            });

            dataObject[dataProperty] = internalList; // Trigger the setter to initialize
            return internalList;
        }

        // For non-array, simple value bindings
        Object.defineProperty(dataObject, dataProperty, {
            get: function() { return getElementValue(processedElements[0]); }, // Read value directly from DOM if needed
            set: function(updatedValue) {
                alterElements(processedElements, updatedValue, currentOptions);
                if (currentOptions.postAction)(currentOptions.postAction)(updatedValue); // Execute a post-update hook if provided
            },
            configurable: true // Allow redefining this property later
        });

        synchronizeElementInput(dataObject, dataProperty, processedElements); // Setup input synchronization

        registerConnections(dataObject, dataProperty, processedElements, currentOptions); // Record the binding
        dataObject[dataProperty] = initialValue; // Force assignment to push initial data to UI
        return dataObject;
    }

    // Core function to link a simple variable to a callback.
    function linkVariableCore(dataObject, dataProperty, callbackFunction) {
        var storedValue = dataObject[dataProperty];
        Object.defineProperty(dataObject, dataProperty, {
            get: function() { return storedValue; },
            set: function(updatedValue){ storedValue = updatedValue; callbackFunction(updatedValue); },
            configurable: true
        });

        dataObject[dataProperty] = dataObject[dataProperty]; // Trigger the setter with current value
    }

    // Links multiple properties of an object to a single callback function.
    function linkVariable(dataObject, propertiesList, callbackFunction) {
        var propNames = convertToList(propertiesList);
        propNames.forEach(function(dataProperty) { linkVariableCore(dataObject, dataProperty, callbackFunction) });
    }

    // Binds callback functions specified in custom 'uix-' attributes to DOM elements.
    function registerMarkupActions(dataObject, elementsToProcess) {
        elementsToProcess.forEach(function (uiEl) {
            var uiAttributes = fetchPropNames(uiEl);
            uiAttributes.forEach(function(currentAttr) {
                if (currentAttr.indexOf('uix-') === 0) { // Check for attributes starting with 'uix-'
                    var callbackType = currentAttr.substring('uix-'.length); // e.g., "click" from "uix-click"
                    var eventIdentifier = 'on'+callbackType;
                    var callbackIdentifier  = uiEl.getAttribute(currentAttr);
                    uiEl[eventIdentifier] = function() {
                        if (dataObject[callbackIdentifier]) dataObject[callbackIdentifier](uiEl);
                        else { // Handle immediate, literal commands like 'addClass-foo'
                            var componentParts = callbackIdentifier.split('-');
                            if (componentParts[0] === 'addClass') uiEl.classList.add(componentParts[1]);
                            if (componentParts[1] === 'removeClass')  uiEl.classList.remove(componentParts[1])
                        }
                    }
                }
            });
        });
    }

    // Connects an object's properties to descendant DOM elements based on a specified attribute.
    function connectObject(dataObject, elementOrQuery, uiAttributeForKey) {
        var parentElement = convertToList(selectElements(elementOrQuery))[0]; // Get the primary element

        var uiKeyAttr = uiAttributeForKey || 'name'; // Attribute holding the key for object property binding
        var elementsToProcess = retrieveDescendants(parentElement);
        if (!elementsToProcess.length) {
            elementsToProcess = [parentElement]; // If no children, bind to the element itself
        }

        // Create a map of object keys to their corresponding DOM elements
        var objectKeyMapping = elementsToProcess.reduce(function(accumulatorMap, currentUIElement) {
            var objectKey = currentUIElement.getAttribute(uiKeyAttr); // Get the key from the element's attribute
            if(objectKey) { accumulatorMap[objectKey] = accumulatorMap[objectKey] || []; accumulatorMap[objectKey].push(currentUIElement); }
            return accumulatorMap;
        }, {});

        for (var objectKey in objectKeyMapping) {
            var connectedElements = objectKeyMapping[objectKey];
            if (dataObject.hasOwnProperty(objectKey)) connectModelToUI(dataObject, objectKey, connectedElements);
        }

        registerMarkupActions(dataObject, elementsToProcess); // Register any markup-defined actions

        return dataObject;
    }

    // Clears all child nodes from a DOM element.
    function emptyElementContent(domNode) {
        try {
            domNode.innerHTML = ''; // Efficient way to clear content
        } catch (e) {
            var temporaryVar = domNode; // Store for debugging purposes if error occurs
            throw e;
        }
    }

    // List of array methods that modify the array.
    var listModificationMethods = ["pop", "push", "reverse", "shift", "unshift", "splice", "sort", "filter"];

    // Sets up a callback to be triggered whenever the array is modified by specific methods.
    function setupListChangeCallback(dataList, callbackFunction) {
        listModificationMethods.forEach(function(methodName){
            var originalMethod = dataList[methodName];
            dataList[methodName] = function() {
                var operationResult = originalMethod.apply(this, arguments);
                callbackFunction(dataList); // Execute callback after modification
                return operationResult;
            }
        });

        callbackFunction(dataList); // Initial call to set up UI
    }

    // Binds an array to a template DOM element, repeating the element for each array item.
    function connectList(dataList, uiEl, uiKeyAttr) {
        var templateElement = convertToList(selectElements(uiEl))[0];
        var parentContainer = templateElement.parentElement || templateElement.originalParent; // Get the parent to append to

        // Function to re-render the list based on the array's current state.
        var renderListItems = function(freshList) {
            emptyElementContent(parentContainer); // Clear existing items
            freshList.forEach( function(listItem, itemIndex) {
                if (checkIsEntity(listItem)) { // Only bind objects, primitives are ignored for cloning
                    var clonedNode = parentContainer.appendChild(templateElement.cloneNode(true));
                    uix.connectObject(listItem, clonedNode, uiKeyAttr); // Bind each item to its cloned node
                }
            });
            templateElement.parentElement = parentContainer; // Maintain reference to parent
        };

        // When the array changes, trigger re-rendering.
        setupListChangeCallback(dataList, renderListItems);

        // Add a method to manually refresh the bindings.
        dataList.refreshBindings = function() {
            renderListItems(dataList);
        }

        // Allow setting items by index and refreshing.
        dataList.setByIndex = function(itemIndex, listItem) {
            dataList[itemIndex] = listItem;
            dataList.refreshBindings();
        }
    }

    // Expose the core UI binding functionalities globally.
    window.uix = {
        connect: connectModelToUI, // Bind model property to UI element(s)
        connectVar: linkVariable, // Link a variable to a callback
        connectObj: connectObject, // Bind an object's properties to descendant elements
        connectList: connectList // Bind an array to a repeating UI template
    };
    console && console.log("uix framework initialized.");
}());