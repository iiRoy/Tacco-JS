( function ( $ ) {
	var FlexibleDisplayView = function () {
	};
	FlexibleDisplayView.prototype = {

		/**
		 *  Reference to the browser window.
		 */
		viewportObject: $( window ),

		/**
		 *  The main HTML container element.
		 */
		mainContainer: undefined,

		/**
		 *  The media content (e.g., video, image) within the container.
		 */
		mediaContent: undefined,

		/**
		 *  An element for visual effects (e.g., gradient overlay).
		 */
		overlayLayer: undefined,

		/**
		 *  Configuration settings for the view.
		 */
		configSettings: undefined,

		/**
		 *  Starts the display management process.
		 *
		 *  @param {HTMLElement} containerElement The primary element to be managed.
		 */
		initiate: function ( containerElement ) {
			var selfRef = this;

			// Configure the primary display area.
			this.configureContainer( containerElement );

			// Perform an initial size adjustment.
			this.adjustDimensions( null );

			// Attach a listener for window resizing.
			this.viewportObject.resize( function ( evtObject ) {
				selfRef.adjustDimensions( evtObject );
			} );
		},

		/**
		 *  Handles window resize events to update element dimensions.
		 *
		 *  @param {Event} resizeEvt The event object from the resize.
		 */
		adjustDimensions: function ( resizeEvt ) {
			var viewWidth = this.viewportObject.width();
			var viewHeight = this.viewportObject.height();
			var contentWidth = this.mediaContent.data( 'original-width' );
			var contentHeight = this.mediaContent.data( 'original-height' );

			// Adjust the dimensions of the main container.
			this.mainContainer.width( viewWidth );
			this.mainContainer.height( viewHeight );
			if ( this.configSettings.filterImagePath !== undefined ) {
				this.overlayLayer.width( viewWidth );
				this.overlayLayer.height( viewHeight );
			}

			// Scale the media content appropriately.
			var viewAspect = viewWidth / viewHeight;
			var contentAspect = contentWidth / contentHeight;
			if ( contentAspect > viewAspect ) {
				this.mediaContent.height( viewHeight );
				this.mediaContent.width( contentWidth * ( viewHeight / contentHeight ) );
				this.mediaContent.css( {
					left: -( ( this.mediaContent.width() - viewWidth ) / 2 ),
					top: 0
				} );
			} else {
				this.mediaContent.width( viewWidth );
				this.mediaContent.height( contentHeight * ( viewWidth / contentWidth ) );
				this.mediaContent.css( {
					left: 0,
					top: -( ( this.mediaContent.height() - viewHeight ) / 2 )
				} );
			}

		},

		/**
		 *  Prepares the primary display container.
		 */
		configureContainer: function ( elemToConfigure ) {
			this.mainContainer = elemToConfigure;
			elemToConfigure.css( {
				display: "block",
				overflow: "hidden",
				margin: 0,
				padding: 0,
				position: "relative"
			} );

			var mediaContent = elemToConfigure.children( ":first-child" );
			this.mediaContent = mediaContent;
			mediaContent.css( {
				display: "block",
				margin: 0,
				padding: 0,
				position: "absolute",
				zIndex: -10
			} );

			if ( this.configSettings.filterImagePath !== undefined ) {
				this.renderOverlay();
			}
		},

		/**
		 *  Displays a visual overlay layer if configured.
		 */
		renderOverlay: function () {
			var overlayDiv = $( "<div>" );
			var currentWidth = this.viewportObject.width();
			var currentHeight = this.viewportObject.height();

			overlayDiv.height( currentHeight );
			overlayDiv.width( currentWidth );
			overlayDiv.css( {
				display: "block",
				margin: 0,
				padding: 0,
				position: "absolute",
				zIndex: -5,
				background: "url(" + this.configSettings.filterImagePath + ") repeat-x left bottom"
			} );

			this.mainContainer.append( overlayDiv );
			this.overlayLayer = overlayDiv;
		},

		/**
		 *  Applies new configuration preferences.
		 */
		applySettings: function ( newSettings ) {
			this.configSettings = newSettings;
		}
	};

	/**
	 *  jQuery plugin entry point.
	 */
	$.fn.flexibleDisplay = function ( userPrefs ) {
		var mergedPrefs = $.extend( $.fn.flexibleDisplay.standardPrefs, userPrefs );

		// Identify the element being operated on.
		var currentElement = $( this );

		// Initialize the display manager.
		var displayInstance = new FlexibleDisplayView( mergedPrefs );
		displayInstance.applySettings( mergedPrefs );
		displayInstance.initiate( currentElement );

		return this;
	};

	/**
	 *  Default configuration options for the plugin.
	 *  @property {string} filterImagePath Path to an image for a background filter.
	 */
	$.fn.flexibleDisplay.standardPrefs = {
		filterImagePath: undefined
	};
} )( jQuery );