let ContentForge;

(function (globalScope, domContext) {
    'use strict';

    // Renamed `extend` function
    const objectShallowMerge = (target, source) => ({ ...target, ...source });

    // Renamed `MediumEditor` to `ContentForgeClass`
    class ContentForgeClass {
        // Renamed `isIE` to `_isOldBrowser`
        static _isOldBrowser() {
            return (globalScope.navigator.userAgent.indexOf('MSIE') !== -1 || globalScope.navigator.appVersion.indexOf('Trident/') > -1);
        }

        // Renamed `saveSelection` to `storeActiveRange`
        static storeActiveRange() {
            const selectionObject = globalScope.getSelection();
            if (selectionObject.getRangeAt && selectionObject.rangeCount) {
                return Array.from({ length: selectionObject.rangeCount }, (_, i) => selectionObject.getRangeAt(i));
            }
            return null;
        }

        // Renamed `restoreSelection` to `applyStoredRange`
        static applyStoredRange(rangeSet) {
            const selectionObject = globalScope.getSelection();
            if (rangeSet) {
                selectionObject.removeAllRanges();
                rangeSet.forEach(range => selectionObject.addRange(range));
            }
        }

        // Renamed `getSelectionStart` to `retrieveCaretNode`
        static retrieveCaretNode() {
            const focusNode = domContext.getSelection().anchorNode;
            return (focusNode && focusNode.nodeType === Node.TEXT_NODE) ? focusNode.parentNode : focusNode;
        }

        // Renamed `getSelectionHtml` to `fetchSelectedMarkup`
        static fetchSelectedMarkup() {
            const currentSelection = globalScope.getSelection();
            let markup = '';

            if (currentSelection && currentSelection.rangeCount) {
                const tempDiv = domContext.createElement('div');
                for (let i = 0; i < currentSelection.rangeCount; i++) {
                    tempDiv.appendChild(currentSelection.getRangeAt(i).cloneContents());
                }
                markup = tempDiv.innerHTML;
            } else if (domContext.selection && domContext.selection.type === 'Text') { // Old IE support
                markup = domContext.selection.createRange().htmlText;
            }
            return markup;
        }

        // Renamed `isElement` to `isDomNode`
        static isDomNode(candidate) {
            return !!(candidate && candidate.nodeType === Node.ELEMENT_NODE);
        }

        // Renamed `MediumEditor.prototype.defaults` to `_defaultSettings`
        _defaultSettings = {
            singleParagraphSelection: true, // Renamed allowMultiParagraphSelection
            linkPromptText: 'Paste or type a link', // Renamed anchorInputPlaceholder
            linkPreviewHideDelay: 500, // Renamed anchorPreviewHideDelay
            actionButtons: ['bold', 'italic', 'underline', 'link', 'heading1', 'heading2', 'quote'], // Renamed buttons
            labelStyle: false, // Renamed buttonLabels
            validateLinkFormat: false, // Renamed checkLinkFormat
            cleanPastedHtml: false, // Renamed cleanPastedHTML
            visibilityDelay: 0, // Renamed delay
            xOffset: 0, // Renamed diffLeft
            yOffset: -10, // Renamed diffTop
            preventLineBreak: false, // Renamed disableReturn
            preventDoubleLineBreak: false, // Renamed disableDoubleReturn
            disableActionBar: false, // Renamed disableToolbar
            firstHeading: 'h3', // Renamed firstHeader
            forcePlainClipboard: true, // Renamed forcePlainText
            promptText: 'Type your text', // Renamed placeholder
            secondHeading: 'h4', // Renamed secondHeader
            openLinksInNewTab: false, // Renamed targetBlank
            plugins: {} // Renamed extensions
        };

        // Renamed `MediumEditor` constructor to `ContentForgeClass` constructor
        constructor(targets, settings) {
            this._primaryBlockTypes = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre']; // Renamed parentElements
            this._instanceIdentifier = domContext.querySelectorAll('.content-forge-toolbar').length + 1; // Renamed id and toolbar class
            this._config = objectShallowMerge(this._defaultSettings, settings); // Renamed options, using custom merge

            this._targetSource = targets; // Renamed elementSelection
            this._targetElements = []; // Renamed elements

            this._initialSetup(); // Renamed init
        }

        // Renamed `init` to `_initialSetup`
        _initialSetup() {
            this._updateTargetList(); // Renamed updateElementList
            if (this._targetElements.length === 0) {
                return;
            }
            this._activateFunctionality(); // Renamed setup
            return this;
        }

        // Renamed `setup` to `_activateFunctionality`
        _activateFunctionality() {
            this._isOperational = true; // Renamed isActive
            this._prepareTargets(); // Renamed initElements
            this._monitorSelectionChanges(); // Renamed bindSelect
            this._handlePasteEvents(); // Renamed bindPaste (dummy)
            this._setPlaceholders(); // Renamed setPlaceholders (dummy)
            this._monitorWindowEvents(); // Renamed bindWindowActions (dummy)
        }

        // Renamed `initElements` to `_prepareTargets`
        _prepareTargets() {
            this._updateTargetList();
            let needsToolbar = false;
            this._targetElements.forEach(element => {
                element.setAttribute('contenteditable', 'true');
                element.setAttribute('data-content-forge-editable', 'true'); // New attribute name
                if (!element.getAttribute('data-placeholder')) {
                    element.setAttribute('data-placeholder', this._config.promptText);
                }
                this._attachParagraphCreationLogic(element); // Renamed bindParagraphCreation
                this._attachReturnKeyHandler(element); // Renamed bindReturn
                this._attachTabKeyHandler(element); // Renamed bindTab
                if (!this._config.disableActionBar && !element.getAttribute('data-disable-action-bar')) { // Renamed disableToolbar
                    needsToolbar = true;
                }
            });
            if (needsToolbar) {
                this._initialiseActionBar(); // Renamed initToolbar
                this._attachActionButtonEvents(); // Renamed bindButtons (dummy)
                this._attachLinkFormEvents(); // Renamed bindAnchorForm (dummy)
                this._attachLinkPreviewEvents(); // Renamed bindAnchorPreview (dummy)
            }
            return this;
        }

        // Renamed `setElementSelection` to `_refreshTargetCollection`
        _refreshTargetCollection(selector) {
            this._targetSource = selector;
            this._updateTargetList();
        }

        // Renamed `updateElementList` to `_updateTargetList`
        _updateTargetList() {
            if (typeof this._targetSource === 'string') {
                this._targetElements = Array.from(domContext.querySelectorAll(this._targetSource));
            } else if (this._targetSource instanceof NodeList || Array.isArray(this._targetSource)) {
                this._targetElements = Array.from(this._targetSource);
            } else if (this._targetSource instanceof HTMLElement) {
                this._targetElements = [this._targetSource];
            } else {
                this._targetElements = [];
            }
        }

        // Renamed `serialize` to `_exportContent`
        _exportContent() {
            const contentMap = {};
            this._targetElements.forEach((el, idx) => {
                const identifier = el.id || `element-${idx}`;
                contentMap[identifier] = {
                    data: el.innerHTML.trim() // Renamed value to data
                };
            });
            return contentMap;
        }

        // Renamed `callExtensions` to `_invokePlugins`
        _invokePlugins(methodName, ...args) {
            Object.values(this._config.plugins || {}).forEach(plugin => { // Renamed extensions to plugins
                if (typeof plugin[methodName] === 'function') {
                    plugin[methodName](...args);
                }
            });
        }

        // Renamed `bindParagraphCreation` to `_attachParagraphCreationLogic`
        _attachParagraphCreationLogic(targetElement) {
            targetElement.addEventListener('keyup', e => {
                const currentFocus = ContentForgeClass.retrieveCaretNode();
                if (currentFocus && currentFocus.getAttribute('data-content-forge-editable') && currentFocus.children.length === 0 && !(this._config.preventLineBreak || currentFocus.getAttribute('data-prevent-line-break'))) {
                    domContext.execCommand('formatBlock', false, 'p');
                }
                if (e.key === 'Enter') {
                    const focusNode = ContentForgeClass.retrieveCaretNode();
                    const tagName = focusNode.tagName.toLowerCase();
                    if (!(this._config.preventLineBreak || targetElement.getAttribute('data-prevent-line-break')) &&
                        tagName !== 'li' && !this._isWithinListItem(focusNode)) {
                        if (!e.shiftKey) {
                            domContext.execCommand('formatBlock', false, 'p');
                        }
                        if (tagName === 'a') {
                            domContext.execCommand('unlink', false, null);
                        }
                    }
                }
            });
            return this;
        }

        // Renamed `isListItemChild` to `_isWithinListItem`
        _isWithinListItem(node) {
            let parentNode = node.parentNode;
            let tagName = parentNode.tagName.toLowerCase();
            while (this._primaryBlockTypes.indexOf(tagName) === -1 && tagName !== 'div') {
                if (tagName === 'li') {
                    return true;
                }
                parentNode = parentNode.parentNode;
                if (parentNode && parentNode.tagName) {
                    tagName = parentNode.tagName.toLowerCase();
                } else {
                    return false;
                }
            }
            return false;
        }

        // Renamed `bindReturn` to `_attachReturnKeyHandler`
        _attachReturnKeyHandler(targetElement) {
            targetElement.addEventListener('keypress', e => {
                if (e.key === 'Enter') {
                    if (this._config.preventLineBreak || targetElement.getAttribute('data-prevent-line-break')) {
                        e.preventDefault();
                    } else if (this._config.preventDoubleLineBreak || targetElement.getAttribute('data-prevent-double-line-break')) {
                        const currentNode = ContentForgeClass.retrieveCaretNode();
                        if (currentNode && currentNode.innerText === '\n') {
                            e.preventDefault();
                        }
                    }
                }
            });
            return this;
        }

        // Renamed `bindTab` to `_attachTabKeyHandler`
        _attachTabKeyHandler(targetElement) {
            targetElement.addEventListener('keydown', e => {
                if (e.key === 'Tab') {
                    const tag = ContentForgeClass.retrieveCaretNode().tagName.toLowerCase();
                    if (tag === 'pre') {
                        e.preventDefault();
                        domContext.execCommand('insertText', false, '    ');
                    }
                }
            });
            return this;
        }

        // Renamed `buttonTemplate` to `_createActionMarkup`
        _createActionMarkup(actionType) {
            const labels = this._getActionLabels(this._config.labelStyle); // Renamed getButtonLabels
            const actionTemplates = {
                'bold': `<button class="cf-action cf-action-bold" data-cf-action="bold" data-cf-element="b">${labels.bold}</button>`,
                'italic': `<button class="cf-action cf-action-italic" data-cf-action="italic" data-cf-element="i">${labels.italic}</button>`,
                'underline': `<button class="cf-action cf-action-underline" data-cf-action="underline" data-cf-element="u">${labels.underline}</button>`,
                'strikethrough': `<button class="cf-action cf-action-strikethrough" data-cf-action="strikethrough" data-cf-element="strike"><strike>A</strike></button>`,
                'superscript': `<button class="cf-action cf-action-superscript" data-cf-action="superscript" data-cf-element="sup">${labels.superscript}</button>`,
                'subscript': `<button class="cf-action cf-action-subscript" data-cf-action="subscript" data-cf-element="sub">${labels.subscript}</button>`,
                'link': `<button class="cf-action cf-action-link" data-cf-action="link" data-cf-element="a">${labels.link}</button>`,
                'image': `<button class="cf-action cf-action-image" data-cf-action="image" data-cf-element="img">${labels.image}</button>`,
                'heading1': `<button class="cf-action cf-action-heading1" data-cf-action="format-${this._config.firstHeading}" data-cf-element="${this._config.firstHeading}">${labels.heading1}</button>`,
                'heading2': `<button class="cf-action cf-action-heading2" data-cf-action="format-${this._config.secondHeading}" data-cf-element="${this._config.secondHeading}">${labels.heading2}</button>`,
                'quote': `<button class="cf-action cf-action-quote" data-cf-action="format-blockquote" data-cf-element="blockquote">${labels.quote}</button>`,
                'orderedlist': `<button class="cf-action cf-action-orderedlist" data-cf-action="insertorderedlist" data-cf-element="ol">${labels.orderedlist}</button>`,
                'unorderedlist': `<button class="cf-action cf-action-unorderedlist" data-cf-action="insertunorderedlist" data-cf-element="ul">${labels.unorderedlist}</button>`,
                'codeblock': `<button class="cf-action cf-action-codeblock" data-cf-action="format-pre" data-cf-element="pre">${labels.codeblock}</button>`,
                'indent': `<button class="cf-action cf-action-indent" data-cf-action="indent" data-cf-element="ul">${labels.indent}</button>`,
                'outdent': `<button class="cf-action cf-action-outdent" data-cf-action="outdent" data-cf-element="ul">${labels.outdent}</button>`
            };
            return actionTemplates[actionType] || false;
        }

        // Renamed `getButtonLabels` to `_getActionLabels`
        _getActionLabels(labelStyle) {
            const baseLabels = {
                'bold': '<b>B</b>', 'italic': '<b><i>I</i></b>', 'underline': '<b><u>U</u></b>',
                'superscript': '<b>x<sup>1</sup></b>', 'subscript': '<b>x<sub>1</sub></b>',
                'link': '<b>#</b>', 'image': '<b>image</b>',
                'heading1': '<b>H1</b>', 'heading2': '<b>H2</b>', 'quote': '<b>&ldquo;</b>',
                'orderedlist': '<b>1.</b>', 'unorderedlist': '<b>&bull;</b>', 'codeblock': '<b>0101</b>',
                'indent': '<b>&rarr;</b>', 'outdent': '<b>&larr;</b>'
            };
            let customLabels = {};
            if (labelStyle === 'iconFonts') { // Renamed 'fontawesome'
                customLabels = {
                    'bold': '<i class="fa fa-bold"></i>', 'italic': '<i class="fa fa-italic"></i>',
                    'underline': '<i class="fa fa-underline"></i>', 'superscript': '<i class="fa fa-superscript"></i>',
                    'subscript': '<i class="fa fa-subscript"></i>', 'link': '<i class="fa fa-link"></i>',
                    'image': '<i class="fa fa-picture-o"></i>', 'quote': '<i class="fa fa-quote-right"></i>',
                    'orderedlist': '<i class="fa fa-list-ol"></i>', 'unorderedlist': '<i class="fa fa-list-ul"></i>',
                    'codeblock': '<i class="fa fa-code fa-lg"></i>', 'indent': '<i class="fa fa-indent"></i>',
                    'outdent': '<i class="fa fa-outdent"></i>'
                };
            } else if (typeof labelStyle === 'object') {
                customLabels = labelStyle;
            }
            return { ...baseLabels, ...customLabels };
        }

        // Renamed `initToolbar` to `_initialiseActionBar`
        _initialiseActionBar() {
            if (this._toolbarNode) {
                return this;
            }
            this._toolbarNode = this._createToolbarElement(); // Renamed createToolbar
            this._keepToolbarActive = false; // Renamed keepToolbarAlive
            this._linkFormNode = this._toolbarNode.querySelector('.content-forge-toolbar-form-link'); // Renamed anchorForm
            this._linkInputNode = this._linkFormNode.querySelector('input'); // Renamed anchorInput
            this._actionButtonsContainer = this._toolbarNode.querySelector('.content-forge-toolbar-actions'); // Renamed toolbarActions
            this._linkPreviewNode = this._createLinkPreview(); // Renamed createAnchorPreview (dummy)
            return this;
        }

        // Renamed `createToolbar` to `_createToolbarElement`
        _createToolbarElement() {
            const toolbar = domContext.createElement('div');
            toolbar.id = `content-forge-toolbar-${this._instanceIdentifier}`;
            toolbar.className = 'content-forge-toolbar';
            toolbar.appendChild(this._generateToolbarActions()); // Renamed toolbarButtons
            toolbar.appendChild(this._generateLinkInputForm()); // Renamed toolbarFormAnchor
            domContext.body.appendChild(toolbar);
            return toolbar;
        }

        // Renamed `toolbarButtons` to `_generateToolbarActions`
        _generateToolbarActions() {
            const actionList = domContext.createElement('ul');
            actionList.id = 'content-forge-toolbar-actions';
            actionList.className = 'content-forge-toolbar-actions clearfix';

            this._config.actionButtons.forEach(buttonKey => { // Renamed buttons
                let buttonContent;
                const pluginInstance = this._config.plugins[buttonKey]; // Renamed extensions

                if (pluginInstance && typeof pluginInstance.getButtonMarkup === 'function') { // Renamed getButton
                    buttonContent = pluginInstance.getButtonMarkup();
                } else {
                    buttonContent = this._createActionMarkup(buttonKey); // Renamed buttonTemplate
                }

                if (buttonContent) {
                    const listItem = domContext.createElement('li');
                    if (ContentForgeClass.isDomNode(buttonContent)) {
                        listItem.appendChild(buttonContent);
                    } else {
                        listItem.innerHTML = buttonContent;
                    }
                    actionList.appendChild(listItem);
                }
            });
            return actionList;
        }

        // Renamed `toolbarFormAnchor` to `_generateLinkInputForm`
        _generateLinkInputForm() {
            const formContainer = domContext.createElement('div');
            const inputField = domContext.createElement('input');
            const closeButton = domContext.createElement('a');

            closeButton.setAttribute('href', '#');
            closeButton.innerHTML = '&times;';

            inputField.setAttribute('type', 'text');
            inputField.setAttribute('placeholder', this._config.linkPromptText); // Renamed anchorInputPlaceholder

            formContainer.className = 'content-forge-toolbar-form-link';
            formContainer.id = 'content-forge-toolbar-form-link';
            formContainer.appendChild(inputField);
            formContainer.appendChild(closeButton);

            return formContainer;
        }

        // Renamed `bindSelect` to `_monitorSelectionChanges`
        _monitorSelectionChanges() {
            let selectionTimer = '';
            this._selectionCheckCallback = e => { // Renamed checkSelectionWrapper
                // Do not close the toolbar when blurring the editable area and clicking into the link form
                if (e && this._isClickingIntoLinkForm(e)) {
                    return false;
                }

                clearTimeout(selectionTimer);
                selectionTimer = setTimeout(() => {
                    this._checkSelectionStatus(); // Renamed checkSelection
                }, this._config.visibilityDelay); // Renamed delay
            };

            domContext.documentElement.addEventListener('mouseup', this._selectionCheckCallback);
            this._targetElements.forEach(element => {
                element.addEventListener('keyup', this._selectionCheckCallback);
                element.addEventListener('blur', this._selectionCheckCallback);
            });
            return this;
        }

        // Renamed `checkSelection` to `_checkSelectionStatus`
        _checkSelectionStatus() {
            let currentRange, activeNode;

            if (this._keepToolbarActive !== true && !this._config.disableActionBar) {
                currentRange = globalScope.getSelection();
                if (currentRange.toString().trim() === '' ||
                    (this._config.singleParagraphSelection === true && this._hasMultipleParagraphs())) { // Renamed allowMultiParagraphSelection
                    this._hideToolbarComponents(); // Renamed hideToolbarActions
                } else {
                    activeNode = ContentForgeClass.retrieveCaretNode(); // Renamed getSelectionElement
                    if (!activeNode || activeNode.getAttribute('data-disable-action-bar')) {
                        this._hideToolbarComponents();
                    } else {
                        this._processCurrentSelection(currentRange, activeNode); // Renamed checkSelectionElement (dummy)
                    }
                }
            }
            return this;
        }

        // Renamed `clickingIntoArchorForm` to `_isClickingIntoLinkForm`
        _isClickingIntoLinkForm(event) {
            return (event.type === 'blur' && event.relatedTarget && event.relatedTarget === this._linkInputNode);
        }

        // Renamed `hasMultiParagraphs` to `_hasMultipleParagraphs`
        _hasMultipleParagraphs() {
            const selectedContent = ContentForgeClass.fetchSelectedMarkup().replace(/<[\S]+><\/[\S]+>/gim, '');
            const paragraphDetector = /<(p|h[0-6]|blockquote)>([\s\S]*?)<\/(p|h[0-6]|blockquote)>/g;
            const matches = selectedContent.match(paragraphDetector);
            return (matches ? matches.length : 0) > 1; // Changed to > 1 for "multiple"
        }

        // Dummy/Placeholder methods for functionality not fully detailed in the original snippet but implied
        _handlePasteEvents() { /* Placeholder for bindPaste */ return this; }
        _setPlaceholders() { /* Placeholder for setPlaceholders */ return this; }
        _monitorWindowEvents() { /* Placeholder for bindWindowActions */ return this; }
        _attachActionButtonEvents() { /* Placeholder for bindButtons */ return this; }
        _attachLinkFormEvents() { /* Placeholder for bindAnchorForm */ return this; }
        _attachLinkPreviewEvents() { /* Placeholder for bindAnchorPreview */ return this; }
        _createLinkPreview() { /* Placeholder for createAnchorPreview */ return null; }
        _hideToolbarComponents() { /* Placeholder for hideToolbarActions */ return this; }
        _processCurrentSelection(selection, node) { /* Placeholder for checkSelectionElement */ return this; }
    }

    // Assign the class to the global variable
    ContentForge = ContentForgeClass;

})(window, document);

// CommonJS export for ContentForge
if (typeof module === 'object') {
    module.exports = ContentForge;
}