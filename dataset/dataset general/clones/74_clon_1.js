jQuery ( document ) .ready ( function ( $ )
{
	/*
	 * This breakpoint value is crucial.
	 * If you modify it in your CSS (e.g., style.css or _layout.scss),
	 * ensure this JavaScript variable is updated accordingly to maintain
	 * consistent responsive behavior.
	 */
	var	MqL	=	1170	;

	// Initial positioning of the navigation element based on the current window dimensions.
	moveNavigation ( ) ;

	// Set up a resize event listener for the window.
	$ ( window ) .on ( 'resize' ,	function ( )
	{
		// Use requestAnimationFrame for smoother updates if available,
		// otherwise fall back to a delayed setTimeout for compatibility.
		( ! window .requestAnimationFrame ) ?
			setTimeout ( moveNavigation ,	300 )	:
			window .requestAnimationFrame ( moveNavigation ) ;
	} ) ;

	/*
	 * Mobile interaction:
	 * Handles the opening and closing of the lateral menu
	 * when the menu icon is clicked.
	 */
	$ ( '.cd-nav-trigger' ) .on ( 'click' ,	function ( event )
	{
		event .preventDefault ( ) ; // Prevent default link behavior.

		// Check if the navigation is currently visible.
		if ( $ ( '.cd-main-content' ) .hasClass ( 'nav-is-visible' ) )
		{
			closeNav ( ) ; // Close the navigation.
			$ ( '.cd-overlay' ) .removeClass ( 'is-visible' ) ; // Hide the overlay.
		}
		else
		{
			$ ( this ) .addClass ( 'nav-is-visible' ) ; // Mark trigger as visible.
			$ ( '.cd-primary-nav' ) .addClass ( 'nav-is-visible' ) ; // Show primary navigation.
			$ ( '.cd-main-header' ) .addClass ( 'nav-is-visible' ) ; // Adjust header.

			// Show main content and wait for transition to complete before preventing scroll.
			$ ( '.cd-main-content' ) .addClass ( 'nav-is-visible' ) .one ( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend' ,
			function ( )
			{
				$ ( 'body' ) .addClass ( 'overflow-hidden' ) ;
			} ) ;

			toggleSearch ( 'close' ) ; // Ensure search form is closed.
			$ ( '.cd-overlay' ) .addClass ( 'is-visible' ) ; // Display the overlay.
		}
	} ) ;

	// Event handler for opening the search form.
	$ ( '.cd-search-trigger' ) .on ( 'click' ,	function ( event )
	{
		event .preventDefault ( ) ; // Stop default action.
		toggleSearch ( ) ; // Toggle search visibility.
		closeNav ( ) ; // Ensure navigation is closed when search opens.
	} ) ;

	// Close lateral menu on mobile devices via swipe gestures or overlay click.
	$ ( '.cd-overlay' ) .on ( 'swiperight' ,	function ( )
	{
		if ( $ ( '.cd-primary-nav' ) .hasClass ( 'nav-is-visible' ) )
		{
			closeNav ( ) ;
			$ ( '.cd-overlay' ) .removeClass ( 'is-visible' ) ;
		}
	} ) ;

	// Specific swipe left handler for navigation on the left side.
	$ ( '.nav-on-left .cd-overlay' ) .on ( 'swipeleft' ,	function ( )
	{
		if ( $ ( '.cd-primary-nav' ) .hasClass ( 'nav-is-visible' ) )
		{
			closeNav ( ) ;
			$ ( '.cd-overlay' ) .removeClass ( 'is-visible' ) ;
		}
	} ) ;

	// Close all interactive elements when the overlay is clicked.
	$ ( '.cd-overlay' ) .on ( 'click' ,	function ( )
	{
		closeNav ( ) ;
		toggleSearch ( 'close' ) ;
		$ ( '.cd-overlay' ) .removeClass ( 'is-visible' ) ;
	} ) ;


	// Prevent default click action for direct children of .cd-primary-nav that have submenus.
	$ ( '.cd-primary-nav' ) .children ( '.has-children' ) .children ( 'a' ) .on ( 'click' ,	function ( event )
	{
		event .preventDefault ( ) ;
	} ) ;

	// Handle opening and closing of submenus.
	$ ( '.has-children' ) .children ( 'a' ) .on ( 'click' ,	function ( event )
	{
		// Only prevent default if window width is below breakpoint (mobile/tablet).
		if ( ! checkWindowWidth ( ) )
			event .preventDefault ( ) ;

		var	selected	=	$ ( this ) ;

		if ( selected .next ( 'ul' ) .hasClass ( 'is-hidden' ) )
		{
			// This block executes for the desktop version or when opening a submenu.
			selected .addClass ( 'selected' )
					 .next ( 'ul' ) .removeClass ( 'is-hidden' )
					 .end ( )
					 .parent ( '.has-children' )
					 .parent ( 'ul' ) .addClass ( 'moves-out' ) ;

			selected .parent ( '.has-children' ) .siblings ( '.has-children' )
					 .children ( 'ul' ) .addClass ( 'is-hidden' )
					 .end ( )
					 .children ( 'a' ) .removeClass ( 'selected' ) ;

			$ ( '.cd-overlay' ) .addClass ( 'is-visible' ) ;
		}
		else
		{
			// This path is taken when closing an open submenu.
			selected .removeClass ( 'selected' )
					 .next ( 'ul' ) .addClass ( 'is-hidden' )
					 .end ( )
					 .parent ( '.has-children' )
					 .parent ( 'ul' ) .removeClass ( 'moves-out' ) ;

			$ ( '.cd-overlay' ) .removeClass ( 'is-visible' ) ;
		}

		toggleSearch ( 'close' ) ; // Close any open search form when interacting with navigation.
	} ) ;

	// Submenu items: functionality for the "go back" link.
	$ ( '.go-back' ) .on ( 'click' ,	function ( )
	{
		$ ( this ) .parent ( 'ul' ) .addClass ( 'is-hidden' ) // Hide current submenu.
				   .parent ( '.has-children' )
				   .parent ( 'ul' ) .removeClass ( 'moves-out' ) ; // Reset parent menu position.
	} ) ;

	/**
	 *	@function closeNav
	 *	@description Closes the primary navigation and resets related UI states.
	 */
	function closeNav ( )
	{
		$ ( '.cd-nav-trigger' ) .removeClass ( 'nav-is-visible' ) ;
		$ ( '.cd-main-header' ) .removeClass ( 'nav-is-visible' ) ;
		$ ( '.cd-primary-nav' ) .removeClass ( 'nav-is-visible' ) ;
		$ ( '.has-children ul' ) .addClass ( 'is-hidden' ) ;
		$ ( '.has-children a' ) .removeClass ( 'selected' ) ;
		$ ( '.moves-out' ) .removeClass ( 'moves-out' ) ;
		$ ( '.cd-main-content' ) .removeClass ( 'nav-is-visible' ) .one ( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend' ,
		function ( )
		{
			$ ( 'body' ) .removeClass ( 'overflow-hidden' ) ;
		} ) ;
	}

	/**
	 *	@function toggleSearch
	 *	@param {string} type - Optional. If 'close', forces search to close.
	 *	@description Toggles the visibility of the search form and associated UI elements.
	 */
	function toggleSearch ( type )
	{
		if ( type == "close" )
		{
			// Explicitly close the search interface.
			$ ( '.cd-search' ) .removeClass ( 'is-visible' ) ;
			$ ( '.cd-search-trigger' ) .removeClass ( 'search-is-visible' ) ;
			$ ( '.cd-overlay' ) .removeClass ( 'search-is-visible' ) ;
		}
		else
		{
			// Toggle search visibility.
			$ ( '.cd-search' ) .toggleClass ( 'is-visible' ) ;
			$ ( '.cd-search-trigger' ) .toggleClass ( 'search-is-visible' ) ;
			$ ( '.cd-overlay' ) .toggleClass ( 'search-is-visible' ) ;

			// If on desktop and search is visible, focus the input field.
			if ( $ ( window ) .width ( ) > MqL && $ ( '.cd-search' ) .hasClass ( 'is-visible' ) )
				$ ( '.cd-search' ) .find ( 'input[type="search"]' ) .focus ( ) ;

			// Manage overlay visibility based on search state.
			( $ ( '.cd-search' ) .hasClass ( 'is-visible' ) ) ?
				$ ( '.cd-overlay' ) .addClass ( 'is-visible' )	:
				$ ( '.cd-overlay' ) .removeClass ( 'is-visible' ) ;
		}
	}

	/**
	 *	@function checkWindowWidth
	 *	@returns {boolean} True if current window width is greater than or equal to MqL breakpoint.
	 *	@description Determines if the current window width meets the desktop breakpoint.
	 */
	function checkWindowWidth ( )
	{
		// Cross-browser method to get window width including scrollbar.
		var	e	=	window ,
			a	=	'inner' ;

		// Fallback for older IE versions.
		if ( ! ( 'innerWidth' in window ) )
		{
			a	=	'client' ;
			e	=	document .documentElement	||	document .body ;
		}

		// Compare current width with the breakpoint.
		if ( e [ a + 'Width' ]	>=	MqL )
		{
			return	true ;
		}
		else
		{
			return	false ;
		}
	}

	/**
	 *	@function moveNavigation
	 *	@description Repositions the navigation element based on the current window width
	 *	(desktop vs. mobile/tablet layout).
	 */
	function moveNavigation ( )
	{
		var	navigation	=	$ ( '.cd-nav' ) ;
		var	desktop		=	checkWindowWidth ( ) ; // Check if currently in desktop view.

		if ( desktop )
		{
			// For desktop: detach and insert before header buttons.
			navigation .detach ( ) ;
			navigation .insertBefore ( '.cd-header-buttons' ) ;
		}
		else
		{
			// For mobile/tablet: detach and insert after main content.
			navigation .detach ( ) ;
			navigation .insertAfter ( '.cd-main-content' ) ;
		}
	}
} ) ;