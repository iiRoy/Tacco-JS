/**
 * Enhanced Content Duplicator Module
 * A jQuery-based utility for augmenting copied text with source information.
 * This script is designed to attach metadata to user-selected content upon copying,
 * providing attribution or additional context.
 *
 * Licensed under the MIT License.
 * For details, please refer to the project's license file.
 */

;((jq, globalScope, docObj) => { // Renamed parameters for the IIFE

    // --- Configuration Constants & Default Settings ---
    const componentTag = "contentEnhancer"; // Renamed pluginName
    const hiddenElementStyling = "width: 1px; height: 1px; overflow: hidden; position: absolute; top: -99999px; left: -99999px; opacity: 0.005;"; // New constant, slightly modified opacity
    
    const defaultSettings = { // Renamed defaults
        attributionSuffix: `\n\nSource: ${globalScope.location.href}`, // Renamed text, used template literal
        minimumLengthForEnhancement: 5, // Renamed minlength, changed value
        textTransformationHook: undefined // Renamed processing
    };

    // Ensure jQuery is available before proceeding
    if (!jq || typeof jq !== 'function' || !jq.fn) {
        console.error(`${componentTag}: jQuery dependency not met. Aborting initialization.`);
        return;
    }

    /**
     * @class ContentEnhancer
     * @param {HTMLElement} targetElement - The DOM element to attach the copy listener to.
     * @param {Object|string} configurationOptions - User-defined settings or an action string.
     */
    function ContentEnhancer(targetElement, configurationOptions) { // Renamed Copyright
        if (!targetElement || !(targetElement instanceof HTMLElement)) {
            console.warn(`${componentTag}: Invalid target element provided. Module might not function correctly.`);
            return;
        }

        this.operatingNode = targetElement; // Renamed element
        this.baseConfiguration = defaultSettings; // Renamed _defaults
        this.moduleIdentifier = componentTag; // Renamed _name
        
        // Merge user options with defaults. Using Object.assign for clarity, but $.extend is also fine.
        this.currentSettings = jq.extend({}, this.baseConfiguration, configurationOptions); // Renamed options

        // Determine the initial action based on provided options
        this.initialAction = (typeof configurationOptions === "string") 
                             ? configurationOptions.toLowerCase() 
                             : "activate"; // Renamed action, changed "default" to "activate"

        this.initializeModule(); // Renamed init
    }

    // --- Prototype Methods for ContentEnhancer ---

    /**
     * Retrieves the currently selected text from the document.
     * @returns {string} The selected text.
     */
    ContentEnhancer.prototype.retrieveSelectedContent = function() { // Renamed getSelectedText
        let currentSelection = ""; // Renamed text
        const windowSelection = globalScope.getSelection();

        if (windowSelection) {
            currentSelection = windowSelection.toString();
        } else if (docObj.selection && docObj.selection.createRange) { // IE-specific
            currentSelection = docObj.selection.createRange().text;
        }
        // Add a trim here as a Type III change
        return currentSelection.trim();
    };

    /**
     * Sets the selection to encompass the contents of a given temporary DOM element.
     * This is crucial for programmatically copying content.
     * @param {HTMLElement} tempElement - The temporary element whose content should be selected.
     */
    ContentEnhancer.prototype.establishTemporarySelection = function(tempElement) { // Renamed setSelectionRange
        if (!tempElement || !(tempElement instanceof HTMLElement)) {
            console.warn(`${this.moduleIdentifier}: Attempted to set selection on an invalid element.`);
            return;
        }

        if (globalScope.getSelection) {
            const rangeObject = docObj.createRange(); // Renamed range
            rangeObject.selectNodeContents(tempElement);
            const activeSelection = globalScope.getSelection(); // Renamed sel
            
            activeSelection.removeAllRanges(); // Clear existing selections
            activeSelection.addRange(rangeObject); // Apply new range
        } else if (docObj.selection && docObj.body.createTextRange) { // IE-specific
            const textRange = docObj.body.createTextRange();
            textRange.moveToElementText(tempElement);
            textRange.select();
        }
    };

    /**
     * Clears any active text selection in the document.
     */
    ContentEnhancer.prototype.clearActiveSelection = function() { // Renamed removeSelectionRange
        const windowSelection = globalScope.getSelection();
        if (windowSelection) {
            windowSelection.removeAllRanges();
        } else if (docObj.selection) { // IE-specific
            docObj.selection.empty();
        }
    };

    /**
     * Saves the current user selection range for later restoration.
     * @returns {Range|TextRange|null} The saved selection range object.
     */
    ContentEnhancer.prototype.storeCurrentSelection = function() { // Renamed saveSelectionRange
        const currentSelection = globalScope.getSelection(); // Renamed sel
        
        if (currentSelection && currentSelection.getRangeAt && currentSelection.rangeCount > 0) {
            return currentSelection.getRangeAt(0);
        } else if (docObj.selection) { // IE-specific
            return docObj.selection.createRange();
        }
        return null; // No selection found
    };

    /**
     * Restores a previously saved selection range.
     * @param {Range|TextRange|null} storedRange - The range object to restore.
     */
    ContentEnhancer.prototype.reapplyPreviousSelection = function(storedRange) { // Renamed restoreSelectionRange
        if (storedRange) {
            if (globalScope.getSelection) {
                const activeSelection = globalScope.getSelection(); // Renamed sel
                activeSelection.removeAllRanges();
                activeSelection.addRange(storedRange);
            } else if (docObj.selection) { // IE-specific
                storedRange.select();
            }
        } else {
            // If no range was provided, just clear any active selection.
            this.clearActiveSelection(); // Renamed it.removeSelectionRange
            console.info(`${this.moduleIdentifier}: No previous selection range to restore. Clearing current selection.`);
        }
    };

    /**
     * Main method to handle the copy event: retrieves selected text,
     * enhances it, temporarily inserts it into a hidden div for copying,
     * and then cleans up.
     */
    ContentEnhancer.prototype.processCopyOperation = function() { // Renamed copy
        const self = this; // Renamed it
        const docBody = jq('body'); // Renamed body
        
        let userSelectedContent = self.retrieveSelectedContent(); // Renamed selectText
        const originalSelectionState = self.storeCurrentSelection(); // Renamed range

        // Guard clause: If no text or text is too short, do nothing.
        if (!userSelectedContent || userSelectedContent.length < self.currentSettings.minimumLengthForEnhancement) {
            jq(self.operatingNode).trigger(`${self.moduleIdentifier}_CopySkipped`, [userSelectedContent, "Length too short or no text selected."]);
            return;
        }

        jq(self.operatingNode).trigger(`${self.moduleIdentifier}_CopyInitiated`); // Renamed pluginName + "_BeforeCopy"

        // Apply custom processing if a callback is provided
        if (typeof self.currentSettings.textTransformationHook === "function") {
            try {
                userSelectedContent = self.currentSettings.textTransformationHook(userSelectedContent);
            } catch (error) {
                console.error(`${self.moduleIdentifier}: Error during text transformation hook:`, error);
                // Optionally, fall back to original text or skip enhancement
            }
        }

        // Append the configured attribution suffix
        const finalContentToCopy = userSelectedContent + self.currentSettings.attributionSuffix;

        // Create a temporary, hidden div to hold the content for copying
        const hiddenCopyContainer = jq('<div/>', { // Renamed div
            html: finalContentToCopy,
            style: hiddenElementStyling // Using the new constant
        }).appendTo(docBody);

        // Programmatically select the content of the hidden div
        self.establishTemporarySelection(hiddenCopyContainer[0]); // Changed call context to direct method call

        // Schedule cleanup after the browser's native copy operation
        globalScope.setTimeout(() => {
            self.reapplyPreviousSelection(originalSelectionState); // Changed call context to direct method call
            hiddenCopyContainer.remove(); // Remove the temporary element
            jq(self.operatingNode).trigger(`${self.moduleIdentifier}_CopyCompleted`, [finalContentToCopy]); // Renamed pluginName + "_AfterCopy"
        }, 0); // Execute immediately after current script block finishes
    };

    /**
     * Deactivates the copy enhancement by unbinding the event listener.
     */
    ContentEnhancer.prototype.deactivateEnhancement = function() { // Renamed remove
        const self = this; // Renamed it
        jq(self.operatingNode).off("copy.enhanced"); // Added namespace for event
        console.log(`${self.moduleIdentifier}: Copy enhancement deactivated for`, self.operatingNode);
    };

    /**
     * Activates the copy enhancement by binding the event listener.
     */
    ContentEnhancer.prototype.activateEnhancement = function() { // Renamed start
        const self = this; // Renamed it
        jq(self.operatingNode).on("copy.enhanced", () => { // Added namespace for event
            self.processCopyOperation(); // Renamed it.copy
        });
        console.log(`${self.moduleIdentifier}: Copy enhancement activated for`, self.operatingNode);
    };

    /**
     * Initializes the module based on the configured action.
     */
    ContentEnhancer.prototype.initializeModule = function() { // Renamed init
        switch (this.initialAction) {
            case "remove":
            case "deactivate": // Added "deactivate" as an alias
                return this.deactivateEnhancement(); // Renamed remove
            case "start":
            case "activate": // Added "activate" as an alias
                return this.activateEnhancement(); // Renamed start
            default:
                console.warn(`${this.moduleIdentifier}: Unknown initial action "${this.initialAction}". Defaulting to activation.`);
                return this.activateEnhancement(); // Default to activation
        }
    };

    // --- jQuery Plugin Integration ---
    jq.fn[componentTag] = function (configurationOptions) { // Renamed pluginName
        // Add a check for empty selection
        if (!this.length) {
            console.warn(`${componentTag}: No elements selected for plugin initialization.`);
            return this;
        }

        return this.each(function () {
            // Store instance data, ensuring only one instance per element
            const instanceKey = `plugin_${componentTag}`; // Renamed 'plugin_' + pluginName
            if (!jq.data(this, instanceKey)) {
                jq.data(this, instanceKey, new ContentEnhancer(this, configurationOptions)); // Renamed Copyright
            } else {
                // Handle re-initialization or method calls if needed.
                // For a Type III clone, let's add a simple re-initialization logic.
                const existingInstance = jq.data(this, instanceKey);
                if (typeof configurationOptions === 'string') {
                    // If a string is passed, treat it as a method call
                    const methodName = configurationOptions.toLowerCase();
                    if (methodName === 'deactivate') {
                        existingInstance.deactivateEnhancement();
                    } else if (methodName === 'activate') {
                        existingInstance.activateEnhancement();
                    } else {
                        console.warn(`${componentTag}: Unknown method call "${methodName}" on existing instance.`);
                    }
                } else {
                    // Re-initialize with new options
                    console.log(`${componentTag}: Re-initializing instance with new options.`);
                    jq.data(this, instanceKey, new ContentEnhancer(this, configurationOptions));
                }
            }
        });
    };

})(jQuery, window, document); // Renamed parameters in the call