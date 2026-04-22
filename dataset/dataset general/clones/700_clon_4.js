(function (globalWindow, domDocument, currentUri, timerDelay, uriDecoder, uriEncoder) {

    const currentContext = this;
    const tokenIdentifier = Math.floor(Math.random() * 9876) + 123;
    const noOpFunction = function() {};
    
    const urlParsingPattern = new RegExp("^((http.?:)\/\/([^:\\\/\\s]+)(:\\d+)*)");
    const pathReductionPattern = new RegExp("[\\-\\w]+\\/\\.\\.\\/");
    const slashCleanupPattern = new RegExp("([^:])\\/\\/","g");

    let moduleAlias = "";
    const crossComm = {};
    const originalCrossComm = globalWindow.crossComm;
    let frameHandlePrefix = "crossComm_";
    let nameAttrIssue;
    let hashRoutingEnabled = false;
    let flashRuntimeVersion;
    let flashThrottlingConcern;

    const isUndefinedValue = function(val) {
        return typeof val === "undefined";
    };

    const checkHostCallable = function(hostObj, propName){
        const propType = typeof hostObj[propName];
        return propType === 'function' ||
        (!!(propType === 'object' && hostObj[propName])) ||
        propType === 'unknown';
    };

    const checkHostEntity = function(hostObj, propName){
        return !!(typeof(hostObj[propName]) === 'object' && hostObj[propName]);
    };

    const isCollection = function(candidate){
        return Object.prototype.toString.call(candidate) === '[object Array]';
    };

    const probeFlashPresence = function(){
        const pluginName = "Shockwave Flash";
        const mimeType = "application/x-shockwave-flash";
        
        if (!isUndefinedValue(navigator.plugins) && typeof navigator.plugins[pluginName] === "object") {
            const description = navigator.plugins[pluginName].description;
            if (description && !isUndefinedValue(navigator.mimeTypes) && navigator.mimeTypes[mimeType] && navigator.mimeTypes[mimeType].enabledPlugin) {
                flashRuntimeVersion = description.match(/\d+/g);
            }
        }
        if (!flashRuntimeVersion) {
            let flashObject;
            try {
                flashObject = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                flashRuntimeVersion = Array.prototype.slice.call(flashObject.GetVariable("$version").match(/(\d+),(\d+),(\d+),(\d+)/), 1);
                flashObject = null;
            }
            catch (creationError) {
                // Not supported
            }
        }
        if (!flashRuntimeVersion) {
            return false;
        }
        const major = parseInt(flashRuntimeVersion[0], 10);
        const minor = parseInt(flashRuntimeVersion[1], 10);
        flashThrottlingConcern = major > 9 && minor > 0;
        return true;
    };

    const eventHandlerRegistry = (function() {
        const methods = {};
        if (checkHostCallable(globalWindow, "addEventListener")) {
            methods.add = function(elem, evt, handler){ elem.addEventListener(evt, handler, false); };
            methods.remove = function(elem, evt, handler){ elem.removeEventListener(evt, handler, false); };
        } else if (checkHostCallable(globalWindow, "attachEvent")) {
            methods.add = function(elem, evt, handler){ elem.attachEvent("on" + evt, handler); };
            methods.remove = function(elem, evt, handler){ elem.detachEvent("on" + evt, handler); };
        } else {
            throw new Error("Event handling not supported in this environment.");
        }
        return methods;
    })();

    let docCompletionStatus = false;
    const pendingCallbacks = {};
    let callbackCounter = 0;

    const signalCompletion = function() {
        if (docCompletionStatus) {
            return;
        }
        docCompletionStatus = true;
        Object.keys(pendingCallbacks).forEach(function(key) {
            pendingCallbacks[key]();
            Reflect.deleteProperty(pendingCallbacks, key);
        });
    };

    let currentDocState;
    if ("readyState" in domDocument) {
        currentDocState = domDocument.readyState;
        docCompletionStatus = currentDocState === "complete" || (~ navigator.userAgent.indexOf('AppleWebKit/') && (currentDocState === "loaded" || currentDocState === "interactive"));
    } else {
        docCompletionStatus = !!domDocument.body;
    }

    if (!docCompletionStatus) {
        if (checkHostCallable(globalWindow, "addEventListener")) {
            eventHandlerRegistry.add(domDocument, "DOMContentLoaded", signalCompletion);
        } else {
            eventHandlerRegistry.add(domDocument, "readystatechange", function() {
                if (domDocument.readyState === "complete") {
                    signalCompletion();
                }
            });
            if (domDocument.documentElement.doScroll && globalWindow === top) {
                let scrollCheckInterval;
                const doScrollPoll = function() {
                    if (docCompletionStatus) {
                        clearInterval(scrollCheckInterval);
                        return;
                    }
                    try {
                        domDocument.documentElement.doScroll("left");
                        clearInterval(scrollCheckInterval);
                        signalCompletion();
                    } catch (e) { /* continue polling */ }
                };
                scrollCheckInterval = timerDelay(doScrollPoll, 1);
            }
        }
        eventHandlerRegistry.add(globalWindow, "load", signalCompletion);
    }

    function executeOnDocumentReady(callbackFn, contextObj) {
        if (docCompletionStatus) {
            callbackFn.call(contextObj);
            return;
        }
        const callbackId = "cb_" + (callbackCounter++);
        pendingCallbacks[callbackId] = function() {
            callbackFn.call(contextObj);
        };
    }

    function retrieveParentModule(){
        let moduleRef = parent;
        if (moduleAlias !== "") {
            moduleAlias.split(".").forEach(function(part) {
                moduleRef = moduleRef[part];
            });
        }
        return moduleRef.crossComm;
    }

    function restoreGlobalReference(newAlias){
        globalWindow.crossComm = originalCrossComm;
        moduleAlias = newAlias;
        if (moduleAlias) {
            frameHandlePrefix = "crossComm_" + moduleAlias.replace(/\./g, "_") + "_";
        }
        return crossComm;
    }

    function extractHostDomain(fullUrl){
        const matchResult = fullUrl.match(urlParsingPattern);
        return matchResult ? matchResult[3] : "";
    }

    function obtainHostPort(fullUrl){
        const matchResult = fullUrl.match(urlParsingPattern);
        return matchResult ? matchResult[4] || "" : "";
    }

    function deriveBaseLocation(fullUrl){
        const matchResult = fullUrl.toLowerCase().match(urlParsingPattern);
        if (!matchResult) return "";
        let protocol = matchResult[2], domain = matchResult[3], port = matchResult[4] || "";
        if ((protocol === "http:" && port === ":80") || (protocol === "https:" && port === ":443")) {
            port = "";
        }
        return protocol + "//" + domain + port;
    }

    function normalizePathString(inputPath){
        inputPath = inputPath.replace(slashCleanupPattern, "$1/");
        
        if (!inputPath.match(/^(http||https):\/\//)) {
            let pathSegment = (inputPath.substring(0, 1) === "/") ? "" : currentUri.pathname;
            if (pathSegment.slice(-1) !== "/") {
                pathSegment = pathSegment.substring(0, pathSegment.lastIndexOf("/") + 1);
            }
            inputPath = currentUri.protocol + "//" + currentUri.host + pathSegment + inputPath;
        }
        
        while (pathReductionPattern.test(inputPath)) {
            inputPath = inputPath.replace(pathReductionPattern, "");
        }
        return inputPath;
    }

    function appendUrlParams(baseUrl, paramCollection) {
        let urlFragment = "";
        const fragmentIndex = baseUrl.lastIndexOf("#");
        if (fragmentIndex !== -1) {
            urlFragment = baseUrl.substring(fragmentIndex);
            baseUrl = baseUrl.substring(0, fragmentIndex);
        }

        const encodedParams = Object.keys(paramCollection).map(function(paramKey) {
            return paramKey + "=" + uriEncoder(paramCollection[paramKey]);
        });

        const separator = hashRoutingEnabled ? "#" : (baseUrl.indexOf("?") === -1 ? "?" : "&");
        return baseUrl + separator + encodedParams.join("&") + urlFragment;
    }

    const getUrlParameters = function(urlPart) {
        return urlPart.slice(1).split('&').reduce(function(accumulator, currentPair) {
            const parts = currentPair.split('=');
            if (parts.length === 2) {
                accumulator[parts[0]] = uriDecoder(parts[1]);
            }
            return accumulator;
        }, {});
    };

    const parsedUrlParams = getUrlParameters(
        currentUri.search.indexOf("xdm_e=") !== -1 ? currentUri.search : currentUri.hash
    );

    const acquireJsonProcessor = (function() {
        let jsonUtilityCache = null;

        const testObject = { alpha: [10, 20, 30] };
        const testString = "{\"alpha\":[10,20,30]}";

        function evaluateJsonCapabilities() {
            const foundProcessors = {};

            try {
                if (typeof globalWindow.JSON !== "undefined" && typeof globalWindow.JSON.stringify === "function" && globalWindow.JSON.stringify(testObject).replace(/\s/g, "") === testString) {
                    foundProcessors.stringifier = globalWindow.JSON.stringify;
                    foundProcessors.parser = globalWindow.JSON.parse;
                    if (foundProcessors.stringifier && foundProcessors.parser) {
                        return foundProcessors;
                    }
                }
            } catch (e) { /* ignore */ }

            try {
                if (typeof Object.toJSON === "function" && Object.toJSON(testObject).replace(/\s/g, "") === testString) {
                    foundProcessors.stringifier = Object.toJSON;
                }
            } catch (e) { /* ignore */ }

            try {
                if (typeof String.prototype.evalJSON === "function") {
                    const parsedResult = testString.evalJSON();
                    if (parsedResult.alpha && parsedResult.alpha.length === 3 && parsedResult.alpha[2] === 30) {
                        foundProcessors.parser = function(inputString) { return inputString.evalJSON(); };
                    }
                }
            } catch (e) { /* ignore */ }

            if (foundProcessors.stringifier && foundProcessors.parser) {
                return foundProcessors;
            }
            return null;
        }

        return function() {
            if (jsonUtilityCache === null) {
                jsonUtilityCache = evaluateJsonCapabilities();
            }
            return jsonUtilityCache;
        };
    })();

    function deepMergeProperties(targetObject, sourceObject, avoidOverwrite) {
        const mergeStack = [{ target: targetObject, source: sourceObject }];

        while (mergeStack.length > 0) {
            const { target, source } = mergeStack.pop();

            Object.keys(source).forEach(function(sourceKey) {
                if (Object.prototype.hasOwnProperty.call(source, sourceKey)) {
                    const sourceValue = source[sourceKey];
                    
                    if (Object.prototype.hasOwnProperty.call(target, sourceKey)) {
                        if (typeof sourceValue === "object" && sourceValue !== null && !isCollection(sourceValue)) {
                            if (typeof target[sourceKey] === "object" && target[sourceKey] !== null && !isCollection(target[sourceKey])) {
                                mergeStack.push({ target: target[sourceKey], source: sourceValue });
                            } else if (!avoidOverwrite) {
                                target[sourceKey] = sourceValue;
                            }
                        } else if (!avoidOverwrite) {
                            target[sourceKey] = sourceValue;
                        }
                    } else {
                        target[sourceKey] = sourceValue;
                    }
                }
            });
        }
        return targetObject;
    }

    function evaluateNameAttributeBug(){
        const testForm = domDocument.body.appendChild(domDocument.createElement("form"));
        const testInput = testForm.appendChild(domDocument.createElement("input"));
        testInput.name = frameHandlePrefix + "TEST" + tokenIdentifier;
        nameAttrIssue = testInput !== testForm.elements[testInput.name];
        domDocument.body.removeChild(testForm);
    }

    function constructSandboxedFrame(frameConfiguration) {
        if (isUndefinedValue(nameAttrIssue)) {
            evaluateNameAttributeBug();
        }

        const iframeFactory = function(nameAttribute) {
            return nameAttrIssue
                ? domDocument.createElement("<iframe name=\"" + nameAttribute + "\"/>")
                : Object.assign(domDocument.createElement("IFRAME"), { name: nameAttribute });
        };

        const newFrame = iframeFactory(frameConfiguration.attributes.name);
        
        Object.assign(newFrame, {
            id: frameConfiguration.attributes.name,
            name: frameConfiguration.attributes.name
        });

        Reflect.deleteProperty(frameConfiguration.attributes, 'name');

        let parentContainer = frameConfiguration.hostElement;
        if (typeof parentContainer === "string") {
            parentContainer = domDocument.getElementById(parentContainer);
        }
        
        if (!parentContainer) {
            deepMergeProperties(newFrame.style, {
                position: "absolute",
                top: "-2000px",
                left: "0px"
            }, false);
            parentContainer = domDocument.body;
        }

        const initialSource = frameConfiguration.attributes.src;
        frameConfiguration.attributes.src = "javascript:false";

        deepMergeProperties(newFrame, frameConfiguration.attributes, false);

        Object.assign(newFrame, {
            border: 0,
            frameBorder: 0,
            allowTransparency: true
        });
        
        parentContainer.appendChild(newFrame);
        return newFrame;
    }

})(window, document, location, setTimeout, decodeURIComponent, encodeURIComponent);