/*
 * Parallaxify.js   Version 0.0.2
 * For more info:  http://hwthorn.github.io/parallaxify
 *
 * (c) 2013 Felix Pflaum - All Rights Reserved.
 * Licensed under the MIT license.
 * See: http://hwthorn.mit-license.org
 *
 * Original concept inspired by stellar.js from Mark Dalgleish.
 * Project homepage: http://markdalgleish.com/projects/stellar.js
 *
 * This file is part of the Parallaxify project.
 */
;
( function ( $, window, document, undefined )
{

	// Define the plugin's name and default settings.
	var pluginName = 'parallaxify'
	,	maxFPS = 30 // Maximum frames per second for animations.
	,	defaults =
		{
			positionProperty: 'position' // 'position' or 'transform'
		,	horizontalParallax: true
		,	verticalParallax: true
		,	parallaxBackgrounds: true
		,	parallaxElements: true
		,	responsive: false // Enable or disable responsive behavior.
		,	useMouseMove: true
		,	useGyroscope: true
		,	alphaFilter: 0.9 // Low Pass Filter alpha for smoothing sensor data. 1 = no filter.
		,	motionType: 'natural' // Type of motion calculation: 'linear', 'natural', 'performance', 'gaussian'.
		,	mouseMotionType: 'gaussian'
		,	inputPriority: 'mouse' // 'mouse' or 'gyroscope' - determines which input takes precedence.
		,	motionAngleX: 80 // Max delta angle for X-axis parallax (0 < motionAngle < 90).
		,	motionAngleY: 80 // Max delta angle for Y-axis parallax.
		,	adjustBasePosition: true // Use Low Pass Filter to adjust the base position.
		,	alphaPosition: 0.05 // Alpha for the Low Pass Filter used in base position adjustment.
		}
	;

	// Configuration options for how elements are positioned.
	// Can use standard CSS 'position' (top/left) or CSS 'transform' properties.
	var positionProperty = {
			position: {
				setLeft: function( $element, left ) { $element.css( 'left', left ); }
			,	setTop: function( $element, top ) { $element.css( 'top', top ); }
			}
		,	transform: {
				setPosition: function( $element, left, originalLeft, top, originalTop ) {
					// Using translate3d for hardware acceleration where available.
					$element[0].style[prefixedTransform] = 'translate3d(' + ( left - originalLeft ) + 'px, ' + ( top - originalTop ) + 'px, 0)';
				}
			}
		}
	;

	// Helper function: Approximation of Gaussian Cumulative Distribution Function.
	// Parameter 'a' influences the standard deviation (sigma).
	var gCDFApprox = function( x, a )
		{
			return 1 / ( 1 + Math.exp( -( 0.07056 * a * ( x ^ 3 ) ) - ( 1.5976 * a * x ) ) );
		}
	;

	// Implementation of a Low-Pass Filter for smoothing motion sensor data.
	// For more details, see: http://en.wikipedia.org/wiki/Low-pass_filter
	var lowPassFilter = function( curSignal, prevSignal, alpha )
		{
			if ( prevSignal === null ) { return curSignal; }
			if ( typeof alpha === "undefined" ) { alpha = 0.5; }
			return ( alpha * curSignal ) + ( ( 1 - alpha ) * prevSignal );
		}
	;


	// Cache for pre-calculated factors to optimize motion type calculations.
	var factorCache = []
	;


	/*
	 * Definitions for various motion calculation types.
	 * These functions determine how the parallax effect is calculated
	 * based on input delta and maximum delta values.
	 * Options include linear, natural (tangent-based), performance-optimized,
	 * and gaussian (cumulative distribution function based).
	 */
	var motionType =
		{
			linear: function( delta, deltaMax )
			{
				if ( delta <= -deltaMax ) { return 1; }
				if ( delta >= deltaMax ) { return -1; }
				return -delta / deltaMax;
			}
		,	natural: function( delta, deltaMax )
			{
				if ( delta <= -deltaMax ) { return 1; }
				if ( delta >= deltaMax ) { return -1; }
				if ( factorCache['n'+deltaMax] === undefined )
				{
					factorCache['n'+deltaMax] = Math.tan( deltaMax * 0.01745 );
				}
				return -Math.tan( delta * 0.01745 ) / factorCache['n'+deltaMax];
			}
		,	performance: function( delta, deltaMax )
			{
				if ( delta <= -deltaMax ) { return 1; }
				if ( delta >= deltaMax ) { return -1; }
				if ( factorCache['p'+deltaMax] === undefined )
				{
					factorCache['p'+deltaMax] = ( deltaMax / 90 ) + ( 4.2 * Math.pow( deltaMax / 90, 7 ) );
				}
				return -( ( delta / 90 ) + ( 4.2 * Math.pow( delta / 90, 7 ) ) ) / factorCache['p'+deltaMax];
			}
		,	gaussian: function( delta, deltaMax )
			{
				return 1 - 2 * gCDFApprox( delta / 90, 135 / deltaMax );
			}
		}
	;

	/*
	 * This self-executing function returns a closure that, when called,
	 * will prepend the appropriate vendor prefix to a given CSS property name.
	 * This ensures cross-browser compatibility for experimental or prefixed CSS properties.
	 */
	var vendorPrefix = ( function()
		{
			var prefixes = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/
			,	style = $( 'script' )[0].style
			,	prefix = ''
			,	prop
			;

			for ( prop in style )
			{
				if ( prefixes.test( prop ) )
				{
					prefix = prop.match( prefixes )[0];
					break;
				}
			}

			// Special cases for older browsers or inconsistent naming.
			if ( 'WebkitOpacity' in style ) { prefix = 'Webkit'; }
			if ( 'KhtmlOpacity' in style ) { prefix = 'Khtml'; }

			return function( property )
			{
				return prefix + ( prefix.length > 0 ? property.charAt( 0 ).toUpperCase() + property.slice( 1 ) : property );
			};
		}() )
	;

	// The vendor-prefixed 'transform' property name.
	var prefixedTransform = vendorPrefix( 'transform' )
	;

	// Detect if the browser supports 'background-position-x' and 'background-position-y'.
	var supportsBackgroundPositionXY = $( '<div />', { style: 'background:#fff' } ).css( 'background-position-x' ) !== undefined
	;

	/*
	 * Function to set background position, using individual x/y properties
	 * if supported, otherwise falling back to the shorthand 'background-position'.
	 */
	var setBackgroundPosition = ( supportsBackgroundPositionXY
		? function( $element, x, y )
			{
				$element.css( {
					'background-position-x': x
				,	'background-position-y': y
				} );
			}
		: function( $element, x, y )
			{
				$element.css( 'background-position', x + ' ' + y );
			}
		)
	;

	/*
	 * Function to retrieve background position, parsing x/y individually
	 * if supported, or splitting the shorthand property.
	 */
	var getBackgroundPosition = ( supportsBackgroundPositionXY
		? function( $element )
			{
				return [
					$element.css( 'background-position-x' )
				,	$element.css( 'background-position-y' )
				];
			}
		: function( $element )
			{
				return $element.css( 'background-position' ).split( ' ' );
			}
		)
	;

	// Polyfill for requestAnimationFrame, optimizing animations for browser performance.
	// If native requestAnimationFrame is not available, falls back to a setTimeout-based loop.
	var requestAnimationFrame = (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( callback )
		{
			setTimeout( callback, 1000 / maxFPS ); // Fallback: default to maxFPS.
		}
	)
	;

	// The actual plugin constructor function.
	function Plugin( element, options )
	{
		this.element = element;
		this.options = $.extend( {}, defaults, options );

		this._defaults = defaults;
		this._name = pluginName;

		// Initialize the plugin instance.
		this.init();
	}

	// Extend the Plugin prototype with methods.
	Plugin.prototype = {
		init: function()
		{
			// Assign a unique name to this plugin instance.
			this.options.name = pluginName + '_' + Math.floor( Math.random() * 1e9 );
			this.tilt = {
				beta : 0
			,	gamma : 0
			};

			// Setup various components of the plugin.
			this._defineElements();
			this._defineGetters();
			this._defineSetters();
			this._detectMobile();
			this._detectMotionType();
			this._detectViewport();
			this._handleWindowLoadAndResize();

			// Perform initial refresh, indicating it's the first load.
			this.refresh( { firstLoad: true } );

			// Begin the animation loop.
			this._startAnimation();
		}
	,
		_defineElements: function()
		{
			// Determine the main element for parallax effects.
			this.$element = ( this.element === document.body || this.element === window ? $( 'body' ) : $( this.element ) );
			// The viewport element is typically the window.
			this.$viewportElement = $( window );
		}
	,
		_defineGetters: function()
		{
			// These getters process sensor and mouse move data.
			// The return value is normalized to be between -1 and +1.

			var self = this
			,	motionTypeAdapter = motionType[self.options.motionType]
			,	mouseMoveAdapter = motionType[self.options.mouseMotionType]
			;

			this._getMoveHorizontal = function()
			{
				// Handle mouse move input for horizontal parallax.
				if ( this.useMouseMove && this.clientX !== null && this.clientX !== this.oldClientX )
				{
					return mouseMoveAdapter( this.options.motionAngleX * ( 1 - ( 2 * this.clientX / this.viewportWidth ) ), this.options.motionAngleX );
				}

				// Handle sensor (gyroscope) input for horizontal parallax.
				if ( this.useSensor && this.beta !== null && this.gamma !== null )
				{
					var tilt = this.tilt;

					if ( this.viewportLandscape )
					{
						if ( this.viewportFlipped )
						{
							return motionTypeAdapter( -tilt.beta, this.options.motionAngleX ); // Landscape, flipped.
						}
						else
						{
							return motionTypeAdapter( tilt.beta, this.options.motionAngleX ); // Landscape, regular.
						}
					}
					else
					{
						if ( this.viewportFlipped )
						{
							return motionTypeAdapter( -tilt.gamma, this.options.motionAngleX ); // Portrait, flipped.
						}
						else
						{
							return motionTypeAdapter( tilt.gamma, this.options.motionAngleX ); // Portrait, regular.
						}
					}
				}
				else
				{
					// If sensor is not in use or data is invalid, disable sensor.
					this.useSensor = false;
				}

				// Fallback to old mouse position if current mouse position is not available or unchanged.
				return mouseMoveAdapter( this.options.motionAngleX * ( 1 - ( 2 * this.oldClientX / this.viewportWidth ) ), this.options.motionAngleX );
			};


			this._getMoveVertical = function()
			{
				// Handle mouse move input for vertical parallax.
				if ( this.options.useMouseMove && this.clientY !== null && this.clientY !== this.oldClientY )
				{
					return mouseMoveAdapter( this.options.motionAngleY * ( 1 - ( 2 * this.clientY / this.viewportHeight ) ), this.options.motionAngleY );
				}

				// Handle sensor (gyroscope) input for vertical parallax.
				if ( this.useSensor && this.beta !== null && this.gamma !== null )
				{
					var tilt = this.tilt;

					if ( this.viewportLandscape )
					{
						if ( this.viewportFlipped )
						{
							return motionTypeAdapter( -tilt.gamma, this.options.motionAngleY ); // Landscape, flipped.
						}
						else
						{
							return motionTypeAdapter( tilt.gamma, this.options.motionAngleY ); // Landscape, regular.
						}
					}
					else
					{
						if ( this.viewportFlipped )
						{
							return motionTypeAdapter( -tilt.beta, this.options.motionAngleY ); // Portrait, flipped.
						}
						else
						{
							return motionTypeAdapter( tilt.beta, this.options.motionAngleY ); // Portrait, regular.
						}
					}
				}
				else
				{
					// If sensor is not in use or data is invalid, disable sensor.
					this.useSensor = false;
				}

				// Fallback to old mouse position if current mouse position is not available or unchanged.
				return mouseMoveAdapter( this.options.motionAngleY * ( 1 - ( 2 * this.oldClientY / this.viewportHeight ) ), this.options.motionAngleY );
			};

		}
	,
		_defineSetters: function()
		{
			// Define setters for element positioning.

			var self = this
			,	positionPropertyAdapter = positionProperty[self.options.positionProperty]
			;

			// Assign the appropriate position setting function.
			// Prioritize `setPosition` if available, otherwise fall back to `setLeft` and `setTop`.
			this._setPosition = positionPropertyAdapter.setPosition ||
				function( $element, left, originalLeft, top, originalTop )
				{
					if ( self.options.horizontalParallax )
					{
						positionPropertyAdapter.setLeft( $element, left, originalLeft );
					}
					if ( self.options.verticalParallax )
					{
						positionPropertyAdapter.setTop( $element, top, originalTop );
					}
				};

		}
	,
		refresh: function( options )
		{
			// Reset elements unless it's the very first load.
			if ( !options || !options.firstLoad )
			{
				this._reset();
			}

			// Discover and process parallax elements and backgrounds.
			this._findElements();
			this._findBackgrounds();

			// WebKit background rendering bug workaround:
			// Briefly scroll the body to force a repaint on initial load.
			if ( options && options.firstLoad && /WebKit/.test( navigator.userAgent ) )
			{
				$( window ).load( function()
				{
					var $el = $( 'body' )
					,	oldLeft = $el.scrollLeft()
					,	oldTop = $el.scrollTop()
					;

					$el.scrollLeft( oldLeft + 1 );
					$el.scrollTop( oldTop + 1 );

					$el.scrollLeft( oldLeft );
					$el.scrollTop( oldTop );
				} );
			}
		}
	,
		_detectViewport: function()
		{
			// Update viewport dimensions.
			this.viewportWidth = this.$viewportElement.width();
			this.viewportHeight = this.$viewportElement.height();

			// If sensors are in use, detect viewport orientation and whether it's flipped.
			if ( this.useSensor )
			{
				this.viewportFlipped = ( window.orientation === 180 );
				this.viewportLandscape = ( Math.abs( window.orientation ) === 90 );
			}
		}
	,
		_detectMobile: function()
		{
			// Utilize a comprehensive regex to detect mobile browsers.
			// Source: http://detectmobilebrowser.com/mobile
			var browser = navigator.userAgent || navigator.vendor || window.opera;
			this.isMobile = (
				/(bb\d+|meego).+mobile|android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|playbook|plucker|pocket|psp|series(4|6)0|silk|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test( browser ) ||
				/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test( browser.substr( 0, 4 ) )
			);
		}
	,
		_detectMotionType: function()
		{
			// Initialize all motion input flags to false.
			this.useSensor = false;
			this.useSensorWebkit = false;
			this.useSensorMoz = false;
			this.useMouseMove = false;

			// Check for gyroscope support if enabled and device is mobile or gyroscope has priority.
			if ( this.options.useGyroscope && ( this.isMobile || this.options.inputPriority === 'gyroscope' ) )
			{
				// Webkit browsers utilize the DeviceOrientationEvent.
				this.useSensorWebkit = window.DeviceOrientationEvent !== undefined;
				// Mozilla browsers might use the MozOrientation event.
				this.useSensorMoz = window.OrientationEvent !== undefined;
				// Overall sensor usage is true if either Webkit or Mozilla sensor events are supported.
				this.useSensor = this.useSensorWebkit || this.useSensorMoz;
			}

			// Check for mouse move support if enabled and device is not mobile.
			if ( this.options.useMouseMove && !this.isMobile )
			{
				this.useMouseMove = this.$viewportElement.mousemove !== undefined;
			}
		}
	,
		_findElements: function()
		{
			var self = this;

			// Clear previous active states for elements.
			if ( this.elements !== undefined )
			{
				for ( var i = this.elements.length - 1; i >= 0; i-- )
				{
					this.elements[i].$element.data( 'parallaxify-ElementIsActive', undefined );
				}
			}

			// Reset the elements array.
			this.elements = [];

			// If parallax elements are disabled, exit.
			if ( !this.options.parallaxElements ) { return; }

			// Find all elements with parallax data attributes.
			this.$element.find( '[data-parallaxify-range],[data-parallaxify-range-x],[data-parallaxify-range-y]' ).each( function( i )
			{
				var $this = $( this );

				// Ensure each element is processed only once.
				if ( !$this.data( 'parallaxify-ElementIsActive' ) )
				{
					$this.data( 'parallaxify-ElementIsActive', this );
				}
				else if ( $this.data( 'parallaxify-ElementIsActive' ) !== this )
				{
					return; // Already processed this element.
				}

				// Store and potentially restore original CSS positions.
				if ( !$this.data( 'parralaxify-originalLeft' ) )
				{
					$this.data( 'parallaxify-originalLeft', $this.css( 'left' ) );
					$this.data( 'parallaxify-originalTop', $this.css( 'top' ) );
				}
				else
				{
					$this.css( 'left', $this.data( 'parallaxify-originalLeft' ) );
					$this.css( 'top', $this.data( 'parallaxify-originalTop' ) );
				}

				// Add the element to the collection with its parallax properties.
				self.elements.push( {
					$element: $this
				,	originalPositionLeft: $this.position().left
				,	originalPositionTop: $this.position().top
				,	parallaxDistanceX: ( $this.data( 'parallaxify-range-x' ) !== undefined ? $this.data( 'parallaxify-range-x' ) : ( $this.data( 'parallaxify-range' ) !== undefined ? $this.data( 'parallaxify-range' ) : 0 ) )
				,	parallaxDistanceY: ( $this.data( 'parallaxify-range-y' ) !== undefined ? $this.data( 'parallaxify-range-y' ) : ( $this.data( 'parallaxify-range' ) !== undefined ? $this.data( 'parallaxify-range' ) : 0 ) )
				,	width: $this.outerWidth( true )
				,	height: $this.outerHeight( true )
				} );
			} );
		}
	,
		_findBackgrounds: function()
		{
			var self = this
			,	$backgroundElements
			;

			this.backgrounds = [];

			// If parallax backgrounds are disabled, exit.
			if ( !this.options.parallaxBackgrounds ) { return; }

			// Find elements with parallax background data attributes.
			$backgroundElements = this.$element.find( '[data-parallaxify-background-range],[data-parallaxify-background-range-x],[data-parallaxify-background-range-y]' );

			// Include the main element itself if it has background parallax data.
			if ( this.$element.data( 'parallaxify-background-range' ) || this.$element.data( 'parallaxify-background-range-x' ) || this.$element.data( 'parallaxify-background-range-y' ) )
			{
				$backgroundElements = $backgroundElements.add( this.$element );
			}

			$backgroundElements.each( function()
			{
				var $this = $( this )
				,	backgroundPosition = getBackgroundPosition( $this )
				;

				// Ensure each background element is processed only once.
				if ( !$this.data( 'parallaxify-backgroundIsActive' ) )
				{
					$this.data( 'parallaxify-backgroundIsActive', this );
				}
				else if ( $this.data( 'parallaxify-backgroundIsActive' ) !== this )
				{
					return; // This background element has already been processed.
				}

				// Store and potentially restore original background positions.
				if ( !$this.data( 'parralaxify-backgroundOriginalLeft' ) )
				{
					$this.data( 'parallaxify-backgroundOriginalLeft', backgroundPosition[0] );
					$this.data( 'parallaxify-backgroundOriginalTop', backgroundPosition[1] );
				}
				else
				{
					setBackgroundPosition( $this, $this.data( 'parallaxify-backgroundOriginalLeft' ), $this.data( 'parallaxify-backgroundOriginalTop' ) );
				}

				// Add the background element to the collection with its parallax properties.
				self.backgrounds.push( {
					$element: $this
				,	originalValueLeft: backgroundPosition[0]
				,	originalValueTop: backgroundPosition[1]
				,	originalBackgroundPositionLeft: ( isNaN( parseInt( backgroundPosition[0], 10 ) ) ? 0 : parseInt( backgroundPosition[0], 10 ) )
				,	originalBackgroundPositionTop: ( isNaN( parseInt( backgroundPosition[1], 10 ) ) ? 0 : parseInt( backgroundPosition[1], 10 ) )
				,	originalPositionLeft: $this.position().left
				,	originalPositionTop: $this.position().top
				,	parallaxDistanceX: ( $this.data( 'parallaxify-background-range-x' ) !== undefined ? $this.data( 'parallaxify-background-range-x' ) : ( $this.data( 'parallaxify-background-range' ) !== undefined ? $this.data( 'parallaxify-background-range' ) : 0 ) )
				,	parallaxDistanceY: ( $this.data( 'parallaxify-background-range-y' ) !== undefined ? $this.data( 'parallaxify-background-range-y' ) : ( $this.data( 'parallaxify-background-range' ) !== undefined ? $this.data( 'parallaxify-background-range' ) : 0 ) )
				} );
			} );
		}
	,
		_reset: function()
		{
			var element
			,	originalPositionLeft
			,	originalPositionTop
			,	background
			,	i
			;

			// Reset all parallax elements to their original positions and clear data.
			for ( i = this.elements.length - 1; i >= 0; i-- )
			{
				element = this.elements[i];
				originalPositionLeft = element.$element.data( 'parallaxify-originalLeft' );
				originalPositionTop = element.$element.data( 'parallaxify-originalTop' );

				this._setPosition( element.$element, originalPositionLeft, originalPositionLeft, originalPositionTop, originalPositionTop );

				element.$element
					.data( 'parallaxify-originalLeft', null )
					.data( 'parallaxify-originalLeft', null ) // This seems like a duplicate, but keeping it as per Type I.
					.data( 'parallaxify-elementIsActive', null )
					.data( 'parallaxify-backgroundIsActive', null );
			}

			// Reset all parallax backgrounds to their original positions and clear data.
			for ( i = this.backgrounds.length - 1; i >= 0; i-- )
			{
				background = this.backgrounds[i];

				background.$element
					.data( 'parallaxify-backgroundOriginalLeft', null )
					.data( 'parallaxify-backgroundOriginalTop', null )
					.data( 'parallaxify-backgroundIsActive', null );

				setBackgroundPosition( background.$element, background.originalValueLeft, background.originalValueTop );
			}
		}
	,
		destroy: function()
		{
			// Reset all elements to their initial state.
			this._reset();

			// Unbind all event listeners registered by this plugin instance.
			if ( this.useMouseMove )
			{
				this.$viewportElement.unbind( 'mousemove.' + this.name );
			}
			if ( this.useSensorWebkit )
			{
				window.removeEventListener( 'deviceorientation', this._handleSensorWebkit, false );
			}
			if ( this.useSensorMoz )
			{
				window.removeEventListener( 'MozOrientation', this._handleSensorMoz, false );
			}

			// Unbind window-level events.
			$( window )
				.unbind( 'load.' + this.name )
				.unbind( 'resize.' + this.name )
				.unbind( 'orientationchange.' + this.name );
		}
	,
		_processSensorData: function()
		{
			// If sensors are not in use, there's nothing to process.
			if ( !this.useSensor ) { return; }

			/*
			 * Sensor data interpretation:
			 * - beta: Device pitch (up/down movement), values range from -90 to 90 degrees.
			 * - gamma: Device roll (left/right movement), values range from -180 to 180 degrees.
			 */

			var beta = this.beta
			,	gamma = this.gamma
			,	deltaBeta = 0
			,	deltaGamma = 0
			;

			// Apply corrections for specific Android sensor reporting bugs
			// where values might incorrectly jump to 270 degrees upon device flip.
			if ( beta > 90 ) { beta = beta - 180; }
			if ( gamma > 180 ) { gamma = gamma - 360; }

			// Initialize initialBeta and disable mouse move if gyroscope has priority.
			if ( this.initialBeta === undefined && beta !== null )
			{
				this.initialBeta = beta;
				if ( this.useSensor && this.options.inputPriority === 'gyroscope' )
				{
					this.useMouseMove = false;
					if ( this.useMouseMove ) // Check again, in case it was false already.
					{
						this.$viewportElement.unbind( 'mousemove.' + this.name );
					}
				}
			}

			// Initialize initialGamma and disable mouse move if gyroscope has priority.
			if ( this.initialGamma === undefined && gamma !== null )
			{
				this.initialGamma = gamma;
				if ( this.useSensor && this.options.inputPriority === 'gyroscope' )
				{
					this.useMouseMove = false;
					if ( this.useMouseMove ) // Check again, in case it was false already.
					{
						this.$viewportElement.unbind( 'mousemove.' + this.name );
					}
				}
			}

			// Adjust base position if enabled and initial sensor data is available.
			if ( this.options.adjustBasePosition && this.initialGamma !== undefined && this.initialBeta !== undefined )
			{
				// Smoothly adjust the initial beta and gamma values using a Low-Pass Filter.
				this.initialBeta = lowPassFilter( beta, this.initialBeta, this.options.alphaPosition );
				this.initialGamma = lowPassFilter( gamma, this.initialGamma, this.options.alphaPosition );
			}

			// Calculate filtered beta and gamma relative to the adjusted initial position.
			this.tilt.beta = lowPassFilter( beta - this.initialBeta, this.tilt.beta, this.options.alphaFilter );
			this.tilt.gamma = lowPassFilter( gamma - this.initialGamma, this.tilt.gamma, this.options.alphaFilter );
		}
	,
		_handleWindowLoadAndResize: function()
		{
			var self = this;

			// Re-detect viewport and refresh elements on window resize or orientation change.
			$( window )
				.bind( 'load.' + this.options.name, function()
				{
					self._detectViewport();
					self.refresh();
				} )
				.bind( 'resize.' + this.options.name, function()
				{
					self._detectViewport();
					self.refresh();
				} )
				.bind( 'orientationchange.' + this.options.name, function()
				{
					self._detectViewport();
					self.refresh();
				} );
		}
	,
		_startAnimation: function()
		{
			var self = this
			,	loop = function()
				{
					requestAnimationFrame( loop );
					self._render();
				}
			;

			// Set up event listeners for motion input.
			if ( this.useMouseMove )
			{
				this.$viewportElement.bind( 'mousemove.' + this.options.name, function( event )
				{
					// Store current mouse coordinates.
					self.oldClientX = self.clientX;
					self.oldClientY = self.clientY;
					self.clientX = event.clientX;
					self.clientY = event.clientY;
				} );
			}

			if ( this.useSensorWebkit )
			{
				window.addEventListener( 'deviceorientation', function( event )
				{
					self.beta = event.beta;
					self.gamma = event.gamma;
				}, false );
			}
			else if ( this.useSensorMoz )
			{
				window.addEventListener( 'MozOrientation', function( event )
				{
					self.beta = event.x * 90; // Normalize to -90 to 90 range.
					self.gamma = event.y * -90; // Normalize to -90 to 90 range and invert for consistency.
				}, false );
			}

			// Start the main animation loop.
			loop();
		}
	,
		_render: function()
		{
			var horizontalOffset
			,	verticalOffset
			,	element
			,	background
			,	i
			;

			this._processSensorData(); // Update sensor readings.

			// Calculate overall horizontal and vertical parallax offsets.
			horizontalOffset = this._getMoveHorizontal();
			verticalOffset = this._getMoveVertical();

			// Apply parallax to elements.
			for ( i = this.elements.length - 1; i >= 0; i-- )
			{
				element = this.elements[i];

				this._setPosition(
					element.$element
				,	element.originalPositionLeft + ( element.parallaxDistanceX * horizontalOffset )
				,	element.originalPositionLeft
				,	element.originalPositionTop + ( element.parallaxDistanceY * verticalOffset )
				,	element.originalPositionTop
				);
			}

			// Apply parallax to backgrounds.
			for ( i = this.backgrounds.length - 1; i >= 0; i-- )
			{
				background = this.backgrounds[i];

				setBackgroundPosition(
					background.$element
				,	background.originalBackgroundPositionLeft + ( background.parallaxDistanceX * horizontalOffset ) + 'px'
				,	background.originalBackgroundPositionTop + ( background.parallaxDistanceY * verticalOffset ) + 'px'
				);
			}
		}
	};

	// jQuery plugin integration.
	$.fn[pluginName] = function( options )
	{
		return this.each( function()
		{
			// Prevent multiple instantiations.
			if ( !$.data( this, 'plugin_' + pluginName ) )
			{
				$.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
			}
		} );
	};

} )( jQuery, window, document );