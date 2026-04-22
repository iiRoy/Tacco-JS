(function(jq) {
    // This jQuery plugin initializes an advanced content editing interface.
    // It transforms the selected DOM element into a versatile rich text editor,
    // supporting WYSIWYG, source code editing (via ACE Editor), and a live preview.
    jq.fn.ContentComposer = function(initialSettings) {

        // --- Core Utility Functions for Selection Management ---

        // These variables hold the state of the user's text selection.
        let currentSelectionRange = null; // Stores the Rangy selection object
        let lastFocusedElement = null; // Keeps track of the element that had focus

        /**
         * Captures and stores the current text selection and the active DOM element.
         * This is crucial for operations that might cause the selection to be lost,
         * such as opening a color picker or a prompt dialog.
         */
        const storeActiveSelection = function() {
            // Remove any markers from a previous selection to keep the DOM clean.
            if (currentSelectionRange) {
                rangy.removeMarkers(currentSelectionRange);
            }
            currentSelectionRange = rangy.saveSelection(); // Utilize Rangy library for robust selection saving
            lastFocusedElement = document.activeElement; // Record the element with current focus
        };

        /**
         * Restores a previously saved text selection and attempts to re-focus
         * the element that was active when the selection was saved.
         */
        const applyStoredSelection = function() {
            if (currentSelectionRange) {
                rangy.restoreSelection(currentSelectionRange, true); // Restore selection, focusing if possible
                // Introduce a small delay to ensure focus restoration happens after potential DOM updates.
                window.setTimeout(() => {
                    // Verify the element exists and has a focus method before attempting to focus.
                    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
                        lastFocusedElement.focus();
                    }
                }, 15); // Slightly increased timeout for better reliability
            }
        };

        /**
         * A simplified wrapper for document.execCommand, ensuring consistent execution.
         * @param {string} commandName The name of the command to execute (e.g., 'bold', 'foreColor').
         * @param {any} [commandValue=null] The value associated with the command (e.g., a color string).
         */
        const executeRichTextCommand = (commandName, commandValue = null) => {
            try {
                document.execCommand(commandName, false, commandValue);
                // console.info(`Command executed: '${commandName}' with value: '${commandValue}'`);
            } catch (error) {
                console.warn(`ContentComposer: Failed to execute command '${commandName}'. Error:`, error);
            }
        };

        // --- Editor Configuration and Global State Setup ---

        // Define the default configuration for the editor.
        const defaultConfiguration = {
            wysiwygId: "composer-editor-area",
            codeSourceId: "composer-code-view",
            previewOutputId: "composer-render-output",
            tabNavigationId: "composer-mode-switcher",
            toolbarControlsId: "composer-toolbar-panel",
            // New option: Placeholder text if the initial element is empty
            placeholderText: "<p>Start typing your content here...</p>"
        };
        // Merge default settings with any user-provided options.
        const editorSettings = Object.assign({}, defaultConfiguration, initialSettings);

        // Declare editor-wide variables.
        let aceCodeEditorInstance; // Instance of the ACE Editor
        const hostElement = jq(this); // The jQuery object representing the element this plugin was called on
        let activeEditorMode = 'wysiwyg'; // Tracks the current active view (wysiwyg, code, preview)

        // --- Dependency Verification ---
        if (typeof rangy === 'undefined' || !rangy.saveSelection || !rangy.restoreSelection) {
            console.error("ContentComposer: Rangy library not found or incomplete. Selection management will be disabled.");
            // Potentially disable selection-dependent features or provide fallback.
        }
        if (editorSettings.codeSourceId && typeof ace === 'undefined') {
            console.warn("ContentComposer: ACE Editor library not found. Code view will function as a basic textarea.");
        }

        // --- Global Document Editing Rules ---
        // Set browser-level editing behaviors for contentEditable elements.
        try {
            executeRichTextCommand('insertBrOnReturn', true); // Ensures <br> is inserted on Enter, not new <p>
            executeRichTextCommand('enableObjectResizing', true); // Allows resizing of images/objects in editor
        } catch (err) {
            console.warn("ContentComposer: Browser may not support all document.execCommand settings.", err);
        }

        // --- Constructing Editor UI Elements ---

        // Create the primary WYSIWYG editing area.
        const wysiwygPanel = jq("<div />", {
            id: editorSettings.wysiwygId,
            contentEditable: "true", // Makes the div editable
            unselectable: "on", // Prevents text selection on the element itself when not editing
            role: "textbox", // ARIA role for accessibility
            "aria-multiline": "true"
        }).html(hostElement.html() || editorSettings.placeholderText); // Populate with existing content or placeholder

        // Create the dedicated source code editing area.
        const codePanel = jq("<div />", {
            id: editorSettings.codeSourceId,
            class: "composer-code-panel" // Add a custom class for styling
        });

        // Create the content preview panel.
        const previewPanel = jq("<div />", {
            id: editorSettings.previewOutputId,
            class: "composer-preview-panel"
        });

        // --- Assembling the Editor Layout ---

        // Clear the original host element and insert the WYSIWYG panel.
        hostElement.empty().append(wysiwygPanel);

        // Keep track of dynamically added panels for tab management.
        const dynamicallyAddedPanels = {};

        // Conditionally add the code view panel if configured.
        if (editorSettings.codeSourceId) {
            codePanel.html(wysiwygPanel.html()); // Initialize code panel with WYSIWYG content
            hostElement.append(codePanel);
            dynamicallyAddedPanels[editorSettings.codeSourceId] = codePanel;
        }
        // Conditionally add the preview panel if configured.
        if (editorSettings.previewOutputId) {
            hostElement.append(previewPanel);
            dynamicallyAddedPanels[editorSettings.previewOutputId] = previewPanel;
        }

        // --- Initialize Tab Navigation (e.g., Bootstrap Tabs) ---
        const tabNavigator = jq('#' + editorSettings.tabNavigationId);
        if (tabNavigator.length && typeof tabNavigator.tab === 'function') { // Check for existence and Bootstrap .tab() method
            wysiwygPanel.addClass("tab-pane active"); // Mark WYSIWYG as default active tab
            if (dynamicallyAddedPanels[editorSettings.codeSourceId]) {
                dynamicallyAddedPanels[editorSettings.codeSourceId].addClass("tab-pane");
            }
            if (dynamicallyAddedPanels[editorSettings.previewOutputId]) {
                dynamicallyAddedPanels[editorSettings.previewOutputId].addClass("tab-pane");
            }
            tabNavigator.tab(); // Initialize the tab functionality
        } else if (editorSettings.tabNavigationId) {
            console.warn(`ContentComposer: Tab navigation element '${editorSettings.tabNavigationId}' not found or .tab() method is missing. Tab functionality may not work.`);
        }

        // --- Initialize ACE Code Editor ---
        if (editorSettings.codeSourceId && typeof ace !== 'undefined') {
            try {
                aceCodeEditorInstance = ace.edit(editorSettings.codeSourceId);
                aceCodeEditorInstance.session.setMode("ace/mode/html"); // Set syntax highlighting for HTML
                aceCodeEditorInstance.setTheme("ace/theme/monokai"); // Apply a dark theme for code view
                aceCodeEditorInstance.setOptions({
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    showPrintMargin: false, // Hide the vertical print margin line
                    highlightActiveLine: true,
                    tabSize: 4,
                    useSoftTabs: true
                });
            } catch (err) {
                console.error("ContentComposer: Failed to initialize ACE Editor instance.", err);
                aceCodeEditorInstance = null; // Ensure it's null if initialization fails
            }
        }

        // --- Content Synchronization Functions ---

        /**
         * Synchronizes content from the WYSIWYG panel to the ACE Code Editor.
         * This is typically called when switching from WYSIWYG to Code view,
         * or when WYSIWYG content changes.
         */
        const syncWysiwygToCodeView = function() {
            if (aceCodeEditorInstance && activeEditorMode !== 'code') { // Only sync if ACE is active and not already in code mode
                try {
                    aceCodeEditorInstance.session.setValue(wysiwygPanel.html(), -1); // -1 moves cursor to start
                } catch (e) {
                    console.error("ContentComposer: Error updating ACE from WYSIWYG.", e);
                }
            }
        };

        /**
         * Synchronizes content from the ACE Code Editor to the WYSIWYG panel.
         * This is typically called when switching from Code to WYSIWYG view,
         * or when code content changes.
         */
        const syncCodeViewToWysiwyg = function() {
            if (aceCodeEditorInstance && activeEditorMode !== 'wysiwyg') { // Only sync if ACE is active and not already in wysiwyg mode
                try {
                    wysiwygPanel.html(aceCodeEditorInstance.session.getValue());
                } catch (e) {
                    console.error("ContentComposer: Error updating WYSIWYG from ACE.", e);
                }
            }
        };

        // --- Event Handlers for Editor Functionality ---

        // Preview panel click: Refresh its content with the current WYSIWYG content.
        jq('#' + editorSettings.previewOutputId).on("click", function(e) {
            e.preventDefault(); // Prevent default link behavior if preview contains links
            previewPanel.html(wysiwygPanel.html());
            // console.log("Preview panel content has been refreshed.");
        });

        // ACE Editor's content change listener: Sync changes back to WYSIWYG.
        if (aceCodeEditorInstance) {
            aceCodeEditorInstance.session.on("change", function() {
                // Introduce a debounce to prevent excessive updates during rapid typing
                clearTimeout(this._syncTimeout);
                this._syncTimeout = setTimeout(syncCodeViewToWysiwyg, 250);
            });
        }

        // Handlers for switching editor modes (tabs).
        // Using event delegation on the tab navigation container for efficiency.
        tabNavigator.on("mousedown", ".tab-code, .tab-preview", function(e) {
            e.preventDefault(); // Prevent default browser actions (like text selection)
            activeEditorMode = jq(this).hasClass("tab-code") ? 'code' : 'preview';
            jq("#" + editorSettings.toolbarControlsId).fadeOut(150); // Hide toolbar quickly
            // This assumes a global element with ID 'rte' that adjusts its position.
            // If 'rte' is meant to be hostElement, it should be changed.
            jq("#rte").css("bottom", "0px"); // Adjust layout for hidden toolbar
            syncWysiwygToCodeView(); // Sync content before showing code/preview
        });

        tabNavigator.on("mousedown", ".tab-wysiwyg", function(e) {
            e.preventDefault();
            activeEditorMode = 'wysiwyg';
            jq("#" + editorSettings.toolbarControlsId).fadeIn(150); // Show toolbar quickly
            jq("#rte").css("bottom", "33px"); // Restore layout
            syncCodeViewToWysiwyg(); // Sync content before showing WYSIWYG
        });

        // WYSIWYG panel input/blur/paste event handler: Sync changes to ACE Editor.
        let wysiwygToCodeSyncTimer;
        jq(document).on("input blur paste", "#" + editorSettings.wysiwygId, function(e) {
            clearTimeout(wysiwygToCodeSyncTimer);
            wysiwygToCodeSyncTimer = setTimeout(() => {
                syncWysiwygToCodeView();
                // console.log(`WYSIWYG content updated to code view due to '${e.type}' event.`);
            }, 350); // Debounce for 350ms to reduce frequent updates
        });

        // --- Toolbar Control Event Listeners ---

        // Color pickers: Capture selection before input is triggered.
        jq('[data-composer-action="backgroundColor"],[data-composer-action="foregroundColor"]').on("mousedown", function(e) {
            e.preventDefault(); // Prevent editor from losing focus
            storeActiveSelection(); // Save the current text selection
            // Trigger the native color picker dialog.
            jq(this).find("input[type='color']").trigger("click");
        });

        // Handle background color changes.
        jq('[data-composer-action="backgroundColor"] input[type="color"]').on("change", function() {
            applyStoredSelection(); // Restore selection to apply command to specific text
            const selectedColor = jq(this).val();
            executeRichTextCommand('backColor', selectedColor);
            // Optionally update a visual indicator on the color picker button itself.
            jq(this).closest('[data-composer-action="backgroundColor"]').find('i').css('color', selectedColor);
        });

        // Handle foreground (text) color changes.
        jq('[data-composer-action="foregroundColor"] input[type="color"]').on("change", function() {
            applyStoredSelection(); // Restore selection
            executeRichTextCommand('foreColor', jq(this).val());
        });

        // Map data-composer-action attributes to document.execCommand commands.
        const commandMap = {
            "boldText": "bold",
            "italicText": "italic",
            "underlineText": "underline",
            "strikeThroughText": "strikeThrough",
            "alignLeft": "justifyLeft",
            "alignCenter": "justifyCenter",
            "alignRight": "justifyRight",
            "alignJustify": "justifyFull",
            "insertUnorderedList": "insertUnorderedList",
            "insertOrderedList": "insertOrderedList",
            "insertParagraph": "insertParagraph",
            "indentContent": "indent",
            "outdentContent": "outdent"
        };

        // General delegated event handler for all basic text formatting commands.
        jq(document).on("mousedown", '[data-composer-action]', function(e) {
            const actionType = jq(this).data("composer-action");
            const command = commandMap[actionType];

            if (command) {
                e.preventDefault(); // Prevent focus loss from editor
                executeRichTextCommand(command);
            } else if (actionType === "createLink") {
                e.preventDefault();
                storeActiveSelection(); // Save selection before prompt
                let linkUrl = prompt("Please enter the URL for the link:");

                // Basic validation and protocol prefixing for the URL.
                if (linkUrl && linkUrl.trim() !== '') {
                    linkUrl = linkUrl.trim();
                    if (!/^https?:\/\//i.test(linkUrl) && !/^ftp:\/\//i.test(linkUrl) && !/^mailto:/i.test(linkUrl)) {
                        linkUrl = "http://" + linkUrl; // Default to http if no protocol specified
                    }
                    applyStoredSelection(); // Restore selection to apply link
                    executeRichTextCommand('createLink', linkUrl);
                    // console.log(`Link created: ${linkUrl}`);
                } else if (linkUrl !== null) { // User entered something, but it was empty or just whitespace
                    alert("A valid link address is required.");
                }
            }
            // No need for 'return false;' as e.preventDefault() handles stopping default actions.
        });

        // --- Public API (New Fragment) ---
        // Return an object with methods to interact with the editor programmatically.
        return {
            /**
             * Retrieves the current HTML content from the WYSIWYG editor.
             * @returns {string} The HTML content.
             */
            getWysiwygHtml: () => wysiwygPanel.html(),

            /**
             * Retrieves the current code content from the ACE editor.
             * @returns {string} The raw code content, or an empty string if ACE is not initialized.
             */
            getCodeSource: () => aceCodeEditorInstance ? aceCodeEditorInstance.session.getValue() : '',

            /**
             * Sets the HTML content of the WYSIWYG editor and synchronizes it to the code view.
             * @param {string} htmlContent The HTML string to set.
             */
            setWysiwygHtml: (htmlContent) => {
                wysiwygPanel.html(htmlContent);
                syncWysiwygToCodeView();
            },

            /**
             * Sets the code content of the ACE editor and synchronizes it to the WYSIWYG view.
             * @param {string} codeContent The code string to set.
             */
            setCodeSource: (codeContent) => {
                if (aceCodeEditorInstance) {
                    aceCodeEditorInstance.session.setValue(codeContent);
                    syncCodeViewToWysiwyg();
                }
            },

            /**
             * Gets the currently active editor mode ('wysiwyg', 'code', or 'preview').
             * @returns {string} The current mode.
             */
            getCurrentMode: () => activeEditorMode,

            /**
             * Programmatically switches the editor to a specified mode.
             * @param {'wysiwyg'|'code'|'preview'} mode The mode to switch to.
             */
            switchToMode: (mode) => {
                if (tabNavigator.length) {
                    if (mode === 'wysiwyg') {
                        tabNavigator.find('.tab-wysiwyg').trigger('mousedown');
                    } else if (mode === 'code') {
                        tabNavigator.find('.tab-code').trigger('mousedown');
                    } else if (mode === 'preview') {
                        tabNavigator.find('.tab-preview').trigger('mousedown');
                    } else {
                        console.warn(`ContentComposer: Invalid mode '${mode}' specified for switchToMode.`);
                    }
                } else {
                    console.warn("ContentComposer: Cannot switch mode programmatically, tab navigation element not found.");
                }
            },

            /**
             * Destroys the editor instance, cleaning up event handlers and ACE editor.
             */
            destroy: () => {
                jq(document).off(".contentcomposer"); // Unbind all namespaced events
                if (aceCodeEditorInstance) {
                    aceCodeEditorInstance.destroy();
                }
                hostElement.empty().html(wysiwygPanel.html()); // Restore original content to host element
                console.log("ContentComposer instance destroyed.");
            }
        };
    };
})(jQuery); // Using jQuery explicitly for the global object