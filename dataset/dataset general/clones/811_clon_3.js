/* Text Editor Core - Micro Inline WYSIWYG
 * Copyright 2023-2024 Your Name/Organization
 *
 * This software is distributed under an alternative permissive license.
 * For more details, refer to the project's documentation.
 * Please retain this notice in all derived works.
 */

// Utility function to merge properties from a source object into a target object.
const utilAssignProps = (...inputArguments) => {
    // If only one argument is provided, assume 'this' is the target.
    if (inputArguments.length === 1) {
        inputArguments.unshift(this);
    }

    const [targetObject, sourceObject] = inputArguments;

    // Ensure sourceObject is iterable; guard against null/undefined.
    if (sourceObject && typeof sourceObject === 'object') {
        for (const propertyKey in sourceObject) {
            // Check if the property belongs to the sourceObject itself, not its prototype chain.
            if (Object.prototype.hasOwnProperty.call(sourceObject, propertyKey)) {
                targetObject[propertyKey] = sourceObject[propertyKey];
            }
        }
    }
    return targetObject;
};

// Base class for inheritance.
function BaseObject() {
    // This constructor is intentionally empty.
}

// Default constructor for derived classes.
BaseObject.prototype.initialize = function() { /* No-op by default */ };

// Static method to extend BaseObject or its derivatives.
BaseObject.extend = function(definitionObject) {
    // A new constructor function for the derived class.
    const ConstructorFn = function(...args) {
        // Prevent calling initialize during prototype chain construction.
        if (args[0] !== BaseObject) {
            // Call the instance's initialize method with provided arguments.
            return this.initialize.apply(this, args);
        }
    };

    // Create an instance of the current class (e.g., BaseObject or a derived class)
    // using a dummy argument to skip its `initialize` call.
    const prototypeInstance = new this(BaseObject);

    // Merge properties from the definitionObject into the new prototype.
    utilAssignProps(prototypeInstance, definitionObject);

    // Set the prototype of the new constructor.
    ConstructorFn.prototype = prototypeInstance;

    // Preserve the extend method for further inheritance.
    ConstructorFn.extend = this.extend;

    return ConstructorFn;
};

// Class for DOM element manipulation.
const DomManipulator = BaseObject.extend({
    // Initializes the DomManipulator instance.
    initialize: function(elementNode, docRef = document) {
        // If a string is passed, create a new element.
        if (typeof elementNode === 'string') {
            elementNode = docRef.createElement(elementNode);
        }
        // Wrap the element with our utility functions if it's not already.
        return getDomElement(elementNode);
    },

    // Appends the current element to another element.
    appendTo: function(targetParent) {
        targetParent.appendChild(this);
        return this;
    },

    // Inserts the current element before another element.
    insertPreceding: function(siblingElement) {
        const parentOfSibling = siblingElement.parentNode;
        // Ensure parent exists before attempting insertion.
        if (parentOfSibling) {
            parentOfSibling.insertBefore(this, siblingElement);
        }
        return this;
    },

    // Attaches an event listener to the element.
    onEvent: function(eventType, eventHandler) {
        CoreUtils.addDomListener(this, eventType, eventHandler);
        return this;
    },

    // Sets the inner HTML content of the element.
    setHtmlContent: function(contentHtml) {
        this.innerHTML = contentHtml;
        return this;
    },

    // Calculates the absolute position and bottom-edge Y coordinate of the element.
    getAbsolutePosition: function() {
        let currentX = 0;
        let currentY = 0;
        let currentElement = this;

        // Traverse up the offsetParent chain to accumulate positions.
        while (currentElement && currentElement.offsetParent) {
            currentX += currentElement.offsetLeft;
            currentY += currentElement.offsetTop;
            currentElement = currentElement.offsetParent;
        }

        // Calculate border offset, handling browser differences.
        const borderOffset = (!window.opera) ?
            parseInt(this.getComputedStyle('border-width') || this.style.border) || 0 :
            0;

        // Return [left + border, top + height + border]
        return [currentX + borderOffset, currentY + borderOffset + this.offsetHeight];
    },

    // Prevents text selection on the element.
    preventSelection: function() {
        CoreUtils.disableSelection(this);
        return this;
    },

    // Finds the closest parent element with a specific tag name.
    findParentByTag: function(tagName) {
        let elementNode = this;
        const normalizedTagName = tagName.toUpperCase();

        // Loop upwards through the DOM tree.
        while (elementNode) {
            if (elementNode.nodeName && elementNode.nodeName.toUpperCase() === normalizedTagName) {
                return elementNode;
            }
            elementNode = elementNode.parentNode;
        }
        return null; // Return null if no matching parent is found.
    },

    // Checks if the element has a specific CSS class.
    hasCssClass: function(classNameString) {
        // Ensure className exists before attempting regex match.
        if (!this.className) return false;
        // Regex to match the class name, allowing for nicEdit- prefix variation.
        return new RegExp(`(?:^|\\s)nicEdit-${classNameString}(?:\\s|$)`).test(this.className);
    },

    // Adds a CSS class to the element.
    addCssClass: function(classNameString) {
        if (!this.hasCssClass(classNameString)) {
            // Append with a space if existing classes are present.
            this.className += (this.className ? ' ' : '') + `nicEdit-${classNameString}`;
        }
        return this;
    },

    // Removes a CSS class from the element.
    removeCssClass: function(classNameString) {
        if (this.hasCssClass(classNameString)) {
            // Use replace to remove the class and handle extra spaces.
            this.className = this.className.replace(new RegExp(`(?:^|\\s)nicEdit-${classNameString}(?:\\s|$)`, 'g'), ' ').trim();
        }
        return this;
    },

    // Sets multiple CSS styles on the element.
    applyStyles: function(styleProperties) {
        const targetStyle = this.style;

        // Iterate over the provided style properties.
        for (const styleKey in styleProperties) {
            if (Object.prototype.hasOwnProperty.call(styleProperties, styleKey)) {
                const value = styleProperties[styleKey];
                switch (styleKey) {
                    case 'float':
                        // Handle browser-specific float properties.
                        targetStyle.cssFloat = targetStyle.styleFloat = value;
                        break;
                    case 'opacity':
                        // Handle opacity for various browsers, including old IE.
                        targetStyle.opacity = value;
                        targetStyle.filter = `alpha(opacity=${Math.round(value * 100)})`;
                        break;
                    case 'className':
                        // Special case: if 'className' is in styleProperties, update the element's class.
                        this.className = value;
                        break;
                    default:
                        // Apply other styles directly.
                        targetStyle[styleKey] = value;
                }
            }
        }
        return this;
    },

    // Retrieves the computed style value for a given CSS rule.
    getComputedStyle: function(styleRuleName, documentView = document.defaultView) {
        // Only applies to element nodes.
        if (this.nodeType !== Node.ELEMENT_NODE) {
            return undefined;
        }
        // Use getComputedStyle for modern browsers or currentStyle for older IE.
        return (documentView && documentView.getComputedStyle) ?
            documentView.getComputedStyle(this, null).getPropertyValue(styleRuleName) :
            this.currentStyle[CoreUtils.camelCase(styleRuleName)];
    },

    // Removes the element from its parent.
    removeNode: function() {
        const parentNode = this.parentNode;
        if (parentNode) {
            parentNode.removeChild(this);
        }
        return this;
    },

    // Sets multiple attributes on the element.
    setElementAttributes: function(attributesObject) {
        for (const attributeKey in attributesObject) {
            if (Object.prototype.hasOwnProperty.call(attributesObject, attributeKey)) {
                this.setAttribute(attributeKey, attributesObject[attributeKey]);
            }
        }
        return this;
    }
});

// Core utility library for common operations.
const CoreUtils = {
    // Flag to detect legacy Internet Explorer.
    isLegacyIE: (navigator.userAgent.indexOf("MSIE") !== -1),

    // Adds a DOM event listener.
    addDomListener: function(elementNode, eventType, eventHandler) {
        if (elementNode.addEventListener) {
            elementNode.addEventListener(eventType, eventHandler, false);
        } else if (elementNode.attachEvent) {
            elementNode.attachEvent(`on${eventType}`, eventHandler);
        }
    },

    // Converts an iterable (like NodeList or arguments) to a true Array.
    convertToArray: function(collection) {
        // Use Array.from for modern environments, fallback for older ones.
        if (Array.from) {
            return Array.from(collection);
        }
        const convertedArray = [];
        for (let i = 0; i < collection.length; i++) {
            convertedArray.push(collection[i]);
        }
        return convertedArray;
    },

    // Prevents text selection on an element and its children.
    disableSelection: function(targetElement) {
        // Apply 'unselectable' attribute for IE.
        if (targetElement.setAttribute && !['input', 'textarea'].includes(targetElement.nodeName.toLowerCase())) {
            targetElement.setAttribute('unselectable', 'on');
        }
        // Recursively apply to child nodes.
        CoreUtils.convertToArray(targetElement.childNodes).forEach(childNode => {
            CoreUtils.disableSelection(childNode);
        });
    },

    // Converts a hyphen-separated string to camelCase.
    camelCase: function(inputString) {
        return inputString.replace(/-(.)/g, (match, letter) => letter.toUpperCase());
    },

    // Checks if an item exists in an array.
    isItemInArray: function(targetArray, searchItem) {
        return CoreUtils.findItemIndex(targetArray, searchItem) !== -1;
    },

    // Finds the index of an item in an array, returns -1 if not found.
    findItemIndex: function(targetArray, searchItem) {
        if (!Array.isArray(targetArray)) return -1; // Guard clause
        for (let i = 0; i < targetArray.length; i++) {
            if (targetArray[i] === searchItem) {
                return i;
            }
        }
        return -1;
    },

    // Cancels an event's default action and stops propagation.
    haltEvent: function(eventObject) {
        eventObject = eventObject || window.event;
        if (eventObject.preventDefault) {
            eventObject.preventDefault();
        }
        if (eventObject.stopPropagation) {
            eventObject.stopPropagation();
        }
        // For older IE, set returnValue to false.
        if (eventObject.returnValue !== undefined) {
            eventObject.returnValue = false;
        }
        return false;
    },

    // Array to store functions to be executed when the DOM is ready.
    deferredLoads: [],
    // Flag to ensure deferred loads only run once.
    _domReadyExecuted: false,

    // Executes all registered deferred load functions.
    performDeferredLoads: function() {
        if (CoreUtils._domReadyExecuted) {
            return;
        }
        CoreUtils._domReadyExecuted = true;
        CoreUtils.deferredLoads.forEach(callbackFn => callbackFn());
    },

    // Registers a function to be called when the DOM is ready.
    onDomReady: function(callbackFn) {
        CoreUtils.deferredLoads.push(callbackFn);

        // Modern browsers using DOMContentLoaded.
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", CoreUtils.performDeferredLoads, null);
        }
        // Legacy IE handling for document ready.
        else if (CoreUtils.isLegacyIE) {
            // Inject a script for IE's defer readyState check.
            const scriptId = '__ie_deferred_load';
            if (!document.getElementById(scriptId)) {
                document.write(
                    `<style>.nicEdit-main p { margin: 0; }</style>` +
                    `<scr` + `ipt id=${scriptId} defer ` +
                    ((location.protocol === "https:") ? "src='javascript:void(0)'" : "src=//0") +
                    `><\/scr` + `ipt>`
                );
                const ieOnloadScript = document.getElementById(scriptId);
                if (ieOnloadScript) {
                    ieOnloadScript.onreadystatechange = function() {
                        if (this.readyState === "complete") {
                            CoreUtils.performDeferredLoads();
                        }
                    };
                }
            }
        }
        // Fallback for all browsers: window.onload.
        // This will always fire, even if DOMContentLoaded already did,
        // but performDeferredLoads has a guard to run only once.
        window.onload = CoreUtils.performDeferredLoads;
    }
};

// Global shorthand for getting/wrapping DOM elements.
const getDomElement = (elementRef) => {
    // If a string, treat as an ID and fetch the element.
    if (typeof elementRef === "string") {
        elementRef = document.getElementById(elementRef);
    }
    // If the element exists and is not already a DomManipulator instance,
    // extend it with DomManipulator's prototype methods.
    if (elementRef && !elementRef.appendTo) {
        utilAssignProps(elementRef, DomManipulator.prototype);
    }
    return elementRef;
};

// Mixin for event dispatching capabilities.
const EventDispatcher = {
    // Adds an event handler for a specific event type.
    addEventHandler: function(eventType, handlerFn) {
        if (typeof handlerFn === 'function') {
            this.registeredEvents = this.registeredEvents || {};
            this.registeredEvents[eventType] = this.registeredEvents[eventType] || [];
            this.registeredEvents[eventType].push(handlerFn);
        }
        return this;
    },

    // Fires all registered handlers for a given event type.
    triggerEvent: function(...inputArguments) {
        const eventType = inputArguments.shift(); // First argument is event type.
        if (this.registeredEvents && this.registeredEvents[eventType]) {
            this.registeredEvents[eventType].forEach(handlerFn => {
                handlerFn.apply(this, inputArguments);
            });
        }
    }
};

// Simple localization placeholder function.
const _ = (text) => text;

// Extends Function.prototype to create a bound function (closure).
// Note: Extending native prototypes can be risky; in modern JS, use .bind().
Function.prototype.createBoundMethod = function(...args) {
    const originalMethod = this;
    const contextObject = args.shift(); // First arg is the 'this' context.
    return function(...invocationArgs) {
        // Guard against CoreUtils being undefined if script load order is off.
        if (typeof CoreUtils !== 'undefined') {
            return originalMethod.apply(contextObject, args.concat(CoreUtils.convertToArray(invocationArgs)));
        }
        console.warn("CoreUtils not available for bound method execution.");
        return undefined;
    };
};

// Extends Function.prototype to create a bound function specifically for event listeners.
// It normalizes the event object and passes target element as the second argument.
Function.prototype.createEventListener = function(...args) {
    const originalMethod = this;
    const boundObject = args.shift(); // First arg is the 'this' context.
    return function(eventObject) {
        eventObject = eventObject || window.event;
        const eventTarget = eventObject.target || eventObject.srcElement; // Normalize event target.

        // Pass event object, target, and any additional bound arguments.
        return originalMethod.apply(boundObject, [eventObject, eventTarget].concat(args));
    };
};


/* EDITOR CONFIGURATION DEFAULTS */

const TextEditorSettings = BaseObject.extend({
    // Default button configurations for the toolbar.
    buttons: {
        'bold': { name: _('Bold Text'), command: 'Bold', tags: ['B', 'STRONG'], css: { 'font-weight': 'bold' }, key: 'b' },
        'italic': { name: _('Italic Text'), command: 'Italic', tags: ['EM', 'I'], css: { 'font-style': 'italic' }, key: 'i' },
        'underline': { name: _('Underline Text'), command: 'Underline', tags: ['U'], css: { 'text-decoration': 'underline' }, key: 'u' },
        'align-left': { name: _('Align Left'), command: 'justifyleft', noActive: true },
        'align-center': { name: _('Align Center'), command: 'justifycenter', noActive: true },
        'align-right': { name: _('Align Right'), command: 'justifyright', noActive: true },
        'align-justify': { name: _('Justify Text'), command: 'justifyfull', noActive: true },
        'ordered-list': { name: _('Insert Numbered List'), command: 'insertorderedlist', tags: ['OL'] },
        'unordered-list': { name: _('Insert Bulleted List'), command: 'insertunorderedlist', tags: ['UL'] },
        'subscript': { name: _('Subscript'), command: 'subscript', tags: ['SUB'] },
        'superscript': { name: _('Superscript'), command: 'superscript', tags: ['SUP'] },
        'strikethrough': { name: _('Strikethrough'), command: 'strikeThrough', css: { 'text-decoration': 'line-through' } },
        'clear-format': { name: _('Remove Formatting'), command: 'removeformat', noActive: true },
        'indent-text': { name: _('Increase Indent'), command: 'indent', noActive: true },
        'outdent-text': { name: _('Decrease Indent'), command: 'outdent', noActive: true },
        'horizontal-rule': { name: _('Insert Horizontal Rule'), command: 'insertHorizontalRule', noActive: true }
    },
    // Path to the sprite image containing editor icons.
    iconSpritePath: '../textEditorIcons.gif',
    // Ordered list of buttons to display in the toolbar.
    toolbarButtonOrder: ['save', 'bold', 'italic', 'underline', 'align-left', 'align-center', 'align-right', 'align-justify', 'ordered-list', 'unordered-list', 'fontSize', 'fontFamily', 'fontFormat', 'indent-text', 'outdent-text', 'image', 'upload', 'link', 'unlink', 'forecolor', 'bgcolor'],
    // Mapping of icon names to their position in the sprite (1-based index).
    iconMap: { "xhtml": 1, "bgcolor": 2, "forecolor": 3, "bold": 4, "center": 5, "hr": 6, "indent": 7, "italic": 8, "justify": 9, "left": 10, "ol": 11, "outdent": 12, "removeformat": 13, "right": 14, "save": 25, "strikethrough": 16, "subscript": 17, "superscript": 18, "ul": 19, "underline": 20, "image": 21, "link": 22, "unlink": 23, "close": 24, "arrow": 26, "upload": 27 },
    // Whether to initialize content with a line break if empty.
    addInitialLineBreak: true
});

/* END EDITOR CONFIGURATION */


// Global registry and management for editor instances.
const EditorRegistry = {
    registeredPlugins: [], // Stores plugin constructors and their options.
    activeEditors: [],     // Stores instances of TextEditor.

    // Registers a new plugin for future editor instances.
    registerEditorPlugin: function(pluginClass, pluginOptions) {
        if (typeof pluginClass === 'function') {
            this.registeredPlugins.push({ plugin: pluginClass, options: pluginOptions });
        } else {
            console.warn("Attempted to register a non-function as a plugin.");
        }
    },

    // Initializes all textareas on the page as editor instances.
    initializeAllTextAreas: function(editorConfig) {
        const htmlTextAreas = document.getElementsByTagName("textarea");
        // Convert NodeList to Array for easier iteration.
        CoreUtils.convertToArray(htmlTextAreas).forEach(textAreaElement => {
            const newEditor = new TextEditor(editorConfig);
            this.activeEditors.push(newEditor.attachPanel(textAreaElement));
        });
        return this.activeEditors;
    },

    // Finds a TextEditor instance by a contained EditorInstance's element.
    findParentEditor: function(elementRef) {
        const targetElement = getDomElement(elementRef);
        for (const editorInstance of this.activeEditors) {
            if (editorInstance.findInstanceByElement(targetElement)) {
                return editorInstance;
            }
        }
        return null;
    }
};


// Main TextEditor class, managing multiple editor instances and plugins.
const TextEditor = BaseObject.extend({
    initialize: function(instanceOptions) {
        this.options = new TextEditorSettings();
        utilAssignProps(this.options, instanceOptions); // Merge user options.

        this.editorInstances = []; // Array to hold individual editor instance objects.
        this.activePluginInstances = []; // Array to hold instantiated plugins.

        // Instantiate all registered plugins.
        EditorRegistry.registeredPlugins.forEach(pluginDef => {
            try {
                this.activePluginInstances.push(new pluginDef.plugin(this, pluginDef.options));
            } catch (error) {
                console.error(`Error initializing plugin: ${error.message}`, pluginDef.plugin);
            }
        });

        // Add this editor to the global registry.
        EditorRegistry.activeEditors.push(this);

        // Listen for mousedown on document body to check for editor deselection.
        CoreUtils.addDomListener(document.body, 'mousedown', this.checkSelectionChange.createEventListener(this));
    },

    // Creates a panel and attaches an editor instance to it.
    attachPanel: function(elementRef, instanceOptions) {
        const targetElement = this.prepareElementForEditor(getDomElement(elementRef));

        // Create a container div for the editor panel, positioned before the target element.
        const panelContainer = new DomManipulator('DIV')
            .applyStyles({ width: (parseInt(targetElement.getComputedStyle('width')) || targetElement.clientWidth) + 'px' })
            .insertPreceding(targetElement);

        this.setEditorPanel(panelContainer);
        return this.addEditorInstance(targetElement, instanceOptions);
    },

    // Prepares an element for editor attachment by checking for existing editor instances.
    prepareElementForEditor: function(elementNode) {
        const existingEditor = EditorRegistry.findParentEditor(elementNode);
        if (existingEditor) {
            // If an editor already exists for this element, remove its instance and panel.
            existingEditor.removeEditorInstance(elementNode);
            existingEditor.removeEditorPanel();
        }
        return elementNode;
    },

    // Adds a new editor instance (either contentEditable or iframe-based).
    addEditorInstance: function(elementNode, instanceOptions) {
        const targetElement = this.prepareElementForEditor(getDomElement(elementNode));
        let newInstance;

        // Determine if contentEditable or iframe-based instance is needed.
        if (targetElement.contentEditable === 'true' || !!window.opera) {
            newInstance = new EditorInstance(targetElement, instanceOptions, this);
        } else {
            newInstance = new IFrameEditorInstance(targetElement, instanceOptions, this); // Assuming IFrameEditorInstance exists.
        }
        this.editorInstances.push(newInstance);
        return this;
    },

    // Removes a specific editor instance associated with an element.
    removeEditorInstance: function(elementRef) {
        const targetElement = getDomElement(elementRef);
        this.editorInstances = this.editorInstances.filter(instance => {
            if (instance.elementNode === targetElement) {
                instance.destroy(); // Call destroy method on the instance.
                return false; // Remove from the array.
            }
            return true; // Keep in the array.
        });
    },

    // Removes the editor panel from the DOM.
    removeEditorPanel: function() {
        if (this.editorPanel) {
            this.editorPanel.removeNode();
            this.editorPanel = null;
        }
    },

    // Finds an individual editor instance by its associated element.
    findInstanceByElement: function(elementRef) {
        const targetElement = getDomElement(elementRef);
        return this.editorInstances.find(instance => instance.elementNode === targetElement);
    },

    // Sets the editor panel for this TextEditor instance.
    setEditorPanel: function(panelElement) {
        this.editorPanel = new TextEditorPanel(getDomElement(panelElement), this.options, this); // Assuming TextEditorPanel exists.
        this.triggerEvent('panelReady', this.editorPanel);
        return this;
    },

    // Executes a rich text command on the currently selected editor instance.
    executeCommand: function(commandName, commandArgs) {
        if (this.selectedInstance) {
            this.selectedInstance.performCommand(commandName, commandArgs);
        }
    },

    // Retrieves CSS properties for an icon based on its name and options.
    getIconStyles: function(iconName, iconOptions) {
        const iconInfo = this.options.iconMap[iconName];
        const iconFileOverride = (iconOptions && iconOptions.iconFiles) ? iconOptions.iconFiles[iconName] : '';
        const backgroundImagePath = iconFileOverride || this.options.iconSpritePath;
        const backgroundPositionX = iconInfo ? ((iconInfo - 1) * -18) : 0; // Calculate sprite position.

        return {
            backgroundImage: `url('${backgroundImagePath}')`,
            backgroundPosition: `${backgroundPositionX}px 0px`
        };
    },

    // Checks if the current selection is outside of an editor instance.
    checkSelectionChange: function(eventObject, eventTarget) {
        let currentTarget = eventTarget;
        // Traverse up the DOM tree from the event target.
        while (currentTarget) {
            if (currentTarget.className && currentTarget.className.includes('nicEdit')) {
                // If we click inside an editor-related element, do nothing.
                return false;
            }
            currentTarget = currentTarget.parentNode;
        }

        // If click was outside, trigger blur event for the previously selected instance.
        this.triggerEvent('editorBlur', this.selectedInstance, eventTarget);
        this.lastSelectedInstance = this.selectedInstance;
        this.selectedInstance = null; // Deselect the instance.
        return false;
    }
});
// Mix in event dispatching capabilities to TextEditor.
utilAssignProps(TextEditor.prototype, EventDispatcher);


// Represents an individual editable instance within the TextEditor.
const EditorInstance = BaseObject.extend({
    isCurrentlySelected: false,

    initialize: function(elementNode, instanceOptions, parentEditor) {
        this.parentEditor = parentEditor;
        this.elementNode = this.originalElement = elementNode; // Store original and current element.
        this.options = instanceOptions || {};

        const computedWidth = parseInt(elementNode.getComputedStyle('width')) || elementNode.clientWidth;
        const computedHeight = parseInt(elementNode.getComputedStyle('height')) || elementNode.clientHeight;
        this.initialContentHeight = computedHeight - 8; // Adjust for padding/border.

        const isTextAreaElement = (elementNode.nodeName.toLowerCase() === "textarea");
        // Check for old IE 7 specific CSS behavior.
        const isOldIE = (CoreUtils.isLegacyIE && !((typeof document.body.style.maxHeight !== "undefined") && document.compatMode === "CSS1Compat"));

        if (isTextAreaElement || this.options.hasPanel) {
            // Define container styles for the editable area.
            const containerStyles = {
                width: computedWidth + 'px',
                border: '1px solid #ccc',
                borderTop: 0,
                overflowY: 'auto',
                overflowX: 'hidden'
            };
            // Apply maxHeight if specified in options.
            containerStyles[isOldIE ? 'height' : 'maxHeight'] = this.parentEditor.options.maxHeight ? this.parentEditor.options.maxHeight + 'px' : null;

            // Create a wrapper DIV for the editable content.
            this.editorContainer = new DomManipulator('DIV')
                .applyStyles(containerStyles)
                .insertPreceding(elementNode);

            // Create the actual content editable DIV.
            const contentEditableArea = new DomManipulator('DIV')
                .applyStyles({ width: (computedWidth - 8) + 'px', margin: '4px', minHeight: computedHeight + 'px' })
                .addCssClass('main') // Add a main class for styling.
                .appendTo(this.editorContainer);

            // Hide the original textarea or element.
            elementNode.applyStyles({ display: 'none' });

            // Set initial content.
            contentEditableArea.setHtmlContent(elementNode.innerHTML);
            if (isTextAreaElement) {
                contentEditableArea.setHtmlContent(elementNode.value);
                this.copyElement = elementNode; // Keep reference to original textarea.
                const parentForm = elementNode.findParentByTag('FORM');
                if (parentForm) {
                    // Save content back to textarea on form submission.
                    CoreUtils.addDomListener(parentForm, 'submit', this.saveContentToOriginal.createBoundMethod(this));
                }
            }
            contentEditableArea.applyStyles(isOldIE ? { height: computedHeight + 'px' } : { overflow: 'hidden' });
            this.elementNode = contentEditableArea; // Update elementNode to point to the new editable div.
        }

        // Register blur handler for this instance.
        this.parentEditor.addEventHandler('editorBlur', this.handleBlur.createBoundMethod(this));

        this.setupEditableArea();
        this.handleBlur(); // Initial blur state.
    },

    // Sets up the content editable area.
    setupEditableArea: function() {
        this.elementNode.setAttribute('contentEditable', 'true');
        // Add initial line break if content is empty and option is enabled.
        if (this.getContent() === "" && this.parentEditor.options.addInitialLineBreak) {
            this.setContent('<br />');
        }
        // Store reference to the document's defaultView for selection/range operations.
        this.instanceDocumentView = document.defaultView;

        // Attach event listeners to the editable area.
        this.elementNode
            .onEvent('mousedown', this.handleSelection.createEventListener(this))
            .onEvent('keypress', this.handleKeyDown.createEventListener(this))
            .onEvent('focus', this.handleSelection.createBoundMethod(this))
            .onEvent('blur', this.handleBlur.createBoundMethod(this))
            .onEvent('keyup', this.handleSelection.createBoundMethod(this));

        this.parentEditor.triggerEvent('instanceAdded', this);
    },

    // Destroys the editor instance, restoring the original element.
    destroy: function() {
        this.saveContentToOriginal(); // Save current content.
        if (this.copyElement || this.options.hasPanel) {
            this.editorContainer.removeNode();
            this.originalElement.applyStyles({ 'display': 'block' }); // Show original element.
            this.parentEditor.removeEditorPanel(); // Remove panel if it was created by this instance.
        }
        this.disableEditing();
        this.parentEditor.triggerEvent('instanceRemoved', this);
    },

    // Disables content editing for this instance.
    disableEditing: function() {
        this.elementNode.setAttribute('contentEditable', 'false');
    },

    // Saves the current editor content back to the original element (e.g., textarea).
    saveContentToOriginal: function() {
        if (this.copyElement) {
            this.copyElement.value = this.getContent();
        }
    },

    // Gets the current HTML content of the editor.
    getContent: function() {
        return this.elementNode.innerHTML;
    },

    // Sets the HTML content of the editor.
    setContent: function(htmlString) {
        this.elementNode.innerHTML = htmlString;
    },

    // Handles focus/selection events on the editor.
    handleSelection: function(eventObject, eventTarget) {
        if (!this.isCurrentlySelected) {
            this.parentEditor.triggerEvent('editorFocus', this, eventTarget);
            this.isCurrentlySelected = true;
        }
        this.parentEditor.selectedInstance = this; // Mark this instance as currently selected.
        this.parentEditor.triggerEvent('selectionChanged', this, eventObject);
    },

    // Handles blur events from the editor.
    handleBlur: function() {
        this.isCurrentlySelected = false;
    },

    // Handles key down events.
    handleKeyDown: function(eventObject, eventTarget) {
        this.parentEditor.triggerEvent('keyDown', this, eventObject);
    },

    // Gets the current selection object.
    getCurrentSelection: function() {
        return window.getSelection ? window.getSelection() : document.selection;
    },

    // Gets the current range object from the selection.
    getCurrentRange: function() {
        const selectionObject = this.getCurrentSelection();
        if (!selectionObject) {
            return null;
        }
        // Return first range if available, otherwise create one.
        return (selectionObject.rangeCount > 0) ? selectionObject.getRangeAt(0) :
            (selectionObject.createRange && selectionObject.createRange() || document.createRange());
    },

    // Sets the current selection range.
    setSelectionRange: function(rangeObject, selectionObject) {
        selectionObject = selectionObject || this.getCurrentSelection();
        if (window.getSelection && selectionObject) {
            selectionObject.removeAllRanges();
            selectionObject.addRange(rangeObject);
        } else if (rangeObject.select) { // For older IE.
            rangeObject.select();
        }
    },

    // Gets the currently selected element or the element containing the cursor.
    getSelectedElement: function() {
        const rangeObject = this.getCurrentRange();
        if (!rangeObject) return null;

        // If a range has a start container, we can determine the element.
        if (rangeObject.startContainer) {
            // If the selection is collapsed or spans a single element, use that.
            if (rangeObject.collapsed) {
                return rangeObject.startContainer.nodeType === Node.ELEMENT_NODE ?
                    rangeObject.startContainer : rangeObject.startContainer.parentNode;
            } else {
                // If it's a full element selection, return the element.
                if (rangeObject.cloneContents().childNodes.length === 1 &&
                    rangeObject.cloneContents().childNodes[0].nodeType === Node.ELEMENT_NODE) {
                    return rangeObject.cloneContents().childNodes[0];
                }
                // Otherwise, return the common ancestor.
                return rangeObject.commonAncestorContainer;
            }
        }
        // Fallback for older IE.
        else if (document.selection && document.selection.type !== "Control") {
            return document.selection.createRange().parentElement();
        }
        return null;
    }
});

// Assuming TextEditorPanel and IFrameEditorInstance would also be defined similarly
// as BaseObject extensions, if they were present in the original code.
// For this clone, only the provided `bkLib`, `bkElement`, `bkClass`, etc. are re-implemented.