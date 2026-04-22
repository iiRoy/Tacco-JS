window.requestAnimFrame = ( function( ) {
  // This is a polyfill for requestAnimationFrame, providing smoother animations.
  // It checks for various browser-specific implementations before falling back
  // to setTimeout.
  return  window.requestAnimationFrame        ||    // Standard
          window.webkitRequestAnimationFrame  ||    // Webkit browsers
          window.mozRequestAnimationFrame     ||    // Mozilla browsers
          /* Fallback to setTimeout if no native method is available. */
          function( callback ) {
             // Calls the callback function at approximately 60 frames per second.
            window.setTimeout( callback, 1000 / 60 );
          }
;
} ) ( ) ;

window.cancelRequestAnimFrame = ( function( ) {
    // This is a polyfill for cancelAnimationFrame, used to stop animation loops.
    // It looks for different browser implementations and falls back to clearTimeout.
    return window.cancelAnimationFrame           ||   // Standard
           window.webkitCancelRequestAnimationFrame    ||   // Webkit
           window.mozCancelRequestAnimationFrame       ||   // Mozilla
           window.oCancelRequestAnimationFrame         ||   // Opera (older)
           window.msCancelRequestAnimationFrame        ||   // IE (older)
           clearTimeout                                     // Fallback
} ) ( ) ;


var Intense = ( function( ) {

    // Enable strict mode for better error handling and cleaner code.
    'use strict' ;

    // Define a constant for the Escape key's keycode.
    var KEYCODE_ESC = 27 ;

    // Object to track both current and desired mouse coordinates.
    // xCurr, yCurr are eased coordinates; xDest, yDest are actual mouse positions.
    var mouse = { xCurr: 0, yCurr: 0, xDest: 0, yDest: 0 } ;

    // Flag to determine if the image fits horizontally or vertically.
    var horizontalOrientation = true ;

    // Variable to hold the ID of the animation frame, for cancellation.
    var looper ;
  
    // Variables to track the scroll position of the interactive element.
    var lastPosition, currentPosition = 0 ;
    
    // Stores original dimensions of the source image and the target element (image).
    var sourceDimensions, target ;
    // Stores the current rendered dimensions of the target image.
    var targetDimensions = { w: 0, h: 0 } ;
  
    // The main container element for the viewer.
    var container ;
    // Dimensions of the viewer container.
    var containerDimensions = { w: 0, h: 0 } ;
    // The area where the image can overflow within the container.
    var overflowArea = { x: 0, y: 0 } ;

    // Stores the body's overflow style before it's locked, to restore it later.
    var overflowValue ;

    /* --------------------------------------------------------------------------
     *                       U T I L I T Y   F U N C T I O N S
     * -------------------------------------------------------------------------- */

    // Soft object augmentation: extends target with properties from source
    // only if they don't already exist in target.
    function extend( target, source ) {

        for ( var key in source ) {
            // Check if the key already exists in the target object.
            if ( !( key in target ) ) {
                target[ key ] = source[ key ] ;
            }
        }
        return target ;
    }

    // Applies a dictionary of CSS properties to a given DOM element's style.
    function applyProperties( target, properties ) {

      for ( var key in properties ) {
        target.style[ key ] = properties[ key ] ;
      }
    }

    // Determines if the image fits better horizontally or vertically within the window,
    // and calculates its appropriate scaled dimensions.
    function getFit( source ) {

      // Calculate ratio if fitting by height.
      var heightRatio = window.innerHeight / source.h ;

      // If fitting by height makes the width exceed the window width,
      // it means the image is wider than the screen at full height.
      if ( ( source.w * heightRatio ) > window.innerWidth ) {
        // Image fits horizontally (it's wider than tall relative to screen).
        return { w: source.w * heightRatio, h: source.h * heightRatio, fit: true } ;
      } else {
        // Image fits vertically (it's taller than wide relative to screen).
        var widthRatio = window.innerWidth / source.w ;
        return { w: source.w * widthRatio, h: source.h * widthRatio, fit: false } ;
      }
    }

    /* --------------------------------------------------------------------------
     *                       A P P L I C A T I O N   L O G I C
     * -------------------------------------------------------------------------- */

    // Initiates tracking for one or more elements.
    function startTracking( passedElements ) {

      var i ; // Loop counter.

      // Check if an array of elements was passed.
      if ( passedElements.length ) {

        // Loop through each element in the array and track it.
        for ( i = 0; i < passedElements.length; i++ ) {
          track( passedElements[ i ] ) ;
        }

      } else {
          // If it's a single element, track it directly.
          track( passedElements ) ;
      }
    }

    // Attaches a click event listener to an element to initialize the viewer.
    function track( element ) {

      // Ensure the element has an image source (data-image or src attribute).
      if ( element.getAttribute( 'data-image' ) || element.src ) {
        element.addEventListener( 'click', function( ) {
          // 'this' refers to the clicked element.
          init( this ) ;
        }, false ) ;
      }
    }
  
    // Starts the animation loop.
    function start( ) { 
      loop( ) ; // Begin the animation.
    }
   
    // Stops the animation loop.
    function stop( ) {
      cancelRequestAnimFrame( looper ) ; // Cancel the currently scheduled animation frame.
    }

    // The main animation loop, continuously calling itself.
    function loop( ) {
        looper = requestAnimFrame( loop ) ; // Request next animation frame.
        positionTarget( ) ;                 // Update the target's position.
    }

    // Prevents scrolling on the document body by setting its overflow to 'hidden'.
    function lockBody( ) {

      // Store the current overflow value before changing it.
      overflowValue = document.body.style.overflow ;
      document.body.style.overflow = 'hidden' ; // Disable scrolling.
    }

    // Restores the document body's overflow style to its original value.
    function unlockBody( ) {
      document.body.style.overflow = overflowValue ; // Re-enable scrolling.
    }

    // Creates and displays the image viewer with title and caption.
    function createViewer( title, caption ) {

      /*
       *  Container Element Setup
       */
      var containerProperties = {
        'backgroundColor': 'rgba(0,0,0,0.8)', // Semi-transparent black background.
        'width': '100%',
        'height': '100%',
        'position': 'fixed',                  // Fixed position relative to viewport.
        'top': '0px',
        'left': '0px',
        'overflow': 'hidden',                 // Hide any overflow within the container.
        'zIndex': '999999',                   // Ensure it's on top of other content.
        'margin': '0px',
        'webkitTransition': 'opacity 150ms cubic-bezier( 0, 0, .26, 1 )', // Webkit transition.
        'MozTransition': 'opacity 150ms cubic-bezier( 0, 0, .26, 1 )',    // Mozilla transition.
        'transition': 'opacity 150ms cubic-bezier( 0, 0, .26, 1 )',       // Standard transition.
        'opacity': '0'                        // Start with opacity 0 for fade-in.
      } ;
      container = document.createElement( 'figure' ) ; // Create a figure element for semantic grouping.
      container.appendChild( target ) ;                  // Append the image to the figure.
      applyProperties( container, containerProperties ) ; // Apply the defined CSS properties.

      // Image specific properties.
      var imageProperties = {
        // Custom cursor for dragging the image.
        'cursor': 'url( "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3Q0IyNDI3M0FFMkYxMUUzOEQzQUQ5NTMxMDAwQjJGRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3Q0IyNDI3NEFFMkYxMUUzOEQzQUQ5NTMxMDAwQjJGRCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuZGlkOjdDQjI0MjcxQUUyRjExRTM4RDNBRDk1MzEwMDBCMkZEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjdDQjI0MjcyQUUyRjExRTM4RDNBRDk1MzEwMDBCMkZEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+soZ1WgAABp5JREFUeNrcWn9M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" ) 25 25, no-drop'
      } ;
      applyProperties( target, imageProperties ) ;

      /*
       *  Caption Container Element Setup
       */
      var captionContainerProperties = {
        'fontFamily': 'Georgia, Times, "Times New Roman", serif', // Classic serif font.
        'position': 'fixed',
        'bottom': '0px',
        'left': '0px',
        'padding': '20px',
        'color': '#fff',                      // White text.
        'wordSpacing': '0.2px',
        'webkitFontSmoothing': 'antialiased', // Smooth font rendering for Webkit.
        'textShadow': '-1px 0px 1px rgba(0,0,0,0.4)' // Subtle text shadow.
      } ;
      var captionContainer = document.createElement( 'figcaption' ) ; // Semantic figcaption.
      applyProperties( captionContainer, captionContainerProperties ) ;

      /*
       *  Caption Title Element Setup
       */
      if ( title ) { // Only create if a title is provided.
        var captionTitleProperties = {
          'margin': '0px',
          'padding': '0px',
          'fontWeight': 'normal',
          'fontSize': '40px',
          'letterSpacing': '0.5px',
          'lineHeight': '35px',
          'textAlign': 'left'
        } ;
        var captionTitle = document.createElement( 'h1' ) ; // Title as H1.
        applyProperties( captionTitle, captionTitleProperties ) ;
        captionTitle.innerHTML = title ; // Set the title text.
        captionContainer.appendChild( captionTitle ) ;
      }

      /*
       *  Caption Text Element Setup
       */
      if ( caption ) { // Only create if a caption is provided.
        var captionTextProperties = {
          'margin': '0px',
          'padding': '0px',
          'fontWeight': 'normal',
          'fontSize': '20px',
          'letterSpacing': '0.1px',
          'maxWidth': '500px',
          'textAlign': 'left',
          'background': 'none',
          'marginTop': '5px'
        } ;
        var captionText = document.createElement( 'h2' ) ; // Caption as H2.
        applyProperties( captionText, captionTextProperties ) ;
        captionText.innerHTML = caption ; // Set the caption text.
        captionContainer.appendChild( captionText ) ;
      }

      container.appendChild( captionContainer ) ; // Add caption to the main container.

      setDimensions( ) ; // Calculate and set initial dimensions for the viewer.

      // Initialize mouse positions to the center of the window.
      mouse.xCurr = mouse.xDest = window.innerWidth / 2 ;
      mouse.yCurr = mouse.yDest = window.innerHeight / 2 ;
      
      document.body.appendChild( container ) ; // Add the entire viewer to the document body.
      // Small delay to allow the element to be rendered before applying the fade-in transition.
      setTimeout( function( ) {
        container.style[ 'opacity' ] = '1' ; // Fade in the viewer.
      }, 10 ) ;
    }

    // Removes the image viewer from the DOM and cleans up.
    function removeViewer( ) {

      unlockBody( ) ;            // Restore body scrolling.
      unbindEvents( ) ;          // Remove all event listeners.
      stop( ) ;                  // Stop the animation loop.
      document.body.removeChild( container ) ; // Remove the viewer container from the DOM.
    }

    // Recalculates and sets the dimensions of the image and container based on window size.
    function setDimensions( ) {

      // Retrieve dimensions based on fitting the image to the window.
      var imageDimensions = getFit( sourceDimensions ) ;
      target.width = imageDimensions.w ;
      target.height = imageDimensions.h ;
      horizontalOrientation = imageDimensions.fit ; // Update orientation flag.

      // Update stored dimensions.
      targetDimensions = { w: target.width, h: target.height } ;
      containerDimensions = { w: window.innerWidth, h: window.innerHeight } ;
      // Calculate the overflow area (how much the image can move beyond container bounds).
      overflowArea = { x: containerDimensions.w - targetDimensions.w, y: containerDimensions.h - targetDimensions.h } ;

    }

    // Initializes the image viewer when an element is clicked.
    function init( element ) {

      var imageSource = element.getAttribute( 'data-image' ) || element.src ; // Get image URL.
      var title = element.getAttribute( 'data-title' ) ;                     // Get title.
      var caption = element.getAttribute( 'data-caption' ) ;                 // Get caption.
      
      var img = new Image( ) ; // Create a new Image object to pre-load.
      img.onload = function( ) {

        sourceDimensions = { w: img.width, h: img.height } ; // Save original dimensions.
        target = this ;                                      // Set the target image to the loaded image.
        createViewer( title, caption ) ;                     // Create the viewer UI.
        lockBody( ) ;                                        // Lock body scrolling.
        bindEvents( ) ;                                      // Attach event listeners for interaction.
        loop( ) ;                                            // Start the animation loop.
      } ;

      img.src = imageSource ; // Start loading the image.
    }

    // Binds all necessary event listeners for viewer interaction.
    function bindEvents( ) {

      container.addEventListener( 'mousemove', onMouseMove,   false ) ; // Mouse movement.
      container.addEventListener( 'touchmove', onTouchMove,   false ) ; // Touch movement.
      window.addEventListener(    'resize',    setDimensions, false ) ; // Window resize.
      window.addEventListener(    'keyup',     onKeyUp,       false ) ; // Keyboard input.
      target.addEventListener(    'click',     removeViewer,  false ) ; // Click on image to close.
    }

    // Unbinds all event listeners to clean up resources when viewer is closed.
    function unbindEvents( ) {

      container.removeEventListener( 'mousemove', onMouseMove,   false ) ;
      container.removeEventListener( 'touchmove', onTouchMove,   false ) ;
      window.removeEventListener(    'resize',    setDimensions, false ) ;
      window.removeEventListener(    'keyup',     onKeyUp,       false ) ;
      target.removeEventListener(    'click',     removeViewer,  false ) ;
    }
  
    // Handles mouse movement events to update the target mouse coordinates.
    function onMouseMove( event ) {

      mouse.xDest = event.clientX ; // Update destination X.
      mouse.yDest = event.clientY ; // Update destination Y.
    }

    // Handles touch movement events, preventing default scrolling and updating coordinates.
    function onTouchMove( event ) {

      event.preventDefault( ) ; // Prevent default touch behavior (e.g., scrolling).
      mouse.xDest = event.touches[ 0 ].clientX ; // Get X from first touch.
      mouse.yDest = event.touches[ 0 ].clientY ; // Get Y from first touch.
    }

    // Handles keyboard input, specifically for closing the viewer with the Escape key.
    function onKeyUp( event ) {

      event.preventDefault( ) ; // Prevent default key actions.
      if ( event.keyCode === KEYCODE_ESC ) {
        removeViewer( ) ; // Close the viewer if Escape is pressed.
      } 
    }
  
    // Positions the target image based on mouse coordinates and overflow area.
    function positionTarget( ) {

      // Ease the current mouse position towards the destination mouse position.
      mouse.xCurr += ( mouse.xDest - mouse.xCurr ) * 0.05 ;
      mouse.yCurr += ( mouse.yDest - mouse.yCurr ) * 0.05 ;

      if ( horizontalOrientation === true ) {

        // --- HORIZONTAL SCANNING LOGIC ---
        // Smoothly update the current position.
        currentPosition += ( mouse.xCurr - currentPosition ) ;
        // Only update transform if mouse has actually moved.
        if ( mouse.xCurr !== lastPosition ) {
          var position = parseFloat( currentPosition / containerDimensions.w ) ;
          position = overflowArea.x * position ; // Calculate final transform position.
          // Apply 3D transform for hardware acceleration.
          target.style[ 'webkitTransform' ] = 'translate3d(' + position + 'px, 0px, 0px)' ;
          target.style[ 'MozTransform' ] = 'translate3d(' + position + 'px, 0px, 0px)' ;
          target.style[ 'msTransform' ] = 'translate3d(' + position + 'px, 0px, 0px)' ;
          lastPosition = mouse.xCurr ; // Update last known mouse position.
        }
      } else if ( horizontalOrientation === false ) {

        // --- VERTICAL SCANNING LOGIC ---
        // Smoothly update the current position.
        currentPosition += ( mouse.yCurr - currentPosition ) ;
        // Only update transform if mouse has actually moved.
        if ( mouse.yCurr !== lastPosition ) {
          var position = parseFloat( currentPosition / containerDimensions.h ) ;
          position = overflowArea.y * position ; // Calculate final transform position.
          // Apply 3D transform for hardware acceleration.
          target.style[ 'webkitTransform' ] = 'translate3d( 0px, ' + position + 'px, 0px)' ;
          target.style[ 'MozTransform' ] = 'translate3d( 0px, ' + position + 'px, 0px)' ;
          target.style[ 'msTransform' ] = 'translate3d( 0px, ' + position + 'px, 0px)' ;
          lastPosition = mouse.yCurr ; // Update last known mouse position.
        }
      }
    }

    // Main initialization function for the Intense library.
    function main( element ) {

      // Argument parsing and validation.
      if ( !element ) {
        throw 'You need to pass an element!' ; // Error if no element is provided.
      }

      startTracking( element ) ; // Begin tracking the specified element(s).
    }

    // Return the main function, augmented with public methods.
    return extend( main, {
        resize: setDimensions, // Public method to manually trigger a resize calculation.
        start: start,          // Public method to start the animation loop.
        stop: stop             // Public method to stop the animation loop.
    } ) ;

} ) ( ) ;