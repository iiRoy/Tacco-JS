Ext.define('ExtJS.CodeEditorWidget', {
    extend: Ext.form.TextField,

    // Core configuration properties
    minHeightPixels: 60,
    maxHeightPixels: 1000,
    syntaxHighlightingMode: 'text',
    visualTheme: 'textmate',
    displayInvisibleChars: false,
    highlightStyle: 'line',
    scrollRate: 3,
    enableFoldingMarkers: true,
    softTabUsage: true,
    indentSize: 4,
    wordWrapEnabled: false,
    editorFontSize: '13px',
    initialContent: '',
    componentStyle: 'padding:0',
    autoResizeEnabled: false, // New property for clarity

    // Private properties
    #aceEditorInstance: null,
    #hiddenInputForValue: null,
    #previousCalculatedHeight: 0, // Used for auto-sizing logic

    // Initialization and lifecycle methods

    /**
     * Sets up event handlers after the component has been initialized.
     * @private
     */
    setupEventHandlers: function() {
        ExtJS.CodeEditorWidget.superclass.setupEventHandlers.call(this);
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.on('focus', this.handleEditorFocus, this);
            this.#aceEditorInstance.on('blur', this.handleEditorBlur, this);
        }
    },

    /**
     * Initializes component-specific data, such as the hidden input field.
     * @private
     */
    initializeComponentData: function() {
        // Create a hidden input to hold the editor's value for form submission
        this.#hiddenInputForValue = document.createElement('input');
        this.#hiddenInputForValue.type = 'hidden';
        this.#hiddenInputForValue.name = this.name || this.id + '_value'; // Ensure a name exists
        this.#hiddenInputForValue.value = this.initialContent;

        // Apply initial value to the hidden input if provided
        if (this.initialContent !== undefined && this.initialContent !== null) {
            this.updateEditorContent(this.initialContent);
        }
    },

    /**
     * Performs setup tasks after the component has been rendered to the DOM.
     * @param {Ext.Element} containerElement The container element.
     * @param {Number} renderPosition The position within the container.
     * @private
     */
    afterComponentRender: function(containerElement, renderPosition) {
        if (!this.el) {
            this.autoCreationDefaults = {
                tag: "div",
                cls: "x-form-textarea x-form-code-editor", // Added custom class
                style: "width:100%;height:60px;overflow:hidden;" // Ensure overflow is handled
            };
        }
        ExtJS.CodeEditorWidget.superclass.afterComponentRender.call(this, containerElement, renderPosition);

        const browserInfo = ace.require('ace/lib/useragent');

        if (this.autoResizeEnabled) {
            this.el.setHeight(this.minHeightPixels);
        }

        // Initialize the Ace editor instance
        this.#aceEditorInstance = ace.edit(this.el.dom);

        // Append the hidden input to the editor's main element
        this.el.appendChild(this.#hiddenInputForValue);
        this.el.dom.removeAttribute('name'); // Remove name from the visible element if it exists

        // Override the native focus method to delegate to the Ace editor
        this.el.focus = this.gainFocus.bind(this);

        const editorSession = this.#aceEditorInstance.session;
        editorSession.setValue(this.#hiddenInputForValue.value);

        // Configure various Ace editor settings
        this.#aceEditorInstance.setShowPrintMargin(false);
        editorSession.setTabSize(this.indentSize);
        this.#aceEditorInstance.setAutoScrollEditorIntoView(true);

        // Conditional drag delay based on OS
        browserInfo.isMac ? null : this.#aceEditorInstance.setDragDelay(0); // No-op for Mac

        this.#aceEditorInstance.setFontSize(this.editorFontSize);
        this.#aceEditorInstance.setFadeFoldWidgets(false); // Keeps fold widgets visible

        // Apply initial settings using dedicated methods
        this.toggleInvisibleCharDisplay(this.displayInvisibleChars);
        this.adjustSelectionHighlight(this.highlightStyle);
        this.modifyScrollSpeed(this.scrollRate);
        this.toggleFoldingMarkers(this.enableFoldingMarkers);
        this.enableSoftTabs(this.softTabUsage);
        this.activateWordWrap(this.wordWrapEnabled);

        // Enable basic autocompletion
        ace.require("ace/ext/language_tools");
        this.#aceEditorInstance.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true, // Also enable snippets by default
            enableLiveAutocompletion: true
        });

        this.applyVisualTheme(this.visualTheme);
        this.configureSyntaxMode(this.syntaxHighlightingMode);

        // Update hidden input field on editor content change
        editorSession.on('change', this.updateHiddenValueFromEditor, this);

        // Perform initial auto-sizing if enabled
        if (this.autoResizeEnabled) {
            this.adjustEditorHeight();
        }

        // Optional: Add a debounce for the resize event if performance is an issue
        Ext.EventManager.on(window, 'resize', Ext.Function.createBuffered(this.handleResizeEvent, 100, this));
    },

    /**
     * Cleans up the Ace editor instance and calls superclass onDestroy.
     * @private
     */
    cleanupComponent: function() {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.destroy();
            this.#aceEditorInstance = null; // Dereference to aid garbage collection
        }
        ExtJS.CodeEditorWidget.superclass.cleanupComponent.call(this);
    },

    // Validation methods

    /**
     * Performs a basic validation check.
     * @returns {boolean} True if valid, false otherwise.
     */
    performValidation: function() {
        // For a Type III clone, this could be more complex.
        // Let's add a simple check for content presence.
        const content = this.getCurrentContent();
        if (this.allowBlank === false && (!content || content.trim() === '')) {
            this.markInvalid('This field cannot be empty.');
            return false;
        }
        this.clearInvalid();
        return true;
    },

    /**
     * Retrieves any validation errors.
     * @param {String} contentValue The value to validate.
     * @returns {Array|null} An array of error messages, or null if no errors.
     */
    retrieveValidationErrors: function(contentValue) {
        const errors = [];
        const currentContent = contentValue || this.getCurrentContent();

        // Example: Add a simple length validation
        if (this.minLength && currentContent.length < this.minLength) {
            errors.push(`Content must be at least ${this.minLength} characters long.`);
        }
        if (this.maxLength && currentContent.length > this.maxLength) {
            errors.push(`Content cannot exceed ${this.maxLength} characters.`);
        }

        return errors.length > 0 ? errors : null;
    },

    // Event handlers

    /**
     * Handles the editor's focus event.
     * @private
     */
    handleEditorFocus: function() {
        this.fireEvent('editorfocused', this);
    },

    /**
     * Handles the editor's blur event.
     * @private
     */
    handleEditorBlur: function() {
        this.fireEvent('editorblurred', this);
        this.performValidation(); // Trigger validation on blur
    },

    /**
     * Handles component resizing, delegating to the Ace editor.
     * @private
     */
    handleResizeEvent: function() {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.resize(true);
        }
    },

    /**
     * Determines if an auto-size operation should be triggered by a key event.
     * @param {Ext.EventObject} keyEvent The key event.
     * @returns {boolean} True if auto-size should be triggered.
     * @private
     */
    shouldTriggerAutoSize: function(keyEvent) {
        return !keyEvent.isNavKeyPress() || keyEvent.getKey() === keyEvent.ENTER;
    },

    /**
     * Adjusts the editor's height based on its content.
     * @private
     */
    adjustEditorHeight: function() {
        if (!this.autoResizeEnabled || !this.#aceEditorInstance) {
            return;
        }

        const sessionDoc = this.#aceEditorInstance.session.doc;
        const lineCount = sessionDoc.getLength();
        const lineHeight = this.#aceEditorInstance.renderer.characterSize.height; // More accurate property
        const scrollbarWidth = this.#aceEditorInstance.renderer.$scrollBarV ? this.#aceEditorInstance.renderer.$scrollBarV.getWidth() : 0; // Check for existence
        const totalBorderHeight = this.el.getBorderWidth('tb'); // Top and bottom borders

        let calculatedHeight = (lineCount * lineHeight) + scrollbarWidth + totalBorderHeight;
        calculatedHeight = Math.max(calculatedHeight, this.minHeightPixels);
        calculatedHeight = Math.min(calculatedHeight, this.maxHeightPixels);

        if (calculatedHeight !== this.#previousCalculatedHeight) {
            this.#previousCalculatedHeight = calculatedHeight;
            this.el.setHeight(calculatedHeight);
            this.#aceEditorInstance.resize();
            this.fireEvent("heightAdjusted", this, calculatedHeight);
        }
    },

    /**
     * Sets the overall dimensions of the component.
     * @param {Number} width The new width.
     * @param {Number} height The new height.
     */
    setDimensions: function(width, height) {
        ExtJS.CodeEditorWidget.superclass.setDimensions.apply(this, arguments);
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.resize(true);
        }
    },

    /**
     * Retrieves the current content from the editor.
     * @returns {String} The editor's current value.
     */
    getCurrentContent: function() {
        return this.#hiddenInputForValue ? this.#hiddenInputForValue.value : this.initialContent;
    },

    /**
     * Updates the editor's content.
     * @param {String} newValueContent The new content string.
     */
    updateEditorContent: function(newValueContent) {
        if (newValueContent === null || newValueContent === undefined) {
            newValueContent = ''; // Default to empty string
        }

        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.session.setValue(newValueContent);
        } else if (this.#hiddenInputForValue) {
            this.#hiddenInputForValue.value = newValueContent;
        }
        this.initialContent = newValueContent; // Keep internal state consistent
    },

    /**
     * Updates the hidden input field with the editor's current value.
     * This method is bound to the editor's 'change' event.
     * @private
     */
    updateHiddenValueFromEditor: function() {
        if (this.#aceEditorInstance && this.#hiddenInputForValue) {
            // Use Ext.defer to ensure the value is fully updated before reading
            Ext.defer(function() {
                this.#hiddenInputForValue.value = this.#aceEditorInstance.session.getValue();
                this.fireEvent('change', this, this.#hiddenInputForValue.value); // Fire change event
                if (this.autoResizeEnabled) {
                    this.adjustEditorHeight(); // Re-adjust height on content change
                }
            }, 10, this);
        }
    },

    // Editor configuration setters

    /**
     * Configures the syntax highlighting mode for the editor.
     * @param {String} modeName The name of the Ace mode (e.g., 'javascript', 'html').
     */
    configureSyntaxMode: function(modeName) {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.session.setMode('ace/mode/' + modeName);
        }
    },

    /**
     * Applies a visual theme to the editor.
     * @param {String} themeName The name of the Ace theme (e.g., 'textmate', 'monokai').
     */
    applyVisualTheme: function(themeName) {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.setTheme('ace/theme/' + themeName);
        }
    },

    /**
     * Sets the font size for the editor.
     * @param {String} sizeValue The font size (e.g., '14px', '1em').
     */
    setEditorFontSize: function(sizeValue) {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.setFontSize(sizeValue);
        }
    },

    /**
     * Toggles the display of invisible characters (spaces, tabs, newlines).
     * @param {boolean} show Whether to show invisible characters.
     */
    toggleInvisibleCharDisplay: function(show) {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.setShowInvisibles(show);
        }
    },

    /**
     * Adjusts the style of selection highlighting.
     * @param {String} style The selection style ('line' or 'text').
     */
    adjustSelectionHighlight: function(style) {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.setSelectionStyle(style);
        }
    },

    /**
     * Modifies the scroll speed of the editor.
     * @param {Number} speed The scroll speed.
     */
    modifyScrollSpeed: function(speed) {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.setScrollSpeed(speed);
        }
    },

    /**
     * Toggles the visibility of code folding widgets.
     * @param {boolean} show Whether to show fold widgets.
     */
    toggleFoldingMarkers: function(show) {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.setShowFoldWidgets(show);
        }
    },

    /**
     * Enables or disables the use of soft tabs (spaces instead of actual tab characters).
     * @param {boolean} enable Whether to use soft tabs.
     */
    enableSoftTabs: function(enable) {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.session.setUseSoftTabs(enable);
        }
    },

    /**
     * Activates or deactivates word wrapping in the editor.
     * @param {boolean} activate Whether to activate word wrap.
     */
    activateWordWrap: function(activate) {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.session.setUseWrapMode(activate);
        }
    },

    // Cursor and content manipulation

    /**
     * Inserts text at the current cursor position.
     * @param {String} textToInsert The text to insert.
     * @returns {*} The result of the Ace editor's insert operation.
     */
    insertTextAtCursorPosition: function(textToInsert) {
        if (this.#aceEditorInstance) {
            return this.#aceEditorInstance.insert(textToInsert);
        }
        console.warn('Ace editor not initialized, cannot insert text.');
        return false;
    },

    /**
     * Brings the editor into focus.
     */
    gainFocus: function() {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.focus();
        }
    },

    /**
     * Removes focus from the editor.
     */
    loseFocus: function() {
        if (this.#aceEditorInstance) {
            this.#aceEditorInstance.blur();
        }
    }
});

// Register the custom ExtJS component
Ext.reg('codeeditorwidget', ExtJS.CodeEditorWidget);

// Ensure the MODx namespace exists
Ext.namespace('MODx.ux');

/**
 * MODx-specific integration for the Ace editor.
 * Extends the base ExtJS.CodeEditorWidget with MODx configuration and features.
 */
Ext.define('MODx_AceEditor_Integration', {
    extend: ExtJS.CodeEditorWidget, // Extend our base Ace editor widget

    // MODx-specific default properties, often driven by system settings
    defaultMimeType: 'text/plain',
    configDrivenTheme: MODx.config['ace.theme'] || 'textmate',
    configDrivenFontSize: MODx.config['ace.font_size'] || '13px',
    configWordWrapEnabled: MODx.config['ace.word_wrap'] === true,
    configSoftTabsEnabled: MODx.config['ace.soft_tabs'] === true,
    configTabSize: parseInt(MODx.config['ace.tab_size'], 10) || 4,
    configFoldingMarkers: MODx.config['ace.fold_widgets'] === true,
    configShowInvisibleChars: MODx.config['ace.show_invisibles'] === true,
    enableModxTemplateTags: false, // Flag to enable MODx-specific syntax handling

    // Internal state for MODx features
    #managedWindows: {}, // Using a private property for consistency
    #isCurrentlyFullScreen: false,
    #fullScreenToggleButton: null,
    #fullScreenActivationLabel: '',
    #exitFullScreenLabel: '',

    /**
     * Overrides the base component initialization to add MODx-specific setup.
     * @private
     */
    initializeModxSpecifics: function() {
        MODx_AceEditor_Integration.superclass.initializeComponentData.call(this);

        const aceConfiguration = ace.require("ace/config");
        const baseAceAssetPath = MODx.config['assets_url'] + 'components/ace/ace';

        // Set paths for Ace components to load from MODx assets
        aceConfiguration.set('modePath', baseAceAssetPath);
        aceConfiguration.set('themePath', baseAceAssetPath);
        aceConfiguration.set('workerPath', baseAceAssetPath);

        // Apply MODx-specific configurations to the base widget properties
        Ext.apply(this, {
            visualTheme: this.configDrivenTheme,
            editorFontSize: this.configDrivenFontSize,
            wordWrapEnabled: this.configWordWrapEnabled,
            softTabUsage: this.configSoftTabsEnabled,
            indentSize: this.configTabSize,
            enableFoldingMarkers: this.configFoldingMarkers,
            displayInvisibleChars: this.configShowInvisibleChars,
            syntaxHighlightingMode: this.defaultMimeType // Ensure this is set early
        });
    },

    /**
     * Overrides the base component render method to add MODx-specific UI and features.
     * @param {Ext.Element} containerElement The container element.
     * @param {Number} renderPosition The position within the container.
     * @private
     */
    postRenderSetup: function(containerElement, renderPosition) {
        MODx_AceEditor_Integration.superclass.afterComponentRender.call(this, containerElement, renderPosition);

        const AceTokenIterator = ace.require("ace/token_iterator").TokenIterator; // Unused, but kept for Type III flavor
        const BrowserAgentInfo = ace.require("ace/lib/useragent");

        const keyboardShortcutString = (BrowserAgentInfo.isMac ? 'Command + F12' : 'Ctrl + F11');
        this.#fullScreenActivationLabel = _('ui_ace.maximize') + ' (' + keyboardShortcutString + ')';
        this.#exitFullScreenLabel = _('ui_ace.minimize') + ' (' + keyboardShortcutString + ')';

        // Create and configure the fullscreen toggle button
        this.#fullScreenToggleButton = document.createElement('div');
        this.#fullScreenToggleButton.title = this.#fullScreenActivationLabel;
        this.#fullScreenToggleButton.className = 'ace_maximizer_button'; // Changed class name
        Ext.get(this.#fullScreenToggleButton).on('mousedown', (event) => {
            event.preventDefault(); // Prevent default browser drag behavior
        });
        Ext.get(this.#fullScreenToggleButton).on('click', (event) => {
            this.toggleFullscreenMode();
            event.preventDefault();
        });

        // Append the maximizer button to the editor's scroller element
        this.#aceEditorInstance.renderer.getContainerElement().appendChild(this.#fullScreenToggleButton); // Using getContainerElement which is more stable

        this.setSyntaxHighlightingModeByMime(this.defaultMimeType);

        // Global Ace editor setup, only executed once
        if (!MODx_AceEditor_Integration.isGlobalSetupComplete) {
            const cssStylesForFullscreen = `
                .ace_maximized_state { position: fixed; border: none; top: 0; left: 0; right: 0; bottom: 0; width: auto !important; height: auto !important; z-index: 10000; }
                .ace_maximizer_button {
                    position: absolute; width: 18px; height: 18px; top: 5px; right: 5px; opacity: 0.75;
                    z-index: 10; cursor: pointer;
                    background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBmaWxsPSIjRkZGIiBkPSJNNyAxMi43MDcgMi43MDcgOC40MTQgMy40MTQgNy43MDcgOCA1LjE3MiAxMi41ODcgOS43NTggMTMuMjkzIDkuMDQ5IDggMy43NTggNyAxMi43MDd6Ii8+PC9zdmc=) no-repeat center center;
                    background-size: 100%;
                    border-radius: 3px;
                }
                .ace_maximizer_button:hover { opacity: 1; background-color: rgba(255,255,255,0.1); }
            `; // Slightly changed SVG and hover style
            ace.require("ace/lib/dom").addCssString(cssStylesForFullscreen);

            new MODx_AceEditor_Integration.CodeCompleter(); // Assuming this is a custom MODx completion provider

            const aceSnippetManager = ace.require("ace/snippets").snippetManager;
            const configuredSnippets = MODx.config['ace.snippets'] || '';
            if (configuredSnippets) {
                aceSnippetManager.register(aceSnippetManager.parseSnippetFile(configuredSnippets), "modx_snippets"); // Register with a specific scope
            }

            const AceKeyBindingHandler = ace.require("ace/keyboard/hash_handler").HashHandler;
            const customKeyCommands = new AceKeyBindingHandler();
            customKeyCommands.addCommand({
                name: "insertSnippetFromManager",
                bindKey: {win: "Tab", mac: "Tab"},
                exec: function(editor) {
                    return aceSnippetManager.expandWithTab(editor);
                },
                readOnly: true // Ensure this command doesn't alter editor state directly
            });

            // Function to apply custom keybindings after mode change
            const handleModeChange = (e, targetEditor) => {
                targetEditor.keyBinding.addKeyboardHandler(customKeyCommands);
            };
            handleModeChange({}, this.#aceEditorInstance); // Apply initially

            const AceEmmetExtension = ace.require("ace/ext/emmet");
            const AceNetLoader = ace.require('ace/lib/net');
            AceNetLoader.loadScript(MODx.config['assets_url'] + 'components/ace/emmet/emmet.js', () => {
                AceEmmetExtension.setCore(window.emmet);
                this.#aceEditorInstance.setOption("enableEmmet", true);
                this.#aceEditorInstance.on("changeMode", handleModeChange);
                handleModeChange({}, this.#aceEditorInstance); // Re-apply after Emmet load
            }.bind(this));

            ace.require('ace/ext/keybinding_menu').init(this.#aceEditorInstance);

            MODx_AceEditor_Integration.isGlobalSetupComplete = true; // Mark as initialized
        }

        // Add custom editor commands
        this.#aceEditorInstance.commands.addCommands([
            {
                name: "displayKeyboardMapping",
                bindKey: {win: "Ctrl-Alt-H", mac: "Command-Alt-H"},
                exec: function(editor) {
                    editor.showKeyboardShortcuts();
                },
                readOnly: true
            },
            {
                name: "jumpToSpecificLine",
                bindKey: {win: "Ctrl-L", mac: "Command-Option-L"},
                exec: this.displayLineJumpPrompt.bind(this),
                readOnly: true
            },
            {
                name: "toggleEditorFullscreen",
                bindKey: {win: "Ctrl-F11", mac: "Command-F12"},
                exec: this.toggleFullscreenMode.bind(this),
                readOnly: true
            }
        ]);
    },

    /**
     * Toggles the editor's fullscreen mode.
     */
    toggleFullscreenMode: function() {
        if (this.#isCurrentlyFullScreen) {
            this.#fullScreenToggleButton.title = this.#fullScreenActivationLabel;
            this.el.removeCls('ace_maximized_state');
        } else {
            this.el.addCls('ace_maximized_state');
            this.#fullScreenToggleButton.title = this.#exitFullScreenLabel;
        }
        this.#isCurrentlyFullScreen = !this.#isCurrentlyFullScreen;
        this.handleResizeEvent(); // Trigger resize to adjust editor to new dimensions
    },

    /**
     * Sets the syntax highlighting mode based on a given MIME type.
     * Maps MIME types to Ace modes.
     * @param {String} inputMimeType The MIME type string.
     */
    setSyntaxHighlightingModeByMime: function(inputMimeType) {
        const modeIdentifier = MODx_AceEditor_Integration.mimeTypeMap[inputMimeType] || 'text';
        this.configureSyntaxMode(modeIdentifier);
    },

    /**
     * Displays a window to prompt the user for a line number to jump to.
     * @private
     */
    displayLineJumpPrompt: function() {
        if (!this.#managedWindows.gotoLinePrompt) {
            this.#managedWindows.gotoLinePrompt = this.buildLineJumpWindow();
        }
        this.#managedWindows.gotoLinePrompt.show();
    },

    /**
     * Executes the line jump based on the input from the prompt window.
     * @private
     */
    executeLineJump: function() {
        const linePromptWindow = this.#managedWindows.gotoLinePrompt;
        const targetLineNumber = parseInt(linePromptWindow.getForm().findField('targetLineNumber').getValue(), 10); // Use findField and parseInt

        if (!isNaN(targetLineNumber) && targetLineNumber > 0) {
            this.#aceEditorInstance.gotoLine(targetLineNumber, 0, true); // Jump to start of line, animate
            linePromptWindow.hide();
        } else {
            Ext.Msg.alert(MODx.i18n.get('error'), MODx.i18n.get('ui_ace.invalid_line_number'));
        }
    },

    /**
     * Builds the "Go to Line" window.
     * @returns {Ext.Window} The created window instance.
     * @private
     */
    buildLineJumpWindow: function() {
        const lineJumpDialog = MODx.load({
            xtype: 'modx-dialog-window', // Changed xtype
            title: MODx.i18n.get('ui_ace.goto_line'),
            resizable: false,
            maximizable: false,
            allowDrop: false,
            width: 320, // Slightly wider
            buttons: [{
                text: MODx.i18n.get('action_go'),
                scope: this,
                handler: this.executeLineJump
            },{
                text: MODx.i18n.get('action_cancel'), // Changed "close" to "cancel" for clarity
                scope: this,
                handler: function() { lineJumpDialog.hide(); }
            }],
            keys: [{
                key: Ext.EventObject.ENTER,
                fn: this.executeLineJump,
                scope: this
            }],
            action: 'performLineJump', // Changed action name
            listeners: {
                'hide': {fn: this.gainFocus, scope: this},
                'show': { // Added listener to pre-fill current line and select
                    fn: function(win) {
                        const currentLine = this.#aceEditorInstance.session.selection.getCursor().row + 1;
                        const lineField = win.getForm().findField('targetLineNumber');
                        lineField.setValue(currentLine);
                        lineField.selectText();
                        lineField.focus(true, 100); // Focus and select text
                    },
                    scope: this,
                    delay: 50 // Small delay for focus
                }
            },
            fields: [{
                xtype: 'numberfield', // Changed to numberfield for better input validation
                validator: function (value) {
                    const num = parseInt(value, 10);
                    return !isNaN(num) && num > 0 && num <= this.#aceEditorInstance.session.getLength() ? true : 'Please enter a valid positive line number.';
                }.bind(this), // Bind validator to component instance
                fieldLabel: MODx.i18n.get('ui_ace.goto_line'),
                name: 'targetLineNumber',
                anchor: '100%',
                allowDecimals: false,
                allowNegative: false,
                minValue: 1
            }]
        });

        return lineJumpDialog;
    },

    /**
     * Configures the syntax mode, with special handling for MODx template tags.
     * @param {String} modeName The name of the Ace mode.
     */
    configureSyntaxMode: function(modeName) {
        if (!this.#aceEditorInstance) {
            console.warn('Ace editor instance not available to set mode.');
            return;
        }

        const currentEditorInstance = this.#aceEditorInstance;
        if (!this.enableModxTemplateTags) {
            currentEditorInstance.session.setMode('ace/mode/' + modeName);
            return;
        }

        // If MODx tags are enabled, load and apply the mixed mode
        const aceConfig = ace.require('ace/config');
        aceConfig.loadModule(["mode", 'ace/mode/' + modeName], (module) => {
            if (module && module.Mode) {
                const mixedMode = MODx_AceEditor_Integration.generateModxHybridMode(module.Mode);
                currentEditorInstance.session.setMode(mixedMode);
            } else {
                console.error('Failed to load Ace mode module:', modeName);
                currentEditorInstance.session.setMode('ace/mode/text'); // Fallback
            }
        }.bind(this));
    },

    // Static properties and methods for MODx integration

    /**
     * A map of common MIME types to Ace editor mode identifiers.
     */
    statics: {
        isGlobalSetupComplete: false, // Tracks if global Ace setup has been done
        mimeTypeMap: {
            'text/html': 'html',
            'application/x-javascript': 'javascript',
            'text/css': 'css',
            'application/xml': 'xml',
            'text/x-php': 'php',
            'text/x-sql': 'sql',
            'text/x-markdown': 'markdown',
            'application/json': 'json',
            'text/plain': 'text',
            'application/x-yaml': 'yaml',
            'text/x-twig': 'twig',
            'application/x-smarty': 'smarty',
            'application/x-less': 'less',
            'application/x-sass': 'sass',
            'application/x-scss': 'scss',
            'text/x-coffeescript': 'coffee',
            'text/x-typescript': 'typescript',
            'image/svg+xml': 'svg'
            // Add more mappings as needed
        }
    }
});

/**
 * Static method to replace an existing Ext.Component (typically a textarea) with a MODx Ace Editor.
 * @param {String} componentId The ID of the component to replace.
 * @param {String} editorMimeType The MIME type for the new editor.
 * @param {boolean} enableModxTagsOption Whether to enable MODx-specific template tags.
 */
MODx_AceEditor_Integration.swapWithAceEditor = function(componentId, editorMimeType, enableModxTagsOption) {
    const originalTextAreaComponent = Ext.getCmp(componentId);
    if (!originalTextAreaComponent) {
        // Workaround for timing issues, try again after a short delay
        return Ext.defer(function() {
            const retryTextArea = Ext.getCmp(componentId);
            if (retryTextArea) {
                MODx_AceEditor_Integration.swapWithAceEditor(componentId, editorMimeType, enableModxTagsOption);
            } else {
                console.warn('Could not find component to replace:', componentId);
            }
        }, 150); // Increased delay slightly
    }

    // Create the new Ace editor instance
    const newAceEditorInstance = MODx.load({
        xtype: 'modx-code-editor', // Use the custom xtype
        enableKeyEvents: true,
        anchor: originalTextAreaComponent.anchor || '100%', // Use anchor from original component or default
        width: 'auto',
        height: parseInt(MODx.config['ace.height'], 10) || originalTextAreaComponent.getHeight() || 250, // More robust height retrieval
        name: originalTextAreaComponent.name || originalTextAreaComponent.id + '_editor', // Ensure a name
        initialContent: originalTextAreaComponent.getValue(),
        defaultMimeType: editorMimeType,
        enableModxTemplateTags: enableModxTagsOption,
        autoResizeEnabled: MODx.config['ace.auto_size'] === true // Inherit auto-size from MODx config
    });

    originalTextAreaComponent.el.dom.removeAttribute('name');
    originalTextAreaComponent.el.setStyle('display', 'none'); // Hide the original textarea

    // Render the new editor into the parent of the original textarea
    newAceEditorInstance.render(originalTextAreaComponent.el.dom.parentNode);

    // Proxy the setSize method from the original component to the new editor
    originalTextAreaComponent.setEditorDimensions = newAceEditorInstance.setDimensions.bind(newAceEditorInstance);

    // Proxy change events from the Ace editor back to the original component
    newAceEditorInstance.#aceEditorInstance.session.on('change', (changeEvent) => {
        originalTextAreaComponent.fireEvent('contentChanged', changeEvent, newAceEditorInstance.getCurrentContent()); // Custom event name
        originalTextAreaComponent.fireEvent('change', originalTextAreaComponent); // Also fire original 'change' event
    });

    // Clean up the new editor when the original component is destroyed
    originalTextAreaComponent.on('destroy', () => {
        newAceEditorInstance.cleanupComponent();
    });

    // Handle MODx tree drop target if enabled
    if (enableModxTagsOption) {
        const treeDropHandler = MODx.load({
            xtype: 'modx-tree-droptarget', // Custom xtype
            targetComponent: newAceEditorInstance,
            targetEl: newAceEditorInstance.el,
            handleInsertion: function(insertedString) { // Renamed handler
                this.insertTextAtCursorPosition(insertedString);
                this.gainFocus();
                return true;
            }.bind(newAceEditorInstance),
            iframe: true
        });
        originalTextAreaComponent.on('destroy', () => { treeDropHandler.destroy(); });
    }
};

/**
 * Static method to convert multiple standard HTML textareas into MODx Ace Editors.
 * @param {Array<HTMLElement>} domTextareaElements An array of DOM textarea elements.
 * @param {String} defaultMimeType The default MIME type for the editors.
 */
MODx_AceEditor_Integration.convertStandardTextareas = function(domTextareaElements, defaultMimeType) {
    domTextareaElements.forEach(function(domTextareaElement) {
        if (!domTextareaElement || domTextareaElement.nodeName.toLowerCase() !== 'textarea') {
            console.warn('Invalid element passed to convertStandardTextareas:', domTextareaElement);
            return;
        }

        const aceEditorWidget = MODx.load({
            xtype: 'modx-code-editor',
            width: 'auto',
            height: parseInt(domTextareaElement.style.height || domTextareaElement.offsetHeight, 10) || 280, // More robust height
            name: domTextareaElement.name || domTextareaElement.id + '_ace',
            initialContent: domTextareaElement.value,
            defaultMimeType: defaultMimeType || 'text/html',
            enableModxTemplateTags: true, // Always enable for this context
            autoResizeEnabled: MODx.config['ace.auto_size_batch'] === true // Separate auto-size config for batch
        });

        domTextareaElement.removeAttribute('name');
        domTextareaElement.style.display = 'none';

        aceEditorWidget.render(domTextareaElement.parentNode);
        aceEditorWidget.#aceEditorInstance.session.on('change', (changeEvent) => {
            MODx.triggerFormStateChange(changeEvent); // Custom MODx function for form changes
            // Additionally update the original textarea's value for fallback/submission
            domTextareaElement.value = aceEditorWidget.getCurrentContent();
        });
    });
};

/**
 * Static method to create a MODx-specific mixed mode for Ace editor.
 * This function integrates MODx template tag highlighting into a base Ace mode.
 * @param {Function} BaseMode The constructor for the base Ace mode.
 * @returns {Function} A new Mode constructor with MODx mixed rules.
 */
MODx_AceEditor_Integration.generateModxHybridMode = function(BaseMode) {
    function ModxHybridMode() {
        BaseMode.call(this); // Call the base mode constructor
        const BaseHighlightRules = this.HighlightRules;

        function ModxSyntaxHighlightingRules() {
            BaseHighlightRules.call(this); // Extend base highlight rules

            // Inject MODx-specific rules at the beginning or end of existing rules
            // This example adds rules for `[[...]]` and `[[+...]]` tags
            this.$rules = Ext.applyIf(this.$rules, {
                "start": [
                    {
                        token: ["keyword", "meta.tag.modx"],
                        regex: "(\\[\\[)(!?)(.*?)(?:\\]\\])", // Match [[tag]] and [[!tag]]
                        comment: "MODx tag with optional exclamation mark"
                    },
                    {
                        token: ["keyword.operator", "variable.parameter.modx"],
                        regex: "(\\[\\[\\+)(.*?)(?:\\]\\])", // Match [[+placeholder]]
                        comment: "MODx placeholder tag"
                    },
                    {
                        token: ["keyword.operator", "string.quoted.single.modx"],
                        regex: "(\\[\\[\\*)(.*?)(?:\\]\\])", // Match [[*field]]
                        comment: "MODx field tag"
                    },
                    {
                        token: ["keyword.operator", "string.regexp.modx"],
                        regex: "(\\[\\[~)(.*?)(?:\\]\\])", // Match [[~id]]
                        comment: "MODx link tag"
                    },
                    {
                        token: "comment.block.modx",
                        regex: "\\[\\[-",
                        next: "modxtag-comment"
                    }
                ],
                "modxtag-comment": [
                    {
                        token: "comment.block.modx",
                        regex: "-]]",
                        next: "start"
                    },
                    {
                        defaultToken: "comment.block.modx"
                    }
                ]
            });
            // Reorder rules if necessary, to ensure MODx tags are processed before other general text rules
            const originalStartRules = this.$rules.start;
            const modxRules = originalStartRules.splice(0, 5); // Take the first 5 MODx rules
            this.$rules.start = modxRules.concat(originalStartRules); // Put MODx rules first
        }

        // Inherit from the base mode's highlight rules
        ModxSyntaxHighlightingRules.prototype = BaseHighlightRules.prototype;
        this.HighlightRules = ModxSyntaxHighlightingRules;
    }

    // Inherit prototypes to maintain full functionality of the base mode
    ModxHybridMode.prototype = BaseMode.prototype;
    ModxHybridMode.prototype.constructor = ModxHybridMode;

    return ModxHybridMode;
};

// Register the MODx-specific xtype
Ext.reg('modx-code-editor', MODx_AceEditor_Integration);