Ext.app.CodeEditor = Ext.extend(Ext.form.TextArea, { /* Base component for code editing functionality */

    minHeightPx: 60, /* Minimal allowed height in pixels */
    maxHeightPx: 1000, // Maximum height constraint for auto-grow

    syntaxLanguage: 'text', // Default programming language mode
    colorScheme: 'textmate', // Visual theme for the editor

    displayHiddenChars: false, // Option to show invisible characters (spaces, tabs)
    highlightStyle: 'line', // Style for selection highlighting (e.g., 'line' or 'text')

    scrollRate: 3, // Scrolling speed adjustment factor
    displayFoldingMarkers: true, // Show code folding widgets in the gutter

    softTabsEnabled: true, // Use spaces instead of actual tab characters for indentation
    indentSize: 4, // Number of spaces per tab

    wordWrapEnabled: false, // Enable or disable word wrapping
    textScale: '13px', // Font size for the editor content area

    initialContent: '', // The initial text content to load into the editor
    componentStyle: 'padding: 0px;', // Inline CSS applied to the component's main element


    initializeEvents: function () {
        Ext.app.CodeEditor.superclass.initializeEvents.call(this); // Call the parent class's event initializer
        this.textProcessor.on('focus', this.gainFocus.bind(this)); // Bind Ace editor focus to component's focus handler
        this.textProcessor.on('blur', this.loseFocus.bind(this)); // Bind Ace editor blur to component's blur handler
    },

    initializeComponent: function () {
        this.inputField = document.createElement('input'); // Create a hidden input element
        this.inputField.type = 'hidden'; // Set input type to hidden
        this.inputField.name = this.name; // Assign the component's name to the hidden input
        this.inputField.value = this.initialContent; // Set initial content to the hidden input
    },

    onElementRender: function (containerEl, insertPosition) {
        if (!this.el) { // If the component's element doesn't exist yet
            this.defaultAutoCreate = {
                tag: "div", // Create a div element
                cls: "x-texteditor-container", // Custom class for the container
                style: "width: 100%; height: 60px;" // Default dimensions for the container
            };
        }
        Ext.app.CodeEditor.superclass.onElementRender.call(this, containerEl, insertPosition); // Call the parent's render method

        var browserDetector = ace.require('ace/lib/useragent'); // Load Ace's user agent detection utility

        if (this.grow) { // If auto-growing is enabled
            this.el.setHeight(this.minHeightPx); // Set initial height to the minimum
        }

        this.textProcessor = ace.edit(this.el.dom); // Initialize the Ace editor instance on the component's DOM element

        this.el.appendChild(this.inputField); // Append the hidden input to the component's element
        this.el.dom.removeAttribute('name'); // Remove the 'name' attribute from the main element to prevent form submission issues

        this.el.focus = this.gainFocus.bind(this); // Override the element's focus method to call the editor's focus

        this.textProcessor.getSession().setValue(this.inputField.value); // Set the editor's session value from the hidden input

        this.textProcessor.setShowPrintMargin(false); // Disable the print margin line in the editor
        this.textProcessor.getSession().setTabSize(this.indentSize); // Configure the tab size for the editor session

        this.textProcessor.setAutoScrollEditorIntoView(true); // Enable auto-scrolling the editor into view

        if (!browserDetector.isMac) { // Apply specific settings for non-Mac operating systems
            this.textProcessor.setDragDelay(0); // Disable drag delay
        }

        this.textProcessor.setFontSize(this.textScale); // Set the font size for the editor
        this.textProcessor.setFadeFoldWidgets(false); // Prevent fold widgets from fading

        this.setDisplayHiddenChars(this.displayHiddenChars); // Apply the setting for showing invisible characters
        this.setHighlightStyle(this.highlightStyle); // Apply the selection highlight style
        this.setScrollRate(this.scrollRate); // Apply the scroll speed setting
        this.setDisplayFoldingMarkers(this.displayFoldingMarkers); // Apply the setting for showing fold widgets
        this.setSoftTabsEnabled(this.softTabsEnabled); // Apply the soft tabs setting
        this.setWordWrapEnabled(this.wordWrapEnabled); // Apply the word wrap setting

        ace.require("ace/ext/language_tools"); // Load Ace's language tools extension
        this.textProcessor.setOptions({
            enableBasicAutocompletion: true // Enable basic autocompletion feature
        });

        this.setColorScheme(this.colorScheme); // Set the editor's visual theme
        this.setSyntaxLanguage(this.syntaxLanguage); // Set the editor's syntax highlighting mode

        this.textProcessor.getSession().on('change', (function () { // Attach a change event listener to the editor session
            setTimeout(function () {
                this.inputField.value = this.textProcessor.getSession().getValue(); // Update the hidden input's value after a short delay
            }.bind(this), 15); // Delay ensures editor has processed changes
        }).bind(this));
        // Future improvement: link auto-sizing to relevant editor events
        this.adjustSize(); // Perform initial auto-sizing
    },

    onComponentDestroy: function () {
        this.textProcessor.destroy(); // Destroy the Ace editor instance to release resources
        Ext.app.CodeEditor.superclass.onComponentDestroy.call(this); // Call the parent class's destroy method
    },

    performValidation: function () {
        return true; // This component is always considered valid
    },

    retrieveErrors: function (currentValue) {
        return null; // No validation errors are generated by this component
    },

    onSizeChange: function () {
        this.textProcessor.resize(true); // Force the Ace editor to resize and redraw its content
    },

    executeAutoSizing: function (eventObject) {
        // Determine if auto-sizing should occur based on keyboard input
        return !eventObject.isNavKeyPress() || eventObject.getKey() === eventObject.ENTER;
    },

    adjustSize: function () {
        if (!this.grow) { // If auto-grow feature is not enabled, exit
            return;
        }
        var lineQuantity = this.textProcessor.getSession().getDocument().getLength(); // Get the total number of lines in the document
        var singleLineHeight = this.textProcessor.renderer.lineHeight; // Get the height of a single line
        var scrollBarWidth = this.textProcessor.renderer.scrollBar.getWidth(); // Get the width of the editor's scrollbar
        var borderThickness = this.el.getBorderWidth('tb'); // Get the top and bottom border widths of the component element

        // Calculate the new height, clamping it between minHeightPx and maxHeightPx
        var calculatedHeight = Math.min(this.maxHeightPx, Math.max(lineQuantity * singleLineHeight + scrollBarWidth + borderThickness, this.minHeightPx));
        if (calculatedHeight !== this.previousHeight) { // If the calculated height is different from the last recorded height
            this.previousHeight = calculatedHeight; // Update the previous height
            this.el.setHeight(calculatedHeight); // Set the new height for the component's element
            this.textProcessor.resize(); // Trigger a resize of the Ace editor
            this.fireEvent("autosize", this, calculatedHeight); // Fire a custom 'autosize' event
        }
    },

    setDimensions: function (widthValue, heightValue) {
        Ext.app.CodeEditor.superclass.setDimensions.apply(this, arguments); // Apply dimensions using the parent class's method
        this.textProcessor.resize(true); // Force Ace editor to resize after component dimensions change
    },

    getCurrentValue: function () {
        return this.inputField.value; // Retrieve the current content from the hidden input field
    },

    setEditorValue: function (newValue) {
        if (this.textProcessor) { // If the Ace editor instance has been initialized
            this.textProcessor.getSession().setValue(newValue); // Set the value directly in the Ace editor session
        } else {
            this.inputField.value = newValue; // Otherwise, update the hidden input field
        }
        this.initialContent = newValue; // Update the internal initial content property
    },

    setSyntaxLanguage: function (newMode) {
        this.textProcessor.getSession().setMode('ace/mode/' + newMode); // Set the syntax highlighting mode for the editor session
    },

    setColorScheme: function (newTheme) {
        this.textProcessor.setTheme('ace/theme/' + newTheme); // Apply a new visual theme to the editor
    },

    setTextScale: function (newTextSize) {
        this.textProcessor.setFontSize(newTextSize); // Adjust the font size of the editor text
    },

    setDisplayHiddenChars: function (showHidden) {
        this.textProcessor.setShowInvisibles(showHidden); // Toggle the display of invisible characters
    },

    setHighlightStyle: function (selectionDisplay) {
        this.textProcessor.setSelectionStyle(selectionDisplay); // Configure the style used for text selection
    },

    setScrollRate: function (speedFactor) {
        this.textProcessor.setScrollSpeed(speedFactor); // Modify the editor's scrolling speed
    },

    setDisplayFoldingMarkers: function (showMarkers) {
        this.textProcessor.setShowFoldWidgets(showMarkers); // Toggle the visibility of code folding widgets
    },

    setSoftTabsEnabled: function (enableSoftTabs) {
        this.textProcessor.getSession().setUseSoftTabs(enableSoftTabs); // Enable or disable the use of soft tabs (spaces)
    },

    setWordWrapEnabled: function (enableWrapMode) {
        this.textProcessor.getSession().setUseWrapMode(enableWrapMode); // Enable or disable word wrapping in the editor
    },

    insertContentAtCursor: function (contentToInsert) {
        return this.textProcessor.insert(contentToInsert); // Insert the given content at the current cursor position
    },

    gainFocus: function () {
        this.textProcessor.focus(); // Direct the focus to the Ace editor instance
    },

    loseFocus: function () {
        this.textProcessor.blur(); // Remove focus from the Ace editor instance
    }
});

Ext.reg('codeeditor', Ext.app.CodeEditor); // Register the new component with an xtype

Ext.namespace('MyApp.util'); // Define a new application-specific namespace

Ext.define('MyApp.util.CodeCompleter', {
    constructor: function () {
        // Placeholder for custom code completer initialization logic
    }
});

MyApp.util.CodeWidget = Ext.extend(Ext.app.CodeEditor, {

    contentType: 'text/plain', // Default MIME type for content handling

    colorScheme: MyApp.config['editor.theme'] || 'textmate', // Editor theme, retrieved from app configuration
    textScale: MyApp.config['editor.font_size'] || '13px', // Font size, retrieved from app configuration

    wordWrapEnabled: MyApp.config['editor.word_wrap'] === true, // Word wrap setting from app configuration
    softTabsEnabled: MyApp.config['editor.soft_tabs'] === true, // Soft tabs setting from app configuration

    indentSize: MyApp.config['editor.tab_size'] * 1 || 4, // Tab size, converted to number, from app configuration
    displayFoldingMarkers: MyApp.config['editor.fold_widgets'] === true, // Code folding widgets setting from app configuration

    displayHiddenChars: MyApp.config['editor.show_invisibles'] === true, // Show invisible characters setting from app configuration

    customTagsEnabled: false, // Flag to indicate if custom tags processing is active

    initializeComponent: function () {
        MyApp.util.CodeWidget.superclass.initializeComponent.call(this); // Call the parent class's initializeComponent
        var configModule = ace.require("ace/config"); // Get Ace's configuration module
        var editorResourcePath = MyApp.config['assets_url'] + 'components/custom_editor/ace_resources'; // Construct path to Ace resources
        configModule.set('modePath', editorResourcePath); // Set path for editor modes
        configModule.set('themePath', editorResourcePath); // Set path for editor themes
        configModule.set('workerPath', editorResourcePath); // Set path for editor workers
        this.dialogs = []; // Initialize an array to hold references to various dialog windows
    },

    onElementRender: function (containerEl, insertPosition) {
        MyApp.util.CodeWidget.superclass.onElementRender.call(this, containerEl, insertPosition); // Call the parent class's render method

        var SyntaxIterator = ace.require("ace/token_iterator").TokenIterator; // Load Ace's token iterator utility
        var browserInfo = ace.require("ace/lib/useragent"); // Load Ace's user agent utility

        var keyBinding = (browserInfo.isMac ? 'Command + F12' : 'Ctrl + F11'); // Determine keyboard shortcut display based on OS
        this.maximizeText = _('ui_editor.maximize') + ' (' + keyBinding + ')'; // Text for the maximize button
        this.minimizeText = _('ui_editor.minimize') + ' (' + keyBinding + ')'; // Text for the minimize button

        this.fullScreenToggler = document.createElement('div'); // Create a div element for the fullscreen toggle button
        this.fullScreenToggler.title = this.maximizeText; // Set initial title for the button
        this.fullScreenToggler.className = 'editor_fullscreen_toggle'; // Assign a custom CSS class
        this.fullScreenToggler.onmousedown = function (evt) {
            evt.preventDefault(); // Prevent default mouse down behavior (e.g., selection)
        };
        this.fullScreenToggler.onclick = function (evt) {
            this.toggleFullScreen(); // Call the fullscreen toggle method
            evt.preventDefault(); // Prevent default click behavior
        }.bind(this);

        this.textProcessor.renderer.scroller.appendChild(this.fullScreenToggler); // Append the button to the editor's scroller element

        this.setContentType(this.contentType); // Set the editor's content type

        if (!MyApp.util.CodeWidget.isInitialized) { // Check if global initialization for the widget has already run
            var cssRules = "\
                .editor_maximized {position: fixed; border: none; top: 0; left: 0; right: 0; bottom: 0; width: auto !important; height: auto !important; z-index: 10000;}\
                .editor_fullscreen_toggle {position: absolute; width: 18px; height: 18px; top: 4px; right: 4px; opacity: 0.6; z-index: 11; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABgFBMVEVmrBxkqxpjqhlkqxprryFnrB1kqxtkqxp6uzJiqRhZow9kqxpmrBxlrBtnrBxjqhlmrBxjqhptsSNkqhplqxt4tyxkqhlmrB1mrBx5uzJmrBxorR9orR5nrB1kqhlorR14uS5mrRxhqBhmrR1aoxBlqxt3titusiRlqxpiqRd4ty1rrh9hqBdjqxp3tSpaow9mrR15ujBorh5lrBxapRFmrBxkqhpjqhp5uzBhqRdnrB1rsCJlrBt6vDNorh93tipmqxxhqRhapBFbpRJnrR1mrB14uC1usiVnrB1apRFhqReq1VmLxUGv5Gyt3GOs22Cm0FKn2FyUzUyRykev4WmUz1CUy0mw5G6RzEmr11xusSOSy0iOxkKPx0Or2V6CwTuo3GGUz0+Sy0mu5W6Ry0mq1lptsCORy0iNx0OAvDOo2V5/vDOCwDmPxkOOy0mj0lWl1lqu4Gap1Viv4mms2l+s3WSPx0SKwDtusiWCwTqQxUGSyUaRykiAvDSp2l+Qx0QdWpRIAAAAS3RSTlMAAAAa4gAAlfAZMRLhuQCV1ZXwGgDwlQCy8MzY2swS2PDqEdUisvDwABn64hEA8CLh+tq5MeoAAPAZ4eKy+tr6uREiMdXq8PDqIhHgP7bQAAAA4ElEQVR42mOw5uBw52cAA351CwUWBttk30p9iIBKTmGcFgNHeEKwlBIfAwOrjmxNQaQoQ0V8TVa9PDMDg7B0RF1MdhSDGJdLfWqVqS6Ta5BfvYAzO1Arp0xVOS8bo3FGtAwnxDBuHhsRBgYNVR5uBihgZAOTTDA+AxMjiDSDCYhzW0kAtTBKGMiJgwUs7cJ8eBkZHfISjTSBXDEu5RT/akVzJo/Q4mgBE3aGisr0OqjDkupyM9MYJEMCY6UcQU73ki3LL1JjMCwtqfWEmO5U6x1gz8Ci4CYkCBEQFBLV0wYAXu4m8P20SwoAAAAASUVORK5CYII=)}\
                .editor_fullscreen_toggle:hover {opacity: 1;}\
            "; // CSS rules for fullscreen mode and the toggle button
            new MyApp.util.CodeCompleter(); // Instantiate a custom code completer
            var domUtility = ace.require("ace/lib/dom"); // Load Ace's DOM utility
            domUtility.importCssString(cssRules); // Inject the custom CSS into the document
            var codeSnippetManager = ace.require("ace/snippets").snippetManager; // Get Ace's snippet manager
            var snippetDefinitions = MyApp.config['editor.snippets'] || ''; // Retrieve snippet definitions from app config
            codeSnippetManager.register(codeSnippetManager.parseSnippetFile(snippetDefinitions), "_"); // Register parsed snippets

            var KeybindHandler = ace.require("ace/keyboard/hash_handler").HashHandler; // Load Ace's keyboard hash handler
            var commandCollection = new KeybindHandler(); // Create a new command collection
            commandCollection.addCommand({
                name: "insertSnippet", // Name of the command
                bindKey: { win: "Tab", mac: "Tab" }, // Key binding for Windows and Mac
                exec: function (editorRef) {
                    return codeSnippetManager.expandWithTab(editorRef); // Execute snippet expansion
                }
            });
            // This function dynamically adds the custom keybind handler to the editor
            var onModeChanged = function (eventObj, targetEditor) {
                var editorInstance = targetEditor;
                editorInstance.keyBinding.addKeyboardHandler(commandCollection);
            };
            onModeChanged({}, this.textProcessor); // Apply the handler initially

            var MarkupExpander = ace.require("ace/ext/emmet"); // Load Ace's Emmet extension
            var networkUtility = ace.require('ace/lib/net'); // Load Ace's network utility
            networkUtility.loadScript(MyApp.config['assets_url'] + 'components/custom_editor/emmet/emmet.js', function () {
                MarkupExpander.setCore(window.emmet); // Set the Emmet core library
                this.textProcessor.setOption("enableEmmet", true); // Enable Emmet in the editor
                this.textProcessor.on("changeMode", onModeChanged); // Attach mode change listener to re-apply handlers
                onModeChanged({}, this.textProcessor); // Apply handler after Emmet is loaded
            }.bind(this));

            ace.require('ace/ext/keybinding_menu').init(this.textProcessor); // Initialize the keybinding menu extension

            MyApp.util.CodeWidget.isInitialized = true; // Mark the global initialization as complete
        }

        this.textProcessor.commands.addCommand({
            name: "displayKeyboardShortcuts", // Command to show keyboard shortcuts
            bindKey: { win: "Ctrl-Alt-H", mac: "Command-Alt-H" }, // Key binding
            exec: function (editorRef) {
                editorRef.showKeyboardShortcuts(); // Execute the Ace function to show shortcuts
            },
            readOnly: true
        });

        this.textProcessor.commands.addCommand({
            name: "navigateToLine", // Command to jump to a specific line
            bindKey: { win: "Ctrl-L", mac: "Command-Option-L" }, // Key binding
            exec: this.showLineJumpDialog.bind(this), // Execute method to show line jump dialog
            readOnly: true
        });

        this.textProcessor.commands.addCommand({
            name: "toggleFullScreen", // Command to toggle fullscreen mode
            bindKey: { win: "Ctrl-F11", mac: "Command-F12" }, // Key binding
            exec: this.toggleFullScreen.bind(this), // Execute method to toggle fullscreen
            readOnly: true
        });
    },

    toggleFullScreen: function () {
        if (this.isMaximized) { // Check if the editor is currently maximized
            this.fullScreenToggler.title = this.maximizeText; // Change button title to 'Maximize'
            this.el.removeClass('editor_maximized'); // Remove the fullscreen CSS class
        } else {
            this.el.addClass('editor_maximized'); // Add the fullscreen CSS class
            this.fullScreenToggler.title = this.minimizeText; // Change button title to 'Minimize'
        }
        this.isMaximized = !this.isMaximized; // Toggle the fullscreen state flag
        this.onSizeChange(); // Trigger a resize event to adjust the editor's dimensions
    },

    setContentType: function (mediaType) {
        this.setSyntaxLanguage(MyApp.util.CodeWidget.mediaTypes[mediaType] || 'text'); // Set the editor's syntax language based on the provided MIME type
    },

    showLineJumpDialog: function () {
        var currentDialog;
        if (!this.dialogs.gotoLine) { // If the "go to line" dialog doesn't exist yet
            this.dialogs.gotoLine = this.createLineJumpDialog(); // Create it
        }
        currentDialog = this.dialogs.gotoLine; // Get the dialog instance
        currentDialog.show(); // Display the dialog to the user
    },

    processLineJump: function () {
        var currentDialog, targetLine;

        currentDialog = this.dialogs.gotoLine; // Reference to the line jump dialog

        targetLine = currentDialog.formPanel.getForm().getFieldValues('targetLine')['targetLine']; // Extract the line number from the dialog's form
        if (!isNaN(targetLine) && targetLine > 0) { // Validate if it's a positive number
            this.textProcessor.gotoLine(parseInt(targetLine, 10)); // Navigate the editor to the specified line
            currentDialog.hide(); // Hide the dialog after navigation
        }
    },

    createLineJumpDialog: function () {
        var dialogInstance = MyApp.load({
            xtype: 'modx-window', // Custom ExtJS window component type
            title: _('ui_editor.goto_line'), // Dialog title from i18n
            resizable: false, // Prevent resizing
            maximizable: false, // Prevent maximizing
            allowDrop: false, // Disable drag and drop
            width: 320, // Fixed width for the dialog
            buttons: [{
                text: _('ui_editor.go_action'), // 'Go' button text
                scope: this,
                handler: this.processLineJump // Handler for the 'Go' button
            }, {
                text: _('ui_editor.close_action'), // 'Close' button text
                scope: this,
                handler: function () { dialogInstance.hide(); } // Handler to hide the dialog
            }],
            keys: [{
                key: Ext.EventObject.ENTER, // Key binding for the Enter key
                fn: this.processLineJump, // Function to call when Enter is pressed
                scope: this
            }],
            action: 'gotoLine', // Identifier for the dialog's action
            listeners: {
                'hide': { fn: this.gainFocus, scope: this } // When dialog hides, return focus to editor
            },
            fields: [{
                xtype: 'textfield', // Text input field
                validator: function (val) {
                    return !isNaN(val) && val > 0; // Custom validator for positive numeric input
                },
                fieldLabel: _('ui_editor.line_number'), // Label for the field
                name: 'targetLine', // Name of the field
                anchor: '95%', // Anchor property for layout
                value: ''
            }]
        });

        return dialogInstance; // Return the created dialog instance
    },

    setSyntaxLanguage: function (newMode) {
        var editorRef = this.textProcessor; // Get a reference to the Ace editor instance
        if (!this.customTagsEnabled) { // If custom tag processing is not enabled
            return editorRef.session.setMode('ace/mode/' + newMode); // Set a standard Ace mode
        }

        var configModule = ace.require('ace/config'); // Get Ace's configuration module
        configModule.loadModule(["mode", 'ace/mode/' + newMode], function (modeModule) {
            var mixedMode = MyApp.util.CodeWidget.generateMixedSyntaxMode(modeModule.Mode); // Generate a custom mixed syntax mode
            editorRef.session.setMode(mixedMode); // Apply the custom mixed mode to the editor session
        }.bind(this));
    }
});

// Define MIME type mappings for the CodeWidget
MyApp.util.CodeWidget.mediaTypes = {
    'text/plain': 'text',
    'text/html': 'html',
    'text/javascript': 'javascript',
    'text/css': 'css',
    'application/json': 'json',
    'application/xml': 'xml',
    'text/x-php': 'php',
    'application/x-sql': 'sql'
};

MyApp.util.CodeWidget.substituteComponent = function (componentId, mediaType, enableCustomTags) {
    var originalTextArea = Ext.getCmp(componentId); // Get the existing ExtJS component by ID
    if (!originalTextArea) {
        // Workaround for timing issues in component rendering (e.g., in file update panels)
        return setTimeout(function () {
            var retryTextArea = Ext.getCmp(componentId); // Attempt to get the component again
            if (retryTextArea) {
                MyApp.util.CodeWidget.substituteComponent(componentId, mediaType, enableCustomTags); // Retry substitution
            }
        }, 20); // Small delay before retrying
    }
    var newCodeEditor = MyApp.load({
        xtype: 'app-texteditor', // Custom xtype for the new code editor
        enableKeyEvents: true, // Enable key events
        anchor: originalTextArea.anchor, // Inherit anchor from the original textarea
        width: 'auto', // Auto width
        height: parseInt(MyApp.config['editor.height']) || originalTextArea.height, // Height from config or original
        name: originalTextArea.name, // Inherit name
        value: originalTextArea.getValue(), // Get current value from original
        contentType: mediaType, // Set content type
        customTagsEnabled: enableCustomTags // Enable/disable custom tags
    });

    originalTextArea.el.dom.removeAttribute('name'); // Remove 'name' attribute from the original textarea's DOM element
    originalTextArea.el.setStyle('display', 'none'); // Hide the original textarea
    newCodeEditor.render(originalTextArea.el.dom.parentNode); // Render the new code editor into the parent of the original textarea
    originalTextArea.setSize = function () { newCodeEditor.setDimensions.apply(newCodeEditor, arguments); }; // Override original setSize to call new editor's setDimensions
    newCodeEditor.textProcessor.on('change', function (eventObj) { originalTextArea.fireEvent('change', eventObj); }); // Forward change events from new editor to original
    originalTextArea.on('destroy', function () { newCodeEditor.destroy(); }); // Ensure new editor is destroyed when original is
    if (!enableCustomTags) { // If custom tags are not enabled, stop here
        return;
    }
    var dragDropHandler = MyApp.load({
        xtype: 'app-treedrop', // Custom xtype for tree drag-and-drop
        target: newCodeEditor, // Target component for drops
        targetEl: newCodeEditor.el, // Target element for drops
        onInsert: (function (insertString) {
            this.insertContentAtCursor(insertString); // Insert dropped content into the editor
            this.gainFocus(); // Bring editor into focus
            return true;
        }).bind(newCodeEditor),
        iframe: true // Enable iframe support for drag-and-drop
    });
    originalTextArea.on('destroy', function () { dragDropHandler.destroy(); }); // Destroy drag handler when original component is destroyed
};

MyApp.util.CodeWidget.transformTextAreas = function (textAreasCollection, mediaType) {
    textAreasCollection.forEach(function (currentTextArea) {
        var editorComponent = MyApp.load({
            xtype: 'app-texteditor', // Custom xtype for the editor
            width: 'auto', // Auto width
            height: parseInt(currentTextArea.style.height) || 220, // Height from original style or default
            name: currentTextArea.name, // Inherit name
            value: currentTextArea.value, // Inherit value
            contentType: mediaType || 'text/html', // Content type, default to HTML
            customTagsEnabled: true // Always enable custom tags for these transformations
        });

        currentTextArea.name = ''; // Clear the name of the original textarea
        currentTextArea.style.display = 'none'; // Hide the original textarea

        editorComponent.render(currentTextArea.parentNode); // Render the new editor into the original textarea's parent
        editorComponent.textProcessor.on('change', function (eventObj) { MyApp.fireResourceFormChange(); }); // Fire a global change event on editor content change
    });
};

MyApp.util.CodeWidget.generateMixedSyntaxMode = function (BaseMode) {
    function CustomMixedMode() {
        BaseMode.call(this); // Call the constructor of the base mode
        var SyntaxHighlightRules = this.HighlightRules; // Get the base mode's highlight rules

        function CustomMixedHighlightRules() {
            SyntaxHighlightRules.call(this); // Call the constructor of the base highlight rules

            // This section would contain custom syntax rules for mixed modes
            this.$rules['customtag-comment'] = [
                // Example: { token: "comment", regex: "<!--.*?-->" }
                // Actual rules for custom tags would be defined here
            ];
            // Additional rules could be defined or extended from BaseMode
        }
        // Assign the custom highlight rules
        this.HighlightRules = CustomMixedHighlightRules;
    }
    // Inherit properties and methods from BaseMode
    CustomMixedMode.prototype = Object.create(BaseMode.prototype);
    CustomMixedMode.prototype.constructor = CustomMixedMode;

    return CustomMixedMode; // Return the constructor for the new mixed mode
};