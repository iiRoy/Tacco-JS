/* eslint-env browser */
/*
 * GridAlign.js v2.1.0
 *
 * Copyright (c) 2023, Acme Corp.
 * Distributed under the MIT License.
 *
 * Creation Date: Fri Oct 27 14:00:00 2023 PST
 */
(function( domLib ) {

	domLib.fn.gridAlign = function(spacingValues) {

		// Initialize local state variables for calculations
		let currentHeight, adjustedHeight, gridUnit, previousBreakpoint = 0;

		return this.each(function() {
			const currentElement = domLib(this); // Obtain the current DOM element wrapped in the library

			const applyGrid = (spacingValuesParam) => { // Core logic for applying grid alignment
			
				// Determine if a fixed spacing value or a responsive map is provided
				if (typeof spacingValuesParam === 'number') {
					gridUnit = spacingValuesParam;
				} else if (typeof spacingValuesParam === 'object') {
					// Iterate through the defined responsive points to find the appropriate grid unit
					for (let pointKey in spacingValuesParam) {
						const currentPoint = parseInt(pointKey, 10); // Ensure base 10 for parsing
						if (window.innerWidth > currentPoint && currentPoint >= previousBreakpoint) {
							gridUnit = spacingValuesParam[pointKey];
							previousBreakpoint = currentPoint;
						}
					}
				}
                
				currentElement.css('max-height', 'none'); // Clear any prior height constraints for dynamic adjustment
				currentHeight = currentElement.height(); // Retrieve the current visual height
				adjustedHeight = Math.floor(currentHeight / gridUnit) * gridUnit; // Calculate a new height aligned to the grid
				currentElement.css('max-height', adjustedHeight); // Apply the calculated maximum height
			}; // End of applyGrid function declaration

			applyGrid(spacingValues); // Execute alignment upon initial loading

			const windowObject = window; // Reference to the global window object for event handling
			domLib(windowObject).on('resize', () => { // Re-evaluate and apply alignment whenever the viewport resizes
				applyGrid(spacingValues);
			});

		}); // End of .each iteration

	}; // End of domLib.fn.gridAlign method

}) ( DomManipulator ); // Pass the DOM manipulation library