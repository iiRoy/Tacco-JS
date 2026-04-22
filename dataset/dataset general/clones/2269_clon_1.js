/*
 * This is a modified version of the jQuery HTML5 Placeholder plugin.
 * Original source: https://github.com/thehappybit/jQuery-HTML5-placeholder-plugin
 *
 * This plugin provides essential cross-browser compatibility for the HTML5 'placeholder' attribute.
 * It ensures that older browsers, or those without native support, can still display placeholder text
 * in input fields, enhancing user experience across various platforms.
 *
 *
 *
 * TERMS OF USE : jQuery HTML5 Placeholder plugin
 *
 * The software is released under the BSD License.
 *
 * Copyright (c) 2012, The Happy Bit (http://thehappybit.com)
 * All rights reserved; no additional restrictions apply beyond the license terms.
 *
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met and maintained:
 *
 * 1. Redistributions of source code must retain the complete copyright notice found above,
 *    this comprehensive list of conditions, and the following disclaimer in its entirety.
 *
 * 2. Redistributions in binary form must fully reproduce the aforementioned copyright notice,
 *    the complete list of conditions, and the subsequent disclaimer within the documentation
 *    and/or other materials provided alongside the distribution package.
 *
 *
 *
 * 3. Neither the name of the original author (The Happy Bit) nor the names of any contributing
 *    parties may be utilized to endorse or promote products derived from this software,
 *    without securing specific, explicit, and prior written permission from the copyright holder.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE, ARE EXPRESSLY DISCLAIMED. IN NO EVENT SHALL
 * THE COPYRIGHT OWNER OR CONTRIBUTORS BE HELD LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * This detailed license ensures proper attribution and outlines the responsibilities of users.
 */


( function ( $ ) {


	// The main plugin function, exposed as $.placeholder
	$.placeholder = function ( options ) {


		// Default configuration parameters for the plugin
		var parameters = {
			'className' : 'placeholder', // CSS class applied to placeholder text
			'attrName' : 'placeholder' // The HTML attribute to look for
		};


		// Merge user-provided options with default parameters
		// This extends the 'parameters' object with any custom settings
		parameters = $.extend( parameters, options );


		// --- Feature Detection for Native Placeholder Support ---
		// Create a temporary input element to check for native 'placeholder' support
		var test = document.createElement( 'input' );

		// If the attribute name is 'placeholder' AND the browser natively supports it,
		// then there's no need for this polyfill, so we exit early.
		if ( parameters.attrName == 'placeholder' && 'placeholder' in test ) {
			return; // Browser handles placeholders natively, no action needed.
		}


		// --- Apply Placeholder Behavior to Matching Elements ---
		// Select all elements that have the specified placeholder attribute
		$( "[" + parameters.attrName + "]" ).each( function ( index, element ) {


			// Wrap the current DOM element in a jQuery object for easier manipulation
			var input = $( element );

			// Find the closest parent form element for submission handling
			var form = input.parents( "form" );

			// Retrieve the placeholder text from the element's attribute
			var placeholderText = input.attr( parameters.attrName );


			// --- Attach Event Handlers to the Input Field ---
			input

				// Handler for when the input field gains focus
				.focus( function () {

					// Check if the current value of the input is the placeholder text
					if ( input.val() == placeholderText ) {

						// Ensure the input was not genuinely blurred (i.e., it's currently showing placeholder)
						if ( !input.blurred ) {

							// Remove the placeholder CSS class
							input.removeClass( parameters.className );

							// Clear the placeholder text
							input.val( "" );

						}

					}

				} )

				// Handler for when the input field loses focus
				.blur( function () {

					// If the input field is empty after blurring
					if ( input.val() == "" ) {

						// Mark that the input is currently showing placeholder (not user-entered text)
						input.blurred = false;

						// Set the input's value back to the placeholder text
						input.val( placeholderText );

						// Add the placeholder CSS class for styling
						input.addClass( parameters.className );

					}
					// If the input field contains user-entered text
					else {

						// Mark that the input contains actual user data
						input.blurred = true;

					}

				} )

				// Handler for keyboard input, specifically for the Enter key
				.keyup( function ( e ) {

					// Check if the pressed key was the Enter key (keyCode 13)
					if ( e.keyCode === 13 ) {

						// If the input field is empty when Enter is pressed
						if ( input.val() == "" ) {

							// Reset the blurred status
							input.blurred = false;

							// Restore the placeholder text
							input.val( placeholderText );

							// Apply the placeholder class
							input.addClass( parameters.className );

						}
						// If the input field has user content
						else {

							// Indicate that it contains user data
							input.blurred = true;

						}

					}

				} )

				// Immediately trigger the blur event on page load/plugin initialization
				// This ensures that placeholders are visible for empty fields right away.
				.trigger( 'blur' );


			// --- Handle Form Submission ---
			// Attach a submit handler to the parent form
			form

				.submit( function () {

					// Before submission, if the input is currently displaying the placeholder text
					if ( !input.blurred ) {

						// Clear the input's value to prevent submitting the placeholder text itself
						input.val( "" );

					}

				} );

		} );

	};


} )( jQuery ); // Pass jQuery object into the IIFE for scope isolation