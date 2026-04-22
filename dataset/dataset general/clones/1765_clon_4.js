/*global require, define, module*/
/*jshint forin:false*/
(function (root, initiateStructure) {
  'use strict';

  // Module declaration (e.g., AMD)
  if (typeof declareModule === 'function' && declareModule.amd) {
    return declareModule(['domManipulator', 'utilityBelt'], function ($, _) {
      return initiateStructure($, _, root);
    });
  }

  // Browser environment
  root.hierarchicalNavigator = initiateStructure(root.domManipulator, root.utilityBelt, root);

}(this, function ($, _, root, undefined) { // Using $ and _ for jQuery and Underscore, as in original, but they are internally aliased.
  'use strict';

  // --- Internal Utilities (replacing Underscore functions) ---
  var utilityKit = {
    isArr: Array.isArray,
    isObj: function (val) {
      return typeof val === 'object' && val !== null && !Array.isArray(val);
    },
    combineDefaults: function (target) {
      target = target || {};
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        if (source) {
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key) && !Object.prototype.hasOwnProperty.call(target, key)) {
              target[key] = source[key];
            }
          }
        }
      }
      return target;
    },
    mergeProperties: function (target) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource !== undefined && nextSource !== null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    }
  };

  /**
   * Universal DOM Helper (replaces jQuery functions used in original)
   * This is a simplified version just for the required functionalities.
   */
  var domHelper = {
    create: function (tagName, attributes, children) {
      var element = document.createElement(tagName);
      for (var attr in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, attr)) {
          element.setAttribute(attr, attributes[attr]);
        }
      }
      if (children) {
        if (Array.isArray(children)) {
          children.forEach(function (child) {
            if (typeof child === 'string') {
              element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
              element.appendChild(child);
            }
          });
        } else if (typeof children === 'string') {
          element.appendChild(document.createTextNode(children));
        } else if (children instanceof Node) {
          element.appendChild(children);
        }
      }
      return element;
    },
    select: function (selector, parent) {
      return (parent || document).querySelector(selector);
    },
    selectAll: function (selector, parent) {
      return Array.from((parent || document).querySelectorAll(selector));
    },
    assignText: function (element, text) {
      if (element) {
        element.textContent = text;
      }
    },
    appendChildren: function (parent, children) {
      if (!parent) return;
      if (!Array.isArray(children)) {
        children = [children];
      }
      children.forEach(function (child) {
        if (typeof child === 'string') {
          parent.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
          parent.appendChild(child);
        }
      });
    },
    hasCls: function (element, className) {
      return element && element.classList.contains(className);
    },
    addCls: function (element, className) {
      if (element) {
        element.classList.add(className);
      }
    },
    removeCls: function (element, className) {
      if (element) {
        element.classList.remove(className);
      }
    },
    setAttr: function (element, name, value) {
      if (element) {
        element.setAttribute(name, value);
      }
    },
    getAttr: function (element, name) {
      return element ? element.getAttribute(name) : null;
    },
    setInlineStyle: function (element, property, value) {
      if (element) {
        element.style[property] = value;
      }
    },
    hideElement: function (element) {
      domHelper.setInlineStyle(element, 'display', 'none');
    },
    showElement: function (element) {
      domHelper.setInlineStyle(element, 'display', ''); // Resets to default display
    },
    getDataset: function (element, key) {
      return element ? element.dataset[key] : undefined;
    },
    setDataset: function (element, key, value) {
      if (element) {
        element.dataset[key] = value;
      }
    },
    onEvent: function (element, eventName, handler, useCapture) {
      if (element) {
        element.addEventListener(eventName, handler, useCapture);
      }
    },
    offEvent: function (element, eventName, handler, useCapture) {
      if (element) {
        element.removeEventListener(eventName, handler, useCapture);
      }
    },
    delegateEvent: function (parent, eventName, selector, handler) {
      var delegatedHandler = function (event) {
        var target = event.target;
        // Traverse up from the target to see if it matches the selector
        while (target && target !== parent) {
          if (target.matches(selector)) {
            // Call the handler with the matching element as `this`
            handler.call(target, event);
            return;
          }
          target = target.parentElement;
        }
      };
      domHelper.onEvent(parent, eventName, delegatedHandler);
      return delegatedHandler; // Return the actual handler to allow removal later
    }
  };

  /**
   * Empty object for event contexts
   * @type {{}}
   */
  var EMPTY_SCOPE_OBJECT = {};

  /**
   * Message relay system for eventing
   */
  var SignalConduit = function () {
    // Using a Map for event names, and Set for unique listener objects
    var listenerRegistry = new Map();

    /**
     * Adds an observer for a specific signal
     * @param {String} signalName
     * @param {Function} responseCallback
     * @param {Object} [responseContext]
     */
    this.addObserver = function (signalName, responseCallback, responseContext) {
      if (typeof responseCallback !== 'function') {
        throw new Error('Response callback must be a function.');
      }
      if (!listenerRegistry.has(signalName)) {
        listenerRegistry.set(signalName, new Set());
      }
      listenerRegistry.get(signalName).add({
        cb: responseCallback,
        ctx: responseContext || EMPTY_SCOPE_OBJECT
      });
    };

    /**
     * Removes an/all observer(s) for a signal
     * @param {String} [signalName]
     * @param {Function} [responseCallback]
     * @param {Object} [responseContext]
     */
    this.removeObserver = function (signalName, responseCallback, responseContext) {
      if (arguments.length === 0) { // Clear all
        listenerRegistry.clear();
        return;
      }
      if (!listenerRegistry.has(signalName)) {
        return;
      }

      if (arguments.length === 1) { // Clear all for a specific signal
        listenerRegistry.delete(signalName);
        return;
      }

      // Remove specific callback/context pair
      var observers = listenerRegistry.get(signalName);
      responseContext = responseContext || EMPTY_SCOPE_OBJECT;
      var toRemove = [];
      observers.forEach(function (observer) {
        if (observer.cb === responseCallback && observer.ctx === responseContext) {
          toRemove.push(observer);
        }
      });
      toRemove.forEach(function (observer) {
        observers.delete(observer);
      });

      if (observers.size === 0) {
        listenerRegistry.delete(signalName);
      }
    };

    /**
     * Dispatches a signal
     * @param {String} signalName
     * @param {Object} payloadInformation
     */
    this.dispatchSignal = function (signalName, payloadInformation) {
      if (!listenerRegistry.has(signalName)) {
        return;
      }

      var currentObservers = Array.from(listenerRegistry.get(signalName)); // Clone to prevent issues if observers modify the set during iteration

      var eventMetadata = {
        __meta__: {
          name: signalName,
          subscribers: currentObservers.length
        }
      };
      var finalPayload = utilityKit.mergeProperties({}, eventMetadata, payloadInformation);

      currentObservers.forEach(function (observer) {
        observer.cb.call(observer.ctx, finalPayload);
      });
    };
  };

  /**
   * Utility for toggling two classes
   * @param {HTMLElement} element
   * @param {String} firstClass
   * @param {String} secondClass
   */
  function alternateClasses(element, firstClass, secondClass) {
    if (domHelper.hasCls(element, firstClass)) {
      domHelper.removeCls(element, firstClass);
      domHelper.addCls(element, secondClass);
    } else if (domHelper.hasCls(element, secondClass)) {
      domHelper.removeCls(element, secondClass);
      domHelper.addCls(element, firstClass);
    } else {
      domHelper.addCls(element, firstClass);
    }
  }

  /**
   * Standard tree configuration
   */
  var STANDARD_NAV_SETTINGS = {
    visualGlyphs: {
      expanded: 'icon-chevron-down',
      collapsed: 'icon-chevron-right',
      leaf: 'icon-file',
      positive: 'icon-unlock',
      negative: 'icon-lock'
    },
    arrayValuesInPath: true
  };

  /**
   * Core logic for the hierarchical navigator
   */
  var navigationEngineSchema = {
    // _hostElement: null,
    // _storedData: {},
    // _eventChannel: null,
    // _currentConfiguration: null,
    // _iconSet: null,
    // _eventHandlers: [] // To store references for removal

    /**
     * Constructs the visual structure from hierarchical data
     * @param {Object} inputData
     * @param {HTMLElement} parentElement
     * @returns {HTMLElement} The created UL element
     */
    constructVisualStructure: function (inputData, parentElement) {
      var unorderedList = domHelper.create('ul');
      domHelper.appendChildren(parentElement, unorderedList);

      var engineSelf = this;
      Object.keys(inputData).forEach(function (itemKey) {
        var itemValue = inputData[itemKey];

        var listItem = domHelper.create('li', {
          'data-designation': itemKey,
          'data-status': 'folded' // 'collapsed' renamed to 'folded'
        });

        var firstIcon = domHelper.create('i');
        var anchorTag = domHelper.create('a');
        var secondIcon = domHelper.create('i');

        domHelper.appendChildren(listItem, [firstIcon, anchorTag, secondIcon]);
        domHelper.appendChildren(unorderedList, listItem);

        /*
         * Path logic for array values
         */
        if (utilityKit.isArr(inputData) && engineSelf._currentConfiguration.arrayValuesInPath) {
          if (!utilityKit.isObj(itemValue) && !utilityKit.isArr(itemValue)) {
            domHelper.setAttr(listItem, 'data-designation', itemValue);
          }
        }

        domHelper.addCls(secondIcon, engineSelf._iconSet.negative);

        if (utilityKit.isObj(itemValue) || utilityKit.isArr(itemValue)) { // branch
          domHelper.addCls(listItem, 'branch-node'); // 'branch' renamed
          domHelper.assignText(anchorTag, itemKey);
          domHelper.addCls(firstIcon, engineSelf._iconSet.collapsed);
          engineSelf.constructVisualStructure(itemValue, listItem);
        } else { // leaf
          domHelper.addCls(listItem, 'leaf-node'); // 'leaf' renamed
          var labelSpan = domHelper.create('span', {
            'class': 'label label-inverse'
          }, itemKey);
          domHelper.appendChildren(anchorTag, [labelSpan, document.createTextNode(itemValue)]); // Ensure itemValue is treated as text node
          domHelper.addCls(firstIcon, engineSelf._iconSet.leaf);
        }

        var childUl = domHelper.select('ul', listItem);
        if (childUl) {
          domHelper.hideElement(childUl);
        }
      });
      return unorderedList;
    },

    /**
     * Emits a path selection event
     * @param {HTMLElement} selectedItem
     */
    emitPathSelection: function (selectedItem) {
      var pathComponents = [];
      var currentElement = selectedItem;
      while (currentElement && domHelper.getAttr(currentElement, 'data-designation')) {
        pathComponents.push(domHelper.getAttr(currentElement, 'data-designation'));
        currentElement = currentElement.parentElement;
        if (currentElement && domHelper.hasCls(currentElement, 'hierarchical-nav')) { // Stop at root element
          break;
        }
      }
      var completeDesignation = pathComponents.reverse().join('/');
      this._eventChannel.dispatchSignal('itemSelected', { // 'selected' renamed to 'itemSelected'
        path: completeDesignation,
        element: selectedItem // 'target' renamed to 'element'
      });
    },

    /**
     * Adjusts the visibility state of a list item
     * @param {HTMLElement} listItem
     */
    adjustVisibilityState: function (listItem) {
      var currentDisplayState = domHelper.getAttr(listItem, 'data-status'),
        signalArguments = {
          element: listItem
        };
      var childUl = domHelper.select('ul', listItem);
      var iconForExpansion = domHelper.select('.' + this._iconSet.expanded + ', .' + this._iconSet.collapsed, listItem); // Select either icon

      if (currentDisplayState === 'expanded') {
        domHelper.hideElement(childUl);
        if (iconForExpansion) {
          domHelper.removeCls(iconForExpansion, this._iconSet.expanded);
          domHelper.addCls(iconForExpansion, this._iconSet.collapsed);
        }
        domHelper.setAttr(listItem, 'data-status', 'folded');
        this._eventChannel.dispatchSignal('nodeFolded', signalArguments); // 'collapsed' renamed to 'nodeFolded'
      } else {
        domHelper.showElement(childUl);
        if (iconForExpansion) {
          domHelper.removeCls(iconForExpansion, this._iconSet.collapsed);
          domHelper.addCls(iconForExpansion, this._iconSet.expanded);
        }
        domHelper.setAttr(listItem, 'data-status', 'expanded');
        this._eventChannel.dispatchSignal('nodeExpanded', signalArguments); // 'expanded' renamed to 'nodeExpanded'
      }
    },

    /**
     * Renders data into the navigator
     * @param {Object|String} dataPayload
     * @returns {*}
     */
    renderContent: function (dataPayload) {
      if (this._hostElement) {
        // Clear previous content and event listeners
        this.decommission();
      }

      this._hostElement = domHelper.select(this._currentConfiguration.containerIdentifier);
      if (!this._hostElement) {
        throw new Error('Container element not found for selector: ' + this._currentConfiguration.containerIdentifier);
      }
      domHelper.addCls(this._hostElement, 'hierarchical-nav'); // 'tbtree' renamed

      if (typeof dataPayload === 'string') {
        dataPayload = JSON.parse(dataPayload);
      }
      this._storedData = dataPayload;

      this.constructVisualStructure(this._storedData, this._hostElement);

      var engineSelf = this;

      // Event delegation for single clicks on list items
      var clickHandler = domHelper.delegateEvent(this._hostElement, 'click', 'li', function (event) {
        var currentListItem = this; // 'this' refers to the matched 'li' element
        setTimeout(function () {
          var doubleClickCount = parseInt(domHelper.getDataset(currentListItem, 'doubleClick') || 0, 10);
          if (doubleClickCount > 0) {
            domHelper.setDataset(currentListItem, 'doubleClick', doubleClickCount - 1);
            return;
          }
          domHelper.selectAll('li', engineSelf._hostElement).forEach(function (li) {
            domHelper.removeCls(li, 'highlighted-node'); // 'highlighted' renamed
          });
          domHelper.addCls(currentListItem, 'highlighted-node');
          engineSelf.emitPathSelection(currentListItem);
          engineSelf.adjustVisibilityState(currentListItem);
        }, 0);
        event.stopPropagation(); // Prevent bubbling up to other elements that might have click handlers
        event.preventDefault();
      });
      this._eventHandlers.push({ eventType: 'click', handler: clickHandler });

      // Event delegation for double clicks on list items
      var doubleClickHandler = domHelper.delegateEvent(this._hostElement, 'dblclick', 'li', function (event) {
        var currentListItem = this;
        domHelper.setDataset(currentListItem, 'doubleClick', 1);
        engineSelf.emitPathSelection(currentListItem); // Original also triggers path on dblclick
        event.stopPropagation();
        event.preventDefault();
      });
      this._eventHandlers.push({ eventType: 'dblclick', handler: doubleClickHandler });


      var positiveIndicator = this._iconSet.positive,
        negativeIndicator = this._iconSet.negative;

      // Selector for state-toggling icons
      var statusIconSelector = 'i.' + positiveIndicator + ', i.' + negativeIndicator;

      // Event delegation for state icons
      var iconClickHandler = domHelper.delegateEvent(this._hostElement, 'click', statusIconSelector, function (event) {
        var iconElement = this;
        alternateClasses(iconElement, positiveIndicator, negativeIndicator);
        event.stopPropagation();
        event.preventDefault();
      });
      this._eventHandlers.push({ eventType: 'click', handler: iconClickHandler });

      this._eventChannel.dispatchSignal('contentRendered'); // 'loaded' renamed to 'contentRendered'

      return this;
    },

    /**
     * Sifts entries in the navigator (NOT IMPLEMENTED)
     */
    siftEntries: function (/*queryCondition*/) {
      throw new Error('`siftEntries` is not yet implemented.');
    },

    /**
     * Adds a callback subscription to a navigator event
     * @param {String} signalName
     * @param {Function} responseCallback
     * @param {Object} [responseContext]
     * @returns {*}
     */
    listenFor: function (signalName, responseCallback, responseContext) {
      this._eventChannel.addObserver(signalName, responseCallback, responseContext);
      return this;
    },

    /**
     * Removes a/all callback subscription(s) from a navigator event
     * @param {String} [signalName]
     * @param {Function} [responseCallback]
     * @param {Object} [responseContext]
     * @returns {*}
     */
    stopListening: function (signalName, responseCallback, responseContext) {
      this._eventChannel.removeObserver(signalName, responseCallback, responseContext);
      return this;
    },

    /**
     * Cleans up the navigator instance
     */
    decommission: function () {
      if (this._hostElement) {
        // Explicitly remove delegated event listeners
        this._eventHandlers.forEach(function(handlerInfo) {
          domHelper.offEvent(this._hostElement, handlerInfo.eventType, handlerInfo.handler);
        }, this); // Pass 'this' as context for forEach

        // Clear DOM content and remove class
        this._hostElement.innerHTML = '';
        domHelper.removeCls(this._hostElement, 'hierarchical-nav');
        this._hostElement = null; // Dereference
      }
      this._eventChannel = new SignalConduit(); // Reset event bus
      this._eventHandlers = []; // Clear stored handlers
    }
  };

  /**
   * Creates a hierarchical navigator instance
   *
   * @param {Object} configurationOptions
   * @returns {Object}
   */
  return function (configurationOptions) {
    if (typeof configurationOptions === 'string') {
      configurationOptions = {
        containerIdentifier: configurationOptions
      };
    }
    if (!Object.prototype.hasOwnProperty.call(configurationOptions, 'containerIdentifier')) {
      throw new Error('A container identifier must be specified.');
    }

    var navigatorInstance = Object.create(navigationEngineSchema);
    navigatorInstance._hostElement = null;
    navigatorInstance._eventChannel = new SignalConduit();
    navigatorInstance._storedData = {};
    navigatorInstance._currentConfiguration = utilityKit.combineDefaults({}, configurationOptions, STANDARD_NAV_SETTINGS);
    navigatorInstance._iconSet = navigatorInstance._currentConfiguration.visualGlyphs;
    navigatorInstance._eventHandlers = []; // Store references for removing event listeners

    return navigatorInstance;
  };

}));