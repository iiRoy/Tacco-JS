/*************************************************************************************************
 * jQuery Plugin: replaceDropdown
 *
 * This plugin transforms standard HTML <select> elements into stylized dropdown lists.
 * It replaces the native dropdown with a custom-built structure using <div>, <a>, and <ul> elements,
 * allowing for greater control over styling via CSS.
 *
 * Author: Michael Behnke
 * GitHub: https://github.com/LocalPCGuy
 * Version: 0.2.1 (minor internal updates)
 *
 * Parameters:
 *   - method: String representing a specific method to call (e.g., 'init'), or an options object.
 *
 * Default Configuration Options:
 *   - divIDtext:    Suffix for the ID of the generated dropdown container div.
 *   - linkIDtext:   Suffix for the ID of the clickable link within the dropdown.
 *   - linkText:     Default text for the dropdown link; if empty, uses the first option's text.
 *   - parent:       Selector for a parent element required for 'flipTop' functionality.
 *   - flipTop:      Boolean; if true, the dropdown list opens upwards if insufficient space below.
 *   - ddClass:      CSS class applied to the main dropdown container.
 *   - hideFirst:    Boolean; if true, the first <option> element from the original <select> is hidden.
 *
 * Basic Usage Examples:
 *   - Initialize with default settings:     $("select").replaceDropdown();
 *   - Initialize with custom class:         $("select").replaceDropdown({ ddClass: "custom-dropdown-style"});
 *
 * Future Enhancements (To-Do List):
 *   1. Migrate from ID-based selectors to more flexible class-based targeting for generated elements.
 *   2. Optimize element lookups by caching references within closures.
 *   3. Implement an auto-close timer option for dropdowns.
 *   4. Conduct a thorough refactoring pass for code size reduction and performance improvements.
 *   5. Adapt to a more modern jQuery plugin boilerplate structure.
 *************************************************************************************************/
( function ( $ ) {

	$.fn.replaceDropdown = function ( method ) {

		// Define available public methods
		var methods = {

			// The 'init' method handles plugin initialization and setup
			init: function ( options ) {
				var self = this;

				// Extend default settings with user-provided options.
				// This merges an empty object, defaults, and user options to prevent direct modification of defaults.
				self.replaceDropdown.settings = $.extend( {}, self.replaceDropdown.defaults, options );

				// Iterate over each DOM element selected by the jQuery object.
				return self.each( function () {

					// Cache references to the current element and its properties for efficiency.
					var $element = $( this ),                  // jQuery wrapped version of the current DOM element
						element = this,                     // The raw DOM element
						elementID = this.id,                // The ID attribute of the original select element
						divID = elementID + self.replaceDropdown.settings.divIDtext, // ID for the new dropdown wrapper div
						ddTimer,                            // Variable to hold a timer (for future auto-close functionality)
						$openDiv = $( "#" + divID );       // Cached jQuery object for the dropdown container

					// Set the link text: use user-defined text, or the text of the first option if none specified.
					self.replaceDropdown.settings.linkText = self.replaceDropdown.settings.linkText || $element.find( "option" ).eq( 0 ).text();

					// Build the custom dropdown structure and retrieve its div ID.
					divID = helpers.buildDropdown( $element, element, self );

					// Hide the original <select> element by positioning it off-screen.
					$element.css( { position: "absolute", left: "-99999px" } );

					// Initialize event listeners for the newly created dropdown.
					helpers.initEvents( divID, self );

				} ); // End of each() iteration

			} // End of init method

		}; // End of methods object

		/*
		 * Private Helper Functions
		 * These functions are not directly exposed but are used internally by the plugin.
		 */
		var helpers = {

			// Sets up the primary event handlers for the dropdown
			initEvents: function ( divID, self ) {
				helpers.setEventsForDropdown( divID, self );        // Event for opening/closing the dropdown
				helpers.assignDropdownLinkEvents( self );           // Events for individual list item clicks
				helpers.closeDropdown( divID );                     // Ensure dropdown is initially closed
			},

			// Constructs the HTML for the custom dropdown list
			buildDropdown: function ( $element, element, self ) {

				// Local variables for building the dropdown's structure
				var i,
					divID = element.id + self.replaceDropdown.settings.divIDtext,
					linkID = element.id + self.replaceDropdown.settings.linkIDtext,
					$prodOptions = $element.find( "option" );

				// Start building the HTML string for the dropdown container and its initial link
				var prodList = '<div id="' + divID + '" class="' + self.replaceDropdown.settings.ddClass + '">\n' +
							   '<a href="#" id="' + linkID + '">' + self.replaceDropdown.settings.linkText + '</a>\n' +
							   '<ul>\n';

				// Loop through each option in the original select element to create list items
				for ( i = 0; i < $prodOptions.length; i++ ) {

					// If 'hideFirst' is true and it's the first option, remove it and skip to the next.
					if ( self.replaceDropdown.settings.hideFirst && i === 0 ) {
						$prodOptions.eq( i ).remove();
						continue; // Move to the next iteration
					}

					// Append a list item for the current option.
					// The 'href' and 'rel' attributes are set to the option's text and value respectively.
					prodList += '<li><a href="' + $prodOptions.eq( i ).text() + '" rel="' + $prodOptions.eq( i ).val() + '">' + $prodOptions.eq( i ).text() + '</a></li>\n';
				}

				// Close the unordered list and the main dropdown div.
				prodList += '</ul>\n</div>\n';

				// Remove any existing button that might have been next to the select (e.g., from other plugins).
				$element.next( "button" ).remove();

				// Insert the newly constructed dropdown HTML immediately after the original select element.
				$element.after( prodList );

				return divID; // Return the ID of the new dropdown div

			}, // End of buildDropdown method

			// Attaches click events to the main dropdown toggle
			setEventsForDropdown: function ( divID, self ) {

				var $openDiv = $( "#" + divID ); // Get the jQuery object for the dropdown div

				// Unbind any previous click handlers and attach a new one.
				$openDiv.unbind().click( function ( e ) {

					e.preventDefault();     // Prevent default link behavior
					e.stopPropagation();    // Stop event propagation to parent elements

					var theID = $openDiv.attr( "id" );

					// Close any other currently open dropdowns, excluding the current one.
					$( "." + self.replaceDropdown.settings.ddClass + ".open:not('#" + theID + "')" ).each( function () {
						helpers.closeDropdown( this.id ); // Call the helper to close the dropdown
					} );

					// Check if the current dropdown is not already open and not disabled.
					if ( $( this ).hasClass( "open" ) === false && $( this ).hasClass( "disabled" ) === false ) {

						// Calculate scroll position to show the currently selected item.
						var index = $( this ).find( "a.selected" ).parent().index();
						var topOffset = 25 * index; // Assuming each list item has a height of 25px

						// If 'flipTop' setting is enabled, check if dropdown should open upwards.
						if ( self.replaceDropdown.settings.flipTop ) {
							helpers.flipDropdown( this, self );
						}

						var $thisUL = $( this ).find( "ul" );

						$thisUL.scrollTop( topOffset );             // Scroll to the calculated offset
						$thisUL.css( { "visibility": "visible" } ); // Make the list visible
						$thisUL.slideDown( "fast" );                // Animate the list opening
						$( this ).addClass( "open" );               // Add 'open' class to the dropdown container

						// Attach a click handler to the body to close the dropdown when clicking outside.
						$( "body" ).click( function ( e ) {
							$( "body" ).unbind();           // Unbind this specific body click handler after one use
							helpers.closeDropdown( divID ); // Close the current dropdown
						} );

					} else { // If the dropdown is already open or is disabled
						helpers.closeDropdown( divID ); // Close it
						$( "body" ).unbind();           // Unbind the body click handler
					}

				} ); // End of $openDiv click handler

			}, // End of setEventsForDropdown method

			// Binds click events to the individual links within the dropdown list
			assignDropdownLinkEvents: function ( self ) {

				// Attach a click event to all anchor tags within the dropdown list items.
				$( "." + self.replaceDropdown.settings.ddClass + " ul li a" ).bind( "click", function ( e ) {

					e.preventDefault(); // Prevent the default link navigation

					// Determine the ID of the original <select> element based on the dropdown container's ID.
					var selectID = $( this ).parents( "." + self.replaceDropdown.settings.ddClass ).attr( "id" ).replace( self.replaceDropdown.settings.divIDtext, "" );
					var $select = $( "#" + selectID ); // Get the jQuery object for the original select

					// Deselect all options in the original select.
					$select.children( "option" ).attr( "selected", "" );

					// Select the option corresponding to the clicked list item.
					$select.children( "option" ).eq( $( this ).parent().index() ).attr( "selected", "selected" );

					$( "." + self.replaceDropdown.settings.ddClass + " ul" ).slideUp( "fast" ); // Slide up the dropdown list

					// Update the text of the main dropdown link to reflect the selected item.
					$( this ).parents( "." + self.replaceDropdown.settings.ddClass ).find( "#" + selectID + self.replaceDropdown.settings.linkIDtext ).text( $( this ).text() );

					$select.change(); // Trigger the change event on the original select element.

				} ); // End of dropdown link click handler

			}, // End of assignDropdownLinkEvents method

			// Closes a specified dropdown
			closeDropdown: function ( divID ) {

				var $openDiv = $( "#" + divID ); // Get the jQuery object for the dropdown container

				// If the dropdown is currently open, proceed to close it.
				if ( $openDiv.hasClass( "open" ) ) {

					$openDiv.children( "ul" ).css( { "visibility": "hidden" } ); // Hide the unordered list
					$openDiv.removeClass( "open" );                             // Remove the 'open' class
					$openDiv.find( "a" ).blur();                                 // Remove focus from the link

				}

			}, // End of closeDropdown method

			// Checks if the dropdown list should open upwards ('flip')
			flipDropdown: function ( item, self ) {

				$( item ).find( "ul" ).removeClass( "showTop" ); // Ensure 'showTop' class is removed initially

				var offsetTop = $( item ).find( "ul" ).offset().top; // Top offset of the dropdown list
				var tabOffsetTop = $( item ).parents( self.replaceDropdown.settings.parent ).length ? $( item ).parents( self.replaceDropdown.settings.parent ).offset().top : 0; // Top offset of the parent container, if defined
				var ddHeight = $( item ).find( "ul" ).height() * 1 + 6; // Height of the dropdown list, plus a small buffer
				var windowHeight = $( window ).height() * 1; // Current height of the browser window

				// Determine if there's more space above than below, and if the dropdown would exceed window bounds below.
				if ( ( ( windowHeight - offsetTop ) < ddHeight ) && ( ( offsetTop - tabOffsetTop ) > ddHeight ) ) {
					$( item ).find( "ul" ).addClass( "showTop" ); // Add 'showTop' class to open the dropdown upwards.
				}

			} // End of flipDropdown method

		}; // End of helpers object

		// --- Plugin Method Dispatcher ---
		// This block determines which method to execute based on the `method` argument.

		if ( methods[ method ] ) {
			// If a specific method name is provided and exists, call it.
			// `apply` is used to pass arguments as an array, starting from the second argument.
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) );

		} else if ( typeof method === 'object' || !method ) {
			// If an options object is provided or no argument is given (default to init).
			// Call the 'init' method with all provided arguments.
			return methods.init.apply( this, arguments );

		} else {
			// If an unknown method name is passed, trigger an error.
			$.error( 'Method "' + method + '" does not exist in the replaceDropdown plugin!' );
		}

	}; // End of $.fn.replaceDropdown

	// --- Plugin Default Options ---
	// These are the default settings that can be overridden by user-provided options.
	$.fn.replaceDropdown.defaults = {
		divIDtext: "LinkList",      // Suffix for the main dropdown div ID
		linkIDtext: "Link",         // Suffix for the dropdown link ID
		linkText: "",               // Default text for the link (can be overridden or set from first option)
		parent: "",                 // Parent selector (e.g., ".tab-content") - crucial for 'flipTop'
		flipTop: false,             // Whether the dropdown should flip upwards when near bottom of viewport
		ddClass: "ddlist",          // CSS class for the dropdown container
		hideFirst: true             // Whether to hide the first option of the original select element
	};

	// --- Plugin Current Settings ---
	// This object will hold the merged default and user-defined settings after initialization.
	// It's initialized as an empty object.
	$.fn.replaceDropdown.settings = {};

} )( jQuery ); // End of IIFE (Immediately Invoked Function Expression)