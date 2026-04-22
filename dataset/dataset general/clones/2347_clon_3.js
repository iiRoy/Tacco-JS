(function( currentWindow, jqAlias, noVal ){

  'use strict';

  // This section handles debounced window resizing, ensuring performance.
  // Original source: https://github.com/louisremi/jquery.smartresize.js
  // Copyright 2011 @louis_remi, MIT Licensed.

  const jqEvent = jqAlias.event;
  let delayTimer; // Timer for the debounced resize event

  jqEvent.special.fastResize = {
    setup: function() {
      jqAlias(this).on( "resize.fastResize", jqEvent.special.fastResize.triggerHandler );
    },
    teardown: function() {
      jqAlias(this).off( "resize.fastResize", jqEvent.special.fastResize.triggerHandler );
    },
    triggerHandler: function( evnt, runImmediately ) {
      // Preserve the execution context and arguments for the actual event handler
      const exContext = this;
      const exArgs = arguments;

      // Normalize the event type for consistent handling
      evnt.type = "fastResize";

      // Clear any pending resize events to debounce
      if ( delayTimer ) {
        currentWindow.clearTimeout( delayTimer );
      }

      // Schedule the event to fire after a short delay, or immediately if requested
      delayTimer = currentWindow.setTimeout(function() {
        jqAlias.event.handle.apply( exContext, exArgs );
      }, runImmediately === "forceRun"? 0 : 120 ); // Slightly different debounce time
    }
  };

  // jQuery plugin for debounced resize events
  jqAlias.fn.fastResize = function( userCallback ) {
    // If a callback is provided, bind it; otherwise, trigger the event immediately.
    return userCallback ? this.on( "fastResize", userCallback ) : this.trigger( "fastResize", ["forceRun"] );
  };



// ========================= GridFlow (formerly Masonry) ===============================


  // Our primary layout manager constructor
  jqAlias.GridFlow = function( layoutOptions, targetElement ){
    this.targetContainer = jqAlias( targetElement );

    this.initializeLayout( layoutOptions );
    this.startLayoutProcess();
  };

  // Default configuration for GridFlow instances
  jqAlias.GridFlow.defaults = {
    isResponsive: true,
    hasAnimations: false,
    motionSettings: {
      useQueue: false,
      animationDuration: 400 // Slightly different duration
    },
    gapBetweenItems: 10, // Renamed from gutterWidth and changed value
    isRightToLeft: false,
    adjustContainerWidth: false, // Renamed from isFitWidth
    containerBaseStyle: {
      position: 'relative'
    }
  };

  jqAlias.GridFlow.prototype = {

    // Identifies and filters child elements that should participate in the layout.
    _findLayoutItems: function( potentialItems ) {
      const itemFilter = this.config.itemSelector;
      // If no specific selector, all provided items are considered.
      // Otherwise, filter and find elements matching the selector.
      return itemFilter ? potentialItems.filter( itemFilter ).add( potentialItems.find( itemFilter ) ) : potentialItems;
    },

    // Prepares layout items by applying necessary styles and classes.
    _prepareLayoutBricks: function( rawElements ) {
      const layoutBricks = this._findLayoutItems( rawElements )
        .css({ position: 'absolute', visibility: 'hidden' }) // Added visibility: hidden
        .addClass('gridflow-item'); // Changed class name
      return layoutBricks;
    },

    // Sets up the GridFlow instance based on user options.
    initializeLayout : function( userOptions ) {

      this.config = jqAlias.extend( true, {}, jqAlias.GridFlow.defaults, userOptions ); // Renamed options to config
      this.styleUpdateQueue = []; // Renamed styleQueue

      // Store original container styles to restore them on destruction.
      const containerDOMStyle = this.targetContainer[0].style;
      this.initialContainerState = {}; // Renamed originalStyle
      // Capture height
      this.initialContainerState.height = containerDOMStyle.height || '';

      // Capture other styles that will be overridden by the layout.
      const baseStyles = this.config.containerBaseStyle;
      for ( const styleProp in baseStyles ) { // Changed loop type
        if (Object.prototype.hasOwnProperty.call(baseStyles, styleProp)) { // Added hasOwnProperty check
          this.initialContainerState[ styleProp ] = containerDOMStyle[ styleProp ] || '';
        }
      }

      this.targetContainer.css( baseStyles );

      this.directionX = this.config.isRightToLeft ? 'right' : 'left'; // Renamed horizontalDirection

      this.paddingOffset = { // Renamed offset
        x: parseInt( this.targetContainer.css( 'padding-' + this.directionX ), 10 ) || 0, // Added || 0
        y: parseInt( this.targetContainer.css( 'padding-top' ), 10 ) || 0
      };

      this.isColumnWidthDynamic = this.config.columnWidth && typeof this.config.columnWidth === 'function'; // Renamed isFluid

      // Apply base class to container after a short delay for DOM readiness.
      const currentInstance = this;
      currentWindow.requestAnimationFrame( function() { // Used requestAnimationFrame
        currentInstance.targetContainer.addClass('gridflow-container'); // Changed class name
      });

      // Bind to debounced resize event if responsiveness is enabled.
      if ( this.config.isResponsive ) {
        jqAlias(currentWindow).on( 'fastResize.gridflow', function() { // Changed event namespace
          currentInstance.handleResizeEvent(); // Renamed resize method
        });
      }

      // Populate initial set of layout items.
      this.gatherLayoutItems();

    },

    // Initializes or re-initializes the layout process.
    startLayoutProcess : function( completionCallback ) { // Renamed _init
      this._determineColumnStructure();
      this._arrangeElements( completionCallback );
    },

    // Allows updating configuration options after initialization.
    updateOptions: function( newSettings ){ // Renamed option
      if ( jqAlias.isPlainObject( newSettings ) ){
        this.config = jqAlias.extend(true, this.config, newSettings);
      }
    },

    // ====================== Core Layout Logic ======================

    // Arranges a collection of elements within the grid.
    // Assumes elements are already filtered and sorted.
    applyElementPlacement : function( elementsToPlace, layoutDoneCallback ) { // Renamed layout

      if (!elementsToPlace || elementsToPlace.length === 0) { // Added guard clause
        if (layoutDoneCallback) {
          layoutDoneCallback.call(elementsToPlace);
        }
        return;
      }

      // Place each individual element.
      for (let k=0, totalElements = elementsToPlace.length; k < totalElements; k++) { // Changed loop variable
        this._positionSingleBrick( elementsToPlace[k] );
      }

      // Determine the overall height of the container.
      const containerDimensions = {};
      containerDimensions.height = Math.max( ...this.columnHeights ); // Used spread operator for Math.max
      containerDimensions.visibility = 'visible'; // Added explicit visibility setting

      // Adjust container width if configured to fit content.
      if ( this.config.adjustContainerWidth ) {
        let emptyColumns = 0;
        let colIndex = this.totalColumns;
        while ( --colIndex > 0 ) { // Changed loop condition
          if ( this.columnHeights[colIndex] !== 0 ) {
            break;
          }
          emptyColumns++;
        }
        containerDimensions.width = (this.totalColumns - emptyColumns) * this.currentColumnWidth - this.config.gapBetweenItems;
      }
      this.styleUpdateQueue.push({ targetEl: this.targetContainer, styles: containerDimensions }); // Renamed $el to targetEl, style to styles

      // Decide whether to animate or simply apply CSS.
      const cssUpdateMethod = !this.isInitialLayout ? 'css' : (
            this.config.hasAnimations ? 'animate' : 'css'
          ),
          animationProps = this.config.motionSettings;

      // Process all pending style updates.
      for (let k=0, queueLength = this.styleUpdateQueue.length; k < queueLength; k++) { // Changed loop variable
        const updateEntry = this.styleUpdateQueue[k]; // Renamed obj
        updateEntry.targetEl[ cssUpdateMethod ]( updateEntry.styles, animationProps );
      }

      // Clear the queue for the next layout cycle.
      this.styleUpdateQueue = [];

      // Execute the callback, providing the elements as context.
      if ( layoutDoneCallback ) {
        layoutDoneCallback.call( elementsToPlace );
      }

      this.isInitialLayout = true; // Renamed isLaidOut
    },

    // Calculates the number and width of columns for the grid.
    _determineColumnStructure : function() {
      const layoutParent = this.config.adjustContainerWidth ? this.targetContainer.parent() : this.targetContainer;
      const parentWidth = layoutParent.width();

      // Determine column width: dynamic function, explicit option, first item's width, or parent width.
      this.currentColumnWidth = this.isColumnWidthDynamic ? this.config.columnWidth( parentWidth ) :
                    this.config.columnWidth ||
                    (this.layoutBricks.length > 0 ? this.layoutBricks.eq(0).outerWidth(true) : parentWidth) || // Handle empty layoutBricks
                    parentWidth;

      this.currentColumnWidth += this.config.gapBetweenItems;

      this.totalColumns = Math.floor( ( parentWidth + this.config.gapBetweenItems ) / this.currentColumnWidth );
      this.totalColumns = Math.max( this.totalColumns, 1 ); // Ensure at least one column

      if (this.totalColumns === 0) { // Added guard for zero columns
        console.warn("GridFlow: Calculated zero columns. This might lead to layout issues.");
        this.totalColumns = 1;
      }
    },

    // Positions a single element within the grid, finding the shortest column.
    _positionSingleBrick: function( singleBrick ) { // Renamed _placeBrick
      const $currentBrick = jqAlias(singleBrick);
      let spanWidth, potentialGroups, groupHeights, currentGroupHeights, bestColumnIndex;

      // Calculate how many columns this brick should span.
      spanWidth = Math.ceil( $currentBrick.outerWidth(true) / this.currentColumnWidth );
      spanWidth = Math.min( spanWidth, this.totalColumns ); // Cap at total columns

      if ( spanWidth === 1 ) {
        // Simple case: brick fits in a single column.
        groupHeights = this.columnHeights;
      } else {
        // Complex case: brick spans multiple columns.
        potentialGroups = this.totalColumns + 1 - spanWidth;
        groupHeights = [];

        // For each possible horizontal starting position, find the maximum height of columns it would cover.
        for ( let j=0; j < potentialGroups; j++ ) {
          currentGroupHeights = this.columnHeights.slice( j, j + spanWidth );
          groupHeights[j] = Math.max( ...currentGroupHeights ); // Used spread operator
        }
      }

      // Find the minimum Y value among the possible placement groups.
      const minAvailableY = Math.min( ...groupHeights ); // Used spread operator
      bestColumnIndex = 0; // Default to first column

      // Determine the index of the shortest column where the brick can be placed.
      for (let idx=0, gLen = groupHeights.length; idx < gLen; idx++) {
        if ( groupHeights[idx] === minAvailableY ) {
          bestColumnIndex = idx;
          break;
        }
      }

      // Calculate final position.
      const finalPosition = {
        top: minAvailableY + this.paddingOffset.y
      };
      finalPosition[ this.directionX ] = this.currentColumnWidth * bestColumnIndex + this.paddingOffset.x;
      this.styleUpdateQueue.push({ targetEl: $currentBrick, styles: finalPosition });

      // Update column heights for the spanned columns.
      const newColumnHeight = minAvailableY + $currentBrick.outerHeight(true);
      const affectedColumns = this.totalColumns + 1 - groupHeights.length; // Corrected calculation
      for ( let k=0; k < affectedColumns; k++ ) {
        this.columnHeights[ bestColumnIndex + k ] = newColumnHeight;
      }
    },

    // Handles window resize events to re-layout the grid.
    handleResizeEvent: function() { // Renamed resize
      const previousColumnCount = this.totalColumns;
      const previousContainerWidth = this.targetContainer.width(); // Capture previous width

      this._determineColumnStructure(); // Recalculate columns

      // Only re-layout if column count or container width has actually changed.
      if ( this.isColumnWidthDynamic || this.totalColumns !== previousColumnCount || this.targetContainer.width() !== previousContainerWidth ) {
        this._arrangeElements();
      }
    },

    // Resets column heights and triggers a full re-layout.
    _arrangeElements : function( completionCallback ) { // Renamed _reLayout
      // Initialize all column heights to zero.
      this.columnHeights = Array(this.totalColumns).fill(0); // Using Array.fill

      // Apply layout logic to all current bricks.
      this.applyElementPlacement( this.layoutBricks, completionCallback );
    },

    // ====================== Convenience methods ======================

    // Refreshes the collection of elements managed by GridFlow.
    gatherLayoutItems : function() { // Renamed reloadItems
      this.layoutBricks = this._prepareLayoutBricks( this.targetContainer.children() ); // Renamed $bricks
    },

    // Performs a full reload and re-initialization of the grid.
    refreshGrid : function( doneCallback ) { // Renamed reload
      this.gatherLayoutItems();
      this.startLayoutProcess( doneCallback );
    },

    // Appends new content to the grid.
    addContent : function( newContentElems, animateFromBottom, onComplete ) { // Renamed appended
      if (!newContentElems || newContentElems.length === 0) { // Added validation
        if (onComplete) onComplete.call(jqAlias());
        return;
      }

      if ( animateFromBottom ) {
        // Position new elements below the current container height for animated entry.
        this._findLayoutItems( newContentElems ).css({ top: this.targetContainer.height() });
        const instanceRef = this;
        currentWindow.setTimeout( function(){
          instanceRef._addContentInternal( newContentElems, onComplete );
        }, 1 ); // Small delay to allow initial CSS to apply
      } else {
        this._addContentInternal( newContentElems, onComplete );
      }
    },

    // Internal method for adding new content without animation logic.
    _addContentInternal : function( newContentElems, onComplete ) { // Renamed _appended
      const freshBricks = this._prepareLayoutBricks( newContentElems ); // Renamed $newBricks
      // Add new bricks to the overall collection.
      this.layoutBricks = this.layoutBricks.add( freshBricks );
      this.applyElementPlacement( freshBricks, onComplete );
    },

    // Removes specified elements from the grid.
    removeElements : function( elementsToRemove ) { // Renamed remove
      if (!elementsToRemove || elementsToRemove.length === 0) return; // Added guard
      this.layoutBricks = this.layoutBricks.not( elementsToRemove );
      elementsToRemove.remove(); // Use remove directly
    },

    // Destroys the GridFlow instance, cleaning up styles and event bindings.
    destroyGrid : function() { // Renamed destroy

      this.layoutBricks
        .removeClass('gridflow-item')
        .each(function(){
          // Reset inline styles for each brick.
          this.style.position = '';
          this.style.top = '';
          this.style.left = '';
          this.style.visibility = ''; // Reset added visibility
        });

      // Restore the container's original styles.
      const currentElemStyle = this.targetContainer[0].style;
      for ( const propKey in this.initialContainerState ) {
        if (Object.prototype.hasOwnProperty.call(this.initialContainerState, propKey)) {
          currentElemStyle[ propKey ] = this.initialContainerState[ propKey ];
        }
      }

      // Unbind all GridFlow-related events and remove data.
      this.targetContainer
        .off('.gridflow') // Changed namespace
        .removeClass('gridflow-container')
        .removeData('gridflow'); // Changed data key

      jqAlias(currentWindow).off('.gridflow'); // Unbind window resize event

    }

  };


  // ======================= Image Loading Utility ===============================
  // This utility ensures callbacks fire only after all images within a selection are loaded.
  // Based on: http://github.com/desandro/imagesloaded, MIT License.

  jqAlias.fn.allImagesLoaded = function( completionCallback ) { // Renamed imagesLoaded
    const currentContext = this,
          allImages = currentContext.find('img').add( currentContext.filter('img') ),
          totalImages = allImages.length,
          dummyPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', // Renamed blank
          loadedImages = []; // Renamed loaded

    // Function to execute the user's callback.
    function executeUserCallback() {
      completionCallback.call( currentContext, allImages );
    }

    // Handler for individual image load/error events.
    function singleImageEventHandler( evnt ) {
      const currentImage = evnt.target;
      // Only process if image hasn't been handled and isn't the dummy pixel.
      if ( currentImage.src !== dummyPixel && jqAlias.inArray( currentImage, loadedImages ) === -1 ){
        loadedImages.push( currentImage );
        if ( loadedImages.length === totalImages ){ // Check against loadedImages count
          currentWindow.requestAnimationFrame( executeUserCallback ); // Changed setTimeout
          allImages.off( '.imageLoadMonitor', singleImageEventHandler ); // Changed namespace
        }
      }
    }

    // If there are no images, trigger callback immediately.
    if ( !totalImages ) {
      executeUserCallback();
    } else {
      // Bind load and error events, then re-trigger image loading for cached images.
      allImages.on( 'load.imageLoadMonitor error.imageLoadMonitor',  singleImageEventHandler ).each( function() {
        // Force browser to re-check image status for cached images.
        const originalSrc = this.src;
        this.src = dummyPixel; // Use dummy pixel to prevent unnecessary network requests for cached images
        this.src = originalSrc;
      });
    }

    return currentContext;
  };


  // Helper for logging issues to the console.
  const issueLogger = function( issueMessage ) { // Renamed logError
    if ( currentWindow.console && currentWindow.console.warn ) { // Using console.warn
      currentWindow.console.warn( issueMessage );
    }
  };

  // =======================  jQuery Plugin Integration  ===============================
  // Enables GridFlow functionality via jQuery plugin syntax.
  // Inspired by jQuery UI and jCarousel plugin patterns.

  jqAlias.fn.gridFlow = function( utilityArg ) { // Renamed masonry

    // Helper function to invoke a method on an instance.
    const invokeInstanceMethod = function( instanceObj, methodName, methodArgs ) {
      if ( !instanceObj ) {
        issueLogger( "GridFlow: Cannot call methods before initialization; " +
          "attempted to call method '" + methodName + "'" );
        return;
      }
      if ( !jqAlias.isFunction( instanceObj[methodName] ) || methodName.charAt(0) === "_" ) {
        issueLogger( "GridFlow: No such method '" + methodName + "' available for instance." );
        return;
      }
      instanceObj[ methodName ].apply( instanceObj, methodArgs );
    };

    if ( typeof utilityArg === 'string' ) {
      // If a string is passed, it's a method call.
      const methodArguments = Array.prototype.slice.call( arguments, 1 );

      this.each(function(){
        const gridInstance = jqAlias.data( this, 'gridflow' ); // Changed data key
        invokeInstanceMethod( gridInstance, utilityArg, methodArguments );
      });
    } else {
      // Otherwise, it's an initialization or option update.
      if (this.length === 0) { // Added guard for empty selection
        issueLogger("GridFlow: No elements selected for initialization.");
        return this;
      }
      this.each(function() {
        let gridInstance = jqAlias.data( this, 'gridflow' ); // Changed data key
        if ( gridInstance ) {
          // If an instance already exists, update its options and re-initialize.
          gridInstance.updateOptions( utilityArg || {} ); // Renamed option
          gridInstance.startLayoutProcess();
        } else {
          // Create a new instance and store it.
          gridInstance = new jqAlias.GridFlow( utilityArg, this );
          jqAlias.data( this, 'gridflow', gridInstance ); // Changed data key
        }
      });
    }
    return this; // Maintain jQuery chaining
  };

})( window, jQuery, undefined ); // Renamed parameters to be more descriptive