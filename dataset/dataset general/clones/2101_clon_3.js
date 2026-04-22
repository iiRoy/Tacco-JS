/*
 * RichText - Lightweight Inline WYSIWYG Editor
 * Copyright 2023-2024 Your Name or Company
 *
 * This editor is distributed under a modified MIT license.
 * For more details, visit the project repository.
 * Please retain this attribution notice.
 */
var objectMerge = function() {
    // Collect all arguments passed to the function
    var inputArguments = arguments;
    // Define the primary target object for merging
    var targetObject;

    // Determine the target object based on argument count
    // If only one argument, it's assumed to be the source, and 'this' is the target.
    if (inputArguments.length === 1) {
        targetObject = this;
        inputArguments = [targetObject, inputArguments[0]];
    } else {
        // Otherwise, the first argument is the target.
        targetObject = inputArguments[0];
    }

    // Ensure targetObject is valid before proceeding
    if (!targetObject || typeof targetObject !== 'object') {
        // Optionally, throw an error or return an empty object
        return {};
    }

    // Iterate over properties of the source object (second argument)
    var sourceObject = inputArguments[1];
    if (sourceObject && typeof sourceObject === 'object') {
        for (var propertyKey in sourceObject) {
            // Check if the property belongs directly to the source object
            if (Object.prototype.hasOwnProperty.call(sourceObject, propertyKey)) {
                targetObject[propertyKey] = sourceObject[propertyKey];
            }
        }
    }
    // Return the modified target object
    return targetObject;
};

// Base prototype for custom object-oriented structure
function BaseComponent() {
    // This constructor is intentionally left empty
    // It serves as a placeholder for the prototype chain
}

// Method to be overridden by subclasses for initialization
BaseComponent.prototype.initialize = function() { /* Placeholder */ };

// Static method to create a new subclass
BaseComponent.deriveFrom = function(definitionObject) {
    // Define the constructor for the new subclass
    var ChildConstructor = function() {
        // Prevent direct calls to 'initialize' during prototype chain construction
        // The first argument check is a specific pattern used by the original library
        if (arguments[0] !== BaseComponent) {
            // If not part of prototype chain setup, call the actual initializer
            return this.initialize.apply(this, arguments);
        }
    };

    // Create a new instance of the parent class, passing BaseComponent
    // This correctly sets up the prototype chain without calling the parent's actual constructor
    var parentPrototype = new this(BaseComponent);

    // Merge the provided definition object into the new prototype
    objectMerge(parentPrototype, definitionObject);

    // Assign the new prototype to the subclass's constructor
    ChildConstructor.prototype = parentPrototype;
    // Ensure the prototype has a correct constructor reference
    ChildConstructor.prototype.constructor = ChildConstructor;

    // Inherit the static 'deriveFrom' method for further subclassing
    ChildConstructor.deriveFrom = this.deriveFrom;

    // Return the newly created subclass constructor
    return ChildConstructor;
};

// --- DOM Element Wrapper Component ---
var DomWrapper = BaseComponent.deriveFrom({
    // Initializes a DomWrapper instance
    initialize: function(elementRef, documentContext) {
        // If elementRef is a string, create a new element
        if (typeof elementRef === "string") {
            elementRef = (documentContext || document).createElement(elementRef);
        }
        // Ensure the element is wrapped by our utility function
        elementRef = getElementWrapper(elementRef);
        // Return the wrapped element
        return elementRef;
    },

    // Appends the current element to another target element
    appendInto: function(targetElement) {
        if (targetElement && targetElement.appendChild) {
            targetElement.appendChild(this);
        }
        return this;
    },

    // Inserts the current element before another target element
    insertPriorTo: function(targetElement) {
        if (targetElement && targetElement.parentNode && targetElement.parentNode.insertBefore) {
            targetElement.parentNode.insertBefore(this, targetElement);
        }
        return this;
    },

    // Attaches an event listener to the element
    onEvent: function(eventType, handlerFunction) {
        AppHelpers.addEventHandler(this, eventType, handlerFunction);
        return this;
    },

    // Sets the inner HTML content of the element
    updateHtmlContent: function(newContent) {
        this.innerHTML = newContent;
        return this;
    },

    // Calculates the absolute position and total height of the element
    getElementPosition: function() {
        let currentLeftOffset = 0;
        let currentTopOffset = 0;
        let traversalNode = this;

        // Traverse up the offsetParent chain to accumulate positions
        while (traversalNode && traversalNode.offsetParent) {
            currentLeftOffset += traversalNode.offsetLeft;
            currentTopOffset += traversalNode.offsetTop;
            traversalNode = traversalNode.offsetParent;
        }

        // Calculate border width, handling browser quirks
        const borderWidth = (!window.opera) ?
            (parseInt(this.getComputedStyleValue('border-width') || this.style.border) || 0) :
            0;

        // Return an array with [left, top + height]
        return [currentLeftOffset + borderWidth, currentTopOffset + borderWidth + this.offsetHeight];
    },

    // Prevents text selection within the element and its children
    preventSelection: function() {
        AppHelpers.disableTextSelection(this);
        return this;
    },

    // Finds the first ancestor element with a matching tag name
    findAncestorByTag: function(tagName) {
        let currentElement = this;
        const normalizedTagName = tagName.toUpperCase();
        while (currentElement) {
            // Check if currentElement is an actual HTML element
            if (currentElement.nodeType === Node.ELEMENT_NODE && currentElement.nodeName === normalizedTagName) {
                return currentElement;
            }
            currentElement = currentElement.parentNode;
        }
        return false; // Return false if no matching ancestor is found
    },

    // Checks if the element has a specific CSS class
    containsClass: function(className) {
        // Using a more robust regex for class matching
        const classRegex = new RegExp(`(^|\\s)richText-${className}(\\s|$)`);
        return classRegex.test(this.className);
    },

    // Adds a CSS class to the element if it doesn't already have it
    addCssClass: function(className) {
        if (!this.containsClass(className)) {
            this.className += ` richText-${className}`;
        }
        return this;
    },

    // Removes a CSS class from the element
    removeCssClass: function(className) {
        if (this.containsClass(className)) {
            const classRegex = new RegExp(`(^|\\s)richText-${className}(\\s|$)`, 'g');
            this.className = this.className.replace(classRegex, ' ').trim(); // Use trim to clean up
        }
        return this;
    },

    // Applies a set of CSS styles to the element
    applyStyles: function(styleObject) {
        const elementStyle = this.style;
        for (const styleProperty in styleObject) {
            if (Object.prototype.hasOwnProperty.call(styleObject, styleProperty)) {
                switch (styleProperty) {
                    case 'float':
                        elementStyle.cssFloat = elementStyle.styleFloat = styleObject[styleProperty];
                        break;
                    case 'opacity':
                        elementStyle.opacity = styleObject[styleProperty];
                        // IE specific filter for opacity
                        elementStyle.filter = `alpha(opacity=${Math.round(styleObject[styleProperty] * 100)})`;
                        break;
                    case 'className':
                        this.className = styleObject[styleProperty];
                        break;
                    default:
                        // Apply the style directly for most properties
                        elementStyle[styleProperty] = styleObject[styleProperty];
                }
            }
        }
        return this;
    },

    // Retrieves the computed style value for a given CSS rule
    getComputedStyleValue: function(cssRule, documentViewContext) {
        const docView = documentViewContext || document.defaultView;
        if (this.nodeType === Node.ELEMENT_NODE) {
            // Use getComputedStyle for modern browsers
            if (docView && docView.getComputedStyle) {
                return docView.getComputedStyle(this, null).getPropertyValue(cssRule);
            }
            // Fallback for older IE versions using currentStyle
            if (this.currentStyle) {
                return this.currentStyle[AppHelpers.toCamelCase(cssRule)];
            }
        }
        return ''; // Return empty string if not an element or style not found
    },

    // Removes the element from its parent node
    detachFromDom: function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
        return this;
    },

    // Sets multiple attributes on the element
    setElementAttributes: function(attributesObject) {
        for (const attributeName in attributesObject) {
            if (Object.prototype.hasOwnProperty.call(attributesObject, attributeName)) {
                this.setAttribute(attributeName, attributesObject[attributeName]);
            }
        }
        return this;
    }
});

// --- Application-wide Utility Helpers ---
var AppHelpers = {
    // Detect if the browser is Internet Explorer
    isInternetExplorer: (navigator.userAgent.indexOf("MSIE") !== -1 || !!document.documentMode), // Added check for documentMode for IE11

    // Adds an event listener to a DOM object
    addEventHandler: function(domObject, eventType, handler) {
        if (domObject && domObject.addEventListener) {
            domObject.addEventListener(eventType, handler, false);
        } else if (domObject && domObject.attachEvent) {
            domObject.attachEvent("on" + eventType, handler);
        }
    },

    // Converts an iterable (like arguments or NodeList) to a real Array
    convertToArray: function(iterableCollection) {
        // Using Array.from for a more modern approach
        return Array.from(iterableCollection);
    },

    // Disables text selection for an element and its children
    disableTextSelection: function(elementNode) {
        if (!elementNode || elementNode.nodeType !== Node.ELEMENT_NODE) {
            return; // Guard against non-element nodes
        }

        // Apply 'unselectable' attribute for older IE
        const tagName = elementNode.nodeName.toLowerCase();
        if (elementNode.setAttribute && tagName !== 'input' && tagName !== 'textarea') {
            elementNode.setAttribute('unselectable', 'on');
        }

        // Recursively apply to child nodes
        for (let i = 0; i < elementNode.childNodes.length; i++) {
            AppHelpers.disableTextSelection(elementNode.childNodes[i]);
        }
    },

    // Converts a CSS-style string (e.g., 'border-width') to camelCase ('borderWidth')
    toCamelCase: function(cssString) {
        return cssString.replace(/\-(.)/g, function(match, charToUppercase) {
            return charToUppercase.toUpperCase();
        });
    },

    // Checks if an item exists in an array
    itemExistsInArray: function(array, item) {
        return array.includes(item); // Using modern Array.prototype.includes
    },

    // Finds the index of an item in an array, returns null if not found
    findArrayIndex: function(array, targetItem) {
        const index = array.indexOf(targetItem);
        return index !== -1 ? index : null;
    },

    // Prevents default action and stops event propagation
    stopEventPropagation: function(eventObject) {
        eventObject = eventObject || window.event;
        if (eventObject.preventDefault) {
            eventObject.preventDefault();
        }
        if (eventObject.stopPropagation) {
            eventObject.stopPropagation();
        }
        // For older IE
        if (eventObject.returnValue !== undefined) {
            eventObject.returnValue = false;
        }
        if (eventObject.cancelBubble !== undefined) {
            eventObject.cancelBubble = true;
        }
        return false;
    },

    // Array to hold functions to be executed on DOM ready
    deferredExecutionQueue: [],
    // Flag to ensure domLoaded is only called once
    _domReadyExecuted: false,

    // Executes all functions in the deferredExecutionQueue
    executeDeferredTasks: function() {
        if (AppHelpers._domReadyExecuted) {
            return;
        }
        AppHelpers._domReadyExecuted = true;
        for (let i = 0; i < AppHelpers.deferredExecutionQueue.length; i++) {
            AppHelpers.deferredExecutionQueue[i]();
        }
        // Clear the queue after execution
        AppHelpers.deferredExecutionQueue = [];
    },

    // Registers a function to be called when the DOM is ready
    onDocumentReady: function(callbackFunction) {
        if (AppHelpers._domReadyExecuted) {
            // If DOM is already ready, execute immediately
            callbackFunction();
            return;
        }
        AppHelpers.deferredExecutionQueue.push(callbackFunction);

        // Modern browsers using DOMContentLoaded
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", AppHelpers.executeDeferredTasks, false);
        } else if (AppHelpers.isInternetExplorer) {
            // IE specific hack using defer script
            document.write("<style>.richText-main p { margin: 0; }</style><scr"+"ipt id=__ie_dom_init defer " + ((location.protocol === "https:") ? "src='javascript:void(0)'" : "src=//0") + "><\/scr"+"ipt>");
            const ieInitScript = document.getElementById("__ie_dom_init");
            if (ieInitScript) {
                 ieInitScript.onreadystatechange = function() {
                    if (this.readyState === "complete") {
                        AppHelpers.executeDeferredTasks();
                    }
                };
            }
        }
        // Fallback for older browsers and general window.onload
        // Ensure window.onload is only set once and chains properly
        const oldWindowOnload = window.onload;
        window.onload = function() {
            if (oldWindowOnload && typeof oldWindowOnload === 'function') {
                oldWindowOnload();
            }
            AppHelpers.executeDeferredTasks();
        };
    }
};

// Global utility function to wrap a DOM element with DomWrapper functionality
function getElementWrapper(targetNode) {
    if (typeof targetNode === "string") {
        targetNode = document.getElementById(targetNode);
    }
    // If the node exists and doesn't already have DomWrapper methods, extend it
    if (targetNode && !targetNode.appendInto) {
        objectMerge(targetNode, DomWrapper.prototype);
        // Add a debug console log for element wrapping
        // console.log(`Wrapped DOM element: ${targetNode.id || targetNode.nodeName}`);
    }
    return targetNode;
}

// --- Event Dispatcher Mixin ---
var EventDispatcher = {
    // Adds an event listener (subscriber) for a custom event type
    subscribeToEvent: function(eventType, eventHandler) {
        if (eventHandler) {
            this.eventListeners = this.eventListeners || {};
            this.eventListeners[eventType] = this.eventListeners[eventType] || [];
            this.eventListeners[eventType].push(eventHandler);
        }
        return this;
    },

    // Triggers a custom event, notifying all subscribers
    triggerEvent: function() {
        var eventArguments = AppHelpers.convertToArray(arguments);
        var eventTypeName = eventArguments.shift(); // First argument is the event type

        if (this.eventListeners && this.eventListeners[eventTypeName]) {
            for (let i = 0; i < this.eventListeners[eventTypeName].length; i++) {
                // Call each registered handler with the provided arguments
                this.eventListeners[eventTypeName][i].apply(this, eventArguments);
            }
        }
        return this; // Allow chaining
    }
};

// --- Internationalization / Localization Helper ---
function getTranslation(translationKey) {
    // In a real application, this would lookup translations based on locale.
    // For this clone, it simply returns the key.
    return translationKey;
}

// --- Function Prototype Extensions for Context Binding ---

// Binds a function's `this` context and prepends arguments
Function.prototype.bindContext = function() {
    var originalMethod = this;
    var boundArgs = AppHelpers.convertToArray(arguments);
    var contextObject = boundArgs.shift(); // The first argument is the 'this' context

    return function() {
        // Ensure AppHelpers is defined before attempting to use it
        if (typeof AppHelpers !== 'undefined') {
            // Concatenate bound arguments with any new arguments passed at call time
            return originalMethod.apply(contextObject, boundArgs.concat(AppHelpers.convertToArray(arguments)));
        }
        // Fallback if AppHelpers is somehow not available
        return originalMethod.apply(contextObject, boundArgs);
    };
};

// Binds a function's `this` context and prepends event object and target element
Function.prototype.bindEventHandler = function() {
    var originalMethod = this;
    var boundArgs = AppHelpers.convertToArray(arguments);
    var contextObject = boundArgs.shift(); // The first argument is the 'this' context

    return function(eventObject) {
        eventObject = eventObject || window.event; // Normalize event object
        var eventTarget = eventObject.target || eventObject.srcElement; // Get event target

        // Prepend eventObject and eventTarget to the arguments list
        return originalMethod.apply(contextObject, [eventObject, eventTarget].concat(boundArgs));
    };
};

/* --- EDITOR CONFIGURATION --- */

var EditorSettings = BaseComponent.deriveFrom({
    // Defines available editor buttons and their properties
    actionButtons: {
        'bold': { name: getTranslation('Apply Bold'), command: 'Bold', tags: ['B', 'STRONG'], css: { 'font-weight': 'bold' }, key: 'b' },
        'italic': { name: getTranslation('Apply Italic'), command: 'Italic', tags: ['EM', 'I'], css: { 'font-style': 'italic' }, key: 'i' },
        'underline': { name: getTranslation('Apply Underline'), command: 'Underline', tags: ['U'], css: { 'text-decoration': 'underline' }, key: 'u' },
        'align_left': { name: getTranslation('Align Left'), command: 'justifyleft', noActive: true },
        'align_center': { name: getTranslation('Align Center'), command: 'justifycenter', noActive: true },
        'align_right': { name: getTranslation('Align Right'), command: 'justifyright', noActive: true },
        'align_justify': { name: getTranslation('Justify Text'), command: 'justifyfull', noActive: true },
        'ordered_list': { name: getTranslation('Insert Ordered List'), command: 'insertorderedlist', tags: ['OL'] },
        'unordered_list': { name: getTranslation('Insert Unordered List'), command: 'insertunorderedlist', tags: ['UL'] },
        'subscript_text': { name: getTranslation('Subscript'), command: 'subscript', tags: ['SUB'] },
        'superscript_text': { name: getTranslation('Superscript'), command: 'superscript', tags: ['SUP'] },
        'strikethrough_text': { name: getTranslation('Strikethrough'), command: 'strikeThrough', css: { 'text-decoration': 'line-through' } },
        'clear_format': { name: getTranslation('Remove Formatting'), command: 'removeformat', noActive: true },
        'indent_text': { name: getTranslation('Increase Indent'), command: 'indent', noActive: true },
        'outdent_text': { name: getTranslation('Decrease Indent'), command: 'outdent', noActive: true },
        'horizontal_rule': { name: getTranslation('Insert Horizontal Rule'), command: 'insertHorizontalRule', noActive: true }
    },
    // Path to the sprite image for icons
    iconSpritePath: '../richEditorIcons.gif',
    // Ordered list of buttons to display in the toolbar
    toolbarButtonOrder: ['save', 'bold', 'italic', 'underline', 'align_left', 'align_center', 'align_right', 'align_justify', 'ordered_list', 'unordered_list', 'fontSize', 'fontFamily', 'fontFormat', 'indent_text', 'outdent_text', 'image', 'upload', 'link', 'unlink', 'forecolor', 'bgcolor'],
    // Mapping of icon names to their position in the sprite (1-based index)
    iconSpriteMap: { "xhtml": 1, "bgcolor": 2, "forecolor": 3, "bold": 4, "center": 5, "hr": 6, "indent": 7, "italic": 8, "justify": 9, "left": 10, "ol": 11, "outdent": 12, "removeformat": 13, "right": 14, "save": 25, "strikethrough": 16, "subscript": 17, "superscript": 18, "ul": 19, "underline": 20, "image": 21, "link": 22, "unlink": 23, "close": 24, "arrow": 26, "upload": 27 }
});

/* --- EDITOR REGISTRY --- */
var EditorRegistry = {
    // Stores registered plugins
    registeredPlugins: [],
    // Stores active editor instances
    activeInstances: [],

    // Registers a new plugin for the editor
    addPlugin: function(pluginConstructor, pluginOptions) {
        this.registeredPlugins.push({ constructor: pluginConstructor, options: pluginOptions });
    },

    // Initializes the editor on all textareas found in the document
    initializeAllTextareas: function(editorConfiguration) {
        var allTextareas = document.getElementsByTagName("textarea");
        var createdEditors = [];
        for (let i = 0; i < allTextareas.length; i++) {
            // Create a new editor instance for each textarea
            const newEditor = new RichTextEditor(editorConfiguration).createPanelAndInstance(allTextareas[i]);
            createdEditors.push(newEditor);
        }
        // Add all newly created editors to the global activeInstances list
        this.activeInstances = this.activeInstances.concat(createdEditors);
        return createdEditors;
    },

    // Finds an editor instance by its associated element
    retrieveEditorInstance: function(elementIdentifier) {
        const targetElement = getElementWrapper(elementIdentifier);
        for (let i = 0; i < this.activeInstances.length; i++) {
            if (this.activeInstances[i].getInstanceById(targetElement)) {
                return this.activeInstances[i];
            }
        }
        return null; // Return null if no editor is found for the element
    }
};

/* --- MAIN RICH TEXT EDITOR CLASS --- */
var RichTextEditor = BaseComponent.deriveFrom({
    initialize: function(configOverrides) {
        this.editorOptions = new EditorSettings();
        objectMerge(this.editorOptions, configOverrides); // Merge user-provided options
        this.managedInstances = []; // Stores individual content-editable areas
        this.pluginObjects = []; // Stores initialized plugin instances

        // Initialize registered plugins
        for (let i = 0; i < EditorRegistry.registeredPlugins.length; i++) {
            const pluginDef = EditorRegistry.registeredPlugins[i];
            const pluginInstance = new pluginDef.constructor(this, pluginDef.options);
            this.pluginObjects.push(pluginInstance);
        }

        // Add this editor instance to the global registry
        EditorRegistry.activeInstances.push(this);

        // Attach a global mousedown listener for selection checks
        AppHelpers.addEventHandler(document.body, 'mousedown', this.handleSelectionCheck.bindEventHandler(this));

        // Initial setup log
        console.log("RichTextEditor initialized with " + this.pluginObjects.length + " plugins.");
    },

    // Creates a control panel and then adds an editor instance for a given element
    createPanelAndInstance: function(elementRef, instanceOptions) {
        const targetElement = this.prepareElementForEditor(getElementWrapper(elementRef));
        const panelContainer = new DomWrapper('DIV')
            .applyStyles({ width: (parseInt(targetElement.getComputedStyleValue('width')) || targetElement.clientWidth) + 'px', border: '1px solid #ddd', marginBottom: '5px' })
            .insertPriorTo(targetElement); // Insert panel before the actual content element

        this.assignControlPanel(panelContainer); // Set up the panel
        return this.registerInstance(targetElement, instanceOptions); // Add the content instance
    },

    // Checks if an element already has an editor, and removes it if so
    prepareElementForEditor: function(elementToCheck) {
        const existingEditor = EditorRegistry.retrieveEditorInstance(elementToCheck);
        if (existingEditor) {
            existingEditor.deregisterInstance(elementToCheck);
            existingEditor.destroyControlPanel();
        }
        return elementToCheck;
    },

    // Adds a new content-editable instance (either inline or iframe)
    registerInstance: function(elementToEdit, instanceOptions) {
        elementToEdit = this.prepareElementForEditor(getElementWrapper(elementToEdit));
        let newContentInstance;

        // Decide between inline contentEditable or iframe based on browser/config
        if (elementToEdit.contentEditable === 'true' || !!window.opera) { // Opera still uses contentEditable directly
            newContentInstance = new InlineEditorInstance(elementToEdit, instanceOptions, this);
        } else {
            newContentInstance = new IframeEditorInstance(elementToEdit, instanceOptions, this);
        }
        this.managedInstances.push(newContentInstance);
        return this;
    },

    // Removes a specific content-editable instance
    deregisterInstance: function(elementToRemove) {
        const targetElement = getElementWrapper(elementToRemove);
        const currentInstances = this.managedInstances;
        for (let i = 0; i < currentInstances.length; i++) {
            if (currentInstances[i].domElement === targetElement) {
                currentInstances[i].destroyInstance();
                this.managedInstances.splice(i, 1); // Remove from array
                break; // Exit loop after finding and removing
            }
        }
        // If no more instances, remove the panel too
        if (this.managedInstances.length === 0) {
            this.destroyControlPanel();
        }
    },

    // Removes the editor's control panel from the DOM
    destroyControlPanel: function() {
        if (this.editorPanel) {
            this.editorPanel.detachFromDom();
            this.editorPanel = null;
            console.log("Editor panel removed.");
        }
    },

    // Retrieves an editor instance by its associated DOM element
    getInstanceById: function(elementId) {
        const targetElement = getElementWrapper(elementId);
        for (let i = 0; i < this.managedInstances.length; i++) {
            if (this.managedInstances[i].domElement === targetElement) {
                return this.managedInstances[i];
            }
        }
        return null;
    },

    // Creates and assigns the editor control panel
    assignControlPanel: function(panelContainerElement) {
        this.editorPanel = new EditorControlPanel(getElementWrapper(panelContainerElement), this.editorOptions, this);
        this.triggerEvent('panelInitialized', this.editorPanel);
        return this;
    },

    // Executes a rich text command on the currently selected instance
    executeEditorCommand: function(commandName, commandArgs) {
        if (this.selectedContentInstance) {
            this.selectedContentInstance.executeCommand(commandName, commandArgs);
        } else {
             // console.warn("No content instance selected to execute command: " + commandName);
        }
    },

    // Generates CSS style for an icon based on configuration
    getIconStyle: function(iconKey, customOptions) {
        const iconPosition = this.editorOptions.iconSpriteMap[iconKey];
        const customIconFile = (customOptions && customOptions.iconFiles) ? customOptions.iconFiles[iconKey] : '';

        const backgroundImage = `url('${(iconPosition ? this.editorOptions.iconSpritePath : customIconFile)}')`;
        const backgroundPosition = iconPosition ? `${((iconPosition - 1) * -18)}px 0px` : '0px 0px'; // Assuming 18px width per icon

        return { backgroundImage: backgroundImage, backgroundPosition: backgroundPosition };
    },

    // Handler for global mousedown events to check editor selection status
    handleSelectionCheck: function(eventObj, clickedTarget) {
        let currentNode = clickedTarget;
        // Traverse up the DOM to see if the click was inside an editor
        do {
            if (currentNode && currentNode.className && currentNode.className.indexOf('richText') !== -1) {
                // Click was inside an editor, no blur needed for the current editor
                return false;
            }
        } while (currentNode = currentNode.parentNode);

        // If we reach here, the click was outside any richText editor element
        if (this.selectedContentInstance) {
            this.triggerEvent('editorBlur', this.selectedContentInstance, clickedTarget);
            this.lastSelectedContentInstance = this.selectedContentInstance;
            this.selectedContentInstance = null;
            console.log("Editor blur detected.");
        }
        return false;
    }
});
// Mix in event dispatcher capabilities to the RichTextEditor
objectMerge(RichTextEditor.prototype, EventDispatcher);


/* --- INLINE CONTENT-EDITABLE EDITOR INSTANCE --- */
var InlineEditorInstance = BaseComponent.deriveFrom({
    isCurrentlySelected: false,

    initialize: function(targetElement, options, parentEditor) {
        this.parentEditor = parentEditor;
        this.domElement = this.originalElement = targetElement;
        this.instanceOptions = options || {};

        // Calculate initial dimensions
        const initialWidth = parseInt(targetElement.getComputedStyleValue('width')) || targetElement.clientWidth;
        const initialHeight = parseInt(targetElement.getComputedStyleValue('height')) || targetElement.clientHeight;
        this.minContentHeight = initialHeight - 8; // Adjusted height for content area

        const isSourceTextarea = (targetElement.nodeName.toLowerCase() === "textarea");
        if (isSourceTextarea || this.instanceOptions.hasPanel) {
            // Apply specific styles for IE7 to handle max-height
            const isIE7Quirks = (AppHelpers.isInternetExplorer && !(typeof document.body.style.maxHeight !== "undefined" && document.compatMode === "CSS1Compat"));
            const wrapperStyles = {
                width: initialWidth + 'px',
                border: '1px solid #ccc',
                borderTop: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                backgroundColor: '#fff' // Added default background
            };
            wrapperStyles[isIE7Quirks ? 'height' : 'maxHeight'] = (this.parentEditor.editorOptions.maxHeight) ? this.parentEditor.editorOptions.maxHeight + 'px' : null;

            this.editorWrapperDiv = new DomWrapper('DIV').applyStyles(wrapperStyles).insertPriorTo(targetElement);
            // Inner content editable div
            const contentEditableStyles = {
                width: (initialWidth - 8) + 'px',
                margin: '4px',
                minHeight: initialHeight + 'px',
                outline: 'none' // Remove default outline
            };
            this.contentDiv = new DomWrapper('DIV').applyStyles(contentEditableStyles).addCssClass('main').appendInto(this.editorWrapperDiv);

            // Hide the original element (textarea or other)
            targetElement.applyStyles({ display: 'none' });

            // Transfer initial content
            this.contentDiv.innerHTML = targetElement.innerHTML;
            if (isSourceTextarea) {
                this.contentDiv.updateHtmlContent(targetElement.value);
                this.sourceTextarea = targetElement; // Keep reference to original textarea
                const parentForm = targetElement.findAncestorByTag('FORM');
                if (parentForm) {
                    AppHelpers.addEventHandler(parentForm, 'submit', this.saveContentToSource.bindContext(this));
                }
            }
            this.contentDiv.applyStyles(isIE7Quirks ? { height: initialHeight + 'px' } : { overflow: 'hidden' });
            this.domElement = this.contentDiv; // The actual content-editable element
        }

        this.parentEditor.subscribeToEvent('editorBlur', this.onEditorBlur.bindContext(this));

        this.setupContentEditable();
        this.onEditorBlur(); // Initial blur to ensure proper state
    },

    setupContentEditable: function() {
        this.domElement.setAttribute('contentEditable', 'true');
        // Ensure there's always a <br> for caret positioning if empty
        if (this.getContent() === "") {
            this.updateContent('<br />');
        }
        this.currentDocumentView = document.defaultView; // Reference to window object

        // Attach event listeners to the content-editable element
        this.domElement
            .onEvent('mousedown', this.onSelected.bindEventHandler(this))
            .onEvent('keypress', this.onKeyDown.bindEventHandler(this))
            .onEvent('focus', this.onSelected.bindContext(this)) // Bind context for focus
            .onEvent('blur', this.onEditorBlur.bindContext(this)) // Bind context for blur
            .onEvent('keyup', this.onSelected.bindEventHandler(this));

        this.parentEditor.triggerEvent('instanceAdded', this);
    },

    // Removes this editor instance, restoring the original element
    destroyInstance: function() {
        this.saveContentToSource(); // Save content back before removal
        if (this.sourceTextarea || this.instanceOptions.hasPanel) {
            this.editorWrapperDiv.detachFromDom(); // Remove the editor wrapper
            this.originalElement.applyStyles({ 'display': 'block' }); // Show original element
            this.parentEditor.destroyControlPanel(); // Remove panel if this was the last instance
        }
        this.disableEditing(); // Make content non-editable
        this.parentEditor.triggerEvent('instanceRemoved', this);
        console.log("Inline editor instance destroyed.");
    },

    // Sets the content-editable element to read-only
    disableEditing: function() {
        this.domElement.setAttribute('contentEditable', 'false');
    },

    // Gets the current selection object
    getCurrentSelection: function() {
        return window.getSelection ? window.getSelection() : document.selection;
    },

    // Gets the current range object from the selection
    getCurrentRange: function() {
        const selection = this.getCurrentSelection();
        if (!selection) { return null; }
        return selection.rangeCount > 0 ? selection.getRangeAt(0) : selection.createRange();
    },

    // Sets the current selection to a specified range
    selectRange: function(rangeToSelect, selectionObject) {
        if (window.getSelection) {
            selectionObject.removeAllRanges();
            selectionObject.addRange(rangeToSelect);
        } else if (rangeToSelect.select) { // IE specific range selection
            rangeToSelect.select();
        }
    },

    // Retrieves the currently selected element or its parent if text is selected
    getSelectedElement: function() {
        const currentRange = this.getCurrentRange();
        if (!currentRange) {
            return null;
        }

        if (currentRange.startContainer) { // Modern browsers
            let container = currentRange.startContainer;
            // If selection is collapsed, or covers exactly one node
            if (currentRange.collapsed || currentRange.cloneContents().childNodes.length === 1) {
                // If it's a text node, return its parent
                return container.nodeType === Node.TEXT_NODE ? container.parentNode : container;
            }
        } else if (currentRange.parentElement) { // IE specific
            return currentRange.parentElement();
        }
        return null; // Fallback
    },


    // Saves the content from the editor back to the original textarea
    saveContentToSource: function() {
        if (this.sourceTextarea && this.contentDiv) {
            this.sourceTextarea.value = this.getContent();
        }
    },

    // Gets the current HTML content of the editor
    getContent: function() {
        return this.domElement.innerHTML;
    },

    // Sets the HTML content of the editor
    updateContent: function(htmlString) {
        this.domElement.innerHTML = htmlString;
    },

    // Handles selection within the editor, marking it as active
    onSelected: function(eventObj, targetNode) {
        if (!this.isCurrentlySelected) {
            this.parentEditor.fireEvent('editorFocus', this);
            this.isCurrentlySelected = true;
            this.parentEditor.selectedContentInstance = this;
            console.log("Editor instance focused.");
        }
        return true;
    },

    // Handles blur event for the editor instance
    onEditorBlur: function() {
        if (this.isCurrentlySelected) {
            this.isCurrentlySelected = false;
            console.log("Editor instance blurred.");
        }
    },

    // Handles key down events
    onKeyDown: function(eventObj, targetNode) {
        // Optional: Add custom key handling logic here
    },

    // Executes a document command (e.g., 'bold', 'italic')
    executeCommand: function(command, value) {
        if (this.domElement && this.currentDocumentView) {
            try {
                this.currentDocumentView.document.execCommand(command, false, value);
                // Trigger an update event or selection check after command
                this.parentEditor.fireEvent('commandExecuted', this, command, value);
            } catch (e) {
                console.error("Error executing command '" + command + "':", e);
            }
        }
    }
});

// Placeholder for IframeEditorInstance (if required, would be similar to InlineEditorInstance)
var IframeEditorInstance = BaseComponent.deriveFrom({
    initialize: function(targetElement, options, parentEditor) {
        // This would involve creating an iframe, writing content to it,
        // and setting up event listeners within the iframe's document.
        console.warn("IframeEditorInstance is a placeholder and not fully implemented in this clone.");
        this.parentEditor = parentEditor;
        this.domElement = targetElement;
        this.instanceOptions = options;
        // ... iframe specific setup ...
        this.parentEditor.triggerEvent('instanceAdded', this);
    },
    destroyInstance: function() {
        // ... iframe specific teardown ...
        this.parentEditor.triggerEvent('instanceRemoved', this);
    },
    executeCommand: function(cmd, val) {
        // ... iframe document.execCommand ...
    },
    getContent: function() { /* ... */ },
    updateContent: function(html) { /* ... */ }
});

// Placeholder for EditorControlPanel
var EditorControlPanel = BaseComponent.deriveFrom({
    initialize: function(panelElement, options, parentEditor) {
        this.panelContainer = panelElement;
        this.editorOptions = options;
        this.parentEditor = parentEditor;
        this.buildToolbar();
        console.log("EditorControlPanel initialized.");
    },
    buildToolbar: function() {
        const toolbarDiv = new DomWrapper('DIV').addCssClass('toolbar').appendInto(this.panelContainer);
        // Simplified button creation for clone
        this.editorOptions.toolbarButtonOrder.forEach(buttonKey => {
            const buttonConfig = this.editorOptions.actionButtons[buttonKey];
            if (buttonConfig) {
                const button = new DomWrapper('BUTTON')
                    .setElementAttributes({ title: buttonConfig.name })
                    .applyStyles({
                        ...this.parentEditor.getIconStyle(buttonKey),
                        width: '20px',
                        height: '20px',
                        border: '1px solid #ccc',
                        margin: '2px',
                        cursor: 'pointer',
                        verticalAlign: 'middle'
                    })
                    .appendInto(toolbarDiv);
                button.onEvent('click', this.createCommandExecutor(buttonConfig.command).bindContext(this.parentEditor));
            } else {
                // console.log(`Button config missing for: ${buttonKey}`);
            }
        });
    },
    createCommandExecutor: function(commandName) {
        return function() {
            this.executeEditorCommand(commandName);
        };
    },
    detachFromDom: function() {
        this.panelContainer.detachFromDom();
    }
});