/*
 * TextEditor - Lightweight WYSIWYG Editor Core
 * (C) 2023 Development Team
 * This software is provided under an open-source license.
 * For more details, visit our project website.
 * Please keep this license notice intact.
 */
var jsUtilMerge = function() {
    // Collect all arguments passed to this function.
    const inputParams = arguments;
    // If only one argument is provided, assume it's the source for 'this'.
    if (inputParams.length === 1) {
        inputParams[0] = this;
        inputParams[1] = arguments[0];
    }
    // Iterate over properties of the second argument and copy them to the first.
    for (let propertyKey in inputParams[1]) {
        inputParams[0][propertyKey] = inputParams[1][propertyKey];
    }
    // Return the modified first argument.
    return inputParams[0];
};

function baseObject() { /* Empty constructor for the base class */ }

baseObject.prototype.initialize = function() {}; // Default initializer

baseObject.derive = function(definitionObj) {
    // Create a new constructor for the derived class.
    let derivedClassConstructor = function() {
        // If the first argument isn't the baseObject, call the custom initializer.
        if (arguments[0] !== baseObject) {
            return this.initialize.apply(this, arguments);
        }
    };
    // Create an instance of the current class to use as the prototype.
    const prototypeInstance = new this(baseObject);
    // Merge the definition object's properties into the prototype.
    jsUtilMerge(prototypeInstance, definitionObj);
    // Assign the new prototype to the derived class constructor.
    derivedClassConstructor.prototype = prototypeInstance;
    // Inherit the 'derive' method from the parent class.
    derivedClassConstructor.derive = this.derive;
    return derivedClassConstructor;
};


var domWrapper = baseObject.derive({
    // Initializes a new DOM element wrapper.
    initialize: function(targetNode, targetDoc) {
        if (typeof(targetNode) === "string") {
            targetNode = (targetDoc || document).createElement(targetNode);
        }
        targetNode = getElementWrap(targetNode);
        return targetNode;
    },

    // Appends the current element to another.
    attachTo: function(targetContainer) {
        targetContainer.appendChild(this);
        return this;
    },

    // Inserts the current element before another.
    insertPriorTo: function(referenceNode) {
        referenceNode.parentNode.insertBefore(this, referenceNode);
        return this;
    },

    // Registers an event listener on the current element.
    registerEvent: function(eventType, eventHandler) {
        utilityKit.registerEvent(this, eventType, eventHandler);
        return this;
    },

    // Sets the inner HTML content of the element.
    updateContent: function(newContent) {
        this.innerHTML = newContent;
        return this;
    },

    // Calculates the absolute position and height of the element.
    getPosition: function() {
        let currentLeft = 0,
            currentTop = 0;
        let traversalObject = this;
        if (traversalObject.offsetParent) {
            do {
                currentLeft += traversalObject.offsetLeft;
                currentTop += traversalObject.offsetTop;
            } while (traversalObject = traversalObject.offsetParent);
        }
        // Account for border width in some browsers.
        const borderOffset = (!window.opera) ? parseInt(this.retrieveStyle('border-width') || this.style.border) || 0 : 0;
        return [currentLeft + borderOffset, currentTop + borderOffset + this.offsetHeight];
    },

    // Prevents text selection within the element.
    preventSelection: function() {
        utilityKit.preventSelection(this);
        return this;
    },

    // Finds the closest parent element with a specific tag name.
    findParentTag: function(tagName) {
        let currentNode = this;
        do {
            if (currentNode && currentNode.nodeName && currentNode.nodeName.toUpperCase() === tagName) {
                return currentNode;
            }
            currentNode = currentNode.parentNode;
        } while (currentNode);
        return false;
    },

    // Checks if the element has a specific CSS class.
    hasClassName: function(cssClass) {
        return this.className.match(new RegExp('(\\s|^)textEdit-' + cssClass + '(\\s|$)'));
    },

    // Adds a CSS class to the element if it doesn't already exist.
    addClassName: function(cssClass) {
        if (!this.hasClassName(cssClass)) {
            this.className += " textEdit-" + cssClass;
        }
        return this;
    },

    // Removes a CSS class from the element.
    removeClassName: function(cssClass) {
        if (this.hasClassName(cssClass)) {
            this.className = this.className.replace(new RegExp('(\\s|^)textEdit-' + cssClass + '(\\s|$)'), ' ');
        }
        return this;
    },

    // Applies multiple CSS styles to the element.
    applyStyles: function(styleProperties) {
        const elementStyle = this.style;
        for (let styleKey in styleProperties) {
            switch (styleKey) {
                case 'float':
                    elementStyle['cssFloat'] = elementStyle['styleFloat'] = styleProperties[styleKey];
                    break;
                case 'opacity':
                    elementStyle.opacity = styleProperties[styleKey];
                    elementStyle.filter = "alpha(opacity=" + Math.round(styleProperties[styleKey] * 100) + ")";
                    break;
                case 'className':
                    this.className = styleProperties[styleKey];
                    break;
                default:
                    // Apply other styles directly
                    elementStyle[styleKey] = styleProperties[styleKey];
            }
        }
        return this;
    },

    // Retrieves the computed style for a given CSS rule.
    retrieveStyle: function(cssRule, computedStyleDoc) {
        const doc = (!computedStyleDoc) ? document.defaultView : computedStyleDoc;
        if (this.nodeType === 1) {
            return (doc && doc.getComputedStyle) ? doc.getComputedStyle(this, null).getPropertyValue(cssRule) : this.currentStyle[utilityKit.toCamelCase(cssRule)];
        }
    },

    // Removes the element from its parent.
    deleteSelf: function() {
        this.parentNode.removeChild(this);
        return this;
    },

    // Assigns multiple attributes to the element.
    assignAttributes: function(attributeMap) {
        for (let attributeName in attributeMap) {
            this[attributeName] = attributeMap[attributeName];
        }
        return this;
    }
});


var utilityKit = {
    isInternetExplorer: (navigator.appVersion.indexOf("MSIE") !== -1), // Detect if browser is Internet Explorer

    // Adds an event listener, handling cross-browser compatibility.
    registerEvent: function(targetObject, eventType, eventHandler) {
        (targetObject.addEventListener) ? targetObject.addEventListener(eventType, eventHandler, false): targetObject.attachEvent("on" + eventType, eventHandler);
    },

    // Converts an iterable object (like NodeList) to a real Array.
    convertToArray: function(collection) {
        let itemCount = collection.length,
            outputArray = Array(itemCount); // Using Array constructor directly
        while (itemCount--) {
            outputArray[itemCount] = collection[itemCount];
        }
        return outputArray;
    },

    // Prevents selection of text within a DOM element and its children.
    preventSelection: function(domElement) {
        if (domElement.setAttribute && domElement.nodeName.toLowerCase() !== 'input' && domElement.nodeName.toLowerCase() !== 'textarea') {
            domElement.setAttribute('unselectable', 'on');
        }
        for (let idx = 0; idx < domElement.childNodes.length; idx++) {
            utilityKit.preventSelection(domElement.childNodes[idx]);
        }
    },

    // Converts a hyphen-separated string to camelCase.
    toCamelCase: function(inputString) {
        return inputString.replace(/\-(.)/g, function(match, letter) {
            return letter.toUpperCase()
        });
    },

    // Checks if an item exists within an array.
    isInArray: function(targetArray, searchItem) {
        return (utilityKit.findItem(targetArray, searchItem) !== null);
    },

    // Searches for an item in an array and returns its index or null.
    findItem: function(targetArray, searchItem) {
        for (let idx = 0; idx < targetArray.length; idx++) {
            if (targetArray[idx] === searchItem)
                return idx;
        }
        return null;
    },

    // Cancels an event's default action and stops propagation.
    haltEvent: function(eventObj) {
        eventObj = eventObj || window.event;
        if (eventObj.preventDefault && eventObj.stopPropagation) {
            eventObj.preventDefault();
            eventObj.stopPropagation();
        }
        return false;
    },

    domReadyCallbacks: [], // Array to hold functions to execute when DOM is ready

    // Function executed when the DOM is fully loaded.
    onDomReady: function() {
        // Ensure this runs only once.
        if (arguments.callee.done) return;
        arguments.callee.done = true;
        for (let idx = 0; idx < utilityKit.domReadyCallbacks.length; idx++) {
            utilityKit.domReadyCallbacks[idx]();
        }
    },

    // Registers a function to be called when the DOM is ready.
    whenDomIsReady: function(callbackFn) {
        this.domReadyCallbacks.push(callbackFn);
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", utilityKit.onDomReady, null);
        } else if (utilityKit.isInternetExplorer) {
            // IE-specific DOM ready hack.
            document.write("<style>.textEdit-main p { margin: 0; }</style><scr" + "ipt id=__ie_onload defer " + ((location.protocol === "https:") ? "src='javascript:void(0)'" : "src=//0") + "><\\/scr" + "ipt>");
            getElementWrap("__ie_onload").onreadystatechange = function() {
                if (this.readyState === "complete") {
                    utilityKit.onDomReady();
                }
            };
        }
        window.onload = utilityKit.onDomReady; // Fallback for older browsers
    }
};

function getElementWrap(targetNode) {
    if (typeof(targetNode) === "string") {
        targetNode = document.getElementById(targetNode);
    }
    // If element exists and isn't already wrapped, wrap it.
    return (targetNode && !targetNode.attachTo) ? jsUtilMerge(targetNode, domWrapper.prototype) : targetNode;
}

var eventBroadcaster = {
    // Adds a new event handler for a specific event type.
    registerEvent: function(eventType, eventHandler) {
        if (eventHandler) {
            this.eventList = this.eventList || {};
            this.eventList[eventType] = this.eventList[eventType] || [];
            this.eventList[eventType].push(eventHandler);
        }
        return this;
    },

    // Triggers an event, calling all registered handlers.
    triggerEvent: function() {
        const inputParams = utilityKit.convertToArray(arguments);
        const eventType = inputParams.shift();
        if (this.eventList && this.eventList[eventType]) {
            for (let idx = 0; idx < this.eventList[eventType].length; idx++) {
                this.eventList[eventType][idx].apply(this, inputParams);
            }
        }
    }
};

function translateString(inputString) { // Simple passthrough for localization hooks
    return inputString;
}

Function.prototype.bindContext = function() {
    const originalMethod = this;
    const inputParams = utilityKit.convertToArray(arguments);
    const contextObject = inputParams.shift();
    return function() {
        // Ensure utilityKit is defined before attempting to use it.
        if (typeof(utilityKit) !== 'undefined') {
            return originalMethod.apply(contextObject, inputParams.concat(utilityKit.convertToArray(arguments)));
        }
    };
}

Function.prototype.bindEventHandler = function() {
    const originalMethod = this;
    const inputParams = utilityKit.convertToArray(arguments);
    const contextObject = inputParams.shift();
    return function(eventObj) {
        eventObj = eventObj || window.event;
        let eventTarget;
        if (eventObj.target) {
            eventTarget = eventObj.target;
        } else {
            eventTarget = eventObj.srcElement;
        }
        return originalMethod.apply(contextObject, [eventObj, eventTarget].concat(inputParams));
    };
}


/* BEGIN EDITOR CONFIGURATION */

var editToolSettings = baseObject.derive({
    toolbarButtons: {
        'bold': {
            name: translateString('Apply Bold Style'),
            command: 'Bold',
            tags: ['B', 'STRONG'],
            css: {
                'font-weight': 'bold'
            },
            key: 'b'
        },
        'italic': {
            name: translateString('Apply Italic Style'),
            command: 'Italic',
            tags: ['EM', 'I'],
            css: {
                'font-style': 'italic'
            },
            key: 'i'
        },
        'underline': {
            name: translateString('Apply Underline Style'),
            command: 'Underline',
            tags: ['U'],
            css: {
                'text-decoration': 'underline'
            },
            key: 'u'
        },
        'left': {
            name: translateString('Align Left'),
            command: 'justifyleft',
            noActive: true
        },
        'center': {
            name: translateString('Align Center'),
            command: 'justifycenter',
            noActive: true
        },
        'right': {
            name: translateString('Align Right'),
            command: 'justifyright',
            noActive: true
        },
        'justify': {
            name: translateString('Justify Text'),
            command: 'justifyfull',
            noActive: true
        },
        'ol': {
            name: translateString('Insert Ordered List'),
            command: 'insertorderedlist',
            tags: ['OL']
        },
        'ul': {
            name: translateString('Insert Unordered List'),
            command: 'insertunorderedlist',
            tags: ['UL']
        },
        'subscript': {
            name: translateString('Apply Subscript'),
            command: 'subscript',
            tags: ['SUB']
        },
        'superscript': {
            name: translateString('Apply Superscript'),
            command: 'superscript',
            tags: ['SUP']
        },
        'strikethrough': {
            name: translateString('Apply Strikethrough'),
            command: 'strikeThrough',
            css: {
                'text-decoration': 'line-through'
            }
        },
        'removeformat': {
            name: translateString('Clear Formatting'),
            command: 'removeformat',
            noActive: true
        },
        'indent': {
            name: translateString('Increase Indent'),
            command: 'indent',
            noActive: true
        },
        'outdent': {
            name: translateString('Decrease Indent'),
            command: 'outdent',
            noActive: true
        },
        'hr': {
            name: translateString('Insert Horizontal Rule'),
            command: 'insertHorizontalRule',
            noActive: true
        }
    },
    iconResourcePath: '../editorIcons.gif', // Path to the sprite image for icons
    activeButtonsList: ['save', 'bold', 'italic', 'underline', 'left', 'center', 'right', 'justify', 'ol', 'ul', 'fontSize', 'fontFamily', 'fontFormat', 'indent', 'outdent', 'image', 'upload', 'link', 'unlink', 'forecolor', 'bgcolor'],
    buttonIconMap: {
        "xhtml": 1,
        "bgcolor": 2,
        "forecolor": 3,
        "bold": 4,
        "center": 5,
        "hr": 6,
        "indent": 7,
        "italic": 8,
        "justify": 9,
        "left": 10,
        "ol": 11,
        "outdent": 12,
        "removeformat": 13,
        "right": 14,
        "save": 25,
        "strikethrough": 16,
        "subscript": 17,
        "superscript": 18,
        "ul": 19,
        "underline": 20,
        "image": 21,
        "link": 22,
        "unlink": 23,
        "close": 24,
        "arrow": 26,
        "upload": 27
    }

});
/* END EDITOR CONFIGURATION */


var editorManagers = {
    registeredPlugins: [], // List of plugin constructors and their options
    activeEditors: [], // List of active rich text editor instances

    // Registers a new plugin for all future editor instances.
    addPlugin: function(pluginConstructor, pluginOptions) {
        this.registeredPlugins.push({
            p: pluginConstructor,
            o: pluginOptions
        });
    },

    // Converts all found textarea elements into rich text editors.
    processAllTextAreas: function(editorConfig) {
        const allTextAreasNodes = document.getElementsByTagName("textarea");
        for (let idx = 0; idx < allTextAreasNodes.length; idx++) {
            editorManagers.activeEditors.push(new richTextEditor(editorConfig).createPanelForInstance(allTextAreasNodes[idx]));
        }
        return editorManagers.activeEditors;
    },

    // Locates an editor instance by its associated element.
    locateEditor: function(targetElement) {
        const editors = editorManagers.activeEditors;
        for (let idx = 0; idx < editors.length; idx++) {
            if (editors[idx].getInstanceById(targetElement)) {
                return editors[idx];
            }
        }
    }
};


var richTextEditor = baseObject.derive({
    // Main constructor for the rich text editor.
    initialize: function(editorOptions) {
        this.configOptions = new editToolSettings();
        jsUtilMerge(this.configOptions, editorOptions);
        this.editorInstances = []; // Stores individual content editable instances
        this.activePlugins = []; // Stores instantiated plugins

        const plugins = editorManagers.registeredPlugins;
        for (let idx = 0; idx < plugins.length; idx++) {
            this.activePlugins.push(new plugins[idx].p(this, plugins[idx].o));
        }
        editorManagers.activeEditors.push(this);
        utilityKit.registerEvent(document.body, 'mousedown', this.checkSelectionChange.bindEventHandler(this));
    },

    // Creates an editing panel and associates it with a content instance.
    createPanelForInstance: function(targetElement, instanceOptions) {
        targetElement = this.checkAndReplaceExisting(getElementWrap(targetElement));
        const panelContainer = new domWrapper('DIV').applyStyles({
            width: (parseInt(targetElement.retrieveStyle('width')) || targetElement.clientWidth) + 'px'
        }).insertPriorTo(targetElement);
        this.assignPanel(panelContainer);
        return this.attachInstance(targetElement, instanceOptions);
    },

    // Checks if an element already has an editor, removes it if so.
    checkAndReplaceExisting: function(targetElement) {
        const foundEditor = editorManagers.locateEditor(targetElement);
        if (foundEditor) {
            foundEditor.detachInstance(targetElement);
            foundEditor.hidePanel();
        }
        return targetElement;
    },

    // Attaches a new content editable instance to the editor manager.
    attachInstance: function(targetElement, instanceOptions) {
        targetElement = this.checkAndReplaceExisting(getElementWrap(targetElement));
        let createdInstance;
        if (targetElement.contentEditable || !!window.opera) {
            createdInstance = new editorInstance(targetElement, instanceOptions, this);
        } else {
            createdInstance = new iframeEditorInstance(targetElement, instanceOptions, this);
        }
        this.editorInstances.push(createdInstance);
        return this;
    },

    // Removes a specific content editable instance.
    detachInstance: function(targetElement) {
        targetElement = getElementWrap(targetElement);
        const allInstances = this.editorInstances;
        for (let idx = 0; idx < allInstances.length; idx++) {
            if (allInstances[idx].originalElement === targetElement) {
                allInstances[idx].deleteSelf();
                this.editorInstances.splice(idx, 1);
            }
        }
    },

    // Removes the editor's control panel from the DOM.
    hidePanel: function() {
        if (this.editorPanel) {
            this.editorPanel.deleteSelf();
            this.editorPanel = null;
        }
    },

    // Retrieves an editor instance by its associated DOM element.
    getInstanceById: function(targetElement) {
        targetElement = getElementWrap(targetElement);
        const allInstances = this.editorInstances;
        for (let idx = 0; idx < allInstances.length; idx++) {
            if (allInstances[idx].originalElement === targetElement) {
                return allInstances[idx];
            }
        }
    },

    // Sets the editor's control panel.
    assignPanel: function(panelElement) {
        this.editorPanel = new editorPanel(getElementWrap(panelElement), this.configOptions, this);
        this.triggerEvent('panelReady', this.editorPanel);
        return this;
    },

    // Executes a command on the currently selected editor instance.
    executeCommand: function(commandName, commandArgs) {
        if (this.selectedInstance) {
            this.selectedInstance.executeCommand(commandName, commandArgs);
        }
    },

    // Generates CSS for an icon based on its name and options.
    fetchIconStyle: function(requestedIcon, iconOptions) {
        const iconIndex = this.configOptions.buttonIconMap[requestedIcon];
        const iconFile = (iconOptions.iconFiles) ? iconOptions.iconFiles[requestedIcon] : '';
        return {
            backgroundImage: "url('" + ((iconIndex) ? this.configOptions.iconResourcePath : iconFile) + "')",
            backgroundPosition: ((iconIndex) ? ((iconIndex - 1) * -18) : 0) + 'px 0px'
        };
    },

    // Checks if the user's selection has changed outside the editor.
    checkSelectionChange: function(eventObj, checkNode) {
        let elementFound = false;
        do {
            if (checkNode.className && checkNode.className.indexOf('textEdit') !== -1) {
                return false; // Clicked inside an editor component
            }
        } while (checkNode = checkNode.parentNode);

        // Trigger blur event for the previously selected instance
        this.triggerEvent('blur', this.selectedInstance, checkNode);
        this.lastSelectedInstance = this.selectedInstance;
        this.selectedInstance = null;
        return false;
    }

});
// Extend the richTextEditor with event broadcasting capabilities
richTextEditor = richTextEditor.derive(eventBroadcaster);


var editorInstance = baseObject.derive({
    isCurrentlySelected: false, // Flag indicating if this instance is currently active

    // Initializes a new content editable instance.
    initialize: function(originalElement, instanceOptions, parentEditor) {
        this.parentEditor = parentEditor;
        this.elementRef = this.originalElement = originalElement;
        this.configOptions = instanceOptions || {};

        const computedWidth = parseInt(originalElement.retrieveStyle('width')) || originalElement.clientWidth;
        const computedHeight = parseInt(originalElement.retrieveStyle('height')) || originalElement.clientHeight;
        this.startHeight = computedHeight - 8;

        const isTextareaElement = (originalElement.nodeName.toLowerCase() === "textarea");
        if (isTextareaElement || this.configOptions.hasPanel) {
            // Check for IE7 quirks mode
            const isOldIE = (utilityKit.isInternetExplorer && !((typeof document.body.style.maxHeight !== "undefined") && document.compatMode === "CSS1Compat"));
            const styleObject = {
                width: computedWidth + 'px',
                border: '1px solid #ccc',
                borderTop: 0,
                overflowY: 'auto',
                overflowX: 'hidden'
            };
            styleObject[(isOldIE) ? 'height' : 'maxHeight'] = (this.parentEditor.configOptions.maxHeight) ? this.parentEditor.configOptions.maxHeight + 'px' : null;
            this.containerDiv = new domWrapper('DIV').applyStyles(styleObject).insertPriorTo(originalElement);
            const contentAreaDiv = new domWrapper('DIV').applyStyles({
                width: (computedWidth - 8) + 'px',
                margin: '4px',
                minHeight: computedHeight + 'px'
            }).addClassName('main').attachTo(this.containerDiv);

            originalElement.applyStyles({
                display: 'none'
            });

            contentAreaDiv.innerHTML = originalElement.innerHTML;
            if (isTextareaElement) {
                contentAreaDiv.updateContent(originalElement.value);
                this.sourceElement = originalElement;
                const parentForm = originalElement.findParentTag('FORM');
                if (parentForm) {
                    utilityKit.registerEvent(parentForm, 'submit', this.persistContent.bindContext(this));
                }
            }
            contentAreaDiv.applyStyles((isOldIE) ? {
                height: computedHeight + 'px'
            } : {
                overflow: 'hidden'
            });
            this.elementRef = contentAreaDiv;
        }
        this.parentEditor.registerEvent('blur', this.onBlurEvent.bindContext(this));

        this.initializeInstance();
        this.onBlurEvent();
    },

    // Sets up the content editable element.
    initializeInstance: function() {
        this.elementRef.setAttribute('contentEditable', 'true');
        if (this.getContent() === "") {
            this.updateContent('<br />');
        }
        this.instanceDoc = document.defaultView;
        this.elementRef.registerEvent('mousedown', this.selected.bindEventHandler(this))
            .registerEvent('keypress', this.keyDown.bindEventHandler(this))
            .registerEvent('focus', this.selected.bindContext(this))
            .registerEvent('blur', this.onBlurEvent.bindContext(this))
            .registerEvent('keyup', this.selected.bindContext(this));
        this.parentEditor.triggerEvent('addInstance', this);
    },

    // Removes the editor instance and restores the original element.
    deleteSelf: function() {
        this.persistContent();
        if (this.sourceElement || this.configOptions.hasPanel) {
            this.containerDiv.deleteSelf();
            this.originalElement.applyStyles({
                'display': 'block'
            });
            this.parentEditor.hidePanel();
        }
        this.disableEditing();
        this.parentEditor.triggerEvent('removeInstance', this);
    },

    // Disables editing for this instance.
    disableEditing: function() {
        this.elementRef.setAttribute('contentEditable', 'false');
    },

    // Retrieves the current selection object.
    getSelectionObject: function() {
        return (window.getSelection) ? window.getSelection() : document.selection;
    },

    // Retrieves the current range object from the selection.
    getRangeObject: function() {
        const currentSelection = this.getSelectionObject();
        if (!currentSelection) {
            return null;
        }
        return (currentSelection.rangeCount > 0) ? currentSelection.getRangeAt(0) : currentSelection.createRange();
    },

    // Sets the browser's selection to a given range.
    selectRange: function(rangeToSelect, selectionObject) {
        if (window.getSelection) {
            selectionObject.removeAllRanges();
            selectionObject.addRange(rangeToSelect);
        } else {
            rangeToSelect.select();
        }
    },

    // Retrieves the currently selected element or its parent.
    getSelectedElement: function() {
        const currentRange = this.getRangeObject();
        if (currentRange.startContainer) {
            const startContainerNode = currentRange.startContainer;
            if (currentRange.cloneContents().childNodes.length === 1) {
                for (let idx = 0; idx < startContainerNode.childNodes.length; idx++) {
                    const tempRange = startContainerNode.childNodes[idx].ownerDocument.createRange();
                    tempRange.selectNode(startContainerNode.childNodes[idx]);