const mergeProperties = (targetObject, sourceObject) => {
    return Object.assign(targetObject, sourceObject);
};

class BaseComponent {
    static _PROTOTYPE_SETUP_MARKER = Symbol('PrototypeSetupMarker');

    constructor(...args) {
        if (args[0] !== BaseComponent._PROTOTYPE_SETUP_MARKER) {
            this.setup(...args);
        }
    }

    setup() {}

    static derive(extensionDefinition) {
        const CurrentParent = this;

        // Create a temporary constructor to build the prototype chain
        function TemporaryPrototypeBuilder() {
            CurrentParent.call(this, BaseComponent._PROTOTYPE_SETUP_MARKER);
        }
        TemporaryPrototypeBuilder.prototype = Object.create(CurrentParent.prototype);
        TemporaryPrototypeBuilder.prototype.constructor = TemporaryPrototypeBuilder;

        // Create the prototype instance for the new class
        const prototypeInstance = new TemporaryPrototypeBuilder();
        mergeProperties(prototypeInstance, extensionDefinition);

        // Define the actual derived class using ES6 syntax
        class DerivedClass extends CurrentParent {
            constructor(...args) {
                super(...args);
            }
        }

        DerivedClass.prototype = prototypeInstance;
        DerivedClass.prototype.constructor = DerivedClass;

        DerivedClass.derive = CurrentParent.derive;
        return DerivedClass;
    }
}

const ApplicationUtilities = {
    isOldInternetExplorer: () => (navigator.userAgent.indexOf("MSIE") !== -1),

    attachEventHandler: (targetElement, eventName, handlerFunction) => {
        if (targetElement.addEventListener) {
            targetElement.addEventListener(eventName, handlerFunction, false);
        } else if (targetElement.attachEvent) {
            targetElement.attachEvent("on" + eventName, handlerFunction);
        }
    },

    convertIterableToArray: (iterableObject) => Array.from(iterableObject),

    disableTextSelection: (targetElement) => {
        if (targetElement && targetElement.nodeType === 1) {
            targetElement.style.userSelect = 'none';
            targetElement.style.webkitUserSelect = 'none';
            targetElement.style.msUserSelect = 'none';
            targetElement.setAttribute('unselectable', 'on');
            for (const childNode of targetElement.children) {
                ApplicationUtilities.disableTextSelection(childNode);
            }
        }
    },

    camelCaseCss: (cssPropertyString) => cssPropertyString.replace(/\-(.)/g, (match, character) => character.toUpperCase()),

    arrayContains: (collectionArray, itemValue) => collectionArray.includes(itemValue),

    findArrayIndex: (collectionArray, itemValue) => collectionArray.indexOf(itemValue),

    preventAndStopEvent: (eventObject) => {
        if (eventObject) {
            eventObject.preventDefault();
            eventObject.stopPropagation();
        }
        return false;
    },

    _documentReadyCallbacks: [],
    _documentReadyTriggered: false,

    _fireDocumentReady: () => {
        if (ApplicationUtilities._documentReadyTriggered) return;
        ApplicationUtilities._documentReadyTriggered = true;
        for (const callback of ApplicationUtilities._documentReadyCallbacks) {
            callback();
        }
        ApplicationUtilities._documentReadyCallbacks = [];
    },

    onDocumentReady: (callbackFunction) => {
        if (ApplicationUtilities._documentReadyTriggered) {
            callbackFunction();
            return;
        }
        ApplicationUtilities._documentReadyCallbacks.push(callbackFunction);
        if (document.readyState === 'loading') {
            ApplicationUtilities.attachEventHandler(document, 'DOMContentLoaded', ApplicationUtilities._fireDocumentReady);
            ApplicationUtilities.attachEventHandler(window, 'load', ApplicationUtilities._fireDocumentReady);
        } else {
            ApplicationUtilities._fireDocumentReady();
        }
    }
};

const EventEmittingBehavior = {
    emit(eventName, ...args) {
        if (this.eventListeners && this.eventListeners.has(eventName)) {
            for (const handler of this.eventListeners.get(eventName)) {
                handler.apply(this, args);
            }
        }
    },

    on(eventName, handlerFunction) {
        this.eventListeners = this.eventListeners || new Map();
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(handlerFunction);
        return this;
    }
};

class DomWrapper {
    constructor(domElementOrTagName, contextDocument = document) {
        if (domElementOrTagName instanceof DomWrapper) {
            return domElementOrTagName;
        }
        if (typeof domElementOrTagName === 'string') {
            const existingElement = contextDocument.getElementById(domElementOrTagName);
            if (existingElement) {
                this._nativeDomElement = existingElement;
            } else {
                this._nativeDomElement = contextDocument.createElement(domElementOrTagName);
            }
        } else if (domElementOrTagName instanceof Element) {
            this._nativeDomElement = domElementOrTagName;
        } else {
            throw new Error('Invalid input for DomWrapper: must be string, Element, or another DomWrapper.');
        }
    }

    get element() {
        return this._nativeDomElement;
    }

    appendInto(parentElement) {
        const target = parentElement instanceof DomWrapper ? parentElement.element : parentElement;
        target.appendChild(this.element);
        return this;
    }

    insertBefore(siblingElement) {
        const target = siblingElement instanceof DomWrapper ? siblingElement.element : siblingElement;
        if (target.parentNode) {
            target.parentNode.insertBefore(this.element, target);
        }
        return this;
    }

    addEvent(eventType, handler) {
        ApplicationUtilities.attachEventHandler(this.element, eventType, handler);
        return this;
    }

    setHtmlContent(contentString) {
        this.element.innerHTML = contentString;
        return this;
    }

    getAbsolutePosition() {
        const rect = this.element.getBoundingClientRect();
        const computed = window.getComputedStyle(this.element);
        const borderWidth = parseFloat(computed.getPropertyValue('border-left-width')) || 0;

        const documentLeft = rect.left + window.pageXOffset;
        const documentTop = rect.top + window.pageYOffset;

        return [
            documentLeft + borderWidth,
            documentTop + borderWidth + this.element.offsetHeight
        ];
    }

    preventTextSelection() {
        ApplicationUtilities.disableTextSelection(this.element);
        return this;
    }

    findParentByTag(tagName) {
        let current = this.element;
        while (current) {
            if (current.nodeName && current.nodeName.toUpperCase() === tagName.toUpperCase()) {
                return new DomWrapper(current);
            }
            current = current.parentNode;
        }
        return null;
    }

    checkCssClass(className) {
        return this.element.classList.contains('rte-' + className);
    }

    addCssClass(className) {
        this.element.classList.add('rte-' + className);
        return this;
    }

    removeCssClass(className) {
        this.element.classList.remove('rte-' + className);
        return this;
    }

    applyCssStyles(styleDeclarations) {
        const elemStyle = this.element.style;
        for (const propName in styleDeclarations) {
            if (Object.prototype.hasOwnProperty.call(styleDeclarations, propName)) {
                switch (propName) {
                    case 'float':
                        elemStyle.cssFloat = styleDeclarations[propName];
                        elemStyle.styleFloat = styleDeclarations[propName];
                        break;
                    case 'opacity':
                        elemStyle.opacity = styleDeclarations[propName];
                        elemStyle.filter = `alpha(opacity=${Math.round(styleDeclarations[propName] * 100)})`;
                        break;
                    case 'className':
                        this.element.className = styleDeclarations[propName];
                        break;
                    default:
                        elemStyle[ApplicationUtilities.camelCaseCss(propName)] = styleDeclarations[propName];
                }
            }
        }
        return this;
    }

    getComputedCssValue(cssProperty, contextDocument = document) {
        if (this.element.nodeType !== 1) return null;
        const defaultView = contextDocument.defaultView;
        if (defaultView && defaultView.getComputedStyle) {
            return defaultView.getComputedStyle(this.element, null).getPropertyValue(cssProperty);
        } else if (this.element.currentStyle) {
            return this.element.currentStyle[ApplicationUtilities.camelCaseCss(cssProperty)];
        }
        return null;
    }

    removeFromParent() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        return this;
    }

    setHtmlAttributes(attributesMap) {
        for (const attrKey in attributesMap) {
            if (Object.prototype.hasOwnProperty.call(attributesMap, attrKey)) {
                this.element.setAttribute(attrKey, attributesMap[attrKey]);
            }
        }
        return this;
    }
}

const getDomWrapper = (inputElement, contextDocument = document) => {
    if (inputElement instanceof DomWrapper) {
        return inputElement;
    }
    let actualElement = null;
    if (typeof inputElement === 'string') {
        actualElement = contextDocument.getElementById(inputElement);
        if (!actualElement) {
            return new DomWrapper(inputElement, contextDocument);
        }
    } else if (inputElement instanceof Element) {
        actualElement = inputElement;
    }
    return actualElement ? new DomWrapper(actualElement) : null;
};

const translateLiteral = (textString) => textString;

class EditorConfiguration {
    constructor(userOptions = {}) {
        this.actionButtons = {
            'bold': { labelText: translateLiteral('Toggle Bold'), commandName: 'Bold', tagsForActive: ['B', 'STRONG'], cssForActive: { 'font-weight': 'bold' }, keyboardShortcut: 'b' },
            'italic': { labelText: translateLiteral('Toggle Italic'), commandName: 'Italic', tagsForActive: ['EM', 'I'], cssForActive: { 'font-style': 'italic' }, keyboardShortcut: 'i' },
            'underline': { labelText: translateLiteral('Toggle Underline'), commandName: 'Underline', tagsForActive: ['U'], cssForActive: { 'text-decoration': 'underline' }, keyboardShortcut: 'u' },
            'alignLeft': { labelText: translateLiteral('Align Text Left'), commandName: 'justifyleft', noHighlight: true },
            'alignCenter': { labelText: translateLiteral('Center Text'), commandName: 'justifycenter', noHighlight: true },
            'alignRight': { labelText: translateLiteral('Align Text Right'), commandName: 'justifyright', noHighlight: true },
            'alignJustify': { labelText: translateLiteral('Justify Text'), commandName: 'justifyfull', noHighlight: true },
            'orderedList': { labelText: translateLiteral('Create Ordered List'), commandName: 'insertorderedlist', tagsForActive: ['OL'] },
            'unorderedList': { labelText: translateLiteral('Create Unordered List'), commandName: 'insertunorderedlist', tagsForActive: ['UL'] },
            'subscript': { labelText: translateLiteral('Apply Subscript'), commandName: 'subscript', tagsForActive: ['SUB'] },
            'superscript': { labelText: translateLiteral('Apply Superscript'), commandName: 'superscript', tagsForActive: ['SUP'] },
            'strikethrough': { labelText: translateLiteral('Strike Through'), commandName: 'strikeThrough', cssForActive: { 'text-decoration': 'line-through' } },
            'removeFormatting': { labelText: translateLiteral('Clear All Formatting'), commandName: 'removeformat', noHighlight: true },
            'indent': { labelText: translateLiteral('Increase Indentation'), commandName: 'indent', noHighlight: true },
            'outdent': { labelText: translateLiteral('Decrease Indentation'), commandName: 'outdent', noHighlight: true },
            'horizontalRule': { labelText: translateLiteral('Insert Horizontal Rule'), commandName: 'insertHorizontalRule', noHighlight: true }
        };
        this.iconSpritePath = '../nicEditorIcons.gif';
        this.toolbarButtonOrder = ['save', 'bold', 'italic', 'underline', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'orderedList', 'unorderedList', 'fontSize', 'fontFamily', 'fontFormat', 'indent', 'outdent', 'image', 'upload', 'link', 'unlink', 'forecolor', 'bgcolor'];
        this.iconSpriteMap = { "html": 1, "bgcolor": 2, "forecolor": 3, "bold": 4, "alignCenter": 5, "horizontalRule": 6, "indent": 7, "italic": 8, "alignJustify": 9, "alignLeft": 10, "orderedList": 11, "outdent": 12, "removeFormatting": 13, "alignRight": 14, "save": 25, "strikethrough": 16, "subscript": 17, "superscript": 18, "unorderedList": 19, "underline": 20, "image": 21, "link": 22, "unlink": 23, "close": 24, "arrow": 26, "upload": 27 };
        this.insertLineBreakOnEmpty = true;

        mergeProperties(this, userOptions);
    }
}

class GlobalEditorRegistry {
    constructor() {
        this.registeredModules = [];
        this.managedEditors = [];
    }

    registerModule(moduleClass, moduleOptions) {
        this.registeredModules.push({ class: moduleClass, options: moduleOptions });
    }

    activateAllTextAreas(editorOptions) {
        const allTextAreas = document.getElementsByTagName("textarea");
        const activatedInstances = [];
        for (const textArea of Array.from(allTextAreas)) {
            const editorInstance = new RichContentEditor(editorOptions);
            editorInstance.initializePanelAndArea(getDomWrapper(textArea));
            activatedInstances.push(editorInstance);
        }
        this.managedEditors.push(...activatedInstances);
        return activatedInstances;
    }

    findManagingEditor(targetDomElement) {
        const wrappedTarget = getDomWrapper(targetDomElement);
        if (!wrappedTarget) return null;

        for (const editor of this.managedEditors) {
            if (editor.locateEditableSegment(wrappedTarget.element)) {
                return editor;
            }
        }
        return null;
    }
}

const editorMasterRegistry = new GlobalEditorRegistry();

class RichContentEditor extends BaseComponent {
    constructor(options) {
        super();
        mergeProperties(this, EventEmittingBehavior);
        this.editorSettings = new EditorConfiguration(options);
        this.editableSegments = [];
        this.activatedModules = [];

        for (const moduleEntry of editorMasterRegistry.registeredModules) {
            this.activatedModules.push(new moduleEntry.class(this, moduleEntry.options));
        }
        editorMasterRegistry.managedEditors.push(this);
        ApplicationUtilities.attachEventHandler(document.body, 'mousedown', this.checkEditorSelection.bind(this));
    }

    setup() {}

    initializePanelAndArea(targetElementWrapper, options) {
        const existingManager = editorMasterRegistry.findManagingEditor(targetElementWrapper);
        if (existingManager) {
            existingManager.removeEditableSegment(targetElementWrapper);
            existingManager.removeControlPanel();
        }

        const panelElement = new DomWrapper('DIV')
            .applyCssStyles({ width: (parseInt(targetElementWrapper.getComputedCssValue('width')) || targetElementWrapper.element.clientWidth) + 'px' })
            .insertBefore(targetElementWrapper);
        this.setControlPanel(panelElement);
        return this.addEditableSegment(targetElementWrapper, options);
    }

    addEditableSegment(targetElementWrapper, options) {
        const existingManager = editorMasterRegistry.findManagingEditor(targetElementWrapper);
        if (existingManager) {
            existingManager.removeEditableSegment(targetElementWrapper);
            existingManager.removeControlPanel();
        }

        let newSegment;
        if (targetElementWrapper.element.contentEditable === 'true' || !!window.opera) {
            newSegment = new EditableHtmlSegment(targetElementWrapper, options, this);
        } else {
            newSegment = new IFrameHtmlSegment(targetElementWrapper, options, this);
        }
        this.editableSegments.push(newSegment);
        return this;
    }

    removeEditableSegment(targetElementWrapper) {
        const nativeElement = targetElementWrapper.element;
        for (let i = 0; i < this.editableSegments.length; i++) {
            if (this.editableSegments[i].targetDomWrapper.element === nativeElement) {
                this.editableSegments[i].destroy();
                this.editableSegments.splice(i, 1);
                return;
            }
        }
    }

    removeControlPanel() {
        if (this.controlPanelInstance) {
            this.controlPanelInstance.removeFromParent();
            this.controlPanelInstance = null;
        }
    }

    locateEditableSegment(element) {
        for (const segment of this.editableSegments) {
            if (segment.targetDomWrapper.element === element) {
                return segment;
            }
        }
        return null;
    }

    setControlPanel(panelWrapper) {
        this.controlPanelInstance = new EditorToolbarPanel(panelWrapper, this.editorSettings, this);
        this.emit('panelReady', this.controlPanelInstance);
        return this;
    }

    executeEditorCommand(commandIdentifier, commandValue) {
        if (this.activeEditableSegment) {
            this.activeEditableSegment.performCommand(commandIdentifier, commandValue);
        }
    }

    getButtonIconStyle(iconName, options = {}) {
        const iconIndex = this.editorSettings.iconSpriteMap[iconName];
        const iconFile = (options.iconFiles) ? options.iconFiles[iconName] : '';
        return {
            backgroundImage: `url('${(iconIndex) ? this.editorSettings.iconSpritePath : iconFile}')`,
            backgroundPosition: `${((iconIndex) ? (iconIndex - 1) * -18 : 0)}px 0px`
        };
    }

    checkEditorSelection(eventObject) {
        let currentTarget = eventObject.target;
        do {
            if (currentTarget && currentTarget.className && currentTarget.className.indexOf('rte-') !== -1) {
                return false;
            }
        } while (currentTarget = currentTarget.parentNode);

        this.emit('deselected', this.activeEditableSegment, eventObject.target);
        this.previousActiveSegment = this.activeEditableSegment;
        this.activeEditableSegment = null;
        return false;
    }
}

class EditableHtmlSegment extends BaseComponent {
    constructor(originalElementWrapper, segmentOptions, parentEditor) {
        super();
        this.parentEditorInstance = parentEditor;
        this.originalElementWrapper = originalElementWrapper;
        this.targetDomWrapper = originalElementWrapper;
        this.segmentOptions = segmentOptions || {};

        this.initialHeightValue = (parseInt(originalElementWrapper.getComputedCssValue('height')) || originalElementWrapper.element.clientHeight) - 8;

        const isTextarea = (originalElementWrapper.element.nodeName.toLowerCase() === "textarea");
        if (isTextarea || this.segmentOptions.hasPanel) {
            const isLegacyIE7 = (ApplicationUtilities.isOldInternetExplorer() && !(typeof document.body.style.maxHeight !== "undefined" && document.compatMode === "CSS1Compat"));
            const containerStyleProps = {
                width: originalElementWrapper.getComputedCssValue('width') || originalElementWrapper.element.clientWidth + 'px',
                border: '1px solid #ccc',
                borderTop: '0',
                overflowY: 'auto',
                overflowX: 'hidden'
            };
            containerStyleProps[isLegacyIE7 ? 'height' : 'maxHeight'] = parentEditor.editorSettings.maxHeight ? parentEditor.editorSettings.maxHeight + 'px' : null;

            this.contentContainerWrapper = new DomWrapper('DIV')
                .applyCssStyles(containerStyleProps)
                .insertBefore(originalElementWrapper);

            this.editableContentArea = new DomWrapper('DIV')
                .applyCssStyles({ width: (parseInt(originalElementWrapper.getComputedCssValue('width')) || originalElementWrapper.element.clientWidth) - 8 + 'px', margin: '4px', minHeight: this.initialHeightValue + 'px' })
                .addCssClass('main')
                .appendInto(this.contentContainerWrapper);

            originalElementWrapper.applyCssStyles({ display: 'none' });

            this.editableContentArea.setHtmlContent(originalElementWrapper.element.innerHTML);
            if (isTextarea) {
                this.editableContentArea.setHtmlContent(originalElementWrapper.element.value);
                this.syncTargetElement = originalElementWrapper;
                const formAncestor = originalElementWrapper.findParentByTag('FORM');
                if (formAncestor) {
                    ApplicationUtilities.attachEventHandler(formAncestor.element, 'submit', this.saveContentToOriginal.bind(this));
                }
            }
            this.editableContentArea.applyCssStyles(isLegacyIE7 ? { height: this.initialHeightValue + 'px' } : { overflow: 'hidden' });
            this.targetDomWrapper = this.editableContentArea;
        }
        this.parentEditorInstance.on('deselected', this.handleBlur.bind(this));
        this.initializeSegment();
        this.handleBlur();
    }

    setup() {}

    initializeSegment() {
        this.targetDomWrapper.element.setAttribute('contentEditable', 'true');
        if (this.getHtmlContent() === "" && this.parentEditorInstance.editorSettings.insertLineBreakOnEmpty) {
            this.setHtmlContent('<br />');
        }
        this.documentView = document.defaultView;
        this.targetDomWrapper
            .addEvent('mousedown', this.handleFocus.bind(this))
            .addEvent('keypress', this.handleKeyPress.bind(this))
            .addEvent('focus', this.handleFocus.bind(this))
            .addEvent('blur', this.handleBlur.bind(this))
            .addEvent('keyup', this.handleFocus.bind(this));
        this.parentEditorInstance.emit('segmentAdded', this);
    }

    destroy() {
        this.saveContentToOriginal();
        if (this.syncTargetElement || this.segmentOptions.hasPanel) {
            this.contentContainerWrapper.removeFromParent();
            this.originalElementWrapper.applyCssStyles({ 'display': 'block' });
            this.parentEditorInstance.removeControlPanel();
        }
        this.targetDomWrapper.element.setAttribute('contentEditable', 'false');
        this.parentEditorInstance.emit('segmentRemoved', this);
    }

    getHtmlContent() {
        return this.targetDomWrapper.element.innerHTML;
    }

    setHtmlContent(htmlString) {
        this.targetDomWrapper.element.innerHTML = htmlString;
    }

    saveContentToOriginal() {
        if (this.syncTargetElement) {
            this.syncTargetElement.element.value = this.getHtmlContent();
        }
    }

    getCurrentSelection() {
        return (window.getSelection) ? window.getSelection() : document.selection;
    }

    getCurrentRange() {
        const selection = this.getCurrentSelection();
        if (!selection) { return null; }
        return (selection.rangeCount > 0) ? selection.getRangeAt(0) :
            selection.createRange && selection.createRange() || document.createRange();
    }

    applySelectionRange(rangeObject, selectionObject) {
        if (window.getSelection) {
            selectionObject.removeAllRanges();
            selectionObject.addRange(rangeObject);
        } else {
            rangeObject.select();
        }
    }

    getSelectionTargetElement() {
        const range = this.getCurrentRange();
        if (range && range.startContainer) {
            let container = range.startContainer;
            if (range.cloneContents().childNodes.length === 1) {
                return container.nodeType === 1 ? container : container.parentNode;
            }
            return container;
        }
        return null;
    }

    performCommand(command, value) {
        if (document.execCommand) {
            this.targetDomWrapper.element.focus();
            document.execCommand(command, false, value);
        }
    }

    handleFocus() {
        if (this.parentEditorInstance.activeEditableSegment !== this) {
            if (this.parentEditorInstance.activeEditableSegment) {
                this.parentEditorInstance.emit('deselected', this.parentEditorInstance.activeEditableSegment, this.targetDomWrapper.element);
            }
            this.parentEditorInstance.activeEditableSegment = this;
            this.parentEditorInstance.emit('selected', this);
        }
    }

    handleBlur() {
        this.parentEditorInstance.emit('blurred', this);
    }

    handleKeyPress(eventObject) {
        this.parentEditorInstance.emit('keyPress', this, eventObject);
    }
}

class IFrameHtmlSegment extends EditableHtmlSegment {
    setup(...args) {
        super.setup(...args);
    }
}

class EditorToolbarPanel extends DomWrapper {
    constructor(panelWrapper, settings, editor) {
        super(panelWrapper);
        this.editorSettings = settings;
        this.parentEditor = editor;
    }
}