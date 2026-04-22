// image-spinner.js

// IMPORTANT: Review scoping for the momentumAnimationFrame() method.
let _thisInstance; // Global reference for internal callback scope

class ImageSpinner {
 constructor( displayElementId, imagePattern, totalImageCount ) {
    this.viewArea           = document.querySelector( `#${displayElementId}` );
    this.viewAreaObject     = document.getElementById( displayElementId );
    this.viewAreaIdentifier = displayElementId;
    this.imageSourcePattern = imagePattern;
    this.totalImages        = totalImageCount;
    this.loadedImageCount   = 0;
    this.currentImageIndex  = 1;
    this.previousImageIndex = 1;
    this.isDragging         = false;
    this.lastPointerX       = 0;
    this.animationInterval  = null; // This property is not actively used but kept for structural fidelity.
    this.swipeDirection     = null;
    this.imageTransitionSpeed = 0;
    this.momentumImageSpeed = 0;
    this.momentumTimeElapsed = 0;
    this.momentumEffectDuration = 0;
    this.imageAssetArray    = []; // Using array literal for data type change example
    this.isAnimationRunning = false;

    _thisInstance = this; // Assign current instance to global reference for callback scope

    this.initializeViewer(); // Call the setup method
  }

  initializeViewer() {
    // Custom easing functions for smoother animations
    Math.quadraticEaseOut = function ( time, startValue, changeInValue, duration ) {
      return -changeInValue * ( time /= duration ) * ( time - 2 ) + startValue;
    };

    Math.quarticEaseOut = function ( time, startValue, changeInValue, duration ) {
      time /= duration;
      time--;
      return -changeInValue * ( time * time * time * time - 1 ) + startValue;
    };

    Math.exponentialEaseOut = function ( time, startValue, changeInValue, duration ) {
      return changeInValue * ( -Math.pow( 2, -10 * time / duration ) + 1 ) + startValue;
    };

    // Polyfill for requestAnimationFrame for browser compatibility
    window.requestAnimationFramePolyfill = ( function() {
      return window.requestAnimationFrame       ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame    ||
             window.oRequestAnimationFrame      ||
             window.msRequestAnimationFrame     ||
             function( animationCallback ) {
               window.setTimeout( animationCallback, 1000 / 60 ); // Fallback to setTimeout
             };
    } )();

    this.preloadImages(); // Begin loading image assets
  }

  preloadImages() {
    // Loop through all images and load them into memory
    for ( let idx = 1; idx <= this.totalImages; idx++ ) {
      this.imageAssetArray[ idx ] = new Image(); // Create new Image object
      this.imageAssetArray[ idx ].src = this.imageSourcePattern.replace( '{i}', idx ); // Set image source
      this.imageAssetArray[ idx ].onload = function() {
        _thisInstance.loadedImageCount++; // Increment loaded count
        if ( _thisInstance.loadedImageCount === _thisInstance.totalImages ) {
          _thisInstance.loadingFinished(); // All images loaded
        }
      };
    }
  }

  loadingFinished() {
    let imageElement; // Temporary variable for new image elements
    
    // Hide the loading indicator
    this.viewArea.querySelector( ".loading" ).className = "hidden-loader";
    // Append all images to the container, showing only the first one
    for ( let idx = 1; idx <= this.totalImages; idx++ ) {
      imageElement = document.createElement( 'img' );
      imageElement.setAttribute( 'src', this.imageSourcePattern.replace( '{i}', idx ) );
      imageElement.setAttribute( 'style', idx === 1 ? "display: block;" : "display: none;" );
      imageElement.setAttribute( 'data-image-index', idx ); // Using data-image-index instead of data-index
      this.viewArea.appendChild( imageElement );
    }
    this.setupInteractionListeners(); // Attach mouse/touch event handlers
  }

  setupInteractionListeners() {
    // Check for touch device capabilities
    const isTouchDevice = typeof document.ontouchstart !== 'undefined' &&
                          typeof document.ontouchmove !== 'undefined' &&
                          typeof document.ontouchend !== 'undefined' &&
                          typeof document.ontouchcancel !== 'undefined';

    if ( isTouchDevice ) {
      // Touch event handlers for mobile interactions
      this.viewAreaObject.addEventListener( 'touchstart', function( eventObject ) {
        eventObject.preventDefault(); // Prevent default touch behavior
        _thisInstance.pointerDown( eventObject.touches[0].pageX );
      } );

      this.viewAreaObject.addEventListener( 'touchmove', function( eventObject ) {
        eventObject.preventDefault();
        _thisInstance.pointerMove( eventObject.touches[0].pageX );
      } );

      this.viewAreaObject.addEventListener( 'touchend', function( eventObject ) {
        eventObject.preventDefault();
        _thisInstance.pointerUp();
      } );

      this.viewAreaObject.addEventListener( 'touchcancel', function( eventObject ) {
        eventObject.preventDefault();
        _thisInstance.pointerUp();
      } );
    }

    // Mouse event handlers for desktop interactions
    this.viewArea.addEventListener( 'mousedown', function( eventObject ) {
      eventObject.preventDefault();
      _thisInstance.pointerDown( eventObject.screenX );
    } );

    this.viewArea.addEventListener( 'mousemove', function( eventObject ) {
      eventObject.preventDefault();
      _thisInstance.pointerMove( eventObject.screenX );
    } );

    this.viewArea.addEventListener( 'mouseup', function( eventObject ) {
      eventObject.preventDefault();
      _thisInstance.pointerUp();
    } );

    // Handle mouse leaving the interactive area
    _thisInstance.viewArea.addEventListener( 'mouseout', function( eventObject ) {
      eventObject.preventDefault();

      let relatedElement = ( 'relatedTarget' in eventObject ? eventObject.relatedTarget : eventObject.toElement );
      // Only trigger 'up' if mouse leaves the viewer or its child images
      if ( relatedElement && ( relatedElement.nodeName === "IMG" || relatedElement.id === _thisInstance.viewAreaIdentifier ) ) return false;
      _thisInstance.pointerUp();
    } );
  }

  pointerDown( coordX ) {
    this.isDragging = true; // Set dragging flag
    this.lastPointerX = coordX; // Store initial X coordinate
    this.haltMomentum(); // Stop any ongoing inertia animation
  }

  pointerMove( coordX ) {
    if ( this.isDragging ) {
      // Calculate speed based on pointer movement
      this.imageTransitionSpeed = ( Math.floor( Math.abs( this.lastPointerX - coordX ) * 0.05 ) === 0 ? 1 : Math.floor( Math.abs( this.lastPointerX - coordX ) * 0.05 ) );
      this.previousImageIndex = this.currentImageIndex; // Store current index before change

      // Determine rotation direction
      if ( coordX > this.lastPointerX ) {
        this.currentImageIndex = this.currentImageIndex - this.imageTransitionSpeed;
        this.swipeDirection = 'leftwards';
      } else if ( coordX < this.lastPointerX ) {
        this.swipeDirection = 'rightwards';
        this.currentImageIndex = this.currentImageIndex + this.imageTransitionSpeed;
      }
      
      // Wrap around logic for frame index
      if ( this.currentImageIndex > this.totalImages ) this.currentImageIndex = 1;
      if ( this.currentImageIndex < 1 ) this.currentImageIndex = this.totalImages;

      // Update displayed image if index has changed
      if ( this.previousImageIndex !== this.currentImageIndex ) this.refreshDisplayedImage();
      this.lastPointerX = coordX; // Update last X coordinate
    }
  }

  pointerUp() {
    this.isDragging = false; // Reset dragging flag
    // If there was significant movement, start inertia effect
    if ( this.imageTransitionSpeed > 1 ) this.startMomentumAnimation();
  }

  startMomentumAnimation() {
    this.momentumEffectDuration = this.imageTransitionSpeed; // Set duration based on last speed
    this.momentumImageSpeed = 0; // Reset momentum speed accumulator

    // Start animation frame loop if not already running
    if ( !this.isAnimationRunning ) window.requestAnimationFramePolyfill( _thisInstance.momentumAnimationFrame );
    this.isAnimationRunning = true; // Mark animation as running
  }

  momentumAnimationFrame() {
    _thisInstance.momentumTimeElapsed += 0.04; // Increment elapsed time for easing calculation
    // Calculate current speed from easing function
    _thisInstance.imageTransitionSpeed = _thisInstance.momentumEffectDuration - Math.floor( Math.quarticEaseOut( _thisInstance.momentumTimeElapsed, 0, _thisInstance.momentumEffectDuration, _thisInstance.momentumEffectDuration ) );
    _thisInstance.momentumImageSpeed += _thisInstance.momentumEffectDuration - Math.quarticEaseOut( _thisInstance.momentumTimeElapsed, 0, _thisInstance.momentumEffectDuration, _thisInstance.momentumEffectDuration );

    if ( _thisInstance.momentumImageSpeed >= 1 ) {
      _thisInstance.previousImageIndex = _thisInstance.currentImageIndex; // Store current for comparison
      // Adjust image index based on direction and accumulated speed
      if ( _thisInstance.swipeDirection === "rightwards" ) {
        _thisInstance.currentImageIndex = _thisInstance.currentImageIndex + Math.floor( _thisInstance.momentumImageSpeed );
      } else {
        _thisInstance.currentImageIndex = _thisInstance.currentImageIndex - Math.floor( _thisInstance.momentumImageSpeed );
      }
      // Wrap around logic for frame index
      if ( _thisInstance.currentImageIndex > _thisInstance.totalImages ) _thisInstance.currentImageIndex = 1;
      if ( _thisInstance.currentImageIndex < 1 ) _thisInstance.currentImageIndex = _thisInstance.totalImages;
      _thisInstance.momentumImageSpeed = 0; // Reset accumulator
      _thisInstance.refreshDisplayedImage(); // Update the visual
    }

    // Continue or stop animation based on time or speed
    if ( _thisInstance.momentumTimeElapsed > _thisInstance.momentumEffectDuration || _thisInstance.imageTransitionSpeed < 1 ) {
      _thisInstance.haltMomentum();
    } else {
      window.requestAnimationFramePolyfill( _thisInstance.momentumAnimationFrame );
    }
  }

  haltMomentum() {
    this.momentumTimeElapsed = 0; // Reset time
    this.momentumEffectDuration = 0; // Reset duration
    this.isAnimationRunning = false; // Mark animation as stopped
  }

  refreshDisplayedImage() {
    // Hide the previously displayed image
    this.viewArea.querySelector( `img[data-image-index="${this.previousImageIndex}"]` ).style.display = "none";
    // Show the newly calculated image
    this.viewArea.querySelector( `img[data-image-index="${this.currentImageIndex}"]` ).style.display = "block";    
  }
}

// Factory function to create an instance of the image spinner
const createImageSpinner = function( displayElementId, imagePattern, totalImageCount ) {
  return new ImageSpinner( displayElementId, imagePattern, totalImageCount );
};

export default createImageSpinner;