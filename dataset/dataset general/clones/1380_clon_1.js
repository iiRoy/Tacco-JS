/*
 * This file contains the JavaScript implementation
 * for the Three60 image viewer component.
 * It provides 360-degree interactive image functionality.
 */


// A global variable to store the instance of the Three60 class.
// This is used for scoping within event listeners and RAF callbacks.
var _self;


// The main class definition for the Three60 viewer.
class Three60 {

	    /**
	     * Constructor for the Three60 class.
	     * Initializes the component with its container, file naming pattern, and total frame count.
	     * @param {string} container    The ID of the HTML container element.
	     * @param {string} fileName     The file name pattern (e.g., "image_{i}.jpg").
	     * @param {number} totalFrames  The total number of frames in the 360-degree sequence.
	     */
		constructor( container ,  fileName ,  totalFrames ) {

				// Store a reference to the main container element using a query selector.
				this.container          = document.querySelector( '#' + container ) ;

				// Store another reference using getElementById, possibly for different internal uses.
				this.containerObj       = document.getElementById( container ) ;

				// Keep the container's ID for internal reference, especially for mouseout checks.
				this.containerName      = container ;

				// The base file name pattern for loading images.
				this.fileName           = fileName ;

				// The total number of frames expected for the 360-degree view.
				this.totalFrames        = totalFrames ;

				// Counter for frames that have successfully loaded.
				this.framesLoaded       = 0 ;

				// The current frame index being displayed, starting from 1.
				this.frameIndex         = 1 ;

				// The frame index from the previous update, used for comparison.
				this.lastFrameIndex     = 1 ;

				// A boolean flag indicating if the user is currently dragging the image.
				this.dragging           = false ;

				// Stores the last X-coordinate of the user's pointer during a drag operation.
				this.lastScreenX        = 0 ;

				// Interval ID for inertia, though currently not used with RAF.
				this.inertiaInterval    = null ;

				// The direction of the last drag operation ('left' or 'right').
				this.direction          = null ;

				// The speed of frame changes during dragging.
				this.frameSpeed         = 0 ;

				// The speed of frame changes during inertia, accumulated for fractional updates.
				this.inertiaFrameSpeed  = 0 ;

				// The elapsed time for the inertia animation.
				this.timeInertia        = 0 ;

				// The total duration for the inertia animation.
				this.inertiaDuration    = 0 ;

				// An array to hold Image objects for preloading.
				this.imageObjects       = Array() ;

				// Flag to indicate if the Request Animation Frame loop for inertia is active.
				this.RAFrunning         = false ;


				// Assign the current instance to the global _self variable for scope management.
				_self = this ;


				// Call the initialization method to set up the viewer.
				this.init() ;

		}


	    /**
	     * Initializes mathematical easing functions and requestAnimationFrame polyfill.
	     */
		init() {

				// Define an ease-out quadratic function for smooth animation.
				Math.easeOutQuad = function ( t , b , c , d ) {
					return -c * ( t /= d ) * ( t - 2 ) + b ;
				} ;

				// Define an ease-out quartic function for a different easing effect.
				Math.easeOutQuart = function ( t , b , c , d ) {
					t /= d ;
					t -- ;
					return -c * ( t * t * t * t - 1 ) + b ;
				} ;

				// Define an ease-out exponential function, providing another easing option.
				Math.easeOutExpo = function ( t , b , c , d ) {
					return c * ( -Math.pow( 2 , -10 * t / d ) + 1 ) + b ;
				} ;


				// Standard cross-browser polyfill for requestAnimationFrame.
				// This ensures smooth animations across different browsers.
				window.requestAnimFrame = ( function() {

					return window.requestAnimationFrame       ||
					       window.webkitRequestAnimationFrame ||
					       window.mozRequestAnimationFrame    ||
					       window.oRequestAnimationFrame      ||
					       window.msRequestAnimationFrame     ||
					       function( callback ) {
						       window.setTimeout( callback ,  1000 / 60 ) ;
					       } ;

				} )() ;

				// Begin the process of loading image frames.
				this.loadFrames() ;

		}


	    /**
	     * Preloads all image frames into memory.
	     */
		loadFrames() {

			// Loop through all expected frames from 1 to totalFrames.
			for ( var i = 1 ;  i <= this.totalFrames ;  i ++ ) {

				// Create a new Image object for each frame.
				this.imageObjects [ i ] = new Image() ;

				// Set the source of the image, replacing the placeholder {i} with the current frame number.
				this.imageObjects[ i ].src = this.fileName.replace( '{i}' ,  i ) ;

				// Attach an onload event handler to track loading progress.
				this.imageObjects[ i ].onload = function() {

					// Increment the counter for loaded frames.
					_self.framesLoaded ++ ;

					// If all frames have loaded, call the loadComplete method.
					if ( _self.framesLoaded == _self.totalFrames ) {
						_self.loadComplete() ;
					}

				} ;

			}

		}


	    /**
	     * Called when all frames have finished loading.
	     * Hides the loading indicator and appends image elements to the DOM.
	     */
		loadComplete() {

			var imgFrame ; // Declare a variable to hold each image frame element.

			// Hide the loading indicator by changing its class.
			this.container.querySelector( ".loading" ).className = "hide" ;

			// Loop through all frames again to create and append image elements to the DOM.
			for ( var i = 1 ;  i <= this.totalFrames ;  i ++ ) {

				// Create a new <img> element.
				imgFrame = document.createElement( 'img' ) ;

				// Set the src attribute using the fileName pattern.
				imgFrame.setAttribute( 'src' ,  this.fileName.replace( '{i}' ,  i ) ) ;

				// Set initial display style: block for the first frame, none for others.
				imgFrame.setAttribute( 'style' ,  i == 1 ? "display: block;" : "display: none;" ) ;

				// Set a data-index attribute for easy identification of frames.
				imgFrame.setAttribute( 'data-index' ,  i ) ;

				// Append the created image element to the container.
				this.container.appendChild( imgFrame ) ;

			}

			// Attach event handlers for user interaction.
			this.attachHandlers() ;

		}


	    /**
	     * Attaches event listeners for user interaction (touch and mouse).
	     */
		attachHandlers() {

			// Check for touch device capabilities to attach mobile-specific handlers.
			if ( typeof document.ontouchstart !== 'undefined' &&
			     typeof document.ontouchmove   !== 'undefined' &&
			     typeof document.ontouchend    !== 'undefined' &&
			     typeof document.ontouchcancel !== 'undefined' ) {

				// Event listener for touch start.
				this.containerObj.addEventListener( 'touchstart' ,  function( e ) {
					e.preventDefault() ; // Prevent default touch behavior (e.g., scrolling).
					_self.down( e.touches[ 0 ].pageX ) ; // Call the 'down' method with the touch X-coordinate.
				} ) ;

				// Event listener for touch move.
				this.containerObj.addEventListener( 'touchmove' ,  function( e ) {
					e.preventDefault() ; // Prevent default touch behavior.
					_self.move( e.touches[ 0 ].pageX ) ; // Call the 'move' method with the touch X-coordinate.
				} ) ;

				// Event listener for touch end.
				this.containerObj.addEventListener( 'touchend' ,  function( e ) {
					e.preventDefault() ; // Prevent default touch behavior.
					_self.up() ; // Call the 'up' method.
				} ) ;

				// Event listener for touch cancel (e.g., when a call comes in).
				this.containerObj.addEventListener( 'touchcancel' ,  function( e ) {
					e.preventDefault() ; // Prevent default touch behavior.
					_self.up() ; // Call the 'up' method.
				} ) ;

			}


			// Handlers for desktop mouse interaction.
			// Event listener for mouse down.
			this.container.addEventListener( 'mousedown' ,  function( e ) {
				e.preventDefault() ; // Prevent default mouse behavior.
				_self.down( e.screenX ) ; // Call the 'down' method with the mouse X-coordinate.
			} ) ;

			// Event listener for mouse move.
			this.container.addEventListener( 'mousemove' ,  function( e ) {
				e.preventDefault() ; // Prevent default mouse behavior.
				_self.move( e.screenX ) ; // Call the 'move' method with the mouse X-coordinate.
			} ) ;

			// Event listener for mouse up.
			this.container.addEventListener( 'mouseup' ,  function( e ) {
				e.preventDefault() ; // Prevent default mouse behavior.
				_self.up() ; // Call the 'up' method.
			} ) ;

			// Event listener for mouse out of the container.
			_self.container.addEventListener( 'mouseout' ,  function( e ) {
				e.preventDefault() ; // Prevent default mouse behavior.

				// Determine the related target for cross-browser compatibility.
				var relatedTarget = ( 'relatedTarget' in e ? e.relatedTarget : e.toElement ) ;

				// If the mouse moves to an image within the container or the container itself, do nothing.
				if ( relatedTarget.nodeName == "IMG" || relatedTarget.id == _self.containerName ) {
					return false ;
				}

				// Otherwise, treat it as an 'up' event to stop dragging.
				_self.up() ;

			} ) ;

		}


	    /**
	     * Handles the 'down' event (mouse down or touch start).
	     * @param {number} x The X-coordinate of the pointer.
	     */
		down( x ) {

			this.dragging = true ; // Set dragging flag to true.
			this.lastScreenX = x ; // Store the current X-coordinate.
			this.stopInertia() ; // Stop any ongoing inertia animation.

		}


	    /**
	     * Handles the 'move' event (mouse move or touch move).
	     * Updates the frame based on pointer movement.
	     * @param {number} x The current X-coordinate of the pointer.
	     */
		move( x ) {

			// Only proceed if dragging is active.
			if ( this.dragging ) {

				// Calculate frame speed based on the absolute difference in X-coordinates.
				// Ensures a minimum speed of 1.
				this.frameSpeed = ( parseInt( Math.abs( this.lastScreenX - x ) * 0.05 ) == 0 ? 1 : parseInt( Math.abs( this.lastScreenX - x ) * 0.05 ) ) ;

				this.lastFrameIndex = this.frameIndex ; // Store the current frame index before updating.

				// Determine the direction of movement and update frameIndex accordingly.
				if ( x > this.lastScreenX ) {
					this.frameIndex = this.frameIndex - this.frameSpeed ;
					this.direction = 'left' ;
				} else if ( x < this.lastScreenX ) {
					this.direction = 'right' ;
					this.frameIndex = this.frameIndex + this.frameSpeed ;
				}


				// Wrap around frame indices if they go out of bounds.
				if ( this.frameIndex > this.totalFrames ) {
					this.frameIndex = 1 ;
				}
				if ( this.frameIndex < 1 ) {
					this.frameIndex = this.totalFrames ;
				}

				// Update the displayed frames only if the frame index has actually changed.
				if ( this.lastFrameIndex != this.lastScreenX ) {
					this.updateFrames() ;
				}

				this.lastScreenX = x ; // Update the last recorded X-coordinate.

			}

		}


	    /**
	     * Handles the 'up' event (mouse up or touch end).
	     * Stops dragging and initiates inertia if frame speed is sufficient.
	     */
		up() {

			this.dragging = false ; // Set dragging flag to false.

			// If there was significant frame movement, start inertia animation.
			if ( this.frameSpeed > 1 ) {
				this.inertia() ;
			}

		}


	    /**
	     * Initiates the inertia animation.
	     */
		inertia() {

			var _self = this ; // Capture 'this' for use in the RAF callback.

			this.inertiaDuration = this.frameSpeed ; // Set inertia duration based on current frame speed.
			this.inertiaFrameSpeed = 0 ; // Reset accumulated inertia frame speed.

			// If RAF is not already running, start it.
			if ( !this.RAFrunning ) {
				requestAnimFrame( this.inertiaRAF ) ;
			}
			this.RAFrunning = true ; // Set the RAF running flag.

		}


	    /**
	     * The Request Animation Frame callback for inertia animation.
	     * Calculates and applies inertia-based frame changes.
	     */
		inertiaRAF() {

			_self.timeInertia += 0.04 ; // Increment inertia time.

			// Calculate current frame speed based on easing function.
			_self.frameSpeed = _self.inertiaDuration - parseInt( Math.easeOutQuart( _self.timeInertia ,  0 ,  _self.inertiaDuration ,  _self.inertiaDuration ) ) ;

			// Accumulate fractional frame speed changes.
			_self.inertiaFrameSpeed += _self.inertiaDuration - Math.easeOutQuart( _self.timeInertia ,  0 ,  _self.inertiaDuration ,  _self.inertiaDuration ) ;


			// If accumulated inertia frame speed is 1 or more, update the frame.
			if ( _self.inertiaFrameSpeed >= 1 ) {

				_self.lastFrameIndex = _self.frameIndex ; // Store current frame index.

				// Update frame index based on direction and floored inertia speed.
				if ( _self.direction == "right" ) {
					_self.frameIndex = _self.frameIndex + Math.floor( _self.inertiaFrameSpeed ) ;
				} else {
					_self.frameIndex = _self.frameIndex - Math.floor( _self.inertiaFrameSpeed ) ;
				}

				// Wrap around frame indices.
				if ( _self.frameIndex > _self.totalFrames ) {
					_self.frameIndex = 1 ;
				}
				if ( _self.frameIndex < 1 ) {
					_self.frameIndex = _self.totalFrames ;
				}

				_self.inertiaFrameSpeed = 0 ; // Reset accumulated inertia speed.
				_self.updateFrames() ; // Update the displayed images.

			}


			// Continue the RAF loop if inertia is still active.
			if ( _self.timeInertia > _self.inertiaDuration || _self.frameSpeed < 1 ) {
				_self.stopInertia() ; // Stop inertia if duration exceeded or speed too low.
			} else {
				requestAnimFrame( _self.inertiaRAF ) ; // Request next animation frame.
			}

		}


	    /**
	     * Stops the inertia animation and resets related variables.
	     */
		stopInertia() {

			this.timeInertia = 0 ; // Reset inertia time.
			this.inertiaDuration = 0 ; // Reset inertia duration.
			this.RAFrunning = false ; // Set RAF running flag to false.

		}


	    /**
	     * Updates the displayed image frames in the DOM.
	     * Hides the previous frame and shows the current frame.
	     */
		updateFrames() {

			// Hide the image element corresponding to the last frame index.
			this.container.querySelector( 'img[data-index="' + this.lastFrameIndex + '"]' ).style.display = "none" ;

			// Show the image element corresponding to the current frame index.
			this.container.querySelector( 'img[data-index="' + this.frameIndex + '"]' ).style.display = "block" ;

		}

}


// Factory function to create and return a new Three60 instance.
var three60 = function( container ,  fileName ,  totalFrames ) {

  return new Three60( container ,  fileName ,  totalFrames ) ;

} ;


// Export the factory function as the default export for module systems.
export default three60 ;