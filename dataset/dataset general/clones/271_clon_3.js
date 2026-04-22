const DomElementExtensions = {

    /**
     * Retrieves the currently highlighted text within an input element.
     * @returns {string} The text currently selected by the user.
     */
    obtainCurrentSelection: function() {
        // Comment: Checking for legacy browser selection model, typically Internet Explorer.
        // This pathway handles older browser APIs for text range manipulation.
        // We ensure the document has an active selection and can create a range.
        if (window.document.selection && window.document.selection.createRange) {
            return window.document.selection.createRange().text;
        }

        // For modern browsers, we access selection properties directly from the element.
        // A temporary variable for the element's full content for clarity.
        const fullContent = this.get('value');
        // Retrieve the start and end indices of the selection.
        const selectionStartPoint = this.selectionStart;
        const selectionEndPoint = this.selectionEnd;

        // Perform a slice operation to extract the selected substring.
        // Using slice is functionally equivalent to substring in this context but can be more flexible.
        return fullContent.slice(selectionStartPoint, selectionEndPoint);
    },

    /**
     * Modifies the selected text within an input element, replacing it with new content.
     * Manages cursor position and scroll state after modification.
     * @param {string} replacementContent - The new text to insert.
     * @param {boolean} [isFinalModification=true] - Indicates if this is the last text modification in a sequence.
     */
    modifySelectionContent: function(replacementContent, isFinalModification) {
        // Ensure the final modification flag is a boolean, defaulting to true.
        const shouldSetFinalPosition = (isFinalModification === undefined || isFinalModification === null) ? true : Boolean(isFinalModification);

        // Cache current scroll position to restore it later, preventing UI jumps.
        let cachedScrollTop = this.scrollTop;

        // Branch for legacy Internet Explorer behavior.
        // This path uses the proprietary TextRange object for manipulation.
        if (window.document.selection && window.document.selection.createRange) {
            this.focus(); // Ensure the element is focused for selection manipulation.
            let activeRange = window.document.selection.createRange();
            activeRange.text = replacementContent; // Replace selected text.

            // If this is the final modification, re-select the new text and restore scroll.
            if (shouldSetFinalPosition) {
                activeRange.select(); // Re-selects the newly inserted text.
                this.scrollTop = cachedScrollTop; // Restore scroll position.
            }
        }
        // Path for modern browsers supporting standard selection APIs.
        else {
            const currentContent = this.get('value');
            const selectionStartPoint = this.selectionStart;
            const selectionEndPoint = this.selectionEnd;

            // Construct the new value by concatenating parts: before selection, new text, after selection.
            // Using template literals for better readability.
            this.value = `${currentContent.substring(0, selectionStartPoint)}${replacementContent}${currentContent.substring(selectionEndPoint)}`;

            // Determine the new cursor position after the replacement.
            const newCursorPosition = selectionStartPoint + replacementContent.length;

            // If this is not the final modification, select the *newly inserted text*.
            // This allows subsequent operations to act on the just-inserted content.
            if (!shouldSetFinalPosition) {
                this.setSelectionRange(selectionStartPoint, newCursorPosition);
            }
            // If it is the final modification, place the cursor at the *end* of the newly inserted text.
            // And restore the scroll position.
            else {
                this.setSelectionRange(newCursorPosition, newCursorPosition);
                this.scrollTop = cachedScrollTop;
            }
            this.focus(); // Ensure the element remains focused.
        }
    }
};

// Apply the new functions to the Element prototype, mimicking MooTools `implement`.
// This ensures they are available on all MooTools Element instances.
Element.implement(DomElementExtensions);

/*
    Class: EditorWidget

    Description:
        EditorWidget serves as a robust foundation for constructing custom WYSIWYM (What You See Is What You Mean)
        text editors. It primarily interfaces with a standard textarea element. Through its flexible API,
        developers can extend its capabilities by adding various text manipulation functions.

    Functionality Overview:
        Each function registered via the `addCommand` method will perform two key actions:
        1. Dynamically add an interactive button to the editor's toolbar.
        2. Execute a predefined text transformation operation on the associated textarea content.
        For example, a "bold" command would append a "bold" button to the toolbar and apply the necessary
        text formatting (e.g., wrapping selected text with `<b>` tags).

    Key Design Principle:
        EditorWidget is markup-agnostic. It does not impose any specific output format (HTML, Markdown, Textile, etc.).
        The text transformation logic is entirely user-defined, allowing for maximum flexibility in output generation.

    Chaining Transformations:
        Several text transformation methods (e.g., `wrapSelection`, `insertBefore`, `replaceSelection`,
        `processEachLine`) accept a `isFinalModification` parameter. This boolean flag is crucial for
        orchestrating multiple sequential transformations. Setting it to `false` signals that more operations
        are pending, thus preserving the selection or cursor position appropriately for the next step.
        If only a single transformation is applied, this parameter can be omitted, as it defaults to `true`.

    Current Build: 0.3.5-alpha
    License: MIT (http://opensource.org/licenses/mit-license.php)
*/

let EditorWidget = new Class({ // Using 'let' for the class variable.

    Implements: Options, // MooTools Options class for configuration management.

    // Default configuration settings for the editor.
    options: {
        shouldBroadcastUpdates: false, // Flag to enable/disable periodic change event dispatching.
        updateCheckInterval: 250,      // Interval (ms) for checking textarea content changes.
        handleTabKey: true             // Control whether the tab key inserts a tab character or navigates.
    },

    /*
        Constructor: EditorWidget (initializer)
            Initializes a new instance of the EditorWidget.

        Arguments:
            targetElementId - {string} The ID of the textarea element to manage.
            toolbarListId - {string|null} Optional. The ID of the UL element designated as the toolbar.
                                         If not provided, a new LI element is created and injected before the textarea.
            configSettings - {object} Optional. An object containing custom configuration settings.

        Configuration Options:
            shouldBroadcastUpdates - {boolean} If true, a custom 'change' event will be dispatched
                                             when the textarea content changes, even if not user-typed. Default: false.
            updateCheckInterval - {number} Delay in milliseconds for the periodic content change detection. Default: 250.
            handleTabKey - {boolean} If true, the tab key inserts a tab character. If false, default browser tab behavior occurs. Default: true.

        Behavior Notes:
            The `shouldBroadcastUpdates` option addresses a common limitation where native textarea 'change' events
            do not fire when content is programmatically inserted or pasted. When enabled, a background process
            monitors content changes while the textarea is focused, dispatching a custom 'change' event.
            The `updateCheckInterval` controls the frequency of this monitoring.
    */
    initialize: function(targetElementId, toolbarListId, configSettings) {

        // Validate the target element ID and retrieve the DOM element.
        if (!targetElementId) {
            console.error("EditorWidget: A target element ID must be provided.");
            return; // Exit initialization if no target.
        }
        this.targetElement = document.id(targetElementId); // Using document.id for MooTools compatibility.
        if (!this.targetElement) {
            console.error(`EditorWidget: Element with ID '${targetElementId}' not found.`);
            return;
        }

        // Apply provided configuration settings, merging with defaults.
        this.setOptions(configSettings);

        // Setup periodic content change monitoring if enabled.
        if (this.options.shouldBroadcastUpdates) {
            this.targetElement.addEvents({
                'focus': () => { // Using arrow function to preserve 'this' context.
                    this.contentMonitorTimer = this.monitorContentUpdates.periodical(this.options.updateCheckInterval, this);
                },
                'blur': () => {
                    this.contentMonitorTimer = $clear(this.contentMonitorTimer); // Clear the timer when focus is lost.
                }
            });
        }

        // Implement custom tab key behavior if enabled.
        if (this.options.handleTabKey) {
            this.targetElement.addEvent('keydown', (evt) => { // Using keydown for earlier event interception.
                let keyboardEvent = new Event(evt); // Wrap native event for MooTools Event object.
                if (keyboardEvent.key === "tab") { // Check for the tab key.
                    keyboardEvent.preventDefault(); // Prevent default tab behavior (focus change).
                    this.substituteSelection("\t", false); // Insert a tab character, but don't finalize selection yet.
                    // A small delay or additional logic might be needed here to ensure the cursor is correctly placed
                    // after the tab character if chaining operations were more complex.
                }
            });
        }

        // Initialize the toolbar container.
        if (!toolbarListId || toolbarListId === "") {
            // If no toolbar ID is given, create a default list item container.
            this.toolbarContainer = new Element('ul', {'class': 'editor-toolbar-default'}); // Create a UL instead of LI for a proper toolbar.
            this.toolbarContainer.inject(this.targetElement, 'before'); // Place it before the textarea.
        } else {
            // Otherwise, use the provided toolbar element.
            this.toolbarContainer = document.id(toolbarListId);
            if (!this.toolbarContainer) {
                console.warn(`EditorWidget: Toolbar element with ID '${toolbarListId}' not found. Creating a default one.`);
                this.toolbarContainer = new Element('ul', {'class': 'editor-toolbar-fallback'});
                this.toolbarContainer.inject(this.targetElement, 'before');
            }
        }
        // Store the initial content for change detection.
        this.previousContentState = this.targetElement.get('value');
    },

    /*
        Event: onContentChanged
            Dispatched when the textarea's content has been modified.

        Details:
            This custom event serves as a more reliable indicator of content changes compared to the native
            'change' event, especially when content is altered programmatically or via paste operations.
            It is actively monitored only when the textarea is focused and paused when blurred.
            Useful for real-time previews or any functionality requiring up-to-date content awareness.
            Requires `shouldBroadcastUpdates` option to be true.

        Example Usage:
            Assuming an EditorWidget instance `myEditor`:
            (start code)
            myEditor.targetElement.addEvent('onContentChanged', function(){
                console.log("Content has been updated!");
                // Update live preview, save draft, etc.
            });
            (end)
    */
    monitorContentUpdates: function() {
        // Compare the current content with the last recorded content.
        const currentContent = this.targetElement.get('value');
        if (this.previousContentState !== currentContent) {
            this.previousContentState = currentContent; // Update the last known state.
            // Dispatch a custom event to signal the change.
            this.targetElement.fireEvent('onContentChanged', [currentContent]); // Pass current content as argument.
        }
    },

    /*
        Method: retrieveCurrentSelection
            Obtains the text currently highlighted within the managed textarea.

        Returns:
            {string} The selected segment of text.
    */
    retrieveCurrentSelection: function() {
        // Delegates to the extended Element method.
        return this.targetElement.obtainCurrentSelection();
    },

    /*
        Method: encloseSelection
            Wraps the currently selected text with specified symbols or strings.

        Arguments:
            enclosingSymbols - {string} The text to prepend and append to the selection.
            isFinalStep - {boolean} Optional. True if this is the last transformation,
                                    influencing cursor placement. Defaults to true.

        Example:
            > myEditor.encloseSelection("__");
            >// If "text" was selected, it becomes: __text__
    */
    encloseSelection: function(enclosingSymbols, isFinalStep) {
        // Validate input.
        if (typeof enclosingSymbols !== 'string') {
            console.warn("EditorWidget: 'enclosingSymbols' must be a string.");
            enclosingSymbols = ''; // Default to empty string to prevent errors.
        }
        const currentSelectedText = this.targetElement.obtainCurrentSelection();
        const combinedText = enclosingSymbols + currentSelectedText + enclosingSymbols;
        this.targetElement.modifySelectionContent(combinedText, isFinalStep);
    },

    /*
        Method: injectContent
            Inserts text either immediately before or after the current text selection.

        Arguments:
            contentToInject - {string} The text string to be inserted.
            insertionPoint - {string} Specifies placement: "before" or "after". Defaults to "after".
            isFinalStep - {boolean} Optional. True if this is the last transformation. Defaults to true.

        Example:
            > myEditor.injectContent("Prefix: ", 'before');
            >// If "selected" was selected, it becomes: Prefix: selected
    */
    injectContent: function(contentToInject, insertionPoint, isFinalStep) {
        // Validate input.
        if (typeof contentToInject !== 'string') {
            console.warn("EditorWidget: 'contentToInject' must be a string.");
            contentToInject = '';
        }
        // Normalize insertion point, defaulting to 'after'.
        const effectiveInsertionPoint = (insertionPoint === "before") ? "before" : "after";
        const currentSelectedText = this.targetElement.obtainCurrentSelection();

        let resultantText;
        if (effectiveInsertionPoint === "before") {
            resultantText = contentToInject + currentSelectedText;
        } else {
            resultantText = currentSelectedText + contentToInject;
        }
        this.targetElement.modifySelectionContent(resultantText, isFinalStep);
    },

    /*
        Method: substituteSelection
            Replaces the entire current text selection with a new string.

        Arguments:
            replacementValue - {string} The new text that will substitute the selection.
            isFinalStep - {boolean} Optional. True if this is the last transformation. Defaults to true.

        Example:
            > myEditor.substituteSelection("New Phrase");
            >// If "Old Phrase" was selected, it becomes: New Phrase
    */
    substituteSelection: function(replacementValue, isFinalStep) {
        // Validate input.
        if (typeof replacementValue !== 'string') {
            console.warn("EditorWidget: 'replacementValue' must be a string.");
            replacementValue = '';
        }
        this.targetElement.modifySelectionContent(replacementValue, isFinalStep);
    },

    /*
        Method: transformEachLine
            Applies a provided callback function to each individual line within the current selection.

        Arguments:
            lineProcessorFn - {function} A callback function that accepts a line string as input
                                       and must return the transformed line string.
            isFinalStep - {boolean} Optional. True if this is the last transformation. Defaults to true.

        Example:
            (start code)
            myEditor.transformEachLine(function(singleLine){
                return " - " + singleLine.trim(); // Prepends a bullet point and trims whitespace.
            });
            // If selection was:
            // "Item A
            //  Item B"
            // It becomes:
            // "- Item A
            //  - Item B"
            (end)
    */
    transformEachLine: function(lineProcessorFn, isFinalStep) {
        // Input validation for the callback function.
        if (typeof lineProcessorFn !== 'function') {
            console.error("EditorWidget: 'lineProcessorFn' must be a function.");
            return;
        }

        const selectedContent = this.targetElement.obtainCurrentSelection();
        // Split the selected text into an array of lines.
        const contentLines = selectedContent.split("\n");
        const transformedLines = [];

        // Iterate through each line and apply the processor function.
        // Using a for...of loop for modern iteration.
        for (const line of contentLines) {
            // Apply the callback, ensuring 'this' context is maintained.
            // Check for empty lines to avoid processing them unnecessarily, or let the callback handle it.
            let processedLine = lineProcessorFn.call(this, line);
            // Ensure the result is a string.
            transformedLines.push(String(processedLine || ''));
        }

        // Join the transformed lines back together and replace the selection.
        this.targetElement.modifySelectionContent(transformedLines.join("\n"), isFinalStep);
    },

    /*
        Method: fetchCurrentValue
            Retrieves the complete content of the managed textarea.

        Returns:
            {string} The full text content of the textarea.
    */
    fetchCurrentValue: function() {
        return this.targetElement.get('value');
    },

    /*
        Method: assignNewValue
            Sets the entire content of the managed textarea to a new string.

        Arguments:
            newValue - {string} The string to set as the textarea's new content.

        Example:
            > myEditor.assignNewValue("Hello, World!");
    */
    assignNewValue: function(newValue) {
        // Validate input.
        if (typeof newValue !== 'string') {
            console.warn("EditorWidget: 'newValue' must be a string.");
            newValue = '';
        }
        this.targetElement.set('value', newValue);
        this.targetElement.focus(); // Ensure focus after setting content.
    },

    /*
        Method: registerToolbarAction
            The primary method for extending the editor's functionality by adding new toolbar buttons.

        Arguments:
            actionName - {string} The display name for the button.
            actionHandler - {function} The callback function executed when the button is clicked.
                                      The 'this' context within the handler refers to the EditorWidget instance.
            buttonProps - {object} Optional. An object containing additional HTML attributes
                                   (e.g., `title`, `class`) for the generated button element.

        Usage Philosophy:
            This method embodies the core extensibility of EditorWidget. Each registered action
            creates a new interactive element in the toolbar. The `actionHandler` typically
            leverages the various text transformation methods provided by EditorWidget (e.g.,
            `encloseSelection`, `substituteSelection`) to manipulate the textarea's content.

        Example:
            (start code)
            // Registering a button to make selected text italic.
            myEditor.registerToolbarAction('Italicize', function() {
                const currentSelection = this.retrieveCurrentSelection();
                this.substituteSelection(`<i>${currentSelection}</i>`);
            }, {
                title: "Make Text Italic (Ctrl+I)",
                'data-tooltip': "Adds italic formatting" // Custom data attribute.
            });
            // A new "Italicize" button will appear in the toolbar.
            (end)
    */
    registerToolbarAction: function(actionName, actionHandler, buttonProps) {
        // Validate inputs.
        if (typeof actionName !== 'string' || actionName.trim() === '') {
            console.error("EditorWidget: 'actionName' must be a non-empty string.");
            return;
        }
        if (typeof actionHandler !== 'function') {
            console.error(`EditorWidget: 'actionHandler' for '${actionName}' must be a function.`);
            return;
        }
        if (!this.toolbarContainer) {
            console.warn(`EditorWidget: Toolbar container not initialized for action '${actionName}'.`);
            return;
        }

        let listItem = new Element('li'); // Create a list item to contain the button.
        let actionButton = new Element('button', { // Using a <button> element for better semantics.
            'type': 'button', // Explicitly define button type.
            'class': `editor-btn-${actionName.toLowerCase().replace(/\s+/g, '-')}`, // Dynamic class name.
            'events': {
                'click': (evt) => {
                    evt.preventDefault(); // Prevent default button behavior (e.g., form submission).
                    actionHandler.call(this); // Execute the handler with EditorWidget instance as 'this'.
                    // After any action, trigger a manual content check if updates are not broadcast automatically.
                    if (!this.options.shouldBroadcastUpdates) {
                        this.monitorContentUpdates();
                    }
                }
            }
        });

        actionButton.set('html', `<span>${actionName}</span>`); // Set button label.

        // Apply additional properties if provided.
        if (buttonProps && typeof buttonProps === 'object') {
            for (const prop in buttonProps) {
                if (buttonProps.hasOwnProperty(prop)) {
                    actionButton.setProperty(prop, buttonProps[prop]);
                }
            }
        }

        actionButton.inject(listItem, 'bottom'); // Insert button into the list item.
        listItem.inject(this.toolbarContainer); // Insert list item into the toolbar.
    }

});

// A global definition to simulate Browser.Engine.trident if MooTools' Browser object isn't fully available.
// This is an added fragment for robustness in a potentially modified environment.
if (typeof Browser === 'undefined' || typeof Browser.Engine === 'undefined') {
    window.Browser = window.Browser || {};
    window.Browser.Engine = window.Browser.Engine || {};
    // Simple check for IE, might not be fully accurate for all versions but serves the purpose of the original code.
    window.Browser.Engine.trident = (window.document.selection && !window.opera);
}