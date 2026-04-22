;(function ( $, globalScope, void0 ) { // Self-executing anonymous function to encapsulate the module

  // Declare module-specific constants and default settings
  var moduleIdentifier = 'assetManager', // Unique identifier for our asset management module
      domRoot = globalScope.document, // Reference to the global document object
      standardSettings = { // Default configuration options for the loader
        sourceAttribute: 'data-source', // Attribute name to fetch the image URL from
        concealIfMissing: !false, // Flag to hide elements if no source attribute is found
        onItemLoaded: void0, // Callback function to execute after each item is processed
        onAllLoaded: void0 // Callback function to execute once all items have been handled
      };

  /**
   * Constructor for the ResourceLoader module.
   * Initializes the loading process for a collection of elements.
   * @param {HTMLElement|jQuery} targetElements - The DOM elements to process.
   * @param {Object} configuration - Custom settings to override defaults.
   */
  function ResourceLoader( targetElements, configuration ) {
    // Store a reference to the current instance for use within closures
    var instanceRef = this;

    // Merge provided configuration with standard default settings
    this.configuration = $.extend( {}, standardSettings, configuration ) ;

    // Filter the initial set of elements:
    // Only include elements that have the specified source attribute.
    // If an element lacks the source and 'concealIfMissing' is true, hide it.
    this.targetElements = $(targetElements) .map( function( indexVal ) {
      // Check if the current element possesses the required data attribute
      if ( $(this).data( instanceRef.configuration.sourceAttribute ) ) {

        return this; // Keep this element for processing

      } else {

        // If the element does not have the data attribute
        if ( instanceRef.configuration.concealIfMissing ) {

          $(this).hide(); // Hide the element as per configuration

        }

      }

    });

    // Store references to the initial defaults and the module's name
    this._baseConfiguration = standardSettings;
    this._moduleName = moduleIdentifier;

    // Begin the initialization process
    this.initializeLoader();

  } // End of ResourceLoader constructor

  /**
   * Prototype method to kick off the asset loading process.
   * Iterates through target elements, creates new image objects, and handles their loading.
   */
  ResourceLoader.prototype.initializeLoader = function () {
    var instanceRef  = this, // Another self-reference for internal method scope
        processedItems = []; // Array to keep track of items that have finished loading

    // Iterate over each target element identified earlier
    $.each( $(this.targetElements), function( indexVal, currentDomElement ) {

      // Create a new detached image element
      var newImageElement = $(domRoot.createElement('img')),
          // Retrieve the image source path from the element's data attribute
          imageSourcePath  = $(currentDomElement).data( instanceRef.configuration.sourceAttribute );

      // Set the 'src' attribute for the new image and attach event listeners for load/error
      newImageElement.attr('src', imageSourcePath) .on( 'contentLoaded contentFailed', function( eventDetails ) {

        // Add the current DOM element to the list of processed items
        processedItems.push( currentDomElement );

        // Store the loading status (success/failure) directly on the element's data
        $.data( currentDomElement, 'loadStatus', (eventDetails.type === 'contentFailed') ? false : !false );

        // If a per-item callback is defined, invoke it
        if ( instanceRef.configuration.onItemLoaded instanceof Function ) {

          instanceRef.configuration.onItemLoaded.call( newImageElement[0] );

        }

        // Check if all items have been processed and an 'onAllLoaded' callback is defined
        if ( processedItems.length >= instanceRef.targetElements.length && instanceRef.configuration.onAllLoaded instanceof Function ) {

          instanceRef.configuration.onAllLoaded.call( processedItems ); // Execute the global completion callback

        }

        // Detach the event handlers to prevent memory leaks and redundant calls
        $(this).off( 'contentLoaded contentFailed' );

        // Replace the original DOM element with the newly loaded image
        instanceRef.swapHtmlElement( currentDomElement, newImageElement );

      }); // End of load/error event handler

    }); // End of $.each loop

    /**
     * Prototype method to replace an old element with a new image element.
     * Copies all attributes from the original element to the new image, except for the source attribute.
     * @param {HTMLElement} oldElement - The original DOM element to be replaced.
     * @param {jQuery} newElement - The new jQuery-wrapped image element.
     */
    ResourceLoader.prototype.swapHtmlElement = function( oldElement, newElement ) {
      var instanceRef      = this, // Self-reference for the method's scope
          elementAttributes = $(oldElement).prop('attributes'); // Get all attributes of the original element

      // Iterate through each attribute of the original element
      $.each( elementAttributes, function() {

        // Exclude the 'src' attribute as it's already handled or not relevant for copying
        if ( this.name !== 'data-source' ) {

            newElement.attr( this.name, this.value ); // Copy the attribute to the new image element

        }

      });

      $(oldElement).replaceWith( newElement ); // Perform the actual DOM replacement

    }; // End of swapHtmlElement method

  }; // End of initializeLoader method

  /**
   * jQuery plugin registration.
   * Makes the ResourceLoader accessible via jQuery's $.fn namespace.
   * Ensures only one instance of the loader is created per element collection.
   * @param {Object} configuration - Optional settings for the loader.
   */
  $.fn[moduleIdentifier] = function ( configuration ) {
      // Check if an instance of this loader already exists for the current element(s)
      if ( !$.data(this, 'loader_instance_' + moduleIdentifier) ) {
        // If not, create a new instance and store it in jQuery's data cache
        $.data(this, 'loader_instance_' + moduleIdentifier, new ResourceLoader( this, configuration ));
      }
  };

}(jQuery, window)); // End of IIFE, passing jQuery and window objects