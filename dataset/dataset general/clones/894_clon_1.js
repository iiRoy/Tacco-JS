// This file is a component of the DupliKit project.
// Module: tab-view.js
// Version: 0.1 pre-release
//
// Project: DupliKit
//
// Description:
//   This module implements the Split View Controller functionality for DupliKit.
//
// Required Libraries:
//   - duplikit.js (main DupliKit library)
//   - rivet.js (UI component framework)


// Ensure the DupliKit global object exists, initializing it if not.
// This is the main application namespace.
var DupliKit = window.DupliKit || { };

// Create or reference the DupliKit.UI namespace.
// This namespace holds all UI-related components.
DupliKit.UI = DupliKit.UI || { };

// Define the DupliKit.UI.TabView module as an Immediately Invoked Function Expression (IIFE).
// This pattern helps encapsulate the module's private members and logic.
DupliKit.UI.TabView = ( function ( object, properties ) {

  // A local variable to reference the global DupliKit namespace for convenience.
  var $space = DupliKit;

  // A self-reference to the current module, useful for recursive calls or internal access.
  var $self = DupliKit.UI.TabView;

  // Initialize a container for shared variables within this module.
  $self.vars = { };

  // Define a collection of utility functions specific to the TabView module.
  $self.utils = {

    // Adjusts the height of the view and the position of the footer
    // based on window orientation changes.
    orientationChange: function ( view, footer ) {
      // Calculate the available vertical space.
      var offset = window.innerHeight - ( footer ? footer.offsetHeight : 0 );

      // Apply the calculated height to the main view element.
      view.style.height = offset - view.offsetTop + "px";

      // If a footer exists, update its top position.
      if ( footer ) {
        footer.style.top = offset + "px";
      }
    },

    // Manages the visibility of header elements based on the active tab/section.
    updateHeader: function ( header, newHeader, index ) {
      // If a new header element is provided, append it to the DOM.
      if ( newHeader ) {
        newHeader.setAttribute( "data-related-index", index );
        header.parentNode.appendChild( newHeader );
      }
      // Otherwise, query for an existing header by its data-related-index.
      else {
        newHeader = header.parentNode.querySelector( "header[data-related-index='" + index + "']" );
      }

      // Hide all header elements within the parent container.
      var headers = header.parentNode.querySelectorAll( "header" );
      for ( var i = 0, j = headers.length; i < j; i++ ) {
        $space.utils.addClass( headers[ i ], $space.utils.parseClass( "hidden" ) );
      }

      // Show the header that corresponds to the currently active section.
      $space.utils.removeClass( newHeader, $space.utils.parseClass( "hidden" ) );
    },

    // Loads content into a specified target element, either from an internal ID or an external URL.
    loadSection: function ( src, header, target, index ) {
      // If there's an ongoing XMLHttpRequest, abort it to prevent conflicts.
      if ( $self.vars.xhr ) {
        $self.vars.xhr.abort( );
      }

      // Check if the source is an internal ID (starts with '#').
      if ( src.charAt( 0 ) === "#" ) {
        var active = target.querySelector( src ),
          children, newHeader;

        // If the target element is found within the current document.
        if ( active ) {
          // Identify and update the relevant header.
          newHeader = active.querySelector( "header" );
          $self.utils.updateHeader( header, newHeader, index );

          // Find all tab-view content children to manage their visibility.
          children = active.parentNode.querySelectorAll( $space.utils.parseClass( ".", "tab-view-content" ) );

          // Hide all content sections.
          for ( var i = 0, j = children.length; i < j; i++ ) {
            $space.utils.addClass( children[ i ], $space.utils.parseClass( "tab-hidden" ) );
          }

          // Display the active content section.
          $space.utils.removeClass( active, $space.utils.parseClass( "tab-hidden" ) );
        }

        // Trigger Rivet's scroll check and enable its utilities.
        $space.utils.Rivet.utils.checkScroll( null, "0", null, target );
        $space.utils.Rivet.utils.enableRivet( );
      }
      // If the source is an external URL, perform an XHR request.
      else {

        // Instantiate a new XMLHttpRequest object.
        $self.vars.xhr = new XMLHttpRequest( );
        var xhr = $self.vars.xhr;

        // Define the callback function for XHR state changes.
        xhr.onreadystatechange = function ( ) {
          if ( xhr.readyState === 4 ) { // When the request is complete.
            if ( xhr.status === 200 || xhr.status === 304 ) { // If successful (OK or Not Modified).

              // Clear the existing content from the target container.
              while ( target.firstChild ) {
                target.removeChild( target.firstChild );
              }

              // Create a document fragment for efficient DOM manipulation.
              var fragment = document.createDocumentFragment( );
              var dummy = document.createElement( "div" );
              dummy.innerHTML = xhr.responseText; // Parse the HTML response.

              // Update the header based on the loaded content.
              var newHeader = dummy.querySelector( "header" );
              $self.utils.updateHeader( header, newHeader, index );

              // Append all child nodes from the parsed response to the fragment.
              for ( var i = 0, j = dummy.childNodes.length; i < j; i++ ) {
                var node = dummy.childNodes[ i ];

                if ( node ) {
                  fragment.appendChild( dummy.childNodes[ i ] );
                }
              }

              // Finally, append the fragment (with all new content) to the target.
              target.appendChild( fragment );

              // Re-check scroll position and enable Rivet.
              $space.utils.Rivet.utils.checkScroll( null, "0", null, target );

            } else {
              // Log any errors if the XHR status is not successful.
              console.log( xhr.status );
            }

            // Always enable Rivet utilities and clear the XHR object after the request.
            $space.utils.Rivet.utils.enableRivet( );
            delete $self.vars.xhr;
          }
        };
        // Open and send the GET request asynchronously.
        xhr.open( "GET", src, true );
        xhr.send( );

      }
    },

    // Displays a specific segment within a segmented control.
    loadSegment: function ( target, src ) {
      var active = target.querySelector( src ),
        children;

      // If the designated active segment content exists.
      if ( active ) {
        // Find all content elements associated with the segmented control.
        children = active.parentNode.querySelectorAll( $space.utils.parseClass( ".", "segmented-control-content" ) );

        // Hide all segments.
        for ( var i = 0, j = children.length; i < j; i++ ) {
          $space.utils.addClass( children[ i ], $space.utils.parseClass( "hidden" ) );
        }

        // Show only the active segment.
        $space.utils.removeClass( active, $space.utils.parseClass( "hidden" ) );
      }

      // Ensure Rivet's scroll and other utilities are active.
      $space.utils.Rivet.utils.checkScroll( null, "0", null, target );
      $space.utils.Rivet.utils.enableRivet( );
    },

    // Sets up event handling for a segmented control.
    segmentedController: function ( content, header ) {
      var controller, target, link, active;
      // Locate the segmented control element.
      controller = header.parentNode.querySelector( $space.utils.parseClass( ".", "segmented-control" ) );
      // Identify the initially active link within the control.
      active = controller.querySelector( $space.utils.parseClass( ".", "segmented-control-active a" ) );

      // Add a touchstart event listener to the parent element of the header.
      header.parentNode.addEventListener( "touchstart", function ( e ) {
        e.stopPropagation( ); // Prevent event from bubbling up further.

        // Re-query the controller in case the DOM has changed.
        controller = header.parentNode.querySelector( $space.utils.parseClass( ".", "segmented-control" ) );

        if ( controller ) {
          target = e.target; // The actual element that was touched.

          // Traverse up the DOM from the touch target to find the 'a' element within the controller.
          while ( target && target !== controller ) {
            if ( target.nodeName.toLowerCase( ) === "a" ) {
              link = target; // Found the anchor tag.
            }

            target = target.parentNode; // Move to the parent node.
          }

          // If a valid link within the controller was clicked.
          if ( target ) {
            var controls = controller.querySelectorAll( "li" ),
              _class = $space.utils.parseClass( "segmented-control-active" );

            // Remove the active class from all segmented control items.
            for ( var i = 0, j = controls.length; i < j; i++ ) {
              $space.utils.removeClass( controls[ i ], _class );
            }

            // Add the active class to the parent (li) of the clicked link.
            $space.utils.addClass( link.parentNode, _class );
            // Load the corresponding segment content.
            $self.utils.loadSegment( content, link.getAttribute( "rel" ) );
          }
        }
      }, false ); // Use the capturing phase for event handling.

      // If an active segment is designated on initialization, load it.
      if ( active ) {
        $self.utils.loadSegment( content, active.getAttribute( "rel" ) );
      }
    }
  };

  // Prepares the view by initializing all 'view' elements with Rivet.
  $self.prepView = function ( object ) {
    var parent = object,
      views = parent.querySelectorAll( "view" );

    // Iterate through each 'view' element and create a new Rivet instance for it.
    for ( var i = 0, j = views.length; i < j; i++ ) {
      new DupliKit.utils.Rivet( {
        target: views[ i ]
      } );
    }
  };

  // Attaches all necessary event listeners for tab navigation and dynamic UI updates.
  $self.addEventListeners = function ( object ) {
    var parent = object,
      view = parent.querySelector( "view > section" ),
      content = view.querySelector( ".ui-dup-rivet-wrapper" ),
      header = parent.querySelector( "view > viewport header" ),
      footer = parent.querySelector( "footer" ),
      tabs = footer.querySelectorAll( "li a" ),
      active = footer.querySelector( "li.ui-dup-tab-active a" ),
      link = active.getAttribute( "rel" );

    // Loop through each tab and attach an event listener.
    for ( var i = 0, j = tabs.length; i < j; i++ ) {
      var tab = tabs[ i ],
        _parent,
        _active = $space.utils.parseClass( "tab-active" );

      // Use 'touchend' for better responsiveness on touch devices.
      tab.addEventListener( "touchend", function ( e ) {
        _parent = this.parentNode;
        header = parent.querySelector( "view > viewport header" ); // Re-query header for potential dynamic changes.
        link = this.getAttribute( "rel" );

        // Only process if the clicked tab is not already active.
        if ( !$space.utils.hasClass( _parent, _active ) ) {
          // Remove the active class from all other tabs.
          for ( var k = 0, l = tabs.length; k < l; k++ ) {
            $space.utils.removeClass( tabs[ k ].parentNode, _active );
          }

          // Temporarily disable Rivet's scrolling while content is loading.
          $space.utils.Rivet.utils.disableRivet( );

          // Add the active class to the clicked tab and load its associated section.
          $space.utils.addClass( _parent, _active );
          $self.utils.loadSection( link, header, content, this.getAttribute( "data-index" ) );
        }
      }, false ); // Event listener options.

      // Assign a data-index attribute to each tab for easy referencing.
      tab.setAttribute( "data-index", i );
    }

    // Load the content for the initially active tab.
    if ( active ) {
      $self.utils.loadSection( link, header, content, active.getAttribute( "data-index" ) );
    }

    // Add a global event listener for window orientation changes.
    window.addEventListener( "orientationchange", function ( ) {
      $self.utils.orientationChange( view, footer );
    }, false );

    // Perform initial setup for orientation and segmented control.
    $self.utils.orientationChange( view, footer );
    $self.utils.segmentedController( content, header );
  };

  // The main initialization function for the TabView module.
  $self.init = function ( ) {
    // Prepare all view elements.
    $self.prepView( object );
    // Attach all necessary event listeners.
    $self.addEventListeners( object );

    // If additional properties are provided, handle them using DupliKit's utility.
    if ( properties ) {
      $space.utils.handleProperties( object, properties );
    }
  }( ); // Immediately invoke the init function upon module definition.

} );