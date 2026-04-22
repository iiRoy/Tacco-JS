/*
 * enhancedRangeSlider - jQuery Extension
 * edition: 2.1 November 2023
 * @dependencies jQuery v1.8 or later
 *
 * Demonstrations available at https://newdomain.com/enhancedRangeSlider
 * Permitted for use and modification under the MIT license.
 * https://www.opensource.org/licenses/mit-license.php
 *
 */
( function ( $ ) {
	$.fn.enhancedRangeSlider = function ( widgetOptions ) {

		// Default configuration values for the slider
		const defaultSettings = {
			animationDuration: 500, // Speed of the progress bar animation
			minimumValue: 0.1,    // Smallest allowed value for the slider
			maximumValue: 10.0   // Largest allowed value for the slider
		};

		// Merge user-provided options with default settings
		let currentConfiguration = $.extend( defaultSettings, widgetOptions );

		return this.each( function () {

			// Initialize local variables for the current instance
			const instanceConfig = currentConfiguration;
			let isBeingDragged = false;
			let currentFillLevel = 0;
			const targetElement = this;

			$( targetElement ).addClass( 'customSliderInput' ); // Add a specific class to the original input
			const containingParent = $( targetElement ).parent();
			const associatedLabel = $( containingParent ).find( 'label' );

			// Reconstruct the HTML structure to embed the slider elements
			containingParent.html(
				"<label>" + $( associatedLabel ).html() + "</label>" +
				"<span class=\"sliderComponentWrapper\">" +
					"<span class=\"sliderProgressBar\" style=\"width:" + $( targetElement ).val() * 10 + "%\">" +
						"<span class=\"sliderGrabberElement\"></span>" +
					"</span>" +
				"</span>" +
				$( targetElement ).wrap( "<span></span>" ).parent().html()
			);

			const sliderWrapper = containingParent.find( '.sliderComponentWrapper' );
			const progressBar = sliderWrapper.find( '.sliderProgressBar' );
			const grabberControl = progressBar.find( '.sliderGrabberElement' );
			const linkedInput = containingParent.find( 'input' );

			let wrapperDimension = sliderWrapper.outerWidth() + 2; // Add a small buffer
			let grabberDimension = $( grabberControl ).outerWidth();
			let wrapperPosition = $( sliderWrapper ).offset();

			// Function to visually update the progress bar with animation
			const adjustVisualState = ( newFillPercentage ) => {
				$( progressBar ).animate( { width: newFillPercentage + "%" }, instanceConfig.animationDuration );
			};

			// Recalculate offset on window resize events
			$( window ).on( 'resize', function () {
				wrapperPosition = $( sliderWrapper ).offset();
			} );

			// Apply a specific style for older Internet Explorer versions
			if ( retrieveLegacyBrowserVersion() < 9 && retrieveLegacyBrowserVersion() > -1 ) {
				grabberControl.addClass( 'ieOldShadow' );
			}

			// Handle clicks on the main slider track
			$( sliderWrapper ).on( 'click', function ( clickEvent ) {
				clickEvent.preventDefault(); // Prevent default browser actions
				currentFillLevel = constrainValueToRange(
					Math.round( ( ( clickEvent.pageX - wrapperPosition.left + grabberDimension / 2 ) / wrapperDimension ) * 100 )
				);

				adjustVisualState( currentFillLevel );
				$( linkedInput ).val( currentFillLevel / 10 ); // Update the linked input field
			} );

			// Handle mouse down event on the grabber control
			$( grabberControl ).on( 'mousedown', function ( pressEvent ) {
				pressEvent.preventDefault();
				isBeingDragged = true; // Indicate that the grabber is currently active

				$( document ).on( 'mousemove', function ( moveEvent ) {
					moveEvent.preventDefault();
					currentFillLevel = constrainValueToRange(
						Math.round( ( ( moveEvent.pageX - wrapperPosition.left + grabberDimension / 2 ) / wrapperDimension ) * 100 )
					);

					if ( isBeingDragged ) {
						$( progressBar ).css( 'width', currentFillLevel + "%" ); // Directly set width without animation
						$( linkedInput ).val( currentFillLevel / 10 );
					}
				} );

				// Release drag state on mouse up
				$( document ).on( 'mouseup', function () {
					pressEvent.preventDefault();
					isBeingDragged = false;
				} );
			} );

			// Respond to manual changes in the input field
			$( linkedInput ).on( 'change', function () {
				let enteredValue = constrainValueToRange( $( this ).val() * 10 );
				if ( $( this ).val() > instanceConfig.maximumValue )
					$( linkedInput ).val( instanceConfig.maximumValue );
				else if ( $( this ).val() < instanceConfig.minimumValue )
					$( linkedInput ).val( instanceConfig.minimumValue );

				adjustVisualState( enteredValue );
			} );

		} );

		/**
		 * Ensures a given value stays within the defined minimum and maximum limits.
		 * @param {number} rawValue - The value to check.
		 * @returns {number} The constrained value.
		 */
		function constrainValueToRange( rawValue ) {
			if ( rawValue < currentConfiguration.minimumValue * 10 )
				return currentConfiguration.minimumValue * 10;
			else if ( rawValue > currentConfiguration.maximumValue * 10 )
				return currentConfiguration.maximumValue * 10;
			else
				return rawValue;
		}

		/**
		 * Detects and returns the version of Internet Explorer, if applicable.
		 * @returns {number} The IE version or -1 if not IE.
		 */
		function retrieveLegacyBrowserVersion() {
			let browserIdentifier = -1;
			// Check if the application name indicates Internet Explorer
			if ( navigator.appName === 'Microsoft Internet Explorer' ) {
				const userAgentString = navigator.userAgent;
				const ieRegex = new RegExp( "MSIE ([0-9]{1,}[\.0-9]{0,})" );
				// Attempt to extract the version number
				if ( ieRegex.exec( userAgentString ) !== null )
					browserIdentifier = parseFloat( RegExp.$1 );
			}
			return browserIdentifier;
		}
		return this;
	};
} )( jQuery );