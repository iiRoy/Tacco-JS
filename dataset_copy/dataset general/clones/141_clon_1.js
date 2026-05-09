/*
 * This file contains utility functions and styling logic
 * for the Download Panel Tweaker extension.
 * It manages loading and unloading of dynamic CSS stylesheets.
 */
var downloadsStyles =
{
	dpt : dpTweaker , // Reference to the main tweaker object

	get sss ( )
	{
		// Remove the 'sss' property from 'this' to allow re-initialization
		delete this.sss ;

		// Initialize 'sss' with the Style Sheet Service
		return this.sss = Components.classes[ "@mozilla.org/content/style-sheet-service;1" ]
			.getService ( Components.interfaces.nsIStyleSheetService ) ;
	} ,

	// Helper to create a new data URI for CSS
	newCssURI : function ( cssStr )
	{
		// First, clean up the CSS string by trimming leading whitespace
		cssStr = this.trimCSSString ( cssStr ) ;
		// Create and return a new URI for the CSS data
		return Services.io.newURI ( "data:text/css," + encodeURIComponent ( cssStr ) , null , null ) ;
	} ,

	/*
	 * Function: trimCSSString
	 * Description: Removes common leading whitespace from each line of a CSS string.
	 * Parameters:
	 *   s - The input CSS string.
	 * Returns: The trimmed CSS string.
	 */
	trimCSSString : function ( s )
	{
		// Find the common leading whitespace (indentation)
		var spaces = s.match ( /^[ \t]*/ ) [ 0 ] ;
		// Replace that leading whitespace on all lines
		return s.replace ( new RegExp ( "^" + spaces , "mg" ) , "" ) ;
	} ,

	loadStyles : function ( add )
	{
		// Load/unload compact style based on preferences
		this.loadCompactStyle ( add ? prefs.get ( "compactDownloads" ) : 0 ) ;
		// Load/unload general tweak style
		this.loadTweakStyle ( add ) ;
	} ,

	// Internal flag: Is the compact style sheet currently loaded?
	_compactStyleLoaded : false ,
	// Internal flag: Is the "force compact" style sheet currently loaded?
	_forceCompactStyleLoaded : false ,

	loadCompactStyle : function ( compact )
	{
		// Handle compact style (value 1)
		this.loadStyleFile ( "compactDownloads.css" , "_compactStyleLoaded" , compact == 1 ) ;
		// Handle force compact style (value 2)
		this.loadStyleFile ( "compactDownloadsForce.css" , "_forceCompactStyleLoaded" , compact == 2 ) ;
	} ,

	// Generic function to load/unload a specific style file
	loadStyleFile : function ( file , key , load )
	{
		// Check if the state is already as requested; if so, do nothing.
		if ( load == this [ key ] )
		{
			return ;
		}

		// Update the internal state flag
		this [ key ] = load ;

		// Construct the URI for the style file
		var styleFileURI = Services.io.newURI ( "chrome://downloadpaneltweaker/content/" + file , null , null ) ;

		// Load or unload the sheet
		this.loadSheet ( styleFileURI , load ) ;

		// Log the action for debugging purposes
		_log ( ( load ? "Load" : "Unload" ) + " " + file ) ;
	} ,

	_tweakStyleLoaded : false , // Flag indicating if the main tweak CSS is loaded
	tweakCssURI : null ,        // Stores the URI of the dynamically generated tweak CSS

	// Minimum dimensions for the panel and progress bar
	minPanelWidth : 5 ,
	minPanelHeight : 30 ,
	minProgressBarHeight : 6 ,
	maxProgressBarHeight : 50 ,

	loadTweakStyle : function ( add )
	{
		// If the state is already correct, exit early.
		if ( add == this._tweakStyleLoaded )
			return ;

		// Update the internal state flag.
		this._tweakStyleLoaded = add ;

		var cssURI ; // Variable to hold the CSS URI

		if ( add ) // If we need to add/load the style
		{
			// Retrieve preferences and calculate dynamic CSS values
			var panelWidth = Math.max ( this.minPanelWidth , prefs.get ( "panelWidth" , 60 ) ) ;
			var panelMaxHeight = prefs.get ( "panelMaxHeight" , 0 ) ;
			var panelMaxHeightVal = panelMaxHeight <= 0
				? "none"
				: Math.max ( this.minPanelHeight , panelMaxHeight ) + "px" ;
			var pbHeight = Math.max ( this.minProgressBarHeight , Math.min ( this.maxProgressBarHeight ,
				prefs.get ( "progressBarHeight" , 10 )
			) ) ;
			var containerSelector = this.dpt.fxVersion >= 20
				? ".downloadContainer"
				: ".download-state > vbox" ;
			var window = Services.wm.getMostRecentWindow ( null ) ;
			var tdsPrefix = window && "textDecorationStyle" in window.document.documentElement.style
				? ""
				: "-moz-" ;
			var grayscaleFilter = this.dpt.fxVersion >= 36
				? "grayscale(1)"
				: 'url("chrome://mozapps/skin/extensions/extensions.svg#greyscale")' ;

			// Construct the main CSS string using interpolated values
			var cssStr = '\
				/* Download Panel Tweaker - Dynamic Styles */\n\
				@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
				@-moz-document url("chrome://browser/content/browser.xul"),\n\
					url("chrome://browser/content/places/places.xul"),\n\
					url("about:downloads"),\n\
					url("chrome://browser/content/downloads/contentAreaDownloadsView.xul")\n\
				{\n\
					#downloadsListBox\n\
					{\n\
						/* Set width for Firefox 19 and older and NASA Night Launch theme */\n\
						width: auto !important;\n\
						min-width: 0 !important;\n\
						max-width: none !important;\n\
						max-height: ' + panelMaxHeightVal + ' !important;\n\
					}\n\
					' + containerSelector + '\n\
					{\n\
						width: ' + panelWidth + 'ch !important;\n\
						min-width: 0 !important;\n\
					}\n\
					#downloadsSummaryDescription,\n\
					#downloadsSummaryDetails\n\
					{\n\
						width: ' + panelWidth + 'ch !important;\n\
						min-width: 0 !important;\n\
					}\n\
					.downloadTarget\n\
					{\n\
						min-width: 5ch !important;\n\
					}\n\
					.downloadProgress\n\
					{\n\
						min-width: 20px !important;\n\
						min-height: ' + pbHeight + 'px !important;\n\
						height: ' + pbHeight + 'px !important;\n\
					}\n\
					.downloadProgress > .progress-bar\n\
					{\n\
						height: auto !important;\n\
						min-height: 2px !important;\n\
						max-height: ' + pbHeight + 'px !important;\n\
					}' + (
						// Conditionally add styles for decolorizing paused progress bars
						prefs.get ( "decolorizePausedProgress" )
						? '\n\
					/* Styles for paused downloads, making them grayscale */\n\
					.download-state[state="4"] .downloadProgress,\n\
					#downloadsSummary[' + this.dpt.pausedAttr + '] .downloadProgress\n\
					{\n\
						filter: ' + grayscaleFilter + ';\n\
					}\n\
					.download-state[state="4"] .downloadProgress > .progress-bar,\n\
					.download-state[state="4"] .downloadProgress > .progress-remainder,\n\
					#downloadsSummary[' + this.dpt.pausedAttr + '] .downloadProgress > .progress-bar,\n\
					#downloadsSummary[' + this.dpt.pausedAttr + '] .downloadProgress > .progress-remainder\n\
					{\n\
						opacity: 0.85;\n\
					}'
						: ""
					) + '\n\
				}\n\
				/* Styles for about:addons and extensions.xul */\n\
				@-moz-document url("about:addons"),\n\
					url("chrome://mozapps/content/extensions/extensions.xul")\n\
				{\n\
					.downloadPanelTweaker-item[tooltiptext]\n\
					{\n\
						text-decoration: underline;\n\
						' + tdsPrefix + 'text-decoration-style: dotted;\n\
					}\n\
					.downloadPanelTweaker-indent .preferences-title\n\
					{\n\
						-moz-margin-start: 4ch !important;\n\
					}\n\
				}';
			// Create the URI from the generated CSS string
			cssURI = this.tweakCssURI = this.newCssURI ( cssStr ) ;
		}
		else // If we need to unload the style
		{
			// Use the previously stored URI for unloading
			cssURI = this.tweakCssURI ;
		}

		// Perform the actual loading or unloading of the sheet
		this.loadSheet ( cssURI , add ) ;

		// Log the action
		_log ( "loadTweakStyle(" + add + ")" ) ;
	} ,

	// Forces a reload of the main tweak style
	reloadTweakStyle : function ( )
	{
		// Unload first, then load again
		this.loadTweakStyle ( false ) ;
		this.loadTweakStyle ( true ) ;
	} ,

	_reloadTweakStyleTimer : null , // Timer for debouncing reload requests

	// Proxies reloadTweakStyle with a debounce timer
	reloadTweakStyleProxy : function ( )
	{
		var timer = this._reloadTweakStyleTimer ;

		// If a timer is already active, cancel it to debounce
		if ( timer )
		{
			timer.cancel ( ) ;
		}
		else
		{
			// Create a new timer instance if none exists
			timer = this._reloadTweakStyleTimer = Components.classes[ "@mozilla.org/timer;1" ]
				.createInstance ( Components.interfaces.nsITimer ) ;
		}

		// Initialize the timer to call reloadTweakStyle after a delay
		timer.init ( function ( )
		{
			this._reloadTweakStyleTimer = null ; // Clear the timer reference
			this.reloadTweakStyle ( ) ;           // Perform the actual reload
		} .bind ( this ) , 300 , timer.TYPE_ONE_SHOT ) ;
	} ,

	// Core function to load or unload a stylesheet
	loadSheet : function ( cssURI , load )
	{
		var sss = this.sss ; // Get the Style Sheet Service instance

		// Check if the sheet is already in the desired state
		if ( load == sss.sheetRegistered ( cssURI , sss.USER_SHEET ) )
		{
			return ; // Nothing to do
		}

		if ( load )
		{
			// Load and register the sheet
			sss.loadAndRegisterSheet ( cssURI , sss.USER_SHEET ) ;
		}
		else
		{
			// Unregister (unload) the sheet
			sss.unregisterSheet ( cssURI , sss.USER_SHEET ) ;
		}
	}
} ; // End of downloadsStyles object definition