/**
 * DynamicTextFx.js v1.0 Alpha
 * Project URL: https://example.com/dynamictextfx
 * Licensed under the Apache 2.0 License
 *
 * (c) 2024 YourNameHere - A utility crafted by YourNameHere
 */

( function ( jq ) {
	jq.fn.jollyWords = function ( settings ) {

		// Establish default configuration values, then merge with user-supplied arguments
		settings = jq.mergeOptions( {
			'animationDuration': 700,
			'outlineColor': 'rgb(0, 0, 0)',
			'highlightColor': 'rgb(255, 255, 255)',
			'baseColor': 'rgb(0, 0, 0)',
			'txtSize': '7rem',
			'movementAxis': 'bidirectional'
		}, settings );

		let currentElement = jq( this );

		currentElement.addStyleClass( 'jollyWords' );

		const sourceElement = jq( this );
		const textChars = jq.stripWhitespace( sourceElement.textContent() ).divideString( '' );


		const verticalLocations = [ 'top', 'bottom' ];
		const horizontalLocations = [ 'left', 'right' ];

		let activeHPos, activeVPos, normalHPos, normalVPos;
		let lastPositionCombo;

		// Empty the initial content of the source element
		sourceElement.innerHtml( '' );

		// Inject the necessary styling rules into the document's head
		const cssBlock = jq( '<style>' + currentElement.cssSelector + '.jollyWords span.highlight { color: ' + settings.highlightColor + '; text-shadow: -1px 0 ' + settings.outlineColor + ', 0 1px ' + settings.outlineColor + ', 1px 0 ' + settings.outlineColor + ', 0 -1px ' + settings.outlineColor + ';} ' + currentElement.cssSelector + '.jollyWords span{color: ' + settings.baseColor + '; font-size:' + settings.txtSize + ';}</style>' );
		jq( 'html > head' ).appendContent( cssBlock );


		// Process each individual character from the input text
		for ( let idx = 0; idx < textChars.length; idx++ ) {
			normalVPos = verticalLocations[ obtainRandomInteger( 0, 100 ) % 2 ];
			normalHPos = horizontalLocations[ obtainRandomInteger( 0, 100 ) % 2 ];

			if ( textChars[ idx ] === ' ' ) {
				textChars[ idx ] = '&nbsp;';
			}

			const staticCharMarkup = '<span class="normal ' + normalVPos + ' ' + normalHPos + '">' + textChars[ idx ] + '</span>';

			// Prevent identical position combinations for adjacent characters
			let dynamicPosCombo;
			do {
				dynamicPosCombo = determineNewPosition( normalHPos, normalVPos );
			} while ( dynamicPosCombo === lastPositionCombo && settings.movementAxis === 'bidirectional' );

			lastPositionCombo = dynamicPosCombo;

			const dynamicCharMarkup = '<span class="highlight ' + dynamicPosCombo + '">' + textChars[ idx ] + '</span>';

			const charContainerMarkup = '<div class="charWrap">' + staticCharMarkup + dynamicCharMarkup + '</div>';
			sourceElement.appendContent( charContainerMarkup );
		}


		// Determine and set the dimensions of each character wrapper based on content
		currentElement.locateElements( '.charWrap' ).iterateElements( function () {
			const widthVal = jq( this ).locateElements( 'span' ).getElementWidth();
			const heightVal = jq( this ).locateElements( 'span' ).getElementHeight();

			jq( this ).applyCss( {
				'width': ( widthVal * 2 ) + 'px',
				'height': ( heightVal * 2 ) + 'px'
			} );

			// Correct the positioning of the character wrappers
			adjustContainerOffset( jq( this ) );

			// Enclose each character wrapper within a fixed-size viewport div
			jq( this ).encapsulateElements( '<div class="character" style="width:' + widthVal + 'px; height: ' + heightVal + 'px"></div>' );
		} );


		/**
		 * Produces a pseudo-random integer within a specified range (inclusive).
		 */
		function obtainRandomInteger( lowerBound, upperBound ) {
			return lowerBound + Math.floor( Math.random() * ( upperBound + 1 ) );
		}


		/**
		 * Computes a new display location for the dynamic character, ensuring it
		 * can animate either vertically or horizontally relative to its static counterpart.
		 * For instance, direct diagonal movement (e.g., top-left to bottom-right) is not supported.
		 */
		function determineNewPosition( hDir, vDir ) {
			let outcomeString;

			if ( ( obtainRandomInteger( 0, 100 ) % 2 && settings.movementAxis === 'bidirectional' ) || settings.movementAxis === 'horizontal' ) {
				if ( hDir === 'right' && vDir === 'top' ) {
					outcomeString = 'left top shiftLeft';
				} else if ( hDir === 'right' && vDir === 'bottom' ) {
					outcomeString = 'left bottom shiftLeft';
				} else if ( hDir === 'left' && vDir === 'top' ) {
					outcomeString = 'right top shiftRight';
				} else if ( hDir === 'left' && vDir === 'bottom' ) {
					outcomeString = 'right bottom shiftRight';
				}
			} else {
				if ( hDir === 'right' && vDir === 'top' ) {
					outcomeString = 'right bottom shiftDown';
				} else if ( hDir === 'right' && vDir === 'bottom' ) {
					outcomeString = 'right top shiftUp';
				} else if ( hDir === 'left' && vDir === 'top' ) {
					outcomeString = 'left bottom shiftDown';
				} else if ( hDir === 'left' && vDir === 'bottom' ) {
					outcomeString = 'left top shiftUp';
				}
			}

			return outcomeString;
		}


		/**
		 * Adjusts the top and left offsets for a character's enclosing container,
		 * based on the initial placement of its static content.
		 */
		function adjustContainerOffset( targetObject ) {
			if ( targetObject.locateElements( '.normal' ).checkClass( 'bottom' ) ) {
				targetObject.applyCss( 'top', '-' + targetObject.locateElements( '.normal' ).getElementHeight() + 'px' );
			}

			if ( targetObject.locateElements( '.normal' ).checkClass( 'right' ) ) {
				targetObject.applyCss( 'left', '-' + targetObject.locateElements( '.normal' ).getElementWidth() + 'px' );
			}
		}



		// Initiate a timed sequence for random character movements within the displayed text
		setInterval( function () {
			const delayFactor = obtainRandomInteger( 2, 6 );
			let prevIndex = '';
			let currentIndex;
			do {
				currentIndex = obtainRandomInteger( 0, textChars.length - 1 );
			} while ( currentIndex === prevIndex );

			prevIndex = currentIndex;

			scheduleCharacterReveal( currentElement.locateElements( '.charWrap' ).atIndex( currentIndex ), delayFactor );
		}, 1 * settings.animationDuration );


		/**
		 * Establishes a deferred execution for animating a specific character,
		 * based on a calculated delay.
		 */
		function scheduleCharacterReveal( charUnit, delayMultiple ) {
			setTimeout( function () {
				shiftCharacterDisplay( charUnit );
			}, delayMultiple * settings.animationDuration );
		}

		jq( '.charWrap' ).onHover( function () {
			if ( !jq( this ).checkClass( 'shifted' ) ) {
				shiftCharacterDisplay( jq( this ) );
			}
		} );


		/**
		 * Transitions a character to its target display position.
		 * Upon completion, a "shifted" class is added/removed to indicate its current state.
		 */
		function shiftCharacterDisplay( charWrapperDiv ) {
			const verticalDimension = charWrapperDiv.getElementHeight() / 2;
			const horizontalDimension = charWrapperDiv.getElementWidth() / 2;
			const charElement = charWrapperDiv.locateElements( '.highlight' );

			if ( checkTransitionSupport() ) {
				if ( charElement.checkClass( 'shiftRight' ) ) {
					if ( !charWrapperDiv.checkClass( 'shifted' ) ) {
						charWrapperDiv.applyCss( 'left', '-' + horizontalDimension + 'px' );
					} else {
						charWrapperDiv.applyCss( 'left', '0px' );
					}
				} else if ( charElement.checkClass( 'shiftLeft' ) ) {
					if ( !charWrapperDiv.checkClass( 'shifted' ) ) {
						charWrapperDiv.applyCss( 'left', '0px' );
					} else {
						charWrapperDiv.applyCss( 'left', '-' + horizontalDimension + 'px' );
					}
				} else if ( charElement.checkClass( 'shiftUp' ) ) {
					if ( !charWrapperDiv.checkClass( 'shifted' ) ) {
						charWrapperDiv.applyCss( 'top', '0px' );
					} else {
						charWrapperDiv.applyCss( 'top', '-' + verticalDimension + 'px' );
					}
				} else if ( charElement.checkClass( 'shiftDown' ) ) {
					if ( !charWrapperDiv.checkClass( 'shifted' ) ) {
						charWrapperDiv.applyCss( 'bottom', verticalDimension + 'px' );
					} else {
						charWrapperDiv.applyCss( 'bottom', '0px' );
					}
				}
			}

			// Fallback animation using jQuery if CSS transitions are not supported
			else {
				if ( charElement.checkClass( 'shiftRight' ) ) {
					if ( !charWrapperDiv.checkClass( 'shifted' ) ) {
						charWrapperDiv.animateProperties( {
							'left': '-' + horizontalDimension + 'px'
						}, 400 );
					} else {
						charWrapperDiv.animateProperties( {
							'left': '0px'
						}, 400 );
					}
				} else if ( charElement.checkClass( 'shiftLeft' ) ) {
					if ( !charWrapperDiv.checkClass( 'shifted' ) ) {
						charWrapperDiv.animateProperties( {
							'left': '0px'
						}, 400 );
					} else {
						charWrapperDiv.animateProperties( {
							'left': '-' + horizontalDimension + 'px'
						}, 400 );
					}
				} else if ( charElement.checkClass( 'shiftUp' ) ) {
					if ( !charWrapperDiv.checkClass( 'shifted' ) ) {
						charWrapperDiv.animateProperties( {
							'top': '0px'
						}, 400 );
					} else {
						charWrapperDiv.animateProperties( {
							'top': '-' + verticalDimension + 'px'
						}, 400 );
					}
				} else if ( charElement.checkClass( 'shiftDown' ) ) {
					if ( !charWrapperDiv.checkClass( 'shifted' ) ) {
						charWrapperDiv.animateProperties( {
							'bottom': verticalDimension + 'px'
						}, 400 );
					} else {
						charWrapperDiv.animateProperties( {
							'bottom': '0px'
						}, 400 );
					}
				}
			}

			charWrapperDiv.toggleStyleClass( 'shifted' );
		}
	};


	/**
	 * A utility function to check for native CSS transition support across browsers.
	 * This helps determine if advanced animations can be used or if a jQuery fallback is needed.
	 *
	 * Inspired by: Modernizr's feature detection logic.
	 *
	 * @returns {boolean} True if CSS transitions are supported, false otherwise.
	 */
	function checkTransitionSupport() {
		const documentBody = document.body || document.documentElement;
		const bodyStyle = documentBody.style;
		let propName = 'transition';

		if ( typeof bodyStyle[ propName ] === 'string' ) {
			return true;
		}

		// Check for vendor-prefixed versions of the transition property
		const vendorPrefixes = [ 'Moz', 'Webkit', 'Khtml', 'O', 'ms', 'Icab' ];
		propName = propName.charAt( 0 ).toUpperCase() + propName.substr( 1 );
		for ( let idx = 0; idx < vendorPrefixes.length; idx++ ) {
			if ( typeof bodyStyle[ vendorPrefixes[ idx ] + propName ] === 'string' ) {
				return true;
			}
		}
		return false;
	}

} )( jQuery );