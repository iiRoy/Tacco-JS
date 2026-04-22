window.requestNextFrame = (function() {
  // Provides a cross-browser way to request an animation frame for smooth rendering.
  // It prioritizes native implementations and falls back to a timed loop if necessary.
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( animationCallback ){
            // Fallback to setTimeout, aiming for approximately 60 frames per second.
            // This ensures a consistent animation speed even without native support.
            window.setTimeout(animationCallback, Math.floor(1000 / 60)); 
          };
})();

window.abortNextFrame = ( function() {
    // Offers a cross-browser method to cancel a previously requested animation frame.
    // This is crucial for stopping ongoing animations gracefully and preventing memory leaks.
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    || 
        window.mozCancelRequestAnimationFrame       || 
        window.oCancelRequestAnimationFrame     || 
        window.msCancelRequestAnimationFrame        || 
        clearTimeout; // Fallback for the setTimeout-based animation loop.
} )();


const VisualZoomer = (function() {

    'use strict';

    // Defines the key code for the Escape key, used to exit the image viewer.
    const ESC_KEY_CODE = 27;

    // Tracks both the currently rendered and the target cursor coordinates for smooth panning.
    // 'target' coordinates directly reflect raw mouse/touch input, while 'current' are eased.
    const cursor = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 };

    // A flag indicating the dominant orientation for image fit (true for height-dominant, false for width-dominant).
    let layoutIsHorizontal = true;

    // Stores the unique ID returned by requestNextFrame, allowing the animation loop to be cancelled.
    let animationHandle;
  
    // Variables to manage the image's position within the viewer, with easing applied.
    let prevImagePos = 0;
    let currentImagePos = 0;
    
    // Holds the original dimensions of the source image and a reference to the active image element in the viewer.
    let originalImageDims, currentDisplayElement;
    // Stores the calculated dimensions of the image as displayed within the viewer.
    const displayElementDims = { width: 0, height: 0 };
  
    // References the main overlay container element and its current dimensions.
    let overlayContainer;
    const overlayDims = { width: 0, height: 0 };
    // Calculates the available panning range (overflow) for the image in both axes.
    const overflowSpace = { xDim: 0, yDim: 0 };

    // Temporarily stores the document body's overflow style before it's hidden to disable scrolling.
    let originalBodyOverflowStyle;

    /* ------------------------------------
    /*          UTILITY FUNCTIONS
    /* ------------------------------------ */

    /**
     * Extends a target object with properties from a source object, but only for properties
     * that do not already exist in the target. This acts as a soft augmentation.
     * @param {object} targetObj - The object to be extended.
     * @param {object} sourceObj - The object whose properties will be added.
     * @returns {object} The modified target object.
     */
    function augmentObject( targetObj, sourceObj ) {
        // Iterate through all enumerable properties of the source object.
        for ( const propKey in sourceObj ) {
            // Ensure the property is directly on the source object, not inherited.
            if ( Object.prototype.hasOwnProperty.call(sourceObj, propKey) ) {
                // Add the property to the target only if it doesn't already exist.
                if ( !( propKey in targetObj ) ) {
                    targetObj[ propKey ] = sourceObj[ propKey ];
                }
            }
        }
        return targetObj;
    }

    /**
     * Applies a collection of CSS style properties to a specified DOM element.
     * @param {HTMLElement} elem - The DOM element to which styles will be applied.
     * @param {object} styleProps - An object mapping CSS property names (camelCase) to their values.
     */
    function applyElementStyles( elem, styleProps ) {
        // Basic validation: ensure a valid HTMLElement is provided.
        if (!elem || !(elem instanceof HTMLElement)) {
            console.warn("Attempted to apply styles to an invalid element:", elem);
            return;
        }

        // Apply each style property from the provided object.
        for( const styleKey in styleProps ) {
            elem.style[ styleKey ] = styleProps[ styleKey ];
        }
    }

    /**
     * Determines the optimal dimensions for displaying an image to fit within the current viewport,
     * maintaining its aspect ratio. It decides whether to scale based on height or width.
     * @param {object} imageSourceDimensions - An object containing the original 'w' (width) and 'h' (height) of the image.
     * @returns {object} An object with calculated 'w' (width), 'h' (height), and 'fitByHeight' (boolean).
     */
    function calculateFittingMeasures( imageSourceDimensions ) {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calculate potential width if the image is scaled to fit the viewport's height.
        const heightScaleFactor = viewportHeight / imageSourceDimensions.h;
        const potentialWidth = imageSourceDimensions.w * heightScaleFactor;

        // Check if fitting by height would cause the image to exceed the viewport's width.
        const isWidthExceeding = potentialWidth > viewportWidth;

        if( isWidthExceeding ) {
            // If the image is too wide when height-constrained, then it must be width-constrained.
            const widthScaleFactor = viewportWidth / imageSourceDimensions.w;
            const finalWidth = imageSourceDimensions.w * widthScaleFactor;
            const finalHeight = imageSourceDimensions.h * widthScaleFactor;
            return { w: finalWidth, h: finalHeight, fitByHeight: false };
        } else {
            // Otherwise, fitting by height is the best strategy.
            return { w: potentialWidth, h: viewportHeight, fitByHeight: true };
        }
    }

    /* ------------------------------------
    /*          MAIN APPLICATION LOGIC
    /* ------------------------------------ */

    /**
     * Initializes the image zoom functionality for one or more specified elements.
     * It attaches click listeners that will open the viewer.
     * @param {HTMLElement|NodeListOf<HTMLElement>|Array<HTMLElement>} elementsToObserve - A single DOM element or a collection of elements.
     */
    function setupImageInteraction( elementsToObserve ) {
        if (!elementsToObserve) {
            console.error("No elements provided for image interaction setup.");
            return;
        }

        // Convert single element or NodeList into a consistent array-like structure for iteration.
        const elementCollection = elementsToObserve.length !== undefined ? elementsToObserve : [elementsToObserve];

        // Loop through all elements and set up the zoom trigger.
        for (let i = 0; i < elementCollection.length; i++) {
            initiateElementZoom( elementCollection[i] );
        }
    }

    /**
     * Attaches a click event listener to a single element, enabling it to trigger the image viewer.
     * @param {HTMLElement} targetElement - The individual DOM element to be made zoomable.
     */
    function initiateElementZoom( targetElement ) {
        // Verify that the element has a valid image source (either 'data-image' attribute or 'src').
        const imageSource = targetElement.getAttribute( 'data-image') || targetElement.src;
        if( imageSource ) {
            targetElement.addEventListener( 'click', function() {
                // When clicked, prepare and show the viewer using the clicked element as the source.
                prepareViewerDisplay( this );
            }, false ); // 'false' indicates event listener is in the bubbling phase.
        } else {
            // Optional: Log a warning if an element lacks an identifiable image source.
            // console.warn("Element lacks 'data-image' or 'src' attribute, skipping zoom setup:", targetElement);
        }
    }
  
    /** Initiates the continuous animation loop for image panning. */
    function beginAnimationLoop() { 
      animateViewerContent();
    }
   
    /** Halts the currently running animation loop. */
    function haltAnimationLoop() {
      // Cancels the pending animation frame request, effectively stopping the loop.
      window.abortNextFrame( animationHandle );
    }

    /** The core function of the animation loop, invoked on each frame to update viewer content. */
    function animateViewerContent() {
        // Request the next animation frame and store its identifier.
        animationHandle = window.requestNextFrame(animateViewerContent);
        // Update the position of the displayed image based on user input.
        updateImageViewerPosition();      
    }

    /** Modifies the document body's overflow style to prevent page scrolling, effectively "locking" it. */
    function suppressScroll() {
      // Store the current overflow setting so it can be restored later.
      originalBodyOverflowStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    /** Restores the document body's original overflow style, re-enabling page scrolling. */
    function restoreScroll() {
      document.body.style.overflow = originalBodyOverflowStyle;
    }

    /**
     * Constructs the full-screen image viewer overlay, including the image and optional textual content.
     * @param {string} mainTitle - The main title text to be displayed with the image.
     * @param {string} imageCaption - Additional descriptive caption for the image.
     */
    function constructDisplayOverlay( mainTitle, imageCaption ) {

      /*
       *  Overlay Container Base Styles
       */
      const overlayBaseStyles = {
        'backgroundColor': 'rgba(0,0,0,0.88)', // Slightly darker background
        'width': '100vw', // Use viewport-width unit for full coverage
        'height': '100vh', // Use viewport-height unit for full coverage
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'overflow': 'hidden',
        'zIndex': '1000000', // Ensures the viewer is on top of other content
        'margin': '0',
        // Define CSS transitions for a smooth fade-in effect.
        'webkitTransition': 'opacity 220ms cubic-bezier(0.4, 0, 0.2, 1)', // Custom easing for WebKit
        'MozTransition': 'opacity 220ms cubic-bezier(0.4, 0, 0.2, 1)', // Custom easing for Mozilla
        'transition': 'opacity 220ms cubic-bezier(0.4, 0, 0.2, 1)', // Standard transition
        'opacity': '0' // Start completely transparent
      };
      overlayContainer = document.createElement( 'div' ); // Using a generic div for the main overlay.
      overlayContainer.appendChild( currentDisplayElement ); // Insert the image into the container.
      applyElementStyles( overlayContainer, overlayBaseStyles ); // Apply the defined styles.

      /*
       *  Image Element Cursor Styles
       */
      const imageCursorStyles = {
        // Custom cursor to indicate interactivity for panning.
        'cursor': 'url( "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20vYmFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0NCMjQyNzNBRTJGMTFFMzhEM0FEOTUzMTAwMEIyRkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0NCMjQyNzRBRTJGMTFFMzhEM0FEOTUzMTAwMEIyRkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3Q0IyNDI3MUFFMkYxMUUzOEQzQUQ5NTMxMDAwQjJGRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3Q0IyNDI3MkFFMkYxMUUzOEQzQUQ5NTMxMDAwQjJGRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YSA+IDw/eHBhY2tldCBlbmQ9InIiPz5soZ1WgAABp5JREFUeNrcWn9MlVUY/u4dogIapV0gQ0SUO4WAXdT8B5ULc6uFgK3MLFxzFjQFZMtaed0oKTPj1x8EbbZZK5fNCdLWcvxQ+EOHyAQlBgiIVFxAJuUF7YrQ81zOtU+8F+Pe78K1d3s5537f+fE8nPec7z3vOSpJIRkbGwtEEgtdBdVCl0AXQr2hKqgJeg16BdoCrYNWqVSqbif7VQT8YqgB2jTmuDSJNoIcJUJVOVg5EsmH0Oehaj4bGRkZ6uvra2xvb29oamrqbGxs7K2vrx/s7Oy8yffBwcFzdTqdb0REhF9YWFhwSEhIpEajifDw8PAWzY5Cj0GzMUoNUx0R1RQJaJAcgKaw7ujo6O2urq7qysrKioyMjHNDQ0OjU2nP29tbnZ+fv1qv18cFBQWtU6vVs9gN9BvobhDqU5wIKryA5CuoLwj83dzc/NOePXuOlpSUXFNjiUlJS3ct27fiyasWPHeOhGbj0SD0dZD5UREiKOiJJAyNAx9Go7F2165deUeOHOmVXCBbt271y8nJyfD3939aPCqCZoCQ2WEiKOQj7HYjzejUqVNFcXFxJdI0SEVFRdKGDRtShbmd5HwEGZM9IupJSHiJBjaazebr2dnZmdNFgsK+2Cf7JgZiEZhsimoSc/oZqh8eHjamp6fvPnTo0O/SDMiOHTsWFRQUHPDy8vLnQEGflZvZpKaFl4WcE7du3epPTU19+/Dhwz3SDMr27dsDioqKcufMmfM45wyIpD3QtPBiC0lgTowcPHgwa6ZJUIiBWIgJP1OB8aVJTQsFnkDSxCUWk60gPj6+VHIjKS8vT8TcSRdLnxhG5g+bpoWH3yF5ube3tw7L33uSGwqW/8/8/Pzoz30PItvuMy080HEZx/CZDQZDgeSmQmzESKwC870jgodcWhPhJx0LDw8vlNxYLl269Cb8Nfp5NP2kuyMiPM8EfvTodkhuLsQoJn4C/VG5ab3CfHd3d41SvpMrhRiBtVrgf01OZBv/nIRID4nIsG6xzBGxs7vK/YSvr2/SVF3xiYL55bVgwYJZp0+f/nOycuvXr38E+xczvOibjvTDLcDg4OBx7GfoD4ZwRPR8gUYbnCUBF3wuHMtPy8rKcmJjY33tleM7lqmpqdnPOo70RazAfNFapFrssaWOjo6Lzg43vj2zPT09febNm7etLT0C1tk+IzvWIZlWcfR/oC5UWSjSCSUudbW1qvOEqmqqhrcvHnzOzdu3Lhii4ycBMuwLOs42t/ly5etmLUkEsJcbW3tbwq5ETbJ2CLBss70dfbsWSvmpZzsnJTzo6KiEhoaGoaVWlXkwE0mkyXk4+PjE6gUCUpMTMz86urq48gOkIjFWYHfEqf0EkkyJ06cyCMB/iah5OTkTCVIUDQajQf8wl+QNaune/2/c+eOS9olkb+YiYyM9FJ6NGhaHA2OBJV5e6uZI6LVaq2YTSTSz9zatWsfc8X84JzYtGlTJtXeauaorFy5cr7IXieRdubWrFnzpCtIJCYmWpZYKvNKksE/34q5g0RamQsNDV3sKhLy74ySZJYtW2bF3EIidZaFeOnSp5wl0t/fb4aYbJGwRYZlWcfR/mSYL8idRhOcxuTpdBoHBgZuY5Pk0LfrPqdRnE8080Fubm50Aru34QeRoLCMoyQoxCpItFnnCIVBB2kj5GHZjPizD/qNCOQ0MDAwBlHxu5MQgiBdZ00fqby9V0iMK8rSMoYMGZo392JECOwehAztHNipPFjxiGw0UnYuXPlnclQWzEKI0fCH1kL9JoCdAZjcZzAQEB77sjkZ6env3YjK22G6AT8i7DkSzI8KS7kSAmQWJQYL3HabwrjKVK4mQKX9w0g8EQ6i4k9u7dqyUm8TNNwJVsmpbMxL5EkuouxwopKSn+xcXFeeJYoRgkUmVYJyXirgc3ldBnbB302NxYiYJcGc6wgcLCwvysrCztTJgT+xYkzhCT3UPR//9hqBgZkxiZYjao1+vf4vLH4XalKbEP7iVIFIuRME2K9b92MOHCAEOdZS66MJAAAp5iiX0DBI4+ANfUiIhKvMLxOfRVSXaFA2ZQnpmZWefIFY68vLyVMNf4CVc4vuV3wiVXOCZUjkLygXTvpRoTL1Uw9NrS0tJVX1/fc/78+ettbW2WIPXy5cvnRkdHP6rT6QK0Wm0QNkXhGo0mUrjikvTvpZpPQODCFLA4bw6ya06/OnHNqXnGrjnZIyWNXzyjC0GPYIk0fvHM+h+XXzxjnOCcNH7x7KqT/VrSfwQYAOAcX9HTDttYAAAAAElFTkSuQmCC" ) 25 25, grab' // Custom cursor image and hotspot.
      };
      applyElementStyles( currentDisplayElement, imageCursorStyles );

      /*
       *  Caption Wrapper Element Styles
       */
      const captionWrapperStyles = {
        'fontFamily': 'Roboto, "Helvetica Neue", Arial, sans-serif', // Use a modern sans-serif font.
        'position': 'fixed',
        'bottom': '15px', // Position slightly above the bottom edge.
        'left': '20px',
        'padding': '18px', // Consistent padding around text.
        'color': '#f0f0f0', // Light grey text for contrast on dark background.
        'wordSpacing': '0.1px',
        'webkitFontSmoothing': 'antialiased', // Enhance text rendering on WebKit browsers.
        'textShadow': '0px 1px 2px rgba(0,0,0,0.5)' // Subtle text shadow for readability.
      };
      const captionWrapper = document.createElement( 'section' ); // Using <section> for semantic grouping of caption content.
      applyElementStyles( captionWrapper, captionWrapperStyles );

      /*
       *  Image Title Element Styles
       */
      // Only create and append a title if it is provided and not empty.
      if ( mainTitle && mainTitle.trim() !== '' ) {
        const titleTextStyles = {
          'margin': '0',
          'padding': '0',
          'fontWeight': 'bold', // Emphasize the title.
          'fontSize': '36px', // Large font size for prominence.
          'letterSpacing': '0.8px',
          'lineHeight': '32px',
          'textAlign': 'left'
        };
        const titleElement = document.createElement( 'h2' ); // Using <h2> for the main title.
        applyElementStyles( titleElement, titleTextStyles );
        titleElement.textContent = mainTitle; // Use textContent for security against XSS.
        captionWrapper.appendChild( titleElement );
      }

      /*
       *  Image Caption Element Styles
       */
      // Only create and append a caption if it is provided and not empty.
      if ( imageCaption && imageCaption.trim() !== '' ) {
        const captionBodyStyles = {
          'margin': '0',
          'padding': '0',
          'fontWeight': 'normal',
          'fontSize': '18px', // Standard font size for descriptive text.
          'letterSpacing': '0.2px',
          'maxWidth': '550px', // Constrain caption width for better readability.
          'textAlign': 'left',
          'background': 'none',
          'marginTop': '8px' // Space between title and caption.
        };
        const captionElement = document.createElement( 'p' ); // Using <p> for the caption text.
        applyElementStyles( captionElement, captionBodyStyles );
        captionElement.textContent = imageCaption; // Use textContent for security.
        captionWrapper.appendChild( captionElement );
      } else if ( (!mainTitle || mainTitle.trim() === '') && (!imageCaption || imageCaption.trim() === '') ) {
          // If neither title nor caption is provided, display a default instruction.
          const defaultInstruction = document.createElement('p');
          defaultInstruction.textContent = "Click anywhere or press ESC to close.";
          applyElementStyles(defaultInstruction, { 'fontSize': '16px', 'color': '#aaa', 'marginTop': '10px' });
          captionWrapper.appendChild(defaultInstruction);
      }

      overlayContainer.appendChild( captionWrapper );

      // Recalculate dimensions and positions based on the current viewport.
      recalculateLayout();

      // Initialize the cursor's current and target positions to the center of the screen.
      cursor.currentX = cursor.targetX = window.innerWidth / 2;
      cursor.currentY = cursor.targetY = window.innerHeight / 2;
      
      document.body.appendChild( overlayContainer );
      // Use requestNextFrame to ensure the opacity transition starts after the element is painted,
      // leading to a smoother visual fade-in.
      window.requestNextFrame( () => {
        overlayContainer.style.opacity = '1';
      });
    }

    /** Removes the image viewer overlay from the DOM and cleans up associated resources. */
    function destroyDisplayOverlay() {
      restoreScroll(); // Re-enable scrolling on the document body.
      detachInteractionHandlers(); // Remove all event listeners to prevent memory leaks.
      haltAnimationLoop(); // Stop the animation loop.
      
      // Safely remove the overlay container from the document body if it exists.
      if (overlayContainer && overlayContainer.parentNode === document.body) {
        document.body.removeChild( overlayContainer );
      }
      // Clear references to DOM elements to aid garbage collection.
      overlayContainer = null;
      currentDisplayElement = null;
    }

    /** Recalculates and updates all dimensions and overflow areas for the viewer's elements.
     * This is typically called on viewer creation and window resize. */
    function recalculateLayout() {

      // Determine the optimal way to fit the image within the current viewport, maintaining aspect ratio.
      const fittingInfo = calculateFittingMeasures( originalImageDims );
      
      // Apply the newly calculated width and height to the displayed image element.
      currentDisplayElement.width = fittingInfo.w;
      currentDisplayElement.height = fittingInfo.h;
      // Update the flag indicating the image's dominant fitting orientation.
      layoutIsHorizontal = fittingInfo.fitByHeight;

      // Store the updated dimensions of the displayed image and the overlay itself.
      displayElementDims.width = currentDisplayElement.width;
      displayElementDims.height = currentDisplayElement.height;
      overlayDims.width = window.innerWidth;
      overlayDims.height = window.innerHeight;

      // Calculate the total pixel area by which the image overflows the viewport,
      // which determines the maximum panning range.
      overflowSpace.xDim = overlayDims.width - displayElementDims.width;
      overflowSpace.yDim = overlayDims.height - displayElementDims.height;
    }

    /**
     * Prepares an image for display in the viewer by loading it and then initiating the overlay.
     * @param {HTMLElement} elementSource - The DOM element (e.g., an <img> or <a>) that triggered the viewer.
     */
    function prepareViewerDisplay( elementSource ) {

      const imagePath = elementSource.getAttribute( 'data-image') || elementSource.src;
      const displayTitle = elementSource.getAttribute( 'data-title');
      const displayCaption = elementSource.getAttribute( 'data-caption');
      
      // Create a temporary Image object to pre-load the image and retrieve its natural dimensions.
      const tempImageLoader = new Image();
      tempImageLoader.onload = function() {
        // Once loaded, save the original dimensions and set this loaded image as the one to display.
        originalImageDims = { w: tempImageLoader.width, h: tempImageLoader.height };
        currentDisplayElement = tempImageLoader; 
        
        // With the image loaded and dimensions known, proceed to build and show the viewer.
        constructDisplayOverlay( displayTitle, displayCaption );
        suppressScroll(); // Disable body scrolling to prevent interference.
        attachInteractionHandlers(); // Set up all necessary event listeners for user interaction.
        beginAnimationLoop(); // Start the animation loop for interactive panning.
      };
      tempImageLoader.onerror = function() {
        // Log an error if the image fails to load.
        console.error("Failed to load image from path:", imagePath);
        // A more advanced implementation might show a broken image icon or a user-friendly error message.
      };

      // Set the source to begin the image loading process.
      tempImageLoader.src = imagePath;
    }

    /** Attaches all relevant event listeners for user interaction with the image viewer. */
    function attachInteractionHandlers() {
      // Guard against attempting to attach listeners to a non-existent container.
      if (!overlayContainer || !currentDisplayElement) return;

      overlayContainer.addEventListener( 'mousemove', handlePointerMove,   false );
      overlayContainer.addEventListener( 'touchmove', handleTouchInteraction,   false );
      window.addEventListener(    'resize',    recalculateLayout, false );
      window.addEventListener(    'keyup',     handleKeyboardInput,       false );
      currentDisplayElement.addEventListener(    'click',     destroyDisplayOverlay,  false );
    }

    /** Removes all event listeners previously attached to the image viewer elements. */
    function detachInteractionHandlers() {
      // Guard against attempting to remove listeners from a non-existent container.
      if (!overlayContainer || !currentDisplayElement) return;

      overlayContainer.removeEventListener( 'mousemove', handlePointerMove,   false );
      overlayContainer.removeEventListener( 'touchmove', handleTouchInteraction,   false);
      window.removeEventListener(    'resize',    recalculateLayout, false );
      window.removeEventListener(    'keyup',     handleKeyboardInput,       false );
      currentDisplayElement.removeEventListener(    'click',     destroyDisplayOverlay,  false );
    }
  
    /**
     * Processes mouse movement events, updating the target coordinates for image panning.
     * @param {MouseEvent} event - The DOM MouseEvent object.
     */
    function handlePointerMove( event ) {
      cursor.targetX = event.clientX;
      cursor.targetY = event.clientY;
    }

    /**
     * Processes touch movement events, updating target coordinates and preventing default touch actions.
     * @param {TouchEvent} event - The DOM TouchEvent object.
     */
    function handleTouchInteraction( event ) {
      event.preventDefault(); // Prevents default browser behaviors like scrolling or zooming.
      // Use the coordinates of the first touch point for panning.
      if (event.touches && event.touches.length > 0) {
        cursor.targetX = event.touches[0].clientX;
        cursor.targetY = event.touches[0].clientY;
      }
    }

    /**
     * Handles keyboard input, specifically checking for the Escape key to close the viewer.
     * @param {KeyboardEvent} event - The DOM KeyboardEvent object.
     */
    function handleKeyboardInput( event ) {
      event.preventDefault(); // Prevents default browser actions for the pressed key.
      // If the Escape key is detected, close the viewer.
      if ( event.keyCode === ESC_KEY_CODE ) {
        destroyDisplayOverlay();
      } 
    }
  
    /** Updates the displayed image's position using an easing algorithm for smooth, responsive movement. */
    function updateImageViewerPosition() {
      // Apply a smoothing factor to gradually move the current cursor position towards the target.
      const easingFactor = 0.08; // Controls the responsiveness of the panning.
      cursor.currentX += ( cursor.targetX - cursor.currentX ) * easingFactor;
      cursor.currentY += ( cursor.targetY - cursor.currentY ) * easingFactor;

      // Determine whether to pan horizontally or vertically based on the image's dominant fit.
      if ( layoutIsHorizontal ) {
        // Horizontal panning: Update the image's horizontal position with easing.
        currentImagePos += ( cursor.currentX - currentImagePos ) * easingFactor; 
        // Only apply CSS transform if the cursor has moved significantly to avoid unnecessary DOM updates.
        if( Math.abs(cursor.currentX - prevImagePos) > 0.1 ) { 
          const normalizedPosition = currentImagePos / overlayDims.width;
          const translatedX = overflowSpace.xDim * normalizedPosition;
          
          // Use `translate3d` for hardware acceleration, ensuring smoother animations.
          currentDisplayElement.style.transform = `translate3d(${translatedX}px, 0px, 0px)`;
          prevImagePos = cursor.currentX; // Record the current cursor position for the next frame's comparison.
        }
      } else {
        // Vertical panning: Update the image's vertical position with easing.
        currentImagePos += ( cursor.currentY - currentImagePos ) * easingFactor; 
        // Only apply CSS transform if the cursor has moved significantly.
        if( Math.abs(cursor.currentY - prevImagePos) > 0.1 ) { 
          const normalizedPosition = currentImagePos / overlayDims.height;
          const translatedY = overflowSpace.yDim * normalizedPosition;

          // Apply hardware-accelerated 3D transform.
          currentDisplayElement.style.transform = `translate3d(0px, ${translatedY}px, 0px)`;
          prevImagePos = cursor.currentY; // Record the current cursor position.
        }
      }
    }

    /**
     * The primary entry point for the VisualZoomer module. It initializes the image zoomer
     * by setting up event listeners on specified elements.
     * @param {HTMLElement|NodeListOf<HTMLElement>|Array<HTMLElement>} elements - The DOM element(s) to make zoomable.
     * @throws {Error} If no valid elements are provided for initialization.
     * @returns {object} The public API of the VisualZoomer module.
     */
    function initializeZoomer( elements ) {
      // Implement a robust validation check for the input elements.
      if ( !elements || (elements.length === 0 && !(elements instanceof HTMLElement)) ) {
        throw new Error('VisualZoomer requires at least one valid DOM element or a collection of elements to initialize.');
      }

      setupImageInteraction( elements );
      return this; // Return the instance for chaining or further configuration.
    }

    // Expose a public API, allowing external code to interact with the module's functionality.
    return augmentObject( initializeZoomer, {
        refreshLayout: recalculateLayout, // Allows manual recalculation of viewer layout, e.g., after dynamic content changes.
        startAnimation: beginAnimationLoop, // Public method to explicitly start the panning animation.
        stopAnimation: haltAnimationLoop // Public method to explicitly halt the panning animation.
    });

})();