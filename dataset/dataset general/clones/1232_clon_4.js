(function (globalScope, voidValue) {
    var docRef = globalScope.document;
    var agentRef = globalScope.navigator;
    var locRef = globalScope.location;

    var ElementForge = (function () {
        var _previousElementForge = globalScope.ElementForge;
        var _previousDollarSymbol = globalScope._ef;
        var documentForgeInstance;

        // Regular expressions, renamed
        var elementIdentifierPattern = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
        var nonWhitespaceCharPattern = /\S/;
        var leadingWhitespacePattern = /^\s+/;
        var trailingWhitespacePattern = /\s+$/;
        var singleHtmlTagPattern = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

        // JSON related regexes from original
        var validJsonChars = /^[\],:{}\s]*$/;
        var validJsonEscape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
        var validJsonTokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
        var validJsonBraces = /(?:^|:|,)(?:\s*\[)+/g;

        // Browser agent regexes
        var webkitAgentPattern = /(webkit)[ \/]([\w.]+)/;
        var operaAgentPattern = /(opera)(?:.*version)?[ \/]([\w.]+)/;
        var msieAgentPattern = /(msie) ([\w.]+)/;
        var mozillaAgentPattern = /(mozilla)(?:.*? rv:([\w.]+))?/;

        // Dashed string for camelizing
        var dashAlphaPattern = /-([a-z]|[0-9])/ig;
        var msPrefixPattern = /^-ms-/;

        // Utility method references
        var objectToString = Object.prototype.toString;
        var hasOwnPropertyCheck = Object.prototype.hasOwnProperty;
        var arrayPush = Array.prototype.push;
        var arraySlice = Array.prototype.slice;
        var stringTrim = String.prototype.trim;
        var arrayIndexOf = Array.prototype.indexOf;
        var arrayConcat = Array.prototype.concat;

        // Type mapping
        var typeClassificationMap = {};
        var typeNames = "Boolean Number String Function Array Date RegExp Object".split(" ");
        for (var i = 0; i < typeNames.length; i++) {
            typeClassificationMap["[object " + typeNames[i] + "]"] = typeNames[i].toLowerCase();
        }

        // Helper functions
        var getObjectType = function (obj) {
            return obj == null ?
                String(obj) :
                typeClassificationMap[objectToString.call(obj)] || "object";
        };

        var isExecutable = function (obj) {
            return getObjectType(obj) === "function";
        };

        var isCollection = Array.isArray || function (obj) {
            return getObjectType(obj) === "array";
        };

        var isPlainObject = function (obj) {
            if (!obj || getObjectType(obj) !== "object" || obj.nodeType || obj.setInterval) {
                return false;
            }

            if (obj.constructor &&
                !hasOwnPropertyCheck.call(obj, "constructor") &&
                !hasOwnPropertyCheck.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }

            var key;
            for (key in obj) {}
            return key === voidValue || hasOwnPropertyCheck.call(obj, key);
        };

        var convertToCamelCase = function (all, char) {
            return (char + "").toUpperCase();
        };

        var mergeArrays = function (target, source) {
            var i = target.length,
                j = 0;
            if (typeof source.length === "number") {
                for (var len = source.length; j < len; j++) {
                    target[i++] = source[j];
                }
            } else {
                while (source[j] !== voidValue) {
                    target[i++] = source[j++];
                }
            }
            target.length = i;
            return target;
        };

        // Simplified Event Registry (analogous to jQuery.Callbacks)
        var EventRegistry = function (flags) {
            var callbackList = [];
            var hasFired = false;
            var isFiring;
            var rememberedArgs;
            var fireOnce = flags.indexOf("once") > -1;
            var rememberResult = flags.indexOf("memory") > -1;

            var performFire = function (data) {
                rememberedArgs = rememberResult && data;
                hasFired = true;
                isFiring = true;
                for (var j = 0; j < callbackList.length; j++) {
                    // Simplified stopOnFalse behavior
                    if (callbackList[j].apply(data[0], data[1]) === false && flags.indexOf("stopOnFalse") > -1) {
                        break;
                    }
                }
                isFiring = false;
                if (fireOnce) {
                    callbackList = [];
                }
            };

            var registry = {
                add: function () {
                    if (callbackList) {
                        var initialLength = callbackList.length;
                        (function addArgs(args) {
                            arraySlice.call(args).forEach(function (arg) {
                                if (isExecutable(arg)) {
                                    if (registry.has(arg)) { return; } // Prevent adding same function twice
                                    callbackList.push(arg);
                                } else if (isCollection(arg)) {
                                    addArgs(arg);
                                }
                            });
                        })(arguments);

                        if (rememberedArgs && !hasFired) { // If memory flag and not yet fired, but remembered data exists
                           performFire(rememberedArgs);
                        } else if (rememberedArgs && hasFired && initialLength === 0) { // If memory and already fired, and new items added
                            performFire(rememberedArgs);
                        }
                    }
                    return this;
                },
                remove: function () {
                    if (callbackList) {
                        arraySlice.call(arguments).forEach(function (arg) {
                            var idx = arrayIndexOf.call(callbackList, arg);
                            if (idx > -1) {
                                callbackList.splice(idx, 1);
                            }
                        });
                    }
                    return this;
                },
                has: function (fn) {
                    return fn ? arrayIndexOf.call(callbackList, fn) > -1 : callbackList.length > 0;
                },
                empty: function () {
                    callbackList = [];
                    return this;
                },
                disable: function () {
                    callbackList = rememberedArgs = voidValue;
                    return this;
                },
                fireWith: function (context, args) {
                    if (callbackList && (!fireOnce || !hasFired)) {
                        args = args || [];
                        args = [context, args.slice ? args.slice() : args];
                        performFire(args);
                    }
                    return this;
                },
                fire: function () {
                    registry.fireWith(this, arguments);
                    return this;
                },
                fired: function () {
                    return !!hasFired;
                }
            };
            return registry;
        };

        // DOM Ready state variables
        var documentIsReady = false;
        var readyTaskCounter = 1;
        var domContentLoadedCallback;
        var completionHandlers;

        var signalDocumentReady = function (isHoldRelease) {
            if ((isHoldRelease === true && !--readyTaskCounter) || (isHoldRelease !== true && !documentIsReady)) {
                if (!docRef.body) {
                    return globalScope.setTimeout(signalDocumentReady, 1);
                }

                documentIsReady = true;

                if (isHoldRelease !== true && --readyTaskCounter > 0) {
                    return;
                }

                completionHandlers.fireWith(docRef, [ElementForge]);
                // Original jQuery would trigger events here. For Type IV, we omit the event system cloning.
            }
        };

        domContentLoadedCallback = function () {
            if (docRef.addEventListener) {
                docRef.removeEventListener("DOMContentLoaded", domContentLoadedCallback, false);
                signalDocumentReady();
            } else if (docRef.attachEvent) {
                if (docRef.readyState === "complete") {
                    docRef.detachEvent("onreadystatechange", domContentLoadedCallback);
                    signalDocumentReady();
                }
            }
        };

        var setupReadyEventHandlers = function () {
            if (completionHandlers) {
                return;
            }

            completionHandlers = EventRegistry("once memory");

            if (docRef.readyState === "complete") {
                return globalScope.setTimeout(signalDocumentReady, 1);
            }

            if (docRef.addEventListener) {
                docRef.addEventListener("DOMContentLoaded", domContentLoadedCallback, false);
                globalScope.addEventListener("load", signalDocumentReady, false);
            } else if (docRef.attachEvent) {
                docRef.attachEvent("onreadystatechange", domContentLoadedCallback);
                globalScope.attachEvent("onload", signalDocumentReady);

                // Simplified IE doScrollCheck equivalent
                var checkIEState = function () {
                    if (documentIsReady) { return; }
                    try {
                        docRef.documentElement.doScroll("left");
                    } catch (e) {
                        globalScope.setTimeout(checkIEState, 1);
                        return;
                    }
                    signalDocumentReady();
                };
                if (docRef.documentElement.doScroll && globalScope.frameElement == null) {
                    checkIEState();
                }
            }
        };

        // Core constructor function
        function ElementForge(selector, context, rootForge) {
            return new ElementForge.prototype._createForgeInstance(selector, context, rootForge);
        }

        // Prototype and alias
        ElementForge.prototype = {
            constructor: ElementForge,
            versionString: "1.7.1", // analogous to jquery version
            elementCount: 0, // analogous to length
            selectionDescriptor: "", // analogous to selector property
            _previousSelection: null, // analogous to prevObject

            _createForgeInstance: function (selector, context, rootForge) {
                rootForge = rootForge || documentForgeInstance;

                if (!selector) {
                    return this;
                }

                if (selector.nodeType) {
                    this.selectionContext = selector;
                    this[0] = selector;
                    this.elementCount = 1;
                    return this;
                }

                if (selector === "body" && !context && docRef.body) {
                    this.selectionContext = docRef;
                    this[0] = docRef.body;
                    this.elementCount = 1;
                    this.selectionDescriptor = selector;
                    return this;
                }

                if (typeof selector === "string") {
                    var matchedSelector;
                    if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
                        matchedSelector = [null, selector, null];
                    } else {
                        matchedSelector = elementIdentifierPattern.exec(selector);
                    }

                    if (matchedSelector && (matchedSelector[1] || !context)) {
                        if (matchedSelector[1]) {
                            context = context instanceof ElementForge ? context[0] : context;
                            var ownerDocument = (context ? context.ownerDocument || context : docRef);
                            var elementsToMerge;

                            var tagMatch = singleHtmlTagPattern.exec(selector);
                            if (tagMatch) {
                                elementsToMerge = [ownerDocument.createElement(tagMatch[1])];
                                if (isPlainObject(context)) {
                                    setElementAttributes(elementsToMerge[0], context);
                                }
                            } else {
                                var tempDiv = ownerDocument.createElement("div");
                                tempDiv.innerHTML = matchedSelector[1];
                                elementsToMerge = arraySlice.call(tempDiv.childNodes);
                            }
                            return mergeArrays(this, elementsToMerge);
                        } else {
                            var foundElement = docRef.getElementById(matchedSelector[2]);
                            if (foundElement && foundElement.parentNode) {
                                if (foundElement.id !== matchedSelector[2]) {
                                    return rootForge.find(selector);
                                }
                                this.elementCount = 1;
                                this[0] = foundElement;
                            }
                            this.selectionContext = docRef;
                            this.selectionDescriptor = selector;
                            return this;
                        }
                    } else if (!context || context instanceof ElementForge) {
                        return (context || rootForge).find(selector);
                    } else {
                        return new ElementForge(context).find(selector);
                    }
                } else if (isExecutable(selector)) {
                    return rootForge.onDocumentReady(selector);
                }

                if (selector.selectionDescriptor !== voidValue) {
                    this.selectionDescriptor = selector.selectionDescriptor;
                    this.selectionContext = selector.selectionContext;
                }

                return mergeArrays(this, isCollection(selector) ? selector : arraySlice.call(selector));
            },

            // Prototype methods
            length: 0, // Ensure length is initialized
            countElements: function () { // size
                return this.elementCount;
            },
            asArray: function () { // toArray
                return arraySlice.call(this, 0, this.elementCount);
            },
            retrieve: function (idx) { // get
                return idx == null ? this.asArray() : (idx < 0 ? this[this.elementCount + idx] : this[idx]);
            },
            pushElementsToStack: function (elements, operationName, descriptor) { // pushStack
                var newForgeInstance = new this.constructor(); // New empty ElementForge object

                if (isCollection(elements)) {
                    arrayPush.apply(newForgeInstance, elements);
                } else {
                    mergeArrays(newForgeInstance, elements);
                }
                newForgeInstance.elementCount = newForgeInstance.length;

                newForgeInstance._previousSelection = this;
                newForgeInstance.selectionContext = this.selectionContext;

                if (operationName === "find") {
                    newForgeInstance.selectionDescriptor = this.selectionDescriptor + (this.selectionDescriptor ? " " : "") + descriptor;
                } else if (operationName) {
                    newForgeInstance.selectionDescriptor = this.selectionDescriptor + "." + operationName + "(" + descriptor + ")";
                }
                return newForgeInstance;
            },
            forEachElement: function (callback, args) { // each
                return ElementForge.forEach(this, callback, args);
            },
            onDocumentReady: function (fn) { // ready
                ElementForge.setupReadyEventHandlers();
                completionHandlers.add(fn);
                return this;
            },
            elementAtIndex: function (i) { // eq
                i = +i;
                return this.sliceSelection(i === -1 ? i : i, i === -1 ? voidValue : i + 1);
            },
            firstElement: function () { // first
                return this.elementAtIndex(0);
            },
            lastElement: function () { // last
                return this.elementAtIndex(-1);
            },
            sliceSelection: function () { // slice
                return this.pushElementsToStack(arraySlice.apply(this, arguments), "slice", arraySlice.call(arguments).join(","));
            },
            transformSelection: function (callback) { // map
                var self = this;
                return this.pushElementsToStack(ElementForge.transformAndMap(this, function (elem, i) {
                    return callback.call(elem, i, elem);
                }));
            },
            returnToPrevious: function () { // end
                return this._previousSelection || new this.constructor(null);
            },
            // Direct array methods
            push: arrayPush,
            sort: [].sort,
            splice: [].splice,

            // Find method using querySelectorAll
            find: function (selector) {
                var currentElements = this.elementCount === 0 ? [] : this.asArray();
                var foundNodes = [];
                currentElements.forEach(function (elem) {
                    try {
                        arrayPush.apply(foundNodes, arraySlice.call(elem.querySelectorAll(selector)));
                    } catch (e) {
                        // Suppress invalid selector errors, similar to jQuery
                    }
                });

                var uniqueFoundNodes = [];
                var seenNodes = new Set();
                foundNodes.forEach(function (node) {
                    if (!seenNodes.has(node)) {
                        seenNodes.add(node);
                        uniqueFoundNodes.push(node);
                    }
                });
                return this.pushElementsToStack(uniqueFoundNodes, "find", selector);
            }
        };

        // Ensure _createForgeInstance inherits prototype methods
        ElementForge.prototype._createForgeInstance.prototype = ElementForge.prototype;

        // Helper for setting attributes on element creation
        function setElementAttributes(element, attrs) {
            for (var key in attrs) {
                if (hasOwnPropertyCheck.call(attrs, key)) {
                    element.setAttribute(key, attrs[key]);
                }
            }
        }

        // Static deepMerge (analogous to jQuery.extend)
        var deepMerge = function () {
            var options, propName, source, value, isArrayCopy, cloneItem,
                target = arguments[0] || {},
                idx = 1,
                numArgs = arguments.length,
                deepCopy = false;

            if (typeof target === "boolean") {
                deepCopy = target;
                target = arguments[1] || {};
                idx = 2;
            }

            if (typeof target !== "object" && !isExecutable(target)) {
                target = {};
            }

            if (numArgs === idx) {
                target = this;
                --idx;
            }

            for (; idx < numArgs; idx++) {
                if ((options = arguments[idx]) != null) {
                    for (propName in options) {
                        source = target[propName];
                        value = options[propName];

                        if (target === value) {
                            continue;
                        }

                        if (deepCopy && value && (isPlainObject(value) || (isArrayCopy = isCollection(value)))) {
                            if (isArrayCopy) {
                                isArrayCopy = false;
                                cloneItem = source && isCollection(source) ? source : [];
                            } else {
                                cloneItem = source && isPlainObject(source) ? source : {};
                            }

                            target[propName] = deepMerge(deepCopy, cloneItem, value);
                        } else if (value !== voidValue) {
                            target[propName] = value;
                        }
                    }
                }
            }
            return target;
        };
        ElementForge.deepMerge = ElementForge.prototype.deepMerge = deepMerge;

        // Static methods using deepMerge
        ElementForge.deepMerge({
            releaseGlobalControl: function (deepRelease) { // noConflict
                if (globalScope._ef === ElementForge) {
                    globalScope._ef = _previousDollarSymbol;
                }
                if (deepRelease && globalScope.ElementForge === ElementForge) {
                    globalScope.ElementForge = _previousElementForge;
                }
                return ElementForge;
            },
            documentIsReady: false,
            readyTaskCounter: 1,
            pauseReadyEvent: function (shouldHold) { // holdReady
                if (shouldHold) {
                    ElementForge.readyTaskCounter++;
                } else {
                    ElementForge.signalDocumentReady(true);
                }
            },
            signalDocumentReady: signalDocumentReady,
            setupReadyEventHandlers: setupReadyEventHandlers,
            isExecutable: isExecutable,
            isCollection: isCollection,
            isPlainObject: isPlainObject,
            getObjectType: getObjectType,

            // Static `each` method
            forEach: function (collection, callback, args) {
                var index = 0,
                    len = collection.length,
                    isObject = len === voidValue || isExecutable(collection);

                if (isObject) {
                    for (index in collection) {
                        if (callback.apply(collection[index], args || [index, collection[index]]) === false) {
                            break;
                        }
                    }
                } else {
                    for (; index < len; index++) {
                        if (callback.apply(collection[index], args || [index, collection[index]]) === false) {
                            break;
                        }
                    }
                }
                return collection;
            },

            // Static `map` method
            transformAndMap: function (collection, callback, args) {
                var results = [];
                var index = 0,
                    len = collection.length,
                    isObject = len === voidValue || isExecutable(collection);

                if (isObject) {
                    for (index in collection) {
                        var value = callback.apply(collection[index], args || [index, collection[index]]);
                        if (value != null) {
                            results.push(value);
                        }
                    }
                } else {
                    for (; index < len; index++) {
                        var value = callback.apply(collection[index], args || [index, collection[index]]);
                        if (value != null) {
                            results.push(value);
                        }
                    }
                }
                return arrayConcat.apply([], results); // Flatten the array
            }
        });

        // Initialize documentForgeInstance (analogous to rootjQuery)
        documentForgeInstance = new ElementForge(docRef);

        // Setup DOM ready listeners
        ElementForge.setupReadyEventHandlers();

        return ElementForge;
    })();

    globalScope.ElementForge = globalScope._ef = ElementForge;
})(window, undefined);