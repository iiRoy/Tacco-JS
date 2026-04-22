/*global require, define, module*/
/*jshint forin:false*/
(function (rootScope, moduleFactory) {
  'use strict';

  // Asynchronous Module Definition (AMD) via RequireJS
  if (typeof define === 'function' && define.amd) {
    return define(['jquery', 'underscore'], function (jq, util) {
      return moduleFactory(jq, util, rootScope);
    });
  }

  // Browser global exposure
  rootScope.hierarchicalView = moduleFactory(rootScope.$, rootScope._, rootScope);

}(this, function (jq, util, rootScope, voidValue) {
  'use strict';

  // A default context object for event dispatch, preventing null or undefined references.
  var DEFAULT_EVENT_CONTEXT = {};

  /**
   * Core logic for a simple, internal event dispatch system.
   * Provides methods for event subscription, unsubscription, and publication.
   * @type {{register: Function, unregister: Function, dispatch: Function}}
   */
  var eventDispatcherPrototype = {
    // Internal storage for all active event subscriptions.
    // _listeners: {},

    /**
     * Attaches a callback function to a specific event identifier.
     * @param {String} eventIdentifier - The unique name of the event to listen for.
     * @param {Function} handlerFunction - The function to execute when the event is dispatched.
     * @param {Object} [boundContext] - The 'this' context for the handlerFunction.
     */
    register: function (eventIdentifier, handlerFunction, boundContext) {
      if (!this._listeners) { // Initialize if not present (Type III: add guard)
        this._listeners = {};
      }
      if (!util.has(this._listeners, eventIdentifier)) {
        this._listeners[eventIdentifier] = [];
      }
      if (typeof handlerFunction !== 'function') {
        // Type III: More specific error message and validation
        throw new TypeError('Event handler must be a function.');
      }
      this._listeners[eventIdentifier].push({
        cb: handlerFunction,
        ctx: boundContext || DEFAULT_EVENT_CONTEXT
      });
      // Type III: return this for chaining
      return this;
    },

    /**
     * Removes one or all subscriptions for an event.
     * @param {String} [eventIdentifier] - The event name. If omitted, all subscriptions are cleared.
     * @param {Function} [handlerFunction] - The specific function to remove.
     * @param {Object} [boundContext] - The context associated with the handler to remove.
     */
    unregister: function (eventIdentifier, handlerFunction, boundContext) {
      if (!this._listeners) return this; // Type III: early exit if no listeners

      var argCount = arguments.length;
      if (argCount === 0) {
        this._listeners = {}; // Clear all subscriptions
        return this;
      }
      if (!util.has(this._listeners, eventIdentifier)) {
        return this; // No listeners for this event, nothing to do.
      }
      if (argCount === 1) {
        this._listeners[eventIdentifier] = []; // Clear all for this event
        return this;
      }

      var effectiveContext = boundContext || DEFAULT_EVENT_CONTEXT;
      // Type III: change `_.filter` to native `Array.prototype.filter`
      this._listeners[eventIdentifier] = this._listeners[eventIdentifier].filter(function (subscriptionItem) {
        return !(subscriptionItem.cb === handlerFunction && subscriptionItem.ctx === effectiveContext);
      });
      return this;
    },

    /**
     * Dispatches an event, notifying all registered listeners.
     * @param {String} eventIdentifier - The name of the event to dispatch.
     * @param {Object} payloadData - Data to pass to the event handlers.
     */
    dispatch: function (eventIdentifier, payloadData) {
      if (!this._listeners || !util.has(this._listeners, eventIdentifier)) {
        return this; // No listeners for this event.
      }

      // Type III: Simplify metadata or remove if not critical. Here, removing it.
      // var eventMetadata = {
      //   __eventDetails__: {
      //     eventName: eventIdentifier,
      //     listenerCount: this._listeners[eventIdentifier].length
      //   }
      // };
      // var completePayload = util.extend(eventMetadata, payloadData); // Merging payload with metadata

      var completePayload = payloadData || {}; // Type III: Ensure payloadData is an object

      // Type III: Change `forEach` to a traditional `for` loop for minor performance/style variation.
      var currentListeners = this._listeners[eventIdentifier];
      for (var i = 0; i < currentListeners.length; i++) {
        var sub = currentListeners[i];
        sub.cb.call(sub.ctx, completePayload);
      }
      return this;
    }
  };

  /**
   * Constructor for creating a new event communication channel.
   * @returns {Object} An event dispatcher instance.
   * @constructor
   */
  function EventCommChannel() {
    // Type III: Using `Object.create` directly on the prototype for instances.
    var newChannel = Object.create(eventDispatcherPrototype);
    newChannel._listeners = {}; // Each instance needs its own listener store.
    return newChannel;
  }

  /**
   * Helper function to flip between two CSS classes on a jQuery object.
   * @param {jQuery} targetElement - The jQuery object to modify.
   * @param {String} classA - First class name.
   * @param {String} classB - Second class name.
   */
  function swapClasses(targetElement, classA, classB) {
    targetElement.each(function () {
      var currentElement = jq(this); // Type III: Renamed
      if (currentElement.hasClass(classA)) {
        currentElement.removeClass(classA).addClass(classB);
      } else if (currentElement.hasClass(classB)) {
        currentElement.removeClass(classB).addClass(classA);
      } else {
        currentElement.addClass(classA); // Default: add classA if neither is present.
      }
    });
  }

  /**
   * Standard configuration parameters for the hierarchy display component.
   * @type {{visuals: {expandedIcon: string, collapsedIcon: string, leafIcon: string, positiveState: string, negativeState: string}, processArrayKeys: boolean}}
   */
  var STANDARD_HIERARCHY_SETTINGS = {
    visuals: {
      expandedIcon: 'fa-chevron-down', // Type II: Updated icon names (Font Awesome example)
      collapsedIcon: 'fa-chevron-right',
      leafIcon: 'fa-file-o',
      positiveState: 'fa-unlock',
      negativeState: 'fa-lock'
    },
    processArrayKeys: true // Type II: Renamed property
  };

  /**
   * Prototype object defining the core functionalities of the hierarchical tree renderer.
   * @type {{_renderStructure: Function, _dispatchPathEvent: Function, _manageExpansionState: Function, loadData: Function, search: Function, onEvent: Function, offEvent: Function, clear: Function}}
   */
  var hierarchyRendererLogic = {
    // _targetContainer: null, // jQuery object for the root element
    // _sourceData: {},       // Raw data used to build the tree
    // _eventBus: new EventCommChannel(), // Internal event communication
    // _displayConfig: {},    // Merged configuration settings
    // _iconClasses: {},      // Shortcut to icon class names

    /**
     * Recursively constructs the DOM representation of the hierarchical data.
     * @param {Object} dataNode - The current segment of the JSON data.
     * @param {jQuery} parentElement - The jQuery object of the parent DOM element.
     * @private
     */
    _renderStructure: function (dataNode, parentElement) {
      if (!dataNode || typeof dataNode !== 'object') { // Type III: guard clause
        console.warn("Invalid dataNode provided to _renderStructure:", dataNode);
        return;
      }

      var newUnorderedList = jq('<ul></ul>').appendTo(parentElement);
      var selfRef = this; // Type II: Renamed `self` to `selfRef`

      // Type III: Changed `_.each` to `Object.keys().forEach` for native JS flavor.
      Object.keys(dataNode).forEach(function (nodeKey) {
        var nodeValue = dataNode[nodeKey];
        var listItem = jq('<li></li>')
          .append('<i></i>') // Icon for expand/collapse/leaf
          .append('<a></a>') // Text/label for the node
          .append('<i></i>') // Icon for state (e.g., lock/unlock)
          .attr('data-node-key', nodeKey) // Type II: Renamed attribute
          .attr('data-display-state', 'collapsed') // Type II: Renamed attribute
          .appendTo(newUnorderedList);

        /*
         * Configuration setting `processArrayKeys` determines how array values
         * are represented in the data-node-key attribute. If true, non-object/array
         * values from an array are used directly as the key. Otherwise, the numeric
         * index (key) is always used.
         */
        if (util.isArray(dataNode) && selfRef._displayConfig.processArrayKeys) {
          if (!util.isObject(nodeValue) && !util.isArray(nodeValue)) {
            listItem.attr('data-node-key', nodeValue); // Use the value itself as the key
          }
        }

        // Apply the negative state icon by default
        listItem.find('i').last().addClass(selfRef._iconClasses.negativeState);

        if (util.isObject(nodeValue)) {
          // This is a branch node (object or array)
          listItem.addClass('branch-node'); // Type II: Renamed class
          listItem.find('a').text(nodeKey);
          listItem.find('i').first().addClass(selfRef._iconClasses.collapsedIcon);
          selfRef._renderStructure(nodeValue, listItem); // Recurse for children
        } else {
          // This is a leaf node (primitive value)
          listItem.addClass('leaf-node'); // Type II: Renamed class
          var labelSpan = jq('<span class="node-label">' + nodeKey + '</span>'); // Type II: Renamed class
          listItem.find('a')
            .append(labelSpan)
            .append('<span class="node-value">' + nodeValue + '</span>'); // Type III: Added span for value
          listItem.find('i').first().addClass(selfRef._iconClasses.leafIcon);
        }

        // Hide children initially
        listItem.find('> ul').hide();
      });
    },

    /**
     * Generates and dispatches an event containing the full path of a clicked list item.
     * @param {jQuery} clickedItem - The jQuery object of the list item that was clicked.
     * @private
     */
    _dispatchPathEvent: function (clickedItem) {
      var pathComponents = [];
      pathComponents.push(clickedItem.attr('data-node-key')); // Get current item's key

      // Type III: Changed `each` to `map` and `reverse` for a more functional approach
      var parentComponents = clickedItem.parents('li').map(function () {
        return jq(this).attr('data-node-key');
      }).get(); // `.get()` converts jQuery object to native array
      
      pathComponents = pathComponents.concat(parentComponents.reverse());
      
      var constructedPath = pathComponents.join('/'); // Type II: Renamed variable

      this._eventBus.dispatch('nodeSelected', { // Type II: Renamed event
        path: constructedPath,
        targetElement: clickedItem[0] // Type II: Renamed property
      });
    },

    /**
     * Toggles the visual expansion state of a list item and dispatches corresponding events.
     * @param {jQuery} targetListItem - The list item to expand or collapse.
     * @private
     */
    _manageExpansionState: function (targetListItem) {
      if (!targetListItem.hasClass('branch-node')) { // Type III: Guard for leaf nodes
        return;
      }
      var currentState = targetListItem.attr('data-display-state');
      var eventPayload = {targetElement: targetListItem[0]}; // Type II: Renamed variable

      // Type III: Using a switch statement instead of if/else if.
      switch (currentState) {
        case 'expanded':
          targetListItem.find('> ul').slideUp('fast'); // Type III: Use slideUp/slideDown for animation
          targetListItem.find('> .' + this._iconClasses.expandedIcon)
            .removeClass(this._iconClasses.expandedIcon)
            .addClass(this._iconClasses.collapsedIcon);
          targetListItem.attr('data-display-state', 'collapsed');
          this._eventBus.dispatch('nodeCollapsed', eventPayload); // Type II: Renamed event
          break;
        case 'collapsed':
          targetListItem.find('> ul').slideDown('fast'); // Type III: Use slideUp/slideDown for animation
          targetListItem.find('> .' + this._iconClasses.collapsedIcon)
            .removeClass(this._iconClasses.collapsedIcon)
            .addClass(this._iconClasses.expandedIcon);
          targetListItem.attr('data-display-state', 'expanded');
          this._eventBus.dispatch('nodeExpanded', eventPayload); // Type II: Renamed event
          break;
        default:
          // Type III: Add a default case, perhaps expanding if state is unknown.
          targetListItem.attr('data-display-state', 'expanded');
          targetListItem.find('> ul').slideDown('fast');
          targetListItem.find('> i').first()
            .removeClass(this._iconClasses.collapsedIcon)
            .addClass(this._iconClasses.expandedIcon);
          this._eventBus.dispatch('nodeExpanded', eventPayload);
          break;
      }
    },

    /**
     * Loads and renders new data into the hierarchical view.
     * @param {Object|String} inputData - The data to display, either an object or a JSON string.
     * @returns {*} The current hierarchyRendererLogic instance for chaining.
     */
    loadData: function (inputData) {
      // Type III: Clear existing content and handlers before loading new data.
      if (this._targetContainer && this._targetContainer.length) {
        this.clear(); // Use the existing clear method
      }

      this._targetContainer = jq(this._displayConfig.targetSelector).addClass('hierarchical-view'); // Type II: Renamed class

      if (typeof inputData === 'string') {
        try {
          inputData = JSON.parse(inputData);
        } catch (e) {
          // Type III: More robust error handling for invalid JSON
          console.error("Failed to parse input data as JSON:", e);
          this._eventBus.dispatch('dataLoadError', {error: e, rawData: inputData});
          return this;
        }
      }
      if (!util.isObject(inputData) || util.isEmpty(inputData)) { // Type III: Validation for empty/invalid data
        console.warn("No valid data provided to loadData. Displaying empty view.");
        this._eventBus.dispatch('dataLoadWarning', {message: "Empty or invalid data", data: inputData});
        return this;
      }
      
      this._sourceData = inputData;
      this._renderStructure(this._sourceData, this._targetContainer);

      var instanceRef = this; // Type II: Renamed `self` to `instanceRef`

      // Type III: Extracted click handler logic into a named function for clarity and reusability.
      function handleNodeClick(e) {
        var clickedLi = jq(this);
        // Type III: Guard against clicks on the icon itself, only process clicks on li.
        // The original code allowed clicks on 'li' and then had separate handler for 'i'.
        // This refactors to avoid double handling by delegating to specific elements.
        if (jq(e.target).is('i')) {
          return true; // Let the icon click handler take over
        }

        // Double-click detection logic (Type III: slight rephrasing, same logic)
        setTimeout(function () {
          var doubleClickIndicator = parseInt(clickedLi.data('double-tap') || 0, 10);
          if (doubleClickIndicator > 0) {
            clickedLi.data('double-tap', doubleClickIndicator - 1);
            return;
          }
          instanceRef._targetContainer.find('li').removeClass('active-node'); // Type II: Renamed class
          clickedLi.addClass('active-node');
          instanceRef._dispatchPathEvent(clickedLi);
          instanceRef._manageExpansionState(clickedLi);
        }, 50); // Type III: slightly increased timeout for better dblclick detection on some systems
        e.stopPropagation(); // Type III: ensure propagation is stopped for li clicks
        return false;
      }

      // Attaching main click handler to list items
      this._targetContainer.on('click', 'li', handleNodeClick);

      // Double-click handler for list items
      this._targetContainer.on('dblclick', 'li', function (e) {
        var dblClickedLi = jq(this);
        dblClickedLi.data('double-tap', 1); // Mark as double-tapped
        instanceRef._dispatchPathEvent(dblClickedLi); // Dispatch event for double-click too
        e.stopPropagation();
        return false;
      });

      var positiveIcon = this._iconClasses.positiveState,
        negativeIcon = this._iconClasses.negativeState;

      // Selector for state icons (e.g., 'i.fa-unlock, i.fa-lock')
      var stateIconSelector = 'i.' + positiveIcon + ', i.' + negativeIcon;

      // Click handler for state icons (lock/unlock)
      this._targetContainer.on('click', stateIconSelector, function (e) {
        var clickedIcon = jq(this);
        swapClasses(clickedIcon, positiveIcon, negativeIcon); // Type II: Renamed helper function
        e.stopPropagation(); // Prevent event from bubbling up to li click handler
        e.preventDefault(); // Prevent default action (if any)
        return false;
      });

      this._eventBus.dispatch('dataLoaded'); // Type II: Renamed event

      return this;
    },

    /**
     * Filters the displayed tree nodes based on a query.
     * NOT YET IMPLEMENTED - returns a warning instead of throwing an error.
     * @param {String} [searchQuery] - The text to filter by.
     */
    search: function (searchQuery) { // Type II: Renamed function and parameter
      // Type III: Instead of throwing, log a warning and return.
      console.warn('`search` functionality is not yet implemented for this component. Query:', searchQuery);
      this._eventBus.dispatch('searchAttempted', {query: searchQuery, status: 'unimplemented'});
      return this;
    },

    /**
     * Subscribes a callback to a specific event within this component.
     * @param {String} eventName - The name of the event to listen for.
     * @param {Function} handler - The callback function.
     * @param {Object} [contextObj] - The `this` context for the handler.
     * @returns {*} The current instance for chaining.
     */
    onEvent: function (eventName, handler, contextObj) { // Type II: Renamed function and parameters
      this._eventBus.register(eventName, handler, contextObj); // Type II: Renamed internal bus method
      return this;
    },

    /**
     * Removes event subscriptions from this component.
     * @param {String} [eventName] - The event name.
     * @param {Function} [handler] - The specific handler.
     * @param {Object} [contextObj] - The context.
     * @returns {*} The current instance for chaining.
     */
    offEvent: function (eventName, handler, contextObj) { // Type II: Renamed function and parameters
      this._eventBus.unregister(eventName, handler, contextObj); // Type II: Renamed internal bus method
      return this;
    },
    
    /**
     * Cleans up the tree component: removes event handlers, clears content, and resets classes.
     */
    clear: function () { // Type II: Renamed destroy to clear
      if (this._targetContainer) {
        this._targetContainer.off(); // Remove all event handlers
        this._targetContainer.removeClass('hierarchical-view'); // Type II: Renamed class
        this._targetContainer.empty(); // Clear HTML content
      }
      this._eventBus.dispatch('componentCleared'); // Type III: Dispatch a cleanup event
      this._targetContainer = null; // Type III: Dereference to aid garbage collection
      this._sourceData = {};
      return this;
    }
  };

  /**
   * Factory function to create and initialize a new hierarchical view instance.
   *
   * @param {Object|String} configurationOptions - Configuration object or a CSS selector string.
   * @returns {Object} A new hierarchical view component instance.
   */
  return function (configurationOptions) {
    // Type III: More flexible options handling and validation
    var parsedOptions = {};
    if (typeof configurationOptions === 'string') {
      parsedOptions.targetSelector = configurationOptions;
    } else if (util.isObject(configurationOptions)) {
      parsedOptions = configurationOptions;
    } else {
      throw new TypeError('Configuration must be a string selector or an options object.');
    }

    if (!util.has(parsedOptions, 'targetSelector')) { // Type II: Renamed property
      // Type III: Provide a default selector or throw more specific error.
      // Here, throwing an error for explicit requirement.
      throw new Error('A CSS selector for the target container must be specified in the configuration.');
    }

    var hierarchyManager = Object.create(hierarchyRendererLogic); // Type II: Renamed tree to hierarchyManager
    hierarchyManager._targetContainer = null; // Initialize to null
    hierarchyManager._eventBus = new EventCommChannel(); // Type II: Renamed Bus to EventCommChannel
    hierarchyManager._sourceData = {};
    // Type II: Renamed DEFAULT_TREE_CONFIG to STANDARD_HIERARCHY_SETTINGS
    hierarchyManager._displayConfig = util.defaults({}, parsedOptions, STANDARD_HIERARCHY_SETTINGS);
    // Type II: Renamed _icons to _iconClasses and icons to visuals
    hierarchyManager._iconClasses = hierarchyManager._displayConfig.visuals;

    // Type III: Add a new, non-essential property for demonstration.
    hierarchyManager._creationTimestamp = new Date().toISOString();

    return hierarchyManager;
  };

}));