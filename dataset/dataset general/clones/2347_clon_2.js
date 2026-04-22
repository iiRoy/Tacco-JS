( function( currentWindow, jq, voidVar ) {

  'use strict';

  /*
   * intelligentResize: debounced resize event for jQuery
   *
   * most recent version and full documentation available on GitHub:
   * https://github.com/louisremi/jquery.smartresize.js
   *
   * Copyright 2011 @louis_remi
   * Licensed under the MIT license.
   */

  var jqEvent = jq.event,
      resizeTimer;

  jqEvent.special.intelligentResize = {
    setup: function() {
      jq( this ).bind( "resize", jqEvent.special.intelligentResize.process );
    },
    teardown: function() {
      jq( this ).unbind( "resize", jqEvent.special.intelligentResize.process );
    },
    process: function( evtObj, performImmediately ) {
      // Store the context
      var currentContext = this,
          passedArguments = arguments;

      // set updated event type
      evtObj.type = "intelligentResize";

      if ( resizeTimer ) {
        clearTimeout( resizeTimer );
      }
      resizeTimer = setTimeout( function() {
        jq.event.handle.apply( currentContext, passedArguments );
      }, performImmediately === "execAsap" ? 0 : 100 );
    }
  };

  jq.fn.intelligentResize = function( funcRef ) {
    return funcRef ? this.bind( "intelligentResize", funcRef ) : this.trigger( "intelligentResize", [ "execAsap" ] );
  };



// ========================= Grid Align ===============================


  // our "Widget" object constructor
  jq.GridAlign = function( configOptions, targetElement ) {
    this.element = jq( targetElement );

    this._initializeComponent( configOptions );
    this._startComponent();
  };

  jq.GridAlign.config = {
    canResize: true,
    useAnimations: false,
    motionOptions: {
      queue: false,
      duration: 500
    },
    spacingWidth: 0,
    rightToLeft: false,
    adaptToWidth: false,
    wrapperStyling: {
      position: 'relative'
    }
  };

  jq.GridAlign.prototype = {

    _locateLayoutUnits: function( $elements ) {
      var unitSelector = this.options.itemSelector;
      // if a selector is provided
      // filter/find relevant unit elements
      return !unitSelector ? $elements : $elements.filter( unitSelector ).add( $elements.find( unitSelector ) );
    },

    _fetchLayoutUnits: function( $elements ) {
      var $layoutUnits = this._locateLayoutUnits( $elements )
        .css( { position: 'absolute' } )
        .addClass( 'grid-unit' );
      return $layoutUnits;
    },
    
    // sets up component
    _initializeComponent : function( configOptions ) {
      
      this.options = jq.extend( true, {}, jq.GridAlign.config, configOptions );
      this.styleQueue = [];

      // capture initial styles in case we restore them in .terminateComponent()
      var targetElemStyle = this.element[0].style;
      this.initialStyling = {
        // capture height
        height: targetElemStyle.height || ''
      };
      // capture other styles that will be overridden
      var wrapperStyling = this.options.wrapperStyling;
      for ( var styleProp in wrapperStyling ) {
        this.initialStyling[ styleProp ] = targetElemStyle[ styleProp ] || '';
      }

      this.element.css( wrapperStyling );

      this.flowDirection = this.options.rightToLeft ? 'right' : 'left';

      this.offset = {
        x: parseInt( this.element.css( 'padding-' + this.flowDirection ), 10 ),
        y: parseInt( this.element.css( 'padding-top' ), 10 )
      };
      
      this.isFlexible = this.options.columnWidth && typeof this.options.columnWidth === 'function';

      // add grid-layout class initially
      var componentInstance = this;
      setTimeout( function() {
        componentInstance.element.addClass( 'grid-layout' );
      }, 0 );
      
      // bind adjustSize method
      if ( this.options.canResize ) {
        jq( currentWindow ).bind( 'intelligentResize.gridify', function() { 
          componentInstance.adjustSize();
        });
      }


      // must obtain units
      this.refreshUnits();

    },
  
    // _startComponent executes when instance is first created
    // and when instance is triggered again -> $el.gridify();
    _startComponent : function( completionCallback ) {
      this._calculateColumns();
      this._rearrangeLayout( completionCallback );
    },

    configureOption: function( keyName, val ){
      // set options AFTER initialization:
      // signature: jq('#foo').bar({ cool:false });
      if ( jq.isPlainObject( keyName ) ){
        this.options = jq.extend( true, this.options, keyName );
      } 
    },
    
    // ====================== General Layout ======================

    // used on collection of items (should be filtered, and sorted before )
    // accepts items-to-be-laid-out to begin with
    arrangeUnits : function( $layoutUnits, completionCallback ) {

      // place each unit
      for (var unitIdx = 0, unitCount = $layoutUnits.length; unitIdx < unitCount; unitIdx++) {
        this._positionUnit( $layoutUnits[unitIdx] );
      }
      
      // set the size of the container
      var containerDimensions = {};
      containerDimensions.height = Math.max.apply( Math, this.stackHeights );
      if ( this.options.adaptToWidth ) {
        var emptyStacks = 0;
        unitIdx = this.stacks;
        // count unused stacks
        while ( --unitIdx ) {
          if ( this.stackHeights[unitIdx] !== 0 ) {
            break;
          }
          emptyStacks++;
        }
        // fit container to stacks that have been utilized;
        containerDimensions.width = ( this.stacks - emptyStacks ) * this.columnWidth - this.options.spacingWidth;
      }
      this.styleQueue.push( { $el: this.element, style: containerDimensions } );

      // are we animating the layout arrangement?
      // use plugin-like syntax for css or animate
      var styleApplicationMethod = !this.isLaidOut ? 'css' : (
            this.options.useAnimations ? 'animate' : 'css'
          ),
          animationSettings = this.options.motionOptions;

      // process styleQueue
      var currentObj;
      for ( unitIdx = 0, unitCount = this.styleQueue.length; unitIdx < unitCount; unitIdx++ ) {
        currentObj = this.styleQueue[unitIdx];
        currentObj.$el[ styleApplicationMethod ]( currentObj.style, animationSettings );
      }

      // clear out queue for next iteration
      this.styleQueue = [];

      // provide $elements as context for the completionCallback
      if ( completionCallback ) {
        completionCallback.call( $layoutUnits );
      }
      
      this.isLaidOut = true;
    },
    
    // calculates number of stacks
    // i.e. this.columnWidth = 200
    _calculateColumns : function() {
      var wrapperContainer = this.options.adaptToWidth ? this.element.parent() : this.element,
          wrapperWidth = wrapperContainer.width();

                         // use flexible columnWidth function if provided
      this.columnWidth = this.isFlexible ? this.options.columnWidth( wrapperWidth ) :
                    // if not, how about the explicitly set option?
                    this.options.columnWidth ||
                    // or use the size of the first item
                    this.$layoutUnits.outerWidth( true ) ||
                    // if there are no items, use size of container
                    wrapperWidth;

      this.columnWidth += this.options.spacingWidth;

      this.stacks = Math.floor( ( wrapperWidth + this.options.spacingWidth ) / this.columnWidth );
      this.stacks = Math.max( this.stacks, 1 );

    },

    // layout logic
    _positionUnit: function( currentUnit ) {
      var $currentUnit = jq( currentUnit ),
          stackSpan, groupSize, groupHeight, groupStackHeights, k;

      //how many stacks does this unit span
      stackSpan = Math.ceil( $currentUnit.outerWidth( true ) / this.columnWidth );
      stackSpan = Math.min( stackSpan, this.stacks );

      if ( stackSpan === 1 ) {
        // if unit spans only one stack, just like singleMode
        groupHeight = this.stackHeights;
      } else {
        // unit spans more than one stack
        // how many different places could this unit fit horizontally
        groupSize = this.stacks + 1 - stackSpan;
        groupHeight = [];

        // for each potential horizontal position group
        for ( k = 0; k < groupSize; k++ ) {
          // make an array of stackHeight values for that one group
          groupStackHeights = this.stackHeights.slice( k, k + stackSpan );
          // and get the max value of the array
          groupHeight[k] = Math.max.apply( Math, groupStackHeights );
        }

      }

      // get the minimum Y value from the stacks
      var lowestY = Math.min.apply( Math, groupHeight ),
          shortestStackIndex = 0;
      
      // Find index of shortest stack, the first from the left
      for ( var stackIndex = 0, heightCount = groupHeight.length; stackIndex < heightCount; stackIndex++ ) {
        if ( groupHeight[stackIndex] === lowestY ) {
          shortestStackIndex = stackIndex;
          break;
        }
      }

      // position the unit
      var unitPosition = {
        top: lowestY + this.offset.y
      };
      // unitPosition.left or unitPosition.right
      unitPosition[ this.flowDirection ] = this.columnWidth * shortestStackIndex + this.offset.x;
      this.styleQueue.push( { $el: $currentUnit, style: unitPosition } );

      // apply setHeight to necessary stacks
      var newStackHeight = lowestY + $currentUnit.outerHeight( true ),
          spanToApply = this.stacks + 1 - heightCount;
      for ( stackIndex = 0; stackIndex < spanToApply; stackIndex++ ) {
        this.stackHeights[ shortestStackIndex + stackIndex ] = newStackHeight;
      }

    },
    
    
    adjustSize: function() {
      var previousStackCount = this.stacks;
      // get updated stackCount
      this._calculateColumns();
      if ( this.isFlexible || this.stacks !== previousStackCount ) {
        // if stack count has changed, trigger new layout
        this._rearrangeLayout();
      }
    },
    
    
    _rearrangeLayout : function( completionCallback ) {
      // reset stacks
      var stackCounter = this.stacks;
      this.stackHeights = [];
      while ( stackCounter-- ) {
        this.stackHeights.push( 0 );
      }
      // apply layout logic to all units
      this.arrangeUnits( this.$layoutUnits, completionCallback );
    },
    
    // ====================== Convenience methods ======================
    
    // goes through all children again and gets units in proper order
    refreshUnits : function() {
      this.$layoutUnits = this._fetchLayoutUnits( this.element.children() );
    },
    
    
    reinitialize : function( completionCallback ) {
      this.refreshUnits();
      this._startComponent( completionCallback );
    },
    

    // convenience method for working with Infinite Scroll
    addContent : function( $newContent, animateFromBottom, completionCallback ) {
      if ( animateFromBottom ) {
        // set new items to the bottom
        this._locateLayoutUnits( $newContent ).css( { top: this.element.height() } );
        var currentInstance = this;
        setTimeout( function() {
          currentInstance._internalAddContent( $newContent, completionCallback );
        }, 1 );
      } else {
        this._internalAddContent( $newContent, completionCallback );
      }
    },
    
    _internalAddContent : function( $newContent, completionCallback ) {
      var $insertedUnits = this._fetchLayoutUnits( $newContent );
      // add new units to unit pool
      this.$layoutUnits = this.$layoutUnits.add( $insertedUnits );
      this.arrangeUnits( $insertedUnits, completionCallback );
    },
    
    // removes elements from GridAlign component
    eliminateUnits : function( $contentToRemove ) {
      this.$layoutUnits = this.$layoutUnits.not( $contentToRemove );
      $contentToRemove.remove();
    },
    
    // terminates component, returns elements and container back (close) to initial style
    terminateComponent : function() {

      this.$layoutUnits
        .removeClass( 'grid-unit' )
        .each( function() {
          this.style.position = '';
          this.style.top = '';
          this.style.left = '';
        } );
      
      // re-apply saved container styles
      var elemCurrentStyle = this.element[0].style;
      for ( var savedProp in this.initialStyling ) {
        elemCurrentStyle[ savedProp ] = this.initialStyling[ savedProp ];
      }

      this.element
        .unbind( '.gridify' )
        .removeClass( 'grid-layout' )
        .removeData( 'gridify' );
      
      jq( currentWindow ).unbind( '.gridify' );

    }
    
  };
  
  
  // ======================= imagesLoaded Plugin ===============================
  /*!
   * jQuery imagesLoaded plugin v1.1.0
   * http://github.com/desandro/imagesloaded
   *
   * MIT License. by Paul Irish et al.
   */


  // jq('#my-container').allImagesLoaded(myFunction)
  // or
  // jq('img').allImagesLoaded(myFunction)

  // execute a callback when all images have loaded.
  // needed because .load() doesn't work on cached images

  // callback function gets image collection as argument
  //  `this` is the container

  jq.fn.allImagesLoaded = function( completionFunction ) {
    var $thisContainer = this,
        $visualElements = $thisContainer.find( 'img' ).add( $thisContainer.filter( 'img' ) ),
        totalElements = $visualElements.length,
        emptyPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
        loadedElements = [];

    function triggerCompletion() {
      completionFunction.call( $thisContainer, $visualElements );
    }

    function visualElementLoaded( triggerEvent ) {
      var imageElement = triggerEvent.target;
      if ( imageElement.src !== emptyPixel && jq.inArray( imageElement, loadedElements ) === -1 ){
        loadedElements.push( imageElement );
        if ( --totalElements <= 0 ){
          setTimeout( triggerCompletion );
          $visualElements.unbind( '.visualsLoaded', visualElementLoaded );
        }
      }
    }

    // if no images, trigger immediately
    if ( !totalElements ) {
      triggerCompletion();
    }

    $visualElements.bind( 'load.visualsLoaded error.visualsLoaded',  visualElementLoaded ).each( function() {
      // cached images don't fire load sometimes, so we reset src.
      var sourcePath = this.src;
      // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
      // data uri bypasses webkit log warning (thx doug jones)
      this.src = emptyPixel;
      this.src = sourcePath;
    });

    return $thisContainer;
  };


  // helper function for logging issues
  // jq.error breaks jQuery chaining
  var reportIssue = function( notification ) {
    if ( currentWindow.console ) {
      currentWindow.console.error( notification );
    }
  };
  
  // =======================  Plugin bridge  ===============================
  // leverages data method to either create or return jq.GridAlign constructor
  // A bit from jQuery UI
  //   https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js
  // A bit from jcarousel 
  //   https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js

  jq.fn.gridify = function( configSet ) {
    if ( typeof configSet === 'string' ) {
      // call method
      var argumentsList = Array.prototype.slice.call( arguments, 1 );

      this.each( function() {
        var componentHandle = jq.data( this, 'gridify' );
        if ( !componentHandle ) {
          reportIssue( "cannot call methods on gridify prior to initialization; " +
            "attempted to call method '" + configSet + "'" );
          return;
        }
        if ( !jq.isFunction( componentHandle[configSet] ) || configSet.charAt(0) === "_" ) {
          reportIssue( "no such method '" + configSet + "' for gridify instance" );
          return;
        }
        // apply method
        componentHandle[ configSet ].apply( componentHandle, argumentsList );
      });
    } else {
      this.each( function() {
        var componentHandle = jq.data( this, 'gridify' );
        if ( componentHandle ) {
          // apply options & init
          componentHandle.configureOption( configSet || {} );
          componentHandle._startComponent();
        } else {
          // initialize new instance
          jq.data( this, 'gridify', new jq.GridAlign( configSet, this ) );
        }
      });
    }
    return this;
  };

} )( window, jQuery );