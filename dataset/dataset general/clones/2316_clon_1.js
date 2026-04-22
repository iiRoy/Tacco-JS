/*
 * This file implements a jQuery plugin for Collapsible Menus.
 * It facilitates the creation of interactive collapsible menu structures
 * based on nested, unordered lists.
 *
 * Original Copyright (c) 2012 Tom McFarlin, available at http://tommcfarlin.com
 * Licensed under the MIT License.
 * Further details can be found at: http://tommcfarlin.com/collapsible-menus/
 *
 * Current plugin version: 1.1
 * This is a Type I clone, preserving all original functionality and identifiers.
 */

/* Start of the self-executing anonymous function */
(function ($) {

	// Enforce strict mode for better code quality and error handling
	"use strict";

	/*
	 * SECTION: Utility and Helper Functions
	 * This block contains core logic separated into reusable functions.
	 */
	
	/**
	 * menuHandler
	 * Core function responsible for initializing the collapsible menu behavior.
	 * It configures initial states (collapsed/expanded) and attaches click event listeners.
	 *
	 * @param {string} sId - The ID of the root menu element to operate on.
	 * @param {object} opts - An object containing configuration options for the plugin.
	 * @returns {void}
	 */
	function menuHandler(sId, opts) {

		// A crucial step: Select all nested unordered lists within list items
		// that are children of the menu identified by sId.
		// Then, traverse up to their parent <li>, and then to the previous sibling element.
		// This sequence targets the clickable element that precedes a nested menu.
		$('#' + sId + ' li ul')
			.parent('li') // Get the <li> that contains the <ul> (nested menu)
			.prev()       // Get the element *before* that <ul> (the clickable parent link/text)
			.each(function () {
				// Iterate over each found parent element.

				// Conditional collapse based on plugin options.
				// If `initialCollapse` is true, hide the nested menus on page load.
				if (opts.initialCollapse) {
					// Select the next sibling element (which is the actual nested <ul>)
					$(this)
						.next()
						.addClass('collapsed-menu') // Mark it as collapsed
						.hide();                     // Visually hide it

				} else {
					// Otherwise, ensure it is expanded by default.
					$(this)
						.next()
						.addClass('expanded-menu'); // Mark it as expanded
				} // End of initial collapse/expand logic.

				// Attach a click event handler to the current parent element.
				// This handles the toggling of the nested menu's visibility.
				$(this).on('click', function () {
					// Cache the jQuery object for the next sibling (the nested menu <ul>).
					var $menu = $(this).next();

					// Determine the animation effect based on the 'effect' option.
					switch (opts.effect.toString().toLowerCase()) {

						case 'fade':
							// Handle fading in/out for menu collapse/expansion.
							if ($menu.hasClass('expanded-menu')) {
								// If currently expanded, fade it out and then mark it as collapsed.
								$menu.fadeOut('fast', function () {
									// Callback after fadeOut completes.
									$(this)
										.removeClass('expanded-menu') // Remove expanded state
										.addClass('collapsed-menu');  // Add collapsed state
								});

							} else {
								// If currently collapsed, remove collapsed state, add expanded, then fade in.
								$menu
									.removeClass('collapsed-menu')
									.addClass('expanded-menu')
									.fadeIn('fast');
							} // End of fade effect if/else.

							break;

						case 'slide':
							// Handle sliding up/down for menu collapse/expansion.
							if ($menu.hasClass('expanded-menu')) {
								// If expanded, slide up and then mark as collapsed.
								$menu.slideUp('fast', function () {
									// Callback after slideUp completes.
									$(this)
										.removeClass('expanded-menu')
										.addClass('collapsed-menu');
								});

							} else {
								// If collapsed, remove collapsed state, add expanded, then slide down.
								$menu
									.removeClass('collapsed-menu')
									.addClass('expanded-menu')
									.slideDown('fast');
							} // End of slide effect if/else.

							break;

						default:
							// Default behavior: instant show/hide if no specific effect is chosen.
							if ($menu.hasClass('expanded-menu')) {
								// If expanded, instantly hide and mark as collapsed.
								$menu
									.removeClass('expanded-menu')
									.addClass('collapsed-menu')
									.hide();

							} else {
								// If collapsed, instantly show and mark as expanded.
								$menu
									.removeClass('collapsed-menu')
									.addClass('expanded-menu')
									.show();
							} // End of default effect if/else.

							break;

					} // End of switch/case for effects.

				}); // End of click event handler.

			}); // End of .each() iterator.

	} // End of menuHandler function definition.

	/*
	 * SECTION: Plugin Initialization and Default Configuration
	 * This part defines the jQuery plugin interface and its default options.
	 */

	// Define the 'collapsible' plugin method on jQuery's prototype object.
	$.fn.collapsible = function (options) {

		// Merge default options with any provided options.
		// This creates a new options object without modifying the defaults.
		var opts = $.extend({}, $.fn.collapsible.defaults, options);

		// Iterate over each selected element to apply the plugin behavior.
		return this.each(function (evt) {
			// Ensure the target element has an 'id' attribute, which is required.
			if (undefined === $(this).attr('id')) {
				// If no ID is found, throw an error to indicate a critical requirement.
				throw "Specified element does not include an ID attribute.";
			} else {
				// If an ID exists, proceed to initialize the menu handler for this element.
				menuHandler($(this).attr('id'), opts);
			} // End of ID check conditional.

		}); // End of .each() loop for selected elements.

	}; // End of the $.fn.collapsible plugin definition.

	// Define the default options for the 'collapsible' plugin.
	// These values are used if not overridden by the user.
	$.fn.collapsible.defaults = {
		effect: 'none',          // Default animation effect: 'none', 'fade', or 'slide'
		initialCollapse: false   // Default state: menus are initially expanded
	}; // End of defaults object.

}(jQuery)); /* End of the self-executing anonymous function, passing jQuery as '$' */