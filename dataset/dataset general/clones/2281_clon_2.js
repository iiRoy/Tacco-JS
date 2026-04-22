window.renderFrameRunner = ( function () {
  // Provides a cross-browser way to request an animation frame for smooth rendering.
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         function ( frameUpdateCallback ) {
           // Fallback for older browsers: use setTimeout to simulate 60fps.
           window.setTimeout( frameUpdateCallback, 1000 / 60 );
         };
} )();

window.haltRenderFrame = ( function () {
    // Offers a cross-browser method to cancel a previously requested animation frame.
    return window.cancelAnimationFrame ||
           window.webkitCancelRequestAnimationFrame ||
           window.mozCancelRequestAnimationFrame ||
           window.oCancelRequestAnimationFrame ||
           window.msCancelRequestAnimationFrame ||
           clearTimeout; // Generic fallback for cancelling timeouts
} )();


var Zoomify = ( function () {

    'use strict'; // Enforce stricter parsing and error handling in code.

    var KEY_ESCAPE_CODE = 27; // ASCII code for the Escape key.

    // Keeps track of the current and target mouse pointer coordinates.
    // Target coordinates represent the raw, un-eased mouse input.
    var pointerLoc = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 };

    var isLandscapeFit = true; // Determines if the image fits horizontally or vertically.

    // Stores the identifier for the active animation frame request.
    var animationCycleId;
  
    // Variables to track the scrollable element's position.
    var previousScrollPos, activeScrollPos = 0;
    
    var originalImageSize, displayedElement; // Original dimensions and the image element being viewed.
    var displayedElementSize = { width: 0, height: 0 }; // Current rendered size of the image.
  
    var viewerWrapper; // The main container for the image viewer.
    var viewerWrapperSize = { width: 0, height: 0 }; // Dimensions of the viewer container.
    var scrollableRange = { xOffset: 0, yOffset: 0 }; // The total area an image can scroll within its container.

    // Holds the CSS 'overflow' property value of the body before it's modified.
    var initialOverflowSetting;

    /* -------------------------
    /*         UTILITY FUNCTIONS
    /* -------------------------*/

    // Merges properties from a source object into a target object, but only if they don't already exist.
    function augmentObject( destinationObj, sourceObj ) {

        for ( var propKey in sourceObj ) {
            // Only add the property if it's not already present in the destination.
            if ( !( propKey in destinationObj ) ) {
                destinationObj[ propKey ] = sourceObj[ propKey ];
            }
        }
        return destinationObj;
    }

    // Applies a collection of CSS style properties to a given DOM element.
    function setCssStyles( domElement, styleProps ) {

      for ( var styleName in styleProps ) {
        domElement.style[ styleName ] = styleProps[ styleName ];
      }
    }

    // Calculates the optimal fit for an image within the viewport, determining if it's wider or taller.
    function calculateImageFit( imgSize ) {

      var viewportHeightRatio = window.innerHeight / imgSize.height;

      // If scaling by height makes it wider than the viewport, it's a width-constrained fit.
      if ( ( imgSize.width * viewportHeightRatio ) > window.innerWidth ) {
        return { width: imgSize.width * viewportHeightRatio, height: imgSize.height * viewportHeightRatio, isFit: true };
      } else {
        // Otherwise, it's a height-constrained fit.
        var viewportWidthRatio = window.innerWidth / imgSize.width;
        return { width: imgSize.width * viewportWidthRatio, height: imgSize.height * viewportWidthRatio, isFit: false };
      }
    }

    /* -------------------------
    /*           CORE LOGIC
    /* -------------------------*/

    // Begins observing a set of elements for click events to trigger the viewer.
    function beginObservation( elementsToWatch ) {

      var elementIndex;

      // Checks if an array of elements was passed; if so, iterate and observe each one.
      if ( elementsToWatch.length ) {

        // Cycle through all provided elements and set up observation.
        for ( elementIndex = 0; elementIndex < elementsToWatch.length; elementIndex++ ) {
          observeElement( elementsToWatch[ elementIndex ] );
        }

      } else {
          // If it's a single element, just observe that one.
          observeElement( elementsToWatch );
      }
    }

    // Attaches a click listener to an individual element to launch the image viewer.
    function observeElement( currentElement ) {

      // The element must have a 'data-image' attribute or a 'src' to be trackable.
      if ( currentElement.getAttribute( 'data-image' ) || currentElement.src ) {
        currentElement.addEventListener( 'click', function () {
          initializeViewing( this ); // 'this' refers to the clicked element.
        }, false );
      }
    }
  
    // Kicks off the animation loop.
    function initiateRender() { 
      renderCycle();
    }
   
    // Halts the ongoing animation loop.
    function terminateRender() {
      haltRenderFrame( animationCycleId );
    }

    // The main animation loop that requests new frames and updates the image position.
    function renderCycle() {
        animationCycleId = renderFrameRunner( renderCycle ); // Request the next frame.
        updateElementPosition(); // Adjust the image's visual placement.
    }

    // Prevents scrolling on the document body by setting its overflow style.
    function disableBodyScroll() {

      initialOverflowSetting = document.body.style.overflow; // Save the current overflow state.
      document.body.style.overflow = 'hidden'; // Hide the body's scrollbars.
    }

    // Restores the document body's overflow style to its original value.
    function enableBodyScroll() {
      document.body.style.overflow = initialOverflowSetting; // Revert to the saved overflow state.
    }

    // Creates and configures the image viewing overlay with the provided image, title, and caption.
    function constructImageViewer( imgTitle, imgCaption ) {

      /*
       *  Viewer Container Setup
       */
      var viewerContainerStyles = {
        'backgroundColor': 'rgba(0,0,0,0.8)',
        'width': '100%',
        'height': '100%',
        'position': 'fixed',
        'top': '0px',
        'left': '0px',
        'overflow': 'hidden',
        'zIndex': '999999',
        'margin': '0px',
        'webkitTransition': 'opacity 150ms cubic-bezier( 0, 0, .26, 1 )',
        'MozTransition': 'opacity 150ms cubic-bezier( 0, 0, .26, 1 )',
        'transition': 'opacity 150ms cubic-bezier( 0, 0, .26, 1 )',
        'opacity': '0' // Start invisible to fade in.
      };
      viewerWrapper = document.createElement( 'figure' ); // Use a figure element for semantic grouping.
      viewerWrapper.appendChild( displayedElement ); // Add the image to its wrapper.
      setCssStyles( viewerWrapper, viewerContainerStyles ); // Apply defined styles.

      var imageDisplayStyles = {
        'cursor': 'url( "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20vYmFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjdDQjI0MjczQUUyRjExRTM4RDNBRDk1MzEwMDBCMkZEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjdDQjI0MjczQUUyRjExRTM4RDNBRDk1MzEwMDBCMkZEIi8+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjdDQjI0MjcxQUUyRjExRTM4RDNBRDk1MzEwMDBCMkZEIiBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjdDQjI0MjcyQUUyRjExRTM4RDNBRDk1MzEwMDBCMkZEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+soZ1WgAABp5JREFUeNrcWn9MlVUY/u4dogIapV0gQ0SUO4WAXdT8B5ULc6uFgK3MLFxzFrQFZMtaed0oKTPj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" ) 25 25, no-drop'
      };
      setCssStyles( displayedElement, imageDisplayStyles ); // Apply cursor style to the image.

      /*
       *  Caption Area Setup
       */
      var captionAreaStyles = {
        'fontFamily': 'Georgia, Times, "Times New Roman", serif',
        'position': 'fixed',
        'bottom': '0px',
        'left': '0px',
        'padding': '20px',
        'color': '#fff',
        'wordSpacing': '0.2px',
        'webkitFontSmoothing': 'antialiased',
        'textShadow': '-1px 0px 1px rgba(0,0,0,0.4)'
      };
      var captionFigure = document.createElement( 'figcaption' ); // Semantic element for caption.
      setCssStyles( captionFigure, captionAreaStyles ); // Apply styles to the caption container.

      /*
       *  Caption Title Element
       */
      if ( imgTitle ) {
        var captionTitleStyles = {
          'margin': '0px',
          'padding': '0px',
          'fontWeight': 'normal',
          'fontSize': '40px',
          'letterSpacing': '0.5px',
          'lineHeight': '35px',
          'textAlign': 'left'
        };
        var mainCaptionHeading = document.createElement( 'h1' ); // Heading for the title.
        setCssStyles( mainCaptionHeading, captionTitleStyles );
        mainCaptionHeading.innerHTML = imgTitle;
        captionFigure.appendChild( mainCaptionHeading );
      }

      // Add the caption text if provided.
      if ( imgCaption ) {
        var captionTextStyles = {
          'margin': '0px',
          'padding': '0px',
          'fontWeight': 'normal',
          'fontSize': '20px',
          'letterSpacing': '0.1px',
          'maxWidth': '500px',
          'textAlign': 'left',
          'background': 'none',
          'marginTop': '5px'
        };
        var subCaptionText = document.createElement( 'h2' ); // Sub-heading for the caption text.
        setCssStyles( subCaptionText, captionTextStyles );
        subCaptionText.innerHTML = imgCaption;
        captionFigure.appendChild( subCaptionText );
      }

      viewerWrapper.appendChild( captionFigure ); // Attach the caption to the main viewer.

      adjustElementSizes(); // Calculate and set dimensions for the displayed image.

      // Initialize pointer coordinates to the center of the window.
      pointerLoc.currentX = pointerLoc.targetX = window.innerWidth / 2;
      pointerLoc.currentY = pointerLoc.targetY = window.innerHeight / 2;
      
      document.body.appendChild( viewerWrapper ); // Insert the viewer into the document body.
      // Small delay to allow CSS transition to apply for fade-in effect.
      setTimeout( function () {
        viewerWrapper.style[ 'opacity' ] = '1';
      }, 10 );
    }

    // Removes the image viewer from the DOM and cleans up.
    function destroyImageViewer() {

      enableBodyScroll(); // Restore body scrolling.
      detachHandlers(); // Remove all event listeners.
      terminateRender(); // Stop the animation loop.
      document.body.removeChild( viewerWrapper ); // Remove the viewer element.
    }

    // Recalculates and applies the dimensions of the displayed image based on viewport size.
    function adjustElementSizes() {

      // Determine the best fit for the image within the current window size.
      var scaledImageDimensions = calculateImageFit( originalImageSize );
      displayedElement.width = scaledImageDimensions.width;
      displayedElement.height = scaledImageDimensions.height;
      isLandscapeFit = scaledImageDimensions.isFit; // Update orientation flag.

      displayedElementSize = { width: displayedElement.width, height: displayedElement.height };
      viewerWrapperSize = { width: window.innerWidth, height: window.innerHeight };
      // Calculate the maximum scrollable distance for the image.
      scrollableRange = { xOffset: viewerWrapperSize.width - displayedElementSize.width, yOffset: viewerWrapperSize.height - displayedElementSize.height };

    }

    // Initializes the image viewer process given a triggering element.
    function initializeViewing( triggeringElement ) {

      var imageSourcePath = triggeringElement.getAttribute( 'data-image' ) || triggeringElement.src;
      var imageTitle = triggeringElement.getAttribute( 'data-title' );
      var imageCaption = triggeringElement.getAttribute( 'data-caption' );
      
      var tempImage = new Image(); // Create a temporary image to load and get dimensions.
      tempImage.onload = function () {

        originalImageSize = { width: tempImage.width, height: tempImage.height }; // Store original dimensions.
        displayedElement = this; // The loaded image becomes the displayed element.
        constructImageViewer( imageTitle, imageCaption ); // Build the viewer UI.
        disableBodyScroll(); // Prevent body scrolling.
        attachHandlers(); // Set up event listeners for interaction.
        renderCycle(); // Start the animation loop.
      };

      tempImage.src = imageSourcePath; // Begin loading the image.
    }

    // Attaches all necessary event listeners for viewer interaction.
    function attachHandlers() {

      viewerWrapper.addEventListener( 'mousemove', onPointerMove, false );
      viewerWrapper.addEventListener( 'touchmove', onTouchScreenMove, false );
      window.addEventListener( 'resize', adjustElementSizes, false );
      window.addEventListener( 'keyup', onKeyboardRelease, false );
      displayedElement.addEventListener( 'click', destroyImageViewer, false );
    }

    // Removes all event listeners when the viewer is closed.
    function detachHandlers() {

      viewerWrapper.removeEventListener( 'mousemove', onPointerMove, false );
      viewerWrapper.removeEventListener( 'touchmove', onTouchScreenMove, false );
      window.removeEventListener( 'resize', adjustElementSizes, false );
      window.removeEventListener( 'keyup', onKeyboardRelease, false );
      displayedElement.removeEventListener( 'click', destroyImageViewer, false );
    }
  
    // Updates the target mouse coordinates based on mouse movement.
    function onPointerMove( eventObject ) {

      pointerLoc.targetX = eventObject.clientX;
      pointerLoc.targetY = eventObject.clientY;
    }

    // Updates target mouse coordinates based on touch movement, preventing default scroll.
    function onTouchScreenMove( touchEvent ) {

      touchEvent.preventDefault(); // Stop default touch-scrolling behavior.
      pointerLoc.targetX = touchEvent.touches[ 0 ].clientX;
      pointerLoc.targetY = touchEvent.touches[ 0 ].clientY;
    }

    // Handles keyboard input, specifically for exiting the viewer with the Escape key.
    function onKeyboardRelease( keyboardEvent ) {

      keyboardEvent.preventDefault(); // Prevent default browser actions for key presses.
      if ( keyboardEvent.keyCode === KEY_ESCAPE_CODE ) {
        destroyImageViewer(); // Close the viewer if Escape is pressed.
      } 
    }
  
    // Smoothly adjusts the displayed image's position based on pointer location.
    function updateElementPosition() {

      // Apply easing to the current pointer position.
      pointerLoc.currentX += ( pointerLoc.targetX - pointerLoc.currentX ) * 0.05;
      pointerLoc.currentY += ( pointerLoc.targetY - pointerLoc.currentY ) * 0.05;

      if ( isLandscapeFit === true ) {

        // Handle horizontal scrolling for wide images.
        activeScrollPos += ( pointerLoc.currentX - activeScrollPos );
        if ( pointerLoc.currentX !== previousScrollPos ) {
          var xPosition = parseFloat( activeScrollPos / viewerWrapperSize.width );
          xPosition = scrollableRange.xOffset * xPosition;
          displayedElement.style[ 'webkitTransform' ] = 'translate3d(' + xPosition + 'px, 0px, 0px)';
          displayedElement.style[ 'MozTransform' ] = 'translate3d(' + xPosition + 'px, 0px, 0px)';
          displayedElement.style[ 'msTransform' ] = 'translate3d(' + xPosition + 'px, 0px, 0px)';
          previousScrollPos = pointerLoc.currentX; // Update last known position.
        }
      } else if ( isLandscapeFit === false ) {

        // Handle vertical scrolling for tall images.
        activeScrollPos += ( pointerLoc.currentY - activeScrollPos );
        if ( pointerLoc.currentY !== previousScrollPos ) {
          var yPosition = parseFloat( activeScrollPos / viewerWrapperSize.height );
          yPosition = scrollableRange.yOffset * yPosition;
          displayedElement.style[ 'webkitTransform' ] = 'translate3d( 0px, ' + yPosition + 'px, 0px)';
          displayedElement.style[ 'MozTransform' ] = 'translate3d( 0px, ' + yPosition + 'px, 0px)';
          displayedElement.style[ 'msTransform' ] = 'translate3d( 0px, ' + yPosition + 'px, 0px)';
          previousScrollPos = pointerLoc.currentY; // Update last known position.
        }
      }
    }

    // The primary entry point for the Zoomify module.
    function zoomifyMain( initialElement ) {

      // Argument validation.
      if ( !initialElement ) {
        throw 'A DOM element is required for initialization!';
      }

      beginObservation( initialElement ); // Start watching the provided element(s).
    }

    // Expose public methods through the main function, augmenting it.
    return augmentObject( zoomifyMain, {
        recalculateSizes: adjustElementSizes,
        activate: initiateRender,
        deactivate: terminateRender
    } );

} )();