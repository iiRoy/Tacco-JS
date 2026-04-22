/* Divergent Editor System - Type IV Clone */

// Core Utilities (replacement for bkLib)
const CoreUtilities = (() => {
    const checkLegacyIE = (navigator.userAgent.indexOf("MSIE") !== -1);

    const attachDomEvent = (element, eventType, handler) => {
        element.addEventListener(eventType, handler, false);
    };

    const convertIterableToArray = (iterable) => Array.from(iterable);

    const preventTextSelection = (element) => {
        if (element.setAttribute && element.nodeName.toLowerCase() !== 'input' && element.nodeName.toLowerCase() !== 'textarea') {
            element.setAttribute('unselectable', 'on');
        }
        Array.from(element.children).forEach(child => preventTextSelection(child));
    };

    const convertToCamelCase = (inputString) => inputString.replace(/-(.)/g, (match, char) => char.toUpperCase());

    const retrieveItemIndex = (collection, item) => collection.findIndex(val => val === item);

    const hasCollectionItem = (collection, item) => collection.includes(item);

    const preventDefaultAndPropagation = (event) => {
        event = event || window.event;
        if (event.preventDefault && event.stopPropagation) {
            event.preventDefault();
            event.stopPropagation();
        }
        return false;
    };

    let documentReadyCallbacks = [];
    let documentIsReady = false;

    const executeDocumentReadyCallbacks = () => {
        if (documentIsReady) return;
        documentIsReady = true;
        documentReadyCallbacks.forEach(callback => callback());
    };

    const onDocumentContentLoaded = (callback) => {
        documentReadyCallbacks.push(callback);
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            executeDocumentReadyCallbacks();
        } else {
            document.addEventListener("DOMContentLoaded", executeDocumentReadyCallbacks, { once: true });
            window.addEventListener("load", executeDocumentReadyCallbacks, { once: true });
        }
    };

    return {
        isOldIE: checkLegacyIE,
        attachEvent: attachDomEvent,
        toArray: convertIterableToArray,
        disableSelection: preventTextSelection,
        camelCase: convertToCamelCase,
        indexOfItem: retrieveItemIndex,
        hasItem: hasCollectionItem,
        stopEvent: preventDefaultAndPropagation,
        whenReady: onDocumentContentLoaded
    };
})();

// Base Class System (replacement for bkClass and bkExtend)
class BaseComponent {
    constructor(...args) {
        if (new.target === BaseComponent) {
            // Allow direct instantiation for internal mechanisms like 'augment'
            // but for user-facing classes, enforce subclasses.
        }
        this.initialize(...args);
    }

    initialize() {
        // Default constructor logic, intended to be overridden by subclasses
    }

    static augment(definition) {
        const ParentConstructor = this;
        class DerivedConstructor extends ParentConstructor {
            constructor(...args) {
                if (args[0] === ParentConstructor) {
                    super(); // Internal call from augment, don't pass args to parent initialize
                } else {
                    super(...args); // Normal construction, pass args
                }
            }
        }

        Object.assign(DerivedConstructor.prototype, definition);

        if (definition.construct) {
            DerivedConstructor.prototype.initialize = definition.construct;
        }

        DerivedConstructor.augment = ParentConstructor.augment;
        
        return DerivedConstructor;
    }
}

// Function to merge properties into an object (replacement for bkExtend)
const assignProperties = (target, source) => Object.assign(target, source);

// DOM Element Wrapper (replacement for bkElement and $BK)
class DomWrapper {
    constructor(elementToWrap) {
        if (!elementToWrap instanceof HTMLElement && !elementToWrap instanceof SVGElement) {
            throw new Error("DomWrapper must be initialized with an HTMLElement or SVGElement.");
        }
        this.domNode = elementToWrap;
    }

    static findOrCreate(input, contextDocument = document) {
        if (input instanceof DomWrapper) {
            return input;
        }

        let resolvedNode = null;
        if (typeof input === "string") {
            resolvedNode = contextDocument.getElementById(input);
            if (!resolvedNode) {
                resolvedNode = contextDocument.createElement(input);
            }
        } else if (input instanceof HTMLElement || input instanceof SVGElement) {
            resolvedNode = input;
        } else {
            throw new Error("Invalid input for DomWrapper.findOrCreate: must be string, HTMLElement, SVGElement, or DomWrapper instance.");
        }
        
        return new DomWrapper(resolvedNode);
    }

    appendInto(targetWrapper) {
        targetWrapper.domNode.appendChild(this.domNode);
        return this;
    }

    insertPriorTo(targetWrapper) {
        targetWrapper.domNode.parentNode.insertBefore(this.domNode, targetWrapper.domNode);
        return this;
    }

    on(eventType, handler) {
        CoreUtilities.attachEvent(this.domNode, eventType, handler);
        return this;
    }

    assignContent(htmlString) {
        this.domNode.innerHTML = htmlString;
        return this;
    }

    getRelativePosition() {
        let currentLeft = 0;
        let currentTop = 0;
        let currentDom = this.domNode;
        if (currentDom.offsetParent) {
            do {
                currentLeft += currentDom.offsetLeft;
                currentTop += currentDom.offsetTop;
            } while (currentDom = currentDom.offsetParent);
        }
        const borderStyle = this.retrieveStyle('border-width');
        const borderThickness = (!window.opera) ? parseInt(borderStyle || this.domNode.style.borderWidth) || 0 : 0;
        return [currentLeft + borderThickness, currentTop + borderThickness + this.domNode.offsetHeight];
    }

    disableUserSelection() {
        CoreUtilities.disableSelection(this.domNode);
        return this;
    }

    findAncestorWithTag(tagName) {
        let current = this.domNode;
        const upperTagName = tagName.toUpperCase();
        while (current) {
            if (current.nodeName && current.nodeName.toUpperCase() === upperTagName) {
                return DomWrapper.findOrCreate(current);
            }
            current = current.parentNode;
        }
        return null;
    }

    hasClassName(name) {
        return this.domNode.classList.contains('Editor-' + name);
    }

    addClassName(name) {
        if (!this.hasClassName(name)) {
            this.domNode.classList.add('Editor-' + name);
        }
        return this;
    }

    removeClassName(name) {
        if (this.hasClassName(name)) {
            this.domNode.classList.remove('Editor-' + name);
        }
        return this;
    }

    applyStyles(styleObject) {
        const nodeStyle = this.domNode.style;
        for (const property in styleObject) {
            switch (property) {
                case 'float':
                    nodeStyle.cssFloat = nodeStyle.styleFloat = styleObject[property];
                    break;
                case 'opacity':
                    nodeStyle.opacity = styleObject[property];
                    nodeStyle.filter = `alpha(opacity=${Math.round(styleObject[property] * 100)})`;
                    break;
                case 'className':
                    this.domNode.className = styleObject[property];
                    break;
                default:
                    nodeStyle[property] = styleObject[property];
            }
        }
        return this;
    }

    retrieveStyle(cssProperty, targetDocument = document) {
        if (this.domNode.nodeType !== 1) return null;

        const computedStyle = targetDocument.defaultView.getComputedStyle(this.domNode, null);
        if (computedStyle) {
            return computedStyle.getPropertyValue(cssProperty);
        } else if (this.domNode.currentStyle) {
            return this.domNode.currentStyle[CoreUtilities.camelCase(cssProperty)];
        }
        return null;
    }

    erase() {
        if (this.domNode.parentNode) {
            this.domNode.parentNode.removeChild(this.domNode);
        }
        return this;
    }

    setAttributes(attributeMap) {
        for (const key in attributeMap) {
            this.domNode.setAttribute(key, attributeMap[key]);
        }
        return this;
    }

    get innerHTML() { return this.domNode.innerHTML; }
    set innerHTML(value) { this.domNode.innerHTML = value; }
    get value() { return this.domNode.value; }
    set value(val) { this.domNode.value = val; }
    get className() { return this.domNode.className; }
    set className(val) { this.domNode.className = val; }
    get nodeName() { return this.domNode.nodeName; }
    get nodeType() { return this.domNode.nodeType; }
    get parentNode() { return DomWrapper.findOrCreate(this.domNode.parentNode); }
    get childNodes() { return CoreUtilities.toArray(this.domNode.childNodes).map(node => DomWrapper.findOrCreate(node)); }
    get clientWidth() { return this.domNode.clientWidth; }
    get clientHeight() { return this.domNode.clientHeight; }
    get offsetHeight() { return this.domNode.offsetHeight; }
    get style() { return this.domNode.style; }
    get element() { return this.domNode; } // Expose raw DOM node
}

// Event Dispatcher Mixin (replacement for bkEvent)
class EventDispatcher {
    constructor() {
        this._listeners = new Map();
    }

    registerHandler(eventType, handler) {
        if (!this._listeners.has(eventType)) {
            this._listeners.set(eventType, []);
        }
        this._listeners.get(eventType).push(handler);
        return this;
    }

    triggerEvent(eventType, ...args) {
        if (this._listeners.has(eventType)) {
            this._listeners.get(eventType).forEach(handler => {
                handler.apply(this, args);
            });
        }
    }
}

const applyEventHandling = (targetClass) => {
    Object.assign(targetClass.prototype, new EventDispatcher());
    targetClass.prototype.addEvent = targetClass.prototype.registerHandler;
    targetClass.prototype.fireEvent = targetClass.prototype.triggerEvent;
};

// Localization (replacement for __ function)
const translator = (phrase) => phrase;

// Editor Configuration (replacement for nicEditorConfig)
class EditorConfiguration {
    constructor(initialOptions = {}) {
        this.buttonDefinitions = {
            'strong': { label: translator('Click to Bold'), command: 'Bold', tags: ['B', 'STRONG'], css: { 'font-weight': 'bold' }, shortcut: 'b' },
            'emphasis': { label: translator('Click to Italic'), command: 'Italic', tags: ['EM', 'I'], css: { 'font-style': 'italic' }, shortcut: 'i' },
            'underline': { label: translator('Click to Underline'), command: 'Underline', tags: ['U'], css: { 'text-decoration': 'underline' }, shortcut: 'u' },
            'alignLeft': { label: translator('Left Align'), command: 'justifyleft', noActivation: true },
            'alignCenter': { label: translator('Center Align'), command: 'justifycenter', noActivation: true },
            'alignRight': { label: translator('Right Align'), command: 'justifyright', noActivation: true },
            'alignJustify': { label: translator('Justify Align'), command: 'justifyfull', noActivation: true },
            'orderedList': { label: translator('Insert Ordered List'), command: 'insertorderedlist', tags: ['OL'] },
            'unorderedList': { label: translator('Insert Unordered List'), command: 'insertunorderedlist', tags: ['UL'] },
            'subscript': { label: translator('Click to Subscript'), command: 'subscript', tags: ['SUB'] },
            'superscript': { label: translator('Click to Superscript'), command: 'superscript', tags: ['SUP'] },
            'strikeThrough': { label: translator('Click to Strike Through'), command: 'strikeThrough', css: { 'text-decoration': 'line-through' } },
            'clearFormat': { label: translator('Remove Formatting'), command: 'removeformat', noActivation: true },
            'indentText': { label: translator('Indent Text'), command: 'indent', noActivation: true },
            'outdentText': { label: translator('Remove Indent'), command: 'outdent', noActivation: true },
            'horizontalRule': { label: translator('Horizontal Rule'), command: 'insertHorizontalRule', noActivation: true }
        };
        this.iconSpritePath = '../nicEditorIcons.gif';
        this.enabledButtons = ['save', 'strong', 'emphasis', 'underline', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'orderedList', 'unorderedList', 'fontSize', 'fontFamily', 'fontFormat', 'indentText', 'outdentText', 'image', 'upload', 'link', 'unlink', 'forecolor', 'bgcolor'];
        this.iconPositionMap = { "markup":1,"backgroundC":2,"foregroundC":3,"strong":4,"alignCenter":5,"horizontalRule":6,"indentText":7,"emphasis":8,"alignJustify":9,"alignLeft":10,"orderedList":11,"outdentText":12,"clearFormat":13,"alignRight":14,"save":25,"strikeThrough":16,"subscript":17,"superscript":18,"unorderedList":19,"underline":20,"image":21,"link":22,"unlink":23,"close":24,"arrow":26,"upload":27 };
        
        assignProperties(this, initialOptions);
    }
}

// Global Editor Registry (replacement for nicEditors)
class GlobalEditorRegistry {
    constructor() {
        this._pluginDefinitions = [];
        this._activeEditors = [];
    }

    registerPlugin(pluginClass, pluginOptions) {
        this._pluginDefinitions.push({ processor: pluginClass, settings: pluginOptions });
    }

    initializeAllTextAreas(editorOptions) {
        const textAreas = document.getElementsByTagName("textarea");
        const newEditors = [];
        for (let i = 0; i < textAreas.length; i++) {
            const editor = new RichTextEditor(editorOptions).setupPanel(DomWrapper.findOrCreate(textAreas[i]));
            this._activeEditors.push(editor);
            newEditors.push(editor);
        }
        return newEditors;
    }

    retrieveEditor(element) {
        const targetElement = DomWrapper.findOrCreate(element);
        for (let i = 0; i < this._activeEditors.length; i++) {
            const instance = this._activeEditors[i].findInstanceByElement(targetElement);
            if (instance) {
                return this._activeEditors[i]; // Return the main editor instance
            }
        }
        return null;
    }

    getPluginDefinitions() {
        return this._pluginDefinitions;
    }

    getAllEditors() {
        return this._activeEditors;
    }
}
const EditorManager = new GlobalEditorRegistry();

// Main Rich Text Editor (replacement for nicEditor)
class RichTextEditor extends BaseComponent {
    initialize(options) {
        this.configuration = new EditorConfiguration(options);
        this.activeContentInstances = [];
        this.instantiatedPlugins = [];
        
        const pluginDefs = EditorManager.getPluginDefinitions();
        for (let i = 0; i < pluginDefs.length; i++) {
            this.instantiatedPlugins.push(new pluginDefs[i].processor(this, pluginDefs[i].settings));
        }
        EditorManager.getAllEditors().push(this);
        CoreUtilities.attachEvent(document.body, 'mousedown', this.handleGlobalSelectionChange.bind(this));
    }

    setupPanel(elementWrapper, options) {
        elementWrapper = this.prepareElementForActivation(elementWrapper);
        const panelContainer = DomWrapper.findOrCreate('DIV')
            .applyStyles({ width: (parseInt(elementWrapper.retrieveStyle('width')) || elementWrapper.clientWidth) + 'px' })
            .insertPriorTo(elementWrapper);
        this.associatePanel(panelContainer);
        return this.addContentInstance(elementWrapper, options);
    }

    prepareElementForActivation(targetElement) {
        const existingEditor = EditorManager.retrieveEditor(targetElement);
        if (existingEditor) {
            existingEditor.removeContentInstance(targetElement);
            existingEditor.removeEditorPanel();
        }
        return targetElement;
    }

    addContentInstance(elementWrapper, options) {
        elementWrapper = this.prepareElementForActivation(elementWrapper);
        let newContentInstance;
        if (elementWrapper.element.contentEditable || window.opera) {
            newContentInstance = new ContentEditableInstance(elementWrapper, options, this);
        } else {
            newContentInstance = new IFrameEditableInstance(elementWrapper, options, this);
        }
        this.activeContentInstances.push(newContentInstance);
        return this;
    }

    removeContentInstance(elementWrapper) {
        const targetElement = DomWrapper.findOrCreate(elementWrapper);
        const instances = this.activeContentInstances;
        for (let i = 0; i < instances.length; i++) {
            if (instances[i].wrappedDomNode.element === targetElement.element) {
                instances[i].destroyInstance();
                this.activeContentInstances.splice(i, 1);
                return;
            }
        }
    }

    removeEditorPanel() {
        if (this.currentEditorPanel) {
            this.currentEditorPanel.erase();
            this.currentEditorPanel = null;
        }
    }

    findInstanceByElement(elementWrapper) {
        const targetElement = DomWrapper.findOrCreate(elementWrapper);
        for (let i = 0; i < this.activeContentInstances.length; i++) {
            if (this.activeContentInstances[i].wrappedDomNode.element === targetElement.element) {
                return this.activeContentInstances[i];
            }
        }
        return null;
    }

    associatePanel(panelElementWrapper) {
        this.currentEditorPanel = new EditorPanel(panelElementWrapper, this.configuration, this);
        this.fireEvent('panelReady', this.currentEditorPanel);
        return this;
    }

    executeEditorCommand(command, args) {
        if (this.currentlyFocusedInstance) {
            this.currentlyFocusedInstance.applyCommand(command, args);
        }
    }

    getButtonIcon(iconKey, options) {
        const iconData = this.configuration.iconPositionMap[iconKey];
        const customFilePath = (options && options.iconFiles) ? options.iconFiles[iconKey] : '';
        return {
            backgroundImage: `url('${(iconData ? this.configuration.iconSpritePath : customFilePath)}')`,
            backgroundPosition: `${(iconData ? (iconData - 1) * -18 : 0)}px 0px`
        };
    }

    handleGlobalSelectionChange(event, targetElement) {
        let currentTarget = targetElement;
        do {
            if (currentTarget && currentTarget.className && currentTarget.className.indexOf('Editor-') !== -1) {
                return false;
            }
        } while (currentTarget = currentTarget.parentNode);

        this.fireEvent('editorLostFocus', this.currentlyFocusedInstance, targetElement);
        this.previousFocusedInstance = this.currentlyFocusedInstance;
        this.currentlyFocusedInstance = null;
        return false;
    }
}
applyEventHandling(RichTextEditor);

// Content Editable Instance (replacement for nicEditorInstance)
class ContentEditableInstance extends BaseComponent {
    initialize(elementWrapper, options, parentEditor) {
        this.isCurrentlySelected = false;
        this.parentEditorInstance = parentEditor;
        this.wrappedDomNode = elementWrapper;
        this.instanceOptions = options || {};

        const initialWidth = parseInt(elementWrapper.retrieveStyle('width')) || elementWrapper.clientWidth;
        const initialHeight = parseInt(elementWrapper.retrieveStyle('height')) || elementWrapper.clientHeight;
        this.initialContentAreaHeight = initialHeight - 8;

        const isTextareaElement = (elementWrapper.nodeName.toLowerCase() === "textarea");
        if (isTextareaElement || this.instanceOptions.hasPanel) {
            const isLegacyIE7 = (CoreUtilities.isOldIE && !((typeof document.body.style.maxHeight !== "undefined") && document.compatMode === "CSS1Compat"));
            const containerStyles = {
                width: initialWidth + 'px',
                border: '1px solid #ccc',
                borderTop: 0,
                overflowY: 'auto',
                overflowX: 'hidden'
            };
            containerStyles[(isLegacyIE7) ? 'height' : 'maxHeight'] = (this.parentEditorInstance.configuration.maxHeight) ? this.parentEditorInstance.configuration.maxHeight + 'px' : null;
            
            this.editorContainerWrapper = DomWrapper.findOrCreate('DIV').applyStyles(containerStyles).insertPriorTo(elementWrapper);
            
            const editableStyles = {
                width: (initialWidth - 8) + 'px',
                margin: '4px',
                minHeight: initialHeight + 'px'
            };
            this.editableContentWrapper = DomWrapper.findOrCreate('DIV').applyStyles(editableStyles).addClassName('main-content').appendInto(this.editorContainerWrapper);

            elementWrapper.applyStyles({ display: 'none' });

            this.editableContentWrapper.assignContent(elementWrapper.innerHTML);
            if (isTextareaElement) {
                this.editableContentWrapper.assignContent(elementWrapper.value);
                this.originalFormElement = elementWrapper;
                const parentForm = elementWrapper.findAncestorWithTag('FORM');
                if (parentForm) {
                    CoreUtilities.attachEvent(parentForm.element, 'submit', this.saveContentToOriginal.bind(this));
                }
            }
            this.editableContentWrapper.applyStyles((isLegacyIE7) ? { height: initialHeight + 'px' } : { overflow: 'hidden' });
            this.wrappedDomNode = this.editableContentWrapper;
        }
        this.parentEditorInstance.addEvent('editorLostFocus', this.onEditorLostFocus.bind(this));

        this.activateEditing();
        this.onEditorLostFocus(); // Initial blur state
    }

    activateEditing() {
        this.wrappedDomNode.element.setAttribute('contentEditable', 'true');
        if (this.retrieveContent() === "") {
            this.updateContent('<br />');
        }
        this.currentDocumentContext = document;
        this.wrappedDomNode.on('mousedown', this.onSelectionFocus.bind(this))
                           .on('keypress', this.onKeyPressEvent.bind(this))
                           .on('focus', this.onSelectionFocus.bind(this))
                           .on('blur', this.onEditorLostFocus.bind(this))
                           .on('keyup', this.onSelectionFocus.bind(this));
        this.parentEditorInstance.fireEvent('contentInstanceActivated', this);
    }

    destroyInstance() {
        this.saveContentToOriginal();
        if (this.originalFormElement || this.instanceOptions.hasPanel) {
            this.editorContainerWrapper.erase();
            this.originalFormElement.applyStyles({ 'display': 'block' });
            this.parentEditorInstance.removeEditorPanel();
        }
        this.deactivateEditing();
        this.parentEditorInstance.fireEvent('contentInstanceRemoved', this);
    }

    deactivateEditing() {
        this.wrappedDomNode.element.setAttribute('contentEditable', 'false');
    }

    getSelectionObject() {
        return window.getSelection();
    }

    getRangeObject() {
        const currentSelection = this.getSelectionObject();
        if (!currentSelection) { return null; }
        return (currentSelection.rangeCount > 0) ? currentSelection.getRangeAt(0) : document.createRange();
    }

    setRangeToSelection(range, selection) {
        if (window.getSelection) {
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            range.select();
        }
    }

    getCurrentlySelectedDomElement() {
        const currentRange = this.getRangeObject();
        if (currentRange && currentRange.startContainer) {
            let containerNode = currentRange.startContainer;
            if (containerNode.nodeType === Node.TEXT_NODE) {
                containerNode = containerNode.parentNode;
            }
            return DomWrapper.findOrCreate(containerNode);
        }
        return null;
    }
    
    onSelectionFocus(event, target) {
        this.parentEditorInstance.currentlyFocusedInstance = this;
        this.parentEditorInstance.fireEvent('instanceGainedFocus', this, target);
    }

    onEditorLostFocus() {
        this.isCurrentlySelected = false;
    }

    onKeyPressEvent(event) {
        this.parentEditorInstance.fireEvent('keyPressOccurred', this, event);
    }

    applyCommand(command, args) {
        this.wrappedDomNode.element.focus();
        this.currentDocumentContext.execCommand(command, false, args);
        this.parentEditorInstance.fireEvent('commandExecuted', this, command, args);
    }

    retrieveContent() {
        return this.wrappedDomNode.innerHTML;
    }

    updateContent(content) {
        this.wrappedDomNode.assignContent(content);
    }

    saveContentToOriginal() {
        if (this.originalFormElement) {
            this.originalFormElement.value = this.retrieveContent();
        }
    }
}

class IFrameEditableInstance extends ContentEditableInstance {
    initialize(elementWrapper, options, parentEditor) {
        super(elementWrapper, options, parentEditor);
        // This is a placeholder for iframe-specific setup.
        // A full implementation would involve:
        // 1. Creating and embedding an iframe element.
        // 2. Setting up the iframe's contentDocument for editing.
        // 3. Overriding methods like `currentDocumentContext` and `wrappedDomNode`
        //    to point to the iframe's document and body, respectively.
        // 4. Attaching event listeners to the iframe's contentDocument.
        // This represents a significant divergence in how the editable area is managed.
    }
}

// Editor Panel (replacement for nicEditorPanel)
class EditorPanel extends BaseComponent {
    initialize(panelElementWrapper, configuration, editorInstance) {
        this.panelWrapper = panelElementWrapper;
        this.config = configuration;
        this.editor = editorInstance;
        // Logic to build buttons based on this.config.enabledButtons and this.config.buttonDefinitions
        // Each button would have an event listener that calls this.editor.executeEditorCommand
    }

    erase() {
        this.panelWrapper.erase();
    }
}