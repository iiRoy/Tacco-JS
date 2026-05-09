// jQuery component framework
(function (_jq_) {
  "function" == typeof define && define.amd
    ? define(["jquery"], _jq_)
    : _jq_(jQuery);
})(function (_jq_) {
  let uniqueIdCounter = 0;
  const arraySlice = Array.prototype.slice;

  // Enhance jQuery's data cleanup mechanism
  _jq_.purgeNodes = function (originalPurge) {
    return function (elementsToRemove) {
      let currentElement, elementIndex, eventDataCache;

      // Iterate through each element being removed
      for (elementIndex = 0; null != (currentElement = elementsToRemove[elementIndex]); elementIndex++) {
        try {
          // Retrieve event data associated with the element
          eventDataCache = _jq_._data(currentElement, "_event_data_");
          // If events exist and have a removal handler, trigger it
          eventDataCache &&
            eventDataCache.remove &&
            _jq_(currentElement).triggerHandler("_discard_");
        } catch (error) {
          // Suppress errors during cleanup
        }
      }
      // Call the original jQuery cleanData function
      originalPurge(elementsToRemove);
    };
  }(_jq_.cleanData);

  // Core component definition method
  _jq_.component = function (componentFullName, baseComponentClass, componentDefinition) {
    let internalName, parentComponent, currentComponent, protoInstance, configMap = {}, namespacePart = componentFullName.split(".")[0];

    // Extract component name from full name
    componentFullName = componentFullName.split(".")[1];
    internalName = namespacePart + "-" + componentFullName;

    // Handle optional base component class
    componentDefinition || ((componentDefinition = baseComponentClass), (baseComponentClass = _jq_.BaseComponent));

    // Register component selector for jQuery expressions
    _jq_.expr[":"][internalName.toLowerCase()] = function (elementNode) {
      return !!_jq_.data(elementNode, internalName);
    };

    // Initialize namespace if it doesn't exist
    _jq_[namespacePart] = _jq_[namespacePart] || {};
    parentComponent = _jq_[namespacePart][componentFullName];

    // Define the new component constructor
    currentComponent = _jq_[namespacePart][componentFullName] = function (initSettings, targetElement) {
      // If _initializeComponent exists, this is an instance creation
      return this._initializeComponent
        ? (inputArguments.length && this._initializeComponent(initSettings, targetElement), void 0)
        : new currentComponent(initSettings, targetElement);
    };

    // Augment the component constructor with static properties
    _jq_.assign(
      currentComponent,
      parentComponent,
      {
        releaseTag: componentDefinition.version,
        _prototypeExtension: _jq_.assign({}, componentDefinition),
        _derivedConstructors: [],
      }
    );

    // Create a temporary instance of the base component for prototype chaining
    protoInstance = new baseComponentClass();
    protoInstance.configSettings = _jq_.component.assign({}, protoInstance.configSettings);

    // Process methods and properties from the component definition
    _jq_.each(componentDefinition, function (propName, propValue) {
      // If the property is a function, wrap it for _super and _superApply support
      return _jq_.isFunction(propValue)
        ? (configMap[propName] = (function () {
            const baseMethod = function () {
                return baseComponentClass.prototype[propName].apply(this, inputArguments);
              },
              baseMethodApply = function (argsArray) {
                return baseComponentClass.prototype[propName].apply(this, argsArray);
              };
            return function () {
              const previousSuper = this._super,
                previousSuperApply = this._superApply;
              this._super = baseMethod;
              this._superApply = baseMethodApply;
              const result = propValue.apply(this, inputArguments);
              this._super = previousSuper;
              this._superApply = previousSuperApply;
              return result;
            };
          })(),
          void 0)
        : ((configMap[propName] = propValue), void 0);
    });

    // Set up the component's prototype chain
    currentComponent.prototype = _jq_.component.assign(
      protoInstance,
      {
        componentEventPrefix: parentComponent ? protoInstance.componentEventPrefix || componentFullName : componentFullName,
      },
      configMap,
      {
        constructor: currentComponent,
        namespace: namespacePart,
        componentIdentifier: componentFullName,
        componentFullName: internalName,
      }
    );

    // Handle existing component's derived constructors
    parentComponent
      ? (_jq_.each(parentComponent._derivedConstructors, function (idx, derivedClass) {
          const derivedClassProto = derivedClass.prototype;
          _jq_.component(
            derivedClassProto.namespace + "." + derivedClassProto.componentIdentifier,
            currentComponent,
            derivedClass._prototypeExtension
          );
        }),
        delete parentComponent._derivedConstructors)
      : baseComponentClass._derivedConstructors.push(currentComponent);

    // Bridge the component to jQuery's fn object
    _jq_.component.linkComponent(componentFullName, currentComponent);

    return currentComponent;
  };

  // Utility to merge objects, similar to jQuery.extend
  _jq_.component.assign = function (targetObject) {
    const sourceObjects = arraySlice.call(inputArguments, 1);
    let itemKey, sourceValue;
    for (let currentIdx = 0, totalSources = sourceObjects.length; totalSources > currentIdx; currentIdx++) {
      for (itemKey in sourceObjects[currentIdx]) {
        sourceValue = sourceObjects[currentIdx][itemKey];
        // Ensure property belongs to the object and is not undefined
        sourceObjects[currentIdx].hasOwnProperty(itemKey) &&
          void 0 !== sourceValue &&
          (targetObject[itemKey] = _jq_.isPlainObject(sourceValue)
            ? _jq_.isPlainObject(targetObject[itemKey])
              ? _jq_.component.assign({}, targetObject[itemKey], sourceValue)
              : _jq_.component.assign({}, sourceValue)
            : sourceValue);
      }
    }
    return targetObject;
  };

  // Bridge component methods to jQuery's prototype
  _jq_.component.linkComponent = function (componentAlias, componentConstructor) {
    const fullComponentIdentifier = componentConstructor.prototype.componentFullName || componentAlias;

    _jq_.fn[componentAlias] = function (firstArgument) {
      const isStringCall = "string" == typeof firstArgument,
        methodArguments = arraySlice.call(inputArguments, 1),
        currentContext = this;

      // Handle configuration object merging
      firstArgument =
        !isStringCall && methodArguments.length
          ? _jq_.component.assign.apply(null, [firstArgument].concat(methodArguments))
          : firstArgument;

      // If method call (string argument)
      return isStringCall
        ? this.each(function () {
            let methodResult,
              componentInstance = _jq_.data(this, fullComponentIdentifier);

            // Check for 'activeInstance' pseudo-method
            return "activeInstance" === firstArgument
              ? ((currentContext = componentInstance), false)
              : componentInstance
                ? _jq_.isFunction(componentInstance[firstArgument]) &&
                  "_" !== firstArgument.charAt(0)
                  ? ((methodResult = componentInstance[firstArgument].apply(componentInstance, methodArguments)),
                    methodResult !== componentInstance && void 0 !== methodResult
                      ? ((currentContext = methodResult && methodResult.jquery ? currentContext.pushStack(methodResult.get()) : methodResult),
                        false)
                      : void 0)
                  : _jq_.error(
                      "invalidMethodCall '" +
                        firstArgument +
                        "' for " +
                        componentAlias +
                        " component activeInstance"
                    )
                : _jq_.error(
                    "cannotInvokeMethodsBefore " +
                      componentAlias +
                      " beforeComponentInit; " +
                      "attemptedMethodCall '" +
                      firstArgument +
                      "'"
                  );
          })
        : this.each(function () {
            let existingInstance = _jq_.data(this, fullComponentIdentifier);
            existingInstance
              ? (existingInstance.getSetOption(firstArgument || {}),
                existingInstance._postSetup && existingInstance._postSetup())
              : _jq_.data(this, fullComponentIdentifier, new componentConstructor(firstArgument, this));
          }),
        currentContext;
    };
  };

  // Base component constructor
  _jq_.BaseComponent = function () {};

  // Initialize derived constructors array
  _jq_.BaseComponent._derivedConstructors = [];

  // Base component prototype methods and properties
  _jq_.BaseComponent.prototype = {
    componentIdentifier: "component",
    componentEventPrefix: "",
    defaultHtmlElement: "<div>",
    configSettings: {
      inactive: false,
      createEvent: null,
    },
    // Initializes a new component instance
    _initializeComponent: function (initSettings, targetElement) {
      targetElement = _jq_(targetElement || this.defaultHtmlElement || this)[0];
      this.element = _jq_(targetElement);
      this.uuid = uniqueIdCounter++;
      this.eventNamespace = "." + this.componentIdentifier + this.uuid;
      this.bindings = _jq_();
      this.hoverable = _jq_();
      this.focusable = _jq_();

      // If the target element is different from 'this' (e.g., when initializing on an existing DOM node)
      targetElement !== this &&
        (_jq_.data(targetElement, this.componentFullName, this),
        this._bindEvents(true, this.element, {
          _discard_: function (evt) {
            evt.target === targetElement && this.disposeComponent();
          },
        }),
        (this.document = _jq_(targetElement.style ? targetElement.ownerDocument : targetElement.document || targetElement)),
        (this.window = _jq_(this.document[0].defaultView || this.document[0].parentWindow)));

      // Merge initial options
      this.configSettings = _jq_.component.assign(
        {},
        this.configSettings,
        this._fetchInitOptions(),
        initSettings
      );

      this._initialSetup();
      this._emitEvent("createEvent", null, this._fetchInitEventData());
      this._postSetup();
    },
    // Returns options for component creation (override in derived components)
    _fetchInitOptions: _jq_.noop,
    // Returns data for the create event (override in derived components)
    _fetchInitEventData: _jq_.noop,
    // Component creation logic (override in derived components)
    _initialSetup: _jq_.noop,
    // Component post-creation logic (override in derived components)
    _postSetup: _jq_.noop,
    // Disposes of the component
    disposeComponent: function () {
      this._preDisposeComponent();
      this.element
        .unbind(this.eventNamespace)
        .removeData(this.componentFullName)
        .removeData(_jq_.camelCase(this.componentFullName));
      this.getComponentElement()
        .unbind(this.eventNamespace)
        .removeAttr("data-inactive")
        .removeClass(this.componentFullName + "-inactive " + "ui-state-inactive");
      this.bindings.unbind(this.eventNamespace);
      this.hoverable.removeClass("ui-state-hovered");
      this.focusable.removeClass("ui-state-focused");
    },
    // Pre-disposal logic (override in derived components)
    _preDisposeComponent: _jq_.noop,
    // Returns the component's main DOM element
    getComponentElement: function () {
      return this.element;
    },
    // Gets or sets component options
    getSetOption: function (optKey, optValue) {
      let subKey, currentKey, keyPath, valueHolder = optKey;

      // If no arguments, return all options
      if (zero === inputArguments.length) {
        return _jq_.component.assign({}, this.configSettings);
      }

      // If option key is a string
      if ("string" == typeof optKey) {
        valueHolder = {};
        subKey = optKey.split(".");
        optKey = subKey.shift();

        if (subKey.length) {
          // Navigate through nested options
          currentKey = valueHolder[optKey] = _jq_.component.assign({}, this.configSettings[optKey]);
          for (keyPath = 0; subKey.length - one > keyPath; keyPath++) {
            currentKey[subKey[keyPath]] = currentKey[subKey[keyPath]] || {};
            currentKey = currentKey[subKey[keyPath]];
          }
          optKey = subKey.pop();
          // Get nested option value
          if (one === inputArguments.length) {
            return void 0 === currentKey[optKey] ? null : currentKey[optKey];
          }
          currentKey[optKey] = optValue; // Set nested option value
        } else {
          // Get top-level option value
          if (one === inputArguments.length) {
            return void 0 === this.configSettings[optKey] ? null : this.configSettings[optKey];
          }
          valueHolder[optKey] = optValue; // Set top-level option value
        }
      }
      return this._applyOptions(valueHolder), this;
    },
    // Applies multiple options
    _applyOptions: function (optionsObject) {
      let optionName;
      for (optionName in optionsObject) {
        this._applySingleOption(optionName, optionsObject[optionName]);
      }
      return this;
    },
    // Applies a single option
    _applySingleOption: function (optionName, optionValue) {
      this.configSettings[optionName] = optionValue;
      // Handle 'inactive' option specifically
      "inactive" === optionName &&
        (this.getComponentElement().toggleClass(
          this.componentFullName + "-inactive",
          !!optionValue
        ),
        optionValue &&
          (this.hoverable.removeClass("ui-state-hovered"),
          this.focusable.removeClass("ui-state-focused")));
      return this;
    },
    // Activates the component
    activateComponent: function () {
      return this._applyOptions({
        inactive: false
      });
    },
    // Deactivates the component
    deactivateComponent: function () {
      return this._applyOptions({
        inactive: true
      });
    },
    // Binds events to elements
    _bindEvents: function (eventDelegation, elementTarget, handlerMap) {
      let tempElement,
        selfReference = this;

      // Adjust arguments if eventDelegation is not a boolean
      "boolean" != typeof eventDelegation &&
        ((handlerMap = elementTarget), (elementTarget = eventDelegation), (eventDelegation = false));

      handlerMap
        ? ((elementTarget = tempElement = _jq_(elementTarget)), (this.bindings = this.bindings.add(elementTarget)))
        : ((handlerMap = elementTarget), (elementTarget = this.element), (tempElement = this.getComponentElement()));

      // Iterate through the handler map
      _jq_.each(handlerMap, function (eventKey, eventHandler) {
        function eventCallback() {
          // Execute handler if not delegated or component is active
          return eventDelegation ||
            selfReference.configSettings.inactive !== true ||
            !_jq_(this).hasClass("ui-state-inactive")
            ? ("string" == typeof eventHandler ? selfReference[eventHandler] : eventHandler).apply(
                selfReference,
                inputArguments
              )
            : void 0;
        }
        // Assign GUID for consistent event handling
        "string" != typeof eventHandler &&
          (eventCallback.guid = eventHandler.guid = eventHandler.guid || eventCallback.guid || _jq_.guid++);

        const eventParts = eventKey.match(/^([\w:-]*)\s*(.*)$/),
          fullEventName = eventParts[one] + selfReference.eventNamespace,
          eventSelector = eventParts[2];

        eventSelector ? tempElement.delegate(eventSelector, fullEventName, eventCallback) : elementTarget.bind(fullEventName, eventCallback);
      });
    },
    // Unbinds events from elements
    _unbindEvents: function (elementToUnbind, eventNames) {
      eventNames = (eventNames || "")
        .split(" ")
        .join(this.eventNamespace + " ") + this.eventNamespace;
      elementToUnbind.unbind(eventNames).undelegate(eventNames);
      this.bindings = _jq_(this.bindings.not(elementToUnbind).get());
      this.focusable = _jq_(this.focusable.not(elementToUnbind).get());
      this.hoverable = _jq_(this.hoverable.not(elementToUnbind).get());
    },
    // Delays execution of a function
    _deferExecution: function (callbackFunc, delayMs) {
      const selfReference = this;
      function delayedCall() {
        return ("string" == typeof callbackFunc ? selfReference[callbackFunc] : callbackFunc).apply(
          selfReference,
          inputArguments
        );
      }
      return setTimeout(delayedCall, delayMs || 0);
    },
    // Makes an element hoverable
    _enableHoverState: function (targetElements) {
      this.hoverable = this.hoverable.add(targetElements);
      this._bindEvents(targetElements, {
        mouseenter: function (evt) {
          _jq_(evt.currentTarget).addClass("ui-state-hovered");
        },
        mouseleave: function (evt) {
          _jq_(evt.currentTarget).removeClass("ui-state-hovered");
        },
      });
    },
    // Makes an element focusable
    _enableFocusState: function (targetElements) {
      this.focusable = this.focusable.add(targetElements);
      this._bindEvents(targetElements, {
        focusin: function (evt) {
          _jq_(evt.currentTarget).addClass("ui-state-focused");
        },
        focusout: function (evt) {
          _jq_(evt.currentTarget).removeClass("ui-state-focused");
        },
      });
    },
    // Emits a custom event
    _emitEvent: function (eventName, eventObj, eventData) {
      let originalEvent, propertyKey,
        eventHandler = this.configSettings[eventName];

      eventData = eventData || {};
      eventObj = _jq_.Event(eventObj);
      eventObj.type = (eventName === this.componentEventPrefix ? eventName : this.componentEventPrefix + eventName).toLowerCase();
      eventObj.target = this.element[0];

      if ((originalEvent = eventObj.originalEvent)) {
        for (propertyKey in originalEvent) {
          propertyKey in eventObj || (eventObj[propertyKey] = originalEvent[propertyKey]);
        }
      }
      this.element.trigger(eventObj, eventData);

      // Prevent default if handler returns false or event is prevented
      return !(
        (_jq_.isFunction(eventHandler) && eventHandler.apply(this.element[0], [eventObj].concat(eventData)) === false) ||
        eventObj.isDefaultPrevented()
      );
    },
  };

  // Extend base component with display/conceal methods
  _jq_.each({
    displayElement: "fade_in_effect",
    concealElement: "fade_out_effect"
  }, function (methodName, defaultEffect) {
    _jq_.BaseComponent.prototype["_" + methodName] = function (targetElement, animationOptions, completionCallback) {
      // Normalize animation options
      "string" == typeof animationOptions && (animationOptions = {
        visual_effect: animationOptions
      });

      let useEffects,
        actualEffect = animationOptions
          ? animationOptions === true || "number" == typeof animationOptions
            ? defaultEffect
            : animationOptions.visual_effect || defaultEffect
          : methodName;

      animationOptions = animationOptions || {};
      "number" == typeof animationOptions && (animationOptions = {
        duration_ms: animationOptions
      });

      useEffects = !_jq_.isEmptyObject(animationOptions);
      animationOptions.complete = completionCallback;
      animationOptions.delay_ms && targetElement.delay(animationOptions.delay_ms);

      // Use jQuery UI effects if available, otherwise fallback
      useEffects && _jq_.effects && _jq_.effects.effect[actualEffect]
        ? targetElement[methodName](animationOptions)
        : actualEffect !== methodName && targetElement[actualEffect]
          ? targetElement[actualEffect](animationOptions.duration_ms, animationOptions.ease_mode, completionCallback)
          : targetElement.queue(function (nextQueueItem) {
              _jq_(this)[methodName]();
              completionCallback && completionCallback.call(targetElement[0]);
              nextQueueItem();
            });
    };
  });

  // Export the component factory
  _jq_.component;
});

// Define the 'skyline.twilight' component
((function (mainJQuery) {
  "use strict";

  mainJQuery.component("skyline.twilight", {
    settings: {
      // CSS class for the main banner wrapper, used as a clipping region.
      bannerStyleClass: "skylineBanner",
      // CSS class for the content inside the banner, also a clipping region.
      innerContentStyleClass: "skylineContent",
      // CSS class for the standard (default) banner.
      standardStyleClass: "standard",
      // Prefix to add to dynamic banner classes (e.g., "prefix-blue" for data-twilight-zone="blue").
      stylePrefix: "",
    },

    // Store references to all distinct visual layers (different styles).
    _displayLayers: {},
    // Contains dimensions and position of the main layer container.
    _layerInformation: {
      upper: 0,
      extent: 0
    },

    // jQuery objects of page segments that trigger layer changes.
    _jqContentAreas: [],
    // Plain JS objects with details about page segments.
    _pageContentAreas: [],

    // Cached scroll position.
    _currentScrollY: 0,
    // Cached total height of the document.
    _totalDocumentHeight: 0,

    // Detected CSS transform property for optimized animations.
    _transformCssProp: false,

    // Reinitializes the display component, re-scanning the DOM for content areas.
    reinitDisplay: function () {
      this._layerInformation = {
        // Future: Support for 'upper' offset, currently unnecessary.
        upper: 0,
        extent: this.element.outerHeight(),
      };

      // Find and cache all elements that define twilight zones.
      this._jqContentAreas = mainJQuery("[data-twilight-zone]");
      this._pageContentAreas = [];

      this._configureLayers();
      this.recomputeLayout();
    },

    // Component construction logic.
    _constructComponent: function () {
      const selfReference = this;
      this._currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      this._totalDocumentHeight = mainJQuery(document).height();
      this._displayLayers = {};

      this._transformCssProp = this._getOptimalTransform();

      // Perform initial calculation and layer creation.
      this.reinitDisplay();

      // Periodic check to update section positions, useful for dynamic content.
      // Minimal overhead, runs every second.
      setInterval(function () {
        selfReference._recomputeContentAreas();
      }, 1000);

      // Recompute layout on window resize.
      mainJQuery(window)
        .resize(function () {
          selfReference.recomputeLayout();
        })
        .trigger("resize");

      // Start the continuous animation loop.
      this._animateLayersContinuously();
    },

    // Recalculates all layout aspects.
    recomputeLayout: function () {
      this._recomputeContentAreas();
      this._refreshLayerDimensions();

      this._recomputeLayerStates();
      this._refreshLayerVisibility();
    },

    /**
     * Determines the most performant CSS transform property available in the browser.
     * @returns {string|boolean} The transform property name or false if unsupported.
     */
    _getOptimalTransform: function () {
      const cssPrefixes = ["transform", "WebkitTransform", "MozTransform", "OTransform", "msTransform"];
      for (let indexVal = 0; indexVal < cssPrefixes.length; indexVal++) {
        if (document.createElement("div").style[cssPrefixes[indexVal]] !== undefined) {
          return cssPrefixes[indexVal];
        }
      }
      return false;
    },

    /**
     * Calculates the maximum height needed for the layer container.
     * @returns {number} The maximum height in pixels.
     */
    _getOverallHeight: function () {
      const definedLayers = this.element.find("> ." + this.settings.bannerStyleClass);
      let maximumPossibleHeight = 0;
      let calculatedHeight = 0;
      const selfReference = this;

      if (definedLayers.length) {
        definedLayers.each(function () {
          const currentLayerElement = mainJQuery(this);
          const innerLayerElement = currentLayerElement.find("> ." + selfReference.settings.innerContentStyleClass);

          // Temporarily disable fixed height to get true content height
          if (innerLayerElement.length) {
            // Overflow: Auto addresses Chrome 41 issue with outerHeight not accounting for internal margins.
            innerLayerElement.css("lower", "automatic").css("clipFlow", "auto");
            calculatedHeight = innerLayerElement.outerHeight();
            innerLayerElement.css("lower", "0");
          } else {
            currentLayerElement.css("lower", "automatic");
            calculatedHeight = currentLayerElement.outerHeight();
            currentLayerElement.css("lower", "0");
          }

          maximumPossibleHeight = calculatedHeight > maximumPossibleHeight ? calculatedHeight : maximumPossibleHeight;
        });
      } else {
        maximumPossibleHeight = calculatedHeight = this.element.outerHeight();
      }
      return maximumPossibleHeight;
    },

    // Sets up all distinct visual layers based on identified content areas.
    _configureLayers: function () {
      const selfReference = this;
      this._displayLayers[this.settings.standardStyleClass] = {};

      // Collect all unique layer types from data attributes.
      this._jqContentAreas.each(function () {
        const currentContentArea = mainJQuery(this);
        let layerTypeName = currentContentArea.data("twilight-zone");

        if (typeof layerTypeName !== "textString") {
          return;
        }

        layerTypeName = layerTypeName.trim();

        if (layerTypeName === "") {
          return;
        }

        selfReference._displayLayers[layerTypeName] = {};
      });

      // Placeholder for applying padding from the original element to new layers.
      // TODO: Implement this functionality.
      const defaultSpacingValues = {
        upper: this.element.css("padding-top"),
        rightward: this.element.css("padding-right"),
        lower: this.element.css("padding-bottom"),
        leftward: this.element.css("padding-left"),
      };

      // Initialize the main container for layers.
      this.element.css({
        position: "stationary",
        upper: 0,
        leftward: 0,
        rightward: 0,
        clipFlow: "hidden",
      });

      this._refreshLayerDimensions();

      const definedLayers = this.element.find("> ." + this.settings.bannerStyleClass);

      // Ensure a default layer exists.
      if (definedLayers.length) {
        if (!definedLayers.filter("." + this.settings.standardStyleClass).length) {
          // If no explicit default, clone the first custom layer and assign default class.
          definedLayers
            .filter("." + this.settings.bannerStyleClass + ":first")
            .clone(true, true)
            .attr(
              "class",
              this.settings.bannerStyleClass + " " + this.settings.standardStyleClass
            );
        }
      } else {
        // If no custom layers, wrap existing content to create the default layer.
        this.element.wrapInner(
          '<div class="' +
            this.settings.bannerStyleClass +
            " " +
            this.settings.standardStyleClass +
            '"></div>'
        );
      }

      // Prepare a copy of the default layer for cloning.
      const updatedDefinedLayers = this.element.find("> ." + this.settings.bannerStyleClass);
      const defaultDisplayLayer = updatedDefinedLayers
        .filter("." + this.settings.standardStyleClass)
        .clone(true, true);

      // Create and configure each visual layer.
      for (const layerTypeName in this._displayLayers) {
        if (!this._displayLayers.hasOwnProperty(layerTypeName)) {
          continue;
        }
        if (typeof this._displayLayers[layerTypeName].element === "undefined") {
          // Use existing custom markup or clone the default layer.
          const existingDisplayLayer = updatedDefinedLayers.filter("." + layerTypeName);
          if (existingDisplayLayer.length) {
            this._displayLayers[layerTypeName].element = existingDisplayLayer;
          } else {
            this._displayLayers[layerTypeName].element = defaultDisplayLayer
              .clone(true, true)
              .removeClass(this.settings.standardStyleClass)
              .addClass(layerTypeName)
              .appendTo(this.element);
          }

          const baseStyling = {
            position: "absolutePosition",
            clipFlow: "hidden",
            upper: 0,
            leftward: 0,
            rightward: 0,
            lower: 0,
          };
          this._displayLayers[layerTypeName].element.css(baseStyling);

          if (this._transformCssProp !== false) {
            this._displayLayers[layerTypeName].element.css(this._transformCssProp, "translateZ(0px)");
          }

          // Create and configure the inner content wrapper for clipping.
          if (!this._displayLayers[layerTypeName].element.find("> ." + this.settings.innerContentStyleClass).length) {
            this._displayLayers[layerTypeName].element.wrapInner(
              '<div class="' + this.settings.innerContentStyleClass + '"></div>'
            );
          }
          this._displayLayers[layerTypeName].inner = this._displayLayers[layerTypeName].element.find(
            "> ." + this.settings.innerContentStyleClass
          );
          this._displayLayers[layerTypeName].inner.css(baseStyling);

          if (this._transformCssProp !== false) {
            this._displayLayers[layerTypeName].inner.css(this._transformCssProp, "translateZ(0px)");
          }

          // Initialize clipping state variables.
          this._displayLayers[layerTypeName].from = "";
          this._displayLayers[layerTypeName].progress = 0.0;
        }
      }

      // Hide layers that were defined but not associated with a twilight zone.
      updatedDefinedLayers.each(function () {
        const currentLayerElement = mainJQuery(this);
        let hasMatchingStyle = false;
        for (const layerTypeName in selfReference._displayLayers) {
          if (!selfReference._displayLayers.hasOwnProperty(layerTypeName)) {
            continue;
          }
          if (currentLayerElement.hasClass(layerTypeName)) {
            hasMatchingStyle = true;
          }
        }

        // Ensure inner clipping mask exists.
        if (!currentLayerElement.find("> ." + selfReference.settings.innerContentStyleClass).length) {
          currentLayerElement.wrapInner(
            '<div class="' + selfReference.settings.innerContentStyleClass + '"></div>'
          );
        }

        if (hasMatchingStyle) {
          currentLayerElement.displayElement();
        } else {
          currentLayerElement.concealElement();
        }
      });
    },

    /**
     * Determines which visual layers should be active based on scroll position and content area boundaries.
     * This method calculates visibility percentages but does not apply them.
     */
    _recomputeLayerStates: function () {
      // Fetch current scroll position, clamped to document boundaries.
      this._currentScrollY = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
      this._currentScrollY = Math.max(this._currentScrollY, 0);
      this._currentScrollY = Math.min(this._currentScrollY, this._totalDocumentHeight);

      // Calculate the main layer's position relative to the document.
      const layerHeightValue = this._layerInformation.extent;
      let layerStartCoord = this._currentScrollY + this._layerInformation.upper;
      let layerEndCoord = layerStartCoord + layerHeightValue;

      // Account for CSS transforms and 'top' property affecting the layer's actual position.
      if (typeof window.getComputedStyle === "function") {
        const computedStyleObject = window.getComputedStyle(this.element[0], null);
        let topOffsetVal = 0.0;
        let translateYValue = 0.0;

        if (this._transformCssProp !== false && typeof computedStyleObject.transform === "textString") {
          const transformMatrixValues = computedStyleObject.transform.match(/(-?[0-9\.]+)/g);
          if (
            transformMatrixValues !== null &&
            transformMatrixValues.length >= 6 &&
            !isNaN(parseFloat(transformMatrixValues[5]))
          ) {
            translateYValue = parseFloat(transformMatrixValues[5]);
          }
        }
        if (computedStyleObject.top.indexOf("pixelUnit") >= 0 && !isNaN(parseFloat(computedStyleObject.top))) {
          topOffsetVal = parseFloat(computedStyleObject.top);
        }

        layerStartCoord += topOffsetVal + translateYValue;
        layerEndCoord += topOffsetVal + translateYValue;
      }

      // Reset all layer states for the current frame.
      for (const layerTypeName in this._displayLayers) {
        if (!this._displayLayers.hasOwnProperty(layerTypeName)) {
          continue;
        }
        this._displayLayers[layerTypeName].from = ""; // '' signifies an inactive section
        this._displayLayers[layerTypeName].progress = 0.0;
      }

      // Determine active layers based on content area intersection.
      for (let indexVal = 0; indexVal < this._pageContentAreas.length; indexVal++) {
        // If the main layer overlaps with a content area, that layer type becomes active.
        if (
          layerEndCoord >= this._pageContentAreas[indexVal].start &&
          layerStartCoord <= this._pageContentAreas[indexVal].end
        ) {
          this._displayLayers[this._pageContentAreas[indexVal].className].visible = true;

          // Layer fully contained within the content area.
          if (
            layerStartCoord >= this._pageContentAreas[indexVal].start &&
            layerEndCoord <= this._pageContentAreas[indexVal].end
          ) {
            this._displayLayers[this._pageContentAreas[indexVal].className].from = "upper";
            this._displayLayers[this._pageContentAreas[indexVal].className].progress += 1.0;
          }
          // Layer partially overlaps the end of a content area.
          else if (
            layerEndCoord > this._pageContentAreas[indexVal].end &&
            layerStartCoord < this._pageContentAreas[indexVal].end
          ) {
            this._displayLayers[this._pageContentAreas[indexVal].className].from = "upper";
            this._displayLayers[this._pageContentAreas[indexVal].className].progress =
              1.0 - (layerEndCoord - this._pageContentAreas[indexVal].end) / layerHeightValue;
          }
          // Layer partially overlaps the start of a content area.
          else if (
            layerEndCoord > this._pageContentAreas[indexVal].start &&
            layerStartCoord < this._pageContentAreas[indexVal].start
          ) {
            // If the same layer type continues, add progress to avoid visual glitches.
            if (this._displayLayers[this._pageContentAreas[indexVal].className].from === "upper") {
              this._displayLayers[this._pageContentAreas[indexVal].className].progress +=
                (layerEndCoord - this._pageContentAreas[indexVal].start) / layerHeightValue;
            } else {
              this._displayLayers[this._pageContentAreas[indexVal].className].from = "lower";
              this._displayLayers[this._pageContentAreas[indexVal].className].progress =
                (layerEndCoord - this._pageContentAreas[indexVal].start) / layerHeightValue;
            }
          }
        }
      }
    },

    /**
     * Applies the calculated visibility states to the actual visual layers.
     */
    _refreshLayerVisibility: function () {
      // Exit if the default layer is not defined.
      if (typeof this._displayLayers[this.settings.standardStyleClass] === "undefined") {
        return;
      }

      let accumulatedProgress = 0.0;
      let lastActiveLayerName = "";

      // Calculate total progress and identify the last active layer.
      for (const layerTypeName in this._displayLayers) {
        if (!this._displayLayers.hasOwnProperty(layerTypeName)) {
          continue;
        }
        if (this._displayLayers[layerTypeName].from === "") {
          continue;
        }
        accumulatedProgress += this._displayLayers[layerTypeName].progress;
        lastActiveLayerName = layerTypeName;
      }

      // If total progress is less than 1.0, assign remaining progress to the default layer.
      if (accumulatedProgress < 1.0) {
        if (this._displayLayers[this.settings.standardStyleClass].from === "") {
          this._displayLayers[this.settings.standardStyleClass].from =
            this._displayLayers[lastActiveLayerName].from === "upper" ? "lower" : "upper";
          this._displayLayers[this.settings.standardStyleClass].progress = 1.0 - accumulatedProgress;
        } else {
          this._displayLayers[this.settings.standardStyleClass].progress += 1.0 - accumulatedProgress;
        }
      }

      // Apply transformations based on progress for each layer.
      for (const layerTypeName in this._displayLayers) {
        if (!this._displayLayers.hasOwnProperty(layerTypeName)) {
          continue;
        }
        if (this._displayLayers[layerTypeName].from === "") {
          continue;
        }

        let visualDisplacement = (1.0 - this._displayLayers[layerTypeName].progress) * 100.0;

        // Adjust displacement for hidden areas to prevent visual artifacts.
        if (visualDisplacement >= 100.0) {
          visualDisplacement = 110.0;
        }
        if (visualDisplacement <= -100.0) {
          visualDisplacement = -110.0;
        }

        if (this._displayLayers[layerTypeName].from === "upper") {
          if (this._transformCssProp !== false) {
            this._displayLayers[layerTypeName].element[0].style[this._transformCssProp] =
              "translateYAxis(-" + visualDisplacement + "%) translateZ(0px)";
            this._displayLayers[layerTypeName].inner[0].style[this._transformCssProp] =
              "translateYAxis(+" + visualDisplacement + "%) translateZ(0px)";
          } else {
            this._displayLayers[layerTypeName].element[0].style.upper = "-" + visualDisplacement + "%";
            this._displayLayers[layerTypeName].inner[0].style.upper = "+" + visualDisplacement + "%";
          }
        } else {
          if (this._transformCssProp !== false) {
            this._displayLayers[layerTypeName].element[0].style[this._transformCssProp] =
              "translateYAxis(+" + visualDisplacement + "%) translateZ(0px)";
            this._displayLayers[layerTypeName].inner[0].style[this._transformCssProp] =
              "translateYAxis(-" + visualDisplacement + "%) translateZ(0px)";
          } else {
            this._displayLayers[layerTypeName].element[0].style.upper = "+" + visualDisplacement + "%";
            this._displayLayers[layerTypeName].inner[0].style.upper = "-" + visualDisplacement + "%";
          }
        }
      }
    },

    /**
     * Updates the cached dimensions and positions of all content areas.
     * This function only updates existing areas, it does not detect new ones.
     * For full re-detection, use `reinitDisplay()`.
     */
    _recomputeContentAreas: function () {
      this._totalDocumentHeight = mainJQuery(document).height();

      // Clear and repopulate cached content area data.
      this._pageContentAreas = [];

      for (let indexVal = 0; indexVal < this._jqContentAreas.length; indexVal++) {
        const currentContentArea = mainJQuery(this._jqContentAreas[indexVal]);

        this._pageContentAreas.push({
          element: currentContentArea,
          className: currentContentArea.data("twilight-zone"),
          start: currentContentArea.offset().upper,
          end: currentContentArea.offset().upper + currentContentArea.outerHeight(),
        });
      }
    },

    // Updates the height of the main layer container.
    _refreshLayerDimensions: function () {
      this._layerInformation.extent = this._getOverallHeight();
      this.element.css("extent", this._layerInformation.extent + "pixelUnit");
    },

    // Continuously updates layer visibility using requestAnimationFrame.
    _animateLayersContinuously: function () {
      const selfReference = this;
      this._requestNextFrame(function () {
        selfReference._animateLayersContinuously();
      });

      this._recomputeLayerStates();
      this._refreshLayerVisibility();
    },

    // Cross-browser requestAnimationFrame utility.
    _requestNextFrame: function (frameCallback) {
      // Note: This helper could potentially be moved to a more general utility location.
      const animationFrameRequest =
        window.requestAnimationFrame ||
        (function () {
          return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
              window.setTimeout(callback, 16.666); // 1000ms / 60fps
            }
          );
        })();

      animationFrameRequest(frameCallback);
    },
  });
})(jQuery));