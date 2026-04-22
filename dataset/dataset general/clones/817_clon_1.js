Ext.ux.Ace = Ext.extend(Ext.form.TextField,  {

    // Minimum height for the editor when grow is enabled
    growMin : 60,

    // Maximum height for the editor when grow is enabled
    growMax: 1000,

    // Default mode for the Ace editor (e.g., 'javascript', 'html', 'css', 'text')
    mode : 'text',

    theme : 'textmate', // Default theme

    showInvisibles : false, // Whether to show invisible characters

    selectionStyle : 'line', // 'line' or 'text' for selection style

    scrollSpeed : 3, // Scroll speed for the editor

    showFoldWidgets : true, // Whether to show code folding widgets

    useSoftTabs : true, // Use soft tabs (spaces) instead of hard tabs

    tabSize : 4, // Number of spaces for a tab

    useWrapMode : false, // Whether to use word wrap

    fontSize : '13px', // Font size for the editor

    value : '', // Initial value of the editor

    style: 'padding:0', // Inline style for the component's element

    /**
     * Initializes the component's event listeners.
     * @private
     */
    initEvents : function(){
        // Call the superclass's initEvents method
        Ext.ux.Ace.superclass.initEvents.call(this);

        // Attach focus and blur listeners to the Ace editor instance
        this.editor.on('focus', this.onFocus.bind(this));
        this.editor.on('blur', this.onBlur.bind(this));
    }
    ,

    /**
     * Initializes the component.
     * Creates a hidden input field to hold the editor's value.
     * @private
     */
    initComponent : function(){
        this.valueHolder = document.createElement('input'); // Create a new input element
        this.valueHolder.type = 'hidden'; // Set its type to hidden
        this.valueHolder.name = this.name; // Assign the component's name
        this.valueHolder.value = this.value; // Set initial value
    }
    ,

    /**
     * Renders the component to the DOM.
     * @param {Ext.Container} ct The container to render to.
     * @param {Number} position The position within the container.
     * @private
     */
    onRender : function(ct, position){
        if(!this.el){
            // If el is not defined, set up default autocreate config
            this.defaultAutoCreate = {
                tag: "div", // Use a div element
                cls: "x-form-textarea", // Apply standard textarea class
                style:"width:100px;height:60px" // Default dimensions
            };
        }

        // Call the superclass's onRender method
        Ext.ux.Ace.superclass.onRender.call(this, ct, position);

        // Load the useragent utility from Ace
        var useragent = ace.require('ace/lib/useragent');

        // If grow is enabled, set initial height
        if(this.grow){
            this.el.setHeight(this.growMin);
        }

        // Initialize the Ace editor instance on the component's element
        this.editor = ace.edit(this.el.dom);

        // Append the hidden value holder to the component's element
        this.el.appendChild(this.valueHolder);
        // Remove the 'name' attribute from the main element to prevent form submission issues
        this.el.dom.removeAttribute('name');

        // Bind the component's focus method to the element's focus event
        this.el.focus = this.focus.bind(this);

        // Set the editor's initial value from the value holder
        this.editor.getSession().setValue(this.valueHolder.value);

        // Configure various editor settings
        this.editor.setShowPrintMargin(false); // Hide the print margin
        this.editor.getSession().setTabSize(this.tabSize); // Set tab size

        this.editor.setAutoScrollEditorIntoView(true); // Auto-scroll when editor is focused

        // Disable drag delay for non-Mac systems
        if (!useragent.isMac) {
            this.editor.setDragDelay(0);
        }

        this.editor.setFontSize(this.fontSize); // Set font size
        this.editor.setFadeFoldWidgets(false); // Disable fading for fold widgets

        // Apply various settings using component methods
        this.setShowInvisibles(this.showInvisibles);
        this.setSelectionStyle(this.selectionStyle);
        this.setScrollSpeed(this.scrollSpeed);
        this.setShowFoldWidgets(this.showFoldWidgets);
        this.setUseSoftTabs(this.useSoftTabs);
        this.setUseWrapMode(this.useWrapMode);

        // Initialize language tools for autocompletion
        ace.require("ace/ext/language_tools");
        this.editor.setOptions({
            enableBasicAutocompletion: true // Enable basic autocompletion
        });

        // Set the editor's theme and mode
        this.setTheme(this.theme);
        this.setMode(this.mode);

        // Attach a change listener to the editor's session
        this.editor.getSession().on('change', (function(){
            // Use a timeout to ensure value is updated after editor renders changes
            setTimeout(function(){
                this.valueHolder.value = this.editor.getSession().getValue(); // Update hidden input
            }.bind(this), 10);
        }).bind(this));
        // TODO: attach autoSize to according event (?) - This is an existing comment.
        this.autoSize(); // Perform initial auto-sizing
    },

    /**
     * Cleans up the component when it's destroyed.
     * @private
     */
    onDestroy : function(){
        this.editor.destroy(); // Destroy the Ace editor instance
        Ext.ux.Ace.superclass.onDestroy.call(this); // Call superclass onDestroy
    },

    /**
     * Placeholder validation method. Always returns true.
     * @return {Boolean} Always true.
     */
    validate : function(){
        return true;
    },

    /**
     * Placeholder method to get validation errors. Always returns null.
     * @param {String} value The current value.
     * @return {null} Always null.
     */
    getErrors : function(value){
        return null;
    },

    /**
     * Handles the resize event for the component.
     * Resizes the Ace editor.
     * @private
     */
    onResize : function(){
        this.editor.resize(true); // Resize the Ace editor, passing true to force
    },

    /**
     * Determines if auto-sizing should occur based on keyboard event.
     * @param {Ext.EventObject} e The event object.
     * @return {Boolean} True if auto-sizing is needed.
     * @private
     */
    doAutoSize : function(e){
        // Only trigger on non-navigation keys or Enter key
        return !e.isNavKeyPress() || e.getKey() == e.ENTER;
    },

    /**
     * Automatically adjusts the height of the editor based on content.
     * @private
     */
    autoSize: function(){
        // If grow is not enabled, do nothing
        if(!this.grow){
            return;
        }

        // Calculate required height
        var linesCount = this.editor.getSession().getDocument().getLength(); // Number of lines
        var lineHeight = this.editor.renderer.lineHeight; // Height of a single line
        var scrollBar =  this.editor.renderer.scrollBar.getWidth(); // Width of the scrollbar
        var bordersWidth = this.el.getBorderWidth('tb'); // Top and bottom border width

        // Calculate new height, clamping between growMin and growMax
        var h = Math.min(this.growMax, Math.max(linesCount * lineHeight + scrollBar + bordersWidth, this.growMin));

        // If height has changed, update and resize
        if(h != this.lastHeight){
            this.lastHeight = h; // Store last height
            this.el.setHeight(h); // Set component element height
            this.editor.resize(); // Resize the editor
            this.fireEvent("autosize", this, h); // Fire autosize event
        }
    },

    /**
     * Sets the size of the component.
     * @param {Number} width The new width.
     * @param {Number} height The new height.
     */
    setSize : function(width, height){
        Ext.ux.Ace.superclass.setSize.apply(this, arguments); // Call superclass setSize
        this.editor.resize(true); // Resize the Ace editor
    },

    /**
     * Retrieves the current value from the editor.
     * @return {String} The editor's current value.
     */
    getValue : function (){
        return this.valueHolder.value; // Return value from hidden input
    },

    /**
     * Sets the value of the editor.
     * @param {String} value The new value to set.
     */
    setValue : function (value){
        if (this.editor) {
            // If editor is initialized, set its session value
            this.editor.getSession().setValue(value);
        } else {
            // Otherwise, update the hidden value holder directly
            this.valueHolder.value = value;
        }
        this.value = value; // Update component's internal value property
    },

    /**
     * Sets the Ace editor mode.
     * @param {String} mode The mode name (e.g., 'javascript', 'html').
     */
    setMode : function (mode){
        this.editor.getSession().setMode( 'ace/mode/' + mode ); // Set session mode
    },

    /**
     * Sets the Ace editor theme.
     * @param {String} theme The theme name (e.g., 'textmate', 'monokai').
     */
    setTheme : function(theme){
        this.editor.setTheme('ace/theme/' + theme); // Set editor theme
    },

    /**
     * Sets the font size of the editor.
     * @param {String} fontSize The font size (e.g., '12px', '1em').
     */
    setFontSize : function(fontSize){
        this.editor.setFontSize(fontSize);
    },

    /**
     * Toggles visibility of invisible characters.
     * @param {Boolean} showInvisibles True to show, false to hide.
     */
    setShowInvisibles : function(showInvisibles){
        this.editor.setShowInvisibles(showInvisibles);
    },

    /**
     * Sets the selection style of the editor.
     * @param {String} selectionStyle 'line' or 'text'.
     */
    setSelectionStyle : function(selectionStyle){
        this.editor.setSelectionStyle(selectionStyle);
    },

    /**
     * Sets the scroll speed of the editor.
     * @param {Number} scrollSpeed The scroll speed value.
     */
    setScrollSpeed : function(scrollSpeed){
        this.editor.setScrollSpeed(scrollSpeed);
    },

    /**
     * Toggles visibility of fold widgets.
     * @param {Boolean} showFoldWidgets True to show, false to hide.
     */
    setShowFoldWidgets : function(showFoldWidgets){
        this.editor.setShowFoldWidgets(showFoldWidgets);
    },

    /**
     * Toggles usage of soft tabs.
     * @param {Boolean} useSoftTabs True to use soft tabs, false for hard tabs.
     */
    setUseSoftTabs : function(useSoftTabs){
        this.editor.getSession().setUseSoftTabs(useSoftTabs);
    },

    /**
     * Toggles usage of word wrap mode.
     * @param {Boolean} useWrapMode True to enable wrap mode, false to disable.
     */
    setUseWrapMode : function(useWrapMode){
        this.editor.getSession().setUseWrapMode(useWrapMode);
    },

    /**
     * Inserts a value at the current cursor position in the editor.
     * @param {String} value The value to insert.
     * @return {Object} The editor instance.
     */
    insertAtCursor : function (value){
        return this.editor.insert(value);
    },

    /**
     * Focuses the Ace editor.
     */
    focus: function (){
        this.editor.focus();
    },

    /**
     * Blurs the Ace editor.
     */
    blur: function (){
        this.editor.blur();
    }

});

// Register the custom xtype 'ace'
Ext.reg('ace', Ext.ux.Ace);


// Define the MODx.ux namespace if it doesn't exist
Ext.namespace('MODx.ux');

// MODx.ux.Ace extends Ext.ux.Ace with MODx-specific configurations and functionalities
MODx.ux.Ace = Ext.extend(Ext.ux.Ace, {

    mimeType : 'text/plain', // Default MIME type

    // Theme based on MODx configuration, fallback to 'textmate'
    theme : MODx.config['ace.theme'] || 'textmate',

    // Font size based on MODx configuration, fallback to '13px'
    fontSize : MODx.config['ace.font_size'] || '13px',

    // Word wrap based on MODx configuration
    useWrapMode : MODx.config['ace.word_wrap'] == true,

    // Soft tabs based on MODx configuration
    useSoftTabs : MODx.config['ace.soft_tabs'] == true,

    // Tab size based on MODx configuration, fallback to 4
    tabSize : MODx.config['ace.tab_size'] * 1 || 4,

    // Fold widgets visibility based on MODx configuration
    showFoldWidgets : MODx.config['ace.fold_widgets'] == true,

    // Invisibles visibility based on MODx configuration
    showInvisibles : MODx.config['ace.show_invisibles'] == true,

    modxTags : false, // Whether to enable MODx tag parsing

    /**
     * Initializes the component, setting Ace paths and initializing window array.
     * @private
     */
    initComponent : function() {
        // Call the superclass's initComponent method
        MODx.ux.Ace.superclass.initComponent.call(this);

        var config = ace.require("ace/config"); // Get Ace config module
        var acePath = MODx.config['assets_url'] + 'components/ace/ace'; // Construct Ace assets path

        // Set paths for Ace modes, themes, and workers
        config.set('modePath', acePath);
        config.set('themePath', acePath);
        config.set('workerPath', acePath);

        this.windows = []; // Initialize an array to hold various windows
    },

    /**
     * Renders the component, adding MODx-specific features like maximizer and keybindings.
     * @param {Ext.Container} ct The container to render to.
     * @param {Number} position The position within the container.
     * @private
     */
    onRender : function (ct, position) {
        // Call the superclass's onRender method
        MODx.ux.Ace.superclass.onRender.call(this, ct, position);

        // Require Ace modules
        var TokenIterator = ace.require("ace/token_iterator").TokenIterator;
        var userAgent = ace.require("ace/lib/useragent");

        // Determine shortcut for maximize/minimize based on OS
        var shortcut = (userAgent.isMac ? 'Command + F12' : 'Ctrl + F11');
        this.maximizeTitle = _('ui_ace.maximize') + ' (' + shortcut + ')';
        this.minimizeTitle = _('ui_ace.minimize') + ' (' + shortcut + ')';

        // Create the maximizer button
        this.maximizer = document.createElement('div');
        this.maximizer.title = this.maximizeTitle;
        this.maximizer.className = 'ace_maximizer';

        // Prevent default mousedown behavior
        this.maximizer.onmousedown = function(event) {
            event.preventDefault();
        };

        // Attach click handler for full screen toggle
        this.maximizer.onclick = function(event) {
            this.fullScreen();
            event.preventDefault();
        }.bind(this);

        // Append the maximizer to the editor's scroller
        this.editor.renderer.scroller.appendChild(this.maximizer);

        // Set the editor's mode based on MIME type
        this.setMimeType(this.mimeType);

        // Initialize Ace extensions only once
        if (!MODx.ux.Ace.initialized) {
            // Define CSS for maximized state and maximizer button
            var style = "\
                .ace_maximized {position: fixed; border: none; top: 0; left: 0; right: 0; bottom: 0; width: auto !important; height: auto !important;z-index: 100}\
                .ace_maximizer {position: absolute; width: 16px; height: 16px; top: 3px; right: 3px; opacity: 0.7; z-index: 10; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABgFBMVEVmrBxkqxpjqhlkqxprryFnrB1kqxtkqxp6uzJiqRhZow9kqxpmrBxlrBtnrBxjqhlmrBxjqhptsSNkqhplqxt4tyxkqhlmrB1mrBx5uzJmrBxorR9orR5nrB1kqhlorR14uS5mrRxhqBhmrR1aoxBlqxt3titusiRlqxpiqRd4ty1rrh9hqBdjqxp3tSpaow9mrR15ujBorh5lrBxapRFmrBxkqhpjqhp5uzBhqRdnrB1rsCJlrBt6vDNorh93tipmqxxhqRhapBFbpRJnrR1mrB14uC1usiVnrB1apRFhqReq1VmLxUGv5Gyt3GOs22Cm0FKn2FyUzUyRykev4WmUz1CUy0mw5G6RzEmr11xusSOSy0iOxkKPx0Or2V6CwTuo3GGUz0+Sy0mu5W6Ry0mq1lptsCORy0iNx0OAvDOo2V5/vDOCwDmPxkOOy0mj0lWl1lqu4Gap1Viv4mms2l+s3WSPx0SKwDtusiWCwTqQxUGSyUaRykiAvDSp2l+Qx0QdWpRIAAAAS3RSTlMAAAAa4gAAlfAZMRLhuQCV1ZXwGgDwlQCy8MzY2swS2PDqEdUisvDwABn64hEA8CLh+tq5MeoAAPAZ4eKy+tr6uREiMdXq8PDqIhHgP7bQAAAA4ElEQVR42mOw5uBw52cAA351CwUWBttk30p9iIBKTmGcFgNHeEKwlBIfAwOrjmxNQaQoQ0V8TVa9PDMDg7B0RF1MdhSDGJdLfWqVqS6Ta5BfvYAzO1Arp0xVOS8bo3FGtAwnxDBuHhsRBgYNVR5uBihgZAOTTDA+AxMjiDSDCYhzW0kAtTBKGMiJgwUs7cJ8eBkZHfISjTSBXDEu5RT/akVzJo/Q4mgBE3aGisr0OqjDkupyM9MYJEMCY6UcQU73ki3LL1JjMCwtqfWEmO5U6x1gz8Ci4CYkCBEQFBLV0wYAXu4m8P20SwoAAAAASUVORK5CYII=)}\
                .ace_maximizer:hover {opacity: 1}\
            ";
            new MODx.ux.Ace.CodeCompleter(); // Initialize custom code completer (if defined elsewhere)
            var dom = ace.require("ace/lib/dom");
            dom.importCssString(style); // Inject CSS into the document

            // Snippets manager setup
            var snippetManager = ace.require("ace/snippets").snippetManager;
            var snippets = MODx.config['ace.snippets'] || ''; // Get snippets from MODx config
            snippetManager.register(snippetManager.parseSnippetFile(snippets), "_"); // Register snippets

            // Custom Tab handler for snippets
            var HashHandler = ace.require("ace/keyboard/hash_handler").HashHandler;
            var commands = new HashHandler();
            commands.addCommand({
                name: "insertsnippet",
                bindKey: {win: "Tab", mac: "Tab"}, // Bind Tab key
                exec: function(editor) {
                    return snippetManager.expandWithTab(editor); // Expand snippet
                }
            });

            // Function to add the custom Tab handler, also used to overwrite emmet
            var onChangeMode = function(e, target) {
                var editor = target;
                editor.keyBinding.addKeyboardHandler(commands);
            };
            onChangeMode({}, this.editor); // Apply initially

            // Emmet integration
            var Emmet = ace.require("ace/ext/emmet");
            var net = ace.require('ace/lib/net');
            net.loadScript(MODx.config['assets_url'] + 'components/ace/emmet/emmet.js', function() {
                Emmet.setCore(window.emmet); // Set Emmet core
                this.editor.setOption("enableEmmet", true); // Enable Emmet
                this.editor.on("changeMode", onChangeMode); // Re-apply handler on mode change
                onChangeMode({}, this.editor); // Apply again after Emmet is enabled
            }.bind(this));

            ace.require('ace/ext/keybinding_menu').init(this.editor); // Initialize keybinding menu

            MODx.ux.Ace.initialized = true; // Mark as initialized
        }

        // Add custom editor commands
        this.editor.commands.addCommand({
            name: "showKeyboardShortcuts",
            bindKey: {win: "Ctrl-Alt-H", mac: "Command-Alt-H"},
            exec: function(editor) {
                editor.showKeyboardShortcuts();
            },
            readOnly: true
        });

        this.editor.commands.addCommand({
            name: "gotoline",
            bindKey: {win: "Ctrl-L", mac: "Command-Option-L"},
            exec: this.showGotoLineWindow.bind(this),
            readOnly: true
        });

        this.editor.commands.addCommand({
            name: "fullscreen",
            bindKey: {win: "Ctrl-F11", mac: "Command-F12"},
            exec: this.fullScreen.bind(this),
            readOnly: true
        });
    },

    /**
     * Toggles the editor's full screen mode.
     */
    fullScreen : function() {
        if (this.isFullscreen){
            this.maximizer.title = this.maximizeTitle; // Restore maximize title
            this.el.removeClass('ace_maximized'); // Remove maximized class
        } else {
            this.el.addClass('ace_maximized'); // Add maximized class
            this.maximizer.title = this.minimizeTitle; // Set minimize title
        }
        this.isFullscreen = !this.isFullscreen; // Toggle fullscreen state
        this.onResize(); // Trigger resize to adjust editor dimensions
    },

    /**
     * Sets the Ace editor mode based on a MIME type lookup.
     * @param {String} mimeType The MIME type string.
     */
    setMimeType : function (mimeType){
        // Use predefined MIME type mappings or fallback to 'text'
        this.setMode( MODx.ux.Ace.mimeTypes[mimeType] || 'text' );
    },

    /**
     * Displays the "Go to Line" window.
     */
    showGotoLineWindow : function(){
        var window;
        if (!this.windows.gotoLine){
            this.windows.gotoLine = this.createGotoLineWindow(); // Create if it doesn't exist
        }
        window = this.windows.gotoLine;
        window.show(); // Show the window
    },

    /**
     * Executes the "Go to Line" action.
     * Navigates the editor to the specified line number.
     * @private
     */
    doGotoLine : function(){
        var window, line;

        window = this.windows.gotoLine;

        line = window.fp.getForm().getFieldValues('line')['line']; // Get line number from form
        if (!isNaN(line)){
            this.editor.gotoLine(line); // Go to the specified line
            window.hide(); // Hide the window
        }
    },

    /**
     * Creates and returns the "Go to Line" window configuration.
     * @return {Ext.Window} The configured window.
     * @private
     */
    createGotoLineWindow: function () {
        var window = MODx.load({
            xtype: 'modx-window', // Custom MODx window xtype
            title: _('ui_ace.goto_line') // Localized title
            ,resizable: false // Not resizable
            ,maximizable: false // Not maximizable
            ,allowDrop: false // No drag and drop
            ,width: 300 // Fixed width
            ,buttons: [{
                text: _('ui_ace.go') // Localized "Go" button
                ,scope: this
                ,handler: this.doGotoLine // Handler to go to line
            },{
                text: _('ui_ace.close') // Localized "Close" button
                ,scope: this
                ,handler: function() { window.hide(); } // Handler to close window
            }]
            ,keys: [{
                key: Ext.EventObject.ENTER // Enter key binding
                ,fn: this.doGotoLine
                ,scope: this
            }]
            ,action: 'gotoline' // Action identifier
            ,listeners: {
                'hide': {fn: this.focus, scope: this} // Refocus editor when window hides
            }
            ,fields: [{
                xtype: 'textfield' // Input field for line number
                ,validator: function (value) {
                    return !isNaN(value); // Validator for numeric input
                }
                ,fieldLabel: _('ui_ace.goto_line')
                ,name: 'line'
                ,anchor: '100%'
                ,value:  ''
            }]
        });

        return window;
    },

    /**
     * Sets the editor mode, with special handling for MODx tags.
     * @param {String} mode The mode name.
     */
    setMode : function (mode){
        var editor = this.editor;
        if (!this.modxTags) {
            // If MODx tags are not enabled, set mode directly
            return editor.session.setMode('ace/mode/' + mode);
        }

        // If MODx tags are enabled, create a mixed mode
        var config = ace.require('ace/config');
        config.loadModule(["mode", 'ace/mode/' + mode], function(module) {
            var mode = MODx.ux.Ace.createModxMixedMode(module.Mode); // Create mixed mode
            editor.session.setMode(mode); // Set the mixed mode
        }.bind(this));
    }
});

/**
 * Replaces a standard Ext.form.TextArea with a MODx.ux.Ace editor.
 * @param {String} id The ID of the textarea component to replace.
 * @param {String} mimeType The MIME type for the Ace editor.
 * @param {Boolean} modxTags Whether to enable MODx tag parsing.
 */
MODx.ux.Ace.replaceComponent = function(id, mimeType, modxTags) {
    var textArea = Ext.getCmp(id);
    if (!textArea) {
        // Workaround for File Update panel (fix issue, caused by wrong event order)
        return setTimeout(function() {
            var textArea = Ext.getCmp(id);
            if (textArea) {
                MODx.ux.Ace.replaceComponent(id, mimeType, modxTags);
            }
        }, 100); // Retry after a short delay
    }

    var textEditor = MODx.load({
        xtype: 'modx-texteditor', // The custom Ace editor component
        enableKeyEvents: true,
        anchor: textArea.anchor,
        width: 'auto',
        height: parseInt(MODx.config['ace.height']) || textArea.height, // Height from config or original textarea
        name: textArea.name,
        value: textArea.getValue(),
        mimeType: mimeType,
        modxTags: modxTags
    });

    textArea.el.dom.removeAttribute('name'); // Remove name from original textarea
    textArea.el.setStyle('display', 'none'); // Hide original textarea
    textEditor.render(textArea.el.dom.parentNode); // Render new editor in its place

    // Override original textarea's setSize to call editor's setSize
    textArea.setSize = function(){textEditor.setSize.apply(textEditor, arguments)};
    // Forward editor's change event to original textarea
    textEditor.editor.on('change', function(e){textArea.fireEvent('change', e);});
    // Destroy editor when original textarea is destroyed
    textArea.on('destroy', function() {textEditor.destroy();});

    if (!modxTags) {
        return; // No drop target needed if MODx tags are not enabled
    }

    // Create a tree drop target for MODx tags
    var dropTarget = MODx.load({
        xtype: 'modx-treedrop',
        target: textEditor,
        targetEl: textEditor.el,
        onInsert: (function(s){
            this.insertAtCursor(s); // Insert dropped content at cursor
            this.focus(); // Refocus editor
            return true;
        }).bind(textEditor),
        iframe: true
    });
    // Destroy drop target when original textarea is destroyed
    textArea.on('destroy', function() {dropTarget.destroy();});
};

/**
 * Replaces multiple standard textareas with MODx.ux.Ace editors.
 * @param {Array<HTMLTextAreaElement>} textAreas An array of HTML textarea elements.
 * @param {String} mimeType The MIME type for the Ace editor.
 */
MODx.ux.Ace.replaceTextAreas = function(textAreas, mimeType) {
    textAreas.forEach(function(textArea){
        var editor = MODx.load({
            xtype: 'modx-texteditor',
            width: 'auto',
            height: parseInt(textArea.style.height) || 200, // Height from style or default 200px
            name: textArea.name,
            value: textArea.value,
            mimeType: mimeType || 'text/html', // Default to 'text/html' if not provided
            modxTags: true
        });

        textArea.name = ''; // Clear name of original textarea
        textArea.style.display = 'none'; // Hide original textarea

        editor.render(textArea.parentNode); // Render new editor
        editor.editor.on('change', function(e){ MODx.fireResourceFormChange() }); // Fire MODx form change event
    });
};

/**
 * Creates a mixed Ace mode that supports MODx tags.
 * This function wraps an existing Ace mode to add MODx tag highlighting.
 * @param {Object} Mode The original Ace mode constructor.
 * @return {Function} A new mixed mode constructor.
 */
MODx.ux.Ace.createModxMixedMode = function(Mode) {
    function ModxMixedMode() {
        Mode.call(this); // Call the original mode constructor
        var HighlightRules = this.HighlightRules; // Get original highlight rules

        function ModxMixedHighlightRules() {
            HighlightRules.call(this); // Call original highlight rules constructor

            // Define custom rules for MODx comment tags
            this.$rules['modxtag-comment'] = [
                {