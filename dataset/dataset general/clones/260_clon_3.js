((globalScope) => {
    'use strict';

    // A simple no-operation function.
    const noop = () => {};

    // Internal utility methods
    const _util = {
        /**
         * Verifies if a given value is a string.
         * @param {*} val - The value to check.
         * @returns {boolean} - True if the value is a string, false otherwise.
         */
        isTextual: (val) => typeof val === 'string',

        /**
         * Determines if a value is a plain object (not null, not an array, not a function).
         * @param {*} val - The value to check.
         * @returns {boolean} - True if the value is a plain object, false otherwise.
         */
        isGeneralObject: (val) => val !== null && typeof val === 'object' && !Array.isArray(val),

        /**
         * Converts various DOM collections or single elements into a standard array of nodes.
         * Handles single elements, NodeLists, HTMLCollections, or arrays.
         * @param {*} inputItem - The item(s) to convert.
         * @returns {Array<HTMLElement>} - An array of DOM elements.
         */
        normalizeNodes: (inputItem) => {
            if (inputItem === null || typeof inputItem === 'undefined') {
                return [];
            }
            if (Array.isArray(inputItem)) {
                return inputItem;
            }
            if (inputItem instanceof NodeList || inputItem instanceof HTMLCollection) {
                return Array.from(inputItem);
            }
            return [inputItem];
        },

        /**
         * Retrieves an array of all attribute names for a given DOM element.
         * @param {HTMLElement} targetEl - The DOM element.
         * @returns {Array<string>} - An array of attribute names.
         */
        fetchAttributeNames: (targetEl) =>
            Array.from(targetEl.attributes || []).map((attr) => attr.name),

        /**
         * Attaches multiple event listeners to a single DOM element.
         * @param {HTMLElement} targetElement - The DOM element to attach listeners to.
         * @param {string} eventSequence - A space-separated string of event types (e.g., "click mouseover").
         * @param {Function} handlerFunction - The callback function for the events.
         */
        registerManyListeners: (targetElement, eventSequence, handlerFunction) => {
            if (!targetElement || !eventSequence || !handlerFunction) return; // Guard clause
            const eventTokens = eventSequence.split(/\s+/).filter(Boolean); // Split by whitespace, remove empty strings
            for (const evt of eventTokens) {
                targetElement.addEventListener(evt, handlerFunction, false);
            }
        },

        /**
         * Resolves a selector string or an element/array of elements into an array of DOM elements.
         * @param {string|HTMLElement|NodeList|HTMLCollection|Array<HTMLElement>} selectorOrElement - Input to resolve.
         * @returns {Array<HTMLElement>} - An array of DOM elements.
         */
        resolveDomTargets: (selectorOrElement) => {
            if (_util.isTextual(selectorOrElement)) {
                return _util.normalizeNodes(document.querySelectorAll(selectorOrElement));
            }
            return _util.normalizeNodes(selectorOrElement);
        },

        /**
         * Retrieves all descendant elements of a given element, including the element itself.
         * @param {HTMLElement} parentElement - The starting element.
         * @returns {Array<HTMLElement>} - An array of all descendant elements plus the parent.
         */
        getAllChildrenAndSelf: (parentElement) => {
            const result = parentElement ? Array.from(parentElement.querySelectorAll('*')) : [];
            if (parentElement) {
                result.unshift(parentElement); // Add the parent element at the beginning
            }
            return result;
        },

        /**
         * Clears all child nodes from a given DOM element.
         * @param {HTMLElement} nodeToEmpty - The element whose content should be cleared.
         */
        purgeNodeContents: (nodeToEmpty) => {
            if (!nodeToEmpty) return; // Guard clause
            while (nodeToEmpty.firstChild) {
                nodeToEmpty.removeChild(nodeToEmpty.firstChild);
            }
        },

        /**
         * Core array mutation methods that can alter array length or content.
         */
        arrayChangers: ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort', 'filter'],
    };

    // DOM interaction utilities
    const _domActions = {
        /**
         * Determines the appropriate property name to access/set a DOM element's value.
         * @param {HTMLElement} targetNode - The DOM element.
         * @returns {string} - The property name (e.g., 'value', 'checked', 'selectedIndex', 'textContent').
         */
        determineValueAccessor: (targetNode) => {
            if (!targetNode || !targetNode.tagName) return 'textContent'; // Default fallback

            const nodeTag = targetNode.tagName.toUpperCase();
            if (nodeTag === 'INPUT') {
                if (targetNode.type === 'checkbox' || targetNode.type === 'radio') {
                    return 'checked';
                }
                return 'value';
            }
            if (nodeTag === 'TEXTAREA') return 'value';
            if (nodeTag === 'SELECT') return 'selectedIndex';

            return 'textContent'; // Most common fallback
        },

        /**
         * Fetches the current value from a DOM element using its determined accessor property.
         * @param {HTMLElement} targetNode - The DOM element.
         * @returns {*} - The element's current value.
         */
        retrieveElementValue: (targetNode) => {
            const accessorName = _domActions.determineValueAccessor(targetNode);
            return targetNode[accessorName];
        },

        /**
         * Sets the value of a DOM element using its determined accessor property.
         * @param {HTMLElement} targetNode - The DOM element.
         * @param {*} newValue - The value to set.
         */
        assignElementValue: (targetNode, newValue) => {
            const accessorName = _domActions.determineValueAccessor(targetNode);
            targetNode[accessorName] = newValue;
        },

        /**
         * Updates a collection of DOM elements with a new value using a specified or default modifying function.
         * @param {Array<HTMLElement>} elementSet - An array of DOM elements to modify.
         * @param {*} newVal - The new value to apply.
         * @param {Object} [options] - Configuration options, potentially including a custom `modifier` function.
         */
        applyValueToElements: (elementSet, newVal, options = {}) => {
            if (!Array.isArray(elementSet) || elementSet.length === 0) {
                console.warn('No elements provided for update or elementSet is empty.');
                return;
            }

            const activeModifier = _domActions.getEffectiveModifier(options);

            for (const targetEl of elementSet) {
                activeModifier(targetEl, newVal);
            }
        },

        /**
         * Resolves the actual function to use for modifying DOM elements based on options.
         * @param {Object} [config] - Configuration object. Can contain a `modifier` property (function or string).
         * @returns {Function} - The resolved modifying function.
         */
        getEffectiveModifier: (config) => {
            let actualConfig = config || {};
            if (_util.isTextual(actualConfig)) {
                actualConfig = { modifier: actualConfig }; // Allow string shorthand
            }

            if (typeof actualConfig.modifier === 'function') {
                return actualConfig.modifier;
            }

            // Map string identifiers to predefined actions
            const builtInModifiers = new Map([
                ['show', _domActions.controlVisibility],
                ['bgcolor', _domActions.setCssBackgroundColor],
                ['disable', _domActions.manageDisabledState],
                ['enter', _domActions.bindEnterKeyAction], // This is an event binding, not a direct modifier
            ]);

            return builtInModifiers.get(actualConfig.modifier) || _domActions.assignElementValue; // Default to value assignment
        },

        // --- Specific DOM Modifiers ---
        controlVisibility: (node, showValue) => {
            node.style.visibility = showValue ? '' : 'hidden';
        },
        setCssBackgroundColor: (node, color) => {
            node.style.backgroundColor = color;
        },
        manageDisabledState: (node, disableIt) => {
            node.disabled = !!disableIt; // Ensure boolean
        },
        bindEnterKeyAction: (inputElement, callbackFunction) => {
            // This function is an event binder, not a direct attribute setter.
            // It should ideally be handled separately from value modifiers.
            // For Type III, we acknowledge this design choice from the original.
            if (inputElement._hasEnterListener) return; // Prevent multiple bindings
            inputElement._hasEnterListener = true;

            inputElement.addEventListener('keyup', (ev) => {
                if (ev.key === 'Enter' || ev.keyCode === 13) {
                    // Check for both modern 'key' and deprecated 'keyCode'
                    const currentVal = inputElement.value;
                    callbackFunction(currentVal);
                    inputElement.value = ''; // Clear input after action
                }
            });
        },
    };

    // Core data binding logic
    const _bindingEngine = {
        /**
         * Stores metadata about a binding.
         * @param {Object} dataObject - The object being bound.
         * @param {string} dataProperty - The property name on the object.
         * @param {Array<HTMLElement>} boundElements - The DOM elements bound to this property.
         * @param {Object} [bindingOptions] - Additional binding options.
         */
        recordBindingInfo: (dataObject, dataProperty, boundElements, bindingOptions = {}) => {
            dataObject._bindingMeta = dataObject._bindingMeta || {};
            dataObject._bindingMeta.properties = dataObject._bindingMeta.properties || {};
            dataObject._bindingMeta.properties[dataProperty] = {
                elements: boundElements,
                action: bindingOptions.modifier,
                options: bindingOptions,
            };
        },

        /**
         * Synchronizes changes from DOM input elements back to the bound data object.
         * @param {Object} dataObject - The data model object.
         * @param {string} dataProperty - The property to update on the dataObject.
         * @param {Array<HTMLElement>} inputElements - The DOM elements whose changes should sync.
         */
        syncDomToModel: (dataObject, dataProperty, inputElements) => {
            const relevantEvents = 'change input keyup'; // Added 'input' for more real-time updates
            for (const inputEl of inputElements) {
                _util.registerManyListeners(inputEl, relevantEvents, (evt) => {
                    // Using `evt.target` is more reliable than `evt.srcElement`
                    dataObject[dataProperty] = _domActions.retrieveElementValue(evt.target);
                });
            }
        },

        /**
         * Links a data model property to one or more DOM elements.
         * Handles both scalar values and arrays.
         * @param {Object} modelObject - The data object.
         * @param {string} propertyKey - The property name to bind.
         * @param {string|HTMLElement|Array<HTMLElement>} domTargets - Selector or elements to bind.
         * @param {Object} [bindingOpts] - Binding options.
         * @returns {Object} - The modified model object or the bound array.
         */
        linkDataToView: (modelObject, propertyKey, domTargets, bindingOpts = {}) => {
            const targetElements = _util.resolveDomTargets(domTargets);
            const initialValue = modelObject[propertyKey] || '';

            // Handle array binding separately
            if (Array.isArray(modelObject[propertyKey])) {
                const internalArrayReference = modelObject[propertyKey];
                const templateNode = targetElements[0]; // Assume the first element is the template
                if (!templateNode) {
                    console.error('Array binding requires at least one template DOM node.');
                    return internalArrayReference;
                }
                // Store original parent for re-insertion
                templateNode._originalParent = templateNode._originalParent || templateNode.parentElement;

                Object.defineProperty(modelObject, propertyKey, {
                    get: () => internalArrayReference,
                    set: (newArrayVal) => {
                        if (!Array.isArray(newArrayVal)) {
                            console.warn(`Attempted to set non-array to array-bound property "${propertyKey}".`);
                            return;
                        }
                        internalArrayReference.splice(0, internalArrayReference.length, ...newArrayVal); // Mutate array in place
                        _bindingEngine.bindArrayToTemplate(internalArrayReference, templateNode);
                        return internalArrayReference;
                    },
                    enumerable: true,
                    configurable: true,
                });

                // Trigger initial array binding
                _bindingEngine.bindArrayToTemplate(internalArrayReference, templateNode, bindingOpts.keyAttr);
                return internalArrayReference;
            }

            // Handle scalar value binding
            Object.defineProperty(modelObject, propertyKey, {
                get: () => {
                    // Always reflect current DOM value for scalar properties
                    return targetElements.length > 0 ? _domActions.retrieveElementValue(targetElements[0]) : undefined;
                },
                set: (newValue) => {
                    _domActions.applyValueToElements(targetElements, newValue, bindingOpts);
                    if (bindingOpts.afterUpdateHook && typeof bindingOpts.afterUpdateHook === 'function') {
                        bindingOpts.afterUpdateHook(newValue);
                    }
                },
                enumerable: true,
                configurable: true,
            });

            _bindingEngine.syncDomToModel(modelObject, propertyKey, targetElements);
            _bindingEngine.recordBindingInfo(modelObject, propertyKey, targetElements, bindingOpts);

            // Force initial update from model to view
            modelObject[propertyKey] = initialValue;
            return modelObject;
        },

        /**
         * Establishes a reactive binding for a simple variable within an object,
         * triggering a callback on change.
         * @param {Object} hostObject - The object containing the property.
         * @param {string} propName - The name of the property to bind.
         * @param {Function} changeCallback - Function to call when the property changes.
         */
        establishScalarCallbackBinding: (hostObject, propName, changeCallback) => {
            let currentPropValue = hostObject[propName]; // Capture initial value

            Object.defineProperty(hostObject, propName, {
                get: () => currentPropValue,
                set: (updatedValue) => {
                    if (currentPropValue !== updatedValue) {
                        currentPropValue = updatedValue;
                        changeCallback(updatedValue);
                    }
                },
                enumerable: true,
                configurable: true,
            });

            // Trigger callback with initial value if it exists
            if (currentPropValue !== undefined) {
                changeCallback(currentPropValue);
            }
        },

        /**
         * Binds multiple scalar properties of an object to a single callback.
         * @param {Object} targetObject - The object whose properties are to be bound.
         * @param {string|Array<string>} propertyList - Single property name or array of names.
         * @param {Function} callbackFn - Function to execute when any of the bound properties change.
         */
        bindMultipleScalars: (targetObject, propertyList, callbackFn) => {
            const propertiesToBind = _util.normalizeNodes(propertyList); // Reusing for single/array input
            for (const prop of propertiesToBind) {
                _bindingEngine.establishScalarCallbackBinding(targetObject, prop, callbackFn);
            }
        },

        /**
         * Attaches event listeners based on custom data attributes (e.g., `data-action-click`).
         * @param {Object} contextObject - The object containing callback methods.
         * @param {Array<HTMLElement>} elementsWithMarkup - Elements to scan for custom attributes.
         */
        processMarkupInteractions: (contextObject, elementsWithMarkup) => {
            const actionPrefix = 'data-action-';

            for (const element of elementsWithMarkup) {
                if (!element.attributes) continue;

                for (const attr of Array.from(element.attributes)) {
                    if (attr.name.startsWith(actionPrefix)) {
                        const eventType = attr.name.substring(actionPrefix.length); // e.g., 'click'
                        const handlerNameOrLiteral = attr.value;

                        element.addEventListener(eventType, (event) => {
                            if (contextObject[handlerNameOrLiteral] && typeof contextObject[handlerNameOrLiteral] === 'function') {
                                contextObject[handlerNameOrLiteral](element, event); // Pass element and event
                            } else {
                                // Attempt to parse as a literal action, e.g., "addClass:my-class"
                                const parts = handlerNameOrLiteral.split(':');
                                const action = parts[0];
                                const param = parts[1];

                                if (action === 'addClass' && param) {
                                    element.classList.add(param);
                                } else if (action === 'removeClass' && param) {
                                    element.classList.remove(param);
                                } else if (action === 'toggleAttribute' && param) {
                                    element.toggleAttribute(param);
                                } else {
                                    console.warn(`No handler or recognized literal action for: ${handlerNameOrLiteral}`);
                                }
                            }
                        });
                    }
                }
            }
        },

        /**
         * Binds properties of an object to DOM elements within a specific container,
         * using an attribute (e.g., 'name' or 'data-bind') to map properties to elements.
         * @param {Object} dataModel - The data object to bind.
         * @param {string|HTMLElement} rootContainerOrSelector - The root DOM element or its selector.
         * @param {string} [bindingAttribute='name'] - The attribute on DOM elements that holds the property key.
         * @returns {Object} - The dataModel with bindings established.
         */
        connectModelToDomTree: (dataModel, rootContainerOrSelector, bindingAttribute = 'name') => {
            const rootElement = _util.resolveDomTargets(rootContainerOrSelector)[0];
            if (!rootElement) {
                console.error('Root container for binding not found.');
                return dataModel;
            }

            const candidateElements = _util.getAllChildrenAndSelf(rootElement);
            const propertyToElementMap = new Map();

            for (const currentEl of candidateElements) {
                const keyForBinding = currentEl.getAttribute(bindingAttribute);
                if (keyForBinding && dataModel.hasOwnProperty(keyForBinding)) {
                    if (!propertyToElementMap.has(keyForBinding)) {
                        propertyToElementMap.set(keyForBinding, []);
                    }
                    propertyToElementMap.get(keyForBinding).push(currentEl);
                }
            }

            // Establish bindings for each property found
            for (const [propKey, boundElements] of propertyToElementMap.entries()) {
                _bindingEngine.linkDataToView(dataModel, propKey, boundElements);
            }

            _bindingEngine.processMarkupInteractions(dataModel, candidateElements);

            return dataModel;
        },

        /**
         * Intercepts array mutation methods to trigger a callback when the array changes.
         * @param {Array} targetArray - The array to observe.
         * @param {Function} changeNotificationCallback - Function to call on array mutation.
         */
        interceptArrayMutations: (targetArray, changeNotificationCallback) => {
            for (const methodName of _util.arrayChangers) {
                const originalMethod = targetArray[methodName];
                if (typeof originalMethod === 'function') {
                    targetArray[methodName] = function (...args) {
                        const methodResult = originalMethod.apply(this, args);
                        changeNotificationCallback(this); // Pass the modified array
                        return methodResult;
                    };
                }
            }
            changeNotificationCallback(targetArray); // Initial call for existing data
        },

        /**
         * Binds an array to a DOM template, repeating the template for each item in the array.
         * Each repeated item (if an object) is itself bound to the cloned DOM node.
         * @param {Array<Object|any>} dataArray - The array to bind.
         * @param {HTMLElement} templateElement - The DOM element to clone for each array item.
         * @param {string} [dataKeyAttribute='name'] - Attribute used for inner object binding.
         */
        bindArrayToTemplate: (dataArray, templateElement, dataKeyAttribute = 'name') => {
            const parentContainer = templateElement.parentElement || templateElement._originalParent;
            if (!parentContainer) {
                console.error('Cannot bind array: template element has no parent.');
                return;
            }

            _util.purgeNodeContents(parentContainer); // Clear existing dynamic content

            const fragment = document.createDocumentFragment();

            for (const item of dataArray) {
                if (_util.isGeneralObject(item)) {
                    const clonedNode = templateElement.cloneNode(true); // Deep clone
                    fragment.appendChild(clonedNode);
                    // Bind the individual object within the array to its cloned DOM node
                    _bindingEngine.connectModelToDomTree(item, clonedNode, dataKeyAttribute);
                } else {
                    // For primitive array items, just append text or a simple representation
                    const textNode = document.createTextNode(String(item));
                    fragment.appendChild(textNode);
                }
            }
            parentContainer.appendChild(fragment);

            // Add custom array methods for manual refresh and indexed setting
            dataArray.refreshView = () => _bindingEngine.bindArrayToTemplate(dataArray, templateElement, dataKeyAttribute);
            dataArray.setItem = (index, newItem) => {
                if (index >= 0 && index < dataArray.length) {
                    dataArray.splice(index, 1, newItem); // Use splice to trigger reactivity
                } else if (index === dataArray.length) {
                    dataArray.push(newItem);
                } else {
                    console.warn(`Index ${index} out of bounds for array. Setting skipped.`);
                }
            };

            // Ensure array mutations trigger re-rendering
            _bindingEngine.interceptArrayMutations(dataArray, (arr) => {
                _bindingEngine.bindArrayToTemplate(arr, templateElement, dataKeyAttribute);
            });
        },
    };

    // Expose public API
    globalScope.dataLinker = {
        connect: _bindingEngine.linkDataToView,
        observe: _bindingEngine.bindMultipleScalars,
        syncView: _bindingEngine.connectModelToDomTree,
        replicate: _bindingEngine.bindArrayToTemplate,
        // Expose custom modifiers for advanced usage
        modifiers: {
            show: _domActions.controlVisibility,
            bgcolor: _domActions.setCssBackgroundColor,
            disable: _domActions.manageDisabledState,
            onEnter: _domActions.bindEnterKeyAction,
        },
    };

    // Optional: Log initialization, but changed from original
    if (globalScope.console && typeof globalScope.console.info === 'function') {
        globalScope.console.info('DataLinker library initialized and ready.');
    }
})(window);