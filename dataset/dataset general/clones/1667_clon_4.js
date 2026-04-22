(function( globalObject, undefinedValue ) {

    const typeInspect = {
        isFunc: (target) => typeof target === 'function',
        isArr: (target) => Array.isArray(target),
        isObjectLike: (target) => target !== null && typeof target === 'object',
        isElementNode: (target) => typeInspect.isObjectLike(target) && target.nodeType !== undefinedValue,
        isWindowObject: (target) => typeInspect.isObjectLike(target) && target === target.window,
        isPlainObject: (target) => {
            if (!typeInspect.isObjectLike(target) || typeInspect.isElementNode(target) || typeInspect.isWindowObject(target)) {
                return false;
            }
            const currentProto = Object.getPrototypeOf(target);
            if (currentProto === null) { // Object.create(null)
                return true;
            }
            const constructorRef = Object.prototype.hasOwnProperty.call(target, 'constructor') && target.constructor;
            if (constructorRef && !Object.prototype.hasOwnProperty.call(constructorRef.prototype, 'isPrototypeOf')) {
                return false;
            }
            return currentProto === Object.prototype;
        },
        isEmptyObject: (target) => { for (const prop in target) return false; return true; }
    };

    const objectMerger = (deepCopy, targetObj, ...sourceObjs) => {
        if (typeof deepCopy !== 'boolean') {
            sourceObjs.unshift(targetObj);
            targetObj = deepCopy;
            deepCopy = false;
        }

        if (!typeInspect.isObjectLike(targetObj) || typeInspect.isFunc(targetObj)) {
            targetObj = {};
        }

        for (const source of sourceObjs) {
            if (source !== null && typeInspect.isObjectLike(source)) {
                for (const key in source) {
                    const sourceValue = source[key];
                    const targetValue = targetObj[key];

                    if (targetObj === sourceValue) {
                        continue;
                    }

                    if (deepCopy && sourceValue && (typeInspect.isPlainObject(sourceValue) || typeInspect.isArr(sourceValue))) {
                        let clonedValue;
                        if (typeInspect.isArr(sourceValue)) {
                            clonedValue = typeInspect.isArr(targetValue) ? targetValue : [];
                        } else {
                            clonedValue = typeInspect.isPlainObject(targetValue) ? targetValue : {};
                        }
                        targetObj[key] = objectMerger(true, clonedValue, sourceValue);
                    } else if (sourceValue !== undefinedValue) {
                        targetObj[key] = sourceValue;
                    }
                }
            }
        }
        return targetObj;
    };

    const domReadinessManager = {
        isDomReady: false,
        pendingActions: [],
        listenersSetUp: false,

        triggerReadyEvent: () => {
            if (!domReadinessManager.isDomReady) {
                if (!globalObject.document.body) {
                    return globalObject.setTimeout(domReadinessManager.triggerReadyEvent, 15);
                }
                domReadinessManager.isDomReady = true;
                if (domReadinessManager.pendingActions.length > 0) {
                    domReadinessManager.pendingActions.forEach(fn => fn.call(globalObject.document, Selectors));
                    domReadinessManager.pendingActions = [];
                }
            }
        },

        initializeListeners: () => {
            if (domReadinessManager.listenersSetUp) {
                return;
            }
            domReadinessManager.listenersSetUp = true;

            if (globalObject.document.readyState === 'complete') {
                return domReadinessManager.triggerReadyEvent();
            }

            if (globalObject.document.addEventListener) {
                globalObject.document.addEventListener('DOMContentLoaded', domReadinessManager.triggerReadyEvent, false);
                globalObject.addEventListener('load', domReadinessManager.triggerReadyEvent, false);
            } else if (globalObject.document.attachEvent) {
                globalObject.document.attachEvent('onreadystatechange', () => {
                    if (globalObject.document.readyState === 'complete') {
                        domReadinessManager.triggerReadyEvent();
                    }
                });
                globalObject.attachEvent('onload', domReadinessManager.triggerReadyEvent);

                let topFrameCheck = false;
                try {
                    topFrameCheck = globalObject.frameElement == null;
                } catch(err) {}

                if (globalObject.document.documentElement.doScroll && topFrameCheck) {
                    (function scrollPolling() {
                        if (!domReadinessManager.isDomReady) {
                            try {
                                globalObject.document.documentElement.doScroll('left');
                            } catch(err) {
                                return globalObject.setTimeout(scrollPolling, 50);
                            }
                            domReadinessManager.triggerReadyEvent();
                        }
                    })();
                }
            }
        }
    };

    const queryPatterns = {
        htmlOrId: /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w\-]+)$/,
        singleHtmlTag: /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
        simpleTagName: /^\w+$/
    };

    class Selectors {
        constructor(inputToken, searchContext) {
            this.inputQuery = inputToken;
            this.baseContext = searchContext;
            this.collectedElements = [];
            this.previousCollection = null;

            if (!inputToken) {
                return this;
            }

            if (typeInspect.isElementNode(inputToken)) {
                this.collectedElements.push(inputToken);
                return this;
            }

            if (inputToken === "body" && !searchContext) {
                this.collectedElements.push(globalObject.document.body);
                return this;
            }

            if (typeof inputToken === "string") {
                const identifierMatch = queryPatterns.htmlOrId.exec(inputToken);

                if (identifierMatch && (identifierMatch[1] || !searchContext)) {
                    // HTML fragment
                    if (identifierMatch[1]) {
                        const activeDocument = (searchContext && searchContext.ownerDocument) || globalObject.document;
                        const soloTagMatch = queryPatterns.singleHtmlTag.exec(inputToken);

                        let generatedElements;
                        if (soloTagMatch) {
                            generatedElements = [activeDocument.createElement(soloTagMatch[1])];
                            if (typeInspect.isPlainObject(searchContext)) {
                                Selectors.applyElementAttributes(generatedElements[0], searchContext);
                            }
                        } else {
                            const temporaryContainer = activeDocument.createElement('div');
                            temporaryContainer.innerHTML = identifierMatch[1];
                            generatedElements = Array.from(temporaryContainer.children);
                        }
                        this.collectedElements = generatedElements;
                        return this;

                    // ID selector
                    } else {
                        const locatedElement = globalObject.document.getElementById(identifierMatch[2]);
                        if (locatedElement) {
                            if (locatedElement.id === identifierMatch[2]) {
                                this.collectedElements.push(locatedElement);
                            } else {
                                return new Selectors(inputToken, globalObject.document).getElements();
                            }
                        }
                        return this;
                    }

                // Simple tag name (e.g., "span")
                } else if (!searchContext && queryPatterns.simpleTagName.test(inputToken)) {
                    this.collectedElements = Array.from(globalObject.document.getElementsByTagName(inputToken));
                    return this;

                // Selector with a Selectors object or no context
                } else if (searchContext instanceof Selectors || searchContext === undefinedValue) {
                    const baseNodes = searchContext instanceof Selectors ? searchContext.collectedElements : [globalObject.document];
                    this.collectedElements = Selectors.findWithin(inputToken, baseNodes);
                    return this;

                // Selector with a specific DOM element context
                } else {
                    this.collectedElements = Selectors.findWithin(inputToken, [searchContext]);
                    return this;
                }

            // Document ready function
            } else if (typeInspect.isFunc(inputToken)) {
                domReadinessManager.initializeListeners();
                if (domReadinessManager.isDomReady) {
                    inputToken.call(globalObject.document, Selectors);
                } else {
                    domReadinessManager.pendingActions.push(inputToken);
                }
                return this;
            }

            // Existing Selectors object or array-like input
            if (inputToken.inputQuery !== undefinedValue) {
                this.inputQuery = inputToken.inputQuery;
                this.baseContext = inputToken.baseContext;
            }
            this.collectedElements = Array.from(inputToken);
            return this;
        }

        static applyElementAttributes(element, attributes) {
            for (const key in attributes) {
                if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                    element.setAttribute(key, attributes[key]);
                }
            }
        }

        static findWithin(query, contexts) {
            const resultSet = new Set();
            for (const context of contexts) {
                try {
                    const foundItems = context.querySelectorAll(query);
                    for (const el of foundItems) {
                        resultSet.add(el);
                    }
                } catch (e) {
                    // Log or handle invalid selector error
                }
            }
            return Array.from(resultSet);
        }

        createChainedCollection(elements, operationLabel = "", operationDetails = "") {
            const newInstance = new Selectors(null);
            newInstance.collectedElements = elements;
            newInstance.previousCollection = this;
            newInstance.baseContext = this.baseContext;
            
            if (operationLabel === "find") {
                newInstance.inputQuery = this.inputQuery + (this.inputQuery ? " " : "") + operationDetails;
            } else if (operationLabel) {
                newInstance.inputQuery = this.inputQuery + "." + operationLabel + "(" + operationDetails + ")";
            }
            
            return newInstance;
        }

        get length() {
            return this.collectedElements.length;
        }

        elementCount() {
            return this.length;
        }

        toArray() {
            return [...this.collectedElements];
        }

        getElement(index) {
            if (index === undefinedValue || index === null) {
                return this.toArray();
            }
            const actualIndex = index < 0 ? this.length + index : index;
            return this.collectedElements[actualIndex];
        }

        forEachItem(callbackFunction, extraArguments) {
            Selectors.forEachInCollection(this.collectedElements, callbackFunction, extraArguments);
            return this;
        }

        onDocumentReady(handler) {
            domReadinessManager.initializeListeners();
            if (domReadinessManager.isDomReady) {
                handler.call(globalObject.document, Selectors);
            } else {
                domReadinessManager.pendingActions.push(handler);
            }
            return this;
        }

        atSpecificIndex(idx) {
            return this.createChainedCollection([this.getElement(idx)], "atSpecificIndex", idx);
        }

        firstItem() {
            return this.atSpecificIndex(0);
        }

        lastItem() {
            return this.atSpecificIndex(-1);
        }

        section(start, end) {
            const resultingElements = this.collectedElements.slice(start, end);
            const args = [start, end].filter(a => a !== undefinedValue).join(",");
            return this.createChainedCollection(resultingElements, "section", args);
        }

        transformElements(mapper) {
            const mapped = this.collectedElements.map((element, index) => mapper.call(element, index, element));
            const flattened = [].concat(...mapped).filter(e => e !== null && e !== undefinedValue);
            return this.createChainedCollection(flattened, "transformElements");
        }

        revert() {
            return this.previousCollection || new Selectors(null);
        }

        add(item) {
            this.collectedElements.push(item);
            return this;
        }
        order(comparisonFn) {
            this.collectedElements.sort(comparisonFn);
            return this;
        }
        modifyRange(start, deleteCount, ...items) {
            this.collectedElements.splice(start, deleteCount, ...items);
            return this;
        }

        static forEachInCollection(collection, action, additionalArgs) {
            let i = 0;
            const len = collection.length;
            const args = additionalArgs ? additionalArgs : [];

            if (typeInspect.isArr(collection) || (typeof collection.length === 'number' && collection.length > 0 && collection[0] !== undefinedValue)) {
                for (; i < len; i++) {
                    if (action.apply(collection[i], args.concat(i, collection[i])) === false) {
                        break;
                    }
                }
            } else {
                for (i in collection) {
                    if (action.apply(collection[i], args.concat(i, collection[i])) === false) {
                        break;
                    }
                }
            }
            return collection;
        }

        static combineElementCollections(target, source) {
            const uniqueElements = new Set([...target.collectedElements, ...source.collectedElements]);
            target.collectedElements = Array.from(uniqueElements);
            return target;
        }
    }

    Selectors.versionIdentifier = "1.0.0-alt";
    Selectors.isReady = false;
    Selectors.mergeObjects = objectMerger;
    Selectors.releaseGlobals = (deepRelease) => {
        globalObject.$ = oldDollarReference;
        if (deepRelease) {
            globalObject.Selectors = oldLibraryReference;
        }
        return Selectors;
    };

    Selectors.mergeObjects(Selectors, {
        isFunction: typeInspect.isFunc,
        isArray: typeInspect.isArr,
        isPlainObject: typeInspect.isPlainObject,
        isEmptyObject: typeInspect.isEmptyObject,
        reportFatalError: (message) => { throw new Error(message); },
        extractJson: (dataString) => JSON.parse(dataString)
    });
    
    Selectors.prototype.mergeObjects = function() {
        return objectMerger(this, ...arguments);
    };

    const oldLibraryReference = globalObject.Selectors;
    const oldDollarReference = globalObject.$;

    globalObject.Selectors = globalObject.$ = (inputToken, searchContext) => new Selectors(inputToken, searchContext);

})( typeof window !== "undefined" ? window : this );