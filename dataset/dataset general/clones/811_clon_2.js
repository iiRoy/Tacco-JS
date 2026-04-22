/*
 * RichTextEditor - Minimal Inline WYSIWYG
 * Copyright 2023-2024 Developer Name
 *
 * This software is provided under the terms of a permissive license
 * For more details, visit project-website.com
 * Please retain this attribution notice
 */
 var utilityMerge = function() {
  // Collect all arguments passed to this function
  var inputArguments = arguments;
  // If only one argument is provided, assume it's the source object
  // and the target object is 'this' context.
  if (inputArguments.length === 1) {
    inputArguments = [this, inputArguments[0]];
  }
  // Iterate over properties of the source object and copy them to the target object.
  for (var itemProperty in inputArguments[1]) {
    inputArguments[0][itemProperty] = inputArguments[1][itemProperty];
  }
  // Return the modified target object.
  return inputArguments[0];
};

function baseObject() { /* Empty constructor for the base class */ }

// Define the 'initialize' method on the prototype, to be overridden by subclasses.
baseObject.prototype.initialize = function() {};

// Static method to extend the baseObject, creating a new subclass.
baseObject.extend = function(definition) {
  // The constructor for the new class.
  var objectDefinition = function() {
    // Prevent the 'initialize' method from being called during prototype inheritance setup.
    if (arguments[0] !== baseObject) {
      return this.initialize.apply(this, arguments);
    }
  };
  // Create an instance of the current class (this) to inherit its prototype chain.
  var prototypeInstance = new this(baseObject);
  // Merge the provided definition properties into the new prototype instance.
  utilityMerge(prototypeInstance, definition);
  // Assign the newly created prototype instance to the constructor's prototype.
  objectDefinition.prototype = prototypeInstance;
  // Inherit the 'extend' static method from the parent class.
  objectDefinition.extend = this.extend;
  // Return the new subclass constructor.
  return objectDefinition;
};

// Define a new class 'domWrapper' extending 'baseObject' for DOM manipulation utilities.
var domWrapper = baseObject.extend({
  // Constructor for the domWrapper.
  initialize: function(elementNode, targetDocument) {
    // If a string is passed, it's assumed to be a tag name, so create a new element.
    if (typeof(elementNode) === "string") {
      elementNode = (targetDocument || document).createElement(elementNode);
    }
    // Ensure the element is wrapped by our utility function.
    elementNode = getDomElement(elementNode);
    return elementNode;
  },

  // Appends the current element to a specified parent element.
  attachTo: function(parentElement) {
    parentElement.appendChild(this);
    return this;
  },

  // Inserts the current element before a specified sibling element.
  insertBeforeSibling: function(siblingElement) {
    siblingElement.parentNode.insertBefore(this, siblingElement);
    return this;
  },

  // Registers an event listener on the current element.
  registerEvent: function(eventType, eventHandler) {
    coreUtilities.attachEventListener(this, eventType, eventHandler);
    return this;
  },

  // Sets the inner HTML content of the element.
  updateContent: function(newContent) {
    this.innerHTML = newContent;
    return this;
  },

  // Calculates the absolute position and total height of the element.
  getPositionData: function() {
    var currentLeftCoord = 0,
      currentTopCoord = 0;
    var currentElement = this;
    var traversalObject = this;
    // Traverse up the offsetParent chain to sum up offsets.
    if (traversalObject.offsetParent) {
      do {
        currentLeftCoord += traversalObject.offsetLeft;
        currentTopCoord += traversalObject.offsetTop;
      } while (traversalObject = traversalObject.offsetParent);
    }
    // Account for border width, if applicable and not in Opera.
    var borderSize = (!window.opera) ? parseInt(this.retrieveComputedStyle('border-width') || this.style.border) || 0 : 0;
    return [currentLeftCoord + borderSize, currentTopCoord + borderSize + this.offsetHeight];
  },

  // Prevents text selection within the element.
  preventSelection: function() {
    coreUtilities.preventSelection(this);
    return this;
  },

  // Finds the nearest ancestor element with a matching tag name.
  findAncestorTag: function(tagName) {
    var elementNode = this;
    do {
      if (elementNode && elementNode.nodeName && elementNode.nodeName.toUpperCase() === tagName) {
        return elementNode;
      }
      elementNode = elementNode.parentNode;
    } while (elementNode);
    return false; // No matching ancestor found.
  },

  // Checks if the element has a specific CSS class.
  hasStyleClass: function(classNameString) {
    return this.className.match(new RegExp('(\\s|^)nicEdit-' + classNameString + '(\\s|$)'));
  },

  // Adds a CSS class to the element if it doesn't already have it.
  addStyleClass: function(classNameString) {
    if (!this.hasStyleClass(classNameString)) {
      this.className += " nicEdit-" + classNameString;
    }
    return this;
  },

  // Removes a CSS class from the element if it has it.
  removeStyleClass: function(classNameString) {
    if (this.hasStyleClass(classNameString)) {
      this.className = this.className.replace(new RegExp('(\\s|^)nicEdit-' + classNameString + '(\\s|$)'), ' ');
    }
    return this;
  },

  // Applies a set of CSS styles to the element.
  applyStyles: function(styleObject) {
    var elementStyleProperty = this.style;
    for (var styleKey in styleObject) {
      switch (styleKey) {
        case 'float':
          // Handle cross-browser float property.
          elementStyleProperty['cssFloat'] = elementStyleProperty['styleFloat'] = styleObject[styleKey];
          break;
        case 'opacity':
          // Handle opacity with IE filter fallback.
          elementStyleProperty.opacity = styleObject[styleKey];
          elementStyleProperty.filter = "alpha(opacity=" + Math.round(styleObject[styleKey] * 100) + ")";
          break;
        case 'className':
          // Special case for setting the class name.
          this.className = styleObject[styleKey];
          break;
        default:
          // Apply other styles directly.
          elementStyleProperty[styleKey] = styleObject[styleKey];
      }
    }
    return this;
  },

  // Retrieves the computed style value for a given CSS property.
  retrieveComputedStyle: function(styleRuleName, targetDocument) {
    var doc = (!targetDocument) ? document.defaultView : targetDocument;
    if (this.nodeType === 1) {
      return (doc && doc.getComputedStyle) ? doc.getComputedStyle(this, null).getPropertyValue(styleRuleName) : this.currentStyle[coreUtilities.toCamelCase(styleRuleName)];
    }
  },

  // Removes the element from its parent.
  deleteElement: function() {
    this.parentNode.removeChild(this);
    return this;
  },

  // Sets multiple attributes on the element from an object.
  assignAttributes: function(attributesObject) {
    for (var attributeKey in attributesObject) {
      this[attributeKey] = attributesObject[attributeKey];
    }
    return this;
  }
});

// A collection of core utility functions.
var coreUtilities = {
  // Checks if the browser is Internet Explorer.
  isInternetExplorer: (navigator.appVersion.indexOf("MSIE") !== -1),

  // Attaches an event listener to an object, handling cross-browser differences.
  attachEventListener: function(obj, eventType, eventHandler) {
    (obj.addEventListener) ? obj.addEventListener(eventType, eventHandler, false) : obj.attachEvent("on" + eventType, eventHandler);
  },

  // Converts an iterable (like NodeList or arguments) to a true Array.
  convertToArray: function(collection) {
    var collectionLength = collection.length,
      resultArray = new Array(collectionLength);
    while (collectionLength--) {
      resultArray[collectionLength] = collection[collectionLength];
    }
    return resultArray;
  },

  // Prevents selection on an element and its children recursively.
  preventSelection: function(targetElement) {
    // Set unselectable attribute for non-input/textarea elements.
    if (targetElement.setAttribute && targetElement.nodeName.toLowerCase() !== 'input' && targetElement.nodeName.toLowerCase() !== 'textarea') {
      targetElement.setAttribute('unselectable', 'on');
    }
    // Recursively apply to child nodes.
    for (var loopIndex = 0; loopIndex < targetElement.childNodes.length; loopIndex++) {
      coreUtilities.preventSelection(targetElement.childNodes[loopIndex]);
    }
  },

  // Converts a hyphen-separated string to camelCase.
  toCamelCase: function(inputString) {
    return inputString.replace(/\-(.)/g, function(matchResult, matchedLetter) {
      return matchedLetter.toUpperCase()
    });
  },

  // Checks if an item is present in an array.
  isPresentInArray: function(targetArray, searchItem) {
    return (coreUtilities.findArrayIndex(targetArray, searchItem) !== null);
  },

  // Finds the index of an item in an array, returns null if not found.
  findArrayIndex: function(targetArray, searchElement) {
    for (var loopIndex = 0; loopIndex < targetArray.length; loopIndex++) {
      if (targetArray[loopIndex] === searchElement) {
        return loopIndex;
      }
    }
    return null;
  },

  // Cancels the default action and stops propagation of an event.
  stopEventPropagation: function(eventObject) {
    eventObject = eventObject || window.event;
    if (eventObject.preventDefault && eventObject.stopPropagation) {
      eventObject.preventDefault();
      eventObject.stopPropagation();
    }
    return false;
  },

  // Array to store functions to be executed when the DOM is ready.
  domReadyCallbacks: [],

  // Function called when the DOM is fully loaded.
  onDomContentReady: function() {
    // Ensure this function runs only once.
    if (arguments.callee.done) return;
    arguments.callee.done = true;
    // Execute all registered DOM ready callbacks.
    for (loopIndex = 0; loopIndex < coreUtilities.domReadyCallbacks.length; loopIndex++) {
      coreUtilities.domReadyCallbacks[loopIndex]();
    }
  },

  // Registers a callback function to be executed when the DOM is ready.
  registerDomReadyCallback: function(callbackFunction) {
    this.domReadyCallbacks.push(callbackFunction);
    // Use native DOMContentLoaded if available.
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", coreUtilities.onDomContentReady, null);
    } else if (coreUtilities.isInternetExplorer) {
      // IE-specific workaround for DOM ready.
      document.write("<style>.nicEdit-main p { margin: 0; }</style><scr" + "ipt id=__ie_onload defer " + ((location.protocol === "https:") ? "src='javascript:void(0)'" : "src=//0") + "><\/scr" + "ipt>");
      getDomElement("__ie_onload").onreadystatechange = function() {
        if (this.readyState === "complete") {
          coreUtilities.onDomContentReady();
        }
      };
    }
    // Fallback to window.onload.
    window.onload = coreUtilities.onDomContentReady;
  }
};

// Global utility function to get a DOM element by ID or wrap an existing element.
function getDomElement(elementNode) {
  if (typeof(elementNode) === "string") {
    elementNode = document.getElementById(elementNode);
  }
  // If element exists and isn't already a domWrapper, extend it.
  return (elementNode && !elementNode.attachTo) ? utilityMerge(elementNode, domWrapper.prototype) : elementNode;
}

// Mixin for event broadcasting capabilities.
var eventBroadcaster = {
  // Adds an event listener to this object.
  addEvent: function(eventTypeString, eventCallback) {
    if (eventCallback) {
      this.registeredEvents = this.registeredEvents || {};
      this.registeredEvents[eventTypeString] = this.registeredEvents[eventTypeString] || [];
      this.registeredEvents[eventTypeString].push(eventCallback);
    }
    return this;
  },
  // Triggers an event, calling all registered listeners.
  triggerEvent: function() {
    var inputArguments = coreUtilities.convertToArray(arguments),
      eventTypeString = inputArguments.shift();
    if (this.registeredEvents && this.registeredEvents[eventTypeString]) {
      for (var loopIndex = 0; loopIndex < this.registeredEvents[eventTypeString].length; loopIndex++) {
        this.registeredEvents[eventTypeString][loopIndex].apply(this, inputArguments);
      }
    }
  }
};

// Simple translation function (placeholder).
function translateString(s) {
  return s;
}

// Extends Function.prototype to provide a context-bound closure.
Function.prototype.bindContext = function() {
  var originalMethod = this,
    inputArguments = coreUtilities.convertToArray(arguments),
    boundObject = inputArguments.shift();
  return function() {
    // Check if coreUtilities is defined before using it.
    if (typeof(coreUtilities) !== 'undefined') {
      return originalMethod.apply(boundObject, inputArguments.concat(coreUtilities.convertToArray(arguments)));
    }
  };
};

// Extends Function.prototype to provide a context-bound closure for event listeners.
Function.prototype.bindEventListener = function() {
  var originalMethod = this,
    inputArguments = coreUtilities.convertToArray(arguments),
    eventTargetObject = inputArguments.shift();
  return function(eventObject) {
    eventObject = eventObject || window.event;
    // Determine the event target node.
    if (eventObject.target) {
      var eventTargetNode = eventObject.target;
    } else {
      var eventTargetNode = eventObject.srcElement;
    }
    return originalMethod.apply(eventTargetObject, [eventObject, eventTargetNode].concat(inputArguments));
  };
};

/* START EDITOR CONFIGURATION */

// Defines the default configuration settings for the rich text editor.
var editorSettings = baseObject.extend({
  // Definitions for toolbar buttons.
  toolbarButtons: {
    'bold': {
      buttonName: translateString('Click to Bold'),
      editorCommand: 'Bold',
      htmlTags: ['B', 'STRONG'],
      styleProperties: {
        'font-weight': 'bold'
      },
      accessKey: 'b'
    },
    'italic': {
      buttonName: translateString('Click to Italic'),
      editorCommand: 'Italic',
      htmlTags: ['EM', 'I'],
      styleProperties: {
        'font-style': 'italic'
      },
      accessKey: 'i'
    },
    'underline': {
      buttonName: translateString('Click to Underline'),
      editorCommand: 'Underline',
      htmlTags: ['U'],
      styleProperties: {
        'text-decoration': 'underline'
      },
      accessKey: 'u'
    },
    'left': {
      buttonName: translateString('Left Align'),
      editorCommand: 'justifyleft',
      noActiveState: true
    },
    'center': {
      buttonName: translateString('Center Align'),
      editorCommand: 'justifycenter',
      noActiveState: true
    },
    'right': {
      buttonName: translateString('Right Align'),
      editorCommand: 'justifyright',
      noActiveState: true
    },
    'justify': {
      buttonName: translateString('Justify Align'),
      editorCommand: 'justifyfull',
      noActiveState: true
    },
    'ol': {
      buttonName: translateString('Insert Ordered List'),
      editorCommand: 'insertorderedlist',
      htmlTags: ['OL']
    },
    'ul': {
      buttonName: translateString('Insert Unordered List'),
      editorCommand: 'insertunorderedlist',
      htmlTags: ['UL']
    },
    'subscript': {
      buttonName: translateString('Click to Subscript'),
      editorCommand: 'subscript',
      htmlTags: ['SUB']
    },
    'superscript': {
      buttonName: translateString('Click to Superscript'),
      editorCommand: 'superscript',
      htmlTags: ['SUP']
    },
    'strikethrough': {
      buttonName: translateString('Click to Strike Through'),
      editorCommand: 'strikeThrough',
      styleProperties: {
        'text-decoration': 'line-through'
      }
    },
    'removeformat': {
      buttonName: translateString('Remove Formatting'),
      editorCommand: 'removeformat',
      noActiveState: true
    },
    'indent': {
      buttonName: translateString('Indent Text'),
      editorCommand: 'indent',
      noActiveState: true
    },
    'outdent': {
      buttonName: translateString('Remove Indent'),
      editorCommand: 'outdent',
      noActiveState: true
    },
    'hr': {
      buttonName: translateString('Horizontal Rule'),
      editorCommand: 'insertHorizontalRule',
      noActiveState: true
    }
  },
  // Path to the sprite image containing all icons.
  iconSpritePath: '../nicEditorIcons.gif',
  // Ordered list of buttons to display in the toolbar.
  toolbarButtonOrder: ['save', 'bold', 'italic', 'underline', 'left', 'center', 'right', 'justify', 'ol', 'ul', 'fontSize', 'fontFamily', 'fontFormat', 'indent', 'outdent', 'image', 'upload', 'link', 'unlink', 'forecolor', 'bgcolor'],
  // Map of icon names to their position in the sprite (1-based index).
  spriteIconMap: {
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
  },
  // Flag to determine if new editor instances should start with a line break.
  startWithLineBreak: true
});
/* END EDITOR CONFIGURATION */


// Central manager for all rich text editor instances and plugins.
var editorManager = {
  // Array to hold registered plugin classes and their options.
  registeredPlugins: [],
  // Array to hold all active richTextEditor instances.
  activeEditors: [],

  // Registers a new plugin with the editor manager.
  addPlugin: function(pluginClass, pluginOptions) {
    this.registeredPlugins.push({
      p: pluginClass,
      o: pluginOptions
    });
  },

  // Initializes rich text editors for all textarea elements on the page.
  initAllTextAreas: function(editorOptions) {
    var textAreaElements = document.getElementsByTagName("textarea");
    for (var loopIndex = 0; loopIndex < textAreaElements.length; loopIndex++) {
      editorManager.activeEditors.push(new richTextEditor(editorOptions).createToolbarForInstance(textAreaElements[loopIndex]));
    }
    return editorManager.activeEditors;
  },

  // Locates an editor instance associated with a given element.
  locateEditorInstance: function(elementToFind) {
    var editors = editorManager.activeEditors;
    for (var loopIndex = 0; loopIndex < editors.length; loopIndex++) {
      if (editors[loopIndex].getInstanceByElement(elementToFind)) {
        return editors[loopIndex]; // Returns the parent richTextEditor, not the specific instance.
      }
    }
  }
};


// The main Rich Text Editor class.
var richTextEditor = baseObject.extend({
  // Constructor for the richTextEditor.
  initialize: function(initialOptions) {
    this.options = new editorSettings(); // Load default settings.
    utilityMerge(this.options, initialOptions); // Override with custom options.
    this.editorInstances = new Array(); // Stores individual editable content instances.
    this.activePlugins = new Array(); // Stores active plugin instances.

    // Initialize all registered plugins.
    var plugins = editorManager.registeredPlugins;
    for (var loopIndex = 0; loopIndex < plugins.length; loopIndex++) {
      this.activePlugins.push(new plugins[loopIndex].p(this, plugins[loopIndex].o));
    }
    editorManager.activeEditors.push(this); // Add this editor to the manager's list.
    // Attach a global mousedown listener to detect selection changes outside the editor.
    coreUtilities.attachEventListener(document.body, 'mousedown', this.checkSelectionChange.bindEventListener(this));
  },

  // Creates a toolbar and attaches an editable instance to an element.
  createToolbarForInstance: function(elementNode, initialOptions) {
    elementNode = this.replaceExistingEditor(getDomElement(elementNode)); // Check and replace existing editor if any.
    // Create a DIV for the toolbar and insert it before the target element.
    var toolbarElement = new domWrapper('DIV').applyStyles({
      width: (parseInt(elementNode.retrieveComputedStyle('width')) || elementNode.clientWidth) + 'px'
    }).insertBeforeSibling(elementNode);
    this.assignToolbar(toolbarElement); // Set this DIV as the editor's toolbar.
    return this.addNewInstance(elementNode, initialOptions); // Add the editable instance.
  },

  // Checks if an element already has an editor, and removes it if found.
  replaceExistingEditor: function(elementNode) {
    var foundEditor = editorManager.locateEditorInstance(elementNode);
    if (foundEditor) {
      foundEditor.deleteInstance(elementNode); // Remove the specific instance.
      foundEditor.deleteToolbar(); // Remove the panel associated with the main editor.
    }
    return elementNode;
  },

  // Adds a new editable content instance for a given element.
  addNewInstance: function(elementNode, initialOptions) {
    elementNode = this.replaceExistingEditor(getDomElement(elementNode)); // Ensure no existing editor.
    var newEditorInstance;
    // Determine whether to use a contentEditable div or an iframe.
    if (elementNode.contentEditable || !!window.opera) {
      newEditorInstance = new editorContentInstance(elementNode, initialOptions, this);
    } else {
      newEditorInstance = new nicEditorIFrameInstance(elementNode, initialOptions, this); // Assuming nicEditorIFrameInstance exists.
    }
    this.editorInstances.push(newEditorInstance); // Add to the list of active instances.
    return this;
  },

  // Removes a specific editable instance associated with an element.
  deleteInstance: function(elementNode) {
    elementNode = getDomElement(elementNode);
    var instances = this.editorInstances;
    for (var loopIndex = 0; loopIndex < instances.length; loopIndex++) {
      if (instances[loopIndex].e === elementNode) {
        instances[loopIndex].destroyInstance(); // Call instance's removal method.
        this.editorInstances.splice(loopIndex, 1); // Remove from array.
      }
    }
  },

  // Removes the main editor toolbar.
  deleteToolbar: function() {
    if (this.editorToolbar) {
      this.editorToolbar.deleteElement(); // Remove the toolbar DOM element.
      this.editorToolbar = null; // Clear reference.
    }
  },

  // Retrieves an editor content instance by its associated DOM element.
  getInstanceByElement: function(elementToFind) {
    elementToFind = getDomElement(elementToFind);
    var instances = this.editorInstances;
    for (var loopIndex = 0; loopIndex < instances.length; loopIndex++) {
      if (instances[loopIndex].e === elementToFind) {
        return instances[loopIndex];
      }
    }
  },

  // Assigns a DOM element to be the editor's toolbar.
  assignToolbar: function(elementNode) {
    this.editorToolbar = new nicEditorPanel(getDomElement(elementNode), this.options, this); // Assuming nicEditorPanel exists.
    this.triggerEvent('panel', this.editorToolbar); // Fire event that panel is set.
    return this;
  },

  // Executes an editor command on the currently selected instance.
  executeEditorCommand: function(commandName, commandArgs) {
    if (this.currentSelectedInstance) {
      this.currentSelectedInstance.nicCommand(commandName, commandArgs); // Assuming nicCommand exists on instance.
    }
  },

  // Retrieves CSS properties for an icon based on its name and options.
  getToolbarIcon: function(requestedIconName, pluginOptions) {
    var iconSpriteData = this.options.spriteIconMap[requestedIconName];
    var iconFilePath = (pluginOptions.iconFiles) ? pluginOptions.iconFiles[requestedIconName] : '';
    return {
      backgroundImage: "url('" + ((iconSpriteData) ? this.options.iconSpritePath : iconFilePath) + "')",
      backgroundPosition: ((iconSpriteData) ? ((iconSpriteData - 1) * -18) : 0) + 'px 0px'
    };
  },

  // Checks for selection changes, specifically when clicking outside a nicEdit element.
  checkSelectionChange: function(eventObject, clickedElement) {
    var isNicEditElement = false;
    do {
      if (clickedElement.className && clickedElement.className.indexOf('nicEdit') !== -1) {
        return false; // Clicked inside a nicEdit element, do nothing.
      }
    } while (clickedElement = clickedElement.parentNode);
    // If clicked outside, trigger blur event and clear selected instance.
    this.triggerEvent('blur', this.currentSelectedInstance, clickedElement);
    this.previousSelectedInstance = this.currentSelectedInstance;
    this.currentSelectedInstance = null;
    return false;
  }
});
// Extend the richTextEditor with event broadcasting capabilities.
richTextEditor = richTextEditor.extend(eventBroadcaster);


// Represents an individual editable content area instance within the rich text editor.
var editorContentInstance = baseObject.extend({
  isActiveSelection: false, // Indicates if this instance is currently active/selected.

  // Constructor for editorContentInstance.
  initialize: function(elementNode, options, parentEditor) {
    this.parentEditor = parentEditor;
    this.contentElement = this.e = elementNode; // Store original and wrapped element.
    this.options = options || {}; // Instance-specific options.

    var newWidth = parseInt(elementNode.retrieveComputedStyle('width')) || elementNode.clientWidth;
    var newHeight = parseInt(elementNode.retrieveComputedStyle('height')) || elementNode.clientHeight;
    this.originalHeight = newHeight - 8; // Calculate initial height.

    var isTextAreaInput = (elementNode.nodeName.toLowerCase() === "textarea");
    // If it's a textarea or has a panel, replace it with a contentEditable div.
    if (isTextAreaInput || this.options.hasPanel) {
      // IE7 specific style adjustments.
      var isOldIE = (coreUtilities.isInternetExplorer && !((typeof document.body.style.maxHeight !== "undefined") && document.compatMode === "CSS1Compat"));
      var styleSettings = {
        width: newWidth + 'px',
        border: '1px solid #ccc',
        borderTop: 0,
        overflowY: 'auto',
        overflowX: 'hidden'
      };
      // Set maxHeight if specified in editor options.
      styleSettings[(isOldIE) ? 'height' : 'maxHeight'] = (this.parentEditor.options.maxHeight) ? this.parentEditor.options.maxHeight + 'px' : null;
      // Create a container DIV and insert it before the original element.
      this.editorContainerDiv = new domWrapper('DIV').applyStyles(styleSettings).insertBeforeSibling(elementNode);
      // Create the actual editable content DIV.
      var editableContentDiv = new domWrapper('DIV').applyStyles({
        width: (newWidth - 8) + 'px',
        margin: '4px',
        minHeight: newHeight + 'px'
      }).addStyleClass('main').attachTo(this.editorContainerDiv);

      elementNode.applyStyles({
        display: 'none'
      }); // Hide the original element.

      editableContentDiv.innerHTML = elementNode.innerHTML; // Copy content.
      if (isTextAreaInput) {
        editableContentDiv.updateContent(elementNode.value); // Copy textarea value.
        this.originalInput = elementNode; // Keep reference to original textarea.
        var parentForm = elementNode.findAncestorTag('FORM');
        // If part of a form, save content on form submission.
        if (parentForm) {
          coreUtilities.attachEventListener(parentForm, 'submit', this.persistContent.bindContext(this));
        }
      }
      // Apply IE7 height fix or overflow style.
      editableContentDiv.applyStyles((isOldIE) ? {
        height: newHeight + 'px'
      } : {
        overflow: 'hidden'
      });
      this.contentElement = editableContentDiv; // Update contentElement to the new editable div.
    }
    // Register blur event for the parent editor.
    this.parentEditor.addEvent('blur', this.blur.bindContext(this));

    this.initializeInstance(); // Initialize contentEditable properties.
    this.blur(); // Initial blur state.
  },

  // Sets up the contentEditable element and event listeners.
  initializeInstance: function() {
    this.contentElement.setAttribute('contentEditable', 'true');
    // If content is empty and option is set, add a line break for better cursor placement.
    if (this.getContent() === "" && this.options.startWithLineBreak) {
      this.updateContent('<br />');
    }
    this.contentDocument = document.defaultView; // Reference to the default view.
    // Attach event listeners to the editable content area.
    this.contentElement.registerEvent('mousedown', this.selected.bindEventListener(this))
      .registerEvent('keypress', this.keyDown.bindEventListener(this))
      .registerEvent('focus', this.selected.bindContext(this))
      .registerEvent('blur', this.blur.bindContext(this))
      .registerEvent('keyup', this.selected.bindContext(this));
    this.parentEditor.triggerEvent('add', this); // Notify parent editor that instance is added.
  },

  // Removes the editor instance and restores the original element.
  destroyInstance: function() {
    this.persistContent(); // Save content back to original element.
    if (this.originalInput || this.options.hasPanel) {
      this.editorContainerDiv.deleteElement(); // Remove the editor container.
      this.e.applyStyles({
        'display': 'block'
      }); // Show the original element.
      this.parentEditor.deleteToolbar(); // Remove the toolbar.
    }
    this.deactivateEditor(); // Disable contentEditable.
    this.parentEditor.triggerEvent('remove', this); // Notify parent editor that instance is removed.
  },

  // Disables the contentEditable attribute.
  deactivateEditor: function() {
    this.contentElement.setAttribute('contentEditable', 'false');
  },

  // Retrieves the current selection object.
  getSelectionObject: function() {
    return (window.getSelection) ? window.getSelection() : document.selection;
  },

  // Retrieves the current range object from the selection.
  getRangeObject: function() {
    var selectionObject = this.getSelectionObject();
    if (!selectionObject) {
      return null;
    }
    // Return the first range or create a new one.
    return (selectionObject.rangeCount > 0) ? selectionObject.getRangeAt(0) :
      selectionObject.createRange && selectionObject.createRange() || document.createRange();
  },

  // Sets the selection range.
  setSelectionRange: function(currentRange, selectionObject) {
    if (window.getSelection) {
      selectionObject.removeAllRanges();
      selectionObject.addRange(currentRange);
    } else {
      currentRange.select();
    }
  },

  // Retrieves the element containing the current selection.
  getSelectedElement: function() {
    var rangeObject = this.getRangeObject();
    if (rangeObject.startContainer) {
      var containerNode = rangeObject.startContainer;
      // If selection contains only one child node, iterate to find it.
      if (rangeObject.cloneContents().childNodes.length === 1) {
        for (var loopIndex = 0; loopIndex < containerNode.childNodes.length; loopIndex++) {
          var currentRange = containerNode.childNodes[loopIndex].ownerDocument.createRange();
          // ... (rest of the original code for selElm)
        }
      }
    }
  }
});