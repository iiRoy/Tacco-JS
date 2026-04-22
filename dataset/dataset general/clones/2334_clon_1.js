var PhotoTilt = function ( options ) { // Main PhotoTilt constructor function

	'use strict'; // Enforce strict mode for cleaner code and fewer errors

	// Declare all necessary variables at the top of the scope
	var imgUrl = options . url , /* URL for the high-resolution image */
		lowResUrl = options . lowResUrl , // Optional low-resolution image URL for two-phase loading
		container = options . container || document . body , // DOM element to contain the photo tilt effect, defaults to body
		latestTilt = 0 , // Stores the most recent tilt value from device orientation
		timeoutID = 0 , // ID for the resize timeout to prevent excessive re-rendering
		disableTilt , // Flag to determine if tilt effect should be disabled (e.g., image too small)
		viewport , // Object storing the dimensions of the container
		imgData , // Object storing original image dimensions and aspect ratio
		img , // The actual image element displayed in the DOM
		imgLoader , // Temporary Image object used for preloading
		delta , // Difference between image width and viewport width
		centerOffset , // Half of the delta, used for initial image positioning
		tiltBarWidth , // Width of the tilt indicator bar
		tiltCenterOffset , // Centering offset for the tilt indicator
		tiltBarIndicatorWidth , // Width of the moving part of the tilt indicator
		tiltBarIndicator , // The DOM element for the tilt indicator
		config ; // Configuration object for various settings

	// Initialize the configuration object with defaults or provided options
	config = {
		maxTilt : options . maxTilt || 20 , // Maximum tilt degree allowed
		twoPhase : options . lowResUrl || false , // Enable two-phase loading if lowResUrl is provided
		reverseTilt : options . reverseTilt || false // Reverse the tilt direction
	};

	// Polyfill window.requestAnimationFrame for smoother animations across browsers
	window . requestAnimationFrame = window . requestAnimationFrame ||
									window . mozRequestAnimationFrame ||
									window . webkitRequestAnimationFrame ||
									window . msRequestAnimationFrame ;

	/**
	 * Initializes the PhotoTilt component.
	 * Sets up the viewport, preloads images, and attaches event listeners.
	 */
	var init = function ( ) {

		// Determine which image URL to use initially based on two-phase loading setting
		var url = config . twoPhase ? lowResUrl : imgUrl ;

		generateViewPort ( ) ; // Calculate and store the container's dimensions

		// Preload the initial image (low-res or high-res)
		preloadImg ( url , function ( ) {

			img = imgLoader . cloneNode ( false ) ; // Clone the loaded image to prevent re-fetching
			generateImgData ( ) ; // Extract image dimensions and aspect ratio
			imgLoader = null ; // Clear the loader reference

			// If two-phase loading is enabled, preload the high-res image in the background
			if ( config . twoPhase ) {

				preloadImg ( imgUrl , function ( ) {
					img . src = imgLoader . src ; // Update the displayed image with the high-res version
					imgLoader = null ; // Clear loader
				} ) ;

			}

			render ( ) ; // Render the initial state of the component
			addEventListeners ( ) ; // Attach all necessary event listeners

		} ) ;

	} ;

	/**
	 * Updates the position of the image based on the latest tilt value.
	 * This function is called repeatedly via requestAnimationFrame.
	 */
	var updatePosition = function ( ) {

		var tilt = latestTilt , // Get the current tilt value
			pxToMove ; // Variable to store the calculated pixel movement

		// Clamp the tilt value within the configured maxTilt range
		if ( tilt > 0 ) {
			tilt = Math . min ( tilt , config . maxTilt ) ;
		} else {
			tilt = Math . max ( tilt , config . maxTilt * -1 ) ;
		}

		// Reverse tilt direction if configured
		if ( ! config . reverseTilt ) {
			tilt = tilt * -1 ;
		}

		// Calculate how many pixels the image needs to move
		pxToMove = ( tilt * centerOffset ) / config . maxTilt ;

		// Update the image's X position
		updateImgPosition ( imgData , ( centerOffset + pxToMove ) * -1 ) ;

		// Update the visual tilt bar indicator
		updateTiltBar ( tilt ) ;

		// Request the next animation frame to continue updating
		window . requestAnimationFrame ( updatePosition ) ;

	} ;

	/**
	 * Updates the position of the tilt bar indicator based on the current tilt.
	 * @param {number} tilt - The current tilt degree.
	 */
	var updateTiltBar = function ( tilt ) {

		// Calculate pixel movement for the indicator within its bar
		var pxToMove = ( tilt * ( ( tiltBarWidth - tiltBarIndicatorWidth ) / 2 ) ) / config . maxTilt ;
		setTranslateX ( tiltBarIndicator , ( tiltCenterOffset + pxToMove ) ) ; // Apply the translation

	} ;

	/**
	 * Applies a horizontal translation to the main image element.
	 * @param {object} imgData - Data about the image (not directly used here, but part of original signature).
	 * @param {number} pxToMove - The amount in pixels to translate the image horizontally.
	 */
	var updateImgPosition = function ( imgData , pxToMove ) {
		setTranslateX ( img , pxToMove ) ; // Use the setTranslateX helper
	} ;

	/**
	 * Adds all necessary event listeners for device orientation and window resizing.
	 */
	var addEventListeners = function ( ) {

		// Check if DeviceOrientationEvent is supported by the browser
		if ( window . DeviceOrientationEvent ) {

			var averageGamma = [ ] ; // Array to store recent gamma values for averaging

			// Listen for device orientation changes
			window . addEventListener ( 'deviceorientation' , function ( eventData ) {

				// Only update tilt if it's not disabled
				if ( ! disableTilt ) {

					// Keep the averageGamma array to a certain size (e.g., 8 samples)
					if ( averageGamma . length > 8 ) {
						averageGamma . shift ( ) ; // Remove the oldest sample
					}

					averageGamma . push ( eventData . gamma ) ; // Add the new gamma value

					// Calculate the average gamma (tilt)
					latestTilt = averageGamma . reduce ( function ( a , b ) { return a + b ; } ) / averageGamma . length ;

				}

			} , false ) ; // 'false' for bubbling phase

			// Start the animation loop for position updates
			window . requestAnimationFrame ( updatePosition ) ;

		}

		// Listen for window resize events
		window . addEventListener ( 'resize' , function ( ) {

			container . classList . add ( 'is-resizing' ) ; // Add a class for styling during resize
			window . clearTimeout ( timeoutID ) ; // Clear any existing resize timeout

			// Set a timeout to re-render after resizing stops (debouncing)
			timeoutID = window . setTimeout ( function ( ) {

				generateViewPort ( ) ; // Recalculate viewport dimensions
				container . innerHTML = "" ; // Clear existing content
				render ( ) ; // Re-render the component
				container . classList . remove ( 'is-resizing' ) ; // Remove resize class

			} , 100 ) ; // 100ms debounce delay

		} , false ) ; // 'false' for bubbling phase

	} ;

	/**
	 * Helper function to apply cross-browser translateX CSS transformations.
	 * @param {HTMLElement} node - The DOM element to transform.
	 * @param {number} amount - The amount in pixels to translate on the X-axis.
	 */
	var setTranslateX = function ( node , amount ) {
		node . style . webkitTransform =
		node . style . MozTransform =
		node . style . msTransform =
		node . style . transform = "translateX(" + Math . round ( amount ) + "px)" ;
	} ;

	/**
	 * Renders the image, mask, and tilt bar into the container.
	 * Calculates initial positions and dimensions.
	 */
	var render = function ( ) {

		var mask , // The mask div to clip the image
			tiltBar , // The container for the tilt indicator
			resizedImgWidth , // The width of the image after being resized to fit the viewport height
			tiltBarPadding = 20 ; // Padding for the tilt bar

		mask = document . createElement ( 'div' ) ;
		mask . classList . add ( 'mask' ) ;

		img . height = viewport . height ; // Set image height to match viewport height
		resizedImgWidth = ( imgData . aspectRatio * img . height ) ; // Calculate proportional width

		delta = resizedImgWidth - viewport . width ; // Difference between image width and viewport width
		centerOffset = delta / 2 ; // Half of the delta for centering

		tiltBar = document . createElement ( 'div' ) ;
		tiltBar . classList . add ( 'tilt-bar' ) ;
		tiltBarWidth = viewport . width - tiltBarPadding ; // Calculate tilt bar width

		tiltBarIndicator = document . createElement ( 'div' ) ;
		tiltBarIndicator . classList . add ( 'tilt-indicator' ) ;

		// Calculate indicator width relative to the image's ability to move
		tiltBarIndicatorWidth = ( viewport . width * tiltBarWidth ) / resizedImgWidth ;
		tiltBarIndicator . style . width = tiltBarIndicatorWidth + 'px' ;

		// Calculate the initial centering offset for the indicator
		tiltCenterOffset = ( ( tiltBarWidth / 2 ) - ( tiltBarIndicatorWidth / 2 ) ) ;

		updatePosition ( ) ; // Call updatePosition immediately to set initial image state

		// Check if there's enough image to tilt (i.e., if delta > 0)
		if ( tiltCenterOffset > 0 ) {
			disableTilt = false ; // Enable tilt
			tiltBar . appendChild ( tiltBarIndicator ) ; // Add indicator to bar
			mask . appendChild ( tiltBar ) ; // Add tilt bar to mask
			container . classList . remove ( 'disable-transitions' ) ; // Allow transitions
		} else {
			disableTilt = true ; // Disable tilt if image is too small
			latestTilt = 0 ; // Reset tilt
			container . classList . add ( 'disable-transitions' ) ; // Prevent transitions
		}

		mask . appendChild ( img ) ; // Add image to mask
		container . appendChild ( mask ) ; // Add mask to container

	} ;

	/**
	 * Calculates and stores the dimensions of the container element.
	 */
	var generateViewPort = function ( ) {

		var containerStyle = window . getComputedStyle ( container , null ) ; // Get computed styles

		viewport = { // Store width and height as integers
			width : parseInt ( containerStyle . width , 10 ) ,
			height : parseInt ( containerStyle . height , 10 )
		} ;

	} ;

	/**
	 * Extracts and stores relevant data from the preloaded image.
	 */
	var generateImgData = function ( ) {

		imgData = { // Store width, height, aspect ratio, and source
			width : imgLoader . width ,
			height : imgLoader . height ,
			aspectRatio : imgLoader . width / imgLoader . height ,
			src : imgLoader . src
		} ;

	} ;

	/**
	 * Preloads an image given its URL and executes a callback function upon successful load.
	 * @param {string} url - The URL of the image to preload.
	 * @param {function} done - The callback function to execute when the image has loaded.
	 */
	var preloadImg = function ( url , done ) {

		imgLoader = new Image ( ) ; // Create a new Image object
		imgLoader . addEventListener ( 'load' , done , false ) ; // Attach load event listener
		imgLoader . src = url ; // Set the image source to start loading

	} ;

	init ( ) ; // Call the initialization function to start the component

	// Return a public interface for interacting with the PhotoTilt instance
	return {
		getContainer : function ( ) { // Expose a method to get the container element
			return container ;
		}
	}

} ;