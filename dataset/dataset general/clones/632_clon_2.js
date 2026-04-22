// HierarchyDisplay by dev-user <dev@example.org>, MIT License

( function( $lib ) {

  /*
   * This object holds the initial setup parameters for the display component.
   */
  var initialConfiguration = {

    dataFetcher : function() {
      return window.console.warn("No data fetcher provided; please implement one.");
    },

    emptyContentMessage : "No items found for this selection.",
    inputPromptText : "Filter items...",

    isSearchEnabled : false,

    userDefinedIconMap : {},
    userDefinedActionMap : {}
  };

  /*
   * This object contains the default processing functions for different item types.
   */
  var initialProcessor = {

    directory : function( componentInstance, currentElement, payloadObject ) {
      componentInstance.dataFetcher( payloadObject.uniqueId, function( errorObject, retrievedData ) {
        if ( errorObject ) {
          return $lib.error( errorObject );
        }

        return componentInstance.viewManager._appendContentSegment( retrievedData, componentInstance.viewManager );
      });
    },

    webLink : function( componentInstance, currentElement, payloadObject ) {
      return window.open( payloadObject.webAddress );
    }
  };

  /*
   * This object defines the default icons associated with different item types.
   */
  var initialIconSet = {
    directory : "icon-arrow-right-circle",
    webLink : "icon-external-link"
  };

  /*
   * This collection of functions forms the core logic of the hierarchy display.
   */
  var componentFunctions = {

    /*
     * Initializes the hierarchy display component on selected elements.
     *
     * @param {object} setupOptions - User-provided configuration options.
     */
    initialize : function( setupOptions ) {

      // Merge default settings with user-provided options.
      var configuration = $lib.extend( true, {}, initialConfiguration, setupOptions );
      var actionProcessors = $lib.extend( {}, initialProcessor, configuration.userDefinedActionMap );
      var iconMappings = $lib.extend( {}, initialIconSet, configuration.userDefinedIconMap );

      // Return the chainable jQuery object.
      return this.each( function( index, domElement ) {
        var currentElement = $lib( domElement ),
            instanceData = currentElement.data("hierarchyDisplay");

        // Attach configuration and helpers to the instance.
        componentFunctions.configuration = configuration;

        // Bind the view manager and processors to the configuration object.
        configuration.viewManager = componentFunctions;
        configuration.actionProcessors = actionProcessors;
        configuration.iconMappings = iconMappings;

        configuration.displayContainer = domElement;

        // If this DOM node hasn't been activated as a hierarchy display yet.
        if ( !instanceData ) {
          // Store the configuration object with the element.
          currentElement.data("hierarchyDisplay", configuration);

          // Add a base CSS class for styling.
          currentElement.addClass("tree-display-wrapper");

          // Insert a container for the individual segments.
          $lib("<div></div>").addClass("tree-display-composition").appendTo( currentElement );

          // Attach a click event listener for list items.
          currentElement.on( "click", ".segment ol li:not('.filter-input')", configuration.viewManager._handleEntrySelection );

          // Perform the initial data load for the root level.
          configuration.dataFetcher( null, function( errorObject, retrievedData ) {
            if ( errorObject ) {
              return $lib.error( errorObject );
            }

            return configuration.viewManager._appendContentSegment( retrievedData );
          });
        }
      });
    },

    /*
     * Handles the click event on a list item within a segment.
     */
    _handleEntrySelection : function() {
      var displayInstance = $lib(this).parents(".tree-display-wrapper").data("hierarchyDisplay");

      var activeWrapper = $lib(this).parents(".tree-display-wrapper");

      var selectedSegment = $lib(this).parents(".segment");
      var selectionDepth = $lib(this).parents(".segment").index();

      var elementType = $lib(this).data("item-kind");
      var elementPayload = $lib(this).data("item-payload");

      // Remove any subsequent segments beyond the clicked one.
      $lib(activeWrapper).find(".tree-display-composition .segment:gt(" + selectionDepth + ")").remove();

      // Deactivate previously active items in the current segment and activate the clicked one.
      selectedSegment.find(".active-item").removeClass("active-item");
      $lib(this).addClass("active-item");

      // Delegate to the appropriate action processor based on the item type.
      return displayInstance.actionProcessors[elementType]( displayInstance, this, elementPayload );
    },

    /*
     * Appends a new content segment (column) to the display.
     *
     * @param {Array} itemsCollection - An array of data objects to display.
     * @param {object} [viewManager] - The current view manager instance (optional).
     */
    _appendContentSegment : function( itemsCollection, viewManager ) {
      var currentManager = ( !viewManager ) ? this : viewManager;

      var listContainer = $lib("<ul></ul>");

      if ( itemsCollection.length === 0 ) {
        var emptyMessageElement = $lib("<p></p>").text( currentManager.configuration.emptyContentMessage );
        return currentManager._addDisplaySegment( emptyMessageElement, currentManager );
      }

      if ( currentManager.configuration.isSearchEnabled ) {
        currentManager._addSearchInput( listContainer );
      }

      for ( var idx = 0; idx < itemsCollection.length; idx++ ) {
        // Create the list item element.
        var listItemElement = $lib(document.createElement('li'))
                                .data("item-identifier", itemsCollection[idx].identifier)
                                .data("item-kind", itemsCollection[idx].kind)
                                .data("item-payload", itemsCollection[idx])
                                .attr('title', itemsCollection[idx].caption);
        var itemIconElement = $lib(document.createElement('i')).addClass( currentManager.configuration.iconMappings[itemsCollection[idx].kind] );

        // Construct the item's content.
        listItemElement[0].appendChild( document.createTextNode(itemsCollection[idx].caption) );
        listItemElement[0].appendChild( itemIconElement[0] );

        listContainer[0].appendChild( listItemElement[0] );
      }

      return currentManager._addDisplaySegment( listContainer, currentManager );
    },

    /*
     * Adds a search input field to a given list element.
     *
     * @param {jQuery} targetListElement - The jQuery object of the list to add the search input to.
     */
    _addSearchInput : function( targetListElement ) {
      $lib('<li class="filter-input"><input type="text" placeholder=" ' + this.configuration.inputPromptText + '"></li>')
        .on('keyup', 'input', function( keyEvent ) {
          var queryTerm = $lib(this).val();

          if ( queryTerm.length >= 2 ) {
            $lib(this).closest('li').siblings().each( function() {
              if ( queryTerm !== '' && $lib(this).data('item-payload').caption.toLowerCase().indexOf( queryTerm.toLowerCase() ) === -1 ) {
                $lib(this).hide();
              }
              else {
                $lib(this).show();
              }
            });
          }
          else {
            $lib(this).closest('li').siblings().show();
          }
        })
        .appendTo( targetListElement );
    },

    /*
     * Creates and appends a new display segment (column) with content.
     *
     * @param {jQuery} contentNode - The jQuery object representing the content to be placed inside the segment.
     * @param {object} segmentManager - The manager instance responsible for this segment.
     */
    _addDisplaySegment : function( contentNode, segmentManager ) {
      // Create the new segment div.
      var segmentElement = $lib("<div></div>").addClass("segment");

      // Append the content provided.
      segmentElement.append( contentNode );

      // Add this new segment to the main composition area.
      $lib( segmentManager.configuration.displayContainer ).find(".tree-display-composition").append( segmentElement );

      // Scroll the container to reveal the newly added segment.
      $lib( segmentManager.configuration.displayContainer ).scrollLeft( $lib(".tree-display-composition").width() );
    }
  };

  /*
   * jQuery plugin definition for hierarchyDisplay.
   */
  $lib.fn.hierarchyDisplay = function( operationName ) {
    // Determine which function to call based on the operation name.
    if ( componentFunctions[operationName] ) {
      return componentFunctions[ operationName ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    } else if ( typeof operationName === 'object' || ! operationName ) {
      return componentFunctions.initialize.apply( this, arguments );
    } else {
      $lib.error( 'Function ' +  operationName + ' does not exist on jQuery.hierarchyDisplay' );
    }
  };

})( jQuery );