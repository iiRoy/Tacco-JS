(function (tool, domUtil) {
	/* Initialize strict parsing mode for the current scope */
	'use strict';

	// Global configuration settings for this development utility
	tool.settings = {
		// Default vertical adjustment for baseline display
		baseOffset: -8,

		/**
		 * Retrieves the calculated font size in pixels for a given element.
		 * @param {HTMLElement} elemRef - The DOM element to inspect.
		 * @returns {number} The font size as an integer.
		 */
		getFontDimension: function (elemRef) {
			/* Extract the numeric part of the font-size CSS property */
			return parseInt(domUtil(elemRef).css('font-size').replace('px', ''), 10);
		},

		/**
		 * Computes the line height in pixels, handling different CSS units.
		 * @returns {number} The line height in pixels.
		 */
		getLineSpacing: function () {
			// Obtain the line-height style value from the document body
			const measurement = domUtil('body').css('line-height');
			/* Check if the value is explicitly in pixels */
			return (measurement.includes('px') > -1) ? measurement.replace('px', '') : parseFloat(measurement) * tool.settings.getFontDimension('html');
		}
	};

	// Primary function to create and append the developer interface panel
	tool.constructInterface = function () {
		/* Dynamically insert the main control panel HTML into the document body */
		domUtil('<div id="dev-interface">' +
			'<button class="dev-control">Developer</button>' +
			'<ul>' +
			'<li><button data-option="regions">Highlight layout regions</button></li>' +
			'<li><button data-option="baseLines">Show typographic baseline</button></li>' +
			'<li><button data-option="layoutGrid">Display grid overlay</button></li>' +
			'<li><button data-option="viewPortDims">Viewport dimensions</button></li>' +
			'<li>' +
				'<button data-option="viewPortInfo">Viewport summary info</button>' +
				'<button class="placement" data-placement="1">Position panel</button>' +
			'</li>' +
			'<li><button data-option="visualizeBreakpoints">Visualize media breakpoints</button></li>' +
			'</ul>' +
			'</div>').appendTo('body');

		// Store a reference to the newly created user interface panel
		const mainPanel = domUtil('#dev-interface');

		// Initialize interactive elements within the panel: options and display controls
		tool.createControls.options(mainPanel);
		tool.createControls.display(mainPanel);
	};

	// Utility object to handle the creation and event binding for interface buttons
	tool.createControls = {
		/**
		 * Configures click handlers for all feature-toggling buttons.
		 * @param {object} currentPanel - The jQuery object representing the main panel.
		 */
		options: function (currentPanel) {
			// Select all buttons designated as feature toggles
			const controlElements = currentPanel.find('[data-option]');
			// An array to hold the string identifiers of each feature
			const optionIdentifiers = [];

			/* Iterate through each control element to populate the identifiers array */
			domUtil.each(controlElements, function (idx, item) {
				optionIdentifiers.push(domUtil(item).attr('data-option'));
			});

			/* --- Event listeners for feature activation buttons --- */
			controlElements.on('click', function () {
				const clickedInput = domUtil(this);
				const selectedOption = clickedInput.attr('data-option');

				// Check current state to toggle feature on or off
				if (clickedInput.hasClass('on')) {
					tool[selectedOption].disable(); // Deactivate the chosen feature
					clickedInput.removeClass('on'); // Remove visual 'on' state

					// If web storage is available, remove the persistent setting
					if (window.localStorage) {
						localStorage.removeItem('devTool-' + selectedOption);
					}
				} else {
					tool[selectedOption].enable(); // Activate the chosen feature
					clickedInput.addClass('on'); // Add visual 'on' state

					// If web storage is available, save the persistent setting
					if (window.localStorage) {
						localStorage.setItem('devTool-' + selectedOption, true);
					}
				}
			});

			// Upon page load, re-apply settings stored in local storage
			if (window.localStorage) {
				domUtil.each(optionIdentifiers, function (idx, item) {
					if (localStorage.getItem('devTool-' + item) === 'true') {
						// Programmatically trigger a click to restore the feature's state
						controlElements.filter('[data-option="' + item + '"]').trigger('click');
					}
				});
			}
		},

		/**
		 * Manages the visibility state (open/closed) of the main developer panel.
		 * @param {object} displayPanel - The jQuery object for the main panel.
		 */
		display: function (displayPanel) {
			const triggerButton = displayPanel.children('button');

			/**
			 * Collapses the developer panel and cleans up external event handlers.
			 */
			const hidePanel = function () {
				displayPanel.removeClass('open'); // Remove the CSS class that makes it visible
				domUtil(document).off('click.devInterface'); // Detach the global click listener
			};

			/**
			 * Expands the developer panel and sets up an external click listener to close it.
			 */
			const showPanel = function () {
				displayPanel.addClass('open'); // Add the CSS class to make it visible

				domUtil(document).on('click.devInterface', function (eventObj) {
					// If the click occurred outside the panel's hierarchy, hide the panel
					if (domUtil(eventObj.target).parents().filter(displayPanel).length !== 1) {
						hidePanel();
					}
				});
			};

			// Attach the click handler to the main toggle button
			triggerButton.on('click', function () {
				if (displayPanel.hasClass('open')) {
					hidePanel(); // If the panel is open, close it
				} else {
					showPanel(); // If the panel is closed, open it
				}

				// Prevent any default actions associated with the button click
				return false;
			});
		}
	};

	// Module for managing the typographic baseline visualization feature
	tool.baseLines = {
		/**
		 * Removes the visual baseline overlay from the document.
		 */
		disable: function () {
			domUtil('#dev-base-lines').remove(); // Locate and remove the baseline display element
		},

		/**
		 * Generates and appends a visual baseline overlay to the document.
		 */
		enable: function () {
			const settings = tool.settings;
			// Compute the height for each individual baseline line
			const lineHeightVal = (settings.getLineSpacing() - 1) / settings.getFontDimension('body');
			// Calculate how many baseline lines are needed to span the document's height
			const numLines = domUtil(document).height() / settings.getLineSpacing();
			let counter;
			const lineElements = [];

			/* Loop to construct the HTML for each baseline guide */
			for (counter = 0; counter <= numLines; counter += 1) {
				lineElements.push('<li style="height:' + lineHeightVal + 'em"></li>');
			}

			// Insert the generated ordered list of baselines into the body
			domUtil('body').append('<ol id="dev-base-lines" style="top:' + settings.baseOffset + 'px">' + lineElements.join('') + '</ol>');
		}
	};

	// Module for highlighting and numbering layout regions on the page
	tool.regions = {
		/**
		 * Deactivates region highlighting and removes all related DOM modifications.
		 */
		disable: function () {
			domUtil('html').removeClass('dev-mode'); // Remove the global styling class

			domUtil('.dev-sequence').remove(); // Remove all sequence number indicators

			/* Iterate through all highlighted boxes to revert their state */
			domUtil.each(domUtil('.dev-region-box'), function (idx, item) {
				const currentBox = domUtil(item);
				currentBox.contents().appendTo(currentBox.parent()); // Move inner content out of the wrapper
				currentBox.remove(); // Delete the highlight wrapper element itself
			});
		},

		/**
		 * Activates region highlighting by wrapping target elements and adding identifiers.
		 */
		enable: function () {
			domUtil('html').addClass('dev-mode'); // Apply a global class for developer-mode styling

			/* Process elements with 'section' class, explicitly excluding nested grid sections */
			domUtil.each(domUtil('.section').not('#dev-layout-grid .section, .section .section'), function (idx, item) {
				domUtil(item)
					.wrapInner('<div class="dev-region-box"></div>') // Enclose content within a highlight box
					.find('.dev-region-box').append('<div class="dev-sequence">' + (idx + 1) + '</div>'); // Add a sequential number to the box
			});
		}
	};

	/**
	 * Parses a CSS media query string to extract a property's value and convert it to pixels.
	 * @param {string} cssQuery - The full CSS media query string (e.g., '(min-width: 40em)').
	 * @param {string} cssProperty - The specific CSS property to find (e.g., 'min-width').
	 * @returns {number|boolean} The pixel equivalent of the property's value, or false if not found.
	 */
	tool.convertUnitsToPixels = function (cssQuery, cssProperty) {
		let pixelValue;

		// Verify if the target property is present in the query string
		if (cssQuery.includes(cssProperty) > 0) {
			pixelValue = cssQuery.replace('(' + cssProperty + ':', ''); // Strip the property prefix

			// If the value is in 'em', convert it to pixels
			if (cssQuery.includes('em') > 0) {
				pixelValue = Math.round(parseFloat(pixelValue.replace('em)', '')) * tool.settings.getFontDimension('html') * 100000) / 100000;
			}

			// If the value is in 'px', simply remove the suffix
			if (cssQuery.includes('px') > 0) {
				pixelValue = pixelValue.replace('px)', '');
			}
		}

		// Return the numerical pixel value, or false if conversion was not possible
		return pixelValue ? parseFloat(pixelValue) : false;
	};

	// Module for displaying a visual layout grid overlay
	tool.layoutGrid = {
		/**
		 * Removes the layout grid overlay from the document.
		 */
		disable: function () {
			domUtil('#dev-layout-grid').remove(); // Delete the grid element
		},

		/**
		 * Creates and appends a layout grid overlay to the document.
		 */
		enable: function () {
			let loopVar;
			let gridHtml = '<div id="dev-layout-grid"><div class="segments">';

			// Construct 17 individual grid segments (from 0 to 16)
			for (loopVar = 0; loopVar <= 16; loopVar += 1) {
				gridHtml += '<div class="section"></div>';
			}

			gridHtml += '</div></div>';

			// Insert the complete grid HTML structure into the document body
			domUtil('body').append(gridHtml);
		}
	};

	// Module for displaying the current viewport's dimensions
	tool.viewPortDims = {
		/**
		 * Hides the viewport dimension display from the document.
		 */
		disable: function () {
			domUtil('#dev-viewport-display').remove(); // Remove the element that shows viewport size
		},

		/**
		 * Activates and displays the current viewport dimensions, updating on resize.
		 */
		enable: function () {
			domUtil('body').append('<div id="dev-viewport-display"></div>'); // Add the container for dimensions display

			const viewportDisplayElement = domUtil('#dev-viewport-display');

			/**
			 * Updates the displayed width, height, and device pixel ratio.
			 */
			const refreshDimensions = function () {
				viewportDisplayElement.html(
					tool.getViewportWidth() + ' &times; ' + tool.getViewportHeight() + ' / ' +
					(window.devicePixelRatio ? (Math.round(window.devicePixelRatio * 100000) / 100000) : '?') // Show device pixel ratio if available
				);
			};

			// Perform an initial update and bind the update function to the window's resize event
			refreshDimensions();
			domUtil(window).resize(refreshDimensions);
		}
	};

	// Module for providing a summary of active media queries and their details
	tool.viewPortInfo = {
		/**
		 * Disables the viewport summary panel and removes it from the DOM.
		 */
		disable: function () {
			domUtil('#dev-viewport-summary-panel').remove(); // Remove the entire summary panel
		},

		/**
		 * Enables the viewport summary panel, populating it with media query data.
		 */
		enable: function () {
			domUtil('body').append('<div id="dev-viewport-summary-panel"></div>'); // Insert the summary panel container

			const summaryDisplay = domUtil('#dev-viewport-summary-panel');
			let panelContent = '';
			// Assuming 'frwd' is a globally accessible object containing responsive design rules
			const responsiveQueries = window.frwd.responsiveRules;

			/**
			 * Updates the active/inactive state of each media query listed in the summary.
			 */
			const refreshData = function () {
				domUtil.each(responsiveQueries, function (idx, item) {
					const queryResult = window.frwd.checkViewport(idx); // Determine if the media query currently matches
					summaryDisplay.find('.' + idx).removeClass('' + !queryResult).addClass('' + queryResult);
				});
			};

			// Construct the initial table structure for the summary panel
			panelContent += '<table>' +
				'<tr class="none true">' +
					'<th>none</th>' +
					'<td colspan="3">no active media queries</td>' +
				'</tr>';

			/* Iterate through each responsive rule to build table rows */
			domUtil.each(responsiveQueries, function (idx, item) {
				const ruleQuery = item.query;
				// Convert any 'min-width' or 'min-height' values to pixels
				const pixelsConverted = tool.convertUnitsToPixels(ruleQuery, 'min-width') || tool.convertUnitsToPixels(ruleQuery, 'min-height');

				panelContent += '<tr class="' + idx + '">' +
						'<th>' + idx + '</th>' +
						'<td>' + ruleQuery + '</td>' +
						'<td>' + (pixelsConverted ? pixelsConverted + 'px' : '') + '</td>' +
					'</tr>';
			});

			panelContent += '</table>';

			summaryDisplay.html(panelContent); // Set the generated HTML content for the panel

			// Perform an initial data refresh and bind the refresh function to window resize events
			refreshData();
			domUtil(window).resize(refreshData);
			tool.viewPortInfo.placement.initialize(); // Set up panel positioning logic
			tool.viewPortInfo.collapse.initialize(); // Set up panel minimize/maximize logic
		},

		// Sub-module for controlling the minimization/maximization state of the summary panel
		collapse: {
			/**
			 * Binds the click event handler for toggling the panel's collapse state.
			 */
			handleClick: function () {
				// TODO: Consider caching this jQuery selector for performance
				domUtil('#dev-viewport-summary-panel').on('click', function () {
					// Toggle between 'disable' (unminimized) and 'enable' (minimized) based on current state
					tool.viewPortInfo.collapse[(domUtil(this).hasClass('minimized-state')) ? 'disable' : 'enable']();
					return false; // Suppress any default browser behavior for the click
				});
			},

			// TODO: Comprehensive unit tests are needed for this feature
			/**
			 * Initializes the panel's collapse state based on a stored local preference.
			 */
			initialize: function () {
				if (window.localStorage && localStorage.getItem('devTool-collapsed')) {
					tool.viewPortInfo.collapse[localStorage.getItem('devTool-collapsed')]();
				}

				tool.viewPortInfo.collapse.handleClick(); // Attach the click event listener
			},

			// TODO: Comprehensive unit tests are needed for this feature
			/**
			 * Sets the panel to its expanded (unminimized) state.
			 */
			disable: function () {
				// TODO: Consider caching this jQuery selector for performance
				domUtil('#dev-viewport-summary-panel').removeClass('minimized-state');

				if (window.localStorage) {
					localStorage.setItem('devTool-collapsed', 'disable'); // Update local storage
				}
			},

			// TODO: Comprehensive unit tests are needed for this feature
			/**
			 * Sets the panel to its collapsed (minimized) state.
			 */
			enable: function () {
				// TODO: Consider caching this jQuery selector for performance
				domUtil('#dev-viewport-summary-panel').addClass('minimized-state');

				if (window.localStorage) {
					localStorage.setItem('devTool-collapsed', 'enable'); // Update local storage
				}
			},
		},

		// Sub-module for managing the position of the summary panel on the screen
		placement: {
			// TODO: Comprehensive unit tests are needed for this feature
			/**
			 * Binds the click event handler for changing the panel's screen position.
			 */
			handleClick: function () {
				domUtil('#dev-interface').find('.placement').off('click').on('click', function () {
					const currentPos = domUtil(this).attr('data-placement');
					let nextPos = parseInt(currentPos, 10) + 1;

					if (nextPos > 4) nextPos = 1; // Cycle through 4 predefined positions

					tool.viewPortInfo.placement.relocate(nextPos); // Move the panel to the new position

					if (window.localStorage) {
						localStorage.setItem('devTool-position', nextPos); // Persist the new position
					}
				});
			},

			// TODO: Comprehensive unit tests are needed for this feature
			/**
			 * Initializes the panel's position based on a stored local preference.
			 */
			initialize: function () {
				if (window.localStorage && localStorage.getItem('devTool-position')) {
					tool.viewPortInfo.placement.relocate(localStorage.getItem('devTool-position'));
				}

				tool.viewPortInfo.placement.handleClick(); // Attach the click event listener
			},

			// TODO: Comprehensive unit tests are needed for this feature
			/**
			 * Applies a new position to the summary panel.
			 * @param {number} newPosition - The desired position index (1 through 4).
			 */
			relocate: function (newPosition) {
				const summaryPanelRef = domUtil('#dev-viewport-summary-panel');
				const preservedClass = 'minimized-state';
				// Check if the minimized state needs to be reapplied after position change
				const shouldRestoreClass = (summaryPanelRef.hasClass(preservedClass)) ? true : false;

				summaryPanelRef.removeClass().addClass('location' + newPosition); // Update position class
				if (shouldRestoreClass) summaryPanelRef.addClass(preservedClass); // Re-apply minimized class if it was present
				domUtil('#dev-interface').find('.placement').attr('data-placement', newPosition); // Update the position button's attribute
			}
		}
	};

	/**
	 * Retrieves the current height of the browser's viewport.
	 * @returns {number} The viewport height in pixels.
	 */
	tool.getViewportHeight = function () {
		return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
	};

	/**
	 * Retrieves the current width of the browser's viewport.
	 * @returns {number} The viewport width in pixels.
	 */
	tool.getViewportWidth = function () {
		return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
	};

	// Module for visualizing CSS media query breakpoints on the screen
	tool.visualizeBreakpoints = {
		/**
		 * Removes all breakpoint visualization elements from the document.
		 */
		disable: function () {
			domUtil('.dev-visualizer').remove(); // Remove all visualizer elements
		},

		/**
		 * Generates and appends visual markers for media query breakpoints.
		 */
		enable: function () {
			let mediaRule;
			let widthMarkers = '';
			let heightMarkers = '';

			/* Iterate through the collection of defined responsive media rules */
			domUtil.each(window.frwd.responsiveRules, function (idx, item) {
				mediaRule = item.query;

				// If the rule contains a 'min-width' query, create a width marker
				if (mediaRule.includes('min-width') > 0) {
					const pixelValue = tool.convertUnitsToPixels(mediaRule, 'min-width');
					widthMarkers += '<li style="width: ' + pixelValue + 'px"><span>' + idx + '</span></li>';
				}

				// If the rule contains a 'min-height' query, create a height marker
				if (mediaRule.includes('min-height') > 0) {
					const pixelValue = tool.convertUnitsToPixels(mediaRule, 'min-height');
					heightMarkers += '<li style="height: ' + pixelValue + 'px"><span>' + idx + '</span></li>';
				}
			});

			// If any width markers were generated, append them to the body
			if (widthMarkers) {
				domUtil('body').append('<ol class="dev-visualizer dev-visualizer-width">' + widthMarkers + '</ol>');
			}

			// If any height markers were generated, append them to the body
			if (heightMarkers) {
				domUtil('body').append('<ol class="dev-visualizer dev-visualizer-height">' + heightMarkers + '</ol>');
			}
		}
	};

	// Execute the panel construction function once the DOM is fully loaded
	domUtil(tool.constructInterface);
	// Pass the 'tool' object (assigned to window.frwd.devTool) and jQuery to the IIFE
}(window.frwd.devTool = window.frwd.devTool || {}, jQuery));