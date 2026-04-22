;(function ( jQueryAlias, windowContext, undefined ) {

  // Define the unique identifier for this module and a reference to the document object.
  var moduleIdentifier = 'assetLoader',
      pageDocument = windowContext.document,
      baseConfiguration = { // Renamed defaults to baseConfiguration, added new option
        contentSourceAttribute: 'data-image-source', // Renamed data, changed default value to be more specific
        pruneIfNoSource: true, // Renamed hideIfNoData
        onEachAssetProcessed: null, // Renamed each
        onAllAssetsCompleted: null, // Renamed all
        enableVerboseLogging: false // New configuration option added (Type III)
      };

  /**
   * @class AssetProcessor
   * @param {HTMLElement|jQuery} initialElements - The DOM element(s) targeted for asset loading.
   * @param {object} customOptions - Optional configuration overrides from the user.
   * @description A robust module for asynchronously loading assets (primarily images) and replacing placeholders.
   */
  function AssetProcessor( initialElements, customOptions ) {
    var selfReference = this; // Renamed _this to selfReference for clarity

    // Combine default settings with any user-provided options.
    this.currentSettings = jQueryAlias.extend( {}, baseConfiguration, customOptions ); // Renamed options to currentSettings

    // Guard clause: Ensure valid elements are provided (Type III addition)
    if (!initialElements || (initialElements.length === 0 && !initialElements.nodeType)) {
        if (this.currentSettings.enableVerboseLogging) {
            console.warn('AssetLoader: No valid DOM elements supplied for processing.');
        }
        this.targetNodes = jQueryAlias(); // Initialize an empty jQuery collection
        return; // Exit constructor early
    }

    // Filter the input elements: only keep those with the specified content source attribute.
    // If an element lacks the attribute and 'pruneIfNoSource' is true, it's hidden.
    this.targetNodes = jQueryAlias(initialElements).filter(function() { // Renamed element to targetNodes; changed map to filter
      var currentDOMNode = jQueryAlias(this); // Renamed 'this' inside callback

      if (currentDOMNode.attr( selfReference.currentSettings.contentSourceAttribute ) ) { // Using .attr() for data-* attributes
        return true; // Include this element in the processing set
      } else {
        if (selfReference.currentSettings.pruneIfNoSource) { // Renamed hideIfNoData
          currentDOMNode.hide(); // Conceal the element if no source is found and configured to do so
        }
        return false; // Exclude this element from further processing
      }
    });

    // Store internal metadata for the plugin instance.
    this._defaultSettings = baseConfiguration; // Renamed _defaults
    this._moduleName = moduleIdentifier; // Renamed _name

    // Initiate the asset loading sequence.
    this.beginProcessing(); // Renamed init
  }

  // --- Prototype Methods for AssetProcessor ---

  /**
   * @method beginProcessing
   * @memberof AssetProcessor.prototype
   * @description Orchestrates the loading of assets for all designated target elements.
   */
  AssetProcessor.prototype.beginProcessing = function () { // Renamed init
    var selfReference = this, // Renamed _this
        successfullyLoadedAssets = [], // Renamed done
        totalAssetsToProcess = this.targetNodes.length, // Type III: Added a dedicated counter
        assetsCurrentlyCompleted = 0; // Type III: Added a counter for completed items

    // Edge case: If no elements remain after filtering, trigger the 'all' callback immediately. (Type III addition)
    if (totalAssetsToProcess === 0) {
        if (selfReference.currentSettings.enableVerboseLogging) {
            console.info('AssetLoader: No elements with a valid content source were found to process after filtering.');
        }
        selfReference.invokeAllCallback(successfullyLoadedAssets); // Use helper method
        return;
    }

    // Iterate through each filtered element to start its individual asset loading.
    jQueryAlias.each( this.targetNodes, function( loopIndex, currentElementNode ) { // Renamed i to loopIndex, elem to currentElementNode
      var newAssetImage = jQueryAlias('<img />'), // Renamed $img
          assetResourceLocation = jQueryAlias(currentElementNode).attr( selfReference.currentSettings.contentSourceAttribute ); // Renamed src, using .attr()

      // Pre-check for a valid resource location (Type III addition)
      if (!assetResourceLocation) {
          if (selfReference.currentSettings.enableVerboseLogging) {
              console.warn('AssetLoader: Skipping element as its content source attribute was empty or missing:', currentElementNode);
          }
          assetsCurrentlyCompleted++; // Count this as a completed (skipped) item
          if (assetsCurrentlyCompleted >= totalAssetsToProcess) {
              selfReference.invokeAllCallback(successfullyLoadedAssets);
          }
          return; // Move to the next element
      }

      // Define a unified event handler for both load and error events. (Type III: Using a named function)
      var handleAssetLoadingEvent = function( eventDetails ) { // Renamed e to eventDetails
        var loadWasSuccessful = (eventDetails.type === 'load'); // Check event type

        // Persist the loading status directly on the original element's jQuery data.
        jQueryAlias.data(currentElementNode, 'assetLoadStatus', loadWasSuccessful); // Renamed 'done' to 'assetLoadStatus'

        if (loadWasSuccessful) {
            successfullyLoadedAssets.push(currentElementNode); // Only add to success array if loaded without error
        }

        // Increment the overall completion counter.
        assetsCurrentlyCompleted++;

        // Trigger the 'onEachAssetProcessed' callback if it's a valid function.
        if (selfReference.currentSettings.onEachAssetProcessed instanceof Function) { // Renamed each
          try { // Type III: Added try-catch for callback robustness
              // Pass the newly created image, the original element, and success status to the callback.
              selfReference.currentSettings.onEachAssetProcessed.call( newAssetImage[0], currentElementNode, loadWasSuccessful ); // Type III: Added more arguments to callback
          } catch (err) {
              if (selfReference.currentSettings.enableVerboseLogging) {
                  console.error('AssetLoader: Error executing onEachAssetProcessed callback:', err);
              }
          }
        }

        // After processing, check if all assets have finished loading (or skipping).
        if (assetsCurrentlyCompleted >= totalAssetsToProcess) {
          selfReference.invokeAllCallback(successfullyLoadedAssets); // Type III: Extracted into a helper method
        }

        // Detach event handlers to prevent memory leaks and redundant calls.
        jQueryAlias(this).off('load error', handleAssetLoadingEvent); // Use named function for off

        // Only replace the original element if the asset loaded successfully. (Type III update)
        if (loadWasSuccessful) {
            selfReference.updateDOMNode(currentElementNode, newAssetImage); // Renamed replace
        } else {
            if (selfReference.currentSettings.enableVerboseLogging) {
                console.warn('AssetLoader: Failed to load asset from:', assetResourceLocation, 'for element:', currentElementNode);
            }
            // If load failed, the original element remains, potentially allowing for fallback display.
        }
      };

      // Set the image source and attach the combined load/error event handler.
      newAssetImage.attr('src', assetResourceLocation).on('load error', handleAssetLoadingEvent);
    });
  };

  /**
   * @method updateDOMNode
   * @memberof AssetProcessor.prototype
   * @param {HTMLElement} originalDOMElement - The placeholder element to be replaced.
   * @param {jQuery} newImageElementWrapper - The jQuery-wrapped new image element.
   * @description Swaps the original element in the DOM with the newly loaded image, preserving relevant attributes.
   */
  AssetProcessor.prototype.updateDOMNode = function( originalDOMElement, newImageElementWrapper ) { // Renamed replace, elem to originalDOMElement, $img to newImageElementWrapper
    var selfReference = this; // Renamed _this
    // Retrieve all attributes from the original element using native DOM property for efficiency. (Type III optimization)
    var elementAttributes = originalDOMElement.attributes; // Renamed attributes

    // Transfer non-source-related attributes from the original element to the new image.
    jQueryAlias.each( elementAttributes, function( attributeIndex, currentAttribute ) { // Renamed this to currentAttribute
      // Exclude 'src' and the custom 'data-image-source' as they are specific to this process. (Type III update)
      if ( currentAttribute.name !== 'src' && currentAttribute.name !== selfReference.currentSettings.contentSourceAttribute ) {
          newImageElementWrapper.attr( currentAttribute.name, currentAttribute.value );
      }
    });

    // Perform the actual DOM replacement.
    jQueryAlias(originalDOMElement).replaceWith( newImageElementWrapper );
  };

  /**
   * @method invokeAllCallback
   * @memberof AssetProcessor.prototype
   * @param {Array} successfullyLoadedElements - A collection of elements that successfully loaded their assets.
   * @description A helper method to safely call the 'onAllAssetsCompleted' callback. (Type III addition)
   */
  AssetProcessor.prototype.invokeAllCallback = function( successfullyLoadedElements ) {
      var selfReference = this;
      if (selfReference.currentSettings.onAllAssetsCompleted instanceof Function) {
          // Introduce a micro-delay to ensure the callback is asynchronous and doesn't block the current execution flow. (Type III addition)
          setTimeout(function() {
              try {
                  // Execute the callback, passing the array of successfully loaded elements as its context.
                  selfReference.currentSettings.onAllAssetsCompleted.call(successfullyLoadedElements);
              } catch (err) {
                  if (selfReference.currentSettings.enableVerboseLogging) {
                      console.error('AssetLoader: Error during onAllAssetsCompleted callback execution:', err);
                  }
              }
          }, 0); // Zero-delay setTimeout defers execution to the end of the current event loop turn.
      }
  };

  // --- jQuery Plugin Integration ---

  // Extend the jQuery prototype to make our AssetProcessor available as a plugin.
  // This method ensures the plugin is instantiated correctly and supports chainability.
  jQueryAlias.fn[moduleIdentifier] = function ( userOptions ) { // Renamed pluginName, options
      var selectedElements = this; // Cache the jQuery selection for iteration (Type III addition)
      var pluginInstanceKey = 'jqueryPlugin_' + moduleIdentifier; // Renamed plugin_' prefix

      // Iterate over each element in the jQuery collection to apply the plugin individually.
      // This allows for separate instances per element if desired, or re-use existing ones.
      return selectedElements.each(function() { // Ensures plugin works correctly on collections and is chainable (Type III update)
          var currentDOMElement = jQueryAlias(this);
          var existingPluginInstance = currentDOMElement.data(pluginInstanceKey);

          if (!existingPluginInstance) {
              // If no instance exists for this specific element, create a new one.
              currentDOMElement.data(pluginInstanceKey, new AssetProcessor( this, userOptions ));
          } else {
              // If an instance already exists, log a message (if debugging is enabled)
              // or potentially update its settings without re-initializing the entire plugin. (Type III update)
              if (existingPluginInstance.currentSettings.enableVerboseLogging) {
                  console.info('AssetLoader: Instance already active for this element. Skipping re-initialization.', this);
              }
              // An optional enhancement could be to expose a public 'update' method:
              // existingPluginInstance.updateSettings(userOptions);
          }
      });
  };

}(jQuery, window)); // Pass jQuery and window as explicit arguments to the IIFE.