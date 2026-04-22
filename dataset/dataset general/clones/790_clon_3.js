(function () {
	'use strict';

	// Define our core application module for dynamic positioning.
	// This module handles elements that should remain fixed after scrolling past a certain point.
	const affixModule = angular.module('fixedElements', []);

	// Directive: fixedPosition
	// This directive enables an element to become fixed (e.g., to the top or bottom of the viewport)
	// when the user scrolls past its initial position.
	affixModule.directive('fixedPosition', function() {
		return {
			restrict: 'A', // Can only be used as an attribute on an HTML element.
			link: setupFixedBehavior // The primary linking function that sets up the behavior.
		};

		/**
		 * The main linking function for the fixedPosition directive.
		 * It initializes state, sets up event listeners, and manages the element's positioning.
		 *
		 * @param {object} scope - The AngularJS scope.
		 * @param {object} element - The jQLite wrapped element this directive is on.
		 * @param {object} attributes - The normalized list of attributes.
		 */
		function setupFixedBehavior(scope, element, attributes) {
			const targetElement = element[0]; // Native DOM element for faster access.
			const documentRoot = document.documentElement; // For scroll and client dimensions.

			// Helper service for window events and body manipulation.
			const windowService = angular.element(window);
			const bodyElement = angular.element(document.body);

			// Configuration parameters from element attributes.
			const sizeConstraint = attributes.mediaQuery || null; // e.g., 'min-width: 768px'
			const fixedCssClass = attributes.fixedClass || ''; // CSS class to apply when fixed.
			const documentBodyClass = attributes.bodyClass || ''; // CSS class to apply to body when fixed.

			// Determine if a placeholder element should be used to prevent content jump.
			const shouldUseSpacer = attributes.usePlaceholder !== undefined;

			// Store the initial inline style attribute for restoration.
			const initialInlineStyle = element.attr('style');

			// Calculate the pixel offset from the chosen edge.
			const positionOffset = attributes.offset ?
				parseInt(attributes.offset.replace(/px;?/, ''), 10) :
				0;

			// Determine the edge to fix to ('top' or 'bottom'). Default to 'top'.
			let fixEdge = (attributes.anchor || 'top').toLowerCase().trim();
			if (fixEdge !== 'top' && fixEdge !== 'bottom') {
				// Fallback for invalid anchor values.
				fixEdge = 'top';
			}

			// Store the element's original computed CSS properties before applying fixed positioning.
			const originalStyles = {
				top:       element.css('top'),
				width:     element.css('width'),
				position:  element.css('position'),
				marginTop: element.css('margin-top'),
				left:      element.css('left'),
				boxSizing: element.css('box-sizing')
			};

			let isBehaviorActive = false; // Flag to track if the element is currently fixed.
			let triggerThreshold; // The scroll position at which the element should become fixed.
			let lastKnownOffset; // Stores the element's offset relative to the document.
			let spacerElement = null; // The placeholder element, if used.

			// Provide a polyfill-like functionality for window.matchMedia if not natively supported.
			const mediaQueryChecker = window.matchMedia || (() => ({ matches: true }));

			// --- Event Listeners and Cleanup ---

			// Attach scroll and resize handlers.
			windowService.on('scroll', evaluatePositionState);
			// Using `requestAnimationFrame` for resize to potentially debounce/throttle.
			windowService.on('resize', () => {
				window.requestAnimationFrame(() => scope.$apply(handleWindowResizing));
			});
			// Listen for scope destruction to clean up event listeners and applied classes/elements.
			scope.$on('$destroy', cleanupBehavior);

			/**
			 * Handles window resize events.
			 * Recalculates element width and re-evaluates stickiness.
			 */
			function handleWindowResizing() {
				// Reset width to allow browser to calculate natural width before re-sticking.
				deactivateFixedMode();
				element.css('width', '');

				// Re-evaluate the position after potential width changes.
				evaluatePositionState();
				
				// If still sticking, ensure width is correctly set for fixed position.
				if (isBehaviorActive) {
					const parent = window.getComputedStyle(targetElement.parentElement);
					const parentPaddingLeft = parseFloat(parent.getPropertyValue('padding-left'));
					const parentPaddingRight = parseFloat(parent.getPropertyValue('padding-right'));
					const calculatedWidth = targetElement.parentElement.offsetWidth - parentPaddingLeft - parentPaddingRight;

					element.css('width', `${calculatedWidth}px`);
				}
			}

			/**
			 * Cleans up all resources when the directive's scope is destroyed.
			 */
			function cleanupBehavior() {
				windowService.off('scroll', evaluatePositionState);
				windowService.off('resize', handleWindowResizing);
				
				if (documentBodyClass) {
					bodyElement.removeClass(documentBodyClass);
				}

				if (spacerElement) {
					spacerElement.remove();
					spacerElement = null;
				}
				// Ensure the element is unstuck when the directive is removed.
				deactivateFixedMode();
			}

			// --- Watcher for Initial Offset and Trigger Threshold ---

			// Initial calculation of the element's offset.
			lastKnownOffset = calculateElementBoundaryOffset(targetElement, fixEdge);

			// Watch for changes in the element's position relative to the document.
			// This is important for elements that might shift due to dynamic content above them.
			scope.$watch(() => {
				// Only re-calculate if not currently fixed, as fixed elements don't change document offset.
				if (isBehaviorActive) {
					return lastKnownOffset;
				}
				// Recalculate based on the chosen edge.
				lastKnownOffset = calculateElementBoundaryOffset(targetElement, fixEdge);
				return lastKnownOffset;
			}, (newVal, oldVal) => {
				// Update the trigger threshold if the element's position has changed or it's the first run.
				if (newVal !== oldVal || typeof triggerThreshold === 'undefined') {
					triggerThreshold = newVal - positionOffset;
					// Re-check position immediately after updating the threshold.
					evaluatePositionState();
				}
			});


			// --- Core Logic Functions ---

			/**
			 * Determines if the element should be in a fixed state based on scroll position.
			 */
			function evaluatePositionState() {
				// If a media query is specified, check if it matches. If not, exit.
				// This ensures the fixed behavior only applies under certain viewport conditions.
				if (sizeConstraint && !(mediaQueryChecker(`(${sizeConstraint})`).matches || mediaQueryChecker(sizeConstraint).matches)) {
					if (isBehaviorActive) { // If previously fixed but media query no longer matches, unstick.
						deactivateFixedMode();
					}
					return;
				}

				let currentScrollPosition;
				let shouldActivate; // Flag indicating if the element should become fixed.

				if (fixEdge === 'top') {
					currentScrollPosition = window.pageYOffset || documentRoot.scrollTop;
					// Should activate if scrolled past the trigger point.
					shouldActivate = currentScrollPosition >= triggerThreshold;
				} else { // fixEdge === 'bottom'
					currentScrollPosition = window.pageYOffset + window.innerHeight;
					// Should activate if the bottom of the viewport is above/at the trigger point.
					shouldActivate = currentScrollPosition <= triggerThreshold;
				}

				// Apply or remove fixed positioning based on the evaluation.
				if (shouldActivate && !isBehaviorActive) {
					activateFixedMode();
				} else if (!shouldActivate && isBehaviorActive) {
					deactivateFixedMode();
				}
			}

			/**
			 * Applies fixed positioning to the element.
			 */
			function activateFixedMode() {
				if (isBehaviorActive) return; // Prevent re-activation if already active.

				// Get current bounding rectangle to calculate absolute left position.
				const currentRect = targetElement.getBoundingClientRect();
				const absoluteLeft = currentRect.left;

				isBehaviorActive = true;

				// Apply body class if specified.
				if (documentBodyClass) {
					bodyElement.addClass(documentBodyClass);
				}

				// Apply fixed class to the element itself.
				if (fixedCssClass) {
					element.addClass(fixedCssClass);
				}

				// Apply fixed CSS properties.
				element.css({
					width:      `${targetElement.offsetWidth}px`, // Maintain original width.
					position:   'fixed',
					[fixEdge]:  `${positionOffset}px`, // Fix to top/bottom with offset.
					left:       `${absoluteLeft}px`, // Maintain original horizontal position.
					marginTop:  '0', // Reset margin-top for fixed elements.
					marginBottom: (fixEdge === 'bottom') ? '0' : '' // Reset margin-bottom if fixed to bottom.
				});

				// Create and insert a placeholder to prevent content jump.
				if (shouldUseSpacer) {
					spacerElement = angular.element('<div></div>');
					spacerElement.css({
						height: `${targetElement.offsetHeight}px`,
						width: `${targetElement.offsetWidth}px`,
						display: element.css('display') === 'inline' ? 'inline-block' : 'block' // Match display type
					});
					element.after(spacerElement);
				}
			}

			/**
			 * Removes fixed positioning from the element, restoring its original state.
			 */
			function deactivateFixedMode() {
				if (!isBehaviorActive) return; // Prevent deactivation if not active.

				isBehaviorActive = false;

				// Remove body class if applied.
				if (documentBodyClass) {
					bodyElement.removeClass(documentBodyClass);
				}

				// Remove fixed class from the element.
				if (fixedCssClass) {
					element.removeClass(fixedCssClass);
				}

				// Restore original inline styles first, then specific computed styles.
				// This ensures any initial inline styles are preserved.
				element.attr('style', initialInlineStyle || '');
				
				// Apply specific original CSS properties to ensure correct restoration.
				element.css({
					width:      originalStyles.width,
					top:        originalStyles.top,
					position:   originalStyles.position,
					left:       originalStyles.left,
					marginTop:  originalStyles.marginTop,
					marginBottom: '', // Clear any potentially set fixed-bottom margin.
					boxSizing: originalStyles.boxSizing // Restore box-sizing
				});

				// Remove the placeholder element if it exists.
				if (spacerElement) {
					spacerElement.remove();
					spacerElement = null;
				}
			}

			/**
			 * Calculates the offset of an element from the top or bottom of the document.
			 *
			 * @param {HTMLElement} el - The DOM element.
			 * @param {string} edge - 'top' or 'bottom'.
			 * @returns {number} The pixel offset.
			 */
			function calculateElementBoundaryOffset(el, edge) {
				let totalPixels = 0;
				let currentElement = el;

				// Accumulate offsetTop from all offsetParents.
				while (currentElement && currentElement.offsetParent) {
					totalPixels += currentElement.offsetTop;
					currentElement = currentElement.offsetParent;
				}

				return (edge === 'top') ? totalPixels : (totalPixels + el.offsetHeight);
			}
		}
	});

	// Conditional Polyfill/Shiv for window.matchMedia
	// This ensures `matchMedia` is available, even if the browser doesn't natively support it.
	// A warning is issued if the native API is missing.
	if (!window.matchMedia) {
		const compatibilityWarning = 'FixedElements: Your browser lacks native matchMedia support. ' +
			'Media query attributes on fixed-position elements will not function as expected. ' +
			'Consider including a matchMedia polyfill for full compatibility.';

		if (window.console && console.warn) {
			console.warn(compatibilityWarning);
		}

		// Provide a fallback function that always returns true,
		// effectively disabling media query constraints.
		window.matchMedia = () => ({ matches: true });
	}

}());