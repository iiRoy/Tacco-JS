( function () {


  let colorMatch = document.cookie.match( "display_theme_color=(.+?)(;|$)" );
  const DISPLAY_TINT = colorMatch && colorMatch.length ? colorMatch[1] : '10,150,10'; // A distinct green color
  const EDGE_SPACING = 12; // Slightly altered padding value


  let connectionHandle = io.connect( window.location.origin );
  let needsReconnection = false;
  let activeStreams; // Holds configuration objects for all active stream panels

  const colorSelector = $( '#color-selection-widget' ); // Renamed ID
  let colorBlock; // Renamed variable, though not used in original, keeping structure

  const pageReloadButton = $( '#page-refresh-control' ); // Renamed ID
  const navigationPanel = $( '#main-navigation-bar' ); // Renamed ID
  const addStreamButton = $( '#add-new-stream' ); // Renamed ID
  const streamContainer = $( '#stream-display-area' ); // Renamed ID

  const layoutSelector = $( '#layout-arrangement-options' ); // Renamed ID
  const incomingDataIndicator = $( '.received_data_alert' ); // Renamed class
  const connectionStatusIndicator = $( '#connection-status-icon' ); // Renamed ID
  const statusNotification = $( '#system-notification-banner' ); // Renamed ID

  let reloadInProgress = false; // Flag to prevent multiple reload sequences
  const streamDataCache = {}; // Stores buffered data for each stream

  let viewportWidth = streamContainer.width();
  let viewportHeight = window.innerHeight - navigationPanel.height();

  let windowResizeDebouncer = null; // Used to debounce window resize events

  const layoutOptions = { // Renamed preference keys and values
    fullScreen: 'full_view',
    horizontalSplit: 'horiz_split',
    verticalSplit: 'vert_split',
    quadrantView: 'quad_view'
  };



  /**
   * Initializes the application state and UI components.
   * Fetches active streams from URL hash, populates the display,
   * attaches event listeners, and sets initial color.
   */
  function initializeApplication () {
    activeStreams = retrieveHashState();

    if ( activeStreams.length ) {
      // Recreate stream panels from the stored hash configuration
      for ( let k = 0, total = activeStreams.length; k < total; k++ ) {
        appendNewStream( activeStreams[k] );
      }
      updateLayerOrder(); // Ensure correct stacking order

      // Trigger filtering for existing streams
      $( '.stream-item input' ).keyup();
    }

    bindEventHandlers(); // Set up all interactive elements
    colorSelector.css( 'background-color', 'rgb(' + DISPLAY_TINT + ')' ); // Apply theme color
    refreshLayoutPreference(); // Set the current tile arrangement
  }



  /**
   * Attaches all primary event listeners to UI elements and socket events.
   */
  function bindEventHandlers () {

    connectionHandle.on( 'connect', function () {
      if ( needsReconnection ) {
        needsReconnection = false;
        initiatePageReload(); // Reload if connection was previously lost
      }
      connectionStatusIndicator.attr( 'title', 'Connected to Server' );
      connectionStatusIndicator.addClass( 'is-active' ); // Visual feedback for connection
    } );

    connectionHandle.on( 'disconnect', function () {
      needsReconnection = true;
      connectionStatusIndicator.attr( 'title', 'Disconnected from Server' );
      connectionStatusIndicator.removeClass( 'is-active' ); // Visual feedback for disconnection
    } );

    connectionHandle.on( 'refresh', initiatePageReload ); // Server-initiated refresh

    layoutSelector.on( 'click', '.layout-option', function () {
      let currentPref = $( this ).data( 'pref-val' ); // Get preference from data attribute
      setLayoutPreference( currentPref );
    } );

    $( window ).on( 'resize', handleWindowResizing ); // Handle browser window resizing

    addStreamButton.on( 'click', 'li a', handleStreamAdditionClick ); // Event for adding new streams
  }



  /**
   * Handles click events for adding a new stream panel.
   * @param {Event} eventObj - The click event object.
   */
  function handleStreamAdditionClick ( eventObj ) {
    eventObj.preventDefault();

    let streamIdentifier = $( this ).attr( 'href' ).substring( 1 );
    let streamCount, newStreamDescriptor;

    // If stream already exists, bring it to front and exit
    if ( $( '#' + streamIdentifier + '-display' ).length ) {
      updateLayerOrder( streamIdentifier );
      return;
    }

    streamCount = $( '.stream-item' ).length; // Count existing stream panels

    newStreamDescriptor = { // Default position for a new stream
      id: streamIdentifier,
      verticalPos: 100 + ( streamCount * 20 ),
      horizontalPos: 100 + ( streamCount * 20 )
    };

    appendNewStream( newStreamDescriptor ); // Create and add the new panel

    activeStreams.push( newStreamDescriptor ); // Add to global list

    updateLayerOrder( newStreamDescriptor.id ); // Bring new stream to front
    refreshLayoutPreference(); // Reapply layout, as a new stream might affect it
    synchronizeHashState(); // Update URL hash with new stream
  }



  /**
   * Manages window resize events, debouncing and updating layout.
   * @param {Event} eventObj - The resize event object.
   */
  function handleWindowResizing ( eventObj ) {
    clearTimeout( windowResizeDebouncer ); // Clear any previous debouncer

    if ( eventObj.target !== window ) {
      clearLayoutPreference(); // Remove active layout if internal element resized
      applyMovingStyle(); // Add a class for visual feedback during drag/resize
    } else if ( !statusNotification.is( ':visible' ) ) {
      statusNotification.find( 'p' ).text( 'Adjusting viewport...' );
      statusNotification.slideDown(); // Show notification for main window resize
    }

    // Debounce actual layout update to occur at most once per 100ms
    windowResizeDebouncer = setTimeout( function () {
      removeMovingStyle(); // Remove visual feedback class
      refreshLayoutPreference(); // Reapply layout based on new window size
      statusNotification.slideUp(); // Hide notification
    }, 100 );
  }



  /**
   * Adds a CSS class to the body to indicate UI elements are being moved or resized.
   */
  function applyMovingStyle () {
    document.body.classList.add( 'is-moving' );
  }



  /**
   * Removes the CSS class from the body after UI elements have settled.
   */
  function removeMovingStyle () {
    document.body.classList.remove( 'is-moving' );
  }



  /**
   * Recalculates and sets the dimensions for the main stream container.
   */
  function adjustContainerDimensions () {
    viewportWidth = streamContainer.width();
    viewportHeight = window.innerHeight - navigationPanel.height();
    streamContainer.height( viewportHeight );
  }



  /**
   * Checks for and applies a stored layout preference, or updates current dimensions.
   */
  function refreshLayoutPreference () {
    adjustContainerDimensions(); // Ensure dimensions are up-to-date

    if ( localStorage.streamLayoutPreference ) {
      setLayoutPreference( localStorage.streamLayoutPreference ); // Apply saved preference
    }
  }



  /**
   * Sets a specific layout preference, updating UI and local storage.
   * @param {string} preferenceKey - The key representing the desired layout.
   */
  function setLayoutPreference ( preferenceKey ) {
    layoutSelector.find( '.layout-option' ).removeClass( 'is-active' ); // Deactivate all layout options
    layoutSelector.find( '[data-pref-val="' + preferenceKey + '"]' ).addClass( 'is-active' ); // Activate selected option
    localStorage.streamLayoutPreference = preferenceKey; // Store preference locally

    applyLayoutPreference( preferenceKey ); // Apply the layout visually
  }



  /**
   * Clears any active layout preference from UI and local storage.
   */
  function clearLayoutPreference () {
    layoutSelector.find( '.layout-option' ).removeClass( 'is-active' ); // Deactivate all layout options
    localStorage.streamLayoutPreference = null; // Remove from local storage
  }



  /**
   * Executes the function corresponding to the given layout preference.
   * @param {string} currentPreference - The layout preference to apply.
   */
  function applyLayoutPreference ( currentPreference ) {
    switch ( currentPreference ) {
      case layoutOptions.fullScreen:
        arrangeTilesFullscreen();
        break;
      case layoutOptions.horizontalSplit:
        arrangeTilesHorizontal();
        break;
      case layoutOptions.verticalSplit:
        arrangeTilesVertical();
        break;
      case layoutOptions.quadrantView:
        arrangeTilesQuadrant();
        break;
    }
    synchronizeHashState(); // Update hash after layout change
  }



  /**
   * Arranges all stream panels to occupy the full viewport.
   */
  function arrangeTilesFullscreen () {
    $( '.stream-item' ).each( function ( idx, panel ) {
      $( panel ).css( {
        width: viewportWidth,
        height: viewportHeight - ( 6 * EDGE_SPACING ),
        left: 0,
        top: 0
      } );
    } );
  }



  /**
   * Arranges stream panels horizontally, splitting the viewport.
   */
  function arrangeTilesHorizontal () {
    $( '.stream-item' ).each( function ( idx, panel ) {
      $( panel ).css( {
        width: ( viewportWidth - ( 2 * EDGE_SPACING ) ) / 2,
        height: ( viewportHeight - ( 6 * EDGE_SPACING ) ),
        left: idx % 2 === 0 ? 0 : viewportWidth / 2,
        top: 0
      } );
    } );
  }



  /**
   * Arranges stream panels vertically, splitting the viewport.
   */
  function arrangeTilesVertical () {
    $( '.stream-item' ).each( function ( idx, panel ) {
      $( panel ).css( {
        width: viewportWidth,
        height: ( viewportHeight - ( 12 * EDGE_SPACING ) ) / 2,
        left: 0,
        top: idx % 2 === 0 ? 0 : viewportHeight / 2
      } );
    } );
  }



  /**
   * Arranges stream panels in a four-quadrant layout.
   */
  function arrangeTilesQuadrant () {
    $( '.stream-item' ).each( function ( idx, panel ) {
      let panelProps = {
        width: ( viewportWidth - ( 2 * EDGE_SPACING ) ) / 2,
        height: ( viewportHeight - ( 12 * EDGE_SPACING ) ) / 2
      };

      switch ( idx % 4 ) {
        case 0:
          panelProps.top = 0;
          panelProps.left = 0;
          break;
        case 1:
          panelProps.top = 0;
          panelProps.left = viewportWidth / 2;
          break;
        case 2:
          panelProps.top = viewportHeight / 2;
          panelProps.left = 0;
          break;
        case 3:
          panelProps.top = viewportHeight / 2;
          panelProps.left = viewportWidth / 2;
          break;
      }

      $( panel ).css( panelProps );
    } );
  }



  /**
   * Initiates a page reload countdown and provides options to cancel or proceed.
   */
  function initiatePageReload () {

    if ( reloadInProgress ) {
      return;
    }

    reloadInProgress = true;

    let reloadTimer;
    let countdownValue = parseInt( pageReloadButton.find( '.countdown-num' ).text(), 10 );

    pageReloadButton.find( '.close-btn' ).click( function ( eventObj ) {
      eventObj.preventDefault();
      clearTimeout( reloadTimer ); // Stop the countdown
      pageReloadButton.fadeOut( function () {
        reloadInProgress = false;
        pageReloadButton.find( '.countdown-num' ).text( 10 ); // Reset timer display
      } );
    } );

    pageReloadButton.fadeIn( function () {
      ( function recursiveCountdown () {
        if ( countdownValue-- > 0 ) {
          pageReloadButton.find( '.countdown-num' ).text( countdownValue );
          reloadTimer = setTimeout( recursiveCountdown, 1000 ); // Continue countdown
          return;
        }
        // If countdown reaches zero, fade out streams and reload
        $( '.stream-item' ).add( pageReloadButton ).fadeOut( function () {
          window.location.reload( true );
        } );
      } )();
    } );

  }



  /**
   * Retrieves and parses the application state from the URL hash.
   * @returns {Array} An array of stream configuration objects.
   */
  function retrieveHashState () {
    try {
      let uriFragment = window.location.hash.substring( 1 );
      // Handle URL encoding if present
      if ( uriFragment[0] === '%' ) {
        uriFragment = decodeURIComponent( uriFragment );
      }
      return JSON.parse( uriFragment );
    }
    catch ( parseError ) {
      // Return empty array if hash is invalid or missing
      return [];
    }
  }



  /**
   * Stores a given data object into the URL hash as a JSON string.
   * @param {Object} dataObject - The data to be stored in the hash.
   */
  function storeHashState ( dataObject ) {
    window.location.hash = JSON.stringify( dataObject );
  }



  /**
   * Updates the URL hash with the current state of all active stream panels.
   */
  function synchronizeHashState () {

    for ( let j = 0; j < activeStreams.length; j++ ) {
      let currentElement = $( '#' + activeStreams[j].id + '-display' );
      // Remove stream from list if its element no longer exists
      if ( !currentElement.length ) {
        activeStreams.splice( j, 1 );
        continue;
      }
      // Update properties from the current element's state
      activeStreams[j].verticalPos = currentElement.position().top;
      activeStreams[j].horizontalPos = currentElement.position().left;
      activeStreams[j].itemWidth = currentElement.width();
      activeStreams[j].itemHeight = currentElement.height();
      activeStreams[j].filterRegex = currentElement.find( 'input' ).val();
    }

    storeHashState( activeStreams ); // Save the updated array to hash
  }



  /**
   * Updates the z-index (layer order) of stream panels, bringing a specified
   * stream to the front if provided.
   * @param {string} [streamIdentifier] - The ID of the stream to bring to front.
   */
  function updateLayerOrder ( streamIdentifier ) {
    let indexVal, totalCount;

    for ( indexVal = 0, totalCount = activeStreams.length; indexVal < totalCount; indexVal++ ) {
      if ( streamIdentifier && activeStreams[indexVal].id === streamIdentifier ) {
        // Move the specified stream to the end of the array (highest z-index)
        activeStreams.push( activeStreams.splice( indexVal, 1 )[0] );
      }

      // Apply z-index based on array position
      $( '#' + activeStreams[indexVal].id + '-display' )
        .css( 'z-index', ( indexVal + 1 ) * 100 )
        .removeClass( 'is-active' ); // Deactivate all initially
    }

    // Activate the top-most stream (last in array)
    $( '#' + activeStreams[indexVal - 1].id + '-display' ).addClass( 'is-active' );
  }



  /**
   * Filters and displays stream output in a preformatted element.
   * @param {jQuery} preElement - The jQuery object for the <pre> element.
   * @param {string} receivedData - New data received for the stream.
   * @param {string} streamId - The identifier of the stream.
   * @param {boolean} [regexModified] - True if the regex filter was just changed.
   */
  function processStreamOutput ( preElement, receivedData, streamId, regexModified ) {

    let currentRegex = preElement.parent().find( 'input' ).data( 'applied-regex' );

    // Initialize cache for stream if it doesn't exist
    if ( !( streamId in streamDataCache ) ) {
      streamDataCache[streamId] = [];
    }

    // Prune old data from cache if it exceeds a certain size
    if ( streamDataCache[streamId].length > 2000 ) {
      streamDataCache[streamId] = streamDataCache[streamId].slice( Math.abs( 1500 - streamDataCache[streamId].length ) );
    }

    if ( receivedData ) {
      // Convert Unix timestamps to human-readable format and split into lines
      receivedData = receivedData.replace( /\b13\d{8,11}\b/, function ( timestampStr ) {
        return '"' + new Date( parseInt( timestampStr.substring( 0, 10 ) ) * 1000 ) + '"';
      } ).split( /\s*\n+/ ).filter( function ( line ) {
        return line;
      } );
      streamDataCache[streamId] = streamDataCache[streamId].concat( receivedData ); // Add new data to cache
    }

    if ( currentRegex ) {
      let filteredLines = [];
      for ( let m = 0, totalLines = streamDataCache[streamId].length; m < totalLines; m++ ) {
        let matchResult = streamDataCache[streamId][m].match( currentRegex ); // Apply regex filter
        if ( matchResult ) {
          filteredLines.push( matchResult.length > 1 && matchResult.slice( 1 ).join( ', ' ) || streamDataCache[streamId][m] );
        }
      }

      preElement.text( filteredLines.join( "\n" ) + "\n" ); // Update display with filtered lines

      if ( regexModified ) {
        preElement.scrollTop( 999999 ); // Scroll to bottom if regex changed
      }
    } else {
      preElement.text( streamDataCache[streamId].join( "\n" ) + "\n" ); // Display all cached data
    }

  }



  /**
   * Appends a new stream display panel to the DOM and sets up its behavior.
   * @param {Object} streamConfig - Configuration object for the new stream.
   */
  function appendNewStream ( streamConfig ) {

    let streamDisplayPanel = $( '<div class="stream-item" id="' + streamConfig.id + '-display" />' );
    let streamListItem = $( '#add-new-stream li:has(a[href="#' + streamConfig.id + '"])' ); // Corresponding item in add menu

    // Apply initial positioning and sizing
    streamDisplayPanel.css( {
      top: streamConfig.verticalPos,
      left: streamConfig.horizontalPos,
      width: streamConfig.itemWidth,
      height: streamConfig.itemHeight
    } );

    // Build the header and content area for the stream panel
    streamDisplayPanel
      .append( '<header>' + streamConfig.id + '<a href="#" class="close-stream-btn">&times;</a><input type="text" placeholder="/regex pattern/" /><button class="toggle-pause-btn btn-small btn-secondary">pause</button></header>' )
      .append( $( '<pre class="stream-output-area" contenteditable="true" />' ).css( 'color', 'rgb(' + DISPLAY_TINT + ')' ) );

    // If a filter regex is present in config, apply it
    if ( streamConfig.filterRegex ) {
      streamDisplayPanel.find( 'input' ).val( streamConfig.filterRegex );
    }

    // Configure draggable, resizable, and click behaviors
    streamDisplayPanel
      .hide() // Initially hidden for fade-in effect
      .draggable( {
        handle: "header", // Only header is draggable area
        containment: streamContainer, // Confine within main container
        stop: function () {
          synchronizeHashState(); // Update hash on drag stop
          clearLayoutPreference(); // Clear fixed layout preference
        }
      } )
      .resizable( { handles: 'se', stop: synchronizeHashState } ) // Resize handle at SE, update hash on stop
      .mousedown( function () {
        updateLayerOrder( streamConfig.id ); // Bring to front on click
        synchronizeHashState(); // Update hash
      } )
      .find( 'header button.toggle-pause-btn' ).click( function ( eventObj ) {
        streamDisplayPanel.toggleClass( 'is-paused' ); // Toggle pause state class
        if ( streamDisplayPanel.hasClass( 'is-paused' ) ) {
          connectionHandle.emit( 'unsubscribe', streamConfig.id + ':raw' ); // Unsubscribe from raw data
          eventObj.target.innerText = 'resume';
        } else {
          connectionHandle.emit( 'subscribe', streamConfig.id + ':raw' ); // Subscribe to raw data
          eventObj.target.innerText = 'pause';
        }
      } ).end()
      .find( 'header input' )
      .keydown( function ( eventObj ) {
        eventObj.stopImmediatePropagation(); // Prevent keydown events from bubbling up
      } )
      .keyup( function ( eventObj ) {

        if ( eventObj.target.value.length === 0 ) {
          let hadRegexPreviously = !!$( this ).data( 'applied-regex' );
          $( this ).data( 'applied-regex', null ); // Clear regex if input is empty
          synchronizeHashState();
          if ( hadRegexPreviously ) {
            processStreamOutput( streamDisplayPanel.find( 'pre' ), null, streamConfig.id, true ); // Re-filter without regex
          }
          return;
        }

        // Attempt to compile and apply the regex
        try {
          let inputValue = eventObj.target.value;
          let currentFilterRegex;
          let regexString = inputValue.replace( /^\//, '' ).replace( /\/[a-z]*$/, '' ); // Extract regex pattern
          let modifiers = inputValue.match( /\/([a-z]+)$/ ); // Extract modifiers (e.g., 'gi')

          if ( modifiers && modifiers.length ) {
            currentFilterRegex = new RegExp( regexString, modifiers[1] );
          } else {
            currentFilterRegex = new RegExp( regexString );
          }

          // If successful, save regex and remove error styling
          $( this ).data( 'applied-regex', currentFilterRegex ).removeClass( 'input-error' );

          synchronizeHashState(); // Update hash with new regex
          processStreamOutput( streamDisplayPanel.find( 'pre' ), null, streamConfig.id, true ); // Re-filter with new regex

        } catch ( compilationError ) {
          console.error( 'Regex compilation issue:', compilationError );
          $( this ).addClass( 'input-error' ); // Add error styling on invalid regex
        }

      } ).end()
      .find( '.stream-output-area' ) // Reference to the <pre> element
      .data( 'auto-scroll-enabled', true ) // Initial auto-scroll state
      .scroll( function ( scrollEvent ) {
        // Update auto-scroll state based on user scroll position
        $( this ).data( 'auto-scroll-enabled', scrollEvent.target.scrollHeight - scrollEvent.target.scrollTop === scrollEvent.target.clientHeight );
      } );

    streamContainer.append( streamDisplayPanel ); // Add panel to the DOM
    streamDisplayPanel.fadeIn( 'fast' ); // Animate its appearance

    // Subscribe to raw data for this new stream
    connectionHandle.emit( 'subscribe', streamConfig.id + ':raw' );
    connectionHandle.on( streamConfig.id + ':raw', function ( incomingPayload ) {

      incomingDataIndicator.addClass( 'is-active' ); // Visual indicator for data activity
      setTimeout( function () {
        incomingDataIndicator.removeClass( 'is-active' );
      }, 800 );

      let outputPre = streamDisplayPanel.find( '.stream-output-area' );
      let outputPreElement = outputPre[0];
      let shouldScroll = outputPreElement.scrollHeight - outputPreElement.scrollTop === outputPreElement.clientHeight;

      processStreamOutput( outputPre, incomingPayload, streamConfig.id ); // Process and display data

      if ( shouldScroll ) {
        outputPre.scrollTop( 999999 ); // Auto-scroll to bottom if enabled
      }

    } );

    // Handle stream panel closure
    streamDisplayPanel.find( 'a.close-stream-btn' ).click( function ( closeEvent ) {

      closeEvent.preventDefault();

      streamListItem.removeClass( 'is-active' ); // Deactivate corresponding list item

      connectionHandle.emit( "unsubscribe", streamConfig.id + ":raw" ); // Unsubscribe from socket
      connectionHandle.removeListener( streamConfig.id + ":raw", function ( payload ) {
        streamDisplayPanel.find( '.stream-output-area' ).append( payload );
      } ); // Remove specific listener
      streamDisplayPanel.remove(); // Remove panel from DOM

      synchronizeHashState(); // Update hash after removal

    } );

  }


  initializeApplication(); // Kick off the application

} )();