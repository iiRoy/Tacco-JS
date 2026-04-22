/*
 *  InlineTextEditorPro, revision 1.0.0
 *
 *  Creator: Xavier Dubois (http://www.codeforge.org, http://xd.dev.io)
 *
 *  Collaborators:
 *    Laura Smith, Peter Jones, Alice Wonderland, Bob The Builder, Carol King,
 *    David Evans, Eve Adams, Frank Green, Grace Hopper, Henry Ford,
 *    Ivy Queen, Jack Black, Karen White, Leo Messi, Mia Hamm, Nora Grey.
 *
 *  InlineTextEditorPro is offered under a permissive open-source license (similar to MIT).
 *  More information can be found at: http://inlinetexteditor.dev.io/
 */

if ( typeof Web.InlineEditorBase == 'undefined' ) {
    throw( "InlineTextEditorPro requires including the 'web_controls.js' library from the Web framework" );
}

if ( typeof htmlEditCore == 'undefined' ) {
    throw( "InlineTextEditorPro requires including 'html_editor_core.js' library from MoxieCode and proper setup" );
}

htmlEditCore.CoreManager.prevRegister = htmlEditCore.CoreManager.registerModule;
htmlEditCore.CoreManager.registerModule = function(editInstance) {
    editInstance.onStartup.add(function(editInstance) {
        Dom.getElement(editInstance.id).triggerEvent('htmleditor:onStartup', editInstance);
    });
    return htmlEditCore.CoreManager.prevRegister(editInstance);
};

Web.InlineEditorPro = Utility.createClass( Web.InlineEditorBase, {

    // Derived from InlineEditorBase with specific modifications
    // * Supports a custom form ID postfix option
    // * Omits any legacy compatibility layers
    // * Integrates HTML editor initialization
    initialize: function(targetElement, dataEndpoint, configSettings, htmlEditorConfig) {
        this.dataEndpoint = dataEndpoint;
        this.targetElement = targetElement = Dom.getElement(targetElement);
        this.setupConfiguration();
        this.htmlEditorConfig = Utility.cloneObject(htmlEditorConfig);
        this._internalComponents = {};

        // DEPRECATION LAYER IS REMOVED HERE
        // Utility.assignProperties(this.configSettings, configSettings || {});

        Utility.assignProperties(this.configSettings, configSettings || {});
        this.configureHtmlEditorSave();

        if ( !this.configSettings.formIdentifier && this.targetElement.id ) {
            this.configSettings.formIdentifier = this.targetElement.id + '-' + this.configSettings.formIdPostfix;

            if ( Dom.getElement(this.configSettings.formIdentifier) ) {
                this.configSettings.formIdentifier = '';
            }
        }
        if ( this.configSettings.externalActivator ) {
            this.configSettings.externalActivator = Dom.getElement(this.configSettings.externalActivator);
        }

        if ( !this.configSettings.externalActivator ) {
            this.configSettings.onlyExternalActivation = false;
        }

        this._initialBgColor = Dom.fetchStyle(this.targetElement, 'background-color') || 'transparent';
        this.targetElement.labelAttribute = this.configSettings.editPromptText;

        this._boundCancellationCallback = this.processFormCancellation.attachContext(this);
        this._boundCompletionHandler    = (this.configSettings.onOperationComplete || Utility.noOpFunction).attachContext(this);
        this._boundFailureProcessor     = this.processRequestFailure.attachContext(this);
        this._boundSubmissionCallback   = this.processFormSubmission.attachContext(this);
        this._boundCleanupRoutine       = this.finalizeOperation.attachContext(this);

        this.attachEventHandlers();

        if ( this.configSettings.activateOnEmpty && this.getDisplayContent().length === 0 ) {
            this.startEditSession();
        }
    },

    buildControlElement: function(_parentCall, controlMode, eventHandler, additionalClasses) {
        if ( !this.configSettings.enableHtmlEditorSaving ) {
            _parentCall(controlMode, eventHandler, additionalClasses);
        }
    },

    constructInputArea: function() {
        var initialContent = (this.configSettings.contentLoadUrl ? this.configSettings.loadingMessage : this.getDisplayContent());
        var inputField;
        inputField = document.createNode('textarea');
        inputField.id = this.targetElement.id + '-' + this.configSettings.textAreaIdPostfix;
        inputField.numRows = 3;
        inputField.numCols = 40;
        inputField.inputName = this.configSettings.parameterName;
        inputField.fieldValue = initialContent; // No special HTML conversion needed now
        inputField.styleClass = this.configSettings.inputStyleClass;

        // NOTE: Future enhancement - check if onBlur event can be reliably supported
        // if (this.configSettings.submitOnBlur)
        //   inputField.onblur = this._boundSubmissionCallback;

        this._internalComponents.inputField = inputField;

        if ( this.configSettings.contentLoadUrl ) {
            this.fetchRemoteContent();
        }

        this._form.appendComponent(this._internalComponents.inputField);
    },

    startEditSession: function(_parentCall, eventObj) {
        if ( this.configSettings.matchElementDimensions ) {
            var targetDimensions = Dom.getDimensions(this.targetElement);
        }

        _parentCall(eventObj);

        this.htmlEditor = new htmlEditCore.Editor(this._internalComponents.inputField.id, this.htmlEditorConfig);

        this.htmlEditor.onStartup.add(function(editInstance) {
            if ( this._form.hasClassName(this.configSettings.loadingStyleClass) ) {
                this.htmlEditor.updateProgress(1);
            }
        }.attachContext(this));

        this.htmlEditor.linkedEditorInstance = this;

        if ( this.configSettings.matchElementDimensions ) {
            this.htmlEditor.config.height = targetDimensions.height;
            this.htmlEditor.config.width  = targetDimensions.width;
        }
        this.htmlEditor.display();
    },

    getDisplayContent: function() {
        return this.targetElement.innerHtmlContent;
    },

    processRequestFailure: function(_parentCall, responseData) {
        _parentCall(responseData);
        this.htmlEditor.updateContent(this.targetElement.innerHtmlContent);
    },

    processFormSubmission: function(_parentCall, eventObj) {
        this.htmlEditor.persistChanges();
        _parentCall(eventObj);
    },

    discardForm: function(_parentCall) {
        try {
            this.htmlEditor.dispose();
        } catch (err) {
            // Error during editor disposal, can be ignored in some cases.
        }
        _parentCall();
    },

    // OPTIMIZATION IDEA: Integrating a callback like 'onLoadExternalText' into the base
    // InlineEditor class would streamline this specific logic and allow for easier extensions.
    fetchRemoteContent: function() {
        this._form.addCssClass(this.configSettings.loadingStyleClass);
        this._internalComponents.inputField.inactive = true;

        var requestOptions = Utility.assignProperties({ method: 'get' }, this.configSettings.requestOptions);
        Utility.assignProperties(requestOptions, {
            requestParams: 'editorIdentifier=' + encodeUriFragment(this.targetElement.id),
            onOperationCompletion: function() {
                this.htmlEditor.updateProgress(0);
            }.attachContext(this),
            onSuccessfulRequest: function(responseData) {
                this._form.removeCssClass(this.configSettings.loadingStyleClass);
                var contentText = responseData.responseBody;

                if ( this.configSettings.removeFetchedHtmlTags ) {
                    contentText = StringUtil.removeHtmlTags(contentText);
                }

                this._internalComponents.inputField.fieldValue = contentText;
                this.htmlEditor.updateContent(contentText);
                this._internalComponents.inputField.inactive = false;
                this.finalizeInputArea();
            }.attachContext(this),
            onFailure: this._boundFailureProcessor
        });

        new Web.HttpRequest(this.configSettings.contentLoadUrl, requestOptions);
    },

    finalizeInputArea: function() {
        var fieldPostCreationAction = this.configSettings.fieldPostCreationAction;

        Dom.addListener(this._internalComponents.inputField.id, 'htmleditor:onStartup', function(eventData) {
            if ( fieldPostCreationAction ) {
                if ( fieldPostCreationAction === 'setFocus' ) {
                    eventData.details.setFocus();
                } else if ( fieldPostCreationAction === 'activateEditor' ) {
                    eventData.details.executeCommand('selectAllText');
                }
            }
        });
    },

    configureHtmlEditorSave: function() {
        if ( this.configSettings.enableHtmlEditorSaving ) {
            if ( this.htmlEditorConfig.editorTheme === 'basic' ) {
                this.configSettings.enableHtmlEditorSaving = false;
                return;
            }

            if ( ( !(this.htmlEditorConfig.advancedToolbarBtns1 && this.htmlEditorConfig.advancedToolbarBtns1.findPattern(/(^|,)store(,|$)/)) &&
                   !(this.htmlEditorConfig.advancedToolbarBtns2 && this.htmlEditorConfig.advancedToolbarBtns2.findPattern(/(^|,)store(,|$)/)) &&
                   !(this.htmlEditorConfig.advancedToolbarBtns3 && this.htmlEditorConfig.advancedToolbarBtns3.findPattern(/(^|,)store(,|$)/)) ) ||
                 ( this.htmlEditorConfig.activePlugins === undefined || !this.htmlEditorConfig.activePlugins.findPattern(/(^|,)store(,|$)/) ) ) {
                throw( "InlineTextEditorPro's 'enableHtmlEditorSaving' option requires both the 'store' button and the 'store' plugin in the HTML editor configuration." );
            }

            if ( this.configSettings.onHtmlEditorSave ) {
                this.htmlEditorConfig.onSaveCallback = this.configSettings.onHtmlEditorSave;
            }

            if ( this.configSettings.onHtmlEditorCancel ) {
                this.htmlEditorConfig.onCancelCallback = this.configSettings.onHtmlEditorCancel;
            }
        }
    },

    setupConfiguration: function() {
        this.configSettings = Utility.cloneObject(Web.InlineEditorPro.StandardSettings);
        Utility.assignProperties(this.configSettings, Web.InlineEditorPro.StandardCallbacks);

        ArrayUtil.forEach(ArrayUtil.compact(ArrayUtil.flatten([this._additionalDefaultSettings])), function(defaults) {
            Utility.assignProperties(this.configSettings, defaults);
        }.attachContext(this));
    }
});

Utility.assignProperties(Web.InlineEditorPro, {

    // Note: options like 'size', 'cols', 'rows', and 'autoRows' are no longer utilized
    StandardSettings: Utility.assignProperties(Utility.cloneObject(Web.InlineEditorBase.StandardSettings), {
        inputStyleClass: 'text_input_field',
        fieldPostCreationAction: 'setFocus',
        formCssClass: 'inlinetexteditor-form',
        formIdPostfix: 'texteditor',
        loadingStyleClass: 'inlinetexteditor-loading',
        savingStyleClass: 'inlinetexteditor-saving',
        textAreaIdPostfix: 'multiline-editor',
        enableHtmlEditorSaving: false,
        matchElementDimensions: false
    }),

    StandardCallbacks: Utility.assignProperties(Utility.cloneObject(Web.InlineEditorBase.StandardCallbacks), {
        onHtmlEditorSave: function(editInstance) { editInstance.linkedEditorInstance._boundSubmissionCallback(); },
        onHtmlEditorCancel: function(editInstance) { editInstance.linkedEditorInstance._boundCancellationCallback(); }
    })
});