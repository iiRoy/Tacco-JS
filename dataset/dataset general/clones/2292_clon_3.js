/*
 * Application Core Library 1.0
 * Copyright(c) 2023-2024, ACME Corp.
 * info@acmecorp.com
 *
 * This code is proprietary and confidential. Unauthorized copying is prohibited.
 */


// Main application namespace.
var AppCore = AppCore || {};

// Module for handling DOM element creation and manipulation.
AppCore.MarkupAssembler = (function(){
    // A temporary DIV element used for parsing HTML strings, especially for table structures.
    var scratchPadElement = null;

    // Regular expression to identify self-closing (void) HTML5 elements.
    // These elements do not have a closing tag.
    var voidElementsPattern = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;

    // Regular expression to identify table-related elements that require special insertion handling.
    var structuralTableRegex = /^(?:table|tbody|tfoot|thead|tr|td|th)$/i;

    /**
     * Recursively generates an HTML string from a configuration object.
     * @param {Object|string} componentConfig - The configuration object describing the element structure, or a direct HTML string.
     * @returns {string} The generated HTML string.
     */
    var renderMarkupString = function(componentConfig){
        if (typeof componentConfig === 'string') {
            return componentConfig;
        }
        if (!componentConfig || typeof componentConfig !== 'object') {
            // Log a warning or throw an error for invalid input, then return empty.
            console.warn("MarkupAssembler: Invalid component configuration provided:", componentConfig);
            return '';
        }

        var markupPieces = [];
        var tagName = componentConfig.tagName || "div";
        markupPieces.push("<" + tagName);

        // Iterate through properties to add attributes.
        for (var attributeName in componentConfig) {
            // Skip internal properties or functions.
            if (attributeName === "tagName" || attributeName === "childComponents" || attributeName === "nestedElements" || attributeName === "innerHtmlContent" || typeof componentConfig[attributeName] === "function") {
                continue;
            }

            if (attributeName === "elementStyles") {
                var styleDefinition = componentConfig["elementStyles"];
                if (typeof styleDefinition === "function") {
                    styleDefinition = styleDefinition.call(componentConfig); // Execute function to get styles
                }
                if (typeof styleDefinition === "string") {
                    markupPieces.push(' style="' + styleDefinition + '"');
                } else if (typeof styleDefinition === "object") {
                    var styleBuffer = [];
                    for (var styleKey in styleDefinition) {
                        if (Object.prototype.hasOwnProperty.call(styleDefinition, styleKey) && typeof styleDefinition[styleKey] !== "function") {
                            styleBuffer.push(styleKey + ":" + styleDefinition[styleKey] + ";");
                        }
                    }
                    markupPieces.push(' style="' + styleBuffer.join('') + '"');
                }
            } else {
                if (attributeName === "cssClass") {
                    markupPieces.push(' class="' + componentConfig["cssClass"] + '"');
                } else if (attributeName === "labelTarget") {
                    markupPieces.push(' for="' + componentConfig["labelTarget"] + '"');
                } else {
                    // Standard attributes
                    markupPieces.push(" " + attributeName + '="' + componentConfig[attributeName] + '"');
                }
            }
        }

        if (voidElementsPattern.test(tagName)) {
            markupPieces.push("/>"); // Self-closing tag
        } else {
            markupPieces.push(">"); // Opening tag

            var childList = componentConfig.childComponents || componentConfig.nestedElements;
            if (childList) {
                if (Array.isArray(childList)) {
                    for (var k = 0, numChildren = childList.length; k < numChildren; k++) {
                        markupPieces.push(renderMarkupString(childList[k]));
                    }
                } else {
                    // Single child component
                    markupPieces.push(renderMarkupString(childList));
                }
            }
            if (componentConfig.innerHtmlContent) {
                markupPieces.push(componentConfig.innerHtmlContent);
            }
            markupPieces.push("</" + tagName + ">"); // Closing tag
        }
        return markupPieces.join('');
    };

    /**
     * Creates and appends a DOM element based on a configuration object.
     * @param {Object} nodeSpec - The configuration object for the DOM node.
     * @param {HTMLElement} [parentContainer] - The parent element to which the new node will be appended.
     * @returns {HTMLElement} The newly created DOM element.
     */
    var constructDomNode = function(nodeSpec, parentContainer){
        if (!nodeSpec || typeof nodeSpec !== 'object') {
            console.error("MarkupAssembler: Invalid node specification for DOM construction:", nodeSpec);
            return null;
        }

        var newElement = document.createElement(nodeSpec.nodeType || 'div');
        var canUseSetAttribute = newElement.setAttribute ? true : false; // Check for old IE compatibility

        for (var attributeName in nodeSpec) {
            // Skip properties that are not direct attributes or are handled separately.
            if (attributeName === "nodeType" || attributeName === "childComponents" || attributeName === "nestedElements" || attributeName === "contentHtml" || attributeName === "elementStyles" || typeof nodeSpec[attributeName] === "function") {
                continue;
            }

            if (attributeName === "className") {
                newElement.className = nodeSpec["className"];
            } else {
                if (canUseSetAttribute) {
                    newElement.setAttribute(attributeName, nodeSpec[attributeName]);
                } else {
                    newElement[attributeName] = nodeSpec[attributeName]; // Fallback for older browsers
                }
            }
        }

        // Apply styles using the dedicated helper function.
        AppCore.MarkupAssembler.setElementStyles(newElement, nodeSpec.elementStyles);

        var childNodeSpecs = nodeSpec.childComponents || nodeSpec.nestedElements;
        if (childNodeSpecs) {
            if (Array.isArray(childNodeSpecs)) {
                for (var j = 0, childCount = childNodeSpecs.length; j < childCount; j++) {
                    constructDomNode(childNodeSpecs[j], newElement);
                }
            } else {
                constructDomNode(childNodeSpecs, newElement); // Handle single child
            }
        }

        // Set innerHTML if provided.
        if (nodeSpec.contentHtml) {
            newElement.innerHTML = nodeSpec.contentHtml;
        }

        // Append to parent if specified.
        if (parentContainer) {
            parentContainer.appendChild(newElement);
        }
        return newElement;
    };

    // Constants for table structure markup.
    const TABLE_BEGIN = '<table>';
    const TABLE_END = '</table>';
    const TBODY_BEGIN = '<tbody>';
    const TBODY_END = '</tbody>';
    const TR_BEGIN = '<tr>';
    const TR_END = '</tr>';

    /**
     * Creates a DOM fragment for table elements using a scratchpad div for IE compatibility.
     * Simulates insertion into a table structure to correctly parse HTML.
     * @param {number} nestingLevel - How many levels deep the target element is within the table structure (e.g., TR is 3 levels deep from TABLE).
     * @param {string} prefixMarkup - The opening tags required before the content (e.g., '<table><tbody><tr>').
     * @param {string} actualContent - The HTML content to be parsed.
     * @param {string} suffixMarkup - The closing tags required after the content.
     * @returns {HTMLElement} The deepest child element representing the inserted content.
     */
    var buildTableFragment = function(nestingLevel, prefixMarkup, actualContent, suffixMarkup){
        if (!scratchPadElement) {
            scratchPadElement = document.createElement('div');
        }
        scratchPadElement.innerHTML = prefixMarkup + actualContent + suffixMarkup;
        var currentElement = scratchPadElement;
        for (var i = 0; i < nestingLevel; i++) {
            currentElement = currentElement.firstChild;
        }
        return currentElement;
    };

    /**
     * Inserts HTML content specifically into table-related elements, handling browser quirks.
     * @param {string} targetTag - The tag name of the target element (e.g., 'td', 'tr', 'tbody').
     * @param {string} insertionPoint - The position relative to the target element (e.g., 'beforebegin', 'afterbegin').
     * @param {HTMLElement} targetElement - The element reference.
     * @param {string} contentHtml - The HTML string to insert.
     * @returns {HTMLElement|null} The inserted DOM node or null if not applicable.
     */
    var injectTableContent = function(targetTag, insertionPoint, targetElement, contentHtml){
        if (!scratchPadElement) {
            scratchPadElement = document.createElement('div');
        }
        var newFragment;
        var referenceNode = null; // Node to insert before
        var parentForInsertion = targetElement; // Parent element where insertion will happen

        // Logic adjusted for different table element types and insertion points.
        if (targetTag === 'td' || targetTag === 'th') {
            if (insertionPoint === 'afterbegin' || insertionPoint === 'beforeend') {
                return null; // Cannot insert raw HTML inside TD/TH using this method for IE.
            }
            if (insertionPoint === 'beforebegin') {
                referenceNode = targetElement;
                parentForInsertion = targetElement.parentNode;
            } else { // 'afterend'
                referenceNode = targetElement.nextSibling;
                parentForInsertion = targetElement.parentNode;
            }
            newFragment = buildTableFragment(4, TR_BEGIN, contentHtml, TR_END);
        } else if (targetTag === 'tr') {
            if (insertionPoint === 'beforebegin') {
                referenceNode = targetElement;
                parentForInsertion = targetElement.parentNode;
                newFragment = buildTableFragment(3, TBODY_BEGIN, contentHtml, TBODY_END);
            } else if (insertionPoint === 'afterend') {
                referenceNode = targetElement.nextSibling;
                parentForInsertion = targetElement.parentNode;
                newFragment = buildTableFragment(3, TBODY_BEGIN, contentHtml, TBODY_END);
            } else { // 'afterbegin' or 'beforeend'
                if (insertionPoint === 'afterbegin') {
                    referenceNode = targetElement.firstChild;
                }
                newFragment = buildTableFragment(4, TR_BEGIN, contentHtml, TR_END);
            }
        } else if (targetTag === 'tbody' || targetTag === 'thead' || targetTag === 'tfoot') {
            if (insertionPoint === 'beforebegin') {
                referenceNode = targetElement;
                parentForInsertion = targetElement.parentNode;
                newFragment = buildTableFragment(2, TABLE_BEGIN, contentHtml, TABLE_END);
            } else if (insertionPoint === 'afterend') {
                referenceNode = targetElement.nextSibling;
                parentForInsertion = targetElement.parentNode;
                newFragment = buildTableFragment(2, TABLE_BEGIN, contentHtml, TABLE_END);
            } else { // 'afterbegin' or 'beforeend'
                if (insertionPoint === 'afterbegin') {
                    referenceNode = targetElement.firstChild;
                }
                newFragment = buildTableFragment(3, TBODY_BEGIN, contentHtml, TBODY_END);
            }
        } else { // Default case, likely a TABLE tag itself
            if (insertionPoint === 'beforebegin' || insertionPoint === 'afterend') {
                return null; // Cannot insert raw HTML outside TABLE using this method.
            }
            if (insertionPoint === 'afterbegin') {
                referenceNode = targetElement.firstChild;
            }
            newFragment = buildTableFragment(2, TABLE_BEGIN, contentHtml, TABLE_END);
        }

        if (parentForInsertion && newFragment) {
            parentForInsertion.insertBefore(newFragment, referenceNode);
            return newFragment;
        }
        return null;
    };


    // Public interface for the MarkupAssembler module.
    return {
        // Flag to indicate whether to prefer DOM element creation over HTML string generation.
        preferDomCreation : false,

        /**
         * Generates an HTML string from a structured object.
         * @param {Object} configObject - The object defining the HTML structure.
         * @returns {string} The HTML string.
         */
        assembleString : function(configObject){
            return renderMarkupString(configObject);
        },

        /**
         * Applies a set of CSS styles to a DOM element.
         * @param {HTMLElement|string} elementRef - The DOM element or its ID.
         * @param {string|Object|Function} styleDefinitions - Styles as a string, object, or function returning styles.
         */
        setElementStyles : function(elementRef, styleDefinitions){
            if (!styleDefinitions) {
                return; // No styles to apply
            }

            var targetEl = AppCore.fly(elementRef); // Use a utility to get/wrap the element.

            if (typeof styleDefinitions === "string") {
                // Parse CSS string "prop: val; prop2: val2;"
                var styleParser = /\s*([a-z\-]*)\s*:\s*([^;]*);?/gi;
                var matchResult;
                while ((matchResult = styleParser.exec(styleDefinitions)) !== null){
                    if (matchResult[1] && matchResult[2]) {
                        targetEl.setStyle(matchResult[1], matchResult[2]);
                    }
                }
            } else if (typeof styleDefinitions === "object") {
                // Apply styles from an object {prop: 'val', prop2: 'val2'}
                for (var styleProperty in styleDefinitions){
                    if (Object.prototype.hasOwnProperty.call(styleDefinitions, styleProperty) && typeof styleDefinitions[styleProperty] !== "function") {
                        targetEl.setStyle(styleProperty, styleDefinitions[styleProperty]);
                    }
                }
            } else if (typeof styleDefinitions === "function"){
                // Execute function to get styles, then re-apply.
                AppCore.MarkupAssembler.setElementStyles(targetEl, styleDefinitions.call(targetEl));
            }
        },

        /**
         * Inserts HTML content into the DOM at a specified position relative to a target element.
         * @param {string} positionKey - The insertion point ('beforebegin', 'afterbegin', 'beforeend', 'afterend').
         * @param {HTMLElement} targetEl - The reference DOM element.
         * @param {string} htmlContent - The HTML string to insert.
         * @returns {HTMLElement} The newly inserted DOM node.
         * @throws {Error} If an illegal insertion point is specified.
         */
        injectHtmlContent : function(positionKey, targetEl, htmlContent){
            var normalizedPosition = positionKey.toLowerCase();

            // Use insertAdjacentHTML for better performance if available.
            if (targetEl.insertAdjacentHTML) {
                // Special handling for table elements due to browser parsing issues.
                if (structuralTableRegex.test(targetEl.tagName)) {
                    var tableInsertionResult = injectTableContent(targetEl.tagName.toLowerCase(), normalizedPosition, targetEl, htmlContent);
                    if (tableInsertionResult) {
                        return tableInsertionResult;
                    }
                }

                switch(normalizedPosition){
                    case "beforebegin":
                        targetEl.insertAdjacentHTML('BeforeBegin', htmlContent);
                        return targetEl.previousSibling;
                    case "afterbegin":
                        targetEl.insertAdjacentHTML('AfterBegin', htmlContent);
                        return targetEl.firstChild;
                    case "beforeend":
                        targetEl.insertAdjacentHTML('BeforeEnd', htmlContent);
                        return targetEl.lastChild;
                    case "afterend":
                        targetEl.insertAdjacentHTML('AfterEnd', htmlContent);
                        return targetEl.nextSibling;
                }
                throw new Error('MarkupAssembler: Invalid insertion point -> "' + normalizedPosition + '"');
            }

            // Fallback for browsers that don't support insertAdjacentHTML (e.g., some older Firefox versions).
            var docRange = targetEl.ownerDocument.createRange();
            var fragment;

            switch(normalizedPosition){
                 case "beforebegin":
                    docRange.setStartBefore(targetEl);
                    fragment = docRange.createContextualFragment(htmlContent);
                    targetEl.parentNode.insertBefore(fragment, targetEl);
                    return targetEl.previousSibling;
                 case "afterbegin":
                    if(targetEl.firstChild){
                        docRange.setStartBefore(targetEl.firstChild);
                        fragment = docRange.createContextualFragment(htmlContent);
                        targetEl.insertBefore(fragment, targetEl.firstChild);
                        return targetEl.firstChild;
                    } else {
                        // If no firstChild, just set innerHTML.
                        targetEl.innerHTML = htmlContent;
                        return targetEl.firstChild;
                    }
                case "beforeend":
                    if(targetEl.lastChild){
                        docRange.setStartAfter(targetEl.lastChild);
                        fragment = docRange.createContextualFragment(htmlContent);
                        targetEl.appendChild(fragment);
                        return targetEl.lastChild;
                    } else {
                        // If no lastChild, just set innerHTML.
                        targetEl.innerHTML = htmlContent;
                        return targetEl.lastChild;
                    }
                case "afterend":
                    docRange.setStartAfter(targetEl);
                    fragment = docRange.createContextualFragment(htmlContent);
                    targetEl.parentNode.insertBefore(fragment, targetEl.nextSibling);
                    return targetEl.nextSibling;
            }
            throw new Error('MarkupAssembler: Invalid insertion point -> "' + normalizedPosition + '"');
        },

        /**
         * Inserts a new element before a reference element.
         * @param {HTMLElement|string} refElement - The reference element or its ID.
         * @param {Object} config - Configuration for the new element.
         * @param {boolean} [returnWrapper=false] - True to return a wrapped element, false for raw DOM node.
         * @returns {HTMLElement|AppCore.Element} The new element.
         */
        prependSibling : function(refElement, config, returnWrapper){
            return this.performInsertion(refElement, config, returnWrapper, "beforeBegin");
        },

        /**
         * Inserts a new element after a reference element.
         * @param {HTMLElement|string} refElement - The reference element or its ID.
         * @param {Object} config - Configuration for the new element.
         * @param {boolean} [returnWrapper=false] - True to return a wrapped element, false for raw DOM node.
         * @returns {HTMLElement|AppCore.Element} The new element.
         */
        appendSibling : function(refElement, config, returnWrapper){
            return this.performInsertion(refElement, config, returnWrapper, "afterEnd", "nextSibling");
        },

        /**
         * Inserts a new element as the first child of a parent element.
         * @param {HTMLElement|string} parentElement - The parent element or its ID.
         * @param {Object} config - Configuration for the new element.
         * @param {boolean} [returnWrapper=false] - True to return a wrapped element, false for raw DOM node.
         * @returns {HTMLElement|AppCore.Element} The new element.
         */
        prependChild : function(parentElement, config, returnWrapper){
            return this.performInsertion(parentElement, config, returnWrapper, "afterBegin", "firstChild");
        },

        /**
         * Core insertion logic for creating and placing new DOM elements.
         * @param {HTMLElement|string} targetNode - The element or its ID to insert relative to.
         * @param {Object} configObj - The configuration for the element to insert.
         * @param {boolean} wrapResult - Whether to return a wrapped AppCore.Element.
         * @param {string} insertPoint - The position for insertion (e.g., 'beforeBegin', 'afterEnd').
         * @param {string} [relativePos] - Optional property name for sibling reference (e.g., 'firstChild', 'nextSibling').
         * @returns {HTMLElement|AppCore.Element} The inserted DOM node or its wrapped version.
         */
        performInsertion : function(targetNode, configObj, wrapResult, insertPoint, relativePos){
            var actualTarget = AppCore.getDomRef(targetNode);
            if (!actualTarget) {
                console.error("MarkupAssembler: Target node not found for insertion.", targetNode);
                return null;
            }

            var insertedNode;
            if (this.preferDomCreation) {
                insertedNode = constructDomNode(configObj, null); // Create node without appending
                var parentForDirectInsert = (relativePos === "firstChild" ? actualTarget : actualTarget.parentNode);
                var referenceChild = relativePos ? actualTarget[relativePos] : actualTarget;
                parentForDirectInsert.insertBefore(insertedNode, referenceChild);
            } else {
                var htmlFragment = renderMarkupString(configObj);
                insertedNode = this.injectHtmlContent(insertPoint, actualTarget, htmlFragment);
            }
            return wrapResult ? AppCore.wrapElement(insertedNode, true) : insertedNode;
        },

        /**
         * Appends a new element as the last child of a parent element.
         * @param {HTMLElement|string} parentElement - The parent element or its ID.
         * @param {Object} configObj - Configuration for the new element.
         * @param {boolean} [wrapResult=false] - True to return a wrapped element, false for raw DOM node.
         * @returns {HTMLElement|AppCore.Element} The new element.
         */
        appendChild : function(parentElement, configObj, wrapResult){
            var actualParent = AppCore.getDomRef(parentElement);
            if (!actualParent) {
                console.error("MarkupAssembler: Parent element not found for appendChild.", parentElement);
                return null;
            }

            var appendedNode;
            if (this.preferDomCreation) {
                appendedNode = constructDomNode(configObj, null);
                actualParent.appendChild(appendedNode);
            } else {
                var htmlContent = renderMarkupString(configObj);
                appendedNode = this.injectHtmlContent("beforeEnd", actualParent, htmlContent);
            }
            return wrapResult ? AppCore.wrapElement(appendedNode, true) : appendedNode;
        },

        /**
         * Replaces the entire content of an element with new HTML generated from a config object.
         * @param {HTMLElement|string} elementRef - The element or its ID whose content will be replaced.
         * @param {Object} configObj - Configuration for the new content.
         * @param {boolean} [wrapResult=false] - True to return a wrapped element, false for raw DOM node.
         * @returns {HTMLElement|AppCore.Element} The first child of the updated element.
         */
        replaceContent : function(elementRef, configObj, wrapResult){
            var targetElement = AppCore.getDomRef(elementRef);
            if (!targetElement) {
                console.error("MarkupAssembler: Target element not found for replaceContent.", elementRef);
                return null;
            }
            targetElement.innerHTML = renderMarkupString(configObj);
            return wrapResult ? AppCore.wrapElement(targetElement.firstChild, true) : targetElement.firstChild;
        },

        /**
         * Creates a new content binder (template) from a configuration object.
         * @param {Object} configObj - The configuration for the template's initial HTML.
         * @returns {AppCore.ContentFormatter} A new content formatter instance.
         */
        createContentBinder : function(configObj){
            var initialHtml = renderMarkupString(configObj);
            return new AppCore.ContentFormatter(initialHtml);
        }
    };
})();


/**
 * @class AppCore.ContentFormatter
 * A class for creating and processing HTML templates.
 * Allows embedding data values and applying formatting functions.
 * @param {string|Array} initialContent - The HTML string or an array of strings to form the template.
 * @constructor
 */
AppCore.ContentFormatter = function(initialContent){
    var sourceArgs = arguments; // Capture all arguments for flexible initialization.

    // Handle array input for template content.
    if (Array.isArray(initialContent)) {
        initialContent = initialContent.join("");
    } else if (sourceArgs.length > 1) {
        // If multiple arguments, concatenate strings and apply objects to 'this'.
        var buffer = [];
        for (var i = 0, len = sourceArgs.length; i < len; i++) {
            if (typeof sourceArgs[i] === 'object' && sourceArgs[i] !== null) {
                // Apply configuration objects directly to the instance.
                Object.assign(this, sourceArgs[i]);
            } else {
                buffer.push(sourceArgs[i]);
            }
        }
        initialContent = buffer.join('');
    }

    this.templateString = initialContent || ''; // Store the raw template string.
    if (this.isPrecompiled) {
        this.precompileTemplate(); // If marked for pre-compilation, do it now.
    }
};

AppCore.ContentFormatter.prototype = {
    /**
     * Applies data values to the template, filling in placeholders.
     * @param {Object} dataObject - An object containing key-value pairs to substitute into the template.
     * @returns {string} The formatted HTML string.
     */
    formatWithData : function(dataObject){
        if (this.precompiledFunction) {
            // If the template is pre-compiled, use the generated function for speed.
            return this.precompiledFunction(dataObject);
        }
        
        // Determine if formatters should be applied.
        var applyFormatters = (this.ignoreFormatters !== true);
        var stringFormatter = AppCore.Utilities && AppCore.Utilities.StringFormats ? AppCore.Utilities.StringFormats : {};
        var currentFormatterInstance = this; // Reference to the current template instance.

        // Replacer function for the regex match.
        var replacerFunction = function(match, keyName, formatName, formatArguments){
            // If a formatter is specified and allowed.
            if (formatName && applyFormatters) {
                if (formatName.startsWith("this.")) {
                    // Custom formatter method on this template instance.
                    var customMethod = formatName.substring(5);
                    if (typeof currentFormatterInstance[customMethod] === 'function') {
                        return currentFormatterInstance.executeCustomFormatter(customMethod, dataObject[keyName], dataObject);
                    } else {
                        console.warn("ContentFormatter: Custom method '" + customMethod + "' not found on template instance.");
                        return dataObject[keyName] !== undefined ? dataObject[keyName] : "";
                    }
                } else {
                    // Use a global string formatter utility.
                    if (stringFormatter[formatName]) {
                        var parsedArgs;
                        if (formatArguments) {
                            // Parse arguments string into an array.
                            var quoteStripper = /^\s*['"](.*)["']\s*$/;
                            parsedArgs = formatArguments.split(',').map(function(arg) {
                                return arg.replace(quoteStripper, "$1");
                            });
                            parsedArgs.unshift(dataObject[keyName]); // Prepend the value itself.
                        } else {
                            parsedArgs = [dataObject[keyName]];
                        }
                        return stringFormatter[formatName].apply(stringFormatter, parsedArgs);
                    } else {
                        console.warn("ContentFormatter: String formatter '" + formatName + "' not found.");
                        return dataObject[keyName] !== undefined ? dataObject[keyName] : "";
                    }
                }
            } else {
                // No formatter, or formatters are disabled.
                return dataObject[keyName] !== undefined ? dataObject[keyName] : "";
            }
        };
        // Perform replacement using the regex and replacer function.
        return this.templateString.replace(this.placeholderRegex, replacerFunction);
    },

    /**
     * Updates the template's HTML content and optionally re-compiles it.
     * @param {string} newContent - The new HTML string for the template.
     * @param {boolean} [shouldCompile=false] - True to immediately re-compile the template.
     * @returns {AppCore.ContentFormatter} This template instance for chaining.
     */
    updateTemplate : function(newContent, shouldCompile){
        this.templateString = newContent;
        this.precompiledFunction = null; // Clear any existing compiled function.
        if (shouldCompile) {
            this.precompileTemplate();
        }
        return this;
    },

    // Flag to disable formatter functions when applying data.
    ignoreFormatters : false,

    // Regular expression for identifying template placeholders.
    // Matches {keyName:formatterName(arg1,arg2)}.
    placeholderRegex : /\{([a-zA-Z0-9_-]+)(?:\:([a-zA-Z0-9_.]*)(?:\((.*?)\))?)?\}/g,

    /**
     * Compiles the template string into a JavaScript function for faster execution.
     * This function generates code to directly build the output string.
     * @returns {AppCore.ContentFormatter} This template instance for chaining.
     */
    precompileTemplate : function(){
        var stringFormatter = AppCore.Utilities && AppCore.Utilities.StringFormats ? AppCore.Utilities.StringFormats : {};
        var willApplyFormatters = (this.ignoreFormatters !== true);
        // Use different string concatenation based on browser (Gecko often faster with '+').
        var stringSeparator = AppCore.isBrowser && AppCore.isBrowser.gecko ? " + " : " , ";

        var compileReplacer = function(match, keyName, formatName, formatArguments){
            var formattedPart;
            if (formatName && willApplyFormatters) {
                var argsStr = formatArguments ? ',' + formatArguments : "";
                if (formatName.slice(0, 5) !== "this.") {
                    // Global formatter function call.
                    formattedPart = "stringFormatter." + formatName + '(';
                } else {
                    // Custom method on the template instance.
                    formattedPart = 'this.executeCustomFormatter("'+ formatName.slice(5) + '", ';
                    argsStr = ", values"; // Custom formatters receive all values.
                }
            } else {
                // No formatter, or formatters disabled. Handle undefined values.
                formattedPart = "(values['" + keyName + "'] == undefined ? '' : ";
                argsStr = '';
            }
            // Construct the JS code for this placeholder.
            return "'" + stringSeparator + formattedPart + "values['" + keyName + "']" + argsStr + ")" + stringSeparator + "'";
        };

        var functionBodyContent;
        var escapedHtml = this.templateString
                            .replace(/\\/g, '\\\\') // Escape backslashes.
                            .replace(/(\r\n|\n)/g, '\\n') // Escape newlines.
                            .replace(/'/g, "\\'") // Escape single quotes.
                            .replace(this.placeholderRegex, compileReplacer);

        if (AppCore.isBrowser && AppCore.isBrowser.gecko) {
            // For Gecko, direct string concatenation is often faster.
            functionBodyContent = " return '" + escapedHtml + "';";
        } else {
            // For other browsers, array join is typically faster.
            functionBodyContent = " return ['" + escapedHtml + "'].join('');";
        }
        
        // Create a new function dynamically.
        // This is equivalent to eval but safer as it runs in global scope.
        this.precompiledFunction = new Function('values', 'stringFormatter', functionBodyContent);
        this.precompiledFunction = this.precompiledFunction.bind(this, stringFormatter); // Bind stringFormatter for easier access.

        return this;
    },

    /**
     * Executes a custom formatter method defined directly on the template instance.
     * @param {string} methodName - The name of the method to call.
     * @param {*} value - The value of the current placeholder.
     * @param {Object} allValues - The entire data object provided for formatting.
     * @returns {*} The result of the custom formatter method.
     */
    executeCustomFormatter : function(methodName, value, allValues){
        if (typeof this[methodName] === 'function') {
            return this[methodName](value, allValues);
        }
        console.warn("ContentFormatter: Custom formatter method '" + methodName + "' not found.");
        return value; // Return original value if method is missing.
    },

    /**
     * Inserts the formatted template content as the first child of a container element.
     * @param {HTMLElement|string} containerElement - The container element or its ID.
     * @param {Object} dataValues - Data for the template.
     * @param {boolean} [returnWrapped=false] - True to return a wrapped element.
     * @returns {HTMLElement|AppCore.Element} The inserted DOM node.
     */
    insertAtStart: function(containerElement, dataValues, returnWrapped){
        return this.performDomInjection('afterBegin', containerElement, dataValues, returnWrapped);
    },

    /**
     * Inserts the formatted template content before a target element.
     * @param {HTMLElement|string} targetElement - The target element or its ID.
     * @param {Object} dataValues - Data for the template.
     * @param {boolean} [returnWrapped=false] - True to return a wrapped element.
     * @returns {HTMLElement|AppCore.Element} The inserted DOM node.
     */
    insertBeforeElement: function(targetElement, dataValues, returnWrapped){
        return this.performDomInjection('beforeBegin', targetElement, dataValues, returnWrapped);
    },

    /**
     * Inserts the formatted template content after a target element.
     * @param {HTMLElement|string} targetElement - The target element or its ID.
     * @param {Object} dataValues - Data for the template.
     * @param {boolean} [returnWrapped=false] - True to return a wrapped element.
     * @returns {HTMLElement|AppCore.Element} The inserted DOM node.
     */
    insertAfterElement : function(targetElement, dataValues, returnWrapped){
        return this.performDomInjection('afterEnd', targetElement, dataValues, returnWrapped);
    },

    /**
     * Appends the formatted template content as the last child of a container element.
     * @param {HTMLElement|string} containerElement - The container element or its ID.
     * @param {Object} dataValues - Data for the template.
     * @param {boolean} [returnWrapped=false] - True to return a wrapped element.
     * @returns {HTMLElement|AppCore.Element} The inserted DOM node.
     */
    appendToElement : function(containerElement, dataValues, returnWrapped){
        return this.performDomInjection('beforeEnd', containerElement, dataValues, returnWrapped);
    },

    /**
     * Generic method to handle DOM insertion of formatted template content.
     * @param {string} position - The insertion point (e.g., 'afterBegin').
     * @param {HTMLElement|string} elementReference - The reference element or its ID.
     * @param {Object} dataValues - Data for the template.
     * @param {boolean} returnAsWrapped - Whether to return a wrapped AppCore.Element.
     * @returns {HTMLElement|AppCore.Element} The newly inserted DOM node or its wrapped version.
     */
    performDomInjection : function(position, elementReference, dataValues, returnAsWrapped){
        var actualElement = AppCore.getDomRef(elementReference);
        if (!actualElement) {
            console.error("ContentFormatter: Target element not found for DOM injection.", elementReference);
            return null;
        }
        var renderedHtml = this.formatWithData(dataValues);
        var insertedNode = AppCore.MarkupAssembler.injectHtmlContent(position, actualElement, renderedHtml);
        return returnAsWrapped ? AppCore.wrapElement(insertedNode, true) : insertedNode;
    },

    /**
     * Replaces the content of an element with the formatted template output.
     * @param {HTMLElement|string} elementReference - The element or its ID whose content will be replaced.
     * @param {Object} dataValues - Data for the template.
     * @param {boolean} [returnWrapped=false] - True to return a wrapped element.
     * @returns {HTMLElement|AppCore.Element} The first child of the updated element.
     */
    replaceElementContent : function(elementReference, dataValues, returnWrapped){
        var actualElement = AppCore.getDomRef(elementReference);
        if (!actualElement) {
            console.error("ContentFormatter: Target element not found for content replacement.", elementReference);
            return null;
        }
        actualElement.innerHTML = this.formatWithData(dataValues);
        return returnWrapped ? AppCore.wrapElement(actualElement.firstChild, true) : actualElement.firstChild;
    }
};

// Alias for compatibility/convenience.
AppCore.ContentFormatter.prototype.apply = AppCore.ContentFormatter.prototype.formatWithData;

// Expose the ContentFormatter class within MarkupAssembler as well.
AppCore.MarkupAssembler.Formatter = AppCore.ContentFormatter;

/**
 * Static method to create a ContentFormatter instance directly from an existing DOM element's content.
 * @param {HTMLElement|string} sourceElement - The DOM element or its ID to extract template content from.
 * @param {Object} [configSettings] - Optional configuration settings for the template.
 * @returns {AppCore.ContentFormatter} A new ContentFormatter instance.
 */
AppCore.ContentFormatter.fromElement = function(sourceElement, configSettings){
    var domSource = AppCore.getDomRef(sourceElement);
    if (!domSource) {
        console.error("ContentFormatter.fromElement: Source element not found.", sourceElement);
        return null;
    }
    // Use value for input fields, otherwise innerHTML for containers.
    var templateHtml = domSource.value !== undefined ? domSource.value : domSource.innerHTML;
    return new AppCore.ContentFormatter(templateHtml, configSettings || {});
};


// Dummy AppCore.fly, AppCore.getDomRef, AppCore.wrapElement, AppCore.Utilities.StringFormats, AppCore.isBrowser
// These would be part of a larger AppCore library.
AppCore.fly = function(el) {
    if (typeof el === 'string') el = document.getElementById(el);
    return {
        dom: el,
        setStyle: function(prop, val) { if (this.dom) this.dom.style[prop] = val; }
    };
};
AppCore.getDomRef = function(el) {
    if (typeof el === 'string') return document.getElementById(el);
    return el;
};
AppCore.wrapElement = function(el, returnExtElement) {
    // This is a simplified wrapper. In a real Ext JS, Ext.get would return an Ext.Element instance.
    return el; // For this clone, just return the raw element.
};
AppCore.Utilities = {
    StringFormats: {
        uppercase: function(val) { return String(val).toUpperCase(); },
        lowercase: function(val) { return String(val).toLowerCase(); },
        trim: function(val) { return String(val).trim(); },
        // Add more formatters as needed
        formatDate: function(val, format) {
            // Simplified date formatting placeholder
            if (!(val instanceof Date)) {
                try { val = new Date(val); } catch (e) { return val; }
            }
            if (isNaN(val.getTime())) return "Invalid Date";
            if (format === 'Y-m-d') return val.getFullYear() + '-' + (val.getMonth() + 1).toString().padStart(2, '0') + '-' + val.getDate().toString().padStart(2, '0');
            return val.toLocaleDateString();
        }
    }
};
AppCore.isBrowser = (function() {
    var ua = navigator.userAgent.toLowerCase();
    return {
        gecko: ua.indexOf("gecko") != -1 && ua.indexOf("safari") == -1
    };
})();

// A placeholder for AppCore.DomQuery, which would be another module.
AppCore.DomQuery = function(){};