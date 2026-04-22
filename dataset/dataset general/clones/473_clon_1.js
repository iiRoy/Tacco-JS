$( document ).ready( function ( ) { /* This function executes once the DOM is fully loaded.
                                              It sets up initial configurations and event handlers for the application. */

	// --- Global Variable Declarations ---
	// These variables store references to DOM elements and maintain the application state.
	var viewport;                     // Stores the current dimensions of the browser viewport (width and height).
	var page;                         // jQuery object for the main content area of the application.
	var pageContent;                  // jQuery object for the specific div where dynamic content is loaded.
	var slidingMenu;                  // jQuery object for the side-sliding menu element.
	var slidingMenuContent;           // jQuery object for the content area within the sliding menu.

	var isMenuOpen = false;           /* A boolean flag indicating whether the sliding menu is currently open.
	                                     'true' if open, 'false' if closed. */
	var visiblePageMargin = 55;       // The amount of the main page that remains visible when the menu is open.
	var maximumMenuWith = 500;        // The absolute maximum width (in pixels) the sliding menu can expand to.

	var preloader   = '<center style="margin-top: 30px;"><img src="img/preloader.gif" alt="loading..." /></center>'; // HTML snippet for a loading spinner.


	// Call the initialization function immediately after variable declarations.
	initMetrics( );



	/**
	 * @function initMetrics
	 * @description Gathers references to key DOM elements and updates viewport dimensions.
	 *              This function is critical for responsive design, especially after
	 *              device orientation changes or window resizing.
	 */
	function initMetrics ( ) {

		page               = $( "#page" );              // Assign jQuery object for the page container.
		pageContent        = $( "#pageContent" );       // Assign jQuery object for the dynamic content area.
		slidingMenu        = $( "#slidingMenu" );       // Assign jQuery object for the sliding menu.
		slidingMenuContent = $( "#slidingMenuContent" ); // Assign jQuery object for the menu's inner content.

		// Populate the 'viewport' object with current window dimensions.
		viewport = {
			width  : $( window ).width( ),  // Current width of the browser window.
			height : $( window ).height( )  // Current height of the browser window.
		};

	} // End of initMetrics function.



	/**
	 * @function openMenu
	 * @description Handles the animation and logic for opening the sliding menu.
	 *              Calculates the appropriate menu width and adjusts UI elements.
	 */
	function openMenu ( ) {

		isMenuOpen = true; // Update the menu state to 'open'.

		// Recalculate menu width dynamically. This is essential because 'viewport.width'
		// might have changed since the last time this function was called (e.g., device rotation).
		var menuWidth = viewport.width - visiblePageMargin;

		// Constrain the menu width to the predefined maximum, if the viewport is large enough.
		if ( viewport.width > ( maximumMenuWith + visiblePageMargin ) ) {

			menuWidth = maximumMenuWith;

		}

		/*
		 * Workaround for certain mobile browsers (e.g., Windows Phone 7.5) where
		 * elements with lower z-index might remain clickable. Making the menu visible
		 * just before the animation helps prevent accidental clicks on the hidden menu.
		 */
		slidingMenu.css( "visibility", "visible" );


		// Ensure heights are correctly adjusted to prevent content overflow, especially on older devices.
		adjustHeight( );

		// Animate the main page to slide left, revealing the menu.
		page.animate(
			{
				left: menuWidth + "px"
			},
			{
				duration: 300 // Animation duration in milliseconds.
			}
		);

	} // End of openMenu function.



	/**
	 * @function closeMenu
	 * @description Manages the animation and state changes required to close the sliding menu.
	 */
	function closeMenu ( ) {

		isMenuOpen = false; // Set the menu state to 'closed'.

		// Animate the main page back to its initial position (left: 0px).
		page.animate(
			{
				left: "0px" // Target position for the page.
			},
			{
				duration: 180, // Animation speed for closing.
				/*
				 * For browsers like Windows Phone 7.5, where elements can be clickable
				 * even if technically behind another element, we hide the menu
				 * *after* the closing animation is fully complete.
				 */
				complete: function ( ) {
					slidingMenu.css( "visibility", "hidden" ); // Hide the menu element.
				}
			}
		)
		// This chained animation (with duration 0) ensures the page height is reset if it was modified.
		.animate( {
			height : "100%"
		}, { duration: 0 } );

	} // End of closeMenu function.



	/**
	 * @function adjustHeight
	 * @description Synchronizes the heights of the sliding menu and the main page
	 *              to prevent scrolling issues or visual overflows, particularly on
	 *              older Android versions.
	 */
	function adjustHeight ( ) {

		var menuHeight          = slidingMenu.height( );        // Get the current computed height of the sliding menu.
		var pageHeight          = page.height( );               // Get the current computed height of the main page.
		var MenuContentHeight   = slidingMenuContent.height( ); // Get the height of the actual content inside the menu.

		// If the main page's height is less than the menu's height,
		// adjust both to the menu content's height to prevent overflow.
		if ( pageHeight < menuHeight ) {
			slidingMenu.css( "height", MenuContentHeight + "px" ); // Set menu height.
			page.css( "height", MenuContentHeight + "px" );       // Set page height.
		}
		// Otherwise, ensure the menu's height matches the page's height.
		else {
			slidingMenu.css( "height", pageHeight + "px" );
		}

	} // End of adjustHeight function.



	/**
	 * @function loadPage
	 * @param {string} url - The URL of the content to be loaded into the 'pageContent' area.
	 * @description Closes the menu, displays a preloader, and then loads new HTML content
	 *              from the specified URL into the main content area.
	 */
	function loadPage ( url ) {

		closeMenu( );                     // Ensure the menu is closed before loading new content.
		pageContent.html( preloader );    // Display the preloader HTML while content is being fetched.

		/*
		 * The setTimeout wrapper is for demonstration purposes only, to visibly show the preloader.
		 * In a production environment, this should be removed to load content instantly.
		 */
		setTimeout(
			pageContent.load( url, function ( ) { /* No specific actions needed after loading for this demo. */ } ),
			1200 // Delay in milliseconds before executing the load (for demo purposes).
		);

	} // End of loadPage function.



	/**
	 * @function orientationChange
	 * @description Event handler for device orientation changes or window resize events.
	 *              It re-initializes metrics and adjusts the menu's state to fit the new dimensions.
	 */
	function orientationChange ( ) {

		/*
		 * A small delay (500ms) is introduced before re-calculating metrics.
		 * This is a workaround for some older mobile devices that report incorrect
		 * viewport dimensions immediately after an orientation change event fires.
		 */
		window.setTimeout( function ( ) {

			initMetrics( ); // Re-initialize all UI element references and viewport dimensions.

			// Re-open or re-close the menu based on its previous state to adjust its position/width.
			if ( isMenuOpen ) {
				openMenu( );
			}
			else {
				closeMenu( );
			}

		}, 500 ); // Delay duration in milliseconds.

	} // End of orientationChange function.



	// --- Event Handlers ---

	// Click handler for the menu toggle button.
	$( "a.show-menu-button" ).click( function ( ) {

		var pagePosition = page.css( 'left' ); // Get the current 'left' CSS value of the main page.

		// Check if the page is currently at its closed position (0px from the left).
		if ( pagePosition == "0px" ) {
			openMenu( ); // If closed, open the menu.
		}
		else {
			closeMenu( ); // If open, close the menu.
		}

	} ); // End of click handler for 'show-menu-button'.


	// Attach event listeners for window resizing and orientation changes.
	// The 'resize' event is included as a fallback for devices that do not reliably
	// trigger 'orientationchange' (e.g., certain Windows Phone versions).
	window.addEventListener( "resize", orientationChange, false );
	window.addEventListener( "orientationchange", orientationChange, false );


	// Bind a 'hashchange' event to the window object.
	// This event fires when the URL's hash fragment changes (e.g., from #home to #about).
	$( window ).bind( 'hashchange', function ( e ) {

		var hash = location.hash; // Retrieve the current hash from the URL.
		var url = "";             // Variable to hold the URL derived from the hash.

		/*
		 * For specific browsers like Windows Phone 7.5, the page doesn't automatically
		 * scroll to the top when new content is loaded. This line ensures consistent
		 * user experience by forcing a scroll to the top.
		 */
		window.scrollTo( 0, 1 ); // Scrolls to position (0, 1) - slight offset to ensure scroll event fires.

		// Determine the content URL based on the hash value.
		if ( hash == '' ) {
			url = "short.php"; // Default URL if no hash is present in the browser's address bar.
		}
		else {
			url = hash.split( "#" )[ 1 ]; // Extract the URL part after the '#' symbol.
		}

		loadPage( url ); // Load the determined URL into the page content area.

	} ); // End of hashchange event handler.

} ); // End of document.ready function.