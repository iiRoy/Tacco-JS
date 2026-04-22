'use strict'; /* This line enables strict mode, enforcing stricter parsing and error handling rules for better code quality. */

// This JavaScript file is dedicated to defining Angular directives for the 'hotspotModule'.
// It's a crucial component within an application designed to facilitate the creation and management
// of interactive hotspots on various images.

angular.module(
  'hotspotModule', // The unique name of this Angular module.
  []             // An empty array indicating that this module has no external dependencies.
                 // If it needed other modules, they would be listed here.
)

// The 'hotspotCreator' directive is registered here.
.directive('hotspotCreator', function ( ) {
  // This directive's primary role is to provide a user interface for creating,
  // manipulating (resizing, dragging), and configuring interactive hotspots on an image.
  // It encapsulates the logic and presentation for this functionality.

  return {
    // 'scope' defines an isolated scope for the directive, allowing it to have
    // its own properties without inheriting from the parent scope, promoting reusability.
    scope: {
      imageSrc: '=imageSrc', // Bidirectional binding: 'imageSrc' attribute on the directive
                             // maps to the 'imageSrc' property in the isolated scope.
      hotspots: '=hotspots', // Bidirectional binding for an array that holds all hotspot data.
                             // Changes in the scope or parent will reflect in each other.
      options:  '=options',  // Bidirectional binding for a configuration object
                             // that can control various behaviors of the directive.
    },

    // 'restrict' specifies how the directive can be used in HTML.
    // 'E' means it can only be used as an element (e.g., `<hotspot-creator>`).
    // Other options include 'A' for attribute, 'C' for class, 'M' for comment.
    restrict: 'E',

    // 'templateUrl' points to an external HTML file that serves as the directive's template.
    // This separates structure from logic, making the directive's view easily maintainable.
    templateUrl: 'partials/fragments/hotspotCreator.html',

    // 'replace: true' means the directive's custom tag (`<hotspot-creator>`)
    // will be entirely replaced by the content of its template.
    replace: true,

    // The 'link' function is responsible for manipulating the DOM,
    // registering event listeners, and observing changes on the scope.
    // It's executed after the template has been compiled and linked to the scope.
    link: function ( scope, iElm, iAttrs, controller ) {
      // A property on the scope to hold a reference to the main HTML element
      // where hotspots will be created and arranged.
      scope.creatorHtml;

      // A placeholder string, potentially for displaying hotspot data in JSON format
      // or for debugging purposes. It's initialized with a simple value.
      scope.hotspotJsonString = 'hello';

      /**
       * @function init
       * @description This function serves as the primary initialization routine for the directive.
       * It handles loading external JavaScript (jQuery UI) and CSS, and sets up essential
       * watchers to react to changes in the directive's input properties.
       * This ensures the environment is ready and responsive to configuration changes.
       */
      scope.init = function ( ) {
        // Dynamically create a new `<script>` element to load the jQuery UI library.
        // This ensures jQuery UI is available for draggable and resizable functionalities.
        var jquiScript = document.createElement( 'script' );

        // Set the 'type' attribute for the script element.
        jquiScript.type = 'text/javascript';

        // Enable asynchronous loading to prevent blocking the rendering of the page.
        jquiScript.async = true;

        // Specify the source URL for the jQuery UI minified library.
        jquiScript.src = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.min.js';

        // Define an 'onload' event handler for the script. This function will be executed
        // once the jQuery UI script has been successfully loaded and parsed by the browser.
        jquiScript.onload = function ( ) {
          // After jQuery UI is ready, set up the click event listeners
          // that allow users to add new hotspots to the image.
          scope.createClickEvents( );
        };

        // Find the first existing `<script>` tag in the document.
        // This is a common pattern to insert dynamically created scripts into the DOM.
        var s = document.getElementsByTagName( 'script' ) [ 0 ];

        // Insert the newly created jQuery UI script element before the first existing script.
        s.parentNode.insertBefore( jquiScript, s );

        // Dynamically create a new `<link>` element to load the jQuery UI stylesheet.
        // This ensures that jQuery UI widgets (like draggable/resizable handles) are styled correctly.
        var jquiStyle = document.createElement( 'link' );

        // Set the 'rel' (relationship) attribute to "stylesheet" to indicate its purpose.
        jquiStyle.rel = "stylesheet";

        // Specify the URL for the jQuery UI theme stylesheet.
        jquiStyle.href = "http://code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css";

        // Find the first existing `<link>` tag in the document.
        var firstLink = document.getElementsByTagName( 'link' ) [ 0 ];

        // Insert the new jQuery UI stylesheet before the first existing link tag.
        firstLink.parentNode.insertBefore( jquiStyle, firstLink );

        // Set up a '$watchCollection' on the 'options' object.
        // '$watchCollection' is used for watching properties of an object or elements of an array.
        // The 'true' argument enables deep watching, meaning it will detect changes within nested properties.
        scope.$watchCollection( 'options', function ( newValue ) {
          // When the 'options' object changes, specifically update the draggable status
          // of the hotspots based on the 'hotspotDraggable' property in the new options.
          scope.setHotspotDraggable( newValue.hotspotDraggable );
        }, true );

        // Obtain a reference to the main container element where hotspots are arranged.
        // This element's dimensions are crucial for positioning and resizing hotspots.
        var parent = angular.element( '#hotspotCreator .hotspotCreator-arrange' );

        // Set up a '$watch' on the 'imageSrc' property.
        // This watches for changes in the image source URL provided to the directive.
        scope.$watch( 'imageSrc', function ( newValue, oldValue ) {
          // When the image source changes, remove any inline 'style' attributes
          // from the parent container. This ensures a clean slate for new image dimensions.
          parent.removeAttr( 'style' );

          // Attach a 'load' event handler to the image element.
          // This function executes once the image has fully loaded.
          jQuery( '.hotspotCreator-image' ).load( function ( ) {
            // After the image loads, update the height of the parent container
            // to match the loaded image's height.
            parent.css( 'height', jQuery( this ).css( 'height' ) );
            // Similarly, update the width of the parent container to match the image's width.
            parent.css( 'width',  jQuery( this ).css( 'width' ) );
          } );

        } );

      }; // End of the 'scope.init' function definition.

      /**
       * @function createClickEvents
       * @description This function initializes the event listener for adding new hotspots.
       * It attaches a 'mousedown' event to the hotspot creation area, enabling users
       * to click on the image to place new hotspots.
       */
      scope.createClickEvents = function ( ) {
        // Get a reference to the DOM element that serves as the interactive area
        // for creating and arranging hotspots.
        scope.creatorHtml = angular.element( '.hotspotCreator-arrange' );

        // Attach a 'mousedown' event listener to the creator HTML element.
        // This listener will trigger whenever the user clicks within this area.
        scope.creatorHtml.on( 'mousedown', function ( event ) {
          // Initialize a coordinate object to store the X and Y positions of the click.
          var coor = { X: 0, Y: 0 };
          // Define a 'gap' value. This offset is used to center the newly added hotspot
          // slightly around the exact cursor click point, improving user experience.
          var gap = 10;

          // Check if 'event.offsetX' is undefined. This handles cross-browser compatibility
          // as 'offsetX' is not universally supported (e.g., in Firefox).
          if ( event.offsetX == undefined ) {
            // If 'offsetX' is not available, calculate coordinates using 'pageX'/'pageY'
            // relative to the element's offset from the document.
            coor = {
              X: event.pageX - jQuery( this ).offset( ).left - gap,
              Y: event.pageY - jQuery( this ).offset( ).top  - gap
            };
          } else {
            // If 'offsetX' is available, use it directly, adjusting for the gap.
            coor = {
              X: event.offsetX - gap,
              Y: event.offsetY - gap
            };
          }

          // Use '$apply' to ensure that Angular's digest cycle runs and updates the view.
          // This is necessary because the 'mousedown' event is outside of Angular's direct control.
          scope.$apply( function ( ) {
            scope.addHotspot( coor );           // Call the function to add a new hotspot at the calculated coordinates.
            scope.getUnitInPercentages( ); // After adding, recalculate all hotspot positions/sizes
                                                // to ensure they are expressed correctly as percentages.
          } );

          // Stop the propagation of the 'mousedown' event. This prevents the event
          // from bubbling up to parent elements and potentially triggering other handlers.
          event.stopPropagation( );
        } );
      }; // End of the 'scope.createClickEvents' function.

      /**
       * @function addHotspot
       * @description This function is responsible for adding a new hotspot data object
       * to the `scope.hotspots` array. This action will typically trigger Angular
       * to render a new hotspot element in the UI.
       * @param {Object} coord - An object containing the 'X' and 'Y' pixel coordinates
       *                         where the new hotspot should be initially placed.
       */
      scope.addHotspot = function ( coord ) {
        // Push a new JavaScript object, representing a hotspot, into the 'hotspots' array.
        // This object contains properties like 'name' and 'position'.
        scope.hotspots.push( {
          name: 'hotspot added', // A default descriptive name for the newly created hotspot.
          position: {            // An object defining the initial top and left position of the hotspot.
            top:  coord.Y,       // The 'top' position, derived from the click's Y coordinate.
            left: coord.X        // The 'left' position, derived from the click's X coordinate.
          }
        } );
      }; // End of the 'scope.addHotspot' function.

      /**
       * @function setUpHotspot
       * @description This function initializes the interactive features (resizing and dragging)
       * for all hotspot elements currently present in the DOM. It is typically called
       * whenever hotspots are rendered or their configuration might need to be re-applied.
       */
      scope.setUpHotspot = function ( ) {
        // Select all elements that represent individual hotspots within the creator area
        // and iterate over each one using jQuery's 'each' method.
        angular.element( '#hotspotCreator .hotspotCreator-hotspot' ).each( function ( index ) {
          // Make the current hotspot element resizable using the jQuery UI resizable widget.
          jQuery( this ).resizable( {
            containment: "parent", // Constrain the resizing operation within the bounds
                                   // of the hotspot's immediate parent container.
            stop: function ( event ) {
              // When the user finishes resizing a hotspot, update its dimensions
              // in the scope and recalculate all hotspot sizes/positions as percentages.
              scope.$apply( scope.getUnitInPercentages( ) );
            }
          } );

          // Check if the 'hotspotDraggable' option is enabled in the directive's options.
          if ( scope.options.hotspotDraggable ) {
            // If dragging is enabled, make the current hotspot element draggable
            // using the jQuery UI draggable widget.
            jQuery( this ).draggable( {
              containment: "parent", // Constrain the dragging operation within the bounds
                                     // of the hotspot's immediate parent container.
              scroll: false,         // Disable automatic scrolling of the window/document
                                     // if the hotspot is dragged near the edge.
              stop: function ( ) {
                // When the user finishes dragging a hotspot, update its position
                // in the scope and recalculate all hotspot positions/sizes as percentages.
                scope.$apply( scope.getUnitInPercentages( ) );
              }
            } );
            // Change the cursor style to 'move' when hovering over a draggable hotspot,
            // visually indicating that it can be moved.
            jQuery( this ).css( 'cursor', 'move' );
          } else {
            // If dragging is disabled, set the cursor style to 'default'.
            jQuery( this ).css( 'cursor', 'default' );
          }

          // Attach a 'mousedown' event handler to the hotspot itself.
          // This prevents the 'mousedown' event from propagating to the parent container,
          // which might otherwise trigger the creation of a new hotspot when clicking an existing one.
          jQuery( this ).mousedown( function ( ) {
            return false; // Return false to prevent default mousedown behavior and stop propagation.
          } );

          // Check if the current hotspot in the 'scope.hotspots' array exists
          // and if it does not yet have a 'position' property.
          // This handles cases where hotspots might be added programmatically without initial positions.
          if ( ! _.isUndefined( scope.hotspots[ index ] ) && ! _.has( scope.hotspots[ index ], "position" ) ) {
            // If no position is defined, assign a random position to the hotspot.
            scope.hotspots[ index ].position = scope.getRandomPosition( );
          }
        } );
      }; // End of the 'scope.setUpHotspot' function.

      /**
       * @function reorganizeHotspotRandom
       * @description Iterates through all existing hotspots and assigns a new random position
       * to each one. This function is useful for shuffling hotspot placements or
       * providing an initial, non-overlapping layout.
       */
      scope.reorganizeHotspotRandom = function ( ) {
        // Loop through each hotspot object present in the 'scope.hotspots' array.
        for ( var i = 0; i < scope.hotspots.length; i ++ ) {
          // Check if the current hotspot object has a 'position' property.
          // This ensures we only attempt to reposition hotspots that are meant to have a position.
          if ( _.has( scope.hotspots[ i ], "position" ) ) {
            // If a position exists, update it with a newly generated random position.
            scope.hotspots[ i ].position = scope.getRandomPosition( );
          }
        }
      }; // End of the 'scope.reorganizeHotspotRandom' function.

      /**
       * @function getRandomPosition
       * @description Generates a set of random 'top' and 'left' coordinates within the
       * boundaries of the parent container, expressed as percentage strings.
       * This ensures hotspots are positioned responsively.
       * @returns {Object} An object containing 'top' and 'left' properties,
       *                   e.g., `{ top: '25%', left: '50%' }`.
       */
      scope.getRandomPosition = function ( ) {
        // Get a reference to the main parent container where hotspots are located.
        var parent = angular.element( '#hotspotCreator .hotspotCreator-arrange' );

        // Retrieve the current computed height and width of the parent container
        // and parse them as floating-point numbers.
        var parentHeight = parseFloat( parent.css( 'height' ) );
        var parentWidth  = parseFloat( parent.css( 'width' ) );

        // Generate a random pixel value for the 'left' position within the parent's width.
        var randomLeft = _.random( 0, parentWidth );
        // Convert the random pixel value to a percentage relative to the parent's width.
        var leftPercentage = ( randomLeft * 100 ) / parentWidth;

        // Generate a random pixel value for the 'top' position within the parent's height.
        var randomTop = _.random( 0, parentHeight );
        // Convert the random pixel value to a percentage relative to the parent's height.
        var topPercentage = ( randomTop * 100 ) / parentHeight;

        // Return an object containing the calculated 'top' and 'left' positions
        // as percentage strings, suitable for CSS styling.
        return {
          top:  topPercentage + '%',
          left: leftPercentage + '%'
        };
      }; // End of the 'scope.getRandomPosition' function.

      /**
       * @function getUnitInPercentages
       * @description This critical function recalculates the position (top, left) and
       * dimensions (width, height) of all hotspots. It converts their current pixel-based
       * values into percentage-based values relative to their parent container.
       * It then updates both the scope's data model and the actual CSS styles of the elements.
       */
      scope.getUnitInPercentages = function ( ) {
        // Get a reference to the parent container, which provides the context for percentage calculations.
        var parent = angular.element( '#hotspotCreator .hotspotCreator-arrange' );

        // Obtain the current height and width of the parent container as floating-point numbers.
        var parentHeight = parseFloat( parent.css( 'height' ) );
        var parentWidth  = parseFloat( parent.css( 'width' ) );

        // Iterate over each hotspot DOM element to update its properties.
        angular.element( '#hotspotCreator .hotspotCreator-hotspot' ).each( function ( index ) {
          var currentElement = jQuery( this ); // The current hotspot element being processed.

          // Retrieve the current pixel values for the hotspot's position and dimensions.
          var hotspotLeft   = parseFloat( currentElement.css( 'left' ) );
          var hotspotTop    = parseFloat( currentElement.css( 'top' ) );
          var hotspotWidth  = parseFloat( currentElement.css( 'width' ) );
          var hotspotHeight = parseFloat( currentElement.css( 'height' ) );

          // Convert the pixel-based 'left' position to a percentage.
          var leftPercentage   = ( hotspotLeft   * 100 ) / parentWidth;
          // Convert the pixel-based 'top' position to a percentage.
          var topPercentage    = ( hotspotTop    * 100 ) / parentHeight;
          // Convert the pixel-based 'width' to a percentage.
          var widthPercentage  = ( hotspotWidth  * 100 ) / parentWidth;
          // Convert the pixel-based 'height' to a percentage.
          var heightPercentage = ( hotspotHeight * 100 ) / parentHeight;

          // Update the 'name' property of the hotspot in the scope's data model.
          scope.hotspots[ index ].name = 'hotspot' + index;
          // Update the 'position' object within the scope's data model with the new
          // percentage-based values for left, top, width, and height.
          scope.hotspots[ index ].position = {
            'left':   leftPercentage   + '%',
            'top':    topPercentage    + '%',
            'width':  widthPercentage  + '%',
            'height': heightPercentage + '%'
          };

          // Apply the calculated percentage-based styles directly to the hotspot's CSS.
          // This ensures that the visual representation matches the data model.
          currentElement.css( {
            'left':   leftPercentage   + '%',
            'top':    topPercentage    + '%',
            'width':  widthPercentage  + '%',
            'height': heightPercentage + '%'
          } );
        } );
      }; // End of the 'scope.getUnitInPercentages' function.

      /**
       * @function setHotspotDraggable
       * @description This function controls the draggable behavior of all hotspots.
       * It can enable or disable the ability for users to drag hotspots around the image.
       * @param {boolean} isDraggable - A boolean value: `true` to enable dragging,
       *                                `false` to disable it.
       */
      scope.setHotspotDraggable = function ( isDraggable ) {
        // Iterate through each hotspot element in the DOM.
        angular.element( '#hotspotCreator .hotspotCreator-hotspot' ).each( function ( index ) {
          if ( isDraggable ) {
            // If 'isDraggable' is true (meaning dragging should be enabled):
            // Check if the current element has already been initialized as a jQuery UI draggable object.
            // This prevents re-initializing draggable if it's already active.
            if ( typeof jQuery( this ).data( 'ui-draggable' ) == 'undefined' ) {
              // If not initialized, create a new draggable instance for the hotspot.
              jQuery( this ).draggable( {
                containment: "parent", // Constrain dragging within the parent.
                scroll: false,         // Disable scrolling during drag.
                stop: function ( ) {
                  // When dragging stops, update all hotspot positions to percentages.
                  scope.getUnitInPercentages( );
                }
              } );
            }
            // Enable the draggable functionality (this works whether it was just initialized or already existed).
            jQuery( this ).draggable( 'enable' );
            // Set the cursor style to 'move' to visually indicate the element is draggable.
            jQuery( this ).css( 'cursor', 'move' );
          } else {
            // If 'isDraggable' is false (meaning dragging should be disabled):
            // Disable the draggable functionality for the hotspot.
            jQuery( this ).draggable( 'disable' );
            // Set the cursor style to 'default' to indicate it's not draggable.
            jQuery( this ).css( 'cursor', 'default' );
          }
        } );
      }; // End of the 'scope.setHotspotDraggable' function.

      // Execute the initialization function immediately when the directive's link function runs.
      // This sets up the directive's environment and initial state.
      scope.init( );
    } // End of the 'link' function.
  }; // End of the 'return' object for the directive definition.
} ); // End of the '.directive' method call.