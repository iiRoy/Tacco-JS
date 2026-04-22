// This file contains a jQuery plugin for displaying animated text.
// Version: 0.3 Beta.
// Project page: https://github.com/alvarotrigo/funnyText.js
// License: MIT.
// (C) 2013 Alvaro Trigo. All rights reserved.

(function ( $ ) {

	// Define the funnyText jQuery plugin method.
	$.fn.funnyText = function ( options ) {

		// Initialize default settings and merge them with provided options.
		let settings = $.extend(
			{
				// Animation speed in milliseconds.
				'speed'      : 700,
				// Color for the border of the active character.
				'borderColor': 'black',
				// Color for the active character.
				'activeColor': 'white',
				// Default character color.
				'color'      : 'black',
				// Font size for the text elements.
				'fontSize'   : '7em',
				// Movement direction ('both', 'horizontal', 'vertical').
				'direction'  : 'both'
			},
			options
		);

		// Store the current jQuery object for consistent access.
		const thisElement = $( this );

		// Add a class to the element for styling purposes.
		thisElement.addClass( 'funnyText' );

		// Get the original element, prepare its text content.
		var originalElement = $( this );
		var characterArray = $.trim( originalElement.text() ).split( '' );

		// Arrays for possible Y and X positions.
		var yPositions = [ 'top', 'bottom' ];
		var xPositions = [ 'left', 'right' ];

		// Variables to track character positions during generation.
		var activePositionX, activePositionY, normalPositionX, normalPositionY;
		var lastActivePosition;


		// Clear the original HTML content of the element.
		originalElement.html( '' );

		// Dynamically append necessary CSS styles to the document head.
		const dynamicStyle = $(
			'<style>' +
				thisElement.selector + '.funnyText span.active { color: ' + settings.activeColor + '; text-shadow: -1px 0 ' + settings.borderColor + ', 0 1px ' + settings.borderColor + ', 1px 0 ' + settings.borderColor + ', 0 -1px ' + settings.borderColor + '; } ' +
				thisElement.selector + '.funnyText span { color: ' + settings.color + '; font-size:' + settings.fontSize + '; }' +
			'</style>'
		);

		$( 'html > head' ).append( dynamicStyle );


		// Iterate through each character to create its animated representation.
		for ( let i = 0; i < characterArray.length; i++ )
		{
			normalPositionY = yPositions[ _getRandomNumber( 0, 100 ) % 2 ];
			normalPositionX = xPositions[ _getRandomNumber( 0, 100 ) % 2 ];

			// Replace spaces with non-breaking spaces for proper rendering.
			if ( characterArray[ i ] == ' ' ) {
				characterArray[ i ] = '&nbsp;';
			}

			// Create the visible (normal) character span.
			var visibleCharacter = '<span class="normal  ' + normalPositionY + ' ' + normalPositionX + '">' + characterArray[ i ] + '</span>';

			// Ensure the active character's position is different from the previous one if direction is 'both'.
			do {
				activePositionXY = _getNewPosition( normalPositionX, normalPositionY );
			} while ( activePositionXY == lastActivePosition && settings.direction == 'both' );

			lastActivePosition = activePositionXY;

			// Create the active character span.
			var activeCharacter = '<span class="active ' + activePositionXY + '">' + characterArray[ i ] + '</span>';

			// Wrap both character spans in a container div.
			var characterWrapper = '<div class="charWrap">' + visibleCharacter + activeCharacter + '</div>';
			originalElement.append( characterWrapper );
		};


		// Adjust the size and position of each character wrapper.
		thisElement.find( '.charWrap' ).each( function () {
			let wrapper = $( this );

			var charWidth = wrapper.find( 'span' ).width();
			var charHeight = wrapper.find( 'span' ).height();

			wrapper.css( {
				'width' : charWidth * 2 + 'px',
				'height': charHeight * 2 + 'px'
			} );

			// Set initial margins to correctly position the character wrappers.
			_setMargin( wrapper );

			// Create a "viewport" for each character.
			wrapper.wrap( '<div class="character" style="width:' + charWidth + 'px; height: ' + charHeight + 'px"></div>' );
		} );


		/**
		 * Helper function: Returns a random integer between 'from' and 'to' (inclusive).
		 * @param {number} from - The minimum value.
		 * @param {number} to   - The maximum value.
		 * @returns {number} A random integer.
		 */
		function _getRandomNumber( from, to ) {
			return from + Math.floor( Math.random() * ( to + 1 ) );
		}


		/**
		 * Helper function: Determines a new valid position for the active character.
		 * This ensures movement is possible from the normal character's position.
		 * @param {string} x - The normal character's horizontal position ('left' or 'right').
		 * @param {string} y - The normal character's vertical position ('top' or 'bottom').
		 * @returns {string} A string representing the new position and movement class.
		 */
		function _getNewPosition( x, y ) {
			var calculatedResult;

			// Decide whether to move horizontally or vertically based on 'direction' option.
			if ( ( _getRandomNumber( 0, 100 ) % 2 && settings.direction == 'both' ) || settings.direction == 'horizontal' ) {
				if ( x == "right" && y == "top" ) {
					calculatedResult = "left top moveLeft";
				}
				else if ( x == "right" && y == "bottom" ) {
					calculatedResult = "left bottom moveLeft";
				}
				else if ( x == "left" && y == "top" ) {
					calculatedResult = "right top moveRight";
				}
				else if ( x == "left" && y == "bottom" ) {
					calculatedResult = "right bottom moveRight";
				}
			}
			else { // Move vertically.
				if ( x == "right" && y == "top" ) {
					calculatedResult = "right bottom moveDown";
				}
				else if ( x == "right" && y == "bottom" ) {
					calculatedResult = "right top moveUp";
				}
				else if ( x == "left" && y == "top" ) {
					calculatedResult = "left bottom moveDown";
				}
				else if ( x == "left" && y == "bottom" ) {
					calculatedResult = "left top moveUp";
				}
			}

			return calculatedResult;
		}


		/**
		 * Helper function: Adjusts the margin of a character container based on its content's position.
		 * This prepares the container for the animation effect.
		 * @param {jQuery} obj - The jQuery object representing the character wrapper.
		 * @returns {void}
		 */
		function _setMargin( obj ) {
			if ( obj.find( '.normal' ).hasClass( 'bottom' ) ) {
				obj.css( 'top', '-' + obj.find( '.normal' ).height() + 'px' );
			}

			if ( obj.find( '.normal' ).hasClass( 'right' ) ) {
				obj.css( 'left', '-' + obj.find( '.normal' ).width() + 'px' );
			}
		}


		// Set up an interval for random character movements.
		setInterval( function () {
			var timeToWait = _getRandomNumber( 2, 6 );
			var lastCharacterIndex = '';
			do {
				var currentCharacterIndex = _getRandomNumber( 0, characterArray.length - 1 );
			} while ( currentCharacterIndex === lastCharacterIndex );

			lastCharacterIndex = currentCharacterIndex;

			_setTimer( thisElement.find( '.charWrap' ).eq( currentCharacterIndex ), timeToWait );
		}, 1 * settings.speed );


		/**
		 * Helper function: Sets a timeout to trigger character movement.
		 * @param {jQuery} characterElement - The jQuery object for the character wrapper to move.
		 * @param {number} delayTime        - The delay before moving, multiplied by plugin speed.
		 * @returns {void}
		 */
		function _setTimer( characterElement, delayTime ) {
			setTimeout( function () {
				_moveCharacter( characterElement );
			}, delayTime * settings.speed );
		}

		// Attach hover event handler to character wrappers.
		$( '.charWrap' ).hover( function () {
			if ( ! $( this ).hasClass( 'moved' ) ) {
				_moveCharacter( $( this ) );
			}
		} );


		/**
		 * Helper function: Animates a character's wrapper to create the "moving" effect.
		 * It toggles a 'moved' class to track its state.
		 * @param {jQuery} characterWrap - The jQuery object of the character wrapper.
		 * @returns {void}
		 */
		function _moveCharacter( characterWrap ) {
			const halfHeight = characterWrap.height() / 2;
			const halfWidth = characterWrap.width() / 2;
			const activeCharacter = characterWrap.find( '.active' );

			if ( _supportTransitions() ) {
				// Use CSS transitions if supported.
				if ( activeCharacter.hasClass( 'moveRight' ) ) {
					if ( ! characterWrap.hasClass( 'moved' ) ) {
						characterWrap.css( 'left', '-' + halfWidth + 'px' );
					} else {
						characterWrap.css( 'left', '0px' );
					}
				}
				else if ( activeCharacter.hasClass( 'moveLeft' ) ) {
					if ( ! characterWrap.hasClass( 'moved' ) ) {
						characterWrap.css( 'left', '0px' );
					} else {
						characterWrap.css( 'left', '-' + halfWidth + 'px' );
					}
				}
				else if ( activeCharacter.hasClass( 'moveUp' ) ) {
					if ( ! characterWrap.hasClass( 'moved' ) ) {
						characterWrap.css( 'top', '0px' );
					} else {
						characterWrap.css( 'top', '-' + halfHeight + 'px' );
					}
				}
				else if ( activeCharacter.hasClass( 'moveDown' ) ) {
					if ( ! characterWrap.hasClass( 'moved' ) ) {
						characterWrap.css( 'bottom', halfHeight + 'px' );
					} else {
						characterWrap.css( 'bottom', '0px' );
					}
				}
			}

			// jQuery animate fallback for browsers without CSS transitions.
			else
			{
				if ( activeCharacter.hasClass( 'moveRight' ) ) {
					if ( ! characterWrap.hasClass( 'moved' ) ) {
						characterWrap.animate( {
							'left': '-' + halfWidth + 'px'
						}, 400 );
					} else {
						characterWrap.animate( {
							'left': '0px'
						}, 400 );
					}
				}
				else if ( activeCharacter.hasClass( 'moveLeft' ) ) {
					if ( ! characterWrap.hasClass( 'moved' ) ) {
						characterWrap.animate( {
							'left': '0px'
						}, 400 );
					} else {
						characterWrap.animate( {
							'left': '-' + halfWidth + 'px'
						}, 400 );
					}
				}
				else if ( activeCharacter.hasClass( 'moveUp' ) ) {
					if ( ! characterWrap.hasClass( 'moved' ) ) {
						characterWrap.animate( {
							'top': '0px'
						}, 400 );
					} else {
						characterWrap.animate( {
							'top': '-' + halfHeight + 'px'
						}, 400 );
					}
				}
				else if ( activeCharacter.hasClass( 'moveDown' ) ) {
					if ( ! characterWrap.hasClass( 'moved' ) ) {
						characterWrap.animate( {
							'bottom': halfHeight + 'px'
						}, 400 );
					} else {
						characterWrap.animate( {
							'bottom': '0px'
						}, 400 );
					}
				}
			}

			// Toggle the 'moved' class to indicate the character's state.
			characterWrap.toggleClass( 'moved' );
		}
	};


	/**
	 * Determines if CSS transitions are supported by the browser.
	 * Checks for standard 'transition' property and vendor-prefixed versions.
	 * @returns {boolean} True if transitions are supported, false otherwise.
	 */
	function _supportTransitions() {
		var docBody = document.body || document.documentElement;
		var elementStyle = docBody.style;
		var transitionPropertyName = 'transition';

		// Check for the standard property name.
		if ( typeof elementStyle[ transitionPropertyName ] == 'string' ) {
			return true;
		}

		// Check for vendor-prefixed versions.
		const vendorPrefixes = [ 'Moz', 'Webkit', 'Khtml', 'O', 'ms', 'Icab' ];
		const capitalizedPropertyName = transitionPropertyName.charAt( 0 ).toUpperCase() + transitionPropertyName.substr( 1 );

		for ( let i = 0; i < vendorPrefixes.length; i++ ) {
			if ( typeof elementStyle[ vendorPrefixes[ i ] + capitalizedPropertyName ] == 'string' ) {
				return true;
			}
		}
		return false;
	}

})( jQuery ); // Pass jQuery object to the immediately invoked function.