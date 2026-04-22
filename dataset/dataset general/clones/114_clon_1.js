BrowserHistoryUtils=
{
	// Utility function container for browser history management.
	addEvent: function ( elm , evType , fn , useCapture )
	{
		// Ensure useCapture is always a boolean, defaulting to false.
		useCapture = useCapture || false;

		if ( elm.addEventListener )
		{
			// Standard DOM event model
			elm.addEventListener( evType , fn , useCapture ) ;

			return true ;
		}
		else if ( elm.attachEvent )
		{
			// IE-specific event model
			var r = elm.attachEvent ( 'on' + evType , fn ) ;

			return r ;
		}
		else
		{
			// Fallback for older browsers
			elm [ 'on' + evType ] = fn ;
		}
	}
}

BrowserHistory = (function ()
{
	/*
	 * This module manages browser history for single-page applications,
	 * handling browser-specific quirks for back/forward navigation.
	 */

	// Object to store browser type and version details.
	var browser = {
		ie:       false ,
		firefox:  false ,
		safari:   false ,
		opera:    false ,
		version:  -1
	} ;


	// These variables are commented out in the original and will remain so.
	// if setDefaultURL has been called, our first clue
	// that the SWF is ready and listening
	//var swfReady = false;

	// the URL we'll send to the SWF once it is ready
	//var pendingURL = '';


	// Default fragment ID to use if none is present in the URL.
	var defaultHash = '' ;


	// Stores the last known full URL from document.location.
	var currentHref = document.location.href ;


	// The initial URL when the application loads (primarily for IE).
	var initialHref = document.location.href ;


	// The initial hash fragment when the application loads.
	var initialHash = document.location.hash ;


	// Prefix for the history iframe source URL, used by IE.
	var historyFrameSourcePrefix = 'history/historyFrame.html?' ;


	// Used by Safari to maintain history length manually.
	var currentHistoryLength = -1 ;


	// An array to store history hashes for Safari.
	var historyHash = [ ] ;


	// Represents the initial state of the application.
	var initialState = createState ( initialHref , initialHref + '#' + initialHash , initialHash ) ;


	// Stack for tracking backward navigation states.
	var backStack = [ ] ;
	// Stack for tracking forward navigation states.
	var forwardStack = [ ] ;


	// Identifier for the currently active object, if any.
	var currentObjectId = null ;


	// Perform user agent detection to identify the browser.
	var useragent = navigator.userAgent.toLowerCase () ;


	if ( useragent.indexOf ( "opera" ) != -1 )
	{
		browser.opera = true ;
	}
	else if ( useragent.indexOf ( "msie" ) != -1 )
	{
		browser.ie = true ;
		browser.version = parseFloat ( useragent.substring ( useragent.indexOf ( 'msie' ) + 4 ) ) ;
	}
	else if ( useragent.indexOf ( "safari" ) != -1 )
	{
		browser.safari = true ;
		browser.version = parseFloat ( useragent.substring ( useragent.indexOf ( 'safari' ) + 7 ) ) ;
	}
	else if ( useragent.indexOf ( "gecko" ) != -1 )
	{
		browser.firefox = true ;
	}


	// Special handling for IE7, setting a flag for initial load.
	if ( browser.ie == true && browser.version == 7 )
	{
		window [ "_ie_firstload" ] = false ;
	}


	// Accessor functions for obtaining specific elements of the page.

	/**
	 * Retrieves the IE history iframe element.
	 * @returns {HTMLElement} The history iframe.
	 */
	function getHistoryFrame ()
	{
		return document.getElementById ( 'ie_historyFrame' ) ;
	}

	/**
	 * Retrieves the Firefox anchor div element.
	 * @returns {HTMLElement} The anchor div.
	 */
	function getAnchorElement ()
	{
		return document.getElementById ( 'firefox_anchorDiv' ) ;
	}

	/**
	 * Retrieves the Safari form div element.
	 * @returns {HTMLElement} The form div.
	 */
	function getFormElement ()
	{
		return document.getElementById ( 'safari_formDiv' ) ;
	}

	/**
	 * Retrieves the Safari hidden input field for remembering history.
	 * @returns {HTMLInputElement} The remember field.
	 */
	function getRememberElement ()
	{
		return document.getElementById ( "safari_remember_field" ) ;
	}

	/**
	 * Get the Flash player object for performing ExternalInterface callbacks.
	 * Updated for changes to SWFObject2.
	 * @param {string} id - The ID of the Flash player object.
	 * @returns {object|undefined} The Flash player object or undefined if not found.
	 */
	function getPlayer ( id )
	{
		var i ;

		// If an ID is provided and an element with that ID exists.
		if ( id && document.getElementById ( id ) )
		{
			var r = document.getElementById ( id ) ;

			// Check if it's a direct SWFObject element.
			if ( typeof r.SetVariable != "undefined" )
			{
				return r ;
			}
			else
			{
				// Otherwise, search within its children for object or embed tags.
				var o = r.getElementsByTagName ( "object" ) ;
				var e = r.getElementsByTagName ( "embed" ) ;

				// Iterate through object tags.
				for ( i = 0 ; i < o.length ; i++ )
				{
					if ( typeof o [ i ].browserURLChange != "undefined" )
						return o [ i ] ;
				}

				// Iterate through embed tags.
				for ( i = 0 ; i < e.length ; i++ )
				{
					if ( typeof e [ i ].browserURLChange != "undefined" )
						return e [ i ] ;
				}
			}
		}
		else
		{
			// If no ID or element found, search globally for object or embed tags.
			var o = document.getElementsByTagName ( "object" ) ;
			var e = document.getElementsByTagName ( "embed" ) ;

			// Iterate through embed tags globally.
			for ( i = 0 ; i < e.length ; i++ )
			{
				if ( typeof e [ i ].browserURLChange != "undefined" )
				{
					return e [ i ] ;
				}
			}

			// Iterate through object tags globally.
			for ( i = 0 ; i < o.length ; i++ )
			{
				if ( typeof o [ i ].browserURLChange != "undefined" )
				{
					return o [ i ] ;
				}
			}
		}

		// No player found.
		return undefined ;
	}

	/**
	 * Retrieves all Flash player objects on the page.
	 * @returns {Array<object>} An array of Flash player objects.
	 */
	function getPlayers ()
	{
		var i ;
		var players = [ ] ;

		// First, try to find players using <object> tags.
		if ( players.length == 0 )
		{
			var tmp = document.getElementsByTagName ( 'object' ) ;

			for ( i = 0 ; i < tmp.length ; i++ )
			{
				if ( typeof tmp [ i ].browserURLChange != "undefined" )
					players.push ( tmp [ i ] ) ;
			}
		}

		// If no players found or the first player is null, try <embed> tags.
		if ( players.length == 0 || players [ 0 ].object == null )
		{
			var tmp = document.getElementsByTagName ( 'embed' ) ;

			for ( i = 0 ; i < tmp.length ; i++ )
			{
				if ( typeof tmp [ i ].browserURLChange != "undefined" )
					players.push ( tmp [ i ] ) ;
			}
		}

		return players ;
	}

	/**
	 * Retrieves the hash from the history iframe's URL.
	 * @returns {string} The hash value.
	 */
	function getIframeHash ()
	{
		var doc = getHistoryFrame ().contentWindow.document ;
		var hash = String ( doc.location.search ) ;

		if ( hash.length == 1 && hash.charAt ( 0 ) == "?" )
		{
			// If only a question mark, hash is empty.
			hash = "" ;
		}
		else if ( hash.length >= 2 && hash.charAt ( 0 ) == "?" )
		{
			// Remove the leading question mark.
			hash = hash.substring ( 1 ) ;
		}

		return hash ;
	}

	/*
	 * Get the current location hash excluding the '#' symbol.
	 * This function provides a more reliable way to get the hash than document.location.hash.
	 */
	function getHash ()
	{
		// It would be nice if we could use document.location.hash here,
		// but it's faulty sometimes across different browsers.
		var idx = document.location.href.indexOf ( '#' ) ;

		return ( idx >= 0 ) ? document.location.href.substr ( idx + 1 ) : '' ;
	}

	/*
	 * Sets the current location hash, handling edge cases.
	 * Similar to getHash, it avoids direct document.location.hash assignment issues.
	 */
	function setHash ( hash )
	{
		// It would be nice if we could use document.location.hash here,
		// but it's faulty sometimes.
		if ( hash == '' ) hash = '#' ;
		document.location.hash = hash ;
	}

	/**
	 * Creates a new state object for history management.
	 * @param {string} baseUrl - The base URL part.
	 * @param {string} newUrl - The full new URL.
	 * @param {string} flexAppUrl - The hash fragment part.
	 * @returns {object} The created state object.
	 */
	function createState ( baseUrl , newUrl , flexAppUrl )
	{
		return { 'baseUrl': baseUrl , 'newUrl': newUrl , 'flexAppUrl': flexAppUrl , 'title': null } ;
	}

	/*
	 * Adds a history entry to the browser's history.
	 * This function handles browser-specific mechanisms for history manipulation.
	 *   baseUrl: the portion of the location prior to the '#'
	 *   newUrl: the entire new URL, including '#' and following fragment
	 *   flexAppUrl: the portion of the location following the '#' only
	 */
	function addHistoryEntry ( baseUrl , newUrl , flexAppUrl )
	{

		// Clear the forward stack when a new history entry is added.
		forwardStack = [ ] ;

		if ( browser.ie )
		{
			// Special handling for Internet Explorer.
			// Check if this is the first history entry, potentially coming from the iframe creation.
			if ( flexAppUrl == defaultHash && document.location.href == initialHref && window [ '_ie_firstload' ] )
			{
				currentHref = initialHref ;
				return ; // Ignore this initial navigation.
			}

			if ( ( !flexAppUrl || flexAppUrl == defaultHash ) && window [ '_ie_firstload' ] )
			{
				// Adjust URL if no specific hash is provided.
				newUrl = baseUrl + '#' + defaultHash ;
				flexAppUrl = defaultHash ;
			}
			else
			{
				// For IE, navigate the history iframe without a '#' to trigger history save.
				getHistoryFrame ().src = historyFrameSourcePrefix + flexAppUrl ;
			}

			// Set the main document's hash.
			setHash ( flexAppUrl ) ;
		}
		else
		{
			// ADR: Handle updates to existing history entries if the flexAppUrl is the same.
			if ( backStack.length == 0 && initialState.flexAppUrl == flexAppUrl )
			{
				initialState = createState ( baseUrl , newUrl , flexAppUrl ) ;
			}
			else if ( backStack.length > 0 && backStack [ backStack.length - 1 ].flexAppUrl == flexAppUrl )
			{
				backStack [ backStack.length - 1 ] = createState ( baseUrl , newUrl , flexAppUrl ) ;
			}

			if ( browser.safari )
			{
				// For Safari, submit a form to change the URL in a way that respects history.
				if ( browser.version <= 419.3 )
				{
					var file = window.location.pathname.toString () ;
					file = file.substring ( file.lastIndexOf ( "/" ) + 1 ) ;
					getFormElement ().innerHTML = '<form name="historyForm" action="' + file + '#' + flexAppUrl + '" method="GET"></form>' ;

					// Add current query string parameters to the form.
					var qs = window.location.search.substring ( 1 ) ;
					var qs_arr = qs.split ( "&" ) ;

					for ( var i = 0 ; i < qs_arr.length ; i++ )
					{
						var tmp = qs_arr [ i ].split ( "=" ) ;
						var elem = document.createElement ( "input" ) ;
						elem.type = "hidden" ;
						elem.name = tmp [ 0 ] ;
						elem.value = tmp [ 1 ] ;
						document.forms.historyForm.appendChild ( elem ) ;
					}

					document.forms.historyForm.submit () ;
				}
				else
				{
					// For newer Safari versions, direct hash manipulation is sufficient.
					top.location.hash = flexAppUrl ;
				}

				// Manually maintain history for Safari.
				historyHash [ history.length ] = flexAppUrl ;
				_storeStates () ;
			}
			else
			{
				// For other browsers (Firefox, Opera), create an anchor and set the hash.
				addAnchor ( flexAppUrl ) ;
				setHash ( flexAppUrl ) ;
			}
		}

		// Push the new state onto the back stack.
		backStack.push ( createState ( baseUrl , newUrl , flexAppUrl ) ) ;
	}

	/**
	 * Stores the current history states, specifically for Safari.
	 * This involves updating a hidden field.
	 */
	function _storeStates ()
	{
		if ( browser.safari )
		{
			getRememberElement ().value = historyHash.join ( "," ) ;
		}
	}

	/**
	 * Handles a back button event by popping the current state
	 * from the back stack and pushing it to the forward stack.
	 */
	function handleBackButton ()
	{
		// The "current" page is always at the top of the history stack.
		var current = backStack.pop () ;

		if ( !current )
		{
			return ; // Nothing to go back from.
		}

		var last = backStack [ backStack.length - 1 ] ;

		if ( !last && backStack.length == 0 )
		{
			last = initialState ; // If back stack is empty, revert to initial state.
		}

		forwardStack.push ( current ) ;
	}

	/**
	 * Handles a forward button event by popping a state
	 * from the forward stack and pushing it to the back stack.
	 * @summary private method. Do not call this directly.
	 */
	function handleForwardButton ()
	{
		var last = forwardStack.pop () ;

		if ( !last )
		{
			return ; // Nothing to go forward to.
		}

		backStack.push ( last ) ;
	}

	/**
	 * Clears the forward stack when an arbitrary URL navigation occurs.
	 */
	function handleArbitraryUrl ()
	{
		// Delete all the history entries in the forward stack.
		forwardStack = [ ] ;
	}

	/*
	 * Called periodically to poll to see if we need to detect navigation that has occurred.
	 * This is the main polling mechanism for browser history changes.
	 */
	function checkForUrlChange ()
	{

		if ( browser.ie )
		{
			// Internet Explorer specific URL change detection logic.
			if ( currentHref != document.location.href && currentHref + '#' != document.location.href )
			{
				// This occurs when the user has navigated to a specific URL
				// within the app, and didn't use browser back/forward.
				// IE seems to have a bug where it stops updating the URL it
				// shows the end-user at this point, but programmatically it
				// appears to be correct. Do a full app reload to get around
				// this issue for older IE versions.
				if ( browser.version < 7 )
				{
					currentHref = document.location.href ;
					document.location.reload () ;
				}
				else
				{
					// For IE7+, check iframe hash consistency.
					if ( getHash () != getIframeHash () )
					{
						// this.iframe.src = this.blankURL + hash;
						var sourceToSet = historyFrameSourcePrefix + getHash () ;
						getHistoryFrame ().src = sourceToSet ; // Update iframe source to reflect current hash.
					}
				}
			}
		}

		if ( browser.safari )
		{
			// Safari specific URL change detection.
			// We track history.length manually because Safari's hash doesn't always update correctly.
			if ( currentHistoryLength >= 0 && history.length != currentHistoryLength )
			{
				//alert("did change: " + history.length + ", " + historyHash.length + "|" + historyHash[history.length] + "|>" + historyHash.join("|"));
				// If history length changed, then we need to look up the old state
				// in our hand-maintained array since document.location.hash
				// won't have changed, then call back into BrowserManager.
				currentHistoryLength = history.length ;
				var flexAppUrl = historyHash [ currentHistoryLength ] ;

				if ( flexAppUrl == '' )
				{
					//flexAppUrl = defaultHash; // Optional: default to initial hash if empty.
				}
				// ADR: to fix multiple player instances.
				if ( typeof BrowserHistory_multiple != "undefined" && BrowserHistory_multiple == true )
				{
					var pl = getPlayers () ;

					for ( var i = 0 ; i < pl.length ; i++ )
					{
						pl [ i ].browserURLChange ( flexAppUrl ) ;
					}
				}
				else
				{
					getPlayer ().browserURLChange ( flexAppUrl ) ;
				}

				_storeStates () ; // Re-store states after history change.
			}
		}

		if ( browser.firefox )
		{
			// Firefox specific URL change detection.
			if ( currentHref != document.location.href )
			{
				var bsl = backStack.length ;

				var urlActions = {
					back:     false ,
					forward:  false ,
					set:      false
				} ;

				// Check for back button action.
				if ( ( window.location.hash == initialHash || window.location.href == initialHref ) && ( bsl == 1 ) )
				{
					urlActions.back = true ;
					// FIXME: could this ever be a forward button?
					// we can't clear it because we still need to check for forwards. Ugg.
					// clearInterval(this.locationTimer);
					handleBackButton () ;
				}

				// First, check to see if we could have gone forward.
				// We always halt on a no-hash item.
				if ( forwardStack.length > 0 )
				{
					if ( forwardStack [ forwardStack.length - 1 ].flexAppUrl == getHash () )
					{
						urlActions.forward = true ;
						handleForwardButton () ;
					}
				}

				// If not forward, try looking back in the history stack.
				if ( ( bsl >= 2 ) && ( backStack [ bsl - 2 ] ) )
				{
					if ( backStack [ bsl - 2 ].flexAppUrl == getHash () )
					{
						urlActions.back = true ;
						handleBackButton () ;
					}
				}

				// If no explicit back or forward action detected, it's an arbitrary URL change.
				if ( !urlActions.back && !urlActions.forward )
				{
					var foundInStacks = {
						back:     -1 ,
						forward:  -1
					} ;

					for ( var i = 0 ; i < backStack.length ; i++ )
					{
						if ( backStack [ i ].flexAppUrl == getHash () && i != ( bsl - 2 ) )
						{
							arbitraryUrl = true ;
							foundInStacks.back = i ;
						}
					}

					for ( var i = 0 ; i < forwardStack.length ; i++ )
					{
						if ( forwardStack [ i ].flexAppUrl == getHash () && i != ( bsl - 2 ) )
						{
							arbitraryUrl = true ;
							foundInStacks.forward = i ;
						}
					}

					handleArbitraryUrl () ;
				}

				// Firefox changed; notify the BrowserManager.
				currentHref = document.location.href ;
				var flexAppUrl = getHash () ;

				if ( flexAppUrl == '' )
				{
					//flexAppUrl = defaultHash; // Optional: default to initial hash if empty.
				}
				// ADR: to fix multiple player instances.
				if ( typeof BrowserHistory_multiple != "undefined" && BrowserHistory_multiple == true )
				{
					var pl = getPlayers () ;

					for ( var i = 0 ; i < pl.length ; i++ )
					{
						pl [ i ].browserURLChange ( flexAppUrl ) ;
					}
				}
				else
				{
					getPlayer ().browserURLChange ( flexAppUrl ) ;
				}
			}
		}

		// The original code had a commented-out setTimeout, which will remain commented.
		//setTimeout(checkForUrlChange, 50);
	}

	/*
	 * Writes an anchor tag into the page to legitimize it as a URL for Firefox and other browsers.
	 * This helps Firefox detect hash changes in its history.
	 */
	function addAnchor ( flexAppUrl )
	{
		// Only add the anchor if it doesn't already exist.
		if ( document.getElementsByName ( flexAppUrl ).length == 0 )
		{
			getAnchorElement ().innerHTML += "<a name='" + flexAppUrl + "'>" + flexAppUrl + "</a>" ;
		}
	}

	/**
	 * Private initialization function executed when the module loads.
	 * Sets up browser-specific elements and listeners.
	 */
	var _initialize = function ()
	{
		if ( browser.ie )
		{
			// IE specific initialization: create and append a hidden iframe.
			var scripts = document.getElementsByTagName ( 'script' ) ;

			for ( var i = 0 , s ; s = scripts [ i ] ; i++ )
			{
				if ( s.src.indexOf ( "history.js" ) > -1 )
				{
					// Determine the iframe's source URL based on the history.js script path.
					var iframe_location = ( new String ( s.src ) ).replace ( "history.js" , "historyFrame.html" ) ;
				}
			}

			historyFrameSourcePrefix = iframe_location + "?" ;
			var src = historyFrameSourcePrefix ; // Redundant assignment, but kept for Type I.

			var iframe = document.createElement ( "iframe" ) ;
			iframe.id = 'ie_historyFrame' ;
			iframe.name = 'ie_historyFrame' ;
			iframe.src = 'javascript:false;' ; // Start with a blank page.

			try
			{
				document.body.appendChild ( iframe ) ;
			}
			catch ( e )
			{
				// Fallback for appending the iframe if it fails immediately.
				setTimeout ( function ()
				{
					document.body.appendChild ( iframe ) ;
				} , 0 ) ;
			}
		}

		if ( browser.safari )
		{
			// Safari specific initialization: create div for remembering history and form submission.
			var rememberDiv = document.createElement ( "div" ) ;
			rememberDiv.id = 'safari_rememberDiv' ;
			document.body.appendChild ( rememberDiv ) ;
			rememberDiv.innerHTML = '<input type="text" id="safari_remember_field" style="width: 500px;">' ;

			var formDiv = document.createElement ( "div" ) ;
			formDiv.id = 'safari_formDiv' ;
			document.body.appendChild ( formDiv ) ;

			var reloader_content = document.createElement ( 'div' ) ;
			reloader_content.id = 'safarireloader' ;
			var scripts = document.getElementsByTagName ( 'script' ) ;

			for ( var i = 0 , s ; s = scripts [ i ] ; i++ )
			{
				if ( s.src.indexOf ( "history.js" ) > -1 )
				{
					html = ( new String ( s.src ) ).replace ( ".js" , ".html" ) ; // This 'html' variable seems unused.
				}
			}

			reloader_content.innerHTML = '<iframe id="safarireloader-iframe" src="about:blank" frameborder="no" scrolling="no"></iframe>' ;
			document.body.appendChild ( reloader_content ) ;
			reloader_content.style.position = 'absolute' ;
			reloader_content.style.left = reloader_content.style.top = '-9999px' ;
			iframe = reloader_content.getElementsByTagName ( 'iframe' ) [ 0 ] ;

			// Restore history hash from the hidden field if available.
			if ( document.getElementById ( "safari_remember_field" ).value != "" )
			{
				historyHash = document.getElementById ( "safari_remember_field" ).value.split ( "," ) ;
			}

		}

		if ( browser.firefox )
		{
			// Firefox specific initialization: create a div to hold anchors.
			var anchorDiv = document.createElement ( "div" ) ;
			anchorDiv.id = 'firefox_anchorDiv' ;
			document.body.appendChild ( anchorDiv ) ;
		}

		// The original code had a commented-out setTimeout, which will remain commented.
		//setTimeout(checkForUrlChange, 50);
	}


	// Expose public methods and properties of the BrowserHistory module.
	return {
		// The array storing history hashes (primarily for Safari).
		historyHash:     historyHash ,
		// Getter for the back navigation stack.
		backStack:       function () { return backStack ; } ,
		// Getter for the forward navigation stack.
		forwardStack:    function () { return forwardStack } ,
		// Public method to get a Flash player instance.
		getPlayer:       getPlayer ,
		// Public method to get all Flash player instances.
		getPlayers:      getPlayers ,
		// Public method to add a new history entry.
		addHistoryEntry: addHistoryEntry ,
		// Public method to set the default hash.
		setDefaultHash:  function ( hash ) { defaultHash = hash ; } ,
		// Public method to get the current hash.
		getHash:         getHash ,
		// Public method to set the current hash.
		setHash:         setHash ,
		// Public method to initialize the history manager.
		initialize:      _initialize ,
		// Public method for the periodic URL change check.
		checkForUrlChange: checkForUrlChange
	} ;

}) () ;