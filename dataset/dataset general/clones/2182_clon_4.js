const DataGateway = (() => {
    const pageDOM = document;
    const currentWindow = window;
    const utilityKit = {};

    let DataProcessor;
    DataProcessor || (DataProcessor = {});

    ((scopeRef) => {
        const stringifyElement = (keyElement, parentObject) => {
            let currentItem,
                propertyKey,
                valueRepresentation,
                spacingPad,
                elementCount = scopeRef.elementPadding;

            let targetValue = parentObject[keyElement];
            if (targetValue && typeof targetValue === "object" && typeof targetValue.toDataString === "function") {
                targetValue = targetValue.toDataString(keyElement);
            }
            if (typeof scopeRef.replacementFunction === "function") {
                targetValue = scopeRef.replacementFunction.call(parentObject, keyElement, targetValue);
            }

            switch (typeof targetValue) {
                case "string":
                    return escapeAndQuote(targetValue);
                case "number":
                    return isFinite(targetValue) ? String(targetValue) : "null";
                case "boolean":
                case "null":
                    return String(targetValue);
                case "object":
                    if (!targetValue) return "null";

                    scopeRef.elementPadding += scopeRef.indentationUnit;
                    const accumulatedSegments = [];

                    if (Object.prototype.toString.call(targetValue) === "[object Array]") {
                        const arrLength = targetValue.length;
                        for (currentItem = 0; currentItem < arrLength; currentItem += 1) {
                            accumulatedSegments[currentItem] = stringifyElement(currentItem, targetValue) || "null";
                        }
                        valueRepresentation = accumulatedSegments.length === 0 ? "[]" : scopeRef.elementPadding ? "[\n" + scopeRef.elementPadding + accumulatedSegments.join(",\n" + scopeRef.elementPadding) + "\n" + elementCount + "]" : "[" + accumulatedSegments.join(",") + "]";
                        scopeRef.elementPadding = elementCount;
                        return valueRepresentation;
                    }

                    if (scopeRef.replacementFunction && typeof scopeRef.replacementFunction === "object") {
                        const repLength = scopeRef.replacementFunction.length;
                        for (currentItem = 0; currentItem < repLength; currentItem += 1) {
                            if (typeof scopeRef.replacementFunction[currentItem] === "string") {
                                propertyKey = scopeRef.replacementFunction[currentItem];
                                valueRepresentation = stringifyElement(propertyKey, targetValue);
                                if (valueRepresentation) {
                                    accumulatedSegments.push(escapeAndQuote(propertyKey) + (scopeRef.elementPadding ? ": " : ":") + valueRepresentation);
                                }
                            }
                        }
                    } else {
                        for (propertyKey in targetValue) {
                            if (Object.prototype.hasOwnProperty.call(targetValue, propertyKey)) {
                                valueRepresentation = stringifyElement(propertyKey, targetValue);
                                if (valueRepresentation) {
                                    accumulatedSegments.push(escapeAndQuote(propertyKey) + (scopeRef.elementPadding ? ": " : ":") + valueRepresentation);
                                }
                            }
                        }
                    }
                    valueRepresentation = accumulatedSegments.length === 0 ? "{}" : scopeRef.elementPadding ? "{\n" + scopeRef.elementPadding + accumulatedSegments.join(",\n" + scopeRef.elementPadding) + "\n" + elementCount + "}" : "{" + accumulatedSegments.join(",") + "}";
                    scopeRef.elementPadding = elementCount;
                    return valueRepresentation;
            }
        };

        const escapeAndQuote = (inputString) => {
            escapePattern.lastIndex = 0;
            return escapePattern.test(inputString) ? '"' + inputString.replace(escapePattern, (char) => {
                const mapped = charMap[char];
                return typeof mapped === "string" ? mapped : "\\u" + ("0000" + char.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + inputString + '"';
        };

        const formatNumberPad = (num) => {
            return num < 10 ? "0" + num : num;
        };

        "use strict";
        if (typeof Date.prototype.toDataString !== "function") {
            Date.prototype.toDataString = function(key) {
                return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + formatNumberPad(this.getUTCMonth() + 1) + "-" + formatNumberPad(this.getUTCDate()) + "T" + formatNumberPad(this.getUTCHours()) + ":" + formatNumberPad(this.getUTCMinutes()) + ":" + formatNumberPad(this.getUTCSeconds()) + "Z" : null;
            };
            String.prototype.toDataString = Number.prototype.toDataString = Boolean.prototype.toDataString = function(key) {
                return this.valueOf();
            };
        }

        const controlCharPattern = /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        const escapePattern = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        const charMap = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };

        if (typeof scopeRef.serialize !== "function") {
            scopeRef.serialize = (dataValue, filter, spacing) => {
                scopeRef.elementPadding = "";
                scopeRef.indentationUnit = "";
                if (typeof spacing === "number") {
                    for (let i = 0; i < spacing; i += 1) {
                        scopeRef.indentationUnit += " ";
                    }
                } else if (typeof spacing === "string") {
                    scopeRef.indentationUnit = spacing;
                }
                scopeRef.replacementFunction = filter;
                if (!filter || typeof filter === "function" || (typeof filter === "object" && typeof filter.length === "number")) {
                    return stringifyElement("", {
                        "": dataValue
                    });
                }
                throw new Error("DataProcessor.serialize: Invalid filter argument");
            };
        }

        if (typeof scopeRef.deserialize !== "function") {
            scopeRef.deserialize = (textInput, transformFunction) => {
                const processNode = (currentKey, parentNode) => {
                    let childKey,
                        transformedValue,
                        currentNode = parentNode[currentKey];
                    if (currentNode && typeof currentNode === "object") {
                        for (childKey in currentNode) {
                            if (Object.prototype.hasOwnProperty.call(currentNode, childKey)) {
                                transformedValue = processNode(currentNode, childKey);
                                if (transformedValue !== undefined) {
                                    currentNode[childKey] = transformedValue;
                                } else {
                                    delete currentNode[childKey];
                                }
                            }
                        }
                    }
                    return transformFunction.call(parentNode, currentKey, currentNode);
                };

                let parsedResult;
                let processedText = String(textInput);
                controlCharPattern.lastIndex = 0;
                if (controlCharPattern.test(processedText)) {
                    processedText = processedText.replace(controlCharPattern, (char) => {
                        return "\\u" + ("0000" + char.charCodeAt(0).toString(16)).slice(-4);
                    });
                }

                if (/^[\],:{}\s]*$/.test(processedText.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                    parsedResult = eval("(" + processedText + ")");
                    return typeof transformFunction === "function" ? processNode({
                        "": parsedResult
                    }, "") : parsedResult;
                }
                throw new SyntaxError("DataProcessor.deserialize: Malformed input");
            };
        }
    })(DataProcessor);

    const createEventSystem = () => {
        let internalState = new Map();
        let isDeactivated = false;
        const availableEventTypes = new Set();

        const addEventType = (type) => availableEventTypes.add(type);
        const checkEventType = (type) => {
            if (!availableEventTypes.has(type)) {
                utilityKit.inform(`Event type '${type}' not registered. Registered types: ${Array.from(availableEventTypes).join(', ')}`);
            }
        };

        const attachObserver = (eventType, observerCallback) => {
            if (isDeactivated) return;
            checkEventType(eventType);
            let observers = internalState.get(eventType);
            if (!observers) {
                observers = new Set();
                internalState.set(eventType, observers);
            }
            observers.add(observerCallback);
        };

        const detachObserver = (eventType, observerCallback) => {
            if (isDeactivated) return;
            checkEventType(eventType);
            const observers = internalState.get(eventType);
            if (observers) {
                observers.delete(observerCallback);
                if (observers.size === 0) {
                    internalState.delete(eventType);
                }
            }
        };

        const triggerEvent = function(eventPayload) {
            if (isDeactivated) return;
            const eventType = eventPayload.kind;
            checkEventType(eventType);

            const invocationArguments = Array.from(arguments);

            const customHandlerProperty = `on${eventType}`;
            if (this && typeof this[customHandlerProperty] === 'function') {
                this[customHandlerProperty].apply(this, invocationArguments);
            }

            const observers = internalState.get(eventType);
            if (observers) {
                Array.from(observers).forEach(observer => {
                    observer.apply(this, invocationArguments);
                });
            }
        };

        const deactivateSystem = () => {
            isDeactivated = true;
            internalState.clear();
            availableEventTypes.clear();
        };

        return {
            registerType: addEventType,
            connect: attachObserver,
            disconnect: detachObserver,
            signal: triggerEvent,
            shutdown: deactivateSystem,
            get activeState() { return !isDeactivated; }
        };
    };

    const generateEventObject = (kind, dataMap) => {
        const eventData = { kind: kind };
        if (typeof dataMap === 'object' && dataMap !== null) {
            Object.keys(dataMap).forEach(key => {
                if (Object.prototype.hasOwnProperty.call(dataMap, key)) {
                    eventData[key] = dataMap[key];
                }
            });
        }

        const describe = () => {
            const properties = Object.keys(eventData).filter(k => typeof eventData[k] !== 'function');
            const parts = properties.map(k => `${k}=${typeof eventData[k] === 'function' ? '[function]' : eventData[k]}`);
            return `DataEvent(${parts.join(', ')})`;
        };

        return Object.assign(eventData, { toString: describe });
    };

    const EventFacilitator = function(permittedEvents) {
        const _emitter = createEventSystem();
        permittedEvents.forEach(type => _emitter.registerType(type));

        this.addSubscriber = _emitter.connect;
        this.removeSubscriber = _emitter.disconnect;
        this.dispatchSignal = _emitter.signal;
        this.destroy = _emitter.shutdown;

        permittedEvents.forEach(type => {
            Object.defineProperty(this, `on${type}`, {
                set: function(fn) {
                    if (this[`_bound_on${type}`]) {
                        this.removeSubscriber(type, this[`_bound_on${type}`]);
                    }
                    if (typeof fn === 'function') {
                        this.addSubscriber(type, fn);
                        this[`_bound_on${type}`] = fn;
                    } else {
                        delete this[`_bound_on${type}`];
                    }
                },
                get: function() {
                    return this[`_bound_on${type}`];
                },
                configurable: true
            });
        });
    };

    const alphabetChars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
    utilityKit.generateToken = (size, maxIndex) => {
        maxIndex = maxIndex || alphabetChars.length;
        return Array.from({ length: size }).map(() =>
            alphabetChars.charAt(Math.floor(Math.random() * maxIndex))
        ).join('');
    };
    utilityKit.produceRandomNumber = (upperBound) => {
        return Math.floor(Math.random() * upperBound);
    };
    utilityKit.paddedNumberString = (upperBound) => {
        const numDigits = String(upperBound - 1).length;
        const padding = '0'.repeat(numDigits);
        return (padding + utilityKit.produceRandomNumber(upperBound)).slice(-numDigits);
    };

    utilityKit.getEndpointOrigin = (resourceURL) => {
        const urlParts = (resourceURL + '/').split('/');
        return urlParts.slice(0, 3).join('/');
    };

    utilityKit.compareOrigins = (urlA, urlB) => {
        const normalizedUrlB = urlB || currentWindow.location.href;
        return utilityKit.getEndpointOrigin(urlA) === utilityKit.getEndpointOrigin(normalizedUrlB);
    };

    utilityKit.retrieveParentDomain = (domainInput) => {
        if (/^[0-9.]*$/.test(domainInput)) return domainInput;
        if (/^\[/.test(domainInput)) return domainInput;
        if (!(/[.]/.test(domainInput))) return domainInput;
        return domainInput.split('.').slice(1).join('.');
    };

    utilityKit.mergeProperties = (destination, source) => {
        Object.keys(source).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                destination[key] = source[key];
            }
        });
        return destination;
    };

    const GlobalKeyPrefix = '_dataBus';
    utilityKit.ensureGlobalContainer = () => {
        if (!(GlobalKeyPrefix in currentWindow)) {
            currentWindow[GlobalKeyPrefix] = {};
        }
    };

    utilityKit.composeCloseMessage = (codeValue, reasonText) => {
        return 'c' + DataProcessor.serialize([codeValue, reasonText]);
    };

    utilityKit.isUserDefinedCode = (codeNumber) => {
        return codeNumber === 1000 || (codeNumber >= 3000 && codeNumber <= 4999);
    };

    utilityKit.calculateResponseTimeout = (roundTripTime) => {
        return roundTripTime > 100 ? 3 * roundTripTime : roundTripTime + 200;
    };

    utilityKit.inform = (...messages) => {
        if (currentWindow.console && console.log && console.log.apply) {
            console.log.apply(console, messages);
        }
    };

    utilityKit.bindFunction = (targetFunction, contextObject) => {
        return targetFunction.bind(contextObject);
    };

    utilityKit.isSimpleURL = (inputURL) => {
        return !/[?#]/.test(inputURL);
    };

    utilityKit.normalizeURL = (inputURL) => {
        const currentLoc = pageDOM.location;
        if (!inputURL) {
            throw new Error('Missing URL for DataGateway');
        }
        if (!utilityKit.isSimpleURL(inputURL)) {
            throw new Error('Only basic URLs are supported in DataGateway');
        }

        if (inputURL.startsWith('//')) {
            inputURL = currentLoc.protocol + inputURL;
        }
        if (inputURL.startsWith('/')) {
            inputURL = currentLoc.protocol + '//' + currentLoc.host + inputURL;
        }
        return inputURL.replace(/[/]+$/, '');
    };

    utilityKit.findInArray = (targetArray, itemToFind) => {
        return targetArray.findIndex(item => item === itemToFind);
    };

    utilityKit.filterOutFromArray = (sourceArray, itemToRemove) => {
        const index = utilityKit.findInArray(sourceArray, itemToRemove);
        return index === -1 ? [...sourceArray] : [...sourceArray.slice(0, index), ...sourceArray.slice(index + 1)];
    };

    utilityKit.checkIfArray = (candidate) => {
        return Array.isArray(candidate);
    };

    utilityKit.scheduleTask = (timeOrFunc, taskFunction) => {
        if (typeof timeOrFunc === 'function') {
            taskFunction = timeOrFunc;
            timeOrFunc = 0;
        }
        return setTimeout(taskFunction, timeOrFunc);
    };

    const jsonEscapeChars = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    const jsonCharMapping = {
        "\u0000":"\\u0000","\u0001":"\\u0001","\u0002":"\\u0002","\u0003":"\\u0003",
        "\u0004":"\\u0004","\u0005":"\\u0005","\u0006":"\\u0006","\u0007":"\\u0007",
        "\b":"\\b","\t":"\\t","\n":"\\n","\u000b":"\\u000b","\f":"\\f","\r":"\\r",
        "\u000e":"\\u000e","\u000f":"\\u000f","\u0010":"\\u0010","\u0011":"\\u0011",
        "\u0012":"\\u0012","\u0013":"\\u0013","\u0014":"\\u0014","\u0015":"\\u0015",
        "\u0016":"\\u0016","\u0017":"\\u0017","\u0018":"\\u0018","\u0019":"\\u0019",
        "\u001a":"\\u001a","\u001b":"\\u001b","\u001c":"\\u001c","\u001d":"\\u001d",
        "\u001e":"\\u001e","\u001f":"\\u001f","\"":"\\\"","\\":"\\\\",
        "\u007f":"\\u007f","\u0080":"\\u0080","\u0081":"\\u0081","\u0082":"\\u0082",
        "\u0083":"\\u0083","\u0084":"\\u0084","\u0085":"\\u0085","\u0086":"\\u0086",
        "\u0087":"\\u0087","\u0088":"\\u0088","\u0089":"\\u0089","\u008a":"\\u008a",
        "\u008b":"\\u008b","\u008c":"\\u008c","\u008d":"\\u008d","\u008e":"\\u008e",
        "\u008f":"\\u008f","\u0090":"\\u0090","\u0091":"\\u0091","\u0092":"\\u0092",
        "\u0093":"\\u0093","\u0094":"\\u0094","\u0095":"\\u0095","\u0096":"\\u0096",
        "\u0097":"\\u0097","\u0098":"\\u0098","\u0099":"\\u0099","\u009a":"\\u009a",
        "\u009b":"\\u009b","\u009c":"\\u009c","\u009d":"\\u009d","\u009e":"\\u009e",
        "\u009f":"\\u009f","\u00ad":"\\u00ad","\u0600":"\\u0600","\u0601":"\\u0601",
        "\u0602":"\\u0602","\u0603":"\\u0603","\u0604":"\\u0604","\u070f":"\\u070f",
        "\u17b4":"\\u17b4","\u17b5":"\\u17b5","\u200c":"\\u200c","\u200d":"\\u200d",
        "\u200e":"\\u200e","\u200f":"\\u200f","\u2028":"\\u2028","\u2029":"\\u2029",
        "\u202a":"\\u202a","\u202b":"\\u202b","\u202c":"\\u202c","\u202d":"\\u202d",
        "\u202e":"\\u202e","\u202f":"\\u202f","\u2060":"\\u2060","\u2061":"\\u2061",
        "\u2062":"\\u2062","\u2063":"\\u2063","\u2064":"\\u2064","\u2065":"\\u2065",
        "\u2066":"\\u2066","\u2067":"\\u2067","\u2068":"\\u2068","\u2069":"\\u2069",
        "\u206a":"\\u206a","\u206b":"\\u206b","\u206c":"\\u206c","\u206d":"\\u206d",
        "\u206e":"\\u206e","\u206f":"\\u206f","\ufeff":"\\ufeff","\ufff0":"\\ufff0",
        "\ufff1":"\\ufff1","\ufff2":"\\ufff2","\ufff3":"\\ufff3","\ufff4":"\\ufff4",
        "\ufff5":"\\ufff5","\ufff6":"\\ufff6","\ufff7":"\\ufff7","\ufff8":"\\ufff8",
        "\ufff9":"\\ufff9","\ufffa":"\\ufffa","\ufffb":"\\ufffb","\ufffc":"\\ufffc",
        "\ufffd":"\\ufffd","\ufffe":"\\ufffe","\uffff":"\\uffff"
    };

    const problematicUnicodePattern = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g;
    let problematicUnicodeMap;

    const serializeString = (inputStr) => {
        jsonEscapeChars.lastIndex = 0;
        if (jsonEscapeChars.test(inputStr)) {
            inputStr = inputStr.replace(jsonEscapeChars, (char) => {
                return jsonCharMapping[char] || '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
            });
        }
        return '"' + inputStr + '"';
    };

    const constructUnicodeLookup = (pattern) => {
        const lookup = {};
        // This unrolling is similar to original, but using Set/Map for pattern test
        // rather than char array join and then test.
        for (let i = 0; i < 65536; i++) {
            const char = String.fromCharCode(i);
            if (pattern.test(char)) { // Test each char against the pattern
                lookup[char] = '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
            }
        }
        return lookup;
    };

    utilityKit.secureStringQuote = (rawString) => {
        let quotedResult = serializeString(rawString);

        problematicUnicodePattern.lastIndex = 0;
        if (!problematicUnicodePattern.test(quotedResult)) {
            return quotedResult;
        }

        if (!problematicUnicodeMap) {
            problematicUnicodeMap = constructUnicodeLookup(problematicUnicodePattern);
        }

        return quotedResult.replace(problematicUnicodePattern, (char) => {
            return problematicUnicodeMap[char];
        });
    };

    const allAllowedChannels = ['websocket',
        'xdr-streaming',
        'xhr-streaming',
        'iframe-eventsource',
        'iframe-htmlfile',
        'xdr-polling',
        'xhr-polling',
        'iframe-xhr-polling',
        'jsonp-polling'];

    utilityKit.checkChannelCapabilities = () => {
        const discoveredChannels = {};
        allAllowedChannels.forEach(channelName => {
            discoveredChannels[channelName] = DataGateway[channelName] && DataGateway[channelName].isSupported();
        });
        return discoveredChannels;
    };

    utilityKit.selectActiveChannels = (capabilities, preferredChannels, connectionInfo) => {
        const filteredCapabilities = {};
        const activeChannels = [];
        const channelList = preferredChannels || allAllowedChannels;

        channelList.forEach(channelName => {
            filteredCapabilities[channelName] = capabilities[channelName];
        });

        const tryAddChannel = (candidateChannels) => {
            const currentCandidate = candidateChannels.shift();
            if (filteredCapabilities[currentCandidate]) {
                activeChannels.push(currentCandidate);
            } else {
                if (candidateChannels.length > 0) {
                    tryAddChannel(candidateChannels);
                }
            }
        };

        if (connectionInfo.websocketEnabled !== false) {
            tryAddChannel(['websocket']);
        }

        if (filteredCapabilities['xhr-streaming'] && !connectionInfo.noOriginCheck) {
            activeChannels.push('xhr-streaming');
        } else {
            if (filteredCapabilities['xdr-streaming'] && !connectionInfo.needsCookie && !connectionInfo.noOriginCheck) {
                activeChannels.push('xdr-streaming');
            } else {
                tryAddChannel(['iframe-eventsource', 'iframe-htmlfile']);
            }
        }
        return activeChannels;
    };

    const publicInterface = {};
    Object.assign(publicInterface, utilityKit);
    publicInterface.DataProcessor = DataProcessor;
    publicInterface.EventFacilitator = EventFacilitator;
    publicInterface.generateEventObject = generateEventObject;

    allAllowedChannels.forEach(channel => {
        publicInterface[channel] = {
            isSupported: () => Math.random() > 0.5,
        };
    });

    return publicInterface;
})();

DataGateway.version = '1.0.0';