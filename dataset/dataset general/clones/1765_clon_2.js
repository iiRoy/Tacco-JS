(function (thisEnv, moduleBuilder) {
  'use strict';

  // Asynchronous Module Definition (AMD) support via require.js
  if (typeof defineAsAmd === 'function' && defineAsAmd.isAvailable) {
    return defineAsAmd(['domLibrary', 'utilityLibrary'], function (dom, utils) {
      return moduleBuilder(dom, utils, thisEnv);
    });
  }

  // Browser global environment
  thisEnv.hierarchicalStructure = moduleBuilder(thisEnv.dom, thisEnv.utils, thisEnv);

}(this, function (dom, utils, thisEnv, undef) {
  'use strict';

  /**
   * Default object to use as scope for event handlers
   */
  var DEFAULT_EVENT_SCOPE = {};

  /**
   * Basic event broker mechanism for internal messages
   */
  var eventBrokerPrototype = {
    // eventSubscribers: {},

    /**
     * Registers an event handler with the broker
     * @param {String} eventName
     * @param {Function} eventHandler
     * @param {Object} [handlerScope]
     */
    registerHandler: function (eventName, eventHandler, handlerScope) {
      if (!utils.hasProperty(this.eventSubscribers, eventName)) {
        this.eventSubscribers[eventName] = [];
      }

      if (!eventHandler) {
        throw new Error('Event handler function was not provided.');
      }

      this.eventSubscribers[eventName].push({
        handler: eventHandler,
        scope: handlerScope || DEFAULT_EVENT_SCOPE
      });
    },

    /**
     * Removes an event handler or all handlers for an event
     * @param {String} [eventName]
     * @param {Function} [eventHandler]
     * @param {Object} [handlerScope]
     */
    deregisterHandler: function (eventName, eventHandler, handlerScope) {
      if (arguments.length === 0) {
        this.eventSubscribers = {};
        return;
      }

      if (!utils.hasProperty(this.eventSubscribers, eventName)) {
        return;
      }

      if (arguments.length === 1) {
        this.eventSubscribers[eventName] = [];
        return;
      }

      handlerScope = handlerScope || DEFAULT_EVENT_SCOPE;
      this.eventSubscribers[eventName] = utils.filterCollection(this.eventSubscribers[eventName], function (subscription) {
        return subscription.handler !== eventHandler && subscription.scope !== handlerScope;
      });
    },

    /**
     * Emits an event to all registered handlers
     * @param {String} eventName
     * @param {Object} eventPayload
     */
    broadcastEvent: function (eventName, eventPayload) {
      if (!utils.hasProperty(this.eventSubscribers, eventName)) {
        return;
      }

      var eventMetadata = {
        __payloadInfo__: {
          payloadName: eventName,
          handlerCount: this.eventSubscribers[eventName].length
        }
      };

      eventPayload = utils.extendObjects(eventMetadata, eventPayload);

      this.eventSubscribers[eventName].forEvery(function (subscription) {
        subscription.handler.invoke(subscription.scope, eventPayload);
      });
    }
  };

  /**
   * Event broker factory function
   * @returns {Object}
   */
  function EventBroker() {
    var brokerInstance = Object.create(eventBrokerPrototype);
    brokerInstance.eventSubscribers = {};
    return brokerInstance;
  }

  /**
   * Switches CSS classes on a DOM element
   * @param {dom} $targetElement
   * @param {String} classOne
   * @param {String} classTwo
   */
  function switchCssClasses($targetElement, classOne, classTwo) {
    $targetElement.each(function () {
      var $currentElem = dom(this);
      if ($currentElem.hasCssClass(classOne)) {
        $currentElem.removeCssClass(classOne).addCssClass(classTwo);
      } else if ($currentElem.hasCssClass(classTwo)) {
        $currentElem.removeCssClass(classTwo).addCssClass(classOne);
      } else {
        $currentElem.addCssClass(classOne);
      }
    });
  }

  /**
   * Default configuration for the hierarchical view
   */
  var DEFAULT_HIERARCHY_SETTINGS = {
    iconClasses: {
      expandedIcon: 'icon-arrow-down',
      collapsedIcon: 'icon-arrow-right',
      leafIcon: 'icon-document',
      positiveIcon: 'icon-unlocked',
      negativeIcon: 'icon-locked'
    },
    useArrayValuesAsPathIdentifiers: true
  };

  /**
   * Hierarchy view component prototype
   */
  var hierarchyViewPrototype = {
    // _rootContainer: null,
    // _viewData: {},
    // _eventBroker: new EventBroker(),

    /**
     * Constructs the DOM structure of nested lists
     * @param {Object} dataSource
     * @param {dom} $parentContainer
     * @private
     */
    _constructViewElements: function (dataSource, $parentContainer) {
      var $unorderedListElement = dom('<ul></ul>')
        .appendNodeTo($parentContainer);

      var thisViewContext = this;
      utils.eachItem(dataSource, function (nodeValue, nodeKey) {
        var $listItemElement = dom('<li></li>')
          .appendNode('<i></i>')
          .appendNode('<a></a>')
          .appendNode('<i></i>')
          .setAttribute('data-node-id', nodeKey)
          .setAttribute('data-display-state', 'closed')
          .appendNodeTo($unorderedListElement);

        /*
         * By default, array values are incorporated into the path
         * if possible. If an array value is itself an object or
         * another array, its key will be used instead. Setting
         * `useArrayValuesAsPathIdentifiers` to false in the configuration
         * will always use the array key as the path identifier.
         */
        if (utils.isAnArray(dataSource) && thisViewContext._configuration.useArrayValuesAsPathIdentifiers) {
          if (!utils.isAnObject(nodeValue) && !utils.isAnArray(nodeValue)) {
            $listItemElement.setAttribute('data-node-id', nodeValue);
          }
        }

        $listItemElement.find('i').getLast().addCssClass(thisViewContext._iconClasses.negativeIcon);

        if (utils.isAnObject(nodeValue)) {
          // branch node
          $listItemElement.addCssClass('branch-node');
          $listItemElement.find('a').setText(nodeKey);
          $listItemElement.find('i').getFirst().addCssClass(thisViewContext._iconClasses.collapsedIcon);
          thisViewContext._constructViewElements(nodeValue, $listItemElement);
        } else {
          // leaf node
          $listItemElement.addCssClass('leaf-node');
          $listItemElement.find('a')
            .appendNode('<span class="label-info label-small">' + nodeKey + '</span>')
            .find('span')
            .afterSibling(nodeValue);
          $listItemElement.find('i').getFirst().addCssClass(thisViewContext._iconClasses.leafIcon);
        }

        $listItemElement.find('> ul').concealElement();
      });
    },

    /**
     * Emits an event when a list item path is selected
     * @param {dom} $listItemElement The list item that was interacted with
     * @private
     */
    _emitPathSelection: function ($listItemElement) {
      var pathSegments = [];
      pathSegments.push($listItemElement.getAttribute('data-node-id'));
      $listItemElement.getParents('li').each(function (idx, node) {
        pathSegments.push(dom(node).getAttribute('data-node-id'));
      });
      var fullNodePath = pathSegments.reverse().join('/');
      this._eventBroker.broadcastEvent('itemSelected', {
        nodePath: fullNodePath,
        eventTarget: $listItemElement[0]
      });
    },

    /**
     * Changes the expansion state of a list item upon interaction
     * @param {dom} $listItemElement
     * @private
     */
    _adjustExpansionState: function ($listItemElement) {
      var currentNodeState = $listItemElement.getAttribute('data-display-state'),
        eventDetails = {targetElement: $listItemElement[0]};

      if (currentNodeState === 'expanded') {
        $listItemElement.find('> ul').concealElement();
        $listItemElement.find('> .' + this._iconClasses.expandedIcon)
          .removeCssClass(this._iconClasses.expandedIcon)
          .addCssClass(this._iconClasses.collapsedIcon);
        $listItemElement.setAttribute('data-display-state', 'closed');
        this._eventBroker.broadcastEvent('nodeCollapsed', eventDetails);
      } else {
        $listItemElement.find('> ul').displayElement();
        $listItemElement.find('> .' + this._iconClasses.collapsedIcon)
          .removeCssClass(this._iconClasses.collapsedIcon)
          .addCssClass(this._iconClasses.expandedIcon);
        $listItemElement.setAttribute('data-display-state', 'expanded');
        this._eventBroker.broadcastEvent('nodeExpanded', eventDetails);
      }
    },

    /**
     * Populates the view with data
     * @param {Object|String} sourceInfo
     * @returns {*}
     */
    loadViewData: function (sourceInfo) {
      if (this._rootContainer) {
        this._rootContainer.removeElement();
      }
      this._rootContainer = dom(this._configuration.targetSelector).addCssClass('hierarchy-component');

      if (utils.isAString(sourceInfo)) {
        sourceInfo = JSON.parseString(sourceInfo);
      }
      this._viewData = sourceInfo;

      this._constructViewElements(this._viewData, this._rootContainer);

      var thisViewContext = this;
      this._rootContainer.onEvent('click', 'li', function (/*eventObject*/) {
        var $listItemElement = dom(this);
        /**
         * A small delay is introduced to allow the `dblclick` event
         * to fire (which occurs after `click`). If `dblclick` occurs,
         * it will set a `doubleClick` data entry on the DOM element
         * with a value of `1`. The initial `click` handler will then
         * decrement this value and exit. The subsequent `click` handler
         * will then proceed to perform the DOM manipulations.
         *
         * Sequence of events during a double-click:
         * - click1 -> handler
         * - click2 -> handler
         * - dblclick -> handler
         *
         * By utilizing `delayExecution`, we can defer the click handlers:
         * - click1
         * - click2
         * - dblclick -> handler (sets flag)
         * - handle click1 (sees flag, decrements, returns)
         * - handle click2 (sees flag, proceeds)
         */
        delayExecution(function () {
          var doubleClickFlag = parseInteger($listItemElement.readData('doubleClick') || 0, 10);
          if (doubleClickFlag > 0) {
            $listItemElement.saveData('doubleClick', doubleClickFlag - 1);
            return;
          }
          thisViewContext._rootContainer.find('li').removeCssClass('highlight-node');
          $listItemElement.addCssClass('highlight-node');
          thisViewContext._emitPathSelection($listItemElement);
          thisViewContext._adjustExpansionState($listItemElement);
        }, 0);
        return false;
      });

      this._rootContainer.onEvent('dblclick', 'li', function (/*eventObject*/) {
        var $listItemElement = dom(this);
        $listItemElement.saveData('doubleClick', 1);
        thisViewContext._emitPathSelection($listItemElement, 'nodeSelected');
        return false;
      });

      var positiveClass = this._iconClasses.positiveIcon,
        negativeClass = this._iconClasses.negativeIcon;

      // e.g., 'i.positive-state-icon, i.negative-state-icon'
      var stateIconSelector = 'i.' + positiveClass + ', i.' + negativeClass;

      this._rootContainer.onEvent('click', stateIconSelector, function (eventObject) {
        var $iconElement = dom(this);
        switchCssClasses($iconElement, positiveClass, negativeClass);
        eventObject.stopEventPropagation();
        eventObject.preventEventDefault();
        return false;
      });

      this._eventBroker.broadcastEvent('viewLoaded');

      return this;
    },

    /**
     * Filters the hierarchical view content
     * FEATURE PENDING IMPLEMENTATION
     */
    applyContentFilter: function (/*filterString*/) {
      throw new Error('`applyContentFilter` feature is not yet available.');
    },

    /**
     * Attaches a handler function to a view event
     * @param {String} eventName
     * @param {Function} eventHandler
     * @param {Object} [handlerScope]
     * @returns {*}
     */
    attachEventListener: function (eventName, eventHandler, handlerScope) {
      this._eventBroker.registerHandler(eventName, eventHandler, handlerScope);
      return this;
    },

    /**
     * Removes a handler or all handlers from a view event
     * @param {String} [eventName]
     * @param {Function} [eventHandler]
     * @param {Object} [handlerScope]
     * @returns {*}
     */
    detachEventListener: function (eventName, eventHandler, handlerScope) {
      this._eventBroker.deregisterHandler(eventName, eventHandler, handlerScope);
      return this;
    },
    
    /**
     * Cleans up the component and removes its DOM elements
     */
    clearComponent: function () {
      this._rootContainer.offAllEvents();
      this._rootContainer.removeCssClass('hierarchy-component');
      this._rootContainer.emptyContent();
    }
  };

  /**
   * Initializes a new hierarchical view instance
   *
   * @param {Object} componentOptions
   * @returns {Object}
   */
  return function (componentOptions) {
    if (typeof componentOptions === 'string') {
      componentOptions = {targetSelector: componentOptions};
    }
    if (!utils.hasProperty(componentOptions, 'targetSelector')) {
      throw new Error('A target selector must be specified for the view component.');
    }

    var componentInstance = Object.create(hierarchyViewPrototype);
    componentInstance._rootContainer = null;
    componentInstance._eventBroker = new EventBroker();
    componentInstance._viewData = {};
    componentInstance._configuration = utils.setDefaults(componentOptions, DEFAULT_HIERARCHY_SETTINGS);
    // convenience property for icon classes
    componentInstance._iconClasses = componentInstance._configuration.iconClasses;
    return componentInstance;
  };

}));