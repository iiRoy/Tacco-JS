(function (globalContext, pageDoc, currentAddress, delayExecution, decodeUriPart, encodeUriPart) {
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global JSON, XMLHttpRequest, window, escape, unescape, ActiveXObject */
//
// This is a cross-domain communication utility.
// Project home: http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Access permission is hereby granted, without charge, to any individual
// obtaining a copy of this software and its associated documentation files
// (the "Software"), to utilize the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following specified conditions:
//
// The above copyright notice regarding copyright and this permission
// notice shall be included in all copies or substantial portions of the
// Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT ANY WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

var runtimeScope = this;
var messageChannelID = Math.floor(Math.random() * 9999); // Assigns a random initial ID for channels to prevent conflicts when multiple instances load.
var noOpFunc = Function.prototype;
var uriParser = /^((http.?:)\/\/([^:\/\s]+)(:\d+)*)/; // Regex captures protocol (group 2), domain (group 3), and port (group 4).
var parentPathPattern = /[\-\w]+\/\.\.\//; // Identifies 'directory/../' patterns in paths.
var doubleSlashFix = /([^:])\/\//g; // Locates double slashes anywhere except after a colon (in protocols).
var libNamespace = ""; // Holds the namespace string where the crossDomainLib object is exposed.
var crossDomainLib = {};
var previousCrossDomainLib = globalContext.crossDomainLib; // Stores any existing 'crossDomainLib' global variable to prevent overwrites.
var FRAME_ELEMENT_PREFIX = "crossDomainLib_";
var IE_NAME_ATTR_ISSUE;
var enableHashFallback = false; // Flag to determine if URL hash should be used for query parameters instead of search.
var flashPlayerVersion; // Will store detected Flash Player version if available.
var FLASH_THROTTLE_PROBLEM;


// Based on Peter Michaux's feature detection article.
function isNativeFunction(targetObj, propName){
    var propType = typeof targetObj[propName];
    return propType == 'function' ||
    (!!(propType == 'object' && targetObj[propName])) ||
    propType == 'unknown';
}

function isNativeObject(hostObj, propKey){
    return !!(typeof(hostObj[propKey]) == 'object' && hostObj[propKey]);
}

// end of Michaux's helpers

// From perfectionkills.com, a robust way to check for arrays.
function isAnArray(inputVal){
    return Object.prototype.toString.call(inputVal) === '[object Array]';
}

// end of array check
function detectFlashPlayer(){
    var pluginName = "Shockwave Flash", mimeTypeString = "application/x-shockwave-flash";
    
    if (!isUndefined(navigator.plugins) && typeof navigator.plugins[pluginName] == "object") {
        // Code adapted from SWFObject project.
        var pluginDescription = navigator.plugins[pluginName].description;
        if (pluginDescription && !isUndefined(navigator.mimeTypes) && navigator.mimeTypes[mimeTypeString] && navigator.mimeTypes[mimeTypeString].enabledPlugin) {
            flashPlayerVersion = pluginDescription.match(/\d+/g);
        }
    }
    if (!flashPlayerVersion) {
        var flashObj;
        try {
            flashObj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            flashPlayerVersion = Array.prototype.slice.call(flashObj.GetVariable("$version").match(/(\d+),(\d+),(\d+),(\d+)/), 1);
            flashObj = null;
        } 
        catch (unsupportedFlashException) {
        }
    }
    if (!flashPlayerVersion) {
        return false;
    }
    var majorVersion = parseInt(flashPlayerVersion[0], 10), minorVersion = parseInt(flashPlayerVersion[1], 10);
    FLASH_THROTTLE_PROBLEM = majorVersion > 9 && minorVersion > 0;
    return true;
}

/*
 * Provides cross-browser methods for attaching and detaching event listeners.
 */
var addEvent, removeEvent;
if (isNativeFunction(globalContext, "addEventListener")) {
    addEvent = function(targetNode, eventType, eventHandler){
        targetNode.addEventListener(eventType, eventHandler, false);
    };
    removeEvent = function(targetNode, eventType, eventHandler){
        targetNode.removeEventListener(eventType, eventHandler, false);
    };
}
else if (isNativeFunction(globalContext, "attachEvent")) {
    addEvent = function(domObject, eventName, callbackFunction){
        domObject.attachEvent("on" + eventName, callbackFunction);
    };
    removeEvent = function(domObject, eventName, callbackFunction){
        domObject.detachEvent("on" + eventName, callbackFunction);
    };
}
else {
    throw new Error("This browser is not supported by the library.");
}

/*
 * Cross-browser implementation for handling DOMContentLoaded-like events.
 */
var documentReady = false, readyCallbackQueue = [], documentState;
if ("readyState" in pageDoc) {
    // For WebKit browsers, check 'loaded' (older) and 'interactive' (HTML5 spec, newer WebKit).
    // See: https://bugs.webkit.org/show_bug.cgi?id=45119
    documentState = pageDoc.readyState;
    documentReady = documentState == "complete" || (~ navigator.userAgent.indexOf('AppleWebKit/') && (documentState == "loaded" || documentState == "interactive"));
}
else {
    // If readyState isn't supported, we infer DOM readiness by checking for document.body.
    // This allows functions to be called immediately if the DOM is already prepared.
    documentReady = !!pageDoc.body;
}

function onDocumentLoad(){
    if (documentReady) {
        return;
    }
    documentReady = true;
    for (var i = 0; i < readyCallbackQueue.length; i++) {
        readyCallbackQueue[i]();
    }
    readyCallbackQueue.length = 0;
}


if (!documentReady) {
    if (isNativeFunction(globalContext, "addEventListener")) {
        addEvent(pageDoc, "DOMContentLoaded", onDocumentLoad);
    }
    else {
        addEvent(pageDoc, "readystatechange", function(){
            if (pageDoc.readyState == "complete") {
                onDocumentLoad();
            }
        });
        if (pageDoc.documentElement.doScroll && globalContext === top) {
            var performScrollCheck = function(){
                if (documentReady) {
                    return;
                }
                // http://javascript.nwbox.com/IEContentLoaded/
                try {
                    pageDoc.documentElement.doScroll("left");
                } 
                catch (e) {
                    delayExecution(performScrollCheck, 1);
                    return;
                }
                onDocumentLoad();
            };
            performScrollCheck();
        }
    }
    
    // As a final fallback, use window.onload, which is always reliable.
    addEvent(globalContext, "load", onDocumentLoad);
}
/**
 * Queues a function to be executed once the DOM is fully ready.
 * If the DOM is already ready, the function is executed immediately.
 * @param {function} callbackFn The function to be invoked.
 * @param {Object} executionScope An optional context (this value) for the function.
 */
function executeWhenDocumentReady(callbackFn, executionScope){
    if (documentReady) {
        callbackFn.call(executionScope);
        return;
    }
    readyCallbackQueue.push(function(){
        callbackFn.call(executionScope);
    });
}

/**
 * Retrieves the crossDomainLib instance from the parent window,
 * respecting the configured namespace.
 *
 * @return The crossDomainLib instance from the parent frame.
 */
function retrieveParentReference(){
    var parentRef = parent;
    if (libNamespace !== "") {
        var partSegments = libNamespace.split(".");
        for (var i = 0; i < partSegments.length; i++) {
            parentRef = parentRef[partSegments[i]];
        }
    }
    return parentRef.crossDomainLib;
}

/**
 * Removes the crossDomainLib variable from the global scope and
 * restores any previous value it might have held.
 *
 * @param {String} newNamespace A string representing an object path where the
 *                               crossDomainLib instance will be placed.
 * @return The current instance of crossDomainLib.
 */
function restorePreviousState(newNamespace){
    
    globalContext.crossDomainLib = previousCrossDomainLib;
    libNamespace = newNamespace;
    if (libNamespace) {
        FRAME_ELEMENT_PREFIX = "crossDomainLib_" + libNamespace.replace(".", "_") + "_";
    }
    return crossDomainLib;
}

/*
 * Utility functions for URL manipulation.
 */
/**
 * Extracts the domain name from a given URL string.
 * @param {String} webAddress The URL to parse.
 * @return The domain part of the URL.
 * @type {String}
 */
function extractDomain(webAddress){
    return webAddress.match(uriParser)[3];
}

/**
 * Extracts the port number from a URL, or an empty string if no port is specified.
 * @param {String} webAddress The URL to parse.
 * @return The port component of the URL.
 * @type {String}
 */
function extractPort(webAddress){
    return webAddress.match(uriParser)[4] || "";
}

/**
 * Constructs a string containing the protocol, domain, and port of a URL.
 * @param {String} webAddress The URL from which to extract the origin.
 * @return {String} The origin part of the URL (e.g., "http://example.com:8080").
 */
function getOriginLocation(webAddress){
    var matchResult = webAddress.toLowerCase().match(uriParser);
    var protocolPart = matchResult[2], domainPart = matchResult[3], portSegment = matchResult[4] || "";
    if ((protocolPart == "http:" && portSegment == ":80") || (protocolPart == "https:" && portSegment == ":443")) {
        portSegment = "";
    }
    return protocolPart + "//" + domainPart + portSegment;
}

/**
 * Converts a relative URL into its absolute form.
 * @param {String} inputUrl The path to resolve.
 * @return {String} The fully resolved absolute URL.
 */
function normalizeUrl(inputUrl){
    
    // Replace consecutive slashes (not in protocol) with a single slash.
    inputUrl = inputUrl.replace(doubleSlashFix, "$1/");
    
    // If the URL is already absolute, do nothing.
    if (!inputUrl.match(/^(http||https):\/\//)) {
        // If it's a relative path, construct the full path.
        var currentPath = (inputUrl.substring(0, 1) === "/") ? "" : currentAddress.pathname;
        if (currentPath.substring(currentPath.length - 1) !== "/") {
            currentPath = currentPath.substring(0, currentPath.lastIndexOf("/") + 1);
        }
        
        inputUrl = currentAddress.protocol + "//" + currentAddress.host + currentPath + inputUrl;
    }
    
    // Collapse 'foo/../' segments.
    while (parentPathPattern.test(inputUrl)) {
        inputUrl = inputUrl.replace(parentPathPattern, "");
    }
    
    return inputUrl;
}

/**
 * Appends a set of query parameters to a given URL.
 * The base URL can already contain existing query parameters.
 * @param {String} baseUrl The base URL string.
 * @param {Object} paramMap A map of key-value pairs representing the parameters to add.
 * @return {String} A new URL string with the parameters appended.
 */
function addUrlParams(baseUrl, paramMap){
    
    var urlHash = "", hashIndex = baseUrl.indexOf("#");
    if (hashIndex !== -1) {
        urlHash = baseUrl.substring(hashIndex);
        baseUrl = baseUrl.substring(0, hashIndex);
    }
    var paramArray = [];
    for (var paramKey in paramMap) {
        if (paramMap.hasOwnProperty(paramKey)) {
            paramArray.push(paramKey + "=" + encodeUriPart(paramMap[paramKey]));
        }
    }
    return baseUrl + (enableHashFallback ? "#" : (baseUrl.indexOf("?") == -1 ? "?" : "&")) + paramArray.join("&") + urlHash;
}


// Populates the urlQueryData object from either location.search or location.hash,
// prioritizing location.search if it contains the 'xdm_e' argument.
var urlQueryData = (function(rawInput){
    rawInput = rawInput.substring(1).split("&");
    var parsedData = {}, keyValue, idx = rawInput.length;
    while (idx--) {
        keyValue = rawInput[idx].split("=");
        parsedData[keyValue[0]] = decodeUriPart(keyValue[1]);
    }
    return parsedData;
}(/xdm_e=/.test(currentAddress.search) ? currentAddress.search : currentAddress.hash));

/*
 * General utility methods.
 */
/**
 * Helper function to determine if a variable's value is undefined.
 * @param {Object} valueToCheck The variable to test.
 * @return {Boolean} True if the provided variable is undefined.
 */
function isUndefined(valueToCheck){
    return typeof valueToCheck === "undefined";
}

/**
 * Provides a safe and feature-tested implementation of HTML5 JSON parsing and stringification.
 * @return {JSON} A JSON-conforming object, or null if no suitable implementation is found.
 */
var retrieveJsonHelper = function(){
    var memoizedJson = {};
    var testObject = {
        a: [1, 2, 3]
    }, jsonString = "{\"a\":[1,2,3]}";
    
    if (typeof JSON != "undefined" && typeof JSON.stringify === "function" && JSON.stringify(testObject).replace((/\s/g), "") === jsonString) {
        // A fully functional JSON instance is available.
        return JSON;
    }
    if (Object.toJSON) {
        if (Object.toJSON(testObject).replace((/\s/g), "") === jsonString) {
            // Object.toJSON provides a working stringify method.
            memoizedJson.stringify = Object.toJSON;
        }
    }
    
    if (typeof String.prototype.evalJSON === "function") {
        testObject = jsonString.evalJSON();
        if (testObject.a && testObject.a.length === 3 && testObject.a[2] === 3) {
            // String.prototype.evalJSON provides a working parse method.
            memoizedJson.parse = function(inputStr){
                return inputStr.evalJSON();
            };
        }
    }
    
    if (memoizedJson.stringify && memoizedJson.parse) {
        // If both stringify and parse are found, memoize the result for future calls.
        retrieveJsonHelper = function(){
            return memoizedJson;
        };
        return memoizedJson;
    }
    return null;
};

/**
 * Copies properties from a source object to a target object.
 * @param {Object} targetObject The object to receive the properties.
 * @param {Object} sourceObject The object from which properties are copied.
 * @param {Boolean} avoidOverwrite If true, existing properties on targetObject will not be overwritten.
 */
function mergeProperties(targetObject, sourceObject, avoidOverwrite){
    var currentProperty;
    for (var propertyName in sourceObject) {
        if (sourceObject.hasOwnProperty(propertyName)) {
            if (propertyName in targetObject) {
                currentProperty = sourceObject[propertyName];
                if (typeof currentProperty === "object") {
                    mergeProperties(targetObject[propertyName], currentProperty, avoidOverwrite);
                }
                else if (!avoidOverwrite) {
                    targetObject[propertyName] = sourceObject[propertyName];
                }
            }
            else {
                targetObject[propertyName] = sourceObject[propertyName];
            }
        }
    }
    return targetObject;
}

// Detects a specific bug in Internet Explorer where setting an iframe's 'name' attribute via JavaScript
// incorrectly sets 'submitName' instead of 'name'.
function checkIeNameAttributeBug(){
    var tempForm = pageDoc.body.appendChild(pageDoc.createElement("form")), tempInput = tempForm.appendChild(pageDoc.createElement("input"));
    tempInput.name = FRAME_ELEMENT_PREFIX + "TEST_" + messageChannelID; // Use channel ID to ensure uniqueness and avoid caching issues.
    IE_NAME_ATTR_ISSUE = tempInput !== tempForm.elements[tempInput.name];
    pageDoc.body.removeChild(tempForm);
}

/**
 * Creates an iframe element and attaches it to the DOM.
 * @param {object} frameConfig Configuration object with these properties:
 * <ul>
 * <li> {object} properties An object containing properties to set on the iframe (e.g., 'src').</li>
 * <li> {DOMElement} containerElement The parent element to append the iframe to (Optional).</li>
 * <li> {function} onLoad A callback function to execute when the iframe is fully loaded. (Optional)</li>
 * </ul>
 * @return The newly created iframe DOMElement.
 * @type DOMElement
 */
function generateIframe(frameConfig){
    if (isUndefined(IE_NAME_ATTR_ISSUE)) {
        checkIeNameAttributeBug();
    }
    var newIframe;
    // Workaround for IE6/7 bug: setting 'name' directly uses 'submitName' instead.
    // This isn't strictly necessary for crossDomainLib but helps for other use cases.
    if (IE_NAME_ATTR_ISSUE) {
        newIframe = pageDoc.createElement("<iframe name=\"" + frameConfig.properties.name + "\"/>");
    }
    else {
        newIframe = pageDoc.createElement("IFRAME");
        newIframe.name = frameConfig.properties.name;
    }
    
    newIframe.id = newIframe.name = frameConfig.properties.name;
    delete frameConfig.properties.name;
    
    if (typeof frameConfig.containerElement == "string") {
        frameConfig.containerElement = pageDoc.getElementById(frameConfig.containerElement);
    }
    
    if (!frameConfig.containerElement) {
        // Conceal the iframe to prevent layout issues. Simple display:none can cause rendering problems.
        mergeProperties(newIframe.style, {
            position: "absolute",
            top: "-2000px",
            // Prevents potential horizontal scrollbars.
            left: "0px"
        });
        frameConfig.containerElement = pageDoc.body;
    }
    
    // HACK: In IE, setting the 'src' attribute immediately on creation can cause issues.
    // We set it to "javascript:false" as a temporary placeholder. "about:blank" would
    // trigger SSL mixed-content warnings on SSL parent pages in IE6.
    var frameSource = frameConfig.properties.src;
    frameConfig.properties.src = "javascript:false";
    
    // Apply all specified properties to the new iframe element.
    mergeProperties(newIframe, frameConfig.properties);
    
    newIframe.border = newIframe.frameBorder = 0;
    newIframe.allowTransparency = true;
    frameConfig.containerElement.appendChild(newIframe);