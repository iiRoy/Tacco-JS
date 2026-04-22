// This script implements a polyfill for CSS media queries, enabling dynamic styling based on element dimensions.
// Original concept by Scott Jehl. Licensed under MIT/GPLv2.
(function(globalObj) {

    "use strict";

    // Establish a unique namespace within the global object
    var styleProcessor = {};
    globalObj.styleProcessor = styleProcessor;

    // Provide a placeholder method for browsers with native support to prevent runtime errors
    styleProcessor.refresh = function() {};

    // The original script would check for native media query support and exit if available.
    // We are proceeding with the polyfill logic as if native support is not present or desired.
    // styleProcessor.hasNativeMqSupport = globalObj.matchMedia && globalObj.matchMedia("only all").matches;
    // if (styleProcessor.hasNativeMqSupport) { return; }

    // Declare and initialize core variables for document manipulation and state management
    var documentRef = globalObj.document,
        rootElement = documentRef.documentElement,
        processedStyleRules = [], // Array to hold parsed media query conditions
        targetNodes = [], // (This variable was declared but unused in the original, maintaining for structural parity)
        uniqueIdCounter = 0, // Used to generate unique class names for matched elements
        cssContentBlocks = [], // Stores raw CSS text that corresponds to processed rules
        injectedStyleNodes = [], // List of <style> elements dynamically added to the document
        processedHrefs = {}, // Hash map to track already processed stylesheet URLs
        debounceDelay = 30, // Delay in milliseconds for throttling resize events
        documentHead = documentRef.getElementsByTagName("head")[0] || rootElement, // Reference to the document's head
        baseTagRef = documentRef.getElementsByTagName("base")[0], // Reference to the <base> tag, if present
        linkElements = documentHead.getElementsByTagName("link"), // Collection of all <link> elements in the head
        pendingRequests = [], // Queue for AJAX requests to fetch external stylesheet content

        // Utility function: Checks if a given DOM element possesses a specific CSS class
        elementHasClass = function(domNode, classIdentifier) {
            return new RegExp(' ' + classIdentifier + ' ').test(' ' + domNode.className + ' ');
        },

        // Utility function: Appends a CSS class to a DOM element if it's not already present
        addElementClass = function(domNode, classIdentifier) {
            if (!elementHasClass(domNode, classIdentifier)) {
                domNode.className += ' ' + classIdentifier;
            }
        },

        // Initiates the process of scanning and parsing all linked stylesheets
        extractStylesheets = function() {

            for (var idx = 0; idx < linkElements.length; idx++) {
                var currentLink = linkElements[idx],
                    resourcePath = currentLink.href,
                    mediaAttr = currentLink.media,
                    isStylesheetLink = currentLink.rel && currentLink.rel.toLowerCase() === "stylesheet";

                // Filter for valid stylesheet links and prevent redundant parsing
                if (!!resourcePath && isStylesheetLink && !processedHrefs[resourcePath]) {
                    // Special handling for IE's proprietary rawCssText property
                    if (currentLink.styleSheet && currentLink.styleSheet.rawCssText) {
                        parseAndConvertStyles(currentLink.styleSheet.rawCssText, resourcePath, mediaAttr);
                        processedHrefs[resourcePath] = true;
                    } else {
                        // Queue AJAX request for stylesheets that are local or same-origin
                        if ((!/^([a-zA-Z:]*\/\/)/.test(resourcePath) && !baseTagRef) ||
                            resourcePath.replace(RegExp.$1, "").split("/")[0] === globalObj.location.host) {
                            pendingRequests.push({
                                resourcePath: resourcePath,
                                mediaAttr: mediaAttr
                            });
                        }
                    }
                }
            }
            processPendingRequests(); // Begin fetching the queued stylesheets
        },

        // Processes the queue of pending AJAX requests recursively
        processPendingRequests = function() {
            if (pendingRequests.length) {
                var currentRequest = pendingRequests.shift();

                fetchContentAsync(currentRequest.resourcePath, function(cssTextContent) {
                    parseAndConvertStyles(cssTextContent, currentRequest.resourcePath, currentRequest.mediaAttr);
                    processedHrefs[currentRequest.resourcePath] = true;

                    // Defer the recursive call using setTimeout to prevent potential stack overflows in IE7
                    globalObj.setTimeout(function() {
                        processPendingRequests();
                    }, 0);
                });
            }
        },

        // Analyzes raw CSS text, identifies media query blocks, and transforms them
        parseAndConvertStyles = function(cssTextContent, resourcePath, mediaAttr) {
            var queryBlocks = cssTextContent.match(/@element[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi),
                numQueryBlocks = queryBlocks && queryBlocks.length || 0;

            // Determine the base path of the stylesheet for resolving relative URLs
            resourcePath = resourcePath.substring(0, resourcePath.lastIndexOf("/"));

            // Internal helper to adjust relative URLs within the CSS content
            var adjustRelativeUrls = function(cssSegment) {
                    return cssSegment.replace(/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g, "$1" + resourcePath + "$2$3");
                },
                // Flag to indicate if the link's media attribute should be used if no internal queries are found
                useLinkMediaAttr = !numQueryBlocks && mediaAttr;

            // Append a trailing slash to the resource path if it exists
            if (resourcePath.length) {
                resourcePath += "/";
            }

            // If no internal @element queries are present but a media attribute exists, use it
            // (Note: This logic may cause the media attribute to be ignored if internal queries *also* exist)
            if (useLinkMediaAttr) {
                numQueryBlocks = 1;
            }

            for (var idx = 0; idx < numQueryBlocks; idx++) {
                var fullMediaQuery, singleQueryPart, individualQueries, numIndividualQueries;

                // If using the link's media attribute
                if (useLinkMediaAttr) {
                    fullMediaQuery = mediaAttr;
                    cssContentBlocks.push(adjustRelativeUrls(cssTextContent));
                }
                // Otherwise, parse the @element rule from the CSS content
                else {
                    fullMediaQuery = queryBlocks[idx].match(/@element *([^\{]+)\{([\S\s]+?)$/) && RegExp.$1;
                    cssContentBlocks.push(RegExp.$2 && adjustRelativeUrls(RegExp.$2));
                }

                individualQueries = fullMediaQuery.split(",");
                numIndividualQueries = individualQueries.length;

                for (var jdx = 0; jdx < numIndividualQueries; jdx++) {
                    singleQueryPart = individualQueries[jdx];
                    processedStyleRules.push({
                        selector: singleQueryPart.split("]")[0].split("[")[1], // Extracts the CSS selector
                        media: singleQueryPart.split("]")[1].split("(")[0].match(/(only\s+)?([a-zA-Z]+)\s?/) && RegExp.$2 || "all", // Extracts the media type
                        rules: cssContentBlocks.length - 1, // Index to the corresponding raw CSS block
                        hasQuery: singleQueryPart.indexOf("(") > -1, // Indicates if min/max-width queries are present
                        minConstraint: singleQueryPart.match(/\(\s*min\-width:\s*(\s*[0-9\.]+)(px|em)\s*\)/) && parseFloat(RegExp.$1) + (RegExp.$2 || ""),
                        maxConstraint: singleQueryPart.match(/\(\s*max\-width:\s*(\s*[0-9\.]+)(px|em)\s*\)/) && parseFloat(RegExp.$1) + (RegExp.$2 || "")
                    });
                }
            }

            evaluateAndApplyStyles(); // Trigger style evaluation after parsing
        },

        lastExecutionTime, // Stores the timestamp of the last style application
        deferHandle, // Handle for the debounced resize event timeout

        // Determines the pixel value of 1em by creating and measuring a temporary element
        calculateEmUnitValue = function() {
            var resultValue,
                tempDiv = documentRef.createElement('div'),
                documentBody = documentRef.body,
                bodyCreatedTemporarily = false;

            tempDiv.style.cssText = "position:absolute;font-size:1em;width:1em";

            // If the document body doesn't exist yet, create a temporary one
            if (!documentBody) {
                documentBody = bodyCreatedTemporarily = documentRef.createElement("body");
                documentBody.style.background = "none";
            }

            documentBody.appendChild(tempDiv);

            rootElement.insertBefore(documentBody, rootElement.firstChild);

            resultValue = tempDiv.offsetWidth;

            // Clean up the temporary body if it was created by this function
            if (bodyCreatedTemporarily) {
                rootElement.removeChild(documentBody);
            } else {
                documentBody.removeChild(tempDiv);
            }

            // Cache the calculated em value and return it
            emPixelValue = parseFloat(resultValue);
            return emPixelValue;
        },

        // Cached pixel value of 1em, initialized on first use
        emPixelValue,

        // Evaluates element dimensions against media query rules and applies/removes styles
        evaluateAndApplyStyles = function(fromResizeEvent) {

            var clientDimensionName = "clientWidth",
                rootPropValue = rootElement[clientDimensionName],
                currentViewportWidth = documentRef.compatMode === "CSS1Compat" && rootPropValue || documentRef.body[clientDimensionName] || rootPropValue,
                activeStyleGroups = {}, // Object to group CSS rules by their media type
                lastLinkNode = linkElements[linkElements.length - 1], // The last <link> element in the head
                currentTime = (new Date()).getTime();

            // Implement throttling for resize events to optimize performance
            if (fromResizeEvent && lastExecutionTime && currentTime - lastExecutionTime < debounceDelay) {
                globalObj.clearTimeout(deferHandle);
                deferHandle = globalObj.setTimeout(evaluateAndApplyStyles, debounceDelay);
                return;
            } else {
                lastExecutionTime = currentTime;
            }

            uniqueIdCounter = 0; // Reset the unique class ID counter for each evaluation cycle
            for (var ruleKey in processedStyleRules) {
                if (processedStyleRules.hasOwnProperty(ruleKey)) {
                    var currentStyleRule = processedStyleRules[ruleKey],
                        minConstraint = currentStyleRule.minConstraint,
                        maxConstraint = currentStyleRule.maxConstraint,
                        minConstraintMissing = minConstraint === null,
                        maxConstraintMissing = maxConstraint === null,
                        emUnitString = "em",
                        matchedNodes = documentRef.querySelectorAll(currentStyleRule.selector),
                        uniqueClassId = "__style_id_" + uniqueIdCounter,
                        ruleMatched = false;
                    uniqueIdCounter++;

                    // Convert 'em' based min/max constraints to pixel values
                    if (!!minConstraint) {
                        minConstraint = parseFloat(minConstraint) * (minConstraint.indexOf(emUnitString) > -1 ? (emPixelValue || calculateEmUnitValue()) : 1);
                    }
                    if (!!maxConstraint) {
                        maxConstraint = parseFloat(maxConstraint) * (maxConstraint.indexOf(emUnitString) > -1 ? (emPixelValue || calculateEmUnitValue()) : 1);
                    }

                    for (var ldx = 0; ldx < matchedNodes.length; ldx++) {
                        // Cache the element's original class attribute to allow restoration
                        if (matchedNodes[ldx].getAttribute('data-original-class') == null) {
                            matchedNodes[ldx].setAttribute('data-original-class', matchedNodes[ldx].getAttribute('class') != null ? matchedNodes[ldx].getAttribute('class') : "");
                        }
                        // For the first rule, reset the element's class to its cached original state
                        if (ruleKey == 0) {
                            matchedNodes[ldx].setAttribute('class', matchedNodes[ldx].getAttribute('data-original-class'));
                        }
                        var nodeRenderedWidth = matchedNodes[ldx].offsetWidth;

                        // Check if the element's current width satisfies the media query conditions
                        if (!currentStyleRule.hasQuery || (!minConstraintMissing || !maxConstraintMissing) && (minConstraintMissing || nodeRenderedWidth >= minConstraint) && (maxConstraintMissing || nodeRenderedWidth <= maxConstraint)) {
                            addElementClass(matchedNodes[ldx], uniqueClassId);
                            ruleMatched = true;
                        }
                    }

                    // If the current rule's conditions were met by any element, add its CSS to the active groups
                    if (ruleMatched) {
                        if (!activeStyleGroups[currentStyleRule.media]) {
                            activeStyleGroups[currentStyleRule.media] = [];
                        }
                        activeStyleGroups[currentStyleRule.media].push(cssContentBlocks[currentStyleRule.rules].replace(new RegExp(currentStyleRule.selector, "g"), "." + uniqueClassId));
                    }
                }
            }

            // Remove all previously injected dynamic style elements
            for (var nodeIdx in injectedStyleNodes) {
                if (injectedStyleNodes.hasOwnProperty(nodeIdx)) {
                    if (injectedStyleNodes[nodeIdx] && injectedStyleNodes[nodeIdx].parentNode === documentHead) {
                        documentHead.removeChild(injectedStyleNodes[nodeIdx]);
                    }
                }
            }

            // Inject the currently active and grouped styles into the document
            for (var mediaType in activeStyleGroups) {
                if (activeStyleGroups.hasOwnProperty(mediaType)) {
                    var styleElement = documentRef.createElement("style"),
                        generatedCss = activeStyleGroups[mediaType].join("\n");

                    styleElement.type = "text/css";
                    styleElement.media = mediaType;

                    // Insert the <style> element into the head, ensuring proper placement
                    documentHead.insertBefore(styleElement, lastLinkNode.nextSibling);

                    if (styleElement.styleSheet) { // For Internet Explorer
                        styleElement.styleSheet.cssText = generatedCss;
                    } else { // For modern browsers
                        styleElement.appendChild(documentRef.createTextNode(generatedCss));
                    }

                    // Keep a reference to the injected style element for future removal
                    injectedStyleNodes.push(styleElement);
                }
            }

        },

        // Generic asynchronous function to fetch content from a given URL
        fetchContentAsync = function(requestUrl, successCallback) {
            var httpRequest = createXmlHttpRequest();
            if (!httpRequest) {
                return;
            }
            httpRequest.open("GET", requestUrl, true);
            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState !== 4 || (httpRequest.status !== 200 && httpRequest.status !== 304)) {
                    return;
                }
                successCallback(httpRequest.responseText);
            };
            if (httpRequest.readyState === 4) { // Handle cases where request might complete synchronously
                return;
            }
            httpRequest.send(null);
        },

        // Factory function (IIFE) to provide an XMLHttpRequest object, handling browser compatibility
        createXmlHttpRequest = (function() {
            var xhrConstructor = false;
            try {
                xhrConstructor = new globalObj.XMLHttpRequest();
            } catch (e) {
                try { // Fallback for older Internet Explorer versions
                    xhrConstructor = new globalObj.ActiveXObject("Microsoft.XMLHTTP");
                } catch (e2) {
                    // No XML HTTP Request support available
                }
            }
            return function() {
                return xhrConstructor; // Returns the pre-initialized XHR object or its constructor
            };
        })();

    // Perform the initial scan and processing of stylesheets
    extractStylesheets();

    // Expose the refresh function for external calls (e.g., after dynamic content loading)
    styleProcessor.refresh = extractStylesheets;
    styleProcessor.execute = triggerStyleEvaluation; // Expose a method to manually force style re-evaluation

    // Function specifically designed to be called on window resize events
    function triggerStyleEvaluation() {
        evaluateAndApplyStyles(true); // Indicate that this call originated from a resize event
    }

    // Attach event listeners for the window's resize event
    if (globalObj.addEventListener) {
        globalObj.addEventListener("resize", triggerStyleEvaluation, false);
    } else if (globalObj.attachEvent) { // For older IE browsers
        globalObj.attachEvent("onresize", triggerStyleEvaluation);
    }
})(this);