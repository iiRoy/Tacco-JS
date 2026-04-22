(function( globalWindow, voidValue ) {
    const documentObject = globalWindow.document;
    const locationInfo = globalWindow.location;
    const navigatorAgent = globalWindow.navigator;

    const priorComposer = globalWindow.PageComposer;
    const priorDollarSign = globalWindow.$;

    const arrayPushOperation = Array.prototype.push;
    const arraySliceOperation = Array.prototype.slice;
    const objectStringRepresentation = Object.prototype.toString;
    const objectOwnPropertyCheck = Object.prototype.hasOwnProperty;

    const whitespaceRemoval = /^\s+|\s+$/g;
    const htmlIdentifierCheck = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
    const singleTagCheck = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;

    const dashToCamel = (match, character) => character.toUpperCase();

    const kindMapper = new Map();
    "Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach(function(kind) {
        kindMapper.set(`[object ${kind}]`, kind.toLowerCase());
    });

    class PageCollection {
        constructor(elementsArray = []) {
            this.elements = Array.from(elementsArray);
            this.previousSet = null;
            this.currentQuery = "";
            this.originScope = documentObject;
        }

        sizeOfSet() {
            return this.elements.length;
        }

        retrieveAll() {
            return [...this.elements];
        }

        fetchElement(idx) {
            const index = Number(idx);
            if (isNaN(index) || idx === null) {
                return this.retrieveAll();
            }
            return index < 0 ? this.elements[this.elements.length + index] : this.elements[index];
        }

        createNextSet(newElements, actionName, actionDetails) {
            const nextCollection = new PageCollection(newElements);
            nextCollection.previousSet = this;
            nextCollection.originScope = this.originScope;

            if (actionName === "find") {
                nextCollection.currentQuery = this.currentQuery + (this.currentQuery ? " " : "") + actionDetails;
            } else if (actionName) {
                nextCollection.currentQuery = `${this.currentQuery}.${actionName}(${actionDetails})`;
            }
            return nextCollection;
        }

        traverse(callback, argsArray) {
            PageComposer.iterateOver(this.elements, callback, argsArray);
            return this;
        }

        atIndex(position) {
            const numericPosition = +position;
            return numericPosition === -1
                ? this.extract(numericPosition)
                : this.extract(numericPosition, numericPosition + 1);
        }

        firstElement() {
            return this.atIndex(0);
        }

        lastElement() {
            return this.atIndex(-1);
        }

        extract(...args) {
            return this.createNextSet(arraySliceOperation.apply(this.elements, args), "slice", args.join(","));
        }

        transformElements(callback) {
            const mappedResults = PageComposer.transformList(this.elements, (idx, elem) => {
                return callback.call(elem, idx, elem);
            });
            return this.createNextSet(mappedResults);
        }

        returnToPrevious() {
            return this.previousSet || new PageCollection();
        }

        appendItem(...items) {
            arrayPushOperation.apply(this.elements, items);
        }
        sortItems(compareFn) {
            this.elements.sort(compareFn);
            return this;
        }
        modifyItems(start, deleteCount, ...items) {
            this.elements.splice(start, deleteCount, ...items);
            return this;
        }
    }

    const PageComposer = function(input, contextScope) {
        if (!input) {
            return new PageCollection();
        }

        if (input.nodeType) {
            return new PageCollection([input]);
        }

        if (typeof input === "string") {
            let elementMatch;

            if (input.charAt(0) === "<" && input.charAt(input.length - 1) === ">" && input.length >= 3) {
                elementMatch = [ null, input, null ];
            } else {
                elementMatch = htmlIdentifierCheck.exec(input);
            }

            if (elementMatch && (elementMatch[1] || !contextScope)) {
                if (elementMatch[1]) {
                    const workingContext = (contextScope && contextScope.nodeType ? contextScope.ownerDocument || contextScope : documentObject);
                    const createdElements = PageComposer.buildElements(elementMatch[1], workingContext);
                    return new PageCollection(createdElements);
                }
                else {
                    const foundElement = documentObject.getElementById(elementMatch[2]);
                    if (foundElement && foundElement.parentNode) {
                        if (foundElement.id !== elementMatch[2]) {
                            return new PageCollection();
                        }
                        return new PageCollection([foundElement]);
                    }
                    return new PageCollection();
                }
            }
            else if (contextScope instanceof PageCollection) {
                 return new PageCollection(
                    Array.from(contextScope.elements).flatMap(elem => Array.from(elem.querySelectorAll(input)))
                );
            } else if (contextScope && contextScope.nodeType) {
                return new PageCollection(Array.from(contextScope.querySelectorAll(input)));
            }
            else {
                return new PageCollection(Array.from(documentObject.querySelectorAll(input)));
            }
        }

        if (PageComposer.isCallable(input)) {
            return PageComposer.onReady(input);
        }

        if (input instanceof PageCollection) {
            return new PageCollection(input.elements);
        }

        return new PageCollection(Array.isArray(input) ? input : [input]);
    };

    Object.assign(PageComposer, {
        revertGlobals: function(deepRestoration) {
            if (globalWindow.$ === PageComposer) {
                globalWindow.$ = priorDollarSign;
            }
            if (deepRestoration && globalWindow.PageComposer === PageComposer) {
                globalWindow.PageComposer = priorComposer;
            }
            return PageComposer;
        },

        _documentLoaded: false,
        _readyCallbacks: [],

        onReady: function(callbackFunction) {
            if (PageComposer._documentLoaded) {
                callbackFunction(PageComposer);
            } else {
                PageComposer._readyCallbacks.push(callbackFunction);
            }
            return this;
        },

        _triggerReady: function() {
            if (PageComposer._documentLoaded) {
                return;
            }
            PageComposer._documentLoaded = true;
            PageComposer._readyCallbacks.forEach(fn => fn(PageComposer));
            PageComposer._readyCallbacks = [];
        },

        fetchKind: function(val) {
            if (val === null) return "null";
            if (val === voidValue) return "undefined";
            const kind = kindMapper.get(objectStringRepresentation.call(val));
            return kind || "object";
        },

        isCallable: function(val) {
            return PageComposer.fetchKind(val) === "function";
        },

        isSequence: Array.isArray || function(val) {
            return PageComposer.fetchKind(val) === "array";
        },

        isViewPort: function(val) {
            return val != null && val == val.window;
        },

        isNumericValue: function(val) {
            return !isNaN(parseFloat(val)) && isFinite(val);
        },

        isPureObject: function(val) {
            if (!val || PageComposer.fetchKind(val) !== "object" || val.nodeType || PageComposer.isViewPort(val)) {
                return false;
            }
            try {
                if (val.constructor &&
                    !objectOwnPropertyCheck.call(val, "constructor") &&
                    !objectOwnPropertyCheck.call(val.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                return false;
            }
            let keyCheck;
            for (keyCheck in val) {}
            return keyCheck === voidValue || objectOwnPropertyCheck.call(val, keyCheck);
        },

        isVoidObject: function(val) {
            for (let propName in val) {
                return false;
            }
            return true;
        },

        reportError: function(message) {
            throw new Error(message);
        },

        mixObjects: function(...args) {
            let deepCopy = false;
            let targetObject;
            let startIdx = 0;

            if (typeof args[0] === "boolean") {
                deepCopy = args[0];
                targetObject = args[1] || {};
                startIdx = 2;
            } else {
                targetObject = args[0] || {};
                startIdx = 1;
            }

            if (typeof targetObject !== "object" && !PageComposer.isCallable(targetObject)) {
                targetObject = {};
            }

            if (args.length === startIdx) {
                targetObject = this;
                startIdx--;
            }

            for (let i = startIdx; i < args.length; i++) {
                const currentSource = args[i];
                if (currentSource != null) {
                    for (const key of Object.keys(currentSource)) {
                        const sourceValue = currentSource[key];
                        const targetValue = targetObject[key];

                        if (targetObject === sourceValue) {
                            continue;
                        }

                        if (deepCopy && sourceValue && (PageComposer.isPureObject(sourceValue) || PageComposer.isSequence(sourceValue))) {
                            let cloneValue;
                            if (PageComposer.isSequence(sourceValue)) {
                                cloneValue = PageComposer.isSequence(targetValue) ? targetValue : [];
                            } else {
                                cloneValue = PageComposer.isPureObject(targetValue) ? targetValue : {};
                            }
                            targetObject[key] = PageComposer.mixObjects(deepCopy, cloneValue, sourceValue);
                        } else if (sourceValue !== voidValue) {
                            targetObject[key] = sourceValue;
                        }
                    }
                }
            }
            return targetObject;
        },

        iterateOver: function(collection, callback, args) {
            let i = 0, length = collection.length;
            let isArrayLike = length === +length;

            if (isArrayLike) {
                for (; i < length; i++) {
                    if (callback.apply(collection[i], args || [i, collection[i]]) === false) {
                        break;
                    }
                }
            } else {
                for (i in collection) {
                    if (callback.apply(collection[i], args || [i, collection[i]]) === false) {
                        break;
                    }
                }
            }
            return collection;
        },

        transformList: function(collection, callback) {
            let transformed = [];
            if (Array.isArray(collection)) {
                for (let i = 0; i < collection.length; i++) {
                    const value = callback(collection[i], i);
                    if (value != null) {
                        transformed.push(value);
                    }
                }
            } else {
                for (const key in collection) {
                    const value = callback(collection[key], key);
                    if (value != null) {
                        transformed.push(value);
                    }
                }
            }
            return [].concat(...transformed);
        },

        buildElements: function(htmlString, contextElement = documentObject) {
            const singleTagMatch = singleTagCheck.exec(htmlString);
            if (singleTagMatch) {
                return [contextElement.createElement(singleTagMatch[1])];
            }
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, "text/html");
            return Array.from(doc.body.children);
        },

        combineCollections: function(firstCollection, secondCollection) {
            const initialLength = firstCollection.length;
            let j = 0;
            while (secondCollection[j] !== voidValue) {
                firstCollection[initialLength + j] = secondCollection[j];
                j++;
            }
            firstCollection.length = initialLength + j;
            return firstCollection;
        }
    });

    if (documentObject.readyState === "complete" || (documentObject.readyState !== "loading" && !documentObject.documentElement.doScroll)) {
        setTimeout(PageComposer._triggerReady);
    } else if (documentObject.addEventListener) {
        documentObject.addEventListener("DOMContentLoaded", PageComposer._triggerReady, false);
        globalWindow.addEventListener("load", PageComposer._triggerReady, false);
    } else {
        documentObject.attachEvent("onreadystatechange", function() {
            if (documentObject.readyState === "complete") {
                PageComposer._triggerReady();
            }
        });
        globalWindow.attachEvent("onload", PageComposer._triggerReady);
    }

    globalWindow.PageComposer = globalWindow.$ = PageComposer;

})( window );