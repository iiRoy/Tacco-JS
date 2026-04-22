//******************************************************************************
//
// flowview.jquery.js (version 1.0.2)
// https://github.com/visionvault/flowview
//
// Copyright 2012 VisionVault Solutions
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//******************************************************************************

;( function ( jQuery, globalScope, void0 ) {

  var FlowView = function( targetElement, options ) {
    var standardSettings = {
      moduleName: 'flowview',
      scrollContainer: null, // DOM element for scrolling (defaults to global window)
      debugMode: false,
      eventHooks: {
        requestData: 'requestData.flowview',
        receiveData: 'receiveData.flowview',
        startOperation: 'startOperation.flowview',
        endOperation: 'endOperation.flowview'
      },
      timingConfig: {
        throttleDelay: 500,
        monitorInterval: 200,
        processInterval: 100
      },
      loadingIndicator: null,
      cssClasses: {
        orderedListClass: null,
        listItemClass: null
      }
    };

    // Initialize configuration and internal state variables
    this.configuration = jQuery.extend( {}, standardSettings, options );
    this.domElements = {};
    this.computedMetrics = {};
    this.intervalHandles = {};
    this.requestQueue = [];
    this.responseQueue = [];

    this.domElements.mainWrapper = jQuery( targetElement );

    // Set up initial HTML structure and cache jQuery selectors for efficiency
    this.domElements.mainWrapper.html( this._generateStructure() );
    jQuery.extend( this.domElements, this._cacheDomRefs() );

    // Ensure the scrollable container has vertical overflow enabled
    this.domElements.scrollContainer.css( 'vertical-overflow', 'scroll' );
  };

  FlowView.prototype = {
    configuration: null,
    domElements: null,
    computedMetrics: null,
    intervalHandles: null,
    requestQueue: null,
    responseQueue: null,

    /* Method to construct the base HTML for the module */

    _generateStructure: function() {
      var topPlaceholderId = this.configuration.moduleName + '-top-marker';
      var contentBlockId = this.configuration.moduleName + '-content-block';

      var markupString = '<div id="' + topPlaceholderId + '"></div>';
      var listClass = this.configuration.cssClasses.orderedListClass;
      markupString += listClass ? '<ol id="' + contentBlockId + '" class="' + listClass + '"></ol>' :
        '<ol id="' + contentBlockId + '"></ol>';

      return markupString;
    },

    /* Method to retrieve and cache jQuery objects for key DOM elements */

    _cacheDomRefs: function() {
      return {
        scrollContainer: ( typeof this.configuration.scrollContainer === 'function' ) ?
          this.configuration.scrollContainer() : jQuery( globalScope ),
        topPlaceholder: jQuery( '#' + this.configuration.moduleName + '-top-marker' ),
        contentBlock: jQuery( '#' + this.configuration.moduleName + '-content-block' )
      };
    },

    /* Core initialization, queue management, event binding, and recurring processes */

    previousTopRows: null,
    hasScrolled: null,
    hasResized: null,

    initialize: function( initialOptions ) {
      this.configuration.displayBuffer = initialOptions.displayBuffer;
      this.configuration.itemDetails = initialOptions.itemDetails;

      // Validate input types to avoid `parseInt` issues later
      if ( typeof this.configuration.displayBuffer !== 'number' ||
        typeof this.configuration.itemDetails.totalItems !== 'number' ||
        typeof this.configuration.itemDetails.itemHeight !== 'number' ||
        typeof this.configuration.itemDetails.itemWidth !== 'number' ) {
        throw new TypeError( "FlowView initialization: Malformed input type for item or buffer settings" );
      }

      // Clear existing content and exit if no items are provided
      if ( this.configuration.itemDetails.totalItems < 1 ) {
        this.domElements.contentBlock.html( '' );
        return;
      }

      // Enforce a minimum buffer size to ensure partial rows are visible
      if ( this.configuration.displayBuffer < 2 ) this.configuration.displayBuffer = 2;

      // Compute and apply layout constants
      this.computedMetrics = this._calculateLayoutConstants();
      this.domElements.mainWrapper.height( this.computedMetrics.totalContentRows *
        this.configuration.itemDetails.itemHeight );
      this.domElements.contentBlock.height( this.computedMetrics.displayBlockRows *
        this.configuration.itemDetails.itemHeight );

      if ( this.configuration.debugMode ) {
        globalScope.console.info( "[initialize]" );
        globalScope.console.info( "itemsPerVisualRow: " + this.computedMetrics.itemsPerVisualRow );
        globalScope.console.info( "totalContentRows:  " + this.computedMetrics.totalContentRows );
        globalScope.console.info( "displayBlockRows:  " + this.computedMetrics.displayBlockRows );
        globalScope.console.info( "itemsInDisplayBlock: " + this.computedMetrics.itemsInDisplayBlock );
        globalScope.console.info( "----------------------------------------" );
      }

      this._initProcessingQueues();
      this._bindResponseEvent();

      // Load initial items and reset scroll position
      this.domElements.scrollContainer.scrollTop( 0 );
      this.domElements.topPlaceholder.height( 0 );
      this.previousTopRows = 0;
      this._manageScrollEffect( 'reload', 0, this.computedMetrics.itemsInDisplayBlock, null, false );

      this.hasScrolled = false;
      this.hasResized = false;

      // Start the main scroll feedback loop
      var selfRef = this;
      this.domElements.scrollContainer.scroll( function() {
        selfRef.hasScrolled = true;
      } );
      this.intervalHandles.feedbackMonitor = globalScope.setInterval( function() {
        return selfRef._processScrollFeedback.apply( selfRef );
      }, this.configuration.timingConfig.monitorInterval );
    },

    /* Calculates various layout-related constants based on current dimensions */

    _calculateLayoutConstants: function() {
      var itemInfo = this.configuration.itemDetails;

      var itemsPerVisualRow = Math.floor( this.domElements.contentBlock.width() / itemInfo.itemWidth );
      if ( itemsPerVisualRow < 1 ) itemsPerVisualRow = 1;
      var totalContentRows = Math.ceil( itemInfo.totalItems / itemsPerVisualRow );

      var visibleWindowRows = Math.ceil( this.domElements.scrollContainer.height() / itemInfo.itemHeight );
      var displayBlockRows;
      if ( visibleWindowRows < 1 ) displayBlockRows = 1 + ( 2 * this.configuration.displayBuffer );
      else displayBlockRows = visibleWindowRows + ( 2 * this.configuration.displayBuffer );
      if ( displayBlockRows > totalContentRows ) displayBlockRows = totalContentRows;

      var itemsInDisplayBlock = displayBlockRows * itemsPerVisualRow;
      if ( itemInfo.totalItems < itemsInDisplayBlock ) itemsInDisplayBlock = itemInfo.totalItems;

      return {
        itemsPerVisualRow: itemsPerVisualRow,
        totalContentRows: totalContentRows,
        displayBlockRows: displayBlockRows,
        itemsInDisplayBlock: itemsInDisplayBlock
      };
    },

    /* Initializes and manages the request and response processing queues */

    _initProcessingQueues: function() {
      var selfRef = this;
      this.intervalHandles.queueProcessor = globalScope.setInterval( function() {
        while ( selfRef.requestQueue.length > 0 && selfRef.responseQueue.length > 0 ) {
          var dataRequest = selfRef.requestQueue[ 0 ];

          var isMatched = false;

          // Due to asynchronicity, the first response in queue might not match the first request
          for ( var index = 0, queueLength = selfRef.responseQueue.length; index < queueLength; index++ ) {
            var dataResponse = selfRef.responseQueue[ index ];

            if ( dataRequest.startIndex === dataResponse.startIndex &&
              dataRequest.requestSize === dataResponse.itemHtmlArray.length ) { // Found a matching request/response pair
              selfRef.requestQueue.shift();
              selfRef.responseQueue.splice( index, 1 );
              selfRef._processResponseData( dataRequest, dataResponse );

              isMatched = true;
              break; // Short-circuit, loop is usually O(1) in average case
            }
          }

          if ( !isMatched ) break; // Exit if the current request has no corresponding response yet
        }
      }, this.configuration.timingConfig.processInterval );
    },

    /* Binds the custom event listener for incoming data responses */

    _bindResponseEvent: function() {
      var selfRef = this;
      this.domElements.mainWrapper.on( this.configuration.eventHooks.receiveData, function( eventObj, responseData ) {
        if ( typeof responseData.startIndex !== 'number' ||
          !responseData.itemHtmlArray || !( responseData.itemHtmlArray instanceof Array ) ||
          ( responseData.itemDataArray && typeof responseData.itemDataArray !== 'object' ) ) {
          throw new TypeError( "FlowView response: Malformed data response type received" );
        }

        selfRef.responseQueue.push( responseData );
      } );
    },

    /* Main feedback loop for handling scroll and resize events */

    _processScrollFeedback: function() {
      if ( !this.hasResized && !this.hasScrolled ) return;

      var currentTopRows = this._determinePrecedingRows( Math.floor( this.domElements.scrollContainer.scrollTop() /
        this.configuration.itemDetails.itemHeight ) );

      // Proceed only if a resize occurred or if at least one row was scrolled
      if ( !this.hasResized && currentTopRows === this.previousTopRows ) {
        this.hasScrolled = false;
        return;
      }

      this.domElements.topPlaceholder.height( currentTopRows * this.configuration.itemDetails.itemHeight );

      var operationType, startIndex, requestSize, removalCount;

      var rowDifference = currentTopRows - this.previousTopRows;
      if ( !this.hasResized && Math.abs( rowDifference ) < this.computedMetrics.displayBlockRows ) {
        var partialLastRow = ( this.configuration.itemDetails.totalItems % this.computedMetrics.itemsPerVisualRow ) !== 0;

        if ( rowDifference < 0 ) {
          operationType = 'up'; // Add elements to the top and remove from the bottom

          startIndex = currentTopRows * this.computedMetrics.itemsPerVisualRow;
          requestSize = -rowDifference * this.computedMetrics.itemsPerVisualRow;

          // Adjust for a potentially partial last row in the block
          if ( ( this.previousTopRows === this.computedMetrics.totalContentRows -
              this.computedMetrics.displayBlockRows ) && partialLastRow ) {
            removalCount = requestSize - this.computedMetrics.itemsPerVisualRow +
              ( this.configuration.itemDetails.totalItems % this.computedMetrics.itemsPerVisualRow );
          } else {
            removalCount = requestSize;
          }
        } else {
          operationType = 'down'; // Add elements to the bottom and remove from the top

          startIndex = this.computedMetrics.itemsPerVisualRow *
            ( this.previousTopRows + this.computedMetrics.displayBlockRows );
          removalCount = rowDifference * this.computedMetrics.itemsPerVisualRow;

          // Adjust for a potentially partial last row in the block
          if ( ( currentTopRows === this.computedMetrics.totalContentRows -
              this.computedMetrics.displayBlockRows ) && partialLastRow ) {
            requestSize = removalCount - this.computedMetrics.itemsPerVisualRow +
              ( this.configuration.itemDetails.totalItems % this.computedMetrics.itemsPerVisualRow );
          } else {
            requestSize = removalCount;
          }
        }
      } else {
        operationType = 'reload'; // Resized or scrolled significantly, requiring a full block refresh

        startIndex = currentTopRows * this.computedMetrics.itemsPerVisualRow;
        removalCount = null; // Full block replacement

        // Adjust for a potentially partial last row in the block
        if ( startIndex + this.computedMetrics.itemsInDisplayBlock <= this.configuration.itemDetails.totalItems ) {
          requestSize = this.computedMetrics.itemsInDisplayBlock;
        } else {
          requestSize = this.computedMetrics.itemsInDisplayBlock - this.computedMetrics.itemsPerVisualRow +
            ( this.configuration.itemDetails.totalItems % this.computedMetrics.itemsPerVisualRow );
        }
      }

      this._manageScrollEffect( operationType, startIndex, requestSize, removalCount, true );

      this.previousTopRows = currentTopRows;

      this.hasScrolled = false;
      this.hasResized = false;
    },

    /* Calculates the number of 'preceding' rows (invisible above the viewport) */

    _determinePrecedingRows: function( visibleScrolledRows ) {
      if ( this.configuration.itemDetails.totalItems <= this.computedMetrics.itemsInDisplayBlock ) return 0;

      if ( visibleScrolledRows < this.configuration.displayBuffer ) return 0;
      else if ( visibleScrolledRows <
        this.computedMetrics.totalContentRows - this.computedMetrics.displayBlockRows + this.configuration.displayBuffer )
        return visibleScrolledRows - this.configuration.displayBuffer;
      else return this.computedMetrics.totalContentRows - this.computedMetrics.displayBlockRows;
    },

    /* Manages scroll requests with debouncing to optimize performance */

    throttleTimerId: null,

    _manageScrollEffect: function( operationType, startIndex, requestSize, removalCount, applyDebounce ) {
      this._updateDisplayBlock( {
        type: operationType,
        start: startIndex,
        size: requestSize,
        remove: removalCount
      } );

      // Skip debouncing for the initial load process
      if ( !applyDebounce ) {
        this._populateEmptySlots();
        return;
      }

      // Populate placeholders only after scrolling activity has ceased
      if ( this.throttleTimerId ) globalScope.clearTimeout( this.throttleTimerId );
      var selfRef = this;
      this.throttleTimerId = globalScope.setTimeout( function() {
        return selfRef._populateEmptySlots.apply( selfRef );
      }, this.configuration.timingConfig.throttleDelay );
    },

    /* Identifies and requests data for empty placeholder elements */

    _populateEmptySlots: function() {
      var startOffset;
      var emptySlots = [];

      // Build an array indicating which list items are currently placeholders
      var selfRef = this;
      this.domElements.contentBlock.children().each( function( index ) {
        if ( index === 0 ) {
          startOffset = globalScope.parseInt( jQuery( this ).attr( 'id' )
            .split( selfRef.configuration.moduleName + '-entry-' )[ 1 ], 10 );
        }
        emptySlots.push( jQuery( this.firstChild )
          .hasClass( selfRef.configuration.moduleName + '-loading-state' ) );
      } );

      // Request data for contiguous runs of empty placeholders
      var consecutiveRegions = this._identifyConsecutiveRegions( emptySlots );
      for ( var i = 0, len = consecutiveRegions.length; i < len; i++ ) {
        if ( consecutiveRegions[ i ].regionValue !== true ) continue; // Only process 'true' (empty) regions

        var requestDetails = {
          startIndex: startOffset + consecutiveRegions[ i ].startIndex,
          requestSize: consecutiveRegions[ i ].regionCount
        };

        this.requestQueue.push( requestDetails );
        this.domElements.mainWrapper.trigger( this.configuration.eventHooks.requestData, requestDetails );
      }
    },

    /* Helper function to find consecutive runs of identical values in an array */

    _identifyConsecutiveRegions: function( inputArray ) {
      var resultSegments = [];

      var startIndex, regionCount, lastValue;
      for ( var i = 0, len = inputArray.length; i < len; i++ ) {
        if ( i === 0 ) {
          startIndex = 0;
          regionCount = 1;
          lastValue = inputArray[ i ];
        } else if ( inputArray[ i ] === lastValue ) {
          regionCount++;
        } else {
          resultSegments.push( {
            startIndex: startIndex,
            regionCount: regionCount,
            regionValue: lastValue
          } );
          startIndex = i;
          regionCount = 1;
          lastValue = inputArray[ i ];
        }

        if ( i === len - 1 ) {
          resultSegments.push( {
            startIndex: startIndex,
            regionCount: regionCount,
            regionValue: lastValue
          } );
        }
      }

      return resultSegments;
    },

    /* Renders loading placeholders and replaces them with actual content */

    _updateDisplayBlock: function( requestInfo ) {
      var eventTrigger = this.configuration.eventHooks.startOperation;
      if ( eventTrigger ) this.domElements.mainWrapper.trigger( eventTrigger );

      // HTML for the loading placeholder (simple div)
      var loadingMarkerHtml = '<div class="' + this.configuration.moduleName + '-loading-state"></div>';
      var loadingMarkup = ( typeof this.configuration.loadingIndicator === 'function' ) ?
        this.configuration.loadingIndicator() : '';

      var generatedHtml = '';
      for ( var i = 0, len = requestInfo.size; i < len; i++ ) {
        var itemId = this.configuration.moduleName + '-entry-' + ( requestInfo.start + i );

        var itemClass = this.configuration.cssClasses.listItemClass;
        var listItemHtml = itemClass ? '<li id="' + itemId + '" class="' + itemClass + '">' :
          '<li id="' + itemId + '">';
        listItemHtml += loadingMarkerHtml + loadingMarkup + '</li>';

        generatedHtml += listItemHtml;
      }

      if ( this.configuration.debugMode ) {
        globalScope.console.info( "[" + requestInfo.type + "]" );
        globalScope.console.info( "start+size:    " + requestInfo.start + "+" + requestInfo.size );
        globalScope.console.info( "remove:        " + requestInfo.remove );
        globalScope.console.info( "----------------------------------------" );
      }

      switch ( requestInfo.type ) {
      case 'down':
        this.domElements.contentBlock.append( generatedHtml )
          .children().slice( 0, requestInfo.remove ).remove();
        break;
      case 'up':
        this.domElements.contentBlock.prepend( generatedHtml )
          .children().slice( -requestInfo.remove ).remove();
        break;
      case 'reload':
        this.domElements.contentBlock.html( generatedHtml );
        break;
      }
    },

    /* Processes a received data response and updates the corresponding elements */

    _processResponseData: function( dataRequest, responseData ) {
      var firstItemId = this.configuration.moduleName + '-entry-' + dataRequest.start;
      var lastItemId = this.configuration.moduleName + '-entry-' + ( dataRequest.start + dataRequest.size );

      var firstElement = jQuery( '#' + firstItemId );
      var targetElements = firstElement.add( firstElement.nextUntil( '#' + lastItemId ) );

      // Replace each placeholder with its actual content
      targetElements.each( function( index ) {
        var currentElement = jQuery( this ).html( responseData.itemHtmlArray[ index ] );

        // Apply optional key-value data attributes
        if ( responseData.itemDataArray && typeof responseData.itemDataArray[ index ] === 'object' ) {
          for ( var dataKey in responseData.itemDataArray[ index ] ) {
            if ( responseData.itemDataArray[ index ].hasOwnProperty( dataKey ) ) {
              currentElement.data( dataKey, responseData.itemDataArray[ index ][ dataKey ] );
            }
          }
        }

        // Apply optional string of CSS classes
        if ( responseData.itemClassArray && typeof responseData.itemClassArray[ index ] === 'string' ) {
          currentElement.addClass( responseData.itemClassArray[ index ] );
        }
      } );

      var eventTrigger = this.configuration.eventHooks.endOperation;
      if ( eventTrigger ) this.domElements.mainWrapper.trigger( eventTrigger );
    },

    /* Other publicly accessible methods for interaction */

    getOverallHeight: function() {
      return this.computedMetrics.totalContentRows * this.configuration.itemDetails.itemHeight;
    },

    getVisibleItemsPerRow: function() {
      return this.computedMetrics.itemsPerVisualRow;
    },

    handleWindowResize: function() {
      if ( !this.configuration.itemDetails ) return; // Ignore if component has not been initialized

      var newLayoutMetrics = this._calculateLayoutConstants();

      // Return if neither the quantized item count per row nor block rows changed
      if ( newLayoutMetrics.itemsPerVisualRow === this.computedMetrics.itemsPerVisualRow &&
        newLayoutMetrics.displayBlockRows === this.computedMetrics.displayBlockRows ) return;

      // Clear pending requests and responses as layout has changed
      this.requestQueue = [];
      this.responseQueue = [];

      // Flag for re-evaluation in the feedback loop
      this.hasResized = true;
    }
  };

  // Attach FlowView to jQuery's fn object for plugin-like usage if needed, or expose globally.
  // (Note: The original code didn't do this explicitly, but a common pattern for jQuery plugins.)
  // jQuery.fn.flowView = function(options) {
  //   return this.each(function() {
  //     if (!jQuery.data(this, 'plugin_flowView')) {
  //       jQuery.data(this, 'plugin_flowView', new FlowView(this, options));
  //     }
  //   });
  // };

} )( jQuery, window );