/*
 * This is a Type I code clone of the original Backbone.GoogleMaps library.
 * The core logic, identifiers, and expressions remain precisely as they were.
 * However, the visual presentation has been significantly altered through
 * extensive modifications to whitespace and comments.
 *
 * All copyrights and licenses of the original work remain in effect.
 *
 * Original project: https://github.com/eschwartz/backbone.googlemaps
 *
 * This version aims to demonstrate maximal visual difference while maintaining
 * strict Type I clone compliance.
 */
( function ( root, factory )
{
  // A common pattern for module definition: Universal Module Definition (UMD).
  // This allows the library to be used in various environments.

  if ( typeof define === 'function' && define.amd )
  {
    // If an AMD loader (like RequireJS) is present, register as an anonymous module.
    // The dependencies are listed explicitly: 'backbone', 'underscore', 'jquery'.
    define( [ 'backbone', 'underscore', 'jquery' ], factory );
  }


  else
  {
    // Otherwise, we assume a browser environment and expose the library
    // via global variables.
    // Dependencies are expected to be available on the 'root' object (window).
    factory( root.Backbone, root._, root.jQuery || root.Zepto || root.ender );
  }

} ( this, function ( Backbone, _, $ )
{

  // Enforce strict mode for cleaner, safer JavaScript code execution.
  'use strict';


  // Initialize the main GoogleMaps object, which will hold all our modules.
  var GoogleMaps = {};


  /**
   * GoogleMaps.Location
   * --------------------------------------------------------------------------
   * This Backbone Model represents a geographical point, specifically a
   * latitude and longitude coordinate on a map. It also includes properties
   * for selection state and a title.
   *
   * @class GoogleMaps.Location
   * @extends Backbone.Model
   */
  GoogleMaps.Location = Backbone.Model.extend(
    {
      /**
       * The constructor method for the Location model.
       * It sets up default values and event listeners.
       * @constructor
       */
      constructor: function ( )
      {
        // Bind 'this' context for specific methods to the model instance.
        // This ensures the methods can be called as callbacks without context issues.
        _.bindAll( this, 'select', 'deselect', 'toggleSelect', 'getLatLng', 'getLatlng' );


        // Extend the default attributes with any user-provided defaults.
        // `lat` and `lng` are initialized to 0, `selected` to false, `title` to an empty string.
        this.defaults = _.extend(
          {},
          {
            lat:      0,
            lng:      0,
            selected: false,
            title:    ""
          },
          this.defaults
        );


        // Call the parent Backbone.Model constructor to ensure proper initialization.
        Backbone.Model.prototype.constructor.apply( this, arguments );


        // Attach an event listener for changes to the 'selected' attribute.
        // This will trigger custom 'selected' or 'deselected' events.
        this.on( "change:selected", function ( model, isSelected )
        {
          // Determine the event topic based on the new selection state.
          var topic = isSelected ? "selected" : "deselected";
          // Trigger the appropriate event, passing the model itself.
          this.trigger( topic, this );
        }, this ); // Ensure the handler's context is the model instance.
      },


      /**
       * Sets the 'selected' attribute to true, marking the location as selected.
       */
      select: function ( )
      {
        this.set( "selected", true );
      },


      /**
       * Sets the 'selected' attribute to false, marking the location as deselected.
       */
      deselect: function ( )
      {
        this.set( "selected", false );
      },


      /**
       * Toggles the 'selected' attribute between true and false.
       */
      toggleSelect: function ( )
      {
        this.set( "selected", !this.get( "selected" ) );
      },


      /**
       * Alias for getLatLng, provided for flexibility (e.g., in case of typos or different naming conventions).
       * @returns {google.maps.LatLng} The Google Maps LatLng object.
       */
      getLatlng: function ( )
      {
        return this.getLatLng( );
      },


      /**
       * Returns a new google.maps.LatLng object based on the model's 'lat' and 'lng' attributes.
       * This method requires the Google Maps API to be loaded.
       * @returns {google.maps.LatLng} A Google Maps LatLng object.
       */
      getLatLng: function ( )
      {
        return new google.maps.LatLng( this.get( "lat" ), this.get( "lng" ) );
      }
    }
  );


  /**
   * GoogleMaps.LocationCollection
   * --------------------------------------------------------------------------
   * This is a Backbone Collection specifically designed to hold
   * GoogleMaps.Location models. It includes logic for managing selection
   * states across its models, ensuring only one model can be selected at a time.
   *
   * @class GoogleMaps.LocationCollection
   * @extends Backbone.Collection
   */
  GoogleMaps.LocationCollection = Backbone.Collection.extend(
    {
      /**
       * The constructor for the LocationCollection.
       * Sets the default model type and handles selection logic.
       * @param {Array} [opt_models] Initial models for the collection.
       * @param {Object} [opt_options] Options for the collection.
       * @constructor
       */
      constructor: function ( opt_models, opt_options )
      {
        // Set default options, ensuring the `model` property is GoogleMaps.Location.
        var options = _.defaults(
          {},
          opt_options,
          {
            model: GoogleMaps.Location
          }
        );


        // Ensure the model property is set, if not already.
        options.model || ( options.model = GoogleMaps.Location );


        // Call the parent Backbone.Collection constructor.
        Backbone.Collection.prototype.constructor.call( this, opt_models, options );


        // Event listener: When a model in this collection becomes selected,
        // deselect all other models to enforce single selection.
        this.on( "change:selected", function ( selectedModel, isSelected )
        {
          // Only proceed if the model was actually selected.
          if ( isSelected )
          {
            // Iterate over all models in the collection.
            this.each( function ( model )
            {
              // If the current model is not the one that was just selected, deselect it.
              if ( selectedModel.cid !== model.cid )
              {
                model.deselect( );
              }
            } );
          }
        }, this ); // Ensure the context for the callback is the collection.
      }
    }
  );


  /**
   * GoogleMaps.MapView
   * --------------------------------------------------------------------------
   * This is the base view for all Google Maps overlays. It provides common
   * functionality like constructor setup, event binding to `gOverlay` (the
   * Google Maps API object), rendering, and cleanup.
   *
   * @class GoogleMaps.MapView
   * @extends Backbone.View
   */
  GoogleMaps.MapView = Backbone.View.extend(
    {
      /**
       * The constructor for the MapView.
       * Initializes the view, checks for API and map presence, and extends options.
       * @param {Object} options Options for the MapView, including a `map` instance.
       * @constructor
       */
      constructor: function ( options )
      {
        // Bind 'this' context for key methods to the view instance.
        _.bindAll( this, 'render', 'close' );


        // Initialize or extend the hash of Google Map events.
        // These events will be attached to `this.gOverlay` (which can be the map itself
        // or a specific overlay like a Marker).
        // Example: `zoom_changed': 'handleZoomChange'`
        this.mapEvents = this.mapEvents || {};


        // Initialize or extend overlay-specific options.
        this.overlayOptions = this.overlayOptions || {};


        // Call the parent Backbone.View constructor to ensure proper setup.
        Backbone.View.prototype.constructor.apply( this, arguments );


        // Store the options passed during instantiation.
        this.options = options;


        // Critical checks: Ensure the Google Maps API is loaded and a map instance is provided.
        if ( !google || !google.maps )
        {
          throw new Error( "Google maps API is not loaded." );
        }
        if ( !this.options.map && !this.map )
        {
          throw new Error( "A map must be specified." );
        }

        // Assign the Google Maps API object (either the map itself or a specific overlay).
        // This is the target for map events.
        this.gOverlay = this.map = this.options.map || this.map;


        // Merge any `overlayOptions` from the constructor options into the view's `overlayOptions`.
        _.extend( this.overlayOptions, this.options.overlayOptions );
      },


      /**
       * Attaches event listeners to `this.gOverlay` based on the `mapEvents` hash.
       * @param {Object} [mapEvents] An optional map of events and handlers. Defaults to `this.mapEvents`.
       * @param {Object} [opt_context] An optional context for the event handlers. Defaults to `this`.
       */
      bindMapEvents: function ( mapEvents, opt_context )
      {
        // Determine the context for event handlers.
        var context = opt_context || this;


        // Use `this.mapEvents` if no specific `mapEvents` object is provided.
        mapEvents || ( mapEvents = this.mapEvents );


        // Iterate over each event defined in `mapEvents`.
        _.each( mapEvents, function ( handlerRef, topic )
        {
          // Resolve the handler function from its reference.
          var handler = this._getHandlerFromReference( handlerRef );
          // Add the Google Maps listener.
          this._addGoogleMapsListener( topic, handler, context );
        }, this ); // Ensure `this` inside the loop refers to the MapView instance.
      },


      /**
       * Resolves an event handler function from a string reference or a direct function.
       * @param {string|Function} handlerRef The reference to the handler.
       * @returns {Function} The resolved handler function.
       * @private
       */
      _getHandlerFromReference: function ( handlerRef )
      {
        // If `handlerRef` is a string, it's assumed to be a method name on `this`.
        // Otherwise, it's treated as a direct function reference.
        var handler = _.isString( handlerRef ) ? this[ handlerRef ] : handlerRef;


        // Validate that the resolved handler is indeed a function.
        if ( !_.isFunction( handler ) )
        {
          throw new Error( "Unable to bind map event. " + handlerRef +
            " is not a valid event handler method" );
        }


        return handler;
      },


      /**
       * Adds a Google Maps API event listener to `this.gOverlay`.
       * @param {string} topic The name of the Google Maps event (e.g., 'click', 'zoom_changed').
       * @param {Function} handler The function to call when the event occurs.
       * @param {Object} [opt_context] An optional context for the handler.
       * @private
       */
      _addGoogleMapsListener: function ( topic, handler, opt_context )
      {
        // If a context is provided, bind the handler to that context.
        if ( opt_context )
        {
          handler = _.bind( handler, opt_context );
        }


        // Use the Google Maps API to add the event listener.
        google.maps.event.addListener( this.gOverlay, topic, handler );
      },


      /**
       * Renders the MapView. This method triggers lifecycle events and binds map events.
       * @returns {GoogleMaps.MapView} The view instance for chaining.
       */
      render: function ( )
      {
        // Trigger a 'before:render' event and call `beforeRender` if it exists.
        this.trigger( 'before:render' );
        if ( this.beforeRender )
        {
          this.beforeRender( );
        }


        // Bind any specified Google Maps events to `this.gOverlay`.
        this.bindMapEvents( );


        // Trigger a 'render' event and call `onRender` if it exists.
        this.trigger( 'render' );
        if ( this.onRender )
        {
          this.onRender( );
        }


        return this; // Allow method chaining.
      },


      /**
       * Cleans up the MapView.
       * This involves removing the overlay from the map and detaching all event listeners.
       */
      close: function ( )
      {
        // Trigger a 'before:close' event and call `beforeClose` if it exists.
        this.trigger( 'before:close' );
        if ( this.beforeClose )
        {
          this.beforeClose( );
        }


        // Remove all Google Maps event listeners associated with `this.gOverlay`.
        google.maps.event.clearInstanceListeners( this.gOverlay );

        // If the overlay has a `setMap` method (e.g., Marker, InfoWindow), remove it from the map.
        if ( this.gOverlay.setMap )
        {
          this.gOverlay.setMap( null );
        }
        // Nullify the reference to the Google Maps overlay object.
        this.gOverlay = null;


        // Trigger a 'close' event and call `onClose` if it exists.
        this.trigger( 'close' );
        if ( this.onClose )
        {
          this.onClose( );
        }
      }
    }
  );


  /**
   * GoogleMaps.InfoWindow
   * --------------------------------------------------------------------------
   * This view acts as a controller for a google.maps.InfoWindow instance.
   * It extends GoogleMaps.MapView to leverage its base functionality for
   * map-related views. It requires an associated marker to display itself.
   *
   * @class GoogleMaps.InfoWindow
   * @extends GoogleMaps.MapView
   */
  GoogleMaps.InfoWindow = GoogleMaps.MapView.extend(
    {
      /**
       * The constructor for the InfoWindow view.
       * Ensures a marker is specified and sets up the template.
       * @constructor
       */
      constructor: function ( )
      {
        // Call the parent MapView constructor to inherit its setup.
        GoogleMaps.MapView.prototype.constructor.apply( this, arguments );


        // Bind specific methods to the view instance's context.
        _.bindAll( this, 'render', 'close' );


        // Requirement: An InfoWindow must be associated with a marker.
        if ( !this.options.marker && !this.marker )
        {
          throw new Error( "A marker must be specified for InfoWindow view." );
        }
        // Assign the marker instance.
        this.marker = this.options.marker || this.marker;


        // Set the template for the InfoWindow's content.
        // It can be provided via options or as a property on the view.
        this.template = this.template || this.options.template;
      },


      /**
       * Renders the InfoWindow, setting its content and opening it on the map.
       * @returns {GoogleMaps.InfoWindow} The view instance for chaining.
       */
      render: function ( )
      {
        // Trigger 'before:render' lifecycle event.
        this.trigger( 'before:render' );
        if ( this.beforeRender )
        {
          this.beforeRender( );
        }


        // Call the parent MapView's render method to handle general view rendering tasks.
        GoogleMaps.MapView.prototype.render.apply( this, arguments );


        // Determine the InfoWindow's content. If a template is provided, use it;
        // otherwise, fall back to a default `<h2>` title template.
        var tmpl = ( this.template ) ? $( this.template ).html( ) : '<h2><%=title %></h2>';
        // Render the template with the model's data and set it as the view's element HTML.
        this.$el.html( _.template( tmpl, this.model.toJSON( ) ) );


        // Create a new google.maps.InfoWindow instance.
        // Its content is the rendered HTML element of this view.
        this.gOverlay = new google.maps.InfoWindow(
          _.extend(
            {
              content: this.$el[ 0 ] // Access the raw DOM element.
            },
            this.overlayOptions // Merge any specific InfoWindow options.
          )
        );


        // Display the InfoWindow on the map, anchored to its associated marker.
        this.gOverlay.open( this.map, this.marker );


        // Trigger 'render' lifecycle event.
        this.trigger( 'render' );
        if ( this.onRender )
        {
          this.onRender( );
        }


        return this;
      },


      /**
       * Closes the InfoWindow and performs cleanup.
       * @returns {GoogleMaps.InfoWindow} The view instance for chaining.
       */
      close: function ( )
      {
        // Trigger 'before:close' lifecycle event.
        this.trigger( 'before:close' );
        if ( this.beforeClose )
        {
          this.beforeClose( );
        }


        // Call the parent MapView's close method to handle general cleanup
        // (e.g., clearing Google Maps listeners, setting gOverlay map to null).
        GoogleMaps.MapView.prototype.close.apply( this, arguments );


        // Trigger 'close' lifecycle event.
        this.trigger( 'close' );
        if ( this.onClose )
        {
          this.onClose( );
        }


        return this;
      }
    }
  );


  /**
   * GoogleMaps.MarkerView
   * --------------------------------------------------------------------------
   * This view controls a google.maps.Marker overlay. It's responsible for
   * creating the marker, handling interactions (like clicks), and synchronizing
   * its position with an associated GoogleMaps.Location model. It can also
   * manage an InfoWindow for details.
   *
   * @class GoogleMaps.MarkerView
   * @extends GoogleMaps.MapView
   */
  GoogleMaps.MarkerView = GoogleMaps.MapView.extend(
    {
      /**
       * The constructor for the MarkerView.
       * Sets up the marker, default behaviors, and event listeners.
       * @constructor
       */
      constructor: function ( )
      {
        // Define the default InfoWindow view to be used for this marker.
        this.infoWindow = this.infoWindow || GoogleMaps.InfoWindow;


        // Call the parent MapView constructor for base setup.
        GoogleMaps.MapView.prototype.constructor.apply( this, arguments );


        // Bind specific methods to the view instance's context.
        _.bindAll( this, 'render', 'close', 'openDetail', 'closeDetail', 'toggleSelect' );


        // Requirement: A MarkerView must have an associated model (GoogleMaps.Location).
        if ( !this.model )
        {
          throw new Error( "A model must be specified for a MarkerView" );
        }


        // Instantiate a new google.maps.Marker.
        // It's initialized with properties from the model and default settings.
        this.gOverlay = new google.maps.Marker(
          _.extend(
            {
              position:  this.model.getLatLng( ), // Marker's initial position from the model.
              map:       this.map,                // The map instance it belongs to.
              title:     this.model.title,        // Title for the marker (tooltip).
              animation: google.maps.Animation.DROP, // Default animation.
              visible:   false                    // Initially hide the marker until `render` is called.
            },
            this.overlayOptions                  // Merge any specific marker options.
          )
        );


        // Extend the default mapEvents with a click handler for selection.
        _.extend(
          this.mapEvents,
          {
            'click': 'toggleSelect'              // Toggle model selection on marker click.
          }
        );


        // Event listener: When the model's 'selected' state changes,
        // open or close the detail view (InfoWindow).
        this.model.on( "change:selected", function ( model, isSelected )
        {
          if ( isSelected )
          {
            this.openDetail( ); // Show the InfoWindow.
          }
          else
          {
            this.closeDetail( ); // Hide the InfoWindow.
          }
        }, this ); // Ensure callback context is the MarkerView instance.

        // Event listener: When the model's latitude or longitude changes,
        // refresh the marker's position on the map.
        this.model.on( "change:lat change:lng", this.refreshOverlay, this );


        // Bind a Google Maps API event:
        // When the marker's position changes (e.g., if it's draggable),
        // update the associated model's lat/lng.
        this.bindMapEvents(
          {
            'position_changed': 'updateModelPosition'
          }
        );
      },


      /**
       * Updates the Google Maps marker's position to match the model's `lat`/`lng`.
       * This is called when the model's position changes.
       */
      refreshOverlay: function ( )
      {
        // Important check: Only update the overlay if its position is different from the model's.
        // This prevents an infinite loop if `updateModelPosition` also triggers model changes.
        if ( !this.model.getLatLng( ).equals( this.gOverlay.getPosition( ) ) )
        {
          this.gOverlay.setOptions(
            {
              position: this.model.getLatLng( )
            }
          );
        }
      },


      /**
       * Updates the model's `lat`/`lng` to match the Google Maps marker's current position.
       * This is called when the marker's position changes (e.g., if it's dragged).
       */
      updateModelPosition: function ( )
      {
        var newPosition = this.gOverlay.getPosition( );


        // Important check: Only update the model if its position is different from the marker's.
        // This prevents an infinite loop if `refreshOverlay` also triggers overlay changes.
        if ( !this.model.getLatLng( ).equals( newPosition ) )
        {
          this.model.set(
            {
              lat: newPosition.lat( ),
              lng: newPosition.lng( )
            }
          );
        }
      },


      /**
       * Toggles the 'selected' state of the associated model.
       * This method is typically bound to the marker's click event.
       */
      toggleSelect: function ( )
      {
        this.model.toggleSelect( );
      },


      /**
       * Renders the MarkerView, making its marker visible on the map.
       * @returns {GoogleMaps.MarkerView} The view instance for chaining.
       */
      render: function ( )
      {
        // Trigger 'before:render' lifecycle event.
        this.trigger( 'before:render' );
        if ( this.beforeRender )
        {
          this.beforeRender( );
        }


        // Call the parent MapView's render method for base rendering tasks.
        GoogleMaps.MapView.prototype.render.apply( this, arguments );
        // Make the Google Maps marker visible on the map.
        this.gOverlay.setVisible( true );


        // Trigger 'render' lifecycle event.
        this.trigger( 'render' );
        if ( this.onRender )
        {
          this.onRender( );
        }


        return this;
      },


      /**
       * Closes the MarkerView, removing the marker and its associated InfoWindow.
       * Also cleans up event listeners.
       * @returns {GoogleMaps.MarkerView} The view instance for chaining.
       */
      close: function ( )
      {
        // Trigger 'before:close' lifecycle event.
        this.trigger( 'before:close' );
        if ( this.beforeClose )
        {
          this.beforeClose( );
        }


        // Close any open detail view (InfoWindow).
        this.closeDetail( );
        // Call the parent MapView's close method for general cleanup.
        GoogleMaps.MapView.prototype.close.apply( this, arguments );
        // Unbind all event listeners from the associated model to prevent memory leaks.
        this.model.off( );


        // Trigger 'close' lifecycle event.
        this.trigger( 'close' );
        if ( this.onClose )
        {
          this.onClose( )
        }


        return this;
      },


      /**
       * Opens the detail view (InfoWindow) for this marker.
       * Instantiates and renders the `infoWindow` view.
       */
      openDetail: function ( )
      {
        // Create a new instance of the InfoWindow view.
        this.detailView = new this.infoWindow(
          {
            model:    this.model,
            map:      this.map,
            marker:   this.gOverlay // Pass the actual Google Maps marker object.
          }
        );
        // Render the InfoWindow.
        this.detailView.render( );
      },


      /**
       * Closes the detail view (InfoWindow) if it is currently open.
       */
      closeDetail: function ( )
      {
        if ( this.detailView )
        {
          this.detailView.close( ); // Call the InfoWindow's close method.
          this.detailView = null;  // Nullify the reference to aid garbage collection.
        }
      }
    }
  );


  /**
   * GoogleMaps.MarkerCollectionView
   * --------------------------------------------------------------------------
   * This view manages a collection of GoogleMaps.MarkerViews. It listens to
   * changes in its associated Backbone.Collection (of GoogleMaps.Location models)
   * and dynamically adds, removes, or refreshes the corresponding MarkerViews.
   *
   * @class GoogleMaps.MarkerCollectionView
   * @extends Backbone.View
   */
  GoogleMaps.MarkerCollectionView = Backbone.View.extend(
    {
      /**
       * The constructor for the MarkerCollectionView.
       * Initializes child view type, child view storage, and binds to the collection.
       * @param {Object} options Options for the view, including a `map` and a `collection`.
       * @constructor
       */
      constructor: function ( options )
      {
        // Define the default MarkerView type to be used for models in the collection.
        this.markerView = this.markerView || GoogleMaps.MarkerView;
        // Initialize an object to store child MarkerView instances, keyed by model CID.
        this.markerViewChildren = this.markerViewChildren || {};


        // Call the parent Backbone.View constructor for base setup.
        Backbone.View.prototype.constructor.apply( this, arguments );


        // Store the options passed during instantiation.
        this.options = options;


        // Bind specific methods to the view instance's context.
        _.bindAll( this, 'render', 'closeChildren', 'closeChild', 'addChild', 'refresh', 'close' );


        // Requirement: A map instance must be specified.
        if ( !this.options.map && !this.map )
        {
          throw new Error( "A map must be specified on MarkerCollectionView instantiation" );
        }
        // Assign the map instance.
        this.map || ( this.map = this.options.map );


        // Bind event listeners to the associated collection.
        // `reset`: Re-render all markers when the collection is reset.
        this.collection.on( "reset", this.refresh, this );
        // `add`: Add a new MarkerView when a model is added to the collection.
        this.collection.on( "add", this.addChild, this );
        // `remove`: Close a MarkerView when its model is removed from the collection.
        this.collection.on( "remove", this.closeChild, this );
      },


      /**
       * Renders MarkerViews for all models currently in the collection.
       * @param {Backbone.Collection} [collection] An optional collection to render. Defaults to `this.collection`.
       * @returns {GoogleMaps.MarkerCollectionView} The view instance for chaining.
       */
      render: function ( collection )
      {
        var collection = collection || this.collection;


        // Trigger 'before:render' lifecycle event.
        this.trigger( 'before:render' );
        if ( this.beforeRender )
        {
          this.beforeRender( );
        }


        // Iterate through each model in the collection and create/render a MarkerView for it.
        collection.each( this.addChild );


        // Trigger 'render' lifecycle event.
        this.trigger( 'render' );
        if ( this.onRender )
        {
          this.onRender( );
        }


        return this;
      },


      /**
       * Closes all child MarkerView instances managed by this collection view.
       */
      closeChildren: function ( )
      {
        // Iterate over the stored child MarkerViews.
        for ( var cid in this.markerViewChildren )
        {
          // Call `closeChild` for each child view.
          this.closeChild( this.markerViewChildren[ cid ] );
        }
      },


      /**
       * Closes a single child MarkerView.
       * @param {Backbone.Model|GoogleMaps.MarkerView} child The model or the MarkerView instance to close.
       */
      closeChild: function ( child )
      {
        // Determine if the `child` parameter is a model or a view.
        var childView = ( child instanceof Backbone.Model ) ? this.markerViewChildren[ child.cid ] : child;


        // Close the MarkerView.
        childView.close( );
        // Remove the reference from the `markerViewChildren` object.
        delete this.markerViewChildren[ childView.model.cid ];
      },


      /**
       * Adds a new MarkerView for a given model and renders it.
       * This method is typically called when a model is added to the collection.
       * @param {GoogleMaps.Location} childModel The model for which to create a MarkerView.
       */
      addChild: function ( childModel )
      {
        // Create a new MarkerView instance.
        var markerView = new this.markerView(
          {
            model: childModel,
            map:   this.map
          }
        );


        // Store the new child view, keyed by its model's client ID (cid).
        this.markerViewChildren[ childModel.cid ] = markerView;


        // Render the new MarkerView, making its marker visible on the map.
        markerView.render( );
      },


      /**
       * Refreshes the collection view by closing all existing children and re-rendering them.
       * This is useful after a collection `reset` event.
       */
      refresh: function ( )
      {
        this.closeChildren( ); // Remove all current markers.
        this.render( );        // Re-render markers for the updated collection.
      },


      /**
       * Cleans up the MarkerCollectionView and all its child MarkerViews.
       * It removes all markers from the map and unbinds collection events.
       */
      close: function ( )
      {
        this.closeChildren( ); // Close all individual marker views.
        this.collection.off( ); // Unbind all event listeners from the collection.
      }
    }
  );


  // Attach the `GoogleMaps` object to Backbone, making it accessible as `Backbone.GoogleMaps`.
  Backbone.GoogleMaps = GoogleMaps;
  // Return the `GoogleMaps` object, especially for AMD loaders.
  return GoogleMaps;

} ) );