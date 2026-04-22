class EnhancedEditorField {
    constructor(displayConfiguration) {
        this.minHeightPixels = displayConfiguration.minHeightPixels || 60;
        this.maxHeightPixels = displayConfiguration.maxHeightPixels || 1000;
        this.syntaxMode = displayConfiguration.syntaxMode || 'text/plain';
        this.displayTheme = displayConfiguration.displayTheme || 'default';
        this.displayWhitespace = displayConfiguration.displayWhitespace || false;
        this.cursorStyle = displayConfiguration.cursorStyle || 'block';
        this.scrollSensitivity = displayConfiguration.scrollSensitivity || 3; // CodeMirror doesn't have direct equivalent
        this.enableFolding = displayConfiguration.enableFolding || true;
        this.softTabsEnabled = displayConfiguration.softTabsEnabled || true;
        this.tabSpaceCount = displayConfiguration.tabSpaceCount || 4;
        this.wrapLinesEnabled = displayConfiguration.wrapLinesEnabled || false;
        this.textRenderSize = displayConfiguration.textRenderSize || '13px';
        this.initialContent = displayConfiguration.initialContent || '';
        this.customStyle = displayConfiguration.customStyle || 'padding:0';
        this.componentName = displayConfiguration.componentName || '';
        this.growFeatureActive = displayConfiguration.growFeatureActive || false;

        this.mainContainerElement = null;
        this.hiddenInputControl = null;
        this.codeMirrorInstance = null;
        this.lastMeasuredHeight = 0;
        this._changeTimeout = null;

        this.initializeComponent();
    }

    initializeComponent() {
        this.hiddenInputControl = document.createElement('input');
        this.hiddenInputControl.type = 'hidden';
        this.hiddenInputControl.name = this.componentName;
        this.hiddenInputControl.value = this.initialContent;
    }

    renderComponent(targetElement, insertPosition) {
        if (!this.mainContainerElement) {
            this.mainContainerElement = document.createElement('div');
            this.mainContainerElement.className = 'editor-wrapper-container';
            this.mainContainerElement.style.cssText = `width:100%;height:60px;${this.customStyle}`;
        }

        if (targetElement) {
            if (insertPosition === undefined || insertPosition === null) {
                targetElement.appendChild(this.mainContainerElement);
            } else {
                targetElement.insertBefore(this.mainContainerElement, targetElement.children[insertPosition]);
            }
        }

        this.codeMirrorInstance = CodeMirror(this.mainContainerElement, {
            value: this.hiddenInputControl.value,
            mode: this.syntaxMode,
            theme: this.displayTheme,
            lineNumbers: true,
            showInvisibles: this.displayWhitespace,
            selectionStyle: this.cursorStyle,
            foldGutter: this.enableFolding,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            indentWithTabs: !this.softTabsEnabled,
            tabSize: this.tabSpaceCount,
            lineWrapping: this.wrapLinesEnabled,
            extraKeys: { "Ctrl-Space": "autocomplete" }, // Requires CodeMirror 'show-hint' addon
            autoCloseTags: true, // Requires CodeMirror 'closetag' addon
            autoCloseBrackets: true, // Requires CodeMirror 'closebrackets' addon
            matchBrackets: true, // Requires CodeMirror 'matchbrackets' addon
            matchTags: true // Requires CodeMirror 'matchtags' addon
        });

        this.mainContainerElement.appendChild(this.hiddenInputControl);
        this.mainContainerElement.style.fontSize = this.textRenderSize;

        if (this.growFeatureActive) {
            this.mainContainerElement.style.height = `${this.minHeightPixels}px`;
            this.codeMirrorInstance.setSize(null, this.minHeightPixels);
        } else if (displayConfiguration.height) { // For fixed height cases
             this.codeMirrorInstance.setSize(null, displayConfiguration.height);
        }

        this.attachEventHandlers();
        this.codeMirrorInstance.on('change', this.handleContentChange.bind(this));
        this.codeMirrorInstance.on('focus', this.handleFocus.bind(this));
        this.codeMirrorInstance.on('blur', this.handleBlur.bind(this));

        this.performAutoSize();
    }

    attachEventHandlers() {
        // Base class does not have specific event handlers to attach
    }

    handleContentChange() {
        clearTimeout(this._changeTimeout);
        this._changeTimeout = setTimeout(() => {
            this.hiddenInputControl.value = this.codeMirrorInstance.getValue();
            this.dispatchComponentEvent('contentupdated', this.hiddenInputControl.value);
            this.performAutoSize();
        }, 10);
    }

    handleFocus() {
        this.dispatchComponentEvent('componentfocused');
    }

    handleBlur() {
        this.dispatchComponentEvent('componentblurred');
    }

    destroyComponent() {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.toTextArea(); // If initialized from textarea
            if (this.mainContainerElement && this.mainContainerElement.parentNode) {
                this.mainContainerElement.parentNode.removeChild(this.mainContainerElement);
            }
            this.codeMirrorInstance = null;
        }
        this.dispatchComponentEvent('componentdestroyed');
    }

    isValid() {
        return true;
    }

    getValidationErrors(currentValue) {
        return null;
    }

    handleResize() {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.refresh();
        }
    }

    performAutoSize() {
        if (!this.growFeatureActive || !this.codeMirrorInstance) {
            return;
        }
        const linesCount = this.codeMirrorInstance.lineCount();
        const lineHeight = this.codeMirrorInstance.defaultTextHeight();
        const scrollbarWidth = this.codeMirrorInstance.getScrollInfo().width > 0 ? CodeMirror.scrollbarWidth : 0;
        const containerBorderWidth = 0;

        let calculatedHeight = Math.min(
            this.maxHeightPixels,
            Math.max(linesCount * lineHeight + scrollbarWidth + containerBorderWidth, this.minHeightPixels)
        );

        calculatedHeight = Math.max(calculatedHeight, this.minHeightPixels);

        if (calculatedHeight !== this.lastMeasuredHeight) {
            this.lastMeasuredHeight = calculatedHeight;
            this.codeMirrorInstance.setSize(null, calculatedHeight);
            this.dispatchComponentEvent("autosizefinished", calculatedHeight);
        }
    }

    setDimensions(newWidth, newHeight) {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.setSize(newWidth, newHeight);
            this.handleResize();
        }
    }

    getCurrentValue() {
        return this.hiddenInputControl.value;
    }

    updateContent(newValue) {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.setValue(newValue);
        }
        this.hiddenInputControl.value = newValue;
        this.initialContent = newValue;
    }

    updateSyntaxMode(newMode) {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.setOption('mode', newMode);
        }
    }

    updateDisplayTheme(newTheme) {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.setOption('theme', newTheme);
        }
    }

    updateFontSize(newSize) {
        if (this.mainContainerElement) {
            this.mainContainerElement.style.fontSize = newSize;
            this.handleResize();
        }
    }

    showHiddenCharacters(shouldShow) {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.setOption('showInvisibles', shouldShow);
        }
    }

    setSelectionBehavior(style) {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.setOption('selectionStyle', style);
        }
    }

    setScrollSensitivity(speed) {
        this.scrollSensitivity = speed;
    }

    toggleFoldingWidgets(shouldShow) {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.setOption('foldGutter', shouldShow);
            this.codeMirrorInstance.setOption('gutters', shouldShow ? ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'] : ['CodeMirror-linenumbers']);
        }
    }

    toggleSoftTabs(shouldUse) {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.setOption('indentWithTabs', !shouldUse);
        }
    }

    toggleLineWrapping(shouldWrap) {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.setOption('lineWrapping', shouldWrap);
        }
    }

    insertTextAtCursor(textValue) {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.replaceSelection(textValue);
        }
    }

    gainFocus() {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.focus();
        }
    }

    loseFocus() {
        if (this.codeMirrorInstance) {
            this.codeMirrorInstance.getInputField().blur();
        }
    }

    dispatchComponentEvent(eventName, detail) {
        const customEvent = new CustomEvent(eventName, { detail: detail });
        this.mainContainerElement.dispatchEvent(customEvent);
    }
}

const ApplicationConfig = {
    'platform.theme': 'material',
    'platform.font_size': '14px',
    'platform.word_wrap': true,
    'platform.soft_tabs': true,
    'platform.tab_size': 2,
    'platform.fold_widgets': true,
    'platform.show_invisibles': false,
    'platform.assets_url': '/static/editors/',
    'platform.editor_height': 300,
    'platform.snippets': 'mySnippet:<h1>Hello Snippet!</h1>\nexample:console.log("Example Code");',
    'platform.mixed_mode_enabled': true
};

const getLabel = (key) => {
    const labels = {
        'ui_editor.maximize': 'Maximize',
        'ui_editor.minimize': 'Minimize',
        'ui_editor.goto_line': 'Go to line',
        'ui_editor.jump': 'Jump',
        'ui_editor.close': 'Close'
    };
    return labels[key] || key;
};

const SyntaxModeMap = {
    'text/html': 'htmlmixed',
    'text/css': 'css',
    'application/javascript': 'javascript',
    'text/x-php': 'php',
    'text/xml': 'xml',
    'text/plain': 'text/plain',
};

class ModalWindow {
    constructor(configData) {
        this.title = configData.title || 'Window';
        this.resizable = configData.resizable !== false;
        this.maximizable = configData.maximizable !== false;
        this.allowDrop = configData.allowDrop !== false;
        this.width = configData.width || 400;
        this.buttons = configData.buttons || [];
        this.keyboardShortcuts = configData.keys || [];
        this.eventListeners = configData.listeners || {};
        this.formFields = configData.fields || [];

        this.dialogElement = null;
        this.formElement = null;
        this.overlayElement = null;
        this.onHideCallback = null;

        this.buildWindow();
        this.attachWindowEvents();
    }

    buildWindow() {
        this.dialogElement = document.createElement('div');
        this.dialogElement.className = 'custom-modal-window';
        this.dialogElement.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; border: 1px solid #ccc; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 9999; padding: 15px; width: ${this.width}px; max-width: 90vw;
            display: none;
        `;
        document.body.appendChild(this.dialogElement);

        const titleBar = document.createElement('div');
        titleBar.className = 'custom-modal-title';
        titleBar.textContent = this.title;
        titleBar.style.cssText = 'font-weight: bold; margin-bottom: 10px;';
        this.dialogElement.appendChild(titleBar);

        this.formElement = document.createElement('form');
        this.dialogElement.appendChild(this.formElement);

        this.formFields.forEach(fieldConfig => {
            const label = document.createElement('label');
            label.textContent = fieldConfig.fieldLabel + ':';
            label.style.display = 'block';
            this.formElement.appendChild(label);

            const input = document.createElement('input');
            input.type = fieldConfig.xtype === 'textfield' ? 'text' : 'hidden';
            input.name = fieldConfig.name;
            input.value = fieldConfig.value || '';
            input.style.cssText = 'width: 100%; padding: 5px; margin-bottom: 10px; border: 1px solid #ddd;';
            this.formElement.appendChild(input);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'text-align: right; margin-top: 15px;';
        this.dialogElement.appendChild(buttonContainer);

        this.buttons.forEach(btnConfig => {
            const button = document.createElement('button');
            button.textContent = btnConfig.text;
            button.style.cssText = 'margin-left: 10px; padding: 8px 15px; cursor: pointer; background: #eee; border: 1px solid #ccc;';
            button.onclick = (e) => {
                e.preventDefault();
                if (btnConfig.handler) {
                    btnConfig.handler.call(btnConfig.scope || this);
                }
            };
            buttonContainer.appendChild(button);
        });

        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'custom-modal-overlay';
        this.overlayElement.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); z-index: 9998; display: none;
        `;
        document.body.appendChild(this.overlayElement);
    }

    attachWindowEvents() {
        this.keyboardShortcuts.forEach(shortcut => {
            document.addEventListener('keydown', (e) => {
                if (this.dialogElement.style.display === 'block' && e.key === shortcut.key && shortcut.fn) {
                    e.preventDefault();
                    shortcut.fn.call(shortcut.scope || this);
                }
            });
        });

        if (this.eventListeners.hide) {
            this.onHideCallback = this.eventListeners.hide.fn.bind(this.eventListeners.hide.scope || this);
        }
    }

    show() {
        this.dialogElement.style.display = 'block';
        this.overlayElement.style.display = 'block';
        const firstInput = this.formElement.querySelector('input[type="text"]');
        if (firstInput) firstInput.focus();
    }

    hide() {
        this.dialogElement.style.display = 'none';
        this.overlayElement.style.display = 'none';
        if (this.onHideCallback) {
            this.onHideCallback();
        }
    }

    getFormValues() {
        const values = {};
        Array.from(this.formElement.elements).forEach(element => {
            if (element.name) {
                values[element.name] = element.value;
            }
        });
        return values;
    }

    destroy() {
        if (this.dialogElement && this.dialogElement.parentNode) {
            this.dialogElement.parentNode.removeChild(this.dialogElement);
        }
        if (this.overlayElement && this.overlayElement.parentNode) {
            this.overlayElement.parentNode.removeChild(this.overlayElement);
        }
    }
}

const EmmetIntegration = {
    setup: (editorInstance, config) => {
        // In CodeMirror, Emmet is typically a separate addon that needs to be loaded.
        // This function represents its conceptual initialization.
        // E.g., CodeMirror.require('emmet').setup(editorInstance, config);
        console.log("Emmet integration configured for CodeMirror.", config);
    }
};

const SnippetManager = {
    _registeredSnippets: {},
    register: (snippetContent, modeIdentifier) => {
        const lines = snippetContent.split('\n');
        SnippetManager._registeredSnippets[modeIdentifier] = SnippetManager._registeredSnippets[modeIdentifier] || {};
        lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                SnippetManager._registeredSnippets[modeIdentifier][parts[0]] = parts.slice(1).join(':');
            }
        });
    },
    expandWithTab: (editorInstance) => {
        const cursorPosition = editorInstance.getCursor();
        const lineText = editorInstance.getLine(cursorPosition.line);
        const wordRange = editorInstance.findWordAt(cursorPosition);
        const currentToken = lineText.substring(wordRange.anchor.ch, wordRange.head.ch);

        const currentMode = editorInstance.getOption('mode');
        const applicableSnippets = SnippetManager._registeredSnippets[currentMode] || SnippetManager._registeredSnippets['_'] || {};

        if (applicableSnippets[currentToken]) {
            editorInstance.replaceRange(applicableSnippets[currentToken], wordRange.anchor, wordRange.head);
            return true;
        }
        return false;
    }
};

const ModeFactory = {
    createMixedMode: (baseModeName) => {
        CodeMirror.defineMode("customMixedMode", function(config, parserConfig) {
            const baseMode = CodeMirror.getMode(config, baseModeName);
            // Example of a simple custom tag mode for CodeMirror
            CodeMirror.defineMode("platform-tag-mode", function() {
                return {
                    token: function(stream) {
                        if (stream.match(/\[\[\w+.*?\]\]/)) {
                            return "platform-tag";
                        }
                        while (stream.next() != null && !stream.match(/\[\[/, false)) {}
                        return null;
                    }
                };
            });

            return CodeMirror.multiplexingMode(
                baseMode,
                {
                    open: "[[", close: "]]",
                    mode: CodeMirror.getMode(config, "platform-tag-mode"),
                    delimStyle: "platform-tag-delimiter"
                }
            );
        });

        // Inject CSS for custom highlighting
        if (!document.getElementById('platform-editor-mixed-mode-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'platform-editor-mixed-mode-styles';
            styleElement.textContent = `
                .cm-platform-tag { color: #A0522D; font-weight: bold; background-color: #FFF8E1; }
                .cm-platform-tag-delimiter { color: #A0522D; }
            `;
            document.head.appendChild(styleElement);
        }
        return "customMixedMode";
    }
};

class PlatformSpecificEditor extends EnhancedEditorField {
    constructor(config) {
        const mergedConfig = {
            syntaxMode: SyntaxModeMap[config.mimeType] || 'text/plain',
            displayTheme: ApplicationConfig['platform.theme'] || 'default',
            textRenderSize: ApplicationConfig['platform.font_size'] || '13px',
            wrapLinesEnabled: ApplicationConfig['platform.word_wrap'] === true,
            softTabsEnabled: ApplicationConfig['platform.soft_tabs'] === true,
            tabSpaceCount: ApplicationConfig['platform.tab_size'] * 1 || 4,
            enableFolding: ApplicationConfig['platform.fold_widgets'] === true,
            displayWhitespace: ApplicationConfig['platform.show_invisibles'] === true,
            platformTagsEnabled: config.modxTagsEnabled || false,
            ...config
        };
        super(mergedConfig);

        this.dialogInstances = {};
        this.isCurrentlyFullScreen = false;
        this.fullScreenToggleElement = null;
        this.maximizeLabel = getLabel('ui_editor.maximize');
        this.minimizeLabel = getLabel('ui_editor.minimize');
    }

    initializeComponent() {
        super.initializeComponent();
        console.log(`CodeMirror asset path configured for: ${ApplicationConfig['platform.assets_url']}`);
    }

    renderComponent(targetElement, insertPosition) {
        super.renderComponent(targetElement, insertPosition);

        if (!PlatformSpecificEditor.isGlobalCssInitialized) {
            const style = `
                .editor-fullscreen-active {
                    position: fixed; border: none; top: 0; left: 0; right: 0; bottom: 0;
                    width: auto !important; height: auto !important; z-index: 10000;
                    margin: 0 !important; padding: 0 !important;
                }
                .fullscreen-toggle-button {
                    position: absolute; width: 16px; height: 16px; top: 3px; right: 3px;
                    opacity: 0.7; z-index: 10; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABgFBMVEVmrBxkqxpjqhlkqxprryFnrB1kqxtkqxp6uzJiqRhZow9kqxpmrBxlrBtnrBxjqhlmrBxlrBtnrBxjqhptsSNkqhplqxt4tyxkqhlmrB1mrBx5uzJmrBxorR9orR5nrB1kqhlorR14uS5mrRxhqBhmrR1aoxBlqxt3titusiRlqxpiqRd4ty1rrh9hqBdjqxp3tSpaow9mrR15ujBorh5lrBxapRFmrBxkqhpjqhp5uzBhqRdnrB1rsCJlrBt6vDNorh93tipmqxxhqRhapBFbpRJnrR1mrB14uC1usiVnrB1apRFhqReq1VmLxUGv5Gyt3GOs22Cm0FKn2FyUzUyRykev4WmUz1CUy0mw5G6RzEmr11xusSOSy0iOxkKPx0Or2V6CwTuo3GGUz0+Sy0mu5W6Ry0mq1lptsCORy0iNx0OAvDOo2V5/vDOCwDmPxkOOy0mj0lWl1lqu4Gap1Viv4mms2l+s3WSPx0SKwDtusiWCwTqQxUGSyUaRykiAvDSp2l+Qx0QdWpRIAAAAS3RSTlMAAAAa4gAAlfAZMRLhuQCV1ZXwGgDwlQCy8MzY2swS2PDqEdUisvDwABn64hEA8CLh+tq5MeoAAPAZ4eKy+tr6uREiMdXq8PDqIhHgP7bQAAAA4ElEQVR42mOw5uBw52cAA351CwUWBttk30p9iIBKTmGcFgNHeEKwlBIfAwOrjmxNQaQoQ0V8TVa9PDMDg7B0RF1MdhSDGJdLfWqVqS6Ta5BfvYAzO1Arp0xVOS8bo3FGtAwnxDBuHhsRBgYNVR5uBihgZAOTTDA+AxMjiDSDCYhzW0kAtTBKGMiJgwUs7cJ8eBkZHfISjTSBXDEu5RT/akVzJo/Q4mgBE3aGisr0OqjDkupyM9MYJEMCY6UcQU73ki3LL1JjMCwtqfWEmO5U6x1gz8Ci4CYkCBEQFBLV0wYAXu4m8P20SwoAAAAASUVORK5CYII=); background-size: contain; }
                .fullscreen-toggle-button:hover { opacity: 1; }
            `;
            const styleElement = document.createElement('style');
            styleElement.textContent = style;
            document.head.appendChild(styleElement);
            PlatformSpecificEditor.isGlobalCssInitialized = true;
        }

        this.fullScreenToggleElement = document.createElement('div');
        this.fullScreenToggleElement.title = this.maximizeLabel;
        this.fullScreenToggleElement.className = 'fullscreen-toggle-button';
        this.fullScreenToggleElement.addEventListener('mousedown', (e) => e.preventDefault());
        this.fullScreenToggleElement.addEventListener('click', (e) => {
            this.toggleFullScreen();
            e.preventDefault();
        });
        this.mainContainerElement.querySelector('.CodeMirror-scroll').appendChild(this.fullScreenToggleElement);

        this.setEditorSyntaxMode(this.syntaxMode, this.platformTagsEnabled);

        SnippetManager.register(ApplicationConfig['platform.snippets'], "_");

        this.codeMirrorInstance.setOption('extraKeys', {
            ...this.codeMirrorInstance.getOption('extraKeys'),
            "Tab": (cm) => {
                if (!SnippetManager.expandWithTab(cm)) {
                    cm.execCommand("indentMore");
                }
            },
            "Ctrl-L": this.showLineJumpDialog.bind(this),
            "Cmd-L": this.showLineJumpDialog.bind(this),
            "Ctrl-F11": this.toggleFullScreen.bind(this),
            "Cmd-F12": this.toggleFullScreen.bind(this),
            "Ctrl-Alt-H": this.showKeyboardShortcutsHelper.bind(this),
            "Cmd-Alt-H": this.showKeyboardShortcutsHelper.bind(this)
        });

        EmmetIntegration.setup(this.codeMirrorInstance, {});
        // CodeMirror's Emmet addon would typically be enabled via `setOption` if available
        // this.codeMirrorInstance.setOption("enableEmmet", true);
    }

    destroyComponent() {
        super.destroyComponent();
        Object.values(this.dialogInstances).forEach(dialog => dialog.destroy());
    }

    toggleFullScreen() {
        if (this.isCurrentlyFullScreen) {
            this.fullScreenToggleElement.title = this.maximizeLabel;
            this.mainContainerElement.classList.remove('editor-fullscreen-active');
            document.body.style.overflow = '';
        } else {
            this.mainContainerElement.classList.add('editor-fullscreen-active');
            this.fullScreenToggleElement.title = this.minimizeLabel;
            document.body.style.overflow = 'hidden';
        }
        this.isCurrentlyFullScreen = !this.isCurrentlyFullScreen;
        this.handleResize();
    }

    setEditorSyntaxMode(currentMimeType, enablePlatformTags = false) {
        let finalMode = SyntaxModeMap[currentMimeType] || 'text/plain';

        if (enablePlatformTags && ApplicationConfig['platform.mixed_mode_enabled']) {
            finalMode = ModeFactory.createMixedMode(finalMode);
        }
        this.updateSyntaxMode(finalMode);
    }

    showLineJumpDialog() {
        if (!this.dialogInstances.lineJump) {
            this.dialogInstances.lineJump = new ModalWindow({
                title: getLabel('ui_editor.goto_line'),
                resizable: false,
                maximizable: false,
                allowDrop: false,
                width: 300,
                buttons: [{
                    text: getLabel('ui_editor.jump'),
                    scope: this,
                    handler: this.performLineJump
                }, {
                    text: getLabel('ui_editor.close'),
                    scope: this,
                    handler: function() { this.dialogInstances.lineJump.hide(); }.bind(this)
                }],
                keys: [{
                    key: 'Enter',
                    fn: this.performLineJump,
                    scope: this
                }],
                listeners: {
                    'hide': { fn: this.gainFocus, scope: this }
                },
                fields: [{
                    xtype: 'textfield',
                    fieldLabel: getLabel('ui_editor.goto_line'),
                    name: 'targetLine',
                    value: ''
                }]
            });
        }
        this.dialogInstances.lineJump.show();
    }

    performLineJump() {
        const dialog = this.dialogInstances.lineJump;
        const values = dialog.getFormValues();
        const lineNumber = parseInt(values['targetLine'], 10);

        const inputField = dialog.formElement.querySelector('input[name="targetLine"]');
        if (isNaN(lineNumber) || lineNumber <= 0 || lineNumber > this.codeMirrorInstance.lineCount()) {
            inputField.style.borderColor = 'red';
            alert('Invalid line number. Please enter a positive number within the document\'s range.');
            return;
        }
        inputField.style.borderColor = '#ddd';

        if (this.codeMirrorInstance && !isNaN(lineNumber)) {
            this.codeMirrorInstance.setCursor({ line: lineNumber - 1, ch: 0 });
            this.codeMirrorInstance.focus();
            dialog.hide();
        }
    }

    showKeyboardShortcutsHelper() {
        alert("Keyboard Shortcuts:\n" +
              "Tab: Expand Snippet / Indent\n" +
              "Ctrl-L / Cmd-L: Go to Line\n" +
              "Ctrl-F11 / Cmd-F12: Toggle Fullscreen\n" +
              "Ctrl-Alt-H / Cmd-Alt-H: Show this helper");
        this.gainFocus();
    }
}

PlatformSpecificEditor.isGlobalCssInitialized = false;

const ComponentReplacer = {
    swapWithEditor: (targetElementId, mimeType, enablePlatformTags) => {
        const originalTextArea = document.getElementById(targetElementId);
        if (!originalTextArea) {
            return setTimeout(() => {
                const retryTextArea = document.getElementById(targetElementId);
                if (retryTextArea) ComponentReplacer.swapWithEditor(targetElementId, mimeType, enablePlatformTags);
            }, 100);
        }

        const editorHeight = parseInt(ApplicationConfig['platform.editor_height']) || originalTextArea.offsetHeight;

        const newEditor = new PlatformSpecificEditor({
            componentName: originalTextArea.name,
            initialContent: originalTextArea.value,
            mimeType: mimeType,
            modxTagsEnabled: enablePlatformTags,
            growFeatureActive: false,
            height: editorHeight
        });

        originalTextArea.style.display = 'none';
        originalTextArea.removeAttribute('name');

        newEditor.renderComponent(originalTextArea.parentNode, Array.from(originalTextArea.parentNode.children).indexOf(originalTextArea) + 1);

        newEditor.mainContainerElement.addEventListener('contentupdated', (e) => {
            originalTextArea.value = e.detail;
            originalTextArea.dispatchEvent(new Event('change', { bubbles: true }));
        });

        originalTextArea.addEventListener('destroy-component', () => {
            newEditor.destroyComponent();
        });

        if (enablePlatformTags) {
            const dropHandler = (e) => {
                e.preventDefault();
                const droppedText = e.dataTransfer.getData('text/plain');
                if (droppedText) {
                    newEditor.insertTextAtCursor(droppedText);
                    newEditor.gainFocus();
                }
            };
            newEditor.mainContainerElement.addEventListener('dragover', (e) => e.preventDefault());
            newEditor.mainContainerElement.addEventListener('drop', dropHandler);

            originalTextArea.addEventListener('destroy-component', () => {
                newEditor.mainContainerElement.removeEventListener('drop', dropHandler);
                newEditor.mainContainerElement.removeEventListener('dragover', (e) => e.preventDefault());
            });
        }
        return newEditor;
    },

    processTextAreas: (textAreasCollection, defaultMimeType) => {
        textAreasCollection.forEach(textArea => {
            const editorHeight = parseInt(textArea.style.height) || 200;

            const newEditor = new PlatformSpecificEditor({
                componentName: textArea.name,
                initialContent: textArea.value,
                mimeType: defaultMimeType || 'text/html',
                modxTagsEnabled: true,
                growFeatureActive: false,
                height: editorHeight
            });

            textArea.name = '';
            textArea.style.display = 'none';

            newEditor.renderComponent(textArea.parentNode, Array.from(textArea.parentNode.children).indexOf(textArea) + 1);

            newEditor.mainContainerElement.addEventListener('contentupdated', (e) => {
                textArea.value = e.detail;
                document.dispatchEvent(new CustomEvent('resourceformchanged'));
            });
        });
    }
};