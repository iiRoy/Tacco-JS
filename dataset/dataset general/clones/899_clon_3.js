var RichContentTool = function (targetElements, configParams) {
    'use strict';
    // The primary entry point for initializing the rich content editor.
    // It delegates to a dedicated setup method for core functionality.
    if (!targetElements) {
        console.warn('RichContentTool: No target elements provided for initialization.');
        return null;
    }
    return this.initializeEditor(targetElements, configParams);
};

// Export the editor for CommonJS environments (like Node.js).
if (typeof module === 'object' && module.exports) {
    module.exports.RichContentTool = RichContentTool;
}

// Immediately Invoked Function Expression to encapsulate utility functions
// and avoid polluting the global scope, receiving window and document as parameters.
((domWindow, domDocument) => {
    'use strict';

    /**
     * Merges properties from a source object into a target object,
     * but only if the target object does not already possess the property.
     * This effectively applies default values.
     * @param {object} baseObj The object to which properties will be assigned.
     * @param {object} sourceObj The object containing default properties.
     * @returns {object} The modified base object.
     */
    function assignDefaults(baseObj, sourceObj) {
        // If the base object is undefined or null, we can just return the source as the new base.
        if (!baseObj) {
            return sourceObj;
        }
        // Iterate over the keys of the source object to apply defaults.
        Object.keys(sourceObj).forEach(propName => {
            // Only assign if the base object doesn't already have the property.
            if (!Object.prototype.hasOwnProperty.call(baseObj, propName)) {
                baseObj[propName] = sourceObj[propName];
            }
        });
        return baseObj;
    }

    /**
     * Captures the current selection ranges within the DOM.
     * This is crucial for later restoring the user's cursor position.
     * @returns {Array<Range>|null} An array of DOM Range objects, or null if no selection is active.
     */
    function captureCurrentSelection() {
        const activeSelection = domWindow.getSelection();
        // Check if there's an active selection and if it contains any ranges.
        if (activeSelection && activeSelection.rangeCount > 0) {
            // Convert the live RangeList into a static array of Range objects.
            return Array.from({
                length: activeSelection.rangeCount
            }, (_, idx) => activeSelection.getRangeAt(idx));
        }
        return null; // No selection to save.
    }

    /**
     * Restores a previously saved selection to the DOM.
     * @param {Array<Range>} savedRanges An array of DOM Range objects to restore.
     */
    function applySavedSelection(savedRanges) {
        if (!savedRanges || savedRanges.length === 0) {
            return; // Nothing to restore.
        }
        const currentSelection = domWindow.getSelection();
        // Clear any existing selections before adding the saved ones.
        currentSelection.removeAllRanges();
        // Add each saved range back to the selection.
        savedRanges.forEach(rangeItem => currentSelection.addRange(rangeItem));
    }

    /**
     * Determines the most immediate parent block element of the current caret position.
     * This helps identify the context of the user's input.
     * @returns {Element|null} The starting DOM node of the selection, or null.
     */
    function retrieveCaretContainer() {
        const currentSelection = domDocument.getSelection();
        // Ensure there's an anchorNode (start of selection/caret).
        if (!currentSelection || !currentSelection.anchorNode) {
            return null;
        }
        let startingNode = currentSelection.anchorNode;
        // If the node is a text node (type 3), its parent is the actual element.
        if (startingNode.nodeType === Node.TEXT_NODE) {
            startingNode = startingNode.parentNode;
        }
        return startingNode;
    }

    /**
     * Extracts the HTML content of the current user selection.
     * Handles various browser selection models.
     * @returns {string} The HTML string of the selected content.
     */
    function extractSelectionMarkup() {
        let selectionHtml = '';
        const currentSelection = domWindow.getSelection();

        if (currentSelection && currentSelection.rangeCount > 0) {
            // Create a temporary container to hold the cloned selection content.
            const tempContainer = domDocument.createElement('div');
            // Iterate through all selection ranges and append their cloned contents.
            for (let k = 0; k < currentSelection.rangeCount; k++) {
                tempContainer.appendChild(currentSelection.getRangeAt(k).cloneContents());
            }
            selectionHtml = tempContainer.innerHTML;
        } else if (domDocument.selection && domDocument.selection.type === 'Text') {
            // Fallback for older IE versions using document.selection.
            selectionHtml = domDocument.selection.createRange().htmlText;
        }
        return selectionHtml;
    }

    /**
     * Checks if a given object is a DOM Element node.
     * @param {any} testObj The object to check.
     * @returns {boolean} True if the object is a DOM Element, false otherwise.
     */
    function isDomElement(testObj) {
        return !!(testObj && testObj.nodeType === Node.ELEMENT_NODE);
    }

    // Define the prototype methods for the RichContentTool.
    RichContentTool.prototype = {
        // Default configuration settings for the editor instance.
        standardSettings: {
            allowMultiParaSelect: true, // Allow selection across multiple paragraphs
            linkInputPromptText: 'Enter or paste a link URL', // Placeholder for the link input field
            linkPreviewHideDelay: 600, // Delay before hiding the link preview
            actionButtons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote'], // Default toolbar buttons
            buttonLabelStyle: false, // Use default text labels for buttons, or 'fontawesome' for icons
            validateLinkFormat: false, // Check if pasted links are valid URLs
            sanitizePastedHtml: false, // Clean up HTML from external sources
            debounceTimeMs: 0, // Delay for selection checks
            toolbarOffsetX: 0, // Horizontal offset for the toolbar
            toolbarOffsetY: -12, // Vertical offset for the toolbar
            disableEnterKey: false, // Prevent default behavior of the Enter key
            preventDoubleEnter: false, // Prevent inserting multiple newlines
            hideToolbarGlobally: false, // Completely disable the toolbar
            primaryHeaderTag: 'h3', // Default tag for 'header1' button
            forcePlaintextContent: true, // Convert all pasted content to plain text
            editorPlaceholderText: 'Start typing here...', // Default placeholder for empty editor
            secondaryHeaderTag: 'h4', // Default tag for 'header2' button
            openLinksInNewTab: false, // Add target="_blank" to new links
            plugins: {} // Custom extensions/plugins
        },

        // Simple check for legacy IE browsers (not Edge).
        isLegacyBrowser: ((navigator.userAgent.indexOf('MSIE') !== -1) || (!!domDocument.documentMode)), // IE 10 or older, or IE 11

        /**
         * Initializes a new RichContentTool instance.
         * @param {string|HTMLElement|NodeList} elements The target elements for the editor.
         * @param {object} options Configuration options to override defaults.
         * @returns {RichContentTool} The initialized editor instance.
         */
        initializeEditor: function (elements, options) {
            // Set the initial selection query and update the list of target nodes.
            this.defineTargetSelection(elements);
            if (this.targetNodes.length === 0) {
                console.warn('RichContentTool: No editable elements found for the given selector.');
                return null;
            }

            // Define block-level parent elements that the editor should recognize.
            this.blockParentTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'li', 'div'];
            // Assign a unique ID to this editor instance.
            this.instanceId = domDocument.querySelectorAll('.rich-editor-toolbar').length + 1;
            // Merge user-provided options with the standard settings.
            this.configParams = assignDefaults(options, this.standardSettings);

            // Proceed with the core setup process.
            return this.configureAndActivate();
        },

        /**
         * Sets up the editor's core functionality, binding events and initializing components.
         * @returns {RichContentTool} The current editor instance for chaining.
         */
        configureAndActivate: function () {
            this.isActive = true; // Mark the editor as active.
            // Chain initialization methods for clarity and conciseness.
            this.setupEditableAreas()
                .attachSelectionObservers()
                .handlePasteEvents()
                .insertPlaceholders()
                .monitorGlobalEvents();
            return this;
        },

        /**
         * Prepares the designated DOM elements for editing.
         * This includes setting contentEditable, placeholders, and binding specific key events.
         * @returns {RichContentTool} The current editor instance.
         */
        setupEditableAreas: function () {
            this.refreshTargetNodes(); // Ensure the target node list is up-to-date.
            let needsToolbar = false; // Flag to determine if a toolbar should be initialized.

            // Iterate through each editable target node.
            this.targetNodes.forEach((node, index) => {
                node.setAttribute('contentEditable', true); // Make the element editable.
                // Apply a placeholder if one isn't already defined.
                if (!node.getAttribute('data-placeholder')) {
                    node.setAttribute('data-placeholder', this.configParams.editorPlaceholderText);
                }
                node.setAttribute('data-editor-element', true); // Custom attribute for editor elements.

                // Bind specific key behaviors for each editable area.
                this.enableParagraphFormatting(index);
                this.manageEnterKeyBehavior(index);
                this.controlTabKeyBehavior(index);

                // Check if a toolbar is needed for this element.
                if (!this.configParams.hideToolbarGlobally && !node.getAttribute('data-hide-toolbar')) {
                    needsToolbar = true;
                }
            });

            // Initialize the toolbar if any editable element requires it.
            if (needsToolbar) {
                this.initEditorToolbar()
                    .attachToolbarActions()
                    .setupLinkInputForm()
                    .prepareLinkPreview();
            }
            return this;
        },

        /**
         * Sets the query or direct reference for the editor's target elements.
         * @param {string|HTMLElement|NodeList} selectionQuery The CSS selector or element(s).
         * @returns {void}
         */
        defineTargetSelection: function (selectionQuery) {
            this.currentSelectionQuery = selectionQuery;
            this.refreshTargetNodes(); // Update the internal list of elements.
        },

        /**
         * Updates the internal list of DOM elements that the editor manages,
         * based on the `currentSelectionQuery`.
         * @returns {void}
         */
        refreshTargetNodes: function () {
            if (typeof this.currentSelectionQuery === 'string') {
                this.targetNodes = domDocument.querySelectorAll(this.currentSelectionQuery);
            } else if (this.currentSelectionQuery instanceof HTMLElement) {
                this.targetNodes = [this.currentSelectionQuery];
            } else if (this.currentSelectionQuery instanceof NodeList || Array.isArray(this.currentSelectionQuery)) {
                this.targetNodes = this.currentSelectionQuery;
            } else {
                this.targetNodes = [];
            }
        },

        /**
         * Serializes the content of all managed editable elements into a structured object.
         * @returns {object} An object where keys are element IDs and values are their trimmed HTML content.
         */
        exportContentPayload: function () {
            const contentData = {};
            this.targetNodes.forEach((editorNode, idx) => {
                const nodeId = editorNode.id || `editor-node-${idx + 1}`;
                contentData[nodeId] = {
                    htmlContent: editorNode.innerHTML.trim()
                };
            });
            return contentData;
        },

        /**
         * Invokes a specified function across all registered editor plugins/extensions.
         * @param {string} hookName The name of the function (hook) to call on each plugin.
         * @param {...any} hookArgs Arguments to pass to the plugin function.
         */
        triggerPluginHooks: function (hookName, ...hookArgs) {
            if (!hookName) {
                console.warn('RichContentTool: A hook name must be provided to triggerPluginHooks.');
                return;
            }

            // Iterate over all configured plugins.
            Object.values(this.configParams.plugins).forEach(plugin => {
                // Check if the plugin instance has the specified function.
                if (typeof plugin[hookName] === 'function') {
                    // Call the function with the provided arguments, ensuring 'this' context is the plugin itself.
                    plugin[hookName].apply(plugin, hookArgs);
                }
            });
        },

        /**
         * Binds an event listener to handle paragraph creation and formatting on 'keyup'.
         * @param {number} nodeIndex The index of the target node in `this.targetNodes`.
         * @returns {RichContentTool} The current editor instance.
         */
        enableParagraphFormatting: function (nodeIndex) {
            const currentEditorInstance = this;
            this.targetNodes[nodeIndex].addEventListener('keyup', (event) => {
                const caretNode = retrieveCaretContainer();
                if (!caretNode) return;

                const isEditorElement = caretNode.getAttribute('data-editor-element');
                const isDisabledByConfig = currentEditorInstance.configParams.disableEnterKey;
                const isDisabledByAttr = caretNode.getAttribute('data-disable-return');

                // If the caret is in an empty editor element and return is not disabled, ensure it's a paragraph.
                if (isEditorElement && caretNode.children.length === 0 && !(isDisabledByConfig || isDisabledByAttr)) {
                    domDocument.execCommand('formatBlock', false, 'p');
                }

                // Specific handling for Enter key press.
                if (event.key === 'Enter') {
                    const blockNode = retrieveCaretContainer();
                    if (!blockNode) return;

                    const blockTagName = blockNode.tagName.toLowerCase();
                    const returnIsDisabled = isDisabledByConfig || isDisabledByAttr;

                    // If Enter is pressed and return is not globally or locally disabled,
                    // and it's not inside a list item.
                    if (!returnIsDisabled && blockTagName !== 'li' && !currentEditorInstance.checkIfChildOfListItem(blockNode)) {
                        // If Shift is not held, ensure a new paragraph block is created.
                        if (!event.shiftKey) {
                            domDocument.execCommand('formatBlock', false, 'p');
                        }
                        // If currently in a link, unlink it on Enter.
                        if (blockTagName === 'a') {
                            domDocument.execCommand('unlink', false, null);
                        }
                    }
                }
            });
            return this;
        },

        /**
         * Checks if the given node is a child of an `<li>` element.
         * This is useful for list-related formatting logic.
         * @param {Node} targetNode The node to check.
         * @returns {boolean} True if the node is within an `<li>`, false otherwise.
         */
        checkIfChildOfListItem: function (targetNode) {
            let currentNode = targetNode;
            // Traverse up the DOM tree until a block parent or the document root is reached.
            while (currentNode && currentNode !== this.targetNodes[0] && currentNode.parentNode) {
                currentNode = currentNode.parentNode;
                if (currentNode.tagName && currentNode.tagName.toLowerCase() === 'li') {
                    return true;
                }
                // Stop if we hit a recognized block element or the editor's root.
                if (this.blockParentTags.includes(currentNode.tagName.toLowerCase())) {
                    break;
                }
            }
            return false;
        },

        /**
         * Manages the behavior of the Enter key within editable areas.
         * Prevents default actions based on configuration or attributes.
         * @param {number} nodeIndex The index of the target node.
         * @returns {RichContentTool} The current editor instance.
         */
        manageEnterKeyBehavior: function (nodeIndex) {
            const currentEditorInstance = this;
            this.targetNodes[nodeIndex].addEventListener('keypress', (keypressEvent) => {
                if (keypressEvent.key === 'Enter') {
                    const isDisabledByConfig = currentEditorInstance.configParams.disableEnterKey;
                    const isDisabledByAttr = keypressEvent.currentTarget.getAttribute('data-disable-return');

                    if (isDisabledByConfig || isDisabledByAttr) {
                        keypressEvent.preventDefault(); // Prevent default Enter behavior entirely.
                    } else if (currentEditorInstance.configParams.preventDoubleEnter || keypressEvent.currentTarget.getAttribute('data-prevent-double-return')) {
                        const currentCaretNode = retrieveCaretContainer();
                        // Prevent double newlines if the current node only contains a newline character.
                        if (currentCaretNode && currentCaretNode.textContent === '\n') {
                            keypressEvent.preventDefault();
                        }
                    }
                }
            });
            return this;
        },

        /**
         * Controls the behavior of the Tab key, especially within `<pre>` blocks.
         * @param {number} nodeIndex The index of the target node.
         * @returns {RichContentTool} The current editor instance.
         */
        controlTabKeyBehavior: function (nodeIndex) {
            this.targetNodes[nodeIndex].addEventListener('keydown', (keydownEvent) => {
                if (keydownEvent.key === 'Tab') {
                    const currentBlockTag = retrieveCaretContainer()?.tagName.toLowerCase();
                    // If inside a <pre> tag, insert spaces instead of changing focus.
                    if (currentBlockTag === 'pre') {
                        keydownEvent.preventDefault();
                        domDocument.execCommand('insertText', false, '    '); // Insert 4 spaces.
                    }
                }
            });
            return this;
        },

        /**
         * Generates the HTML markup for a specific toolbar action button.
         * @param {string} actionKey The identifier for the action (e.g., 'bold', 'anchor').
         * @returns {string|boolean} The HTML string for the button, or false if not found.
         */
        generateActionButtonMarkup: function (actionKey) {
            const labelMapping = this.resolveButtonDisplayLabels(this.configParams.buttonLabelStyle);
            // Define a map of action keys to their corresponding HTML button templates.
            const actionTemplates = {
                'bold': `<button class="editor-action editor-action-bold" data-action-trigger="bold" data-element-tag="b" aria-label="Bold">${labelMapping.bold}</button>`,
                'italic': `<button class="editor-action editor-action-italic" data-action-trigger="italic" data-element-tag="i" aria-label="Italic">${labelMapping.italic}</button>`,
                'underline': `<button class="editor-action editor-action-underline" data-action-trigger="underline" data-element-tag="u" aria-label="Underline">${labelMapping.underline}</button>`,
                'strikethrough': `<button class="editor-action editor-action-strikethrough" data-action-trigger="strikethrough" data-element-tag="strike" aria-label="Strikethrough">${labelMapping.strikethrough || '<s>S</s>'}</button>`,
                'superscript': `<button class="editor-action editor-action-superscript" data-action-trigger="superscript" data-element-tag="sup" aria-label="Superscript">${labelMapping.superscript || '<sup>X</sup>'}</button>`,
                'subscript': `<button class="editor-action editor-action-subscript" data-action-trigger="subscript" data-element-tag="sub" aria-label="Subscript">${labelMapping.subscript || '<sub>X</sub>'}</button>`,
                'anchor': `<button class="editor-action editor-action-anchor" data-action-trigger="anchor" data-element-tag="a" aria-label="Link">${labelMapping.anchor}</button>`,
                'image': `<button class="editor-action editor-action-image" data-action-trigger="image" data-element-tag="img" aria-label="Image">${labelMapping.image || 'Image'}</button>`,
                'header1': `<button class="editor-action editor-action-header1" data-action-trigger="append-${this.configParams.primaryHeaderTag}" data-element-tag="${this.configParams.primaryHeaderTag}" aria-label="Header 1">${labelMapping.header1}</button>`,
                'header2': `<button class="editor-action editor-action-header2" data-action-trigger="append-${this.configParams.secondaryHeaderTag}" data-element-tag="${this.configParams.secondaryHeaderTag}" aria-label="Header 2">${labelMapping.header2}</button>`,
                'quote': `<button class="editor-action editor-action-quote" data-action-trigger="append-blockquote" data-element-tag="blockquote" aria-label="Quote">${labelMapping.quote}</button>`,
                'orderedlist': `<button class="editor-action editor-action-orderedlist" data-action-trigger="insertorderedlist" data-element-tag="ol" aria-label="Ordered List">${labelMapping.orderedlist}</button>`,
                'unorderedlist': `<button class="editor-action editor-action-unorderedlist" data-action-trigger="insertunorderedlist" data-element-tag="ul" aria-label="Unordered List">${labelMapping.unorderedlist}</button>`,
                'pre': `<button class="editor-action editor-action-pre" data-action-trigger="append-pre" data-element-tag="pre" aria-label="Code Block">${labelMapping.pre}</button>`,
                'indent': `<button class="editor-action editor-action-indent" data-action-trigger="indent" data-element-tag="ul" aria-label="Indent">${labelMapping.indent}</button>`,
                'outdent': `<button class="editor-action editor-action-outdent" data-action-trigger="outdent" data-element-tag="ul" aria-label="Outdent">${labelMapping.outdent}</button>`
            };
            return actionTemplates[actionKey] || false;
        },

        /**
         * Resolves the display labels for toolbar buttons based on the specified style.
         * @param {string|object} labelStyleInput The style type ('fontawesome') or a custom label object.
         * @returns {object} An object mapping button types to their display labels.
         */
        resolveButtonDisplayLabels: function (labelStyleInput) {
            // Default HTML-based labels.
            const defaultLabels = {
                'bold': '<b>B</b>',
                'italic': '<b><i>I</i></b>',
                'underline': '<b><u>U</u></b>',
                'superscript': '<b>x<sup>1</sup></b>',
                'subscript': '<b>x<sub>1</sub></b>',
                'anchor': '<b>&#x26;</b>', // Ampersand for link
                'image': '<b>&#x1F5BC;</b>', // Picture icon
                'header1': '<b>H1</b>',
                'header2': '<b>H2</b>',
                'quote': '<b>&ldquo;</b>',
                'orderedlist': '<b>1.</b>',
                'unorderedlist': '<b>&bull;</b>',
                'pre': '<b>0101</b>',
                'indent': '<b>&rarr;</b>',
                'outdent': '<b>&larr;</b>'
            };

            let customLabelSet = {};
            if (labelStyleInput === 'fontawesome') {
                // FontAwesome icon classes for buttons.
                customLabelSet = {
                    'bold': '<i class="fa fa-bold"></i>',
                    'italic': '<i class="fa fa-italic"></i>',
                    'underline': '<i class="fa fa-underline"></i>',
                    'superscript': '<i class="fa fa-superscript"></i>',
                    'subscript': '<i class="fa fa-subscript"></i>',
                    'anchor': '<i class="fa fa-link"></i>',
                    'image': '<i class="fa fa-picture-o"></i>',
                    'quote': '<i class="fa fa-quote-right"></i>',
                    'orderedlist': '<i class="fa fa-list-ol"></i>',
                    'unorderedlist': '<i class="fa fa-list-ul"></i>',
                    'pre': '<i class="fa fa-code fa-lg"></i>',
                    'indent': '<i class="fa fa-indent"></i>',
                    'outdent': '<i class="fa fa-outdent"></i>'
                };
            } else if (typeof labelStyleInput === 'object' && labelStyleInput !== null) {
                // Directly use a custom object provided by the user.
                customLabelSet = labelStyleInput;
            }

            // Merge custom labels over defaults.
            return Object.assign({}, defaultLabels, customLabelSet);
        },

        /**
         * Initializes the editor's toolbar component.
         * Creates the toolbar DOM element and its sub-components.
         * @returns {RichContentTool} The current editor instance.
         */
        initEditorToolbar: function () {
            // If the toolbar already exists, skip re-initialization.
            if (this.editorToolbarElement) {
                return this;
            }

            this.editorToolbarElement = this.buildToolbarElement(); // Create the main toolbar container.
            this.maintainToolbarVisibility = false; // Flag to keep toolbar visible (e.g., during link editing).

            // Query and store references to key toolbar parts.
            this.linkInputForm = this.editorToolbarElement.querySelector('.editor-toolbar-link-input-form');
            this.linkUrlInput = this.linkInputForm.querySelector('input');
            this.toolbarActionButtonsContainer = this.editorToolbarElement.querySelector('.editor-toolbar-actions-list');
            this.linkPreviewContainer = this.createLinkPreview(); // Create and append link preview.

            return this;
        },

        /**
         * Constructs the main toolbar DOM element.
         * @returns {HTMLElement} The created toolbar div element.
         */
        buildToolbarElement: function () {
            const toolbarDiv = domDocument.createElement('div');
            toolbarDiv.id = `rich-editor-toolbar-${this.instanceId}`;
            toolbarDiv.className = 'rich-editor-toolbar';
            toolbarDiv.setAttribute('role', 'toolbar');
            toolbarDiv.setAttribute('aria-label', 'Rich Text Editor Toolbar');

            toolbarDiv.appendChild(this.createActionButtonsContainer()); // Add action buttons.
            toolbarDiv.appendChild(this.createLinkInputSection()); // Add link input form.

            // Append the toolbar to the document body.
            domDocument.body.appendChild(toolbarDiv);
            return toolbarDiv;
        },

        /**
         * Creates the unordered list containing all the action buttons for the toolbar.
         * @returns {HTMLUListElement} The UL element containing the buttons.
         */
        createActionButtonsContainer: function () {
            const buttonKeys = this.configParams.actionButtons;
            const buttonList = domDocument.createElement('ul');
            buttonList.id = 'editor-toolbar-actions-list';
            buttonList.className = 'editor-toolbar-actions-list clearfix';
            buttonList.setAttribute('role', 'menubar');

            buttonKeys.forEach(key => {
                let buttonMarkup = null;
                // Check if a plugin provides a custom button for this key.
                const pluginInstance = this.configParams.plugins[key];
                if (pluginInstance && typeof pluginInstance.getButton === 'function') {
                    buttonMarkup = pluginInstance.getButton();
                } else {
                    // Otherwise, use the default button template.
                    buttonMarkup = this.generateActionButtonMarkup(key);
                }

                if (buttonMarkup) {
                    const listItem = domDocument.createElement('li');
                    listItem.setAttribute('role', 'menuitem');
                    if (isDomElement(buttonMarkup)) {
                        listItem.appendChild(buttonMarkup);
                    } else {
                        listItem.innerHTML = buttonMarkup;
                    }
                    buttonList.appendChild(listItem);
                }
            });
            return buttonList;
        },

        /**
         * Creates the HTML structure for the link input form within the toolbar.
         * @returns {HTMLElement} The div containing the link input and close button.
         */
        createLinkInputSection: function () {
            const linkFormContainer = domDocument.createElement('div');
            const urlInputField = domDocument.createElement('input');
            const closeButton = domDocument.createElement('button');

            closeButton.setAttribute('type', 'button');
            closeButton.setAttribute('aria-label', 'Close link input');
            closeButton.classList.add('editor-toolbar-link-close');
            closeButton.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

            urlInputField.setAttribute('type', 'url'); // Semantic type for URLs.
            urlInputField.setAttribute('placeholder', this.configParams.linkInputPromptText);
            urlInputField.setAttribute('aria-label', this.configParams.linkInputPromptText);

            linkFormContainer.className = 'editor-toolbar-link-input-form';
            linkFormContainer.id = 'editor-toolbar-link-input-form';
            linkFormContainer.appendChild(urlInputField);
            linkFormContainer.appendChild(closeButton);

            return linkFormContainer;
        },

        /**
         * Attaches event listeners to the document and editable elements to monitor selection changes.
         * This triggers the toolbar to appear/disappear.
         * @returns {RichContentTool} The current editor instance.
         */
        attachSelectionObservers: function () {
            const _editorContext = this;
            let selectionDelayTimerId;

            // Define a debounced handler for selection checks.
            this.deferredSelectionCheckHandler = (event) => {
                // If clicking inside the link form, don't trigger a toolbar hide.
                if (event && _editorContext.isClickingIntoLinkEditor(event)) {
                    return;
                }

                clearTimeout(selectionDelayTimerId);
                selectionDelayTimerId = setTimeout(() => {
                    _editorContext.evaluateCurrentSelection();
                }, _editorContext.configParams.debounceTimeMs);
            };

            // Global mouseup event to detect selection changes anywhere in the document.
            domDocument.documentElement.addEventListener('mouseup', this.deferredSelectionCheckHandler, {
                passive: true
            });

            // Keyup and blur events on each editable element for more precise control.
            this.targetNodes.forEach(node => {
                node.addEventListener('keyup', this.deferredSelectionCheckHandler, {
                    passive: true
                });
                node.addEventListener('blur', this.deferredSelectionCheckHandler, {
                    passive: true
                });
            });
            return this;
        },

        /**
         * Evaluates the current text selection and updates the toolbar's visibility and position.
         * @returns {RichContentTool} The current editor instance.
         */
        evaluateCurrentSelection: function () {
            // Do not proceed if toolbar is globally hidden or if it's explicitly kept alive.
            if (this.maintainToolbarVisibility || this.configParams.hideToolbarGlobally) {
                return this;
            }

            const currentDocSelection = domWindow.getSelection();
            // Check if there's any text selected.
            if (!currentDocSelection || currentDocSelection.toString().trim() === '') {
                this.concealToolbarControls(); // Hide toolbar if no text is selected.
                return this;
            }

            // Check for multi-paragraph selection if not allowed.
            if (!this.configParams.allowMultiParaSelect && this.containsMultipleBlockElements()) {
                this.concealToolbarControls();
                return this;
            }

            // Determine the parent element of the selection.
            const selectionParentBlock = this.findSelectionParentBlock();
            // Hide toolbar if selection is not within an editable block, or if that block disables the toolbar.
            if (!selectionParentBlock || selectionParentBlock.getAttribute('data-hide-toolbar')) {
                this.concealToolbarControls();
            } else {
                this.assessSelectionContext(currentDocSelection, selectionParentBlock);
            }
            return this;
        },

        /**
         * Determines if a blur event is caused by clicking into the link input form.
         * This prevents the toolbar from disappearing prematurely.
         * @param {Event} eventObject The event that triggered the check.
         * @returns {boolean} True if the click is within the link input, false otherwise.
         */
        isClickingIntoLinkEditor: function (eventObject) {
            // Check if it's a blur event and if the related target (where focus went) is the link input.
            return eventObject.type === 'blur' && eventObject.relatedTarget === this.linkUrlInput;
        },

        /**
         * Checks if the current selection spans multiple block-level HTML elements.
         * @returns {number} The number of block elements found in the selection.
         */
        containsMultipleBlockElements: function () {
            // Extract the HTML of the selection, removing empty tags that might interfere with block counting.
            const selectedHtmlContent = extractSelectionMarkup().replace(/<[\S]+><\/[\S]+>/gim, '');
            // Regex to find common block-level tags.
            const blockMatch = selectedHtmlContent.match(/<(p|h[0-6]|blockquote|div|ul|ol|li)>([\s\S]*?)<\/(p|h[0-6]|blockquote|div|ul|ol|li)>/gi);
            return blockMatch ? blockMatch.length : 0;
        },

        // Placeholder for methods not yet implemented in this clone.
        bindPaste: function () {
            // console.log('Paste events binding stub.');
            return this;
        },
        setPlaceholders: function () {
            // console.log('Placeholder management stub.');
            return this;
        },
        bindWindowActions: function () {
            // console.log('Window actions binding stub.');
            return this;
        },
        createAnchorPreview: function () {
            // console.log('Anchor preview creation stub.');
            const preview = domDocument.createElement('div');
            preview.className = 'editor-link-preview';
            preview.style.display = 'none';
            domDocument.body.appendChild(preview);
            return preview;
        },
        attachToolbarActions: function () {
            // console.log('Toolbar button actions binding stub.');
            return this;
        },
        setupLinkInputForm: function () {
            // console.log('Link input form setup stub.');
            return this;
        },
        prepareLinkPreview: function () {
            // console.log('Link preview preparation stub.');
            return this;
        },
        concealToolbarControls: function () {
            // console.log('Concealing toolbar controls stub.');
            if (this.editorToolbarElement) {
                this.editorToolbarElement.style.display = 'none';
            }
            if (this.linkPreviewContainer) {
                this.linkPreviewContainer.style.display = 'none';
            }
            return this;
        },
        findSelectionParentBlock: function () {
            // console.log('Finding selection parent block stub.');
            return retrieveCaretContainer();
        },
        assessSelectionContext: function (selection, parentElement) {
            // console.log('Assessing selection context stub.', selection, parentElement);
            // This is where toolbar positioning and active button states would be handled.
            // For a Type III clone, we can just show the toolbar to indicate activity.
            if (this.editorToolbarElement) {
                this.editorToolbarElement.style.display = 'block';
                // Implement basic positioning logic if desired, e.g.,
                // const selectionRect = selection.getRangeAt(0).getBoundingClientRect();
                // this.editorToolbarElement.style.top = `${selectionRect.top + domWindow.scrollY - 50}px`;
                // this.editorToolbarElement.style.left = `${selectionRect.left + domWindow.scrollX}px`;
            }
            return this;
        }
    };

})(window, document);