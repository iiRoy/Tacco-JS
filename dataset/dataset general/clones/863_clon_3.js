( function( jQuery ) {

	// A reference to the global window object for performance.
	const $window = jQuery( window );

	/**
	 * viewportNav - A responsive, feature-rich content carousel plugin for jQuery.
	 *
	 * This plugin provides a flexible slider with responsive slides, dynamic widths,
	 * custom callbacks, and animation hooks. It supports both desktop drag and touch
	 * gestures, and handles infinite looping by dynamically reordering content.
	 *
	 * Version: 2.0 (Reimagined from sldr 1.1)
	 * Developed with jQuery 3.x, may support earlier versions with polyfills.
	 *
	 * The MIT License (MIT) - Original Copyright (c) 2014 Devon Hirth
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy of
	 * this software and associated documentation files (the "Software"), to deal in
	 * the Software without restriction, including without limitation the rights to
	 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
	 * the Software, and to permit persons to whom the Software is furnished to do so,
	 * subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all
	 * copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
	 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
	 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
	 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	 *
	 */

	/**
	 * Main constructor function for the viewportNav plugin.
	 * @param {HTMLElement} element - The DOM element to initialize the carousel on.
	 * @param {object} settings - User-defined options to override defaults.
	 */
	const ViewportNavController = function( element, settings ) {

		const manager = this; // 'manager' refers to the current plugin instance.

		manager.$element = jQuery( element );
		manager.domElement = element;
		manager.$slideWrapper = manager.$element.children().first();

		// Store the instance on the element's data for later retrieval.
		manager.$element.data( "viewportNav", manager );

		/**
		 * Internal state variables for the carousel.
		 */
		manager.eventContext = {}; // Context object for callback functions.
		manager.allSlidesInfo = []; // Stores metadata for all original slides.
		manager.lazyLoadQueue = []; // Slides identified for lazy loading.
		manager.autoAdvanceTimers = []; // Timers for auto-play functionality.
		manager.layoutAdjustTimers = []; // Timers for debounced resize events.
		manager.animationDelayTimers = []; // Timers for animation delays.

		manager.initialSlideMarkup = manager.$slideWrapper.html(); // Original HTML content of the wrapper.

		manager.dragStartPoint = {}; // Stores coordinates at the start of a drag/swipe.
		manager.lastDragPoint = {}; // Stores coordinates of the previous drag/swipe event.
		manager.currentDragPoint = {}; // Stores coordinates of the current drag/swipe event.
		manager.horizontalDragDiff = 0; // Difference in X-coordinate during drag.
		manager.isDraggingActive = false; // Flag to indicate if a drag operation is in progress.
		manager.initialPageScrollY = 0; // Page scroll Y at drag start to prevent unwanted scrolling.
		manager.currentTranslateX = 0; // Current X-transform value of the wrapper.
		manager.isAnimating = false; // Flag to prevent concurrent animations.

		manager.browserCapabilities = {}; // Detected browser capabilities (e.g., IE, transform prefix).

		/**
		 * Initializes the carousel instance.
		 * Merges user settings with defaults, sets up browser detection,
		 * builds slide data, and binds all necessary event listeners.
		 * @returns {void}
		 */
		manager.initCarousel = function() {

			manager.settings = jQuery.extend( true, {}, jQuery.fn.viewportNav.defaults, settings );

			// Validate essential settings
			if (!manager.$slideWrapper.length) {
				console.warn("viewportNav: No slide wrapper found. Please ensure the structure is `container > wrapper > slides`.");
				return;
			}

			manager.detectBrowserCapabilities();

			const $currentSlideElements = manager.$slideWrapper.children();
			let hasLazyLoadableContent = false;

			// Populate slide information array if not already done.
			if ( manager.allSlidesInfo.length === 0 ) {
				manager.eventContext = {
					containerEl: manager.$element,
					prevFocalIdx: '',
					prevSlideNumber: '',
					currentFocalIdx: '',
					activeElementClass: '',
					activeElementId: '',
					currentFocalOffset: '',
					currentSlideNumber: '',
					offsetDelta: '',
					nextFocalIdx: '',
					nextSlideNumber: ''
				};

				$currentSlideElements.each( function( idx ) {
					const $slide = jQuery( this );
					const slideNumber = idx + 1;
					const slideClasses = $slide.attr( 'class' ) ? $slide.attr( 'class' ).split(' ') : [];
					const mainClassName = slideClasses.length > 0 ? slideClasses[0] : '';
					const $lazyLoadTrigger = $slide.find( manager.settings.lazyLoadClass );

					manager.allSlidesInfo.push({
						slideElement: $slide,
						slideNumber: slideNumber,
						id: $slide.attr( 'id' ),
						mainClassName: mainClassName,
						initialHtml: $slide.html()
					});

					if ( $lazyLoadTrigger.hasClass( manager.settings.lazyLoadClass.substring(1) ) ) {
						hasLazyLoadableContent = true;
						manager.lazyLoadQueue.push({
							slideNumber: slideNumber,
							id: $slide.attr( 'id' ),
							mainClassName: mainClassName,
							initialHtml: $slide.html()
						});
					}
				});
			}

			// If only one slide, apply active class and trigger loaded events, then exit.
			if ( $currentSlideElements.length <= 1 ) {
				$currentSlideElements.first().addClass( manager.settings.activeClass );
				manager.onCarouselReady({ slides: manager.allSlidesInfo, context: manager.eventContext, settings: manager.settings });
				manager.onCarouselFullyLoaded({ slides: manager.allSlidesInfo, context: manager.eventContext, settings: manager.settings });
				return;
			}

			// Ensure enough content for seamless looping by duplicating slides.
			manager.replicateSlides( manager.initialSlideMarkup );

			// Trigger initial ready callback.
			manager.onCarouselReady({ slides: manager.allSlidesInfo, context: manager.eventContext, settings: manager.settings });

			// Set initial focal slide and adjust layout.
			manager.setFocalPoint( 1 ); // Default to the first slide.
			manager.adjustLayout();

			// Bind all event listeners.
			manager.setupEventListeners();

			// Initial positioning.
			const initialPositionData = {
				currentFocalIdx: manager.$element.find( `.${manager.settings.activeClass}` ).index(),
				currentFocalOffset: manager.determineFocalOffset(),
				offsetDelta: 0
			};
			manager.snapToPosition( initialPositionData );

			// Trigger fully loaded callback.
			manager.onCarouselFullyLoaded({ slides: manager.allSlidesInfo, context: manager.eventContext, settings: manager.settings });
		};

		/**
		 * Orchestrates the transition to a new focal slide, potentially with animation.
		 * @param {object} positionData - Contains information about the new focal position.
		 * @returns {void}
		 */
		manager.transitionToSlide = function( positionData ) {
			if ( !positionData || manager.isAnimating ) {
				return;
			}

			manager.isAnimating = true;

			try {
				if ( typeof manager.settings.customAnimator === 'function' ) {
					// Use custom animation hook if provided.
					manager.settings.customAnimator( manager.$element, positionData, { slides: manager.allSlidesInfo, context: manager.eventContext, settings: manager.settings } );
					manager.isAnimating = false; // Assume custom animator handles its own completion.
				} else {
					// Default animation logic.
					clearTimeout( manager.animationDelayTimers[manager.settings.carouselInstanceId] );
					manager.animationDelayTimers[manager.settings.carouselInstanceId] = setTimeout( () => {
						manager.$slideWrapper.addClass( manager.settings.animateClass );

						const targetOffset = manager.settings.alignmentOffset - positionData.currentFocalOffset;

						if ( manager.settings.forceJQueryAnimate || manager.isLegacyBrowser() ) {
							// Use jQuery's animate for older browsers or if forced.
							const easingType = ( jQuery.easing && jQuery.easing[manager.settings.jQueryEaseEffect] ) ? manager.settings.jQueryEaseEffect : 'linear';
							manager.$slideWrapper.animate({
								marginLeft: targetOffset
							}, manager.settings.jQueryAnimateDuration, easingType, () => {
								manager.isAnimating = false;
								manager.onSlideTransitionEnd({ slides: manager.allSlidesInfo, context: manager.eventContext, settings: manager.settings });
							});
						} else {
							// Use CSS transforms for modern browsers.
							manager.$slideWrapper.css( manager.settings.cssTransformPrefix + 'transform', `translate3d( ${targetOffset}px, 0, 0 )` );
							// Listen for CSS transition end to trigger completion callback.
							manager.$slideWrapper.one('transitionend', () => {
								manager.isAnimating = false;
								manager.onSlideTransitionEnd({ slides: manager.allSlidesInfo, context: manager.eventContext, settings: manager.settings });
							});
						}
					}, 100 ); // Small delay to allow DOM repaints after reordering.
				}
			} catch ( error ) {
				console.error( "viewportNav: Animation error.", error );
				manager.isAnimating = false;
				manager.$element.trigger('viewportNav.error', { type: 'animation', message: error.message });
			}
		};

		/**
		 * Positions the carousel to a new focal slide without animation (instant snap).
		 * @param {object} positionData - Contains information about the new focal position.
		 * @returns {void}
		 */
		manager.snapToPosition = function( positionData ) {
			if ( !positionData ) {
				return;
			}

			clearTimeout( manager.animationDelayTimers[manager.settings.carouselInstanceId] );
			manager.$slideWrapper.removeClass( manager.settings.animateClass );

			const targetOffset = manager.settings.alignmentOffset - positionData.currentFocalOffset;

			if ( manager.settings.forceJQueryAnimate || manager.isLegacyBrowser() ) {
				manager.$slideWrapper.css( 'margin-left', targetOffset );
			} else {
				if ( manager.$slideWrapper.css( manager.settings.cssTransformPrefix + 'transform' ) === 'none' ) {
					manager.$slideWrapper.css( manager.settings.cssTransformPrefix + 'transform', 'translate3d( 0, 0, 0 )' );
				}
				manager.$slideWrapper.css( manager.settings.cssTransformPrefix + 'transform', `translate3d(${targetOffset}px, 0, 0)` );
			}

			// Re-add animate class after a tiny delay to ensure smooth transitions for subsequent movements.
			manager.animationDelayTimers[manager.settings.carouselInstanceId] = setTimeout( () => {
				manager.$slideWrapper.addClass( manager.settings.animateClass );
				manager.onSlideTransitionEnd({ slides: manager.allSlidesInfo, context: manager.eventContext, settings: manager.settings });
			}, manager.settings.resizeDebounceTime + 1 );
		};


		/**********************************************************
		 ****************** Positioning and Logic *****************
		 **********************************************************/

		/**
		 * Determines the new focal slide index and reorders the DOM elements
		 * to maintain an "infinite" loop effect. Updates the eventContext.
		 * @param {number} targetSlideNumber - The 1-based index of the target slide from `allSlidesInfo`.
		 * @param {string} [moveDirection='default'] - Hint for preferred direction ('forward', 'backward', 'selectors').
		 * @returns {object|boolean} The updated eventContext object or false if no change.
		 */
		manager.setFocalPoint = function( targetSlideNumber, moveDirection = 'default' ) {
			try {
				manager.onSlideTransitionStart({ slides: manager.allSlidesInfo, context: manager.eventContext, settings: manager.settings });

				let $currentSlideElements = manager.$slideWrapper.children();
				const $activeFocalElement = manager.$slideWrapper.find( `> .${manager.settings.activeClass}` );
				const currentFocalIndex = $activeFocalElement.index();

				if ( !manager.allSlidesInfo[ targetSlideNumber - 1 ] ) {
					console.warn(`viewportNav: Target slide number ${targetSlideNumber} is out of bounds.`);
					return false;
				}

				const targetSlideInfo = manager.allSlidesInfo[ targetSlideNumber - 1 ];
				const targetMainClassName = targetSlideInfo.mainClassName;

				// If the target slide is already the active one, no change needed.
				if ( $activeFocalElement.hasClass( targetMainClassName ) ) {
					return false;
				}

				// Find the closest instance of the target slide in the current DOM.
				const indexCloserBehind = $currentSlideElements.eq( currentFocalIndex ).prevAll( `.${targetMainClassName}:first` ).index();
				const indexCloserAhead = $currentSlideElements.eq( currentFocalIndex ).nextAll( `.${targetMainClassName}:first` ).index();

				let nextFocalDomIndex;

				// Determine which instance of the target slide is "closer" to the current focal point.
				if ( indexCloserAhead !== -1 && ( indexCloserBehind === -1 || (indexCloserAhead - currentFocalIndex <= currentFocalIndex - indexCloserBehind) || (indexCloserAhead - currentFocalIndex === currentFocalIndex - indexCloserBehind && moveDirection !== 'backward') ) ) {
					nextFocalDomIndex = indexCloserAhead;
				} else if ( indexCloserBehind !== -1 ) {
					nextFocalDomIndex = indexCloserBehind;
				} else {
					// Fallback: If no closer instance found (shouldn't happen with sufficient content replication),
					// find the first occurrence.
					nextFocalDomIndex = $currentSlideElements.filter(`.${targetMainClassName}`).first().index();
				}

				const $newFocalElement = $currentSlideElements.eq( nextFocalDomIndex );

				// Update active class.
				$currentSlideElements.removeClass( manager.settings.activeClass );
				$newFocalElement.addClass( manager.settings.activeClass );

				// Calculate elements to relocate for the "infinite" effect.
				// The goal is to keep the focal element roughly in the middle of the wrapper.
				const totalElements = $currentSlideElements.length;
				const halfElements = Math.floor( totalElements / 2 );

				let relocationDirection;
				let sliceStartIndex, sliceEndIndex;
				let relocationWidthDelta = 0;

				if ( nextFocalDomIndex > halfElements ) {
					// New focal is in the latter half, so move elements from start to end.
					relocationDirection = 'forward';
					sliceStartIndex = 0;
					sliceEndIndex = nextFocalDomIndex - halfElements;
				} else {
					// New focal is in the first half, so move elements from end to start.
					relocationDirection = 'backward';
					sliceStartIndex = nextFocalDomIndex + halfElements + 1; // Example: 0-indexed, if 5 elements, half is 2. If new focal is 1, we want to move elements from index 1+2+1 = 4 onwards to the front.
					if (sliceStartIndex >= totalElements) sliceStartIndex = 0; // Handle cases where not enough elements to move.
					sliceEndIndex = totalElements;
				}

				const $elementsToRelocate = $currentSlideElements.slice( sliceStartIndex, sliceEndIndex );

				if ($elementsToRelocate.length > 0) {
					// Calculate width of elements being relocated.
					$elementsToRelocate.each(function() {
						relocationWidthDelta += jQuery(this).outerWidth( true ); // Include margins.
					});

					// Adjust current position without animation to simulate seamless wrap.
					manager.$slideWrapper.removeClass( manager.settings.animateClass );

					if ( manager.settings.forceJQueryAnimate || manager.isLegacyBrowser() ) {
						let currentMarginLeft = parseFloat( manager.$slideWrapper.css('margin-left') ) || 0;
						manager.$slideWrapper.css('margin-left', currentMarginLeft + (relocationDirection === 'backward' ? relocationWidthDelta : -relocationWidthDelta) + 'px');
					} else {
						const matrixElementIndex = manager.browserCapabilities.isIE ? 12 : 4; // IE uses different matrix index.
						manager.currentTranslateX = manager.extractTransformValue( manager.$slideWrapper.css( manager.settings.cssTransformPrefix + 'transform' ), matrixElementIndex );
						const newTransformX = manager.currentTranslateX + (relocationDirection === 'backward' ? relocationWidthDelta : -relocationWidthDelta);
						manager.$slideWrapper.css( manager.settings.cssTransformPrefix + 'transform', `translate3d(${newTransformX}px, 0, 0)` );
					}

					// Perform the actual DOM reordering.
					const $clonedElements = $elementsToRelocate.clone(true); // Clone with events and data.
					$elementsToRelocate.remove();
					if ( relocationDirection === 'backward' ) {
						manager.$slideWrapper.prepend( $clonedElements );
					} else {
						manager.$slideWrapper.append( $clonedElements );
					}
				}

				// Re-fetch children after DOM manipulation.
				$currentSlideElements = manager.$slideWrapper.children();

				// Update event context for callbacks.
				const newFocalDomIndex = $currentSlideElements.index( $newFocalElement );
				const newFocalOffset = manager.determineFocalOffset();

				const nextSlideNumForCallback = ( targetSlideNumber + 1 > manager.allSlidesInfo.length ) ? 1 : targetSlideNumber + 1;
				const prevSlideNumForCallback = ( targetSlideNumber - 1 === 0 ) ? manager.allSlidesInfo.length : targetSlideNumber - 1;

				manager.eventContext = {
					containerEl: manager.$element,
					prevFocalIdx: ( newFocalDomIndex - 1 === -1 ) ? totalElements - 1 : newFocalDomIndex - 1,
					prevSlideNumber: prevSlideNumForCallback,
					currentFocalIdx: newFocalDomIndex,
					activeElementClass: targetMainClassName,
					activeElementId: $newFocalElement.attr('id'),
					currentFocalOffset: newFocalOffset,
					currentSlideNumber: targetSlideNumber,
					offsetDelta: relocationWidthDelta,
					nextFocalIdx: ( newFocalDomIndex + 1 === totalElements ) ? 0 : newFocalDomIndex + 1,
					nextSlideNumber: nextSlideNumForCallback
				};

				// Update navigation links if they exist.
				if ( manager.settings.navigationLinks && manager.settings.navigationLinks.length > 0 ) {
					manager.settings.navigationLinks.removeClass( manager.settings.activeClass );
					manager.settings.navigationLinks.eq( targetSlideNumber - 1 ).addClass( manager.settings.activeClass );
				}

				return manager.eventContext;

			} catch ( error ) {
				console.error( "viewportNav: Error in focal change logic.", error );
				manager.$element.trigger('viewportNav.error', { type: 'focalChange', message: error.message });
				return false;
			}
		};

		/**
		 * Recursively adds clones of initial content to the wrapper
		 * until its total width is sufficient to maintain the infinite loop effect.
		 * @param {string} slideContentFragment - The original HTML content of the slides.
		 * @returns {boolean} True when content is sufficient.
		 */
		manager.replicateSlides = function( slideContentFragment ) {
			try {
				const viewportWidth = manager.$element.outerWidth();
				const $currentSlideItems = manager.$slideWrapper.children();
				const currentContentWidth = manager.calculateElementsTotalWidth( $currentSlideItems );

				// Continue replicating until the wrapper contains enough slides to fill the viewport multiple times.
				// Multiplier 5 ensures enough "buffer" slides for seamless transitions in both directions.
				if ( currentContentWidth < viewportWidth * manager.settings.contentReplicationFactor ) {
					// Append the original content fragment.
					manager.$slideWrapper.append( slideContentFragment );
					// Recurse until condition met.
					manager.replicateSlides( slideContentFragment );
				} else {
					// Set the wrapper's width to prevent overflow and enable proper positioning.
					manager.$slideWrapper.css( 'width', currentContentWidth );
					return true;
				}
			} catch ( error ) {
				console.error( "viewportNav: Error replicating slides.", error );
				manager.$element.trigger('viewportNav.error', { type: 'replication', message: error.message });
			}
		};

		/**
		 * Calculates the total width of a collection of jQuery elements, including margins.
		 * @param {jQuery} $elements - A jQuery object containing the elements.
		 * @returns {number} The sum of outerWidth (including margin) of all elements.
		 */
		manager.calculateElementsTotalWidth = function( $elements ) {
			let totalWidth = 0;
			$elements.each( function() {
				totalWidth += jQuery( this ).outerWidth( true );
			});
			return totalWidth;
		};

		/**
		 * Calculates the offset required to bring the current focal element to the center
		 * or start of the viewport, based on settings.
		 * @returns {number} The pixel offset of the focal point.
		 */
		manager.determineFocalOffset = function() {
			const $activeFocalElement = manager.$slideWrapper.find( `> .${manager.settings.activeClass}` );
			if ( !$activeFocalElement.length ) {
				return 0;
			}
			const focalElementOffset = $activeFocalElement.position().left;
			const focalElementWidth = $activeFocalElement.outerWidth(true);
			const containerWidth = manager.$element.outerWidth();

			if (manager.settings.alignFocal === 'center') {
				return focalElementOffset - (containerWidth / 2) + (focalElementWidth / 2);
			} else if (manager.settings.alignFocal === 'start') {
				return focalElementOffset;
			}
			// Default to center if unknown alignment.
			return focalElementOffset - (containerWidth / 2) + (focalElementWidth / 2);
		};

		/**
		 * Extracts the translate X value from a CSS transform string.
		 * Works for both matrix() and matrix3d().
		 * @param {string} transformString - The CSS transform string.
		 * @param {number} matrixValueIndex - The index in the matrix array where the X-translate value is.
		 * @returns {number} The parsed X-translate value in pixels.
		 */
		manager.extractTransformValue = function( transformString, matrixValueIndex = 4 ) {
			if ( transformString === 'none' ) {
				return 0;
			}
			const matrix = transformString.match( /matrix(?:3d)?\(([^)]+)\)/ );
			if ( matrix && matrix[1] ) {
				const values = matrix[1].split(', ');
				return parseInt( values[matrixValueIndex], 10 );
			}
			return 0;
		};

		/**
		 * Adjusts the layout of the carousel elements based on current viewport size.
		 * This involves updating slide widths and recalculating wrapper width.
		 * @returns {void}
		 */
		manager.adjustLayout = function() {
			// Clear all existing timers before re-adjusting
			manager.pauseAdvance();
			clearTimeout( manager.layoutAdjustTimers[manager.settings.carouselInstanceId] );
			clearTimeout( manager.animationDelayTimers[manager.settings.carouselInstanceId] );

			// Apply responsive widths if specified.
			if (manager.settings.responsiveWidths) {
				const slideWidth = manager.$element.width() * manager.settings.responsiveWidths;
				manager.$slideWrapper.children().css('width', slideWidth);
			}

			// Recalculate wrapper width after potential slide width changes.
			const newWrapperWidth = manager.calculateElementsTotalWidth( manager.$slideWrapper.children() );
			manager.$slideWrapper.css('width', newWrapperWidth);

			// Snap to the current focal point without animation.
			const currentFocalPosition = {
				currentFocalIdx: manager.$slideWrapper.find( `.${manager.settings.activeClass}` ).index(),
				currentFocalOffset: manager.determineFocalOffset(),
				offsetDelta: 0
			};
			manager.snapToPosition( currentFocalPosition );

			// Restart auto-advance if enabled.
			manager.startAdvance();
		};


		/**********************************************************
		 ********************* Event Handling *********************
		 **********************************************************/

		/**
		 * Consolidates all event listener bindings for the carousel.
		 * @returns {void}
		 */
		manager.setupEventListeners = function() {
			// Navigation links (selectors)
			if ( manager.settings.navigationLinks && manager.settings.navigationLinks.length > 0 ) {
				manager.settings.navigationLinks.first().addClass( manager.settings.activeClass );
				manager.settings.navigationLinks.on( 'click.viewportNav', function( evt ) {
					evt.preventDefault();
					const $clickedLink = jQuery( this );
					const targetIndex = $clickedLink.index() + 1; // Convert to 1-based slide number.
					const positionUpdate = manager.setFocalPoint( targetIndex, 'selectors' );
					if ( positionUpdate ) {
						manager.transitionToSlide( positionUpdate );
					}
					manager.restartAutoAdvanceOnInteraction();
				});
				manager.setupHoverInteraction( manager.settings.navigationLinks );
			}

			// Next slide button
			if ( manager.settings.nextButton && manager.settings.nextButton.length > 0 ) {
				manager.settings.nextButton.on( 'click.viewportNav', function( evt ) {
					evt.preventDefault();
					const positionUpdate = manager.setFocalPoint( manager.eventContext.nextSlideNumber, 'forward' );
					if ( positionUpdate ) {
						manager.transitionToSlide( positionUpdate );
					}
					manager.restartAutoAdvanceOnInteraction();
				});
				manager.setupHoverInteraction( manager.settings.nextButton );
			}

			// Previous slide button
			if ( manager.settings.prevButton && manager.settings.prevButton.length > 0 ) {
				manager.settings.prevButton.on( 'click.viewportNav', function( evt ) {
					evt.preventDefault();
					const positionUpdate = manager.setFocalPoint( manager.eventContext.prevSlideNumber, 'backward' );
					if ( positionUpdate ) {
						manager.transitionToSlide( positionUpdate );
					}
					manager.restartAutoAdvanceOnInteraction();
				});
				manager.setupHoverInteraction( manager.settings.prevButton );
			}

			// Drag/Swipe functionality
			if ( manager.settings.enableDesktopDrag || manager.isTouchDevice() ) {
				manager.$slideWrapper.on( 'mousemove.viewportNav touchmove.viewportNav', manager.handleMoveEvent );
				manager.$slideWrapper.on( 'mousedown.viewportNav touchstart.viewportNav', manager.handleStartDrag );
				// Bind mouseup/touchend to document to ensure release detection even if cursor leaves wrapper.
				jQuery(document).on( 'mouseup.viewportNav touchend.viewportNav', manager.handleEndDrag );
			}

			// Window resize event (debounced)
			$window.on( 'resize.viewportNav', manager.debounceResize );

			// Start auto-advance if enabled.
			manager.startAdvance();
		};

		/**
		 * Sets up hover-based pause/resume for auto-advance on given elements.
		 * @param {jQuery} $elements - The elements to bind hover events to.
		 * @returns {void}
		 */
		manager.setupHoverInteraction = function( $elements ) {
			if ( manager.settings.autoAdvance ) {
				$elements.on( 'mouseenter.viewportNav', manager.pauseAdvance );
				$elements.on( 'mouseleave.viewportNav', manager.startAdvance );
			}
		};

		/**
		 * Handles the start of a drag or touch swipe.
		 * @param {Event} evt - The event object (mousedown or touchstart).
		 * @returns {void}
		 */
		manager.handleStartDrag = function( evt ) {
			// Prevent unwanted page scrolling during horizontal swipe if scroll position changed.
			if ( manager.initialPageScrollY !== window.pageYOffset ) {
				return;
			}

			evt.preventDefault(); // Prevent default browser actions like image dragging.
			manager.isDraggingActive = true;
			manager.$slideWrapper.removeClass( manager.settings.animateClass ); // Temporarily disable transitions for smooth dragging.

			// Get current transform value for reference.
			manager.currentTranslateX = manager.extractTransformValue( manager.$slideWrapper.css( manager.settings.cssTransformPrefix + 'transform' ) );

			// Determine event type (touch or mouse).
			const primaryEvent = manager._getPrimaryTouchEvent( evt );
			if ( primaryEvent ) {
				manager.dragStartPoint = { x: primaryEvent.pageX, y: primaryEvent.pageY, transformVal: manager.currentTranslateX };
			} else {
				// Fallback for non-touch (mouse).
				manager.dragStartPoint = { x: evt.clientX, y: evt.clientY, transformVal: manager.currentTranslateX };
			}
			manager.lastDragPoint = { ...manager.dragStartPoint }; // Initialize last point.

			// Immediately call move handler to update cursor coordinate.
			manager.handleMoveEvent( evt );
		};

		/**
		 * Handles ongoing drag or touch swipe movements.
		 * @param {Event} evt - The event object (mousemove or touchmove).
		 * @returns {void}
		 */
		manager.handleMoveEvent = function( evt ) {
			if ( !manager.isDraggingActive ) {
				return;
			}

			const primaryEvent = manager._getPrimaryTouchEvent( evt );
			if ( primaryEvent ) {
				manager.currentDragPoint = { x: primaryEvent.pageX, y: primaryEvent.pageY };
			} else {
				manager.currentDragPoint = { x: evt.clientX, y: evt.clientY };
			}

			// Calculate horizontal difference from drag start.
			manager.horizontalDragDiff = manager.dragStartPoint.x - manager.currentDragPoint.x;

			// Apply the new transform based on drag.
			const newTransformX = manager.dragStartPoint.transformVal - manager.horizontalDragDiff;
			manager.$slideWrapper.css( manager.settings.cssTransformPrefix + 'transform', `translate3d( ${newTransformX}px, 0, 0 )` );

			manager.lastDragPoint = { ...manager.currentDragPoint }; // Update last point.
		};

		/**
		 * Handles the end of a drag or touch swipe.
		 * @param {Event} evt - The event object (mouseup or touchend).
		 * @returns {void}
		 */
		manager.handleEndDrag = function( evt ) {
			if ( !manager.isDraggingActive ) {
				return;
			}

			// Only prevent default if it was a significant drag.
			if (Math.abs(manager.horizontalDragDiff) > 5) { // Threshold for preventing click
				evt.preventDefault();
			}

			manager.isDraggingActive = false;
			manager.$slideWrapper.addClass( manager.settings.animateClass ); // Re-enable transitions.

			let positionUpdate;
			const carouselWidth = manager.$element.outerWidth();
			const swipeThreshold = carouselWidth / manager.settings.dragSensitivity;

			if ( manager.horizontalDragDiff > 0 && manager.horizontalDragDiff > swipeThreshold ) {
				// Swipe left (next slide).
				positionUpdate = manager.setFocalPoint( manager.eventContext.nextSlideNumber, 'forward' );
			} else if ( manager.horizontalDragDiff < 0 && -(manager.horizontalDragDiff) > swipeThreshold ) {
				// Swipe right (previous slide).
				positionUpdate = manager.setFocalPoint( manager.eventContext.prevSlideNumber, 'backward' );
			} else if ( manager.settings.snapBackOnDragRelease ) {
				// If not enough drag, snap back to original position.
				manager.$slideWrapper.css( manager.settings.cssTransformPrefix + 'transform', `translate3d( ${manager.dragStartPoint.transformVal}px, 0, 0 )` );
			}
			manager.horizontalDragDiff = 0; // Reset.

			if ( positionUpdate ) {
				manager.transitionToSlide( positionUpdate );
			}
			manager.restartAutoAdvanceOnInteraction();
		};

		/**
		 * Helper to get the primary touch event object from a touch event.
		 * @param {Event} evt - The original event object.
		 * @returns {Touch|null} The primary touch object or null if not a touch event.
		 */
		manager._getPrimaryTouchEvent = function( evt ) {
			return evt.originalEvent && evt.originalEvent.touches && evt.originalEvent.touches.length > 0 ? evt.originalEvent.touches[0] : null;
		};

		/**
		 * Debounces the resize event to prevent excessive layout recalculations.
		 * @returns {void}
		 */
		manager.debounceResize = function() {
			clearTimeout( manager.layoutAdjustTimers[manager.settings.carouselInstanceId] );
			manager.layoutAdjustTimers[manager.settings.carouselInstanceId] = setTimeout( () => {
				manager.adjustLayout();
			}, manager.settings.resizeDebounceTime );
		};


		/**********************************************************
		 ********************* Auto-Advance ***********************
		 **********************************************************/

		/**
		 * Starts the auto-advance timer for the carousel.
		 * @returns {void}
		 */
		manager.startAdvance = function() {
			if ( !manager.settings.autoAdvance || manager.autoAdvanceTimers[manager.settings.carouselInstanceId] ) {
				return;
			}
			manager.autoAdvanceTimers[manager.settings.carouselInstanceId] = setTimeout( () => {
				const positionUpdate = manager.setFocalPoint( manager.eventContext.nextSlideNumber, 'forward' );
				if ( positionUpdate ) {
					manager.transitionToSlide( positionUpdate );
				}
				manager.startAdvance(); // Loop the auto-advance.
			}, manager.settings.autoAdvanceDelay );
		};

		/**
		 * Pauses the auto-advance timer for the carousel.
		 * @returns {void}
		 */
		manager.pauseAdvance = function() {
			clearTimeout( manager.autoAdvanceTimers[manager.settings.carouselInstanceId] );
			manager.autoAdvanceTimers[manager.settings.carouselInstanceId] = null;
		};

		/**
		 * Pauses and then restarts the auto-advance timer. Useful after user interaction.
		 * @returns {void}
		 */
		manager.restartAutoAdvanceOnInteraction = function() {
			manager.pauseAdvance();
			manager.startAdvance();
		};


		/**********************************************************
		 ********************* Browser Detection ******************
		 **********************************************************/

		/**
		 * Detects various browser capabilities and sets properties on the manager.
		 * This includes CSS transform prefix and legacy browser checks.
		 * @returns {void}
		 */
		manager.detectBrowserCapabilities = function() {
			const userAgent = navigator.userAgent.toLowerCase();
			manager.browserCapabilities.isIE = (userAgent.indexOf("msie") !== -1 || userAgent.indexOf("trident") !== -1);
			manager.browserCapabilities.isEdge = (userAgent.indexOf("edge") !== -1);

			// Determine CSS transform prefix.
			const el = document.createElement('div');
			const prefixes = ['webkit', 'moz', 'ms', 'o'];
			let cssPrefix = '';
			for (let i = 0; i < prefixes.length; i++) {
				if ( el.style[prefixes[i] + 'Transform'] !== undefined ) {
					cssPrefix = '-' + prefixes[i] + '-';
					break;
				}
			}
			manager.settings.cssTransformPrefix = cssPrefix;
		};

		/**
		 * Checks if the current device is likely a touch-enabled mobile device.
		 * @returns {boolean} True if it's a touch device.
		 */
		manager.isTouchDevice = function() {
			return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
		};

		/**
		 * Checks if the current browser is considered a legacy browser that might
		 * require jQuery's `.animate()` instead of CSS transforms.
		 * @returns {boolean} True if a legacy browser.
		 */
		manager.isLegacyBrowser = function() {
			// This can be expanded to include specific versions if needed.
			return manager.browserCapabilities.isIE && (userAgent.indexOf("msie 9") !== -1 || userAgent.indexOf("msie 8") !== -1 || userAgent.indexOf("msie 7") !== -1 || userAgent.indexOf("msie 6") !== -1);
		};


		/**********************************************************
		 ********************* Plugin Callbacks *******************
		 **********************************************************/

		/**
		 * Triggers the `onCarouselReady` callback defined in settings.
		 * This callback fires once the carousel is initialized but before first layout.
		 * @param {object} data - Data to pass to the callback.
		 * @returns {void}
		 */
		manager.onCarouselReady = function( data ) {
			if ( typeof manager.settings.onCarouselReady === 'function' ) {
				manager.settings.onCarouselReady( data );
			}
			manager.$element.trigger('viewportNav.ready', data);
		};

		/**
		 * Triggers the `onCarouselFullyLoaded` callback defined in settings.
		 * This callback fires after all initial setup and layout adjustments are complete.
		 * @param {object} data - Data to pass to the callback.
		 * @returns {void}
		 */
		manager.onCarouselFullyLoaded = function( data ) {
			if ( typeof manager.settings.onCarouselFullyLoaded === 'function' ) {
				manager.settings.onCarouselFullyLoaded( data );
			}
			manager.$element.trigger('viewportNav.loaded', data);
		};

		/**
		 * Triggers the `onSlideTransitionStart` callback.
		 * Fires before the carousel begins moving to a new slide.
		 * @param {object} data - Data to pass to the callback.
		 * @returns {void}
		 */
		manager.onSlideTransitionStart = function( data ) {
			if ( typeof manager.settings.onSlideTransitionStart === 'function' ) {
				manager.settings.onSlideTransitionStart( data );
			}
			manager.$element.trigger('viewportNav.transitionStart', data);
		};

		/**
		 * Triggers the `onSlideTransitionEnd` callback.
		 * Fires after a slide transition (animated or snap) has completed.
		 * @param {object} data - Data to pass to the callback.
		 * @returns {void}
		 */
		manager.onSlideTransitionEnd = function( data ) {
			if ( typeof manager.settings.onSlideTransitionEnd === 'function' ) {
				manager.settings.onSlideTransitionEnd( data );
			}
			manager.$element.trigger('viewportNav.transitionEnd', data);
		};

		/**
		 * Cleans up all event listeners and timers, and removes plugin data.
		 * @returns {void}
		 */
		manager.destroy = function() {
			manager.pauseAdvance();
			clearTimeout( manager.layoutAdjustTimers[manager.settings.carouselInstanceId] );
			clearTimeout( manager.animationDelayTimers[manager.settings.carouselInstanceId] );

			manager.$element.off('.viewportNav');
			manager.$slideWrapper.off('.viewportNav');
			jQuery(document).off('.viewportNav');
			$window.off('.viewportNav');

			manager.$slideWrapper.removeClass( manager.settings.animateClass );
			manager.$slideWrapper.css({
				'width': '',
				'margin-left': '',
				[manager.settings.cssTransformPrefix + 'transform']: ''
			});
			manager.$slideWrapper.html(manager.initialSlideMarkup); // Restore original content.

			manager.$element.removeData('viewportNav');
			manager.$element.trigger('viewportNav.destroyed');
		};

		// Initialize the carousel on instantiation.
		manager.initCarousel();
	};

	/**
	 * Default options for the viewportNav plugin.
	 * These can be overridden by passing an options object during initialization.
	 */
	jQuery.fn.viewportNav = function( options ) {
		return this.each( function() {
			if ( !jQuery.data( this, 'viewportNav' ) ) {
				jQuery.data( this, 'viewportNav', new ViewportNavController( this, options ) );
			}
		});
	};

	// Define default settings for the plugin.
	jQuery.fn.viewportNav.defaults = {
		carouselInstanceId: Date.now(), // Unique ID for timers, etc.
		focalClass: 'is-active', // Class applied to the currently focused slide.
		activeClass: 'is-active', // Class for active navigation elements.
		lazyLoadClass: '.lazy-load-content', // Selector for lazy-load triggers within slides.
		animateClass: 'is-animating', // Class added during CSS transitions.
		
		// DOM selectors for navigation.
		navigationLinks: '', // jQuery object for slide selectors (e.g., pagination dots).
		nextButton: '',      // jQuery object for the next slide button.
		prevButton: '',      // jQuery object for the previous slide button.

		// Animation settings.
		customAnimator: null,        // Function for custom animation logic (overrides default).
		forceJQueryAnimate: false,   // Force jQuery's .animate() even if CSS transforms are available.
		jQueryAnimateDuration: 400,  // Duration for jQuery animations.
		jQueryEaseEffect: 'easeInOutQuint', // Easing effect for jQuery animations (requires jQuery UI or similar).
		cssTransformPrefix: '',      // Automatically detected, or can be set manually.

		// Drag/Swipe settings.
		enableDesktopDrag: true,     // Enable dragging with mouse on desktop.
		dragSensitivity: 5,          // Coefficient for determining swipe threshold (carouselWidth / sensitivity).
		snapBackOnDragRelease: true, // If drag isn't enough for a slide change, snap back to original position.

		// Auto-advance settings.
		autoAdvance: false,          // Enable automatic slide advancement.
		autoAdvanceDelay: 3000,      // Delay between auto-advances in milliseconds.

		// Layout and responsiveness.
		responsiveWidths: null,      // Float (e.g., 0.8 for 80%) to set slide widths relative to container.
		resizeDebounceTime: 150,     // Delay in milliseconds for debouncing resize events.
		contentReplicationFactor: 5, // How many times the viewport width should be filled with slides to ensure infinite loop.
		alignmentOffset: 0,          // Additional pixel offset for slide alignment (e.g., for padding).
		alignFocal: 'center',        // How to align the focal slide: 'center' or 'start'.

		// Callbacks (functions that fire at specific points).
		onCarouselReady: null,
		onCarouselFullyLoaded: null,
		onSlideTransitionStart: null,
		onSlideTransitionEnd: null
	};

} )( jQuery );