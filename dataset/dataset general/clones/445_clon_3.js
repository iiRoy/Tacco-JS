// A module designed for dynamic management of CSS stylesheets within web applications.
// This utility is provided under the MIT License, fostering open and flexible use.

/**
 * Global registry and utility for handling dynamic stylesheets in the DOM.
 * @namespace styleSheetRegistry
 */
var styleSheetRegistry = {};

/**
 * Configuration flag to bypass the stylesheet limit check.
 * Historically, Internet Explorer browsers have a limitation (KB262161)
 * where having 31 or more stylesheets can lead to runtime errors.
 * Setting this flag to `true` will suppress the error thrown by this utility
 * if the stylesheet count exceeds this threshold.
 *
 * Please note: For older IE versions (e.g., IE8, IE9), even with this flag set,
 * creating new stylesheets beyond the 31-sheet limit will physically fail in the browser,
 * irrespective of this utility's internal checks.
 *
 * @memberof styleSheetRegistry
 * @type {boolean}
 */
styleSheetRegistry.disableSafetyThreshold = false;

/**
 * Dynamically creates an empty `<style>` element and inserts it into the document's `<head>`.
 * The insertion point can be precisely controlled using a `referenceNode`.
 *
 * @param {HTMLElement|null} referenceNode - An optional DOM element. If provided, the new style element will be inserted immediately before it. If null, the new element is appended to the end of the `<head>`.
 * @param {function(Error|null, HTMLStyleElement|null)} completionHandler - A callback function that receives an error (if any) and the newly created `HTMLStyleElement`.
 * @private
 */
const placeNewStyleElement = (referenceNode, completionHandler) => {
    const newStyleElement = document.createElement('style');
    newStyleElement.type = 'text/css'; // Explicitly setting the MIME type for clarity and compatibility.

    const documentHead = document.head || document.getElementsByTagName('head')[0];

    if (!documentHead) {
        // Critical error: The document's <head> element is indispensable for stylesheet insertion.
        return completionHandler(new Error("Document <head> element is not available. Cannot proceed with stylesheet insertion."));
    }

    try {
        if (referenceNode instanceof HTMLElement && documentHead.contains(referenceNode)) {
            // Attempt to insert the new style element before the specified reference node.
            documentHead.insertBefore(newStyleElement, referenceNode);
        } else {
            // If no valid reference node is provided, append the style element to the head.
            documentHead.appendChild(newStyleElement);
        }
    } catch (domInsertionError) {
        // Catches potential DOM exceptions during the insertion process.
        console.error("An error occurred during the insertion of a new style element:", domInsertionError);
        return completionHandler(domInsertionError);
    }

    // Special check for Internet Explorer's stylesheet limit behavior.
    if (newStyleElement.styleSheet && newStyleElement.styleSheet.disabled) {
        // If the stylesheet is immediately disabled (typically due to IE's 31-sheet limit),
        // we remove it and report the issue.
        documentHead.removeChild(newStyleElement);
        const limitExceededMsg = 'Stylesheet creation failed: Maximum allowable stylesheets exceeded (KB262161 workaround).';
        console.warn(limitExceededMsg);
        return completionHandler(new Error(limitExceededMsg));
    }

    // Success: The empty style element has been successfully placed.
    completionHandler(null, newStyleElement);
};

/**
 * Assigns the provided CSS text content to a given `<style>` element.
 * This function intelligently selects the most appropriate method based on browser capabilities.
 *
 * @param {HTMLStyleElement} targetElement - The `<style>` element that will receive the CSS content.
 * @param {string} cssTextContent - The raw CSS string to be applied.
 * @param {function(Error|null)} doneCallback - A callback function invoked upon completion, receiving an error object if the operation fails.
 * @private
 */
const updateStyleNodeContent = (targetElement, cssTextContent, doneCallback) => {
    // Ensure the CSS content is treated as a string, handling null/undefined inputs gracefully.
    const normalizedCss = String(cssTextContent || '');

    try {
        // Prioritize `styleSheet.cssText` for older Internet Explorer versions, known for better performance.
        if (targetElement.styleSheet) {
            targetElement.styleSheet.cssText = normalizedCss;
        } else if ('textContent' in targetElement) {
            // Use `textContent` for modern browsers, which is generally efficient.
            targetElement.textContent = normalizedCss;
        } else {
            // Fallback for very old browsers that might require appending a text node.
            const textNode = document.createTextNode(normalizedCss);
            targetElement.appendChild(textNode);
        }
        // Debugging log for successful content application.
        console.debug('CSS content successfully applied to the target style element.');
        doneCallback(null);
    } catch (contentApplicationError) {
        // Captures any exceptions that might occur during the CSS content assignment.
        console.error('An error occurred while applying CSS content to the style element:', contentApplicationError);
        doneCallback(contentApplicationError);
    }
};

/**
 * Safely removes a specified `<style>` element from the DOM.
 * Includes preliminary checks to ensure the element is valid and has a parent.
 *
 * @param {HTMLElement} elementToDiscard - The `HTMLElement` (expected to be a `<style>` tag) to be removed.
 * @private
 */
const discardStyleElement = (elementToDiscard) => {
    // Validate the element: it must exist, be a STYLE tag, and have a parent to be removable.
    const isValidElement = elementToDiscard && elementToDiscard.tagName === 'STYLE';
    const hasParent = isValidElement && elementToDiscard.parentNode;

    if (isValidElement && hasParent) {
        elementToDiscard.parentNode.removeChild(elementToDiscard);
        console.debug('Style element successfully removed from the DOM.');
    } else if (elementToDiscard) {
        // Log a warning if the element exists but doesn't meet removal criteria.
        console.warn('Attempted to remove an invalid or orphaned element:', elementToDiscard);
    }
};

/**
 * The central function for orchestrating stylesheet creation, insertion, and replacement.
 * It handles the lifecycle from an empty style tag to a fully functional stylesheet in the DOM.
 *
 * @param {object} creationConfig - An object specifying the configuration for the new stylesheet.
 * @param {string} creationConfig.css - The CSS text to be included in the new stylesheet.
 * @param {HTMLElement} [creationConfig.replace] - An optional existing `<style>` element to be replaced. If provided, the new stylesheet will take its place, and the old one will be removed.
 * @param {HTMLElement} [creationConfig.insertBefore] - An optional DOM node before which the new stylesheet should be inserted. This option is ignored if `replace` is specified.
 * @param {function(Error|null, HTMLStyleElement|null)} finalCallback - The callback function to be executed upon completion, providing any error or the newly created `HTMLStyleElement`.
 * @private
 */
const processStyleSheetCreation = (creationConfig, finalCallback) => {
    // Input validation for the configuration object.
    if (!creationConfig || typeof creationConfig !== 'object') {
        return finalCallback(new TypeError('Stylesheet creation configuration is either missing or not a valid object.'));
    }

    const currentActiveStylesheets = document.styleSheets.length;
    const stylesheetLimit = 31; // The well-known threshold from KB262161.

    // Apply the stylesheet limit check unless explicitly disabled.
    if (!styleSheetRegistry.disableSafetyThreshold && currentActiveStylesheets >= stylesheetLimit) {
        const limitExceededErrorMsg = `Operation halted: The current number of active stylesheets (${currentActiveStylesheets}) has reached or exceeded the maximum recommended limit (${stylesheetLimit}). ` +
                                      'This is often associated with KB262161 issues. To override this check, set `styleSheetRegistry.disableSafetyThreshold = true`.';
        console.error(limitExceededErrorMsg);
        return finalCallback(new Error(limitExceededErrorMsg));
    }

    // Determine the precise DOM node before which the new stylesheet should be inserted.
    let designatedInsertionPoint = null;
    if (creationConfig.replace instanceof HTMLElement) {
        // If replacing an existing element, the new style should be inserted before its next sibling
        // to effectively take its place in the DOM flow.
        designatedInsertionPoint = creationConfig.replace.nextSibling;
    } else if (creationConfig.insertBefore instanceof HTMLElement) {
        // If a specific insertion point is provided.
        designatedInsertionPoint = creationConfig.insertBefore;
    }

    // Step 1: Create and insert an empty style element into the DOM structure.
    placeNewStyleElement(designatedInsertionPoint, (insertionError, createdStyleNode) => {
        if (insertionError) {
            // Forward any errors encountered during the DOM insertion phase.
            return finalCallback(insertionError);
        }

        // Step 2: Populate the newly created style element with the provided CSS content.
        updateStyleNodeContent(createdStyleNode, creationConfig.css, (contentApplicationError) => {
            if (contentApplicationError) {
                // If CSS content application fails, clean up by removing the partially created style element.
                discardStyleElement(createdStyleNode);
                return finalCallback(contentApplicationError);
            }

            // Step 3: If an existing style element was specified for replacement, remove it now.
            if (creationConfig.replace instanceof HTMLElement) {
                discardStyleElement(creationConfig.replace);
                console.info('An existing style element was successfully swapped out with the new one.');
            }

            // All operations completed successfully.
            console.log('New stylesheet successfully generated, content applied, and integrated into the DOM.');
            finalCallback(null, createdStyleNode);
        });
    });
};

/**
 * Public API methods exposed by the `styleSheetRegistry` for external use.
 * @memberof styleSheetRegistry
 */
Object.assign(styleSheetRegistry, {
    /**
     * Appends a new stylesheet containing the specified CSS content to the document's `<head>`.
     *
     * @param {string} cssContent - The CSS string to be used for the new stylesheet.
     * @param {function(Error|null, HTMLStyleElement|null)} [completionCallback=()=>{}] - An optional callback function.
     * @returns {void}
     */
    appendNewStyleBlock: (cssContent, completionCallback = () => {}) => {
        processStyleSheetCreation({ css: cssContent }, completionCallback);
    },

    /**
     * Inserts a new stylesheet with the given CSS content directly before a specified DOM node.
     *
     * @param {HTMLElement} targetNode - The DOM element that the new stylesheet will precede.
     * @param {string} cssContent - The CSS string for the new stylesheet.
     * @param {function(Error|null, HTMLStyleElement|null)} [completionCallback=()=>{}] - An optional callback function.
     * @returns {void}
     */
    insertStyleBlockAtPosition: (targetNode, cssContent, completionCallback = () => {}) => {
        if (!(targetNode instanceof HTMLElement)) {
            return completionCallback(new TypeError('The target node for insertion must be a valid HTMLElement.'));
        }
        processStyleSheetCreation({ insertBefore: targetNode, css: cssContent }, completionCallback);
    },

    /**
     * Replaces an existing `<style>` element in the DOM with a new one containing the provided CSS content.
     *
     * @param {HTMLStyleElement} oldStyleElement - The existing `<style>` element that is to be replaced.
     * @param {string} cssContent - The CSS string for the replacement stylesheet.
     * @param {function(Error|null, HTMLStyleElement|null)} [completionCallback=()=>{}] - An optional callback function.
     * @returns {void}
     */
    swapStyleBlock: (oldStyleElement, cssContent, completionCallback = () => {}) => {
        if (!(oldStyleElement instanceof HTMLStyleElement)) {
            return completionCallback(new TypeError('The element designated for replacement must be an HTMLStyleElement.'));
        }
        processStyleSheetCreation({ replace: oldStyleElement, css: cssContent }, completionCallback);
    },

    /**
     * Removes a specific `<style>` element from the document's DOM structure.
     *
     * @param {HTMLStyleElement} styleElement - The `HTMLStyleElement` to be removed.
     * @returns {void}
     */
    discardStyleElement: (styleElement) => {
        // Type check to ensure we are attempting to remove a valid style element.
        if (!(styleElement instanceof HTMLStyleElement)) {
            console.warn('Attempted to discard an element that is not an HTMLStyleElement:', styleElement);
            return;
        }
        discardStyleElement(styleElement);
    }
});

// For environments where `window` is defined (e.g., browsers),
// expose the styleSheetRegistry globally for easy access, mirroring the original's behavior.
if (typeof window !== 'undefined') {
    window.styleSheetRegistry = styleSheetRegistry;
}