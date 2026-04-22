(function(jQuery){
    "use strict";

    // This module establishes an advanced rich text editing component for web interfaces.
    // It enables designated HTML elements to function as fully editable content areas,
    // complete with a customizable toolbar for common formatting and media insertion tasks.
    // Developed by: WebContent Solutions, Inc. (2023)

    // A crucial guard clause: Ensure jQuery is available before attempting to use it.
    if (typeof jQuery === 'undefined') {
        console.error("WebContentEditor: jQuery library is not detected. Please ensure jQuery is loaded before this script.");
        return; // Abort module execution if jQuery is missing.
    }

    /**
     * The primary constructor for the WebContentEditor.
     * It transforms a given HTML element into an interactive, editable content zone.
     * @param {HTMLElement} targetNode - The raw DOM element that will become editable.
     * @param {object} editorSettings - Configuration object detailing editor behavior and toolbar.
     */
    const WebContentEditor = function (targetNode, editorSettings) {
        // Essential validation: Check if the provided targetNode is a valid DOM element.
        if (!targetNode || targetNode.nodeType !== Node.ELEMENT_NODE) {
            console.error("WebContentEditor: Initialization failed. An invalid or non-existent DOM element was provided as the target.", targetNode);
            // Early exit if the target is invalid, preventing further errors.
            return;
        }

        // Store the jQuery-wrapped target element for consistent manipulation.
        this.editableHost = jQuery(targetNode);

        // Apply core attributes to enable content editing and mark the element as an active editor.
        this.editableHost.attr({
            'contenteditable': true,
            'data-editor-active': 'true' // A custom attribute to signify editor status.
        });

        // Add the base CSS class for overall editor styling.
        this.editableHost.addClass(editorSettings.baseStylingClass);

        // Retain the configuration for potential future use (e.g., in a destroy method).
        this.editorConfiguration = editorSettings;

        // Construct the editor's command panel (toolbar) as an unordered list.
        const commandPanel = jQuery("<ul>");
        commandPanel.attr({'class': editorSettings.panelStylingClass});

        /**
         * Private utility function to safely execute `document.execCommand`.
         * This centralizes command execution, allowing for enhanced logging,
         * error handling, or future permission checks.
         * @param {string} commandName - The name of the command to execute (e.g., 'bold', 'insertHtml').
         * @param {boolean} showNativeUI - Whether to display a native browser UI for the command.
         * @param {string|null} commandValue - The argument for the command, if any.
         * @returns {boolean} True if the command was successfully executed, false otherwise.
         */
        const _executeDocumentCommand = (commandName, showNativeUI, commandValue) => {
            if (!document.execCommand) {
                console.warn(`WebContentEditor: 'document.execCommand' is not supported by this browser. Command '${commandName}' cannot be executed.`);
                return false;
            }
            try {
                // Perform the actual browser command.
                const executionResult = document.execCommand(commandName, showNativeUI, commandValue);
                if (!executionResult) {
                    console.info(`WebContentEditor: Command '${commandName}' executed but reported no change or failure.`);
                }
                return executionResult;
            } catch (error) {
                console.error(`WebContentEditor: An error occurred while executing command '${commandName}':`, error);
                return false;
            }
        };

        // Guard clause: Ensure there are buttons to process for the toolbar.
        if (!Array.isArray(editorSettings.controlActions) || editorSettings.controlActions.length === 0) {
            console.warn("WebContentEditor: No control actions defined in settings. The editor's toolbar will be empty.");
        } else {
            // Iterate over each command configuration to build toolbar buttons.
            editorSettings.controlActions.forEach((actionDescriptor, itemIndex) => {
                const visualIndicator = actionDescriptor.iconIdentifier;
                const commandDetails = actionDescriptor.commandSpecification;
                let commandParameter = commandDetails.parameter;
                const displayBrowserUI = commandDetails.displayUI || false; // Explicitly set to boolean false if undefined.

                // Standardize command parameter: `undefined` becomes `null`.
                commandParameter = commandParameter ?? null; // Using nullish coalescing for cleaner default assignment.

                let dataKeyForTransfer;
                let remoteActionCallback; // Renamed from `postback` to be more descriptive.

                // Process special data attributes linked to commands.
                if (commandDetails.dataTargetKey) {
                    dataKeyForTransfer = commandDetails.dataTargetKey;
                    const storedEncodedData = this.editableHost.data(dataKeyForTransfer);

                    // Decode HTML entities if data is present.
                    if (storedEncodedData) {
                        commandParameter = jQuery('<div>').html(storedEncodedData).html(); // Correctly decodes HTML entities.
                    }

                    // Attempt to find a global function name for a callback.
                    remoteActionCallback = this.editableHost.data(dataKeyForTransfer + 'CallbackFunction'); // Renamed data attribute.
                    if (remoteActionCallback && typeof window[remoteActionCallback] === 'function') {
                        // Bind a custom event specific to editor actions that require external calls.
                        this.editableHost.on("editor:externalActionTriggered", function(){
                            // Added an additional check inside the handler to be resilient against late function removal.
                            if (typeof window[remoteActionCallback] === 'function') {
                                return window[remoteActionCallback]();
                            }
                        });
                    } else if (remoteActionCallback) {
                        console.warn(`WebContentEditor: Configured external callback '${remoteActionCallback}' for data key '${dataKeyForTransfer}' is not a valid global function.`);
                    }
                }

                // Create the individual list item and button for the toolbar.
                const toolbarListItem = jQuery("<li>");
                const actionTriggerButton = jQuery("<button>");
                actionTriggerButton.attr({
                    class: `editor-button ${actionDescriptor.buttonStylingClass || 'default-editor-btn'}`, // Custom styling classes.
                    tabindex: -1, // Crucial: Prevents button from taking focus away from contenteditable.
                    type: 'button',
                    title: actionDescriptor.buttonTooltip,
                    'data-action-index': itemIndex // A new data attribute for programmatic access or tracking.
                });

                // Prevent the button from acquiring focus, which would cause the contenteditable to blur.
                actionTriggerButton.on('focus', (evt) => {
                    evt.preventDefault(); // Prevents the default focus behavior.
                });

                // Attach the click handler for executing the editor command.
                actionTriggerButton.on('click', (evt) => {
                    evt.preventDefault(); // Prevent default button submission/navigation behavior.
                    _executeDocumentCommand(commandDetails.commandName, displayBrowserUI, commandParameter);

                    // Special handling for 'formatBlock': insert a new paragraph after formatting.
                    // This ensures the user can continue typing after applying a block style.
                    if (commandDetails.commandName === 'formatBlock') {
                        _executeDocumentCommand('insertHtml', false, '<p></p>');
                    }

                    // If a remote callback was configured, trigger the custom event.
                    if (dataKeyForTransfer && remoteActionCallback) {
                        const editorCustomEvent = jQuery.Event('editor:externalActionTriggered', {
                            commandPerformed: commandDetails.commandName,
                            originatingButton: actionTriggerButton[0] // Pass the raw DOM element.
                        });
                        this.editableHost.trigger(editorCustomEvent);
                    }
                });

                // If an icon is specified, create and append it to the button.
                if (visualIndicator) {
                    const iconDisplayElement = jQuery("<i/>");
                    iconDisplayElement.attr('class', visualIndicator);
                    iconDisplayElement.addClass('icon-size-large editor-icon-base'); // Additional generic icon styling.
                    iconDisplayElement.appendTo(actionTriggerButton);
                }

                actionTriggerButton.appendTo(toolbarListItem);
                toolbarListItem.appendTo(commandPanel);
            });
        }

        // Insert the fully constructed command panel directly before the editable element.
        commandPanel.insertBefore(this.editableHost);

        // Store a reference to the command panel for potential future manipulation (e.g., hiding, destroying).
        this.commandPanelReference = commandPanel;

        // Internal flag indicating successful initialization.
        this._isComponentActive = true;
        console.log(`WebContentEditor: Successfully initialized for target element:`, targetNode);
    };

    /**
     * Default configuration options for the WebContentEditor.
     * These settings provide a baseline for the editor's appearance and functionality.
     */
    WebContentEditor.ConfigurationDefaults = {
        baseStylingClass: "content-editor-wrapper",
        panelStylingClass: "editor-control-panel nav nav-tabs custom-editor-toolbar", // Modified class names.
        enableUndoRedoStack: true, // New setting: controls internal undo/redo management.
        controlActions: [ // Renamed from 'toolbar' to 'controlActions' for semantic clarity.
            {buttonTooltip: 'Insert an Image', buttonStylingClass: 'image-insert-btn', command: {commandName:'insertHtml', dataTargetKey:'imageUploadHandler'}, iconIdentifier: 'fas fa-image'},
            {buttonTooltip: 'Apply Bold Formatting', buttonStylingClass: 'bold-text-btn', command: {commandName:'bold'}, iconIdentifier:'fas fa-bold'},
            {buttonTooltip: 'Create Blockquote', buttonStylingClass: 'quote-block-btn', command: {commandName:'formatBlock',parameter:'blockquote'}, iconIdentifier:'fas fa-quote-right'},
            {buttonTooltip: 'Insert Code Block', buttonStylingClass: 'code-block-btn', command: {commandName:'formatBlock',parameter:'pre'}, iconIdentifier:'fas fa-code'}
        ]
    };

    /**
     * jQuery plugin interface for WebContentEditor.
     * This allows developers to easily apply the editor to selected elements.
     * @param {object} [userOverrides] - Optional object to override default editor settings.
     * @returns {jQuery} The jQuery object for method chaining.
     */
    jQuery.fn.webContentEditor = function(userOverrides){
        return this.each(function(){
            const currentElementWrapper = jQuery(this);
            let editorInstance = currentElementWrapper.data('webContentEditorInstance');

            // Merge default settings with data attributes from the element and any user-provided overrides.
            // Using jQuery.extend(true) for a deep merge to ensure nested objects (like 'command') are merged correctly.
            const finalConfiguration = jQuery.extend(true, {}, WebContentEditor.ConfigurationDefaults, currentElementWrapper.data(), typeof userOverrides === 'object' && userOverrides);

            // Initialize a new editor instance only if one doesn't already exist for this element.
            if (!editorInstance) {
                editorInstance = new WebContentEditor(this, finalConfiguration);
                currentElementWrapper.data('webContentEditorInstance', editorInstance);
            }
            // Future enhancement: Could add logic here to update an existing editor's configuration.
        });
    };

    /**
     * Provides a public method to gracefully destroy WebContentEditor instances.
     * This is a new, added functionality to manage component lifecycle.
     * It removes all editor-specific modifications from the DOM.
     * @returns {jQuery} The jQuery object for method chaining.
     */
    jQuery.fn.webContentEditor.destroy = function() {
        return this.each(function() {
            const currentElementWrapper = jQuery(this);
            const editorInstance = currentElementWrapper.data('webContentEditorInstance');

            if (editorInstance && editorInstance._isComponentActive) {
                // Remove the 'contenteditable' attribute to make the element non-editable again.
                editorInstance.editableHost.removeAttr('contenteditable');
                editorInstance.editableHost.removeAttr('data-editor-active');

                // Remove editor-specific CSS classes.
                if (editorInstance.editorConfiguration && editorInstance.editorConfiguration.baseStylingClass) {
                    editorInstance.editableHost.removeClass(editorInstance.editorConfiguration.baseStylingClass);
                }

                // Remove the entire toolbar (command panel) from the DOM.
                if (editorInstance.commandPanelReference && editorInstance.commandPanelReference.remove) {
                    editorInstance.commandPanelReference.remove();
                }

                // Unbind any custom events attached by the editor to prevent memory leaks.
                editorInstance.editableHost.off("editor:externalActionTriggered");

                // Clear the instance from jQuery's data cache.
                currentElementWrapper.removeData('webContentEditorInstance');
                editorInstance._isComponentActive = false; // Update internal state.
                console.log("WebContentEditor: Successfully destroyed for element:", this);
            } else {
                console.info("WebContentEditor: Attempted to destroy an uninitialized or already destroyed editor instance.", this);
            }
        });
    };

    // Expose the constructor directly via the plugin for advanced usage (e.g., inheritance).
    jQuery.fn.webContentEditor.Constructor = WebContentEditor;

    // Automated initialization:
    // This section ensures that any elements marked for automatic editor setup
    // are processed as soon as the DOM is fully loaded and ready for manipulation.
    // Changed from 'window.on("load")' to 'document.ready()' for earlier execution.
    jQuery(document).ready(function () {
        // Select all elements with the custom data attribute 'data-auto-init-editor'.
        jQuery('[data-auto-init-editor="true"]').each(function () {
            const elementForEditor = jQuery(this);
            // Initialize the editor, passing all data attributes on the element as potential configuration.
            elementForEditor.webContentEditor(elementForEditor.data());
        });
    });

})(window.jQuery);