(function(jQueryRef) {
  "use strict";

  // Check if jQuery is defined; if not, log a message and exit.
  if ('undefined' === typeof jQueryRef) {
    if ('console' in window) {
      window.console.info('Luminaire requires jQuery to function correctly.');
    }
    return;
  }

  /*
   * Luminaire is exposed as jQueryRef.luminaire.
   * It is the primary function used to activate a display element.
   *
   * [Implementation Details]
   * Luminaire utilizes prototype-based inheritance for its architecture.
   * Each active display session is managed by its own object instance.
   * These individual objects can override properties inherited from their prototype.
   * Extensions, created using Luminaire.createExtension, establish their
   * own prototype chain, inheriting from Luminaire's base prototype.
   * This allows for property customization at the object level or the extension level.
   * To implement callback functions that execute sequentially rather than overwriting each other,
   * the linkActionHandlers method should be used.
   * For those familiar with CoffeeScript, this structure is analogous to
   * Luminaire being a base class and a Gallery module extending Luminaire.
   * The linkActionHandlers mechanism is necessary as JavaScript lacks a direct `super` call
   * in the same way CoffeeScript offers.
   */

  function Luminaire(contentData, displayOptions) {
    // If called with 'new', initialize the object.
    if (this instanceof Luminaire) {
      this.uniqueID = Luminaire.instanceCounter++;
      this.initializeDisplay(contentData, displayOptions);
      this.linkActionHandlers(Luminaire._handlerLinkage);
    } else {
      // If called as a function, create an instance and immediately show it.
      var displayInstance = new Luminaire(contentData, displayOptions);
      displayInstance.showDisplay();
      return displayInstance;
    }
  }

  var activeDisplays = [],
    // Function to remove closed displays from the active list.
    filterActive = function(itemToRemove) {
      activeDisplays = jQueryRef.grep(activeDisplays, function(displayObj) {
        // Keep the display if it's not the one being removed and its container is still in the DOM.
        return displayObj !== itemToRemove && displayObj.$elementContainer.closest('body').length > 0;
      });
      return activeDisplays;
    };

  // Helper function to transform an object's keys from camelCase (with a prefix) to dasherized.
  // Example: layoutConfig({frameMinHeight: 44}, 'frame') -> { 'min-height': 44 }
  var layoutConfig = function(sourceObject, keyPrefix) {
    var transformedResult = {},
      keyPattern = new RegExp('^' + keyPrefix + '([A-Z])(.*)');
    for (var currentKey in sourceObject) {
      var keyMatch = currentKey.match(keyPattern);
      if (keyMatch) {
        var dasherizedKey = (keyMatch[1] + keyMatch[2].replace(/([A-Z])/g, '-$1')).toLowerCase();
        transformedResult[dasherizedKey] = sourceObject[currentKey];
      }
    }
    return transformedResult;
  };

  /* Maps specific event types to their corresponding handler methods. */
  var actionLookup = {
    keyUpEvent: 'onKeyRelease',
    windowResized: 'onWindowResize'
  };

  // A global event handler that iterates through active displays in reverse order.
  var universalActionHandler = function(evt) {
    jQueryRef.each(Luminaire.getOpenDisplays().reverse(), function() {
      if (!evt.isDefaultPrevented()) {
        // If the handler returns false, prevent default and stop propagation.
        if (false === this[actionLookup[evt.type]](evt)) {
          evt.preventDefault();
          evt.stopPropagation();
          return false;
        }
      }
    });
  };

  // Toggles the installation of global event handlers on the window.
  var manageGlobalActions = function(shouldSet) {
    if (shouldSet !== Luminaire._globalHandlersActive) {
      Luminaire._globalHandlersActive = shouldSet;
      var eventNames = jQueryRef.map(actionLookup, function(_, name) {
        return name + '.' + Luminaire.prototype.scopeID;
      }).join(' ');
      jQueryRef(window)[shouldSet ? 'on' : 'off'](eventNames, universalActionHandler);
    }
  };

  Luminaire.prototype = {
    constructor: Luminaire,
    /*** Default Configuration Settings ***/
    /* These properties and methods define the base behavior of a Luminaire display. */
    scopeID: 'luminaire', // Used for event namespacing and CSS class prefixes.
    contentSourceAttr: 'data-luminaire-source', // HTML attribute on trigger element for content selector.
    themeStyle: null, // Additional CSS class to apply for theme variations.
    clearStyles: false, // If true, reset default CSS for the display.
    backdropElement: null, // Custom HTML structure for the display's background, wrapper, and close button.
    displayTrigger: 'tap', // Event that causes the display to open.
    dismissTrigger: 'tap', // Event that causes the display to close.
    eventFilter: null, // Selector to filter events, used with jQueryRef.on(event, filter, handler).
    attachPoint: 'body', // The DOM element where the display will be appended.
    fadeInDuration: 250, // Duration of the opening fade-in animation in milliseconds.
    fadeOutDuration: 250, // Duration of the closing fade-out animation in milliseconds.
    dismissOnClick: 'background', // Determines if clicking closes the display ('background', 'anywhere', or false).
    dismissOnEscape: true, // If true, pressing the Escape key closes the display.
    dismissSymbol: '&#10005;', // HTML content for the close icon.
    preloaderContent: '', // Content displayed while the main content is loading.
    alternativeDismiss: null, // Selector for additional elements that can trigger dismissal (e.g., "a.closeBtn").
    onBeforeDisplay: jQueryRef.noop, // Callback before the display opens. Can return false to prevent opening. Receives event.
    onBeforeContentLoad: jQueryRef.noop, // Callback before content is processed. Receives event.
    onBeforeDismiss: jQueryRef.noop, // Callback before the display closes. Can return false to prevent dismissal. Receives event.
    onAfterDisplay: jQueryRef.noop, // Callback after the display has opened and animations complete. Receives event.
    onAfterContentLoad: jQueryRef.noop, // Callback after content has been loaded and placed. Receives event.
    onAfterDismiss: jQueryRef.noop, // Callback after the display has closed and animations complete. Receives event.
    onKeyRelease: jQueryRef.noop, // Callback for key up events, specific to the topmost active display.
    onWindowResize: jQueryRef.noop, // Callback triggered after new content is set and when the window resizes.
    contentType: null, // Explicitly specifies the content type. If null, it's auto-detected.
    displayContentProcessors: ['jquery', 'image', 'html', 'ajax', 'iframe', 'text'], // Ordered list of content processing filters to try.

    /*** Core Methods ***/
    /* initializeDisplay prepares a new luminaire instance, setting up its DOM and event listeners. */
    initializeDisplay: function(targetElement, optionsObj) {
      /* All parameters are optional. Handle flexible argument passing. */
      if (typeof targetElement === 'object' && targetElement instanceof jQueryRef === false && !optionsObj) {
        optionsObj = targetElement;
        targetElement = undefined;
      }

      var currentInstance = jQueryRef.extend(this, optionsObj, {
          target: targetElement
        }),
        // Determine the appropriate CSS class for the display.
        cssClass = !currentInstance.clearStyles ? currentInstance.scopeID : currentInstance.scopeID + '-reset',
        // Construct the initial HTML structure for the backdrop and content area.
        $initialBackdrop = jQueryRef(currentInstance.backdropElement || [
          '<div class="' + cssClass + '-preloading ' + cssClass + '">',
          '<div class="' + cssClass + '-area">',
          '<span class="' + currentInstance.scopeID + '-dismiss-icon ' + currentInstance.scopeID + '-close">',
          currentInstance.dismissSymbol,
          '</span>',
          '<div class="' + currentInstance.scopeID + '-body">' + currentInstance.preloaderContent + '</div>',
          '</div>',
          '</div>'
        ].join('')),
        // Combined selector for all elements that can trigger dismissal.
        dismissButtonSelector = '.' + currentInstance.scopeID + '-close' + (currentInstance.alternativeDismiss ? ',' + currentInstance.alternativeDismiss : '');

      // Clone the initial DOM to create the instance's unique container and apply any theme styles.
      currentInstance.$elementContainer = $initialBackdrop.clone().addClass(currentInstance.themeStyle);

      /* Bind event handlers for closing the display based on click behavior. */
      currentInstance.$elementContainer.on(currentInstance.dismissTrigger + '.' + currentInstance.scopeID, function(evt) {
        var $clickedElement = jQueryRef(evt.target);
        if (('background' === currentInstance.dismissOnClick && $clickedElement.is('.' + currentInstance.scopeID)) ||
          'anywhere' === currentInstance.dismissOnClick ||
          $clickedElement.closest(dismissButtonSelector).length) {
          evt.preventDefault();
          currentInstance.hideDisplay();
        }
      });

      return this;
    },

    /* This method retrieves the content for the display, converting it to a jQuery object or a Promise. */
    retrieveContent: function() {
      var currentInstance = this,
        processors = this.constructor.displayContentProcessors,
        // Helper function to read a specific attribute from the current trigger element.
        readTargetAttribute = function(attrName) {
          return currentInstance.$currentTrigger && currentInstance.$currentTrigger.attr(attrName);
        },
        // Determine the raw content input from various sources.
        sourceValue = readTargetAttribute(currentInstance.contentSourceAttr),
        contentInput = currentInstance.target || sourceValue || '';

      /* First, check for an explicit content type specified in the configuration. */
      var selectedProcessor = processors[currentInstance.contentType];

      /* Next, check if the content input itself specifies a known processor (e.g., data-luminaire-source="image"). */
      if (!selectedProcessor && contentInput in processors) {
        selectedProcessor = processors[contentInput];
        contentInput = currentInstance.target && sourceValue; // Re-evaluate content input if type was derived from it.
      }
      contentInput = contentInput || readTargetAttribute('href') || ''; // Fallback to the href attribute.

      /* Then, check for content specified directly as a property in the configuration (e.g., {image: 'path/to/img.jpg'}). */
      if (!selectedProcessor) {
        for (var processorName in processors) {
          if (currentInstance[processorName]) {
            selectedProcessor = processors[processorName];
            contentInput = currentInstance[processorName];
            break; // Found a matching processor, stop checking.
          }
        }
      }

      /* If no explicit processor is found, attempt to implicitly detect the content type. */
      if (!selectedProcessor) {
        var originalInput = contentInput;
        contentInput = null; // Reset contentInput to find a new value.
        jQueryRef.each(currentInstance.displayContentProcessors, function() {
          selectedProcessor = processors[this];
          if (selectedProcessor.test) { // Check if the processor has a specific test function.
            contentInput = selectedProcessor.test(originalInput);
          }
          // If content still not found, check against a regex pattern if provided.
          if (!contentInput && selectedProcessor.regex && originalInput.match && originalInput.match(selectedProcessor.regex)) {
            contentInput = originalInput;
          }
          return !contentInput; // Stop iterating once content is successfully identified.
        });
        if (!contentInput) {
          if ('console' in window) {
            window.console.error('Luminaire: No suitable content processor found ' + (originalInput ? ' for "' + originalInput + '"' : ' (no content source specified)'));
          }
          return false; // Indicate failure to retrieve content.
        }
      }
      /* Finally, process the identified content using the selected processor. */
      return selectedProcessor.process.call(currentInstance, contentInput);
    },

    /* applyContent inserts the provided jQuery content into the display's main area. */
    applyContent: function($newContent) {
      var currentInstance = this;
      /* Add a specific class if the content contains an iframe. */
      if ($newContent.is('iframe') || jQueryRef('iframe', $newContent).length > 0) {
        currentInstance.$elementContainer.addClass(currentInstance.scopeID + '-frame');
      }

      currentInstance.$elementContainer.removeClass(currentInstance.scopeID + '-preloading');

      /* Replace the existing content within the luminaire-body.
         We append the new content before removing the old to maintain relative positioning
         if other elements are added to the luminaire-area. */
      currentInstance.$elementContainer.find('.' + currentInstance.scopeID + '-body')
        .slice(1).remove().end() // Remove any additional .luminaire-body elements beyond the first.
        .replaceWith(jQueryRef.contains(currentInstance.$elementContainer[0], $newContent[0]) ? '' : $newContent);

      currentInstance.$contentHolder = $newContent.addClass(currentInstance.scopeID + '-body');

      return currentInstance;
    },

    /* showDisplay makes the display visible. 'this' refers to the Luminaire instance.
       Returns a Promise that resolves when the display is successfully opened. */
    showDisplay: function(triggerEvent) {
      var currentInstance = this;
      currentInstance.$elementContainer.hide().appendTo(currentInstance.attachPoint);
      if ((!triggerEvent || !triggerEvent.isDefaultPrevented()) &&
        currentInstance.onBeforeDisplay(triggerEvent) !== false) {

        if (triggerEvent) {
          triggerEvent.preventDefault();
        }
        var $retrievedContent = currentInstance.retrieveContent();

        if ($retrievedContent) {
          activeDisplays.push(currentInstance); // Add to the list of active displays.

          manageGlobalActions(true); // Enable global event handlers.

          currentInstance.$elementContainer.fadeIn(currentInstance.fadeInDuration);
          currentInstance.onBeforeContentLoad(triggerEvent);

          /* Resolve the content promise, then apply content and trigger callbacks. */
          return jQueryRef.when($retrievedContent)
            .always(function($finalContent) {
              currentInstance.applyContent($finalContent);
              currentInstance.onAfterContentLoad(triggerEvent);
            })
            .then(currentInstance.$elementContainer.promise())
            /* Call onAfterDisplay once the fade-in animation is complete. */
            .done(function() {
              currentInstance.onAfterDisplay(triggerEvent);
            });
        }
      }
      currentInstance.$elementContainer.detach(); // Remove the element if opening failed.
      return jQueryRef.Deferred().reject().promise(); // Return a rejected promise if display failed to open.
    },

    /* hideDisplay closes the display. 'this' refers to the Luminaire instance.
       Returns a Promise that resolves when the display is successfully closed. */
    hideDisplay: function(triggerEvent) {
      var currentInstance = this,
        dismissPromise = jQueryRef.Deferred();

      if (currentInstance.onBeforeDismiss(triggerEvent) === false) {
        dismissPromise.reject(); // Prevent closing if the callback returns false.
      } else {

        // If no other Luminaire displays are active, disable global event handlers.
        if (0 === filterActive(currentInstance).length) {
          manageGlobalActions(false);
        }

        currentInstance.$elementContainer.fadeOut(currentInstance.fadeOutDuration, function() {
          currentInstance.$elementContainer.detach(); // Remove the display element from the DOM.
          currentInstance.onAfterDismiss(triggerEvent);
          dismissPromise.resolve(); // Resolve the promise upon successful closing.
        });
      }
      return dismissPromise.promise();
    },

    /* Utility function to chain multiple callback functions.
       [Advanced Usage]
       This is used by extensions that need to insert their own logic into callbacks
       while still allowing users to define their own.
       The 'handlerChain' argument is an object where keys are callback names
       and values are functions with (superFunc, eventObj) parameters.
       The function is expected to call `superFunc` to invoke the next handler in the chain.
    */
    linkActionHandlers: function(handlerChain) {
      for (var handlerName in handlerChain) {
        this[handlerName] = jQueryRef.proxy(handlerChain[handlerName], this, jQueryRef.proxy(this[handlerName], this));
      }
    }
  };

  jQueryRef.extend(Luminaire, {
    instanceCounter: 0, // Counter to assign unique IDs to each Luminaire instance.
    autoAttachSelector: '[data-luminaire-source]', // Selector for elements that should automatically trigger a display.
    defaultSettings: Luminaire.prototype, // A reference to the prototype for easy access to defaults.
    /* Defines the various content processors used to handle different types of content. */
    displayContentProcessors: {
      jquery: {
        regex: /^[#.]\w/, // Matches selectors for IDs or classes.
        test: function(element) {
          return element instanceof jQueryRef && element;
        },
        process: function(element) {
          return jQueryRef(element).clone(true);
        }
      },
      image: {
        regex: /\.(png|jpg|jpeg|gif|tiff|bmp)(\?\S*)?$/i, // Matches common image file extensions.
        process: function(imageUrl) {
          var currentInstance = this,
            imageLoadPromise = jQueryRef.Deferred(),
            tempImage = new Image(),
            $imageElement = jQueryRef('<img src="' + imageUrl + '" alt="" class="' + currentInstance.scopeID + '-image" />');
          tempImage.onload = function() {
            /* Store natural width and height for compatibility (e.g., IE8). */
            $imageElement.naturalWidth = tempImage.width;
            $imageElement.naturalHeight = tempImage.height;
            imageLoadPromise.resolve($imageElement);
          };
          tempImage.onerror = function() {
            imageLoadPromise.reject($imageElement);
          };
          tempImage.src = imageUrl; // Start loading the image.
          return imageLoadPromise.promise();
        }
      },
      html: {
        regex: /^\s*<[\w!][^<]*>/, // Matches strings that look like HTML tags.
        process: function(htmlString) {
          return jQueryRef(htmlString);
        }
      },
      ajax: {
        regex: /./, // Catches any remaining content, assuming it's a URL for AJAX.
        process: function(urlAddress) {
          var currentInstance = this,
            ajaxPromise = jQueryRef.Deferred();
          /* Using jQueryRef.load() allows specifying a target within the URL (e.g., 'page.html #section'). */
          var $contentContainer = jQueryRef('<div></div>').load(urlAddress, function(response, status) {
            if (status !== "error") {
              ajaxPromise.resolve($contentContainer.contents());
            } else {
              ajaxPromise.fail(); // Reject the promise on AJAX error.
            }
          });
          return ajaxPromise.promise();
        }
      },
      iframe: {
        process: function(urlAddress) {
          var iframePromise = new jQueryRef.Deferred();
          var $iframeElement = jQueryRef('<iframe/>')
            .hide()
            .attr('src', urlAddress)
            .css(layoutConfig(this, 'iframe')) // Apply iframe-specific styles based on config.
            .on('load', function() {
              iframePromise.resolve($iframeElement.show());
            })
            // Since moving an iframe can cause a reload, we append it directly
            // into its final position within the display's content area.
            .appendTo(this.$elementContainer.find('.' + this.scopeID + '-area'));
          return iframePromise.promise();
        }
      },
      text: {
        process: function(plainText) {
          return jQueryRef('<div>', {
            text: plainText
          });
        }
      }
    },

    callableOptions: ['onBeforeDisplay', 'onAfterDisplay', 'onBeforeContentLoad', 'onAfterContentLoad', 'onBeforeDismiss', 'onAfterDismiss'],

    /*** Class-level Methods ***/
    /* parseElementOptions reads an element's data attributes that start with 'data-luminaire-'. */
    parseElementOptions: function(domElement, elementScope) {
      var CurrentClass = this,
        attributePattern = new RegExp('^data-' + elementScope + '-(.*)'),
        parsedConfig = {};
      if (domElement && domElement.attributes) {
        jQueryRef.each(domElement.attributes, function() {
          var attrMatch = this.name.match(attributePattern);
          if (attrMatch) {
            var attributeValue = this.value,
              propertyName = jQueryRef.camelCase(attrMatch[1]);
            if (jQueryRef.inArray(propertyName, CurrentClass.callableOptions) >= 0) {
              /* jshint -W054 */
              attributeValue = new Function(attributeValue); /* jshint +W054 */ // Evaluate string as a function.
            } else {
              try {
                attributeValue = jQueryRef.parseJSON(attributeValue); // Attempt to parse as JSON.
              } catch (e) {
                // If not valid JSON, keep the original string value.
              }
            }
            parsedConfig[propertyName] = attributeValue;
          }
        });
      }
      return parsedConfig;
    },

    /* Used to create a new Luminaire extension class.
       [Advanced Usage]
       This method sets up the prototype chain for the child class,
       making it inherit from Luminaire's prototype.
       It can also be used to extend an existing extension.
       This is an advanced inheritance pattern, largely inspired by CoffeeScript,
       and is not unique to Luminaire.
       It's recommended to have a strong understanding of JavaScript prototypes before using.
    */
    createExtension: function(childClass, extensionDefaults) {
      /* Establish the class hierarchy, adapted from CoffeeScript's implementation. */
      var ConstructorBridge = function() {
        this.constructor = childClass;
      };
      ConstructorBridge.prototype = this.prototype;
      childClass.prototype = new ConstructorBridge();
      childClass.__super__ = this.prototype; // Reference to the parent prototype.
      /* Copy static methods and properties from the parent to the child class. */
      jQueryRef.extend(childClass, this, extensionDefaults);
      childClass.defaultSettings = childClass.prototype; // Provide a defaultSettings alias for the child.
      return childClass;
    },

    bindToElements: function($sourceElements, displayContent, specificOptions) {
      var CurrentClass = this;
      // Handle flexible argument passing for displayContent and specificOptions.
      if (typeof displayContent === 'object' && displayContent instanceof jQueryRef === false && !specificOptions) {
        specificOptions = displayContent;
        displayContent = undefined;
      }
      /* Create a shallow copy of options to prevent unintended modifications. */
      specificOptions = jQueryRef.extend({}, specificOptions);

      /* Initially, we only need scopeID and displayTrigger from the configuration. */
      var currentScopeID = specificOptions.scopeID || CurrentClass.defaultSettings.scopeID,
        temporaryConfig = jQueryRef.extend({}, CurrentClass.defaultSettings, CurrentClass.parseElementOptions($sourceElements[0], currentScopeID), specificOptions);

      $sourceElements.on(temporaryConfig.displayTrigger + '.' + temporaryConfig.scopeID, temporaryConfig.eventFilter, function(evt) {
        /* The full configuration is computed at the time of the event on the actual trigger element. */
        var elementConfiguration = jQueryRef.extend(
          {
            $source: $sourceElements,
            $currentTrigger: jQueryRef(this)
          },
          CurrentClass.parseElementOptions($sourceElements[0], temporaryConfig.scopeID),
          CurrentClass.parseElementOptions(this, temporaryConfig.scopeID),
          specificOptions
        );
        new CurrentClass(displayContent, elementConfiguration).showDisplay(evt);
      });
      return $sourceElements;
    },

    getCurrentDisplay: function() {
      var allActive = this.getOpenDisplays();
      return allActive[allActive.length - 1] || null; // Return the topmost active display.
    },

    getOpenDisplays: function() {
      var activeKlass = this;
      filterActive(); // Clean up any displays that have closed without being removed.
      return jQueryRef.grep(activeDisplays, function(displayObj) {
        return displayObj instanceof activeKlass; // Filter by instances of the current class.
      });
    },

    closeCurrent: function() {
      var activeDisplay = this.getCurrentDisplay();
      if (activeDisplay) {
        return activeDisplay.hideDisplay();
      }
    },

    /* Handles the automatic binding of elements when the DOM is ready.
       This method is intended for internal use by Luminaire and its extensions only.
    */
    _initAutoBinding: function() {
      var CurrentClass = this;
      if (CurrentClass.autoAttachSelector) {
        /* First, bind a delegated event to the document. This supports dynamically added elements. */
        CurrentClass.bindToElements(jQueryRef(document), {
          eventFilter: CurrentClass.autoAttachSelector
        });
        /* Elements with a 'data-luminaire-event-filter' attribute cannot use the delegated document binding
           (as the filter would be used twice). These elements must be bound directly.
           Dynamically added elements with specific filters are not easily supported by this mechanism. */
        jQueryRef(CurrentClass.autoAttachSelector).filter('[data-luminaire-event-filter]').each(function() {
          CurrentClass.bindToElements(jQueryRef(this));
        });
      }
    },

    /* Luminaire uses the onKeyRelease callback to intercept the escape key.
       This is a private, internal method.
    */
    _handlerLinkage: {
      onKeyRelease: function(superCallback, keyEvent) {
        if (27 === keyEvent.keyCode) { // Check if the Escape key (keyCode 27) was pressed.
          if (this.dismissOnEscape) {
            this.$elementContainer.find('.' + this.scopeID + '-close:first').tap(); // Simulate a click on the primary close button.
          }
          return false; // Prevent any default browser action for the Escape key.
        } else {
          return superCallback(keyEvent); // Pass the event to the next handler in the chain.
        }
      },

      onWindowResize: function(superCallback, resizeEvent) {
        if (this.$contentHolder.naturalWidth) {
          var contentWidth = this.$contentHolder.naturalWidth,
            contentHeight = this.$contentHolder.naturalHeight;
          /* Reset the apparent image size first to allow the container to adjust its dimensions correctly. */
          this.$contentHolder.css('width', '').css('height', '');
          // ... (additional resize logic would follow here)
        }
        return superCallback(resizeEvent); // Pass the event to the next handler in the chain.
      }
    }
  });

  // Attach Luminaire as a plugin to the jQuery object.
  jQueryRef.luminaire = Luminaire;

  // Initialize auto-binding when the DOM is fully loaded.
  jQueryRef(document).ready(function() {
    jQueryRef.luminaire._initAutoBinding();
  });

})(jQuery);