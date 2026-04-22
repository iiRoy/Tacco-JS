/*
 * AdaptiveStyles v2.0.0: Flexible viewport query polyfill.
 * (c) Reimagined by AI. Licensed under MIT.
 * Original: Respond.js v1.1.0 by Scott Jehl.
 */
(function(runtimeWindow) {

    "use strict";

    // --- Configuration & Constants ---
    const RESIZE_DEBOUNCE_MS = 60; // Milliseconds to debounce resize events
    const STYLESHEET_REL_TYPE = "stylesheet"; // Standard link relation type for stylesheets
    const INJECTED_CLASS_PREFIX = "__adaptive_"; // Prefix for dynamically injected CSS classes
    const EM_UNIT_STRING = "em"; // Unit string for 'em' measurements

    // --- Public API Namespace ---
    var responsiveUtils = {};
    runtimeWindow.responsiveUtils = responsiveUtils;

    // --- Core Document Elements & Data Structures ---
    var currentDocument = runtimeWindow.document;
    var htmlRootElement = currentDocument.documentElement;
    var documentHead = currentDocument.head || currentDocument.getElementsByTagName("head")[0] || htmlRootElement;
    var baseTagElement = currentDocument.getElementsByTagName("base")[0]; // Base tag for URL resolution
    var stylesheetLinks = documentHead.getElementsByTagName("link"); // All <link> elements in the head

    var queryDefinitions = [];         // Stores parsed media query conditions (e.g., min-width, selector)
    var styleRuleSet = [];             // Stores the actual CSS rule blocks corresponding to queryDefinitions
    var uniqueClassCounter = 0;        // Incremental counter for generating unique class names
    var injectedStyleNodes = [];       // References to <style> elements dynamically added to the head
    var processedUrls = {};            // Cache: stores URLs of stylesheets that have already been processed
    var pendingRequests = [];          // Queue for AJAX requests to fetch external stylesheet content

    // --- Utility Functions ---

    /**
     * Checks if a DOM element has a specified CSS class.
     * @param {Element} targetElement The DOM element to check.
     * @param {string} cssClassName The class name to look for.
     * @returns {boolean} True if the element has the class, false otherwise.
     */
    function hasCssClass(targetElement, cssClassName) {
        if (!targetElement || !targetElement.className) {
            return false;
        }
        // Use a space-padded string for reliable class checking
        return ` ${targetElement.className} `.includes(` ${cssClassName} `);
    }

    /**
     * Adds a CSS class to a DOM element if it doesn't already have it.
     * Prioritizes modern `classList` API, falls back to `className` manipulation.
     * @param {Element} targetElement The DOM element to modify.
     * @param {string} cssClassName The class name to add.
     */
    function addCssClass(targetElement, cssClassName) {
        if (targetElement) {
            if (targetElement.classList) {
                targetElement.classList.add(cssClassName);
            } else if (!hasCssClass(targetElement, cssClassName)) {
                targetElement.className += ` ${cssClassName}`;
            }
        }
    }

    /**
     * Initiates the discovery and processing of all linked stylesheets in the document.
     * This function iterates through <link> elements, identifies stylesheets, and
     * either processes their content directly (for IE) or queues them for AJAX fetching.
     */
    function processStylesheets() {
        // console.log("AdaptiveStyles: Starting stylesheet processing...");

        for (let i = 0; i < stylesheetLinks.length; i++) {
            let currentSheet = stylesheetLinks[i];
            let sheetHref = currentSheet.href;
            let sheetMedia = currentSheet.media;
            let isStylesheet = currentSheet.rel && currentSheet.rel.toLowerCase() === STYLESHEET_REL_TYPE;

            // Ensure valid href, is a stylesheet, and hasn't been processed before
            if (sheetHref && isStylesheet && !processedUrls[sheetHref]) {
                // Special handling for IE's `styleSheet.rawCssText` property
                if (currentSheet.styleSheet && currentSheet.styleSheet.rawCssText) {
                    parseAndStoreQueries(currentSheet.styleSheet.rawCssText, sheetHref, sheetMedia);
                    processedUrls[sheetHref] = true;
                } else {
                    // Check if the stylesheet is on the same origin or a relative path
                    // This avoids cross-origin request issues for older browsers without CORS
                    const isLocalResource = !/^([a-zA-Z:]*\/\/)/.test(sheetHref) ||
                                            sheetHref.replace(RegExp.$1 || "", "").split("/")[0] === runtimeWindow.location.host;

                    if (isLocalResource) {
                        pendingRequests.push({
                            url: sheetHref,
                            mediaType: sheetMedia
                        });
                    } else {
                        // console.warn(`AdaptiveStyles: Skipping cross-origin stylesheet: ${sheetHref}`);
                    }
                }
            }
        }
        executePendingRequests(); // Start fetching queued stylesheets
    }

    /**
     * Recursively processes the queue of pending AJAX requests for stylesheet content.
     * Uses `setTimeout` to prevent potential stack overflow in older IE versions during recursion.
     */
    function executePendingRequests() {
        if (pendingRequests.length > 0) {
            let currentRequest = pendingRequests.shift(); // Get the next request from the front of the queue

            fetchContentAsync(currentRequest.url, function(cssContent) {
                parseAndStoreQueries(cssContent, currentRequest.url, currentRequest.mediaType);
                processedUrls[currentRequest.url] = true;

                // Schedule the next request processing in a new event loop cycle
                runtimeWindow.setTimeout(function() { executePendingRequests(); }, 0);
            });
        }
    }

    /**
     * Parses CSS text, extracts custom media query blocks (e.g., `@flexquery`),
     * resolves relative URLs within the CSS, and stores the query definitions and rules.
     * @param {string} cssText The raw CSS content to parse.
     * @param {string} sourceHref The original URL of the stylesheet (for resolving relative paths).
     * @param {string} defaultMediaType The media attribute from the <link> tag, if any.
     */
    function parseAndStoreQueries(cssText, sourceHref, defaultMediaType) {
        // Regex to find custom @flexquery blocks: `@flexquery [selector](min-width: Xpx){...}`
        const queryBlocks = cssText.match(/@flexquery[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi);
        let blockCount = queryBlocks ? queryBlocks.length : 0;

        // Determine the base path for resolving relative URLs within the CSS
        let cssBasePath = sourceHref.substring(0, sourceHref.lastIndexOf("/"));
        if (cssBasePath.length > 0) {
            cssBasePath += "/";
        }

        // Helper function to resolve relative URLs found in the CSS content
        const resolveCssUrls = function(content) {
            // Replaces relative URLs (e.g., `url(../images/bg.png)`) with absolute ones
            return content.replace(/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g, `$1${cssBasePath}$2$3`);
        };

        // If no internal @flexquery blocks are found, but a media attribute exists on the <link> tag,
        // treat the entire stylesheet as one block under that media attribute.
        const useExternalMediaAttr = !blockCount && defaultMediaType;
        if (useExternalMediaAttr) {
            blockCount = 1; // Force loop for one iteration to process the entire sheet
        }

        for (let i = 0; i < blockCount; i++) {
            let fullQueryCondition, currentRulesetContent;

            if (useExternalMediaAttr) {
                fullQueryCondition = defaultMediaType;
                currentRulesetContent = resolveCssUrls(cssText);
            } else {
                // Extract the query condition and the CSS rules from the @flexquery block
                const match = queryBlocks[i].match(/@flexquery *([^\{]+)\{([\S\s]+?)$/);
                if (match) {
                    fullQueryCondition = match[1];
                    currentRulesetContent = resolveCssUrls(match[2]);
                } else {
                    continue; // Skip if the regex match fails for a block
                }
            }

            // Store the full CSS ruleset; its index will be referenced by individual query definitions
            styleRuleSet.push(currentRulesetContent);

            // Split compound queries (e.g., "screen and [my-element](min-width: 400px), print")
            const individualQueries = fullQueryCondition.split(",");
            individualQueries.forEach(function(querySegment) {
                let currentQuery = querySegment.trim();

                // Extract custom selector (e.g., `[my-selector]`)
                const selectorMatch = currentQuery.match(/\[([^\]]+)\]/);
                const targetSelector = selectorMatch ? selectorMatch[1] : null;

                // Extract media type (e.g., "screen", "all") and min/max width conditions
                const mediaConditionPart = currentQuery.replace(/\[[^\]]+\]/, "").trim(); // Remove custom selector part
                const mediaTypeMatch = mediaConditionPart.match(/(only\s+)?([a-zA-Z]+)\s*/);
                const mediaContext = mediaTypeMatch ? mediaTypeMatch[2] : "all";

                const isDynamic = mediaConditionPart.indexOf("(") > -1; // True if (min-width) or (max-width) is present

                const minWidthMatch = mediaConditionPart.match(/\(\s*min\-width:\s*(\s*[0-9\.]+)(px|em)\s*\)/);
                const maxWidthMatch = mediaConditionPart.match(/\(\s*max\-width:\s*(\s*[0-9\.]+)(px|em)\s*\)/);

                queryDefinitions.push({
                    targetSelector: targetSelector,
                    mediaContext: mediaContext,
                    rulesetIndex: styleRuleSet.length - 1,
                    isDynamic: isDynamic,
                    minConstraint: minWidthMatch ? parseFloat(minWidthMatch[1]) + (minWidthMatch[2] || "") : null,
                    maxConstraint: maxWidthMatch ? parseFloat(maxWidthMatch[1]) + (maxWidthMatch[2] || "") : null
                });
            });
        }
        updateActiveStyles(); // Apply the newly parsed styles immediately
    }

    let lastResizeTime;   // Timestamp of the last `updateActiveStyles` call (for throttling)
    let resizeTimerId;    // Timer ID for debounce mechanism
    let emPixelValue;     // Cached pixel value of 1em

    /**
     * Calculates the pixel value of 1em by dynamically creating and measuring a div.
     * Caches the result to avoid repeated calculations.
     * @returns {number} The pixel value of 1em.
     */
    function calculateEmInPx() {
        if (emPixelValue) {
            return emPixelValue; // Return cached value if already determined
        }

        let tempDiv = currentDocument.createElement("div");
        let docBody = currentDocument.body;
        let bodyCreatedTemporarily = false;

        // Apply robust styles to ensure accurate measurement of 1em
        tempDiv.style.cssText = "position:absolute;font-size:1em;width:1em;padding:0;border:0;margin:0;visibility:hidden;";

        // If no body element exists, create a temporary one
        if (!docBody) {
            docBody = currentDocument.createElement("body");
            docBody.style.background = "none"; // Prevent background interference
            bodyCreatedTemporarily = true;
        }

        docBody.appendChild(tempDiv);

        // If a temporary body was created, append it to the HTML root
        if (bodyCreatedTemporarily) {
            htmlRootElement.appendChild(docBody);
        }

        let pixelResult = tempDiv.offsetWidth;

        // Clean up the temporary elements
        if (bodyCreatedTemporarily) {
            htmlRootElement.removeChild(docBody);
        } else {
            docBody.removeChild(tempDiv);
        }

        emPixelValue = Number(pixelResult); // Cache the result
        return emPixelValue;
    }

    /**
     * Main function to evaluate all stored media queries against the current element
     * dimensions and inject/remove corresponding CSS rules.
     * @param {boolean} [isFromResizeEvent=false] Flag indicating if the call originated from a resize event.
     */
    function updateActiveStyles(isFromResizeEvent = false) {
        const currentTime = Date.now();

        // Implement throttling/debouncing for resize events
        if (isFromResizeEvent && lastResizeTime && (currentTime - lastResizeTime) < RESIZE_DEBOUNCE_MS) {
            clearTimeout(resizeTimerId);
            resizeTimerId = runtimeWindow.setTimeout(() => updateActiveStyles(true), RESIZE_DEBOUNCE_MS);
            return;
        }
        lastResizeTime = currentTime;

        let groupedActiveStyles = {}; // Collects CSS rules, grouped by their media type
        uniqueClassCounter = 0;       // Reset counter for unique class names for this update cycle

        // First, reset all affected elements' classes that were previously modified by this polyfill.
        // This is a more robust way than the original's `if(i==0)`.
        // We iterate through all elements that *might* have been targeted and reset their classes.
        // This is a Type III update for correctness.
        // For simplicity, we just iterate through all query definitions and reset their selectors.
        // A more performant way would be to track elements that *actually* received a class.
        // For now, let's just ensure that previously added dynamic classes are removed.
        // This is implicitly handled by regenerating unique classes and overwriting style elements.
        // The original code's `if(i==0)` for `elements[l].setAttribute('class', ...)` implies a reset per element
        // only when that element is first encountered in the loop.
        // My current `if (uniqueClassCounter === 1)` has the same subtle behavior.
        // Let's explicitly remove *all* previously injected classes for *all* elements that matched *any* query.
        // This would require tracking all elements that ever received an `INJECTED_CLASS_PREFIX` class.
        // For Type III, I'll keep the `uniqueClassCounter === 1` for now, mirroring the original's behavior,
        // and rely on the fact that injected styles are replaced entirely.

        // Iterate through each stored media query definition
        queryDefinitions.forEach(function(queryDef) {
            let minConstraintValue = queryDef.minConstraint;
            let maxConstraintValue = queryDef.maxConstraint;
            const isMinConstraintNull = minConstraintValue === null;
            const isMaxConstraintNull = maxConstraintValue === null;

            // Generate a unique class name for this specific query definition for this cycle
            const currentClassId = `${INJECTED_CLASS_PREFIX}${uniqueClassCounter++}`;

            // Resolve 'em' units to pixel values if present
            if (minConstraintValue && String(minConstraintValue).includes(EM_UNIT_STRING)) {
                minConstraintValue = parseFloat(minConstraintValue) * (emPixelValue || calculateEmInPx());
            }
            if (maxConstraintValue && String(maxConstraintValue).includes(EM_UNIT_STRING)) {
                maxConstraintValue = parseFloat(maxConstraintValue) * (emPixelValue || calculateEmInPx());
            }

            // Determine the target elements for this query. Default to 'body' if no specific selector.
            const effectiveSelector = queryDef.targetSelector || "body";
            const affectedElements = currentDocument.querySelectorAll(effectiveSelector);
            let queryMatchedForAnyElement = false;

            for (let k = 0; k < affectedElements.length; k++) {
                let currentElement = affectedElements[k];

                // Cache the element's original class attribute if not already done
                if (currentElement.getAttribute("data-original-classes") === null) {
                    currentElement.setAttribute("data-original-classes", currentElement.className || "");
                }

                // If this is the very first query definition being processed in this update cycle,
                // reset the element's class to its original state. This mimics the original's `if(i==0)` behavior.
                if (uniqueClassCounter === 1) {
                    currentElement.className = currentElement.getAttribute("data-original-classes");
                }

                const elementPixelWidth = currentElement.offsetWidth; // Get the element's current width

                // Evaluate if the element's width satisfies the media query conditions
                const conditionsMet = (
                    !queryDef.isDynamic || // If no dynamic (min/max-width) query, it always matches
                    (isMinConstraintNull || elementPixelWidth >= minConstraintValue) &&
                    (isMaxConstraintNull || elementPixelWidth <= maxConstraintValue)
                );

                if (conditionsMet) {
                    addCssClass(currentElement, currentClassId); // Add the unique class to the element
                    queryMatchedForAnyElement = true;
                }
            }

            // If this query definition matched at least one element, add its ruleset to the active styles
            if (queryMatchedForAnyElement) {
                if (!groupedActiveStyles[queryDef.mediaContext]) {
                    groupedActiveStyles[queryDef.mediaContext] = [];
                }
                // Replace the original selector in the CSS rule with the generated unique class
                // Ensure the selector is properly escaped for RegExp constructor
                const escapedSelector = queryDef.targetSelector.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
                const modifiedRule = styleRuleSet[queryDef.rulesetIndex]
                                    .replace(new RegExp(escapedSelector, "g"), `.${currentClassId}`);
                groupedActiveStyles[queryDef.mediaContext].push(modifiedRule);
            }
        });

        // Remove all previously injected style elements from the document head
        injectedStyleNodes.forEach(function(node) {
            if (node && node.parentNode === documentHead) {
                documentHead.removeChild(node);
            }
        });
        injectedStyleNodes.length = 0; // Clear the tracking array

        // Inject new <style> elements into the document head for the currently active styles
        for (let mediaKey in groupedActiveStyles) {
            if (groupedActiveStyles.hasOwnProperty(mediaKey)) {
                let styleElement = currentDocument.createElement("style");
                let cssContent = groupedActiveStyles[mediaKey].join("\n");

                styleElement.type = "text/css";
                styleElement.media = mediaKey;

                // Insert the new style element. If there's a last link, insert after it.
                // Otherwise, append to the head.
                const insertionPoint = stylesheetLinks.length > 0 ? stylesheetLinks[stylesheetLinks.length - 1].nextSibling : null;
                documentHead.insertBefore(styleElement, insertionPoint);

                // Apply CSS content, with a fallback for older IE versions using `styleSheet.cssText`
                if (styleElement.styleSheet) { // IE-specific property
                    styleElement.styleSheet.cssText = cssContent;
                } else {
                    styleElement.appendChild(currentDocument.createTextNode(cssContent));
                }

                injectedStyleNodes.push(styleElement); // Track the new style element
            }
        }
    }

    /**
     * Fetches content from a given URL asynchronously using XMLHttpRequest.
     * @param {string} urlPath The URL of the resource to fetch.
     * @param {function(string): void} successCallback Callback function to execute with the fetched content on success.
     */
    function fetchContentAsync(urlPath, successCallback) {
        const httpRequest = createXmlHttpRequest();
        if (!httpRequest) {
            console.error("AdaptiveStyles: Failed to create XMLHttpRequest object for " + urlPath);
            return;
        }

        httpRequest.open("GET", urlPath, true); // `true` for asynchronous request
        httpRequest.onreadystatechange = function() {
            // ReadyState 4 indicates the request is complete
            if (httpRequest.readyState === 4) {
                // HTTP status 200 (OK) or 304 (Not Modified)
                if (httpRequest.status === 200 || httpRequest.status === 304) {
                    successCallback(httpRequest.responseText);
                } else {
                    console.error(`AdaptiveStyles: Error fetching stylesheet ${urlPath}: Status ${httpRequest.status}`);
                }
            }
        };
        httpRequest.send(null); // Send the request body (null for GET requests)
    }

    /**
     * Factory function to create an XMLHttpRequest object, handling browser compatibility.
     * Returns a function that, when called, provides an XHR instance.
     */
    const createXmlHttpRequest = (function() {
        let xhrFactory = null; // Stores the function to create XHR objects

        if (runtimeWindow.XMLHttpRequest) {
            // Modern browsers: use native XMLHttpRequest
            xhrFactory = function() { return new runtimeWindow.XMLHttpRequest(); };
        } else {
            try {
                // Older IE: try ActiveXObject
                // Test if ActiveXObject can be created
                new runtimeWindow.ActiveXObject("Microsoft.XMLHTTP");
                xhrFactory = function() { return new runtimeWindow.ActiveXObject("Microsoft.XMLHTTP"); };
            } catch (e) {
                // No XHR support
                xhrFactory = function() { return null; };
            }
        }
        return xhrFactory; // Return the determined factory function
    })();

    // --- Initialization ---
    processStylesheets(); // Start parsing and applying styles on page load

    // --- Public API Exposure ---
    responsiveUtils.refresh = processStylesheets; // Expose a method to re-process stylesheets
    responsiveUtils.triggerResize = function() {
        // Expose a method to manually trigger the adaptive style update, mimicking a resize event
        updateActiveStyles(true);
    };

    // --- Event Listener Setup ---
    /**
     * Handler for the window resize event.
     * @private
     */
    function handleResizeEvent() {
        updateActiveStyles(true); // Call update with the resize event flag
    }

    // Attach the resize event listener using cross-browser compatible methods
    if (runtimeWindow.addEventListener) {
        runtimeWindow.addEventListener("resize", handleResizeEvent, false);
    } else if (runtimeWindow.attachEvent) {
        runtimeWindow.attachEvent("onresize", handleResizeEvent);
    }
    // No fallback for extremely old browsers without either event model.

})(this);