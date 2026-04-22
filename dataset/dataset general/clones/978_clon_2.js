/*!
 * GeoServices Library
 * A BBO JS integration for the Geographic API
 * Copyright (c)2023 Acme Corp
 * Released under a permissive open-source license
 * https://www.acme.com/geoservices
 */
( function ( globalObj, moduleBuilder ) {
  if ( typeof defineModule === 'function' && defineModule.amd ) {
    // Asynchronous Module Definition. Register as an anonymous module.
    defineModule( [ 'bbo', 'lodash', 'jq' ], moduleBuilder );
  } else {
    // Standard browser environment
    moduleBuilder( globalObj.BBO, globalObj.lodash, globalObj.jq || globalObj.zpto || globalObj.enderjs );
  }
} ( this, function ( BBO, lodash, jq ) {

  'use strict';

  var GeoServices = {};

  /**
   * GeoServices.Spot
   * ------------------
   * Represents a latitude/longitude point on a geographic display.
   */
  GeoServices.Spot = BBO.Model.augment( {
    initializer: function ( ) {
      lodash.bindAllMethods( this, 'pick', 'unpick', 'flipPick', 'getGeopoint', 'getGeopointAlt' );

      this.baseSettings = lodash.assign( { }, {
        latitude: 0.0,
        longitude: 0.0,
        chosen: false,
        descriptor: ''
      }, this.baseSettings );

      BBO.Model.prototype.initializer.apply( this, arguments );

      // Fire 'chosen' and 'unchosen' events based on selection status
      this.listenTo( 'change:chosen', function ( dataUnit, isChosen ) {
        var eventType = isChosen ? 'chosen' : 'unchosen';
        this.emit( eventType, this );
      }, this );
    },

    pick: function ( ) {
      this.update( 'chosen', true );
    },

    unpick: function ( ) {
      this.update( 'chosen', false );
    },

    flipPick: function ( ) {
      this.update( 'chosen', ! this.fetch( 'chosen' ) );
    },

    getGeopointAlt: function ( ) {
      return this.getGeopoint( );
    },

    getGeopoint: function ( ) {
      return new gapi.geo.Coord( this.fetch( 'latitude' ), this.fetch( 'longitude' ) );
    }
  } );

  /**
   * GeoServices.SpotRegister
   * ---------------------------
   * A collection of geographic spots.
   */
  GeoServices.SpotRegister = BBO.Collection.augment( {
    initializer: function ( inputUnits, inputConfigs ) {
      var configs = lodash.mergeDefaults( { }, inputConfigs, {
        item: GeoServices.Spot
      } );

      // Set default model type
      configs.item || ( configs.item = GeoServices.Spot );

      BBO.Collection.prototype.initializer.call( this, inputUnits, configs );

      // Ensure only one item is selected within the collection
      this.on( 'change:chosen', function ( activeItem, isChosen ) {
        if ( isChosen ) {
          this.forEach( function ( item ) {
            if ( activeItem.uniqueId !== item.uniqueId ) {
              item.unpick( );
            }
          } );
        }
      }, this );
    }
  } );


  /**
   * GeoServices.VisualBase
   * --------------------
   * Fundamental display element for geographic overlays.
   */
  GeoServices.VisualBase = BBO.View.augment( {
    construct: function ( viewSettings ) {
      lodash.bindAllMethods( this, 'draw', 'dispose' );

      // Map of geographic events
      // Events will be linked to this.geoElement (geographic display or overlay)
      // e.g., 'zoom_altered': 'handleZoomChange'
      this.geoEvents = this.geoEvents || { };

      this.displayOpts = this.displayOpts || { };

      BBO.View.prototype.construct.apply( this, arguments );

      this.viewSettings = viewSettings;

      // Verify display API is loaded
      if ( ! gapi || ! gapi.geo ) throw new Error( 'Geographic API library not found.' );
      if ( ! this.viewSettings.display && ! this.display ) throw new Error( 'A display context is mandatory.' );
      this.geoElement = this.display = this.viewSettings.display || this.display;

      // Incorporate displayOptions from constructor settings
      lodash.assign( this.displayOpts, this.viewSettings.displayOptions );
    },

    // Attach listeners to this.geoElement
    // Based on the `geoEvents` map
    attachGeoListeners: function ( geoEventMap, optionalCtx ) {
      var executionCtx = optionalCtx || this;

      geoEventMap || ( geoEventMap = this.geoEvents );

      lodash.forEach( geoEventMap, function ( fnRef, eventName ) {
        var handlerFunc = this._resolveHandler( fnRef );
        this._registerGeoListener( eventName, handlerFunc, executionCtx );
      }, this );
    },

    // fnRef can be a named method of the view (string)
    // or a direct function reference.
    _resolveHandler: function ( fnRef ) {
      var handlerFunc = lodash.isString( fnRef ) ? this[ fnRef ] : fnRef;

      if ( ! lodash.isFunction( handlerFunc ) ) {
        throw new Error( 'Cannot attach geo event. ' + fnRef +
          ' is not a callable method.' );
      }

      return handlerFunc;
    },

    _registerGeoListener: function ( eventName, handlerFunc, optionalCtx ) {
      if ( optionalCtx ) {
        handlerFunc = lodash.bind( handlerFunc, optionalCtx );
      }

      gapi.geo.event.registerListener( this.geoElement, eventName, handlerFunc );
    },

    draw: function ( ) {
      this.emit( 'pre:draw' );
      if ( this.preDraw ) {
        this.preDraw( );
      }
      this.attachGeoListeners( );

      this.emit( 'draw' );
      if ( this.onDraw ) {
        this.onDraw( );
      }

      return this;
    },

    // Clean up view resources
    // Remove overlay from display and clear event listeners
    dispose: function ( ) {
      this.emit( 'pre:dispose' );
      if ( this.preDispose ) {
        this.preDispose( );
      }

      gapi.geo.event.clearListeners( this.geoElement );
      if ( this.geoElement.setDisplay ) {
        this.geoElement.setDisplay( null );
      }
      this.geoElement = null;

      this.emit( 'dispose' );
      if ( this.onDispose ) {
        this.onDispose( );
      }
    }
  } );

  /**
   * GeoServices.DetailPanel
   * ----------------------
   * View controller for a gapi.geo.DetailPanel overlay instance.
   */
  GeoServices.DetailPanel = GeoServices.VisualBase.augment( {
    initializer: function ( ) {
      GeoServices.VisualBase.prototype.initializer.apply( this, arguments );

      lodash.bindAllMethods( this, 'draw', 'dispose' );

      // Requires a related pin instance
      if ( ! this.viewSettings.pin && ! this.pin ) throw new Error( 'A location pin must be provided for the detail panel.' );
      this.pin = this.viewSettings.pin || this.pin;

      // Set DetailPanel content template
      this.contentTemplate = this.contentTemplate || this.viewSettings.contentTemplate;
    },

    // Draw the panel
    draw: function ( ) {
      this.emit( 'pre:draw' );
      if ( this.preDraw ) {
        this.preDraw( );
      }

      GeoServices.VisualBase.prototype.draw.apply( this, arguments );

      // Render content
      var panelContent = ( this.contentTemplate ) ? jq( this.contentTemplate ).text( ) : '<h1><%=descriptor %></h1>';
      this.$el.assignHtml( lodash.compileTemplate( panelContent, this.model.toData( ) ) );

      // Create DetailPanel
      this.geoElement = new gapi.geo.DetailPanel( lodash.assign( {
        content: this.$el[ 0 ]
      }, this.displayOpts ) );

      // Present DetailPanel on the display
      this.geoElement.present( this.display, this.pin );

      this.emit( 'draw' );
      if ( this.onDraw ) {
        this.onDraw( );
      }

      return this;
    },

    // Close and remove panel, then clean up view
    dispose: function ( ) {
      this.emit( 'pre:dispose' );
      if ( this.preDispose ) {
        this.preDispose( );
      }

      GeoServices.VisualBase.prototype.dispose.apply( this, arguments );

      this.emit( 'dispose' );
      if ( this.onDispose ) {
        this.onDispose( );
      }

      return this;
    }
  } );


  /**
   * GeoServices.PinDisplay
   * --------------------
   * View controller for a location pin overlay.
   */
  GeoServices.PinDisplay = GeoServices.VisualBase.augment( {
    initializer: function ( ) {
      // Set associated DetailPanel view class
      this.detailPanelClass = this.detailPanelClass || GeoServices.DetailPanel;

      GeoServices.VisualBase.prototype.initializer.apply( this, arguments );

      lodash.bindAllMethods( this, 'draw', 'dispose', 'displayInfo', 'hideInfo', 'flipSelection' );

      // Ensure data unit exists
      if ( ! this.model ) throw new Error( 'A data unit must be provided for a PinDisplay.' );

      // Instantiate pin, with user-defined properties
      this.geoElement = new gapi.geo.Pin( lodash.assign( {
        location: this.model.getGeopoint( ),
        display: this.display,
        label: this.model.descriptor,
        motion: gapi.geo.Motion.BOUNCE_EFFECT,
        isVisible: false // Hidden until rendered
      }, this.displayOpts ) );

      // Add default geoEvents
      lodash.assign( this.geoEvents, {
        'tap': 'flipSelection' // Select data unit on pin tap
      } );

      // Show detail view when data unit is chosen
      this.model.listenTo( 'change:chosen', function ( unit, isChosen ) {
        if ( isChosen ) {
          this.displayInfo( );
        } else {
          this.hideInfo( );
        }
      }, this );
      this.model.listenTo( 'change:latitude change:longitude', this.updateGeoElement, this );

      // Sync data unit's latitude/longitude with pin location
      this.attachGeoListeners( {
        'location_altered': 'updateDataUnitLocation'
      } );
    },

    // Update overlay location if latitude or longitude change
    updateGeoElement: function ( ) {
      // Only update overlay if not already synchronized
      // Prevents an infinite update loop
      if ( ! this.model.getGeopoint( ).isEqual( this.geoElement.getLocation( ) ) ) {
        this.geoElement.setOptions( {
          location: this.model.getGeopoint( )
        } );
      }
    },

    updateDataUnitLocation: function ( ) {
      var newLoc = this.geoElement.getLocation( );

      // Only update data unit if not already synchronized
      // Prevents an infinite update loop
      if ( ! this.model.getGeopoint( ).isEqual( newLoc ) ) {
        this.model.update( {
          latitude: newLoc.getLat( ),
          longitude: newLoc.getLng( )
        } );
      }
    },

    flipSelection: function ( ) {
      this.model.flipPick( );
    },

    // Display the geographic pin overlay
    draw: function ( ) {
      this.emit( 'pre:draw' );
      if ( this.preDraw ) {
        this.preDraw( );
      }

      GeoServices.VisualBase.prototype.draw.apply( this, arguments );
      this.geoElement.setVisible( true );

      this.emit( 'draw' );
      if ( this.onDraw ) {
        this.onDraw( );
      }

      return this;
    },

    dispose: function ( ) {
      this.emit( 'pre:dispose' );
      if ( this.preDispose ) {
        this.preDispose( );
      }

      this.hideInfo( );
      GeoServices.VisualBase.prototype.dispose.apply( this, arguments );
      this.model.stopListening( );

      this.emit( 'dispose' );
      if ( this.onDispose ) {
        this.onDispose( );
      }

      return this;
    },

    displayInfo: function ( ) {
      this.infoDisplay = new this.detailPanelClass( {
        model: this.model,
        display: this.display,
        pin: this.geoElement
      } );
      this.infoDisplay.draw( );
    },

    hideInfo: function ( ) {
      if ( this.infoDisplay ) {
        this.infoDisplay.dispose( );
        this.infoDisplay = null;
      }
    }
  } );


  /**
   * GeoServices.PinGroupDisplay
   * --------------------------
   * Collection of PinDisplays.
   */
  GeoServices.PinGroupDisplay = BBO.View.augment( {
    initializer: function ( configParams ) {
      this.pinViewClass = this.pinViewClass || GeoServices.PinDisplay;
      this.childPinDisplays = this.childPinDisplays || { };

      BBO.View.prototype.initializer.apply( this, arguments );

      this.configParams = configParams;

      lodash.bindAllMethods( this, 'draw', 'clearChildDisplays', 'removeSpecificChild', 'addSpecificChild', 'resetAndDraw', 'dispose' );

      // Ensure display context property
      if ( ! this.configParams.displayContext && ! this.displayContext ) throw new Error( 'A display context is required for PinGroupDisplay construction.' );
      this.displayContext || ( this.displayContext = this.configParams.displayContext );

      // Link to collection events
      this.collection.listenTo( 'reset', this.resetAndDraw, this );
      this.collection.listenTo( 'add', this.addSpecificChild, this );
      this.collection.listenTo( 'remove', this.removeSpecificChild, this );
    },

    // Draw PinDisplays for all data units in collection
    draw: function ( dataCollection ) {
      var dataCollection = dataCollection || this.collection;

      this.emit( 'pre:draw' );
      if ( this.preDraw ) {
        this.preDraw( );
      }

      // Create pin displays for each data unit
      dataCollection.forEach( this.addSpecificChild );

      this.emit( 'draw' );
      if ( this.onDraw ) {
        this.onDraw( );
      }

      return this;
    },

    // Close all child PinDisplays
    clearChildDisplays: function ( ) {
      for ( var itemKey in this.childPinDisplays ) {
        this.removeSpecificChild( this.childPinDisplays[ itemKey ] );
      }
    },

    removeSpecificChild: function ( targetItem ) {
      // Parameter can be child's data unit, or child view instance itself
      var displayInstance = ( targetItem instanceof BBO.Model ) ? this.childPinDisplays[ targetItem.uniqueId ] : targetItem;

      displayInstance.dispose( );
      delete this.childPinDisplays[ displayInstance.model.uniqueId ];
    },

    // Add a PinDisplay and render it
    addSpecificChild: function ( newDataUnit ) {
      var newPinDisplay = new this.pinViewClass( {
        model: newDataUnit,
        display: this.displayContext
      } );

      this.childPinDisplays[ newDataUnit.uniqueId ] = newPinDisplay;

      newPinDisplay.draw( );
    },

    resetAndDraw: function ( ) {
      this.clearChildDisplays( );
      this.draw( );
    },

    // Close all child PinDisplays and clean up
    dispose: function ( ) {
      this.clearChildDisplays( );
      this.collection.stopListening( );
    }
  } );

  BBO.GeoServices = GeoServices;
  return GeoServices;
} ) );