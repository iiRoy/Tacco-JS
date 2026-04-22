((contextualizer) => {

    const performNoOperation = () => {};

    const assignProperties = (targetObject, sourceObject) => {
        return Object.assign(targetObject, sourceObject || {});
    };

    const transformToFunction = (valueCandidate) => {
        return (typeof valueCandidate === 'function') ? valueCandidate : () => valueCandidate;
    };

    const acquireCurrentMoment = () => {
        return Date.now();
    };

    const uniformizeToArray = (item) => {
        const itemKind = determineObjectKind(item);
        return (itemKind && itemKind !== 'array') ? [item] : (item || []);
    };

    const determineObjectKind = ((protoToStr) => {
        return (subject) => {
            if (subject === null) return 'null';
            if (subject === undefined) return 'undefined';
            const tag = protoToStr.call(subject);
            return tag.substring(8, tag.length - 1).toLowerCase();
        };
    })(Object.prototype.toString);

    const processCollection = (dataCollection, operation) => {
        const kind = determineObjectKind(dataCollection);
        if (kind === 'object') {
            Object.keys(dataCollection).forEach(key => operation(dataCollection[key], key));
        } else if (kind === 'array' || kind === 'nodelist' || kind === 'arguments') {
            Array.from(dataCollection).forEach((item, index) => operation(item, index));
        }
    };

    const deepCombine = (...inputObjects) => {
        return inputObjects.reduce((accumulator, currentObject) => {
            if (determineObjectKind(currentObject) !== 'object') {
                return accumulator;
            }
            Object.keys(currentObject).forEach(key => {
                const sourceProp = currentObject[key];
                const destProp = accumulator[key];
                if (determineObjectKind(sourceProp) === 'object' && determineObjectKind(destProp) === 'object') {
                    accumulator[key] = deepCombine(destProp, sourceProp);
                } else {
                    accumulator[key] = duplicateStructure(sourceProp);
                }
            });
            return accumulator;
        }, {});
    };

    const duplicateStructure = (itemToCopy) => {
        const itemKind = determineObjectKind(itemToCopy);
        if (itemKind === 'object') {
            const newObject = {};
            for (const prop in itemToCopy) {
                newObject[prop] = duplicateStructure(itemToCopy[prop]);
            }
            return newObject;
        } else if (itemKind === 'array') {
            const newArray = [];
            for (let i = 0; i < itemToCopy.length; i++) {
                newArray[i] = duplicateStructure(itemToCopy[i]);
            }
            return newArray;
        }
        return itemToCopy;
    };

    const convertRgbToHexadecimal = (colorArray, returnAsArray) => {
        if (colorArray.length < 3) return null;
        if (colorArray.length === 4 && colorArray[3] === 0 && !returnAsArray) return 'transparent';

        const hexComponents = colorArray.slice(0, 3).map(component => {
            const val = parseInt(component, 10);
            const hex = val.toString(16);
            return hex.padStart(2, '0');
        });
        return returnAsArray ? hexComponents : '#' + hexComponents.join('');
    };

    const eradicateElement = (domElement) => {
        while (domElement.firstChild) {
            eradicateElement(domElement.firstChild);
        }
        if (domElement.parentNode) {
            domElement.parentNode.removeChild(domElement);
        }
        if (domElement.clearAttributes) {
            domElement.clearAttributes();
        }
    };

    const purgeChildren = (containerElement) => {
        Array.from(containerElement.childNodes).forEach(child => eradicateElement(child));
    };

    const attachEventListener = (targetNode, eventName, handlerFunction) => {
        if (targetNode.addEventListener) {
            targetNode.addEventListener(eventName, handlerFunction, false);
        } else if (targetNode.attachEvent) {
            targetNode.attachEvent('on' + eventName, handlerFunction);
        }
    };

    const possessesClass = (elementNode, classNameString) => {
        return elementNode.classList ? elementNode.classList.contains(classNameString) :
               new RegExp(`(^|\\s)${classNameString}(\\s|$)`).test(elementNode.className);
    };

    const acquireClass = (elementNode, classNameString) => {
        if (!possessesClass(elementNode, classNameString)) {
            elementNode.classList ? elementNode.classList.add(classNameString) :
                                    (elementNode.className += ` ${classNameString}`);
        }
    };

    const releaseClass = (elementNode, classNameString) => {
        if (elementNode.classList) {
            elementNode.classList.remove(classNameString);
        } else {
            elementNode.className = elementNode.className.replace(new RegExp(`(^|\\s)${classNameString}(?:\\s|$)`), '$1');
        }
    };

    const retrieveElementById = (idString) => {
        return document.getElementById(idString);
    };

    // --- Custom Object Construction System (Class Clone) ---

    const Blueprint = function(specification) {
        specification = specification || {};

        const Constructor = function(...args) {
            this.constructor = Constructor;
            if (Blueprint.isPrototyping) return this;
            
            const instance = (this.initialize) ? this.initialize.apply(this, args) : this;
            return instance;
        };

        for (const mutatorName in Blueprint.MutatorHandlers) {
            if (specification[mutatorName]) {
                specification = Blueprint.MutatorHandlers[mutatorName](specification, specification[mutatorName]);
                delete specification[mutatorName];
            }
        }

        assignProperties(Constructor, this);
        Constructor.constructor = Blueprint;
        Constructor.prototype = specification;
        return Constructor;
    };

    Blueprint.MutatorHandlers = {
        ExtendFrom: function(currentSpec, baseClass) {
            Blueprint.isPrototyping = true;
            const tempInstance = new baseClass();
            delete tempInstance.ancestor; // 'ancestor' will be handled by 'mergeIntoPrototype'
            const mergedSpec = Blueprint.mergeIntoPrototype(tempInstance, currentSpec);
            delete Blueprint.isPrototyping;
            return mergedSpec;
        },

        ImplementTraits: function(currentSpec, traitClasses) {
            processCollection(uniformizeToArray(traitClasses), (trait) => {
                // For 'Implements', the original just extends properties, without special parent handling.
                assignProperties(currentSpec, (determineObjectKind(trait) === 'function') ? new trait() : trait);
            });
            return currentSpec;
        }
    };

    assignProperties(Blueprint, {
        mergeIntoPrototype: function(targetPrototype, newProperties) {
            const callingContext = arguments.callee.caller;

            for (const propKey in newProperties) {
                const newPropValue = newProperties[propKey];
                const existingPropValue = targetPrototype[propKey];
                const valueKind = determineObjectKind(newPropValue);

                if (existingPropValue && valueKind === 'function') {
                    if (newPropValue !== existingPropValue) {
                        if (callingContext) { // If called during class definition (e.g. by ExtendFrom)
                            newPropValue.__ancestorMethod = existingPropValue;
                            targetPrototype[propKey] = newPropValue;
                        } else { // If called later (e.g. by addCapabilities)
                            Blueprint.wrapMethod(targetPrototype, propKey, newPropValue, existingPropValue);
                        }
                    }
                } else if (valueKind === 'object') {
                    targetPrototype[propKey] = deepCombine(existingPropValue, newPropValue);
                } else {
                    targetPrototype[propKey] = newPropValue;
                }
            }

            if (callingContext && !targetPrototype.ancestor) {
                targetPrototype.ancestor = function(...args) {
                    const currentExecutingMethod = arguments.callee.caller;
                    if (currentExecutingMethod && currentExecutingMethod.__ancestorMethod) {
                        return currentExecutingMethod.__ancestorMethod.apply(this, args);
                    }
                    return undefined;
                };
            }

            return targetPrototype;
        },

        wrapMethod: function(targetObject, methodName, newMethod, previousMethodInChain) {
            const wrappedFunction = function(...args) {
                const tempAncestor = this.ancestor;
                this.ancestor = previousMethodInChain;
                const result = newMethod.apply(this, args);
                this.ancestor = tempAncestor;
                return result;
            };
            newMethod.__ancestorMethod = previousMethodInChain;
            targetObject[methodName] = wrappedFunction;
        }
    });

    Blueprint.prototype.addCapabilities = function(...propertySets) {
        propertySets.forEach(properties => {
            Blueprint.mergeIntoPrototype(this.prototype, properties);
        });
        return this;
    };

    // --- Hierarchical Data Operations (TreeUtil Clone) ---
    contextualizer.HierarchicalDataOperations = {

        trimTree: function(dataRoot, maxAllowedLevel) {
            const traversalQueue = [{ node: dataRoot, level: 0 }];
            while (traversalQueue.length > 0) {
                const { node, level } = traversalQueue.shift();
                if (level === maxAllowedLevel && node.children) {
                    node.children = [];
                } else if (level < maxAllowedLevel && node.children) {
                    node.children.forEach(child => traversalQueue.push({ node: child, level: level + 1 }));
                }
            }
        },

        findParentOf: function(dataRoot, childIdentifier) {
            if (dataRoot.id === childIdentifier) return null;

            const traversalStack = [{ node: dataRoot, path: [] }];
            while (traversalStack.length > 0) {
                const { node, path } = traversalStack.pop();

                if (node.children) {
                    for (let i = 0; i < node.children.length; i++) {
                        const child = node.children[i];
                        if (child.id === childIdentifier) {
                            return node;
                        }
                        traversalStack.push({ node: child, path: path.concat(node) });
                    }
                }
            }
            return null;
        },

        extractSubtree: function(dataRoot, subtreeIdentifier) {
            const traversalStack = [dataRoot];
            while (traversalStack.length > 0) {
                const currentNode = traversalStack.pop();
                if (currentNode.id === subtreeIdentifier) {
                    return currentNode;
                }
                if (currentNode.children) {
                    for (let i = currentNode.children.length - 1; i >= 0; i--) {
                        traversalStack.push(currentNode.children[i]);
                    }
                }
            }
            return null;
        },

        retrieveLeaves: function(dataNode, maximumDepth) {
            const leafNodes = [];
            const depthLimit = maximumDepth || Number.MAX_VALUE;
            const traversalStack = [{ node: dataNode, currentDepth: 0 }];

            while (traversalStack.length > 0) {
                const { node, currentDepth } = traversalStack.pop();

                if (currentDepth < depthLimit && (!node.children || node.children.length === 0)) {
                    leafNodes.push({
                        element: node,
                        depthFromLimit: depthLimit - currentDepth
                    });
                }

                if (node.children && currentDepth < depthLimit) {
                    for (let i = node.children.length - 1; i >= 0; i--) {
                        traversalStack.push({ node: node.children[i], currentDepth: currentDepth + 1 });
                    }
                }
            }
            return leafNodes;
        },

        processByLevel: function(dataTree, startLevel, endLevel, operationCallback) {
            const nodeQueue = [{ node: dataTree, currentLevel: startLevel }];
            while (nodeQueue.length > 0) {
                const { node, currentLevel } = nodeQueue.shift();

                if (currentLevel <= endLevel) {
                    operationCallback(node, currentLevel);
                    if (node.children) {
                        node.children.forEach(child => {
                            nodeQueue.push({ node: child, currentLevel: currentLevel + 1 });
                        });
                    }
                }
            }
        },

        forEachNode: function(dataTree, operationCallback) {
            this.processByLevel(dataTree, 0, Number.MAX_VALUE, operationCallback);
        },

        populateSubtrees: function(targetTree, dataProvider) {
            const depthForRequests = dataProvider.request && dataProvider.depthThreshold;
            const currentLeaves = this.retrieveLeaves(targetTree, depthForRequests);
            const totalLeaves = currentLeaves.length;
            const identifiedNodes = {};

            if (totalLeaves === 0) {
                if (dataProvider.onCompletion) dataProvider.onCompletion();
                return;
            }

            let completedRequests = 0;

            currentLeaves.forEach(leafInfo => {
                const leafNode = leafInfo.element;
                const leafId = leafNode.id;
                identifiedNodes[leafId] = leafNode;

                dataProvider.request(leafId, leafInfo.depthFromLimit, {
                    onSuccess: function(fetchedId, fetchedSubtree) {
                        if (fetchedSubtree && fetchedSubtree.children) {
                            identifiedNodes[fetchedId].children = fetchedSubtree.children;
                        }
                        completedRequests++;
                        if (completedRequests === totalLeaves) {
                            if (dataProvider.onCompletion) dataProvider.onCompletion();
                        }
                    }
                });
            });
        }
    };

})(this);