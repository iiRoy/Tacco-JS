(function(factoryFn){
  "function" == typeof define && define.amd ? define(["jquery"], factoryFn) : factoryFn(jQuery);
})(function(jq){

  // A counter for unique IDs, starting from a random value to avoid potential conflicts
  let uniqueIdCounter = Math.floor(Math.random() * 1000);
  const arrayProtoSlice = Array.prototype.slice;

  // Enhance jQuery's cleanData to trigger a 'widgetdestroy' event before removing data
  jq.cleanData = (originalCleanData => {
    return function(elementsToRemove){
      let currentElement, elementIdx, eventData;
      for(elementIdx = 0; null != (currentElement = elementsToRemove[elementIdx]); elementIdx++){
        try {
          eventData = jq._data(currentElement, "events");
          // If event data exists and has a 'remove' handler, trigger it
          if (eventData && eventData.remove) {
            jq(currentElement).triggerHandler("remove");
          }
        } catch (error) {
          // Suppress errors during cleanup to ensure all elements are processed
          // console.error("Error during widget cleanup:", error);
        }
      }
      // Call the original cleanData function
      originalCleanData(elementsToRemove);
    };
  })(jq.cleanData);

  // Define the core widget factory method
  jq.widget = function(fullWidgetName, baseWidgetPrototype, specificConfig){
    let namespaceParts, widgetNamespace, widgetName, widgetFullName,
        baseWidgetInstance, methodOverrides = {},
        widgetConstructor, currentBaseConstructor;

    // Handle optional baseWidgetPrototype argument
    if (!specificConfig) {
      specificConfig = baseWidgetPrototype;
      baseWidgetPrototype = jq.Widget;
    }

    // Parse widget name into namespace and name
    namespaceParts = fullWidgetName.split(".");
    widgetNamespace = namespaceParts[0];
    widgetName = namespaceParts[1];
    widgetFullName = widgetNamespace + "-" + widgetName;

    // Register a selector for this widget type
    jq.expr[":"][widgetFullName.toLowerCase()] = function(element){
      return !!jq.data(element, widgetFullName);
    };

    // Ensure namespace object exists on jQuery
    jq[widgetNamespace] = jq[widgetNamespace] || {};
    currentBaseConstructor = jq[widgetNamespace][widgetName];

    // Define the widget constructor
    widgetConstructor = jq[widgetNamespace][widgetName] = function(options, element){
      // If this is called directly (not via 'new'), create a new instance
      if (!this._createWidget) {
        return new widgetConstructor(options, element);
      }
      // Initialize the widget
      if (arguments.length) {
        this._createWidget(options, element);
      }
    };

    // Extend the constructor with static properties from the base and config
    jq.extend(widgetConstructor, currentBaseConstructor, {
      version: specificConfig.version,
      _proto: jq.extend({}, specificConfig), // Store a copy of the config for inheritance
      _childConstructors: [] // Keep track of derived widgets
    });

    // Create a temporary instance of the base widget to inherit its options
    baseWidgetInstance = new baseWidgetPrototype();
    baseWidgetInstance.options = jq.widget.deepMerge({}, baseWidgetInstance.options);

    // Process methods and properties from the specific configuration
    jq.each(specificConfig, function(propKey, propValue){
      // If it's a function, prepare it for method overriding (super calls)
      if (jq.isFunction(propValue)) {
        methodOverrides[propKey] = (function(){
          const originalSuperCall = function(){
            return baseWidgetPrototype.prototype[propKey].apply(this, arguments);
          };
          const originalSuperApply = function(args){
            return baseWidgetPrototype.prototype[propKey].apply(this, args);
          };
          return function(){
            let tempSuper = this._super;
            let tempSuperApply = this._superApply;
            this._super = originalSuperCall;
            this._superApply = originalSuperApply;
            let result = propValue.apply(this, arguments);
            this._super = tempSuper;
            this._superApply = tempSuperApply;
            return result;
          };
        })();
      } else {
        // Otherwise, just copy the property
        methodOverrides[propKey] = propValue;
      }
    });

    // Merge prototypes: base widget, default event prefix, and custom overrides
    widgetConstructor.prototype = jq.widget.deepMerge(
      baseWidgetInstance,
      {
        widgetEventPrefix: currentBaseConstructor ? baseWidgetInstance.widgetEventPrefix || widgetName : widgetName
      },
      methodOverrides,
      {
        constructor: widgetConstructor,
        namespace: widgetNamespace,
        widgetName: widgetName,
        widgetFullName: widgetFullName
      }
    );

    // If there was a previous definition, re-derive its children from the new base
    if (currentBaseConstructor) {
      jq.each(currentBaseConstructor._childConstructors, function(idx, childConstructor){
        const childProto = childConstructor.prototype;
        jq.widget(childProto.namespace + "." + childProto.widgetName, widgetConstructor, childConstructor._proto);
      });
      delete currentBaseConstructor._childConstructors; // Clean up old reference
    } else {
      // Otherwise, add this widget as a child constructor of the base
      baseWidgetPrototype._childConstructors.push(widgetConstructor);
    }

    // Register the widget bridge for jQuery plugin access
    jq.widget.registerBridge(widgetName, widgetConstructor);

    return widgetConstructor;
  };

  // Utility for deep merging options/objects
  jq.widget.deepMerge = function(targetObject){
    const sourceObjects = arrayProtoSlice.call(arguments, 1);
    let currentSource, propName, propValue;

    for (let i = 0; i < sourceObjects.length; i++) {
      currentSource = sourceObjects[i];
      for (propName in currentSource) {
        propValue = currentSource[propName];
        // Ensure property belongs to the object and is not undefined
        if (currentSource.hasOwnProperty(propName) && propValue !== undefined) {
          // Deep merge if both current and target properties are plain objects
          if (jq.isPlainObject(propValue)) {
            targetObject[propName] = jq.isPlainObject(targetObject[propName])
              ? jq.widget.deepMerge({}, targetObject[propName], propValue)
              : jq.widget.deepMerge({}, propValue);
          } else {
            targetObject[propName] = propValue;
          }
        }
      }
    }
    return targetObject;
  };

  // Bridge function to expose widgets as jQuery plugins
  jq.widget.registerBridge = function(pluginAlias, widgetConstructor){
    const fullPluginName = widgetConstructor.prototype.widgetFullName || pluginAlias;

    jq.fn[pluginAlias] = function(methodOrOptions){
      const isMethodCall = typeof methodOrOptions === "string";
      const methodArguments = arrayProtoSlice.call(arguments, 1);
      let returnResult = this; // Default return value

      // If options are provided with additional arguments, merge them
      if (!isMethodCall && methodArguments.length) {
        methodOrOptions = jq.widget.deepMerge.apply(null, [methodOrOptions].concat(methodArguments));
      }

      if (isMethodCall) {
        this.each(function(){
          let widgetInstance = jq.data(this, fullPluginName);
          let methodOutput;

          if (methodOrOptions === "instance") {
            returnResult = widgetInstance;
            return false; // Exit .each loop
          }

          if (!widgetInstance) {
            jq.error(`Cannot call methods on '${pluginAlias}' prior to initialization; attempted to call method '${methodOrOptions}'`);
            return;
          }

          if (jq.isFunction(widgetInstance[methodOrOptions]) && methodOrOptions.charAt(0) !== "_") {
            methodOutput = widgetInstance[methodOrOptions].apply(widgetInstance, methodArguments);
            if (methodOutput !== widgetInstance && methodOutput !== undefined) {
              returnResult = methodOutput && methodOutput.jquery ? returnResult.pushStack(methodOutput.get()) : methodOutput;
              return false; // Exit .each loop if a specific value is returned
            }
          } else {
            jq.error(`No such method '${methodOrOptions}' for '${pluginAlias}' widget instance`);
          }
        });
      } else {
        this.each(function(){
          let widgetInstance = jq.data(this, fullPluginName);
          if (widgetInstance) {
            widgetInstance.option(methodOrOptions || {});
            if (widgetInstance._init) {
              widgetInstance._init(); // Re-initialize if _init exists
            }
          } else {
            jq.data(this, fullPluginName, new widgetConstructor(methodOrOptions, this));
          }
        });
      }
      return returnResult;
    };
  };

  // Base Widget constructor
  jq.Widget = function(){};
  jq.Widget._childConstructors = []; // Track derived widgets

  // Base Widget prototype methods and properties
  jq.Widget.prototype = {
    widgetName: "widget",
    widgetEventPrefix: "",
    defaultElement: "<div>",
    options: {
      disabled: false,
      create: null // Callback for widget creation
    },

    // Core widget creation logic
    _createWidget: function(initialOptions, domElement){
      domElement = jq(domElement || this.defaultElement || this)[0];
      this.element = jq(domElement);
      this.uuid = uniqueIdCounter++;
      this.eventNamespace = `.${this.widgetName}${this.uuid}`;
      this.bindings = jq();
      this.hoverable = jq();
      this.focusable = jq();

      // If the DOM element is different from 'this', store widget instance on element
      if (domElement !== this) {
        jq.data(domElement, this.widgetFullName, this);
        // Bind a 'remove' event to destroy the widget if its element is removed
        this._bindEvents(true, this.element, {
          remove: function(event){
            if (event.target === domElement) {
              this.destroy();
            }
          }
        });
        // Determine document and window context
        this.document = jq(domElement.style ? domElement.ownerDocument : domElement.document || domElement);
        this.window = jq(this.document[0].defaultView || this.document[0].parentWindow);
      }

      // Merge options: defaults, create options, and user-provided options
      this.options = jq.widget.deepMerge({}, this.options, this._getCreateOptions(), initialOptions);

      this._create(); // User-defined creation logic
      this._trigger("create", null, this._getCreateEventData());
      this._init(); // User-defined initialization logic
    },

    _getCreateOptions: jq.noop, // Placeholder for getting options during creation
    _getCreateEventData: jq.noop, // Placeholder for event data during creation
    _create: jq.noop, // Placeholder for widget-specific creation
    _init: jq.noop, // Placeholder for widget-specific initialization

    // Destroys the widget instance
    destroy: function(){
      this._destroy(); // User-defined destruction logic
      this.element
        .unbind(this.eventNamespace) // Unbind all namespaced events
        .removeData(this.widgetFullName) // Remove widget data from element
        .removeData(jq.camelCase(this.widgetFullName)); // Also remove camelCased data

      this.widget()
        .unbind(this.eventNamespace)
        .removeAttr("aria-disabled")
        .removeClass(`${this.widgetFullName}-disabled ui-state-disabled`);

      this.bindings.unbind(this.eventNamespace);
      this.hoverable.removeClass("ui-state-hover");
      this.focusable.removeClass("ui-state-focus");
    },

    _destroy: jq.noop, // Placeholder for widget-specific destruction

    // Returns the widget's main element
    widget: function(){
      return this.element;
    },

    // Manages widget options (get or set)
    option: function(key, value){
      let currentKey, currentVal, pathParts, nestedObj, i;
      let optionBag = key;

      // If no arguments, return a copy of all options
      if (arguments.length === 0) {
        return jq.widget.deepMerge({}, this.options);
      }

      // Handle string key for getting/setting
      if (typeof key === "string") {
        optionBag = {};
        pathParts = key.split(".");
        currentKey = pathParts.shift();

        // If nested path
        if (pathParts.length) {
          nestedObj = optionBag[currentKey] = jq.widget.deepMerge({}, this.options[currentKey]);
          for (i = 0; i < pathParts.length - 1; i++) {
            nestedObj[pathParts[i]] = nestedObj[pathParts[i]] || {};
            nestedObj = nestedObj[pathParts[i]];
          }
          key = pathParts.pop();
          if (arguments.length === 1) {
            return nestedObj[key] === undefined ? null : nestedObj[key];
          }
          nestedObj[key] = value;
        } else {
          // Top-level key
          if (arguments.length === 1) {
            return this.options[key] === undefined ? null : this.options[key];
          }
          optionBag[key] = value;
        }
      }

      this._setOptions(optionBag);
      return this;
    },

    // Internal method to apply multiple options
    _setOptions: function(optionsMap){
      let optName;
      for (optName in optionsMap) {
        this._setOption(optName, optionsMap[optName]);
      }
      return this;
    },

    // Internal method to apply a single option
    _setOption: function(optionName, optionValue){
      this.options[optionName] = optionValue;
      if (optionName === "disabled") {
        this.widget().toggleClass(`${this.widgetFullName}-disabled`, !!optionValue);
        if (optionValue) {
          this.hoverable.removeClass("ui-state-hover");
          this.focusable.removeClass("ui-state-focus");
        }
      }
      return this;
    },

    // Enables the widget
    enable: function(){
      return this._setOptions({ disabled: false });
    },

    // Disables the widget
    disable: function(){
      return this._setOptions({ disabled: true });
    },

    // Event binding utility
    _bindEvents: function(delegateToElement, elementToBind, eventMap){
      let useDelegate = delegateToElement;
      let targetElement = elementToBind;
      let eventHandlers = eventMap;
      const widgetContext = this;
      let delegatedRoot;

      if (typeof useDelegate !== "boolean") {
        eventHandlers = elementToBind;
        targetElement = useDelegate;
        useDelegate = false;
      }

      if (eventHandlers) {
        targetElement = delegatedRoot = jq(targetElement);
        this.bindings = this.bindings.add(targetElement);
      } else {
        eventHandlers = targetElement;
        targetElement = this.element;
        delegatedRoot = this.widget();
      }

      jq.each(eventHandlers, function(eventKey, eventCallback){
        function eventWrapper(){
          // Only execute if not disabled, or if explicitly allowed (useDelegate === true)
          if (useDelegate || (widgetContext.options.disabled !== true && !jq(this).hasClass("ui-state-disabled"))) {
            return (typeof eventCallback === "string" ? widgetContext[eventCallback] : eventCallback).apply(widgetContext, arguments);
          }
        }

        // Assign a unique GUID to eventWrapper if eventCallback doesn't have one
        if (typeof eventCallback !== "string") {
          eventWrapper.guid = eventCallback.guid = eventCallback.guid || eventWrapper.guid || jq.guid++;
        }

        const eventParts = eventKey.match(/^([\w:-]*)\s*(.*)$/);
        const actualEventName = eventParts[1] + widgetContext.eventNamespace;
        const selector = eventParts[2];

        if (selector) {
          delegatedRoot.delegate(selector, actualEventName, eventWrapper);
        } else {
          targetElement.bind(actualEventName, eventWrapper);
        }
      });
    },

    // Event unbinding utility
    _unbindEvents: function(targetElement, eventKeys){
      eventKeys = (eventKeys || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace;
      targetElement.unbind(eventKeys).undelegate(eventKeys);
      // Update collections by removing elements that were unbound
      this.bindings = jq(this.bindings.not(targetElement).get());
      this.focusable = jq(this.focusable.not(targetElement).get());
      this.hoverable = jq(this.hoverable.not(targetElement).get());
    },

    // Delayed execution utility
    _delay: function(callback, delayMs){
      const widgetContext = this;
      function delayedFn(){
        return (typeof callback === "string" ? widgetContext[callback] : callback).apply(widgetContext, arguments);
      }
      return setTimeout(delayedFn, delayMs || 0);
    },

    // Adds elements to the hoverable collection and binds hover events
    _hoverable: function(elements){
      this.hoverable = this.hoverable.add(elements);
      this._bindEvents(elements, {
        mouseenter: function(event){
          jq(event.currentTarget).addClass("ui-state-hover");
        },
        mouseleave: function(event){
          jq(event.currentTarget).removeClass("ui-state-hover");
        }
      });
    },

    // Adds elements to the focusable collection and binds focus events
    _focusable: function(elements){
      this.focusable = this.focusable.add(elements);
      this._bindEvents(elements, {
        focusin: function(event){
          jq(event.currentTarget).addClass("ui-state-focus");
        },
        focusout: function(event){
          jq(event.currentTarget).removeClass("ui-state-focus");
        }
      });
    },

    // Triggers a widget event
    _trigger: function(eventType, domEvent, eventData){
      let originalEventProps, currentProp;
      const eventHandler = this.options[eventType];

      eventData = eventData || {};
      domEvent = jq.Event(domEvent);
      domEvent.type = (eventType === this.widgetEventPrefix ? eventType : this.widgetEventPrefix + eventType).toLowerCase();
      domEvent.target = this.element[0];

      // Copy original event properties to the new event object
      originalEventProps = domEvent.originalEvent;
      if (originalEventProps) {
        for (currentProp in originalEventProps) {
          if (!(currentProp in domEvent)) {
            domEvent[currentProp] = originalEventProps[currentProp];
          }
        }
      }

      this.element.trigger(domEvent, eventData);

      // Return true unless handler explicitly returns false or default prevented
      return !(jq.isFunction(eventHandler) &&
               eventHandler.apply(this.element[0], [domEvent].concat(eventData)) === false ||
               domEvent.isDefaultPrevented());
    }
  };

  // Add _show and _hide methods to the base widget for animated transitions
  jq.each({ show: "fadeIn", hide: "fadeOut" }, function(methodName, defaultEffect){
    jq.Widget.prototype[`_${methodName}`] = function(element, options, onComplete){
      // Normalize options argument
      if (typeof options === "string") {
        options = { effect: options };
      }

      let effectToUse = options ? (options === true || typeof options === "number" ? defaultEffect : options.effect || defaultEffect) : methodName;
      options = options || {};

      if (typeof options === "number") {
        options = { duration: options };
      }

      const hasCustomEffect = !jq.isEmptyObject(options);
      options.complete = onComplete;

      // Handle delay if specified
      if (options.delay) {
        element.delay(options.delay);
      }

      // Use jQuery UI effects if available and specified
      if (hasCustomEffect && jq.effects && jq.effects.effect[effectToUse]) {
        element[methodName](options);
      } else if (effectToUse !== methodName && element[effectToUse]) {
        // Fallback to simpler jQuery animations if effect is a standard one (e.g., slideUp)
        element[effectToUse](options.duration, options.easing, onComplete);
      } else {
        // Default to direct show/hide if no animation or effect specified
        element.queue(function(next){
          jq(this)[methodName]();
          if (onComplete) {
            onComplete.call(element[0]);
          }
          next();
        });
      }
    };
  });

  // Start of the specific widget implementation
  ((function(localJq){

    "use strict";

    localJq.widget('themeLab.colorShifter', { // Renamed aerolab.midnight to themeLab.colorShifter

      options: {
        // CSS class for the outermost header container. Serves as a clipping mask.
        headerContainerClass: 'colorShifterContainer',
        // CSS class for the inner content wrapper within each header. Also a clipping mask.
        innerContentClass: 'colorShifterInner',
        // Default header class to use when no specific class is defined for a section.
        defaultColorClass: 'defaultTheme',
        // Optional prefix for dynamically generated header classes.
        classPrefix: '',
        // Padding values for the header container.
        headerPadding: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px'
        }
      },

      // Internal state variables
      _activeHeaderElements: {}, // Stores references to generated header DOM elements and their state
      _layoutMetrics: { containerTop: 0, containerHeight: 0 }, // Dimensions of the main header container
      _mappedSections: [], // List of all sections that trigger color changes
      _scrollPosition: 0, // Current vertical scroll offset
      _pageContentHeight: 0, // Total height of the document content
      _cssTransformProperty: false, // Cached CSS transform property name for browser compatibility
      _animationFrameId: null, // ID for the requestAnimationFrame loop

      // Public method to force a re-evaluation of all layout and header states
      reinitializeLayout: function(){
        this._layoutMetrics = {
          containerTop: 0, // Currently fixed at top, so top offset is 0
          containerHeight: this.element.outerHeight()
        };

        // Find and cache all sections with `data-color-shift` attribute
        this._jquerySections = localJq('[data-color-shift]');
        this._mappedSections = []; // Clear previous section models

        this._prepareHeaderElements(); // Create or find all necessary header DOM structures
        this.updateMeasurements(); // Recalculate positions and update header visibility
      },

      // Widget initialization
      _setupInitialState: function(){
        const widgetInstance = this;
        this._scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        this._pageContentHeight = localJq(document).height();
        this._activeHeaderElements = {}; // Initialize header map

        this._cssTransformProperty = this._detectTransformSupport(); // Check for CSS transform support

        // Perform initial layout setup
        this.reinitializeLayout();

        // Periodically refresh section boundaries for dynamic content.
        // Using setTimeout with recursion to avoid potential setInterval issues.
        // This is a Type III change: replacing setInterval with recursive setTimeout.
        const sectionRecalculationInterval = 1000;
        const recalibrateSections = function() {
          widgetInstance._refreshSectionBounds();
          widgetInstance._recalibrationTimeout = setTimeout(recalibrateSections, sectionRecalculationInterval);
        };
        this._recalibrationTimeout = setTimeout(recalibrateSections, sectionRecalculationInterval);


        // Re-evaluate layout on window resize
        localJq(window).on('resize' + this.eventNamespace, function(){
          widgetInstance.updateMeasurements();
        }).trigger('resize'); // Trigger immediately to set initial state

        // Start the animation loop for header updates
        this._startRenderLoop();
      },

      // Recalculates all positions and updates header states
      updateMeasurements: function(){
        this._refreshSectionBounds();
        this._adjustHeaderContainerHeight();
        this._determineActiveHeaders();
        this._applyHeaderTransforms();
      },

      // Detects the appropriate CSS transform property for the browser
      _detectTransformSupport: function(){
        const transformPrefixes = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
        const testDiv = document.createElement('div');
        for (let i = 0; i < transformPrefixes.length; i++) {
          if (testDiv.style[transformPrefixes[i]] !== undefined) {
            return transformPrefixes[i];
          }
        }
        return false; // No transform support detected
      },

      // Calculates the maximum height of all header variations
      _calculateContainerHeight: function(){
        const customHeaderContainers = this.element.find(`> .${this.options.headerContainerClass}`);
        let maxHeightFound = 0;
        const instance = this;

        if (customHeaderContainers.length > 0) {
          customHeaderContainers.each(function(){
            const currentHeader = localJq(this);
            const innerWrapper = currentHeader.find(`> .${instance.options.innerContentClass}`);
            let currentHeight = 0;

            // To get accurate height, temporarily adjust CSS properties
            if (innerWrapper.length) {
              innerWrapper.css({ 'bottom': 'auto', 'overflow': 'auto' });
              currentHeight = innerWrapper.outerHeight();
              innerWrapper.css('bottom', '0'); // Reset
            } else {
              currentHeader.css('bottom', 'auto');
              currentHeight = currentHeader.outerHeight();
              currentHeader.css('bottom', '0'); // Reset
            }
            maxHeightFound = Math.max(maxHeightFound, currentHeight);
          });
        } else {
          maxHeightFound = this.element.outerHeight(); // Fallback to main element height
        }
        return maxHeightFound;
      },

      // Sets up or re-uses the header DOM elements for each color class
      _prepareHeaderElements: function(){
        const instance = this;
        this._activeHeaderElements[this.options.defaultColorClass] = {}; // Ensure default is present

        // Populate `_activeHeaderElements` with all unique header classes from sections
        this._jquerySections.each(function(){
          const sectionElement = localJq(this);
          let headerIdentifier = sectionElement.data('color-shift');

          if (typeof headerIdentifier === 'string') {
            headerIdentifier = headerIdentifier.trim();
            if (headerIdentifier !== '') {
              instance._activeHeaderElements[headerIdentifier] = {};
            }
          }
        });

        // Apply fixed positioning to the main container
        this.element.css({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          overflow: 'hidden'
        });
        this._adjustHeaderContainerHeight(); // Set initial height

        let currentHeaderWrappers = this.element.find(`> .${this.options.headerContainerClass}`);
        let defaultHeaderTemplate;

        // Ensure a default header template exists
        if (currentHeaderWrappers.length) {
          // If a specific default header exists, use it as template
          if (!currentHeaderWrappers.filter(`.${this.options.defaultColorClass}`).length) {
            // If no explicit default, clone the first existing one and assign default class
            defaultHeaderTemplate = currentHeaderWrappers.filter(`.${this.options.headerContainerClass}:first`)
                                     .clone(true, true)
                                     .attr('class', `${this.options.headerContainerClass} ${this.options.defaultColorClass}`);
          } else {
            defaultHeaderTemplate = currentHeaderWrappers.filter(`.${this.options.defaultColorClass}`);
          }
        } else {
          // If no custom headers, wrap existing content to create the default
          this.element.wrapInner(`<div class="${this.options.headerContainerClass} ${this.options.defaultColorClass}"></div>`);
          defaultHeaderTemplate = this.element.children(`.${this.options.headerContainerClass}`);
          currentHeaderWrappers = defaultHeaderTemplate; // Update current wrappers
        }

        // Now that we have a default template, ensure all needed headers exist
        for (const headerClass in this._activeHeaderElements) {
          if (!this._activeHeaderElements.hasOwnProperty(headerClass)) continue;

          if (!this._activeHeaderElements[headerClass].element) { // If not yet initialized
            let existingCustomHeader = currentHeaderWrappers.filter(`.${headerClass}`);
            if (existingCustomHeader.length) {
              this._activeHeaderElements[headerClass].element = existingCustomHeader;
            } else {
              // Clone the default template for new header classes
              this._activeHeaderElements[headerClass].element = defaultHeaderTemplate.clone(true, true)
                                                                 .removeClass(this.options.defaultColorClass)
                                                                 .addClass(headerClass)
                                                                 .appendTo(this.element);
            }

            const headerResetStyles = {
              position: 'absolute',
              overflow: 'hidden',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            };
            this._activeHeaderElements[headerClass].element.css(headerResetStyles);

            // Apply hardware acceleration if supported
            if (this._cssTransformProperty !== false) {
              this._activeHeaderElements[headerClass].element.css(this._cssTransformProperty, 'translateZ(0)');
            }

            // Create inner clipping mask if it doesn't exist
            if (!this._activeHeaderElements[headerClass].element.find(`> .${this.options.innerContentClass}`).length) {
              this._activeHeaderElements[headerClass].element.wrapInner(`<div class="${this.options.innerContentClass}"></div>`);
            }
            this._activeHeaderElements[headerClass].inner = this._activeHeaderElements[headerClass].element.children(`.${this.options.innerContentClass}`);
            this._activeHeaderElements[headerClass].inner.css(headerResetStyles);

            if (this._cssTransformProperty !== false) {
              this._activeHeaderElements[headerClass].inner.css(this._cssTransformProperty, 'translateZ(0)');
            }

            // Initialize clipping variables
            this._activeHeaderElements[headerClass].origin = ''; // 'top' or 'bottom'
            this._activeHeaderElements[headerClass].clipProgress = 0.0;
          }
        }

        // Hide any header wrappers that are not part of our active set (e.g., old ones)
        currentHeaderWrappers.each(function(){
          const headerElem = localJq(this);
          let isManagedHeader = false;
          for (const hClass in instance._activeHeaderElements) {
            if (instance._activeHeaderElements.hasOwnProperty(hClass) && headerElem.hasClass(hClass)) {
              isManagedHeader = true;
              break;
            }
          }
          // Ensure inner wrapper exists even for unmanaged headers
          if (!headerElem.find(`> .${instance.options.innerContentClass}`).length) {
            headerElem.wrapInner(`<div class="${instance.options.innerContentClass}"></div>`);
          }

          if (isManagedHeader) {
            headerElem.show();
          } else {
            headerElem.hide();
          }
        });
      },

      // Determines which headers should be visible based on scroll position
      _determineActiveHeaders: function(){
        this._scrollPosition = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
        // Clamp scroll position to valid range
        this._scrollPosition = Math.max(this._scrollPosition, 0);
        this._scrollPosition = Math.min(this._scrollPosition, this._pageContentHeight);

        const headerHeight = this._layoutMetrics.containerHeight;
        let effectiveHeaderStart = this._scrollPosition + this._layoutMetrics.containerTop;
        let effectiveHeaderEnd = effectiveHeaderStart + headerHeight;

        // Account for any CSS transforms or top offsets applied to the header element
        if (typeof window.getComputedStyle === 'function') {
          const computedStyle = window.getComputedStyle(this.element[0], null);
          let currentTopOffset = 0.0;
          let currentTransformY = 0.0;

          if (this._cssTransformProperty !== false && typeof computedStyle.transform === 'string') {
            const transformMatrix = (computedStyle.transform).match(/(-?[0-9\.]+)/g);
            if (transformMatrix && transformMatrix.length >= 6 && !isNaN(parseFloat(transformMatrix[5]))) {
              currentTransformY = parseFloat(transformMatrix[5]);
            }
          }
          if (computedStyle.top && computedStyle.top.indexOf('px') >= 0 && !isNaN(parseFloat(computedStyle.top))) {
            currentTopOffset = parseFloat(computedStyle.top);
          }

          effectiveHeaderStart += currentTopOffset + currentTransformY;
          effectiveHeaderEnd += currentTopOffset + currentTransformY;
        }

        // Reset all header states
        for (const hClass in this._activeHeaderElements) {
          if (this._activeHeaderElements.hasOwnProperty(hClass)) {
            this._activeHeaderElements[hClass].origin = ''; // Mark as inactive
            this._activeHeaderElements[hClass].clipProgress = 0.0;
          }
        }

        // Evaluate each section's overlap with the header
        for (let i = 0; i < this._mappedSections.length; i++) {
          const section = this._mappedSections[i];
          const headerData = this._activeHeaderElements[section.colorClass];

          // Check for any overlap
          if (effectiveHeaderEnd >= section.startPos && effectiveHeaderStart <= section.endPos) {
            headerData.isVisible = true; // Mark as potentially visible

            // If header is fully contained within the section
            if (effectiveHeaderStart >= section.startPos && effectiveHeaderEnd <= section.endPos) {
              headerData.origin = 'top';
              headerData.clipProgress = 1.0;
            }
            // If header is exiting the top of the section
            else if (effectiveHeaderEnd > section.endPos && effectiveHeaderStart < section.endPos) {
              headerData.origin = 'top';
              headerData.clipProgress = 1.0 - (effectiveHeaderEnd - section.endPos) / headerHeight;
            }
            // If header is entering the bottom of the section
            else if (effectiveHeaderEnd > section.startPos && effectiveHeaderStart < section.startPos) {
              // If this color is already active from the top (e.g., contiguous sections of same color)
              if (headerData.origin === 'top') {
                headerData.clipProgress += (effectiveHeaderEnd - section.startPos) / headerHeight;
              } else {
                headerData.origin = 'bottom';
                headerData.clipProgress = (effectiveHeaderEnd - section.startPos) / headerHeight;
              }
            }
          }
        }
      },

      // Applies CSS transforms to position the headers based on calculated progress
      _applyHeaderTransforms: function(){
        // Guard clause: ensure default header is initialized
        if (!this._activeHeaderElements[this.options.defaultColorClass]) return;

        let totalActiveProgress = 0.0;
        let lastKnownActiveColor = '';

        // Calculate total progress from active (non-empty origin) headers
        for (const hClass in this._activeHeaderElements) {
          if (this._activeHeaderElements.hasOwnProperty(hClass) && this._activeHeaderElements[hClass].origin !== '') {
            totalActiveProgress += this._activeHeaderElements[hClass].clipProgress;
            lastKnownActiveColor = hClass;
          }
        }

        // If total progress is less than 1 (meaning parts of the header are not covered by any specific section)
        if (totalActiveProgress < 1.0) {
          const defaultHeader = this._activeHeaderElements[this.options.defaultColorClass];
          // Assign remaining progress to the default header
          if (defaultHeader.origin === '') {
            // Determine origin based on the last active header's origin
            defaultHeader.origin = (this._activeHeaderElements[lastKnownActiveColor] && this._activeHeaderElements[lastKnownActiveColor].origin === 'top') ? 'bottom' : 'top';
            defaultHeader.clipProgress = 1.0 - totalActiveProgress;
          } else {
            defaultHeader.clipProgress += 1.0 - totalActiveProgress;
          }
        }

        // Apply transformations for each header
        for (const hClass in this._activeHeaderElements) {
          if (!this._activeHeaderElements.hasOwnProperty(hClass) || this._activeHeaderElements[hClass].origin === '') continue;

          const header = this._activeHeaderElements[hClass];
          let offsetPercentage = (1.0 - header.clipProgress) * 100.0;

          // Add a small buffer to prevent visual artifacts at 0% or 100%
          if (offsetPercentage >= 100.0) { offsetPercentage = 110.0; }
          if (offsetPercentage <= -100.0) { offsetPercentage = -110.0; }

          if (header.origin === 'top') {
            if (this._cssTransformProperty !== false) {
              header.element[0].style[this._cssTransformProperty] = `translateY(-${offsetPercentage}%) translateZ(0)`;
              header.inner[0].style[this._cssTransformProperty] = `translateY(+${offsetPercentage}%) translateZ(0)`;
            } else {
              header.element[0].style.top = `-${offsetPercentage}%`;
              header.inner[0].style.top = `+${offsetPercentage}%`;
            }
          } else { // origin === 'bottom'
            if (this._cssTransformProperty !== false) {
              header.element[0].style[this._cssTransformProperty] = `translateY(+${offsetPercentage}%) translateZ(0)`;
              header.inner[0].style[this._cssTransformProperty] = `translateY(-${offsetPercentage}%) translateZ(0)`;
            } else {
              header.element[0].style.top = `+${offsetPercentage}%`;
              header.inner[0].style.top = `-${offsetPercentage}%`;
            }
          }
        }
      },

      // Updates the cached positions and dimensions of all color-shifting sections
      _refreshSectionBounds: function(){
        this._pageContentHeight = localJq(document).height();
        this._mappedSections = []; // Clear previous data

        for (let i = 0; i < this._jquerySections.length; i++) {
          const sectionJqElement = localJq(this._jquerySections[i]);
          this._mappedSections.push({
            element: sectionJqElement,
            colorClass: sectionJqElement.data('color-shift'),
            startPos: sectionJqElement.offset().top,
            endPos: sectionJqElement.offset().top + sectionJqElement.outerHeight()
          });
        }
      },

      // Adjusts the main header container's height to match the tallest header content
      _adjustHeaderContainerHeight: function(){
        this._layoutMetrics.containerHeight = this._calculateContainerHeight();
        this.element.css('height', `${this._layoutMetrics.containerHeight}px`);
      },

      // Starts the requestAnimationFrame loop for continuous header updates
      _startRenderLoop: function(){
        const instance = this;
        this._getAnimationFrameScheduler()(function(){
          instance._startRenderLoop(); // Recurse for continuous loop
        });

        this._determineActiveHeaders(); // Re-evaluate which headers are active
        this._applyHeaderTransforms(); // Apply visual changes
      },

      // Provides a cross-browser requestAnimationFrame function
      _getAnimationFrameScheduler: function(){
        // Memoize the requestAnimationFrame function
        if (!this._cachedRequestAnimationFrame) {
          this._cachedRequestAnimationFrame = window.requestAnimationFrame ||
                                             window.webkitRequestAnimationFrame ||
                                             window.mozRequestAnimationFrame ||
                                             function(callback){
                                               window.setTimeout(callback, 1000 / 60); // Fallback to setTimeout
                                             };
        }
        return this._cachedRequestAnimationFrame;
      },

      // Custom destroy method for this widget
      _destroy: function() {
        // Clear the periodic section recalibration timeout
        if (this._recalibrationTimeout) {
          clearTimeout(this._recalibrationTimeout);
        }
        // Stop the animation frame loop
        if (this._animationFrameId) {
          cancelAnimationFrame(this._animationFrameId);
        }
        // Remove fixed positioning and height from the main element
        this.element.css({
          position: '',
          top: '',
          left: '',
          right: '',
          overflow: '',
          height: ''
        });
        // Restore original content if it was wrapped
        const defaultHeaderWrapper = this.element.children(`.${this.options.headerContainerClass}.${this.options.defaultColorClass}`);
        if (defaultHeaderWrapper.length && defaultHeaderWrapper.parent().is(this.element)) {
          defaultHeaderWrapper.children(`.${this.options.innerContentClass}`).contents().unwrap().unwrap();
        }

        // Remove all dynamically created headers
        for (const hClass in this._activeHeaderElements) {
          if (this._activeHeaderElements.hasOwnProperty(hClass) && this._activeHeaderElements[hClass].element) {
            // Only remove if it was dynamically created (not part of original markup)
            if (!this._activeHeaderElements[hClass].element.is(this._jquerySections)) { // Simplified check
                this._activeHeaderElements[hClass].element.remove();
            } else {
                // For original headers, just reset styles and remove inner wrapper if added
                this._activeHeaderElements[hClass].element.css({
                    position: '', overflow: '', top: '', left: '', right: '', bottom: ''
                });
                if (this._activeHeaderElements[hClass].inner) {
                    this._activeHeaderElements[hClass].inner.contents().unwrap();
                }
            }
          }
        }
        // Unbind window resize event
        localJq(window).off('resize' + this.eventNamespace);
      }
    });

  })(jQuery)); // Pass jQuery as localJq

});