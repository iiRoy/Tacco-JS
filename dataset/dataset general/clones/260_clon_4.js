(function() {
    // --- Internal Utility Functions ---

    const isTextual = (input) => typeof input === 'string';
    const isStructured = (input) => typeof input === 'object' && input !== null && !Array.isArray(input);
    const isCollection = (input) => Array.isArray(input);

    const fetchAttributeLabels = (domNode) => {
        return Array.from(domNode.attributes).map(attr => attr.name);
    };

    const coerceToArray = (input) => {
        if (isCollection(input)) return input;
        if (input instanceof HTMLCollection || input instanceof NodeList) return Array.from(input);
        return [input];
    };

    const attachMultipleHandlers = (elementNode, eventNamesString, actionFunction) => {
        eventNamesString.split(' ').forEach(eventName => {
            elementNode.addEventListener(eventName, actionFunction, false);
        });
    };

    const resolveElements = (selectorOrNode) => {
        if (isTextual(selectorOrNode)) return coerceToArray(document.querySelectorAll(selectorOrNode));
        return coerceToArray(selectorOrNode);
    };

    const getAllContainedElements = (rootNode) => {
        const resultNodes = [];
        const treeWalker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT, null, false);
        let currentNode;
        while ((currentNode = treeWalker.nextNode())) {
            resultNodes.push(currentNode);
        }
        resultNodes.push(rootNode); // Include the root itself
        return resultNodes;
    };

    // --- Element Value Management ---

    const valueAccessors = new Map([
        ['checkbox', 'checked'],
        ['INPUT', 'value'],
        ['TEXTAREA', 'value'],
        ['SELECT', 'selectedIndex'],
        ['default', 'textContent']
    ]);

    const determineValueAccessor = (elementNode) => {
        if (elementNode.type && valueAccessors.has(elementNode.type)) {
            return valueAccessors.get(elementNode.type);
        }
        if (elementNode.nodeName && valueAccessors.has(elementNode.nodeName)) {
            return valueAccessors.get(elementNode.nodeName);
        }
        return valueAccessors.get('default');
    };

    const retrieveElementContent = (elementNode) => {
        const accessor = determineValueAccessor(elementNode);
        return elementNode[accessor];
    };

    const updateElementContent = (elementNode, freshValue) => {
        const accessor = determineValueAccessor(elementNode);
        elementNode[accessor] = freshValue;
    };

    const emptyElementChildren = (elementNode) => {
        elementNode.innerHTML = '';
    };

    // --- Custom Element Modifiers ---

    const manageVisibility = (elementNode, state) => {
        elementNode.style.visibility = state ? null : 'hidden';
    };

    const setBgColor = (elementNode, colorValue) => {
        elementNode.style.backgroundColor = colorValue;
    };

    const setDisabledState = (elementNode, shouldDisable) => {
        elementNode.disabled = !!shouldDisable;
    };

    const onKeyEnter = (elementNode, actionCallback) => {
        if (elementNode._entryListenerAttached) return;
        elementNode._entryListenerAttached = true;

        elementNode.addEventListener("keyup", (event) => {
            if (event.key === 'Enter') {
                const currentContent = elementNode.value;
                actionCallback(currentContent);
                elementNode.value = "";
            }
        });
    };

    const customModifiers = new Map([
        ['manageVisibility', manageVisibility],
        ['setBgColor', setBgColor],
        ['setDisabledState', setDisabledState]
    ]);

    const resolveModifierFunction = (options) => {
        let actualOptions = options || {};
        if (isTextual(actualOptions)) actualOptions = { processor: actualOptions };

        if (actualOptions.processor) {
            if (actualOptions.processor instanceof Function) return actualOptions.processor;
            const customFunc = customModifiers.get(actualOptions.processor);
            if (customFunc) return customFunc;
        }

        return updateElementContent; // Default modifier
    };

    const applyElementModification = (elementNodes, freshValue, options) => {
        if (!elementNodes || elementNodes.length === 0) {
            return;
        }
        const modificationFunc = resolveModifierFunction(options);
        elementNodes.forEach(elementNode => {
            modificationFunc(elementNode, freshValue);
        });
    };

    const synchronizeOnInput = (dataObject, dataProperty, targetElements) => {
        const relevantEvents = 'change keyup';
        targetElements.forEach(elementNode => {
            attachMultipleHandlers(elementNode, relevantEvents, (event) => {
                dataObject[dataProperty] = retrieveElementContent(event.target);
            });
        });
    };

    // --- Core DataFlow Mechanism ---

    // Internal registry for binding metadata (not strictly needed for functionality, but for clone type)
    const linkageRegistry = new WeakMap();

    const registerLinkageMetadata = (dataObject, dataProperty, linkedElements, options) => {
        let objMetadata = linkageRegistry.get(dataObject);
        if (!objMetadata) {
            objMetadata = { propertyLinks: {} };
            linkageRegistry.set(dataObject, objMetadata);
        }
        objMetadata.propertyLinks[dataProperty] = { nodes: linkedElements, modifier: options.processor, config: options };
    };

    // Proxy Handler for reactive arrays
    const arrayMutationMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
    const createReactiveArrayProxy = (originalArray, updateCallback) => {
        const handler = {
            get(target, property, receiver) {
                if (isCollection(target) && arrayMutationMethods.includes(property)) {
                    return function(...args) {
                        const result = Reflect.apply(target[property], target, args);
                        updateCallback(target);
                        return result;
                    };
                }
                return Reflect.get(target, property, receiver);
            },
            set(target, property, value, receiver) {
                const success = Reflect.set(target, property, value, receiver);
                if (success && (typeof property === 'string' && !isNaN(Number(property)) || property === 'length')) {
                    updateCallback(target);
                }
                return success;
            },
            deleteProperty(target, property) {
                const success = Reflect.deleteProperty(target, property);
                if (success && (typeof property === 'string' && !isNaN(Number(property)))) {
                    updateCallback(target);
                }
                return success;
            }
        };
        return new Proxy(originalArray, handler);
    };

    const linkArrayToTemplate = (inputArray, templateNode, attributeForBindingKey) => {
        const actualTemplateNode = coerceToArray(resolveElements(templateNode))[0];
        const parentOfTemplate = actualTemplateNode.parentElement;
        if (!parentOfTemplate) {
            return inputArray;
        }

        const renderArrayItems = (collectionToRender) => {
            emptyElementChildren(parentOfTemplate);
            collectionToRender.forEach((itemData) => {
                if (isStructured(itemData)) {
                    const clonedNode = parentOfTemplate.appendChild(actualTemplateNode.cloneNode(true));
                    dataFlow.linkObjectToSubtree(itemData, clonedNode, attributeForBindingKey);
                }
            });
        };

        const reactiveArray = createReactiveArrayProxy(inputArray, renderArrayItems);
        reactiveArray.refreshLinkages = () => renderArrayItems(reactiveArray);
        reactiveArray.setAtIndex = (idx, value) => { reactiveArray[idx] = value; };

        renderArrayItems(reactiveArray); // Initial render
        return reactiveArray;
    };

    const linkDataToElement = (dataObject, dataProperty, targetElements, options) => {
        const relevantElements = coerceToArray(resolveElements(targetElements));
        const bindingOptions = options || {};
        const initialValue = dataObject[dataProperty];

        if (isCollection(initialValue)) {
            let currentReactiveArray;

            Object.defineProperty(dataObject, dataProperty, {
                get: () => currentReactiveArray,
                set: (newValue) => {
                    if (!isCollection(newValue)) {
                        return;
                    }
                    currentReactiveArray = linkArrayToTemplate(newValue, relevantElements[0], bindingOptions.keyAttr);
                },
                configurable: true
            });

            dataObject[dataProperty] = initialValue; // Trigger setter to initialize array binding
            return;
        }

        Object.defineProperty(dataObject, dataProperty, {
            get: () => retrieveElementContent(relevantElements[0]),
            set: (freshValue) => {
                applyElementModification(relevantElements, freshValue, bindingOptions);
                if (bindingOptions.afterHook) {
                    bindingOptions.afterHook(freshValue);
                }
            },
            configurable: true
        });

        synchronizeOnInput(dataObject, dataProperty, relevantElements);
        registerLinkageMetadata(dataObject, dataProperty, relevantElements, bindingOptions);

        dataObject[dataProperty] = initialValue; // Force assignment to trigger initial DOM update
    };

    const linkVariableCore = (dataObject, dataProperty, callbackFunction) => {
        let internalValue = dataObject[dataProperty];
        Object.defineProperty(dataObject, dataProperty, {
            get: () => internalValue,
            set: (newValue) => {
                internalValue = newValue;
                callbackFunction(newValue);
            },
            configurable: true
        });
        dataObject[dataProperty] = dataObject[dataProperty]; // Trigger initial callback
    };

    const linkVariableToCallback = (dataObject, propertyList, callbackFunction) => {
        coerceToArray(propertyList).forEach(propName => {
            linkVariableCore(dataObject, propName, callbackFunction);
        });
    };

    const processMarkupActions = (dataObject, elementNodes) => {
        elementNodes.forEach(elementNode => {
            fetchAttributeLabels(elementNode).forEach(attrName => {
                if (attrName.startsWith('data-action-')) {
                    const actionType = attrName.substring('data-action-'.length);
                    const actionDetails = elementNode.getAttribute(attrName);
                    const eventType = `on${actionType.toLowerCase()}`;

                    elementNode[eventType] = function() {
                        const parts = actionDetails.split(':');
                        const command = parts[0];
                        const target = parts[1];

                        if (command === 'call' && dataObject[target] instanceof Function) {
                            dataObject[target](elementNode);
                        } else if (command === 'class') {
                            const classAction = parts[2];
                            if (classAction === 'add') elementNode.classList.add(target);
                            else if (classAction === 'remove') elementNode.classList.remove(target);
                        }
                    };
                }
            });
        });
    };

    const linkObjectToSubtree = (dataObject, rootElementOrSelector, keyAttributeName) => {
        const rootNode = coerceToArray(resolveElements(rootElementOrSelector))[0];
        const bindingAttribute = keyAttributeName || 'data-model-key';

        const allElementsInSubtree = getAllContainedElements(rootNode);

        const keyToElementsMap = allElementsInSubtree.reduce((accumulator, currentElement) => {
            const key = currentElement.getAttribute(bindingAttribute);
            if (key) {
                accumulator[key] = accumulator[key] || [];
                accumulator[key].push(currentElement);
            }
            return accumulator;
        }, {});

        for (const key in keyToElementsMap) {
            if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
                linkDataToElement(dataObject, key, keyToElementsMap[key]);
            }
        }

        processMarkupActions(dataObject, allElementsInSubtree);

        return dataObject;
    };

    // --- Public API ---

    window.dataFlow = {
        link: linkDataToElement,
        linkVar: linkVariableToCallback,
        linkObj: linkObjectToSubtree,
        linkArr: linkArrayToTemplate
    };
})();