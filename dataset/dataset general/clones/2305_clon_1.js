//
// jQuery SmoothDivScroll 1.3 - A jQuery plugin for smooth horizontal scrolling functionality.
//
// Copyright (c) 2013 Thomas Kahn. All rights reserved.
// Licensed under the GPL license.
//
// Official website: http://www.smoothdivscroll.com/
//
// Required Dependencies:
//
//   1. jquery-1.10.2.min.js
//      (It's recommended to use https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js or a later version.)
//
//   2. jquery-ui-1.10.3.custom.min
//      (Create a custom download from http://jqueryui.com/download.
//       Ensure only "Widget" and "Effects Core" components are selected.
//       Place the downloaded file in your project's JavaScript directory.)
//
//   3. jquery.mousewheel.min.js
//      (Provides mousewheel scrolling capabilities.
//       Download the latest version from https://github.com/brandonaaron/jquery-mousewheel.)
//
//   4. jquery.kinetic.min.js
//      (Enables scrolling via dragging, particularly useful for touch-enabled devices.
//       Download the latest version from https://github.com/davetayls/jquery.kinetic.)
//
//
(function ($) {
	// Define the jQuery UI widget for SmoothDivScroll.
	$.widget("thomaskahn.smoothDivScroll", {

		// Default configuration options for the plugin.
		options: {
			// CSS classes used for internal elements managed by Smooth Div Scroll.
			scrollingHotSpotLeftClass:        "scrollingHotSpotLeft",        // String: Class for the left hotspot.
			scrollingHotSpotRightClass:       "scrollingHotSpotRight",       // String: Class for the right hotspot.
			scrollingHotSpotLeftVisibleClass: "scrollingHotSpotLeftVisible", // String: Class when left hotspot is visible.
			scrollingHotSpotRightVisibleClass:"scrollingHotSpotRightVisible",// String: Class when right hotspot is visible.
			scrollableAreaClass:              "scrollableArea",              // String: Class for the content area.
			scrollWrapperClass:               "scrollWrapper",               // String: Class for the scrollable wrapper.

			// Miscellaneous settings affecting plugin behavior.
			hiddenOnStart:                    false,                         // Boolean: If true, the scroller is hidden initially.
			getContentOnLoad:                 {},                            // Object: Configuration for dynamic content loading on init.
			countOnlyClass:                   "",                            // String: A class name to count only specific children.
			startAtElementId:                 "",                            // String: ID of an element to scroll to on start.

			// Hotspot scrolling parameters.
			hotSpotScrolling:                 true,                          // Boolean: Enable/disable hotspot scrolling.
			hotSpotScrollingStep:             15,                            // Pixels: Amount to scroll per interval.
			hotSpotScrollingInterval:         10,                            // Milliseconds: Interval between scroll steps.
			hotSpotMouseDownSpeedBooster:     3,                             // Integer: Multiplier for scroll speed when mouse button is down.
			visibleHotSpotBackgrounds:        "hover",                       // String: When to show hotspot backgrounds ("always", "onStart", "hover", or empty for none).
			hotSpotsVisibleTime:              5000,                          // Milliseconds: Duration hotspots remain visible if `onStart`.
			easingAfterHotSpotScrolling:      true,                          // Boolean: Apply easing animation after hotspot scrolling stops.
			easingAfterHotSpotScrollingDistance: 10,                         // Pixels: Distance for easing animation.
			easingAfterHotSpotScrollingDuration: 300,                        // Milliseconds: Duration of easing animation.
			easingAfterHotSpotScrollingFunction: "easeOutQuart",             // String: Easing function to use.

			// Mousewheel scrolling parameters.
			mousewheelScrolling:              "",                            // String: Direction for mousewheel scrolling ("vertical", "horizontal", "allDirections", or empty for none).
			mousewheelScrollingStep:          70,                            // Pixels: Amount to scroll per mousewheel tick.
			easingAfterMouseWheelScrolling:   true,                          // Boolean: Apply easing animation after mousewheel scrolling.
			easingAfterMouseWheelScrollingDuration: 300,                     // Milliseconds: Duration of easing animation.
			easingAfterMouseWheelScrollingFunction: "easeOutQuart",         // String: Easing function to use.

			// Manual scrolling settings (applies to both hotspot and mousewheel).
			manualContinuousScrolling:        false,                         // Boolean: Enable continuous loop scrolling for manual interaction.

			// Autoscrolling parameters.
			autoScrollingMode:                "",                            // String: Mode for auto scrolling ("always", "onStart", or empty for none).
			autoScrollingDirection:           "endlessLoopRight",            // String: Direction for auto scrolling ("right", "left", "backAndForth", "endlessLoopRight", "endlessLoopLeft").
			autoScrollingStep:                1,                             // Pixels: Amount to scroll per auto-scroll interval.
			autoScrollingInterval:            10,                            // Milliseconds: Interval between auto-scroll steps.

			// Touch scrolling settings.
			touchScrolling:                   false,                         // Boolean: Enable touch scrolling via jquery.kinetic.js.

			// Easing settings for programmatic scrollToElement method.
			scrollToAnimationDuration:        1000,                          // Milliseconds: Duration of scroll-to-element animation.
			scrollToEasingFunction:           "easeOutQuart"                 // String: Easing function for scroll-to-element animation.
		},

		/**
		 * _create method is called once when the widget is initialized.
		 * It sets up the DOM structure, initializes data, and attaches event handlers.
		 */
		_create: function () {
			var self = this,
				o    = this.options,
				el   = this.element;

			// Initialize data variables for scroller elements.
			// These will hold jQuery objects for easier access.
			el.data("scrollWrapper",          el.find("." + o.scrollWrapperClass));
			el.data("scrollingHotSpotRight",  el.find("." + o.scrollingHotSpotRightClass));
			el.data("scrollingHotSpotLeft",   el.find("." + o.scrollingHotSpotLeftClass));
			el.data("scrollableArea",         el.find("." + o.scrollableAreaClass));

			// Check for existing elements and create missing ones.
			// Hotspots are handled first to ensure they are properly detached/re-attached.

			// Detach any pre-existing hotspots from the DOM.
			if (el.data("scrollingHotSpotRight").length > 0) {
				el.data("scrollingHotSpotRight").detach();
			}

			if (el.data("scrollingHotSpotLeft").length > 0) {
				el.data("scrollingHotSpotLeft").detach();
			}


			// --- DOM Structure Creation/Correction ---

			// Scenario 1: Both scrollableArea and scrollWrapper are missing.
			if (el.data("scrollableArea").length === 0 && el.data("scrollWrapper").length === 0) {
				el.wrapInner("<div class='" + o.scrollableAreaClass + "'>")
				  .wrapInner("<div class='" + o.scrollWrapperClass + "'>");

				// Re-fetch the newly created elements.
				el.data("scrollWrapper",  el.find("." + o.scrollWrapperClass));
				el.data("scrollableArea", el.find("." + o.scrollableAreaClass));
			}
			// Scenario 2: Only the scrollWrapper is missing.
			else if (el.data("scrollWrapper").length === 0) {
				el.wrapInner("<div class='" + o.scrollWrapperClass + "'>");
				// Re-fetch the newly created wrapper.
				el.data("scrollWrapper", el.find("." + o.scrollWrapperClass));
			}
			// Scenario 3: Only the scrollableArea is missing.
			else if (el.data("scrollableArea").length === 0) {
				el.data("scrollWrapper").wrapInner("<div class='" + o.scrollableAreaClass + "'>");
				// Re-fetch the newly created area.
				el.data("scrollableArea", el.find("." + o.scrollableAreaClass));
			}


			// Re-insert or create the right hotspot.
			if (el.data("scrollingHotSpotRight").length === 0) {
				el.prepend("<div class='" + o.scrollingHotSpotRightClass + "'></div>");
				el.data("scrollingHotSpotRight", el.find("." + o.scrollingHotSpotRightClass));
			} else {
				el.prepend(el.data("scrollingHotSpotRight")); // Re-attach existing hotspot.
			}

			// Re-insert or create the left hotspot.
			if (el.data("scrollingHotSpotLeft").length === 0) {
				el.prepend("<div class='" + o.scrollingHotSpotLeftClass + "'></div>");
				el.data("scrollingHotSpotLeft", el.find("." + o.scrollingHotSpotLeftClass));
			} else {
				el.prepend(el.data("scrollingHotSpotLeft")); // Re-attach existing hotspot.
			}


			// Initialize internal state variables in the element's data storage.
			el.data("speedBooster",                  1);
			el.data("scrollXPos",                    0);
			el.data("hotSpotWidth",                  el.data("scrollingHotSpotLeft").innerWidth());
			el.data("scrollableAreaWidth",           0);
			el.data("startingPosition",              0);
			el.data("rightScrollingInterval",        null);
			el.data("leftScrollingInterval",         null);
			el.data("autoScrollingInterval",         null);
			el.data("hideHotSpotBackgroundsInterval",null);
			el.data("previousScrollLeft",            0);
			el.data("pingPongDirection",             "right");
			el.data("getNextElementWidth",           true);
			el.data("swapAt",                        null);
			el.data("startAtElementHasNotPassed",    true);
			el.data("swappedElement",                null);
			el.data("originalElements",              el.data("scrollableArea").children(o.countOnlyClass));
			el.data("visible",                       true);
			el.data("enabled",                       true);
			el.data("scrollableAreaHeight",          el.data("scrollableArea").height());
			el.data("scrollerOffset",                el.offset());

			/**********************************************************************************
			 *                    SET UP EVENTS FOR TOUCH SCROLLING                           *
			 **********************************************************************************/
			// If touch scrolling is enabled and the widget is active.
			if (o.touchScrolling && el.data("enabled")) {
				// Utilize jquery.kinetic.js for touch-based scrolling.
				// Vertical scrolling is explicitly disabled for this horizontal scroller.
				el.data("scrollWrapper").kinetic({
					y: false, // Disable vertical movement.
					moved: function (settings) {
						// Check for continuous loop scrolling during touch movement.
						if (o.manualContinuousScrolling) {
							if (el.data("scrollWrapper").scrollLeft() <= 0) {
								self._checkContinuousSwapLeft();
							} else {
								self._checkContinuousSwapRight();
							}
						}
						// Trigger a callback for touch movement.
						self._trigger("touchMoved");
					},
					stopped: function (settings) {
						// Stop any active animations on the scroll wrapper.
						el.data("scrollWrapper").stop(true, false);

						// Stop any auto-scrolling that might be active.
						self.stopAutoScrolling();

						// Trigger a callback when touch scrolling stops.
						self._trigger("touchStopped");
					}
				});
			}

			/**********************************************************************************
			 *                      SET UP EVENTS FOR SCROLLING RIGHT                         *
			 **********************************************************************************/
			// Determine the scrolling speed based on mouse position within the right hotspot.
			el.data("scrollingHotSpotRight").bind("mousemove", function (e) {
				if (o.hotSpotScrolling) {
					// Calculate relative X position within the hotspot.
					var x = e.pageX - $(this).offset().left;
					el.data("scrollXPos", Math.round((x / el.data("hotSpotWidth")) * o.hotSpotScrollingStep));

					// Ensure scrollXPos is at least 1 to prevent division by zero or stagnant scrolling.
					if (el.data("scrollXPos") === Infinity || el.data("scrollXPos") < 1) {
						el.data("scrollXPos", 1);
					}
				}
			});

			// Handler for mouse entering the right hotspot area.
			el.data("scrollingHotSpotRight").bind("mouseover", function () {
				if (o.hotSpotScrolling) {
					// Halt any ongoing animations on the scroll wrapper immediately.
					el.data("scrollWrapper").stop(true, false);

					// Stop any active auto-scrolling.
					self.stopAutoScrolling();

					// Start the continuous scrolling interval to the right.
					el.data("rightScrollingInterval", setInterval(function () {
						if (el.data("scrollXPos") > 0 && el.data("enabled")) {
							// Update scroll position.
							el.data("scrollWrapper").scrollLeft(el.data("scrollWrapper").scrollLeft() + (el.data("scrollXPos") * el.data("speedBooster")));

							// Handle continuous loop scrolling if enabled.
							if (o.manualContinuousScrolling) {
								self._checkContinuousSwapRight();
							}

							// Update hotspot visibility.
							self._showHideHotSpots();
						}
					}, o.hotSpotScrollingInterval)); // Use the configured interval.

					// Trigger a custom event.
					self._trigger("mouseOverRightHotSpot");
				}
			});

			// Handler for mouse leaving the right hotspot area.
			el.data("scrollingHotSpotRight").bind("mouseout", function () {
				if (o.hotSpotScrolling) {
					clearInterval(el.data("rightScrollingInterval")); // Stop the scrolling interval.
					el.data("scrollXPos", 0); // Reset scroll speed.

					// Apply easing animation after scrolling stops, if configured.
					if (o.easingAfterHotSpotScrolling && el.data("enabled")) {
						el.data("scrollWrapper").animate({
							scrollLeft: el.data("scrollWrapper").scrollLeft() + o.easingAfterHotSpotScrollingDistance
						}, {
							duration: o.easingAfterHotSpotScrollingDuration,
							easing:   o.easingAfterHotSpotScrollingFunction
						});
					}
				}
			});

			// Increase scrolling speed when mouse button is pressed over the right hotspot.
			el.data("scrollingHotSpotRight").bind("mousedown", function () {
				el.data("speedBooster", o.hotSpotMouseDownSpeedBooster);
			});

			// Reset scrolling speed booster when mouse button is released anywhere on the page.
			$("body").bind("mouseup", function () {
				el.data("speedBooster", 1); // Reset to default speed.
			});

			/**********************************************************************************
			 *                      SET UP EVENTS FOR SCROLLING LEFT                          *
			 **********************************************************************************/
			// Determine the scrolling speed based on mouse position within the left hotspot.
			el.data("scrollingHotSpotLeft").bind("mousemove", function (e) {
				if (o.hotSpotScrolling) {
					// Calculate relative X position inversely within the hotspot.
					var x = el.data("hotSpotWidth") - (e.pageX - $(this).offset().left);

					el.data("scrollXPos", Math.round((x / el.data("hotSpotWidth")) * o.hotSpotScrollingStep));

					// Ensure scrollXPos is at least 1.
					if (el.data("scrollXPos") === Infinity || el.data("scrollXPos") < 1) {
						el.data("scrollXPos", 1);
					}
				}
			});

			// Handler for mouse entering the left hotspot area.
			el.data("scrollingHotSpotLeft").bind("mouseover", function () {
				if (o.hotSpotScrolling) {
					// Halt any ongoing animations.
					el.data("scrollWrapper").stop(true, false);

					// Stop auto-scrolling.
					self.stopAutoScrolling();

					// Start the continuous scrolling interval to the left.
					el.data("leftScrollingInterval", setInterval(function () {
						if (el.data("scrollXPos") > 0 && el.data("enabled")) {
							// Update scroll position.
							el.data("scrollWrapper").scrollLeft(el.data("scrollWrapper").scrollLeft() - (el.data("scrollXPos") * el.data("speedBooster")));

							// Handle continuous loop scrolling.
							if (o.manualContinuousScrolling) {
								self._checkContinuousSwapLeft();
							}

							// Update hotspot visibility.
							self._showHideHotSpots();
						}
					}, o.hotSpotScrollingInterval));

					// Trigger a custom event.
					self._trigger("mouseOverLeftHotSpot");
				}
			});

			// Handler for mouse leaving the left hotspot area.
			el.data("scrollingHotSpotLeft").bind("mouseout", function () {
				if (o.hotSpotScrolling) {
					clearInterval(el.data("leftScrollingInterval")); // Stop the scrolling interval.
					el.data("scrollXPos", 0); // Reset scroll speed.

					// Apply easing animation after scrolling stops.
					if (o.easingAfterHotSpotScrolling && el.data("enabled")) {
						el.data("scrollWrapper").animate({
							scrollLeft: el.data("scrollWrapper").scrollLeft() - o.easingAfterHotSpotScrollingDistance
						}, {
							duration: o.easingAfterHotSpotScrollingDuration,
							easing:   o.easingAfterHotSpotScrollingFunction
						});
					}
				}
			});

			// Increase scrolling speed when mouse button is pressed over the left hotspot.
			el.data("scrollingHotSpotLeft").bind("mousedown", function () {
				el.data("speedBooster", o.hotSpotMouseDownSpeedBooster);
			});

			// Note: mouseup handler is bound to 'body' once to reset speed booster.

			/**********************************************************************************
			 *                   SET UP EVENT FOR MOUSEWHEEL SCROLLING                        *
			 **********************************************************************************/
			el.data("scrollableArea").mousewheel(function (event, delta, deltaX, deltaY) {

				// Only proceed if the scroller is enabled and mousewheel scrolling is configured.
				if (el.data("enabled") && o.mousewheelScrolling.length > 0) {
					var pixels;

					// The 'delta' values are typically positive for scrolling up/left and negative for down/right.
					// We multiply by -1 to make the visual scroll direction intuitive (down/right -> scrolls right).

					// Handle vertical mousewheel scrolling.
					if (o.mousewheelScrolling === "vertical" && deltaY !== 0) {
						self.stopAutoScrolling(); // Stop any auto-scrolling.
						event.preventDefault();    // Prevent default browser scrolling.
						pixels = Math.round((o.mousewheelScrollingStep * deltaY) * -1);
						self.move(pixels);
					}
					// Handle horizontal mousewheel scrolling.
					else if (o.mousewheelScrolling === "horizontal" && deltaX !== 0) {
						self.stopAutoScrolling(); // Stop any auto-scrolling.
						event.preventDefault();    // Prevent default browser scrolling.
						pixels = Math.round((o.mousewheelScrollingStep * deltaX) * -1);
						self.move(pixels);
					}
					// Handle all-direction mousewheel scrolling (uses combined delta).
					else if (o.mousewheelScrolling === "allDirections") {
						self.stopAutoScrolling(); // Stop any auto-scrolling.
						event.preventDefault();    // Prevent default browser scrolling.
						pixels = Math.round((o.mousewheelScrollingStep * delta) * -1);
						self.move(pixels);
					}
				}
			});

			// Prevent mousewheel events from propagating when over hotspots, if mousewheel scrolling is active.
			if (o.mousewheelScrolling) {
				el.data("scrollingHotSpotLeft").add(el.data("scrollingHotSpotRight")).mousewheel(function (event) {
					event.preventDefault(); // Disable default mousewheel action over hotspots.
				});
			}

			/**********************************************************************************
			 *                  SET UP EVENT FOR RESIZING THE BROWSER WINDOW                  *
			 **********************************************************************************/
			$(window).bind("resize", function () {
				self._showHideHotSpots();       // Re-evaluate hotspot visibility on resize.
				self._trigger("windowResized"); // Trigger a custom event.
			});

			/**********************************************************************************
			 *                 FETCHING CONTENT ON INITIALIZATION                             *
			 **********************************************************************************/
			// If `getContentOnLoad` option is configured, execute the specified method.
			if (!(jQuery.isEmptyObject(o.getContentOnLoad))) {
				self[o.getContentOnLoad.method](
					o.getContentOnLoad.content,
					o.getContentOnLoad.manipulationMethod,
					o.getContentOnLoad.addWhere,
					o.getContentOnLoad.filterTag
				);
			}

			// Hide the scroller initially if `hiddenOnStart` is true.
			if (o.hiddenOnStart) {
				self.hide();
			}

			/**********************************************************************************
			 *                                AUTOSCROLLING                                   *
			 **********************************************************************************/
			// The `$(window).load` event is crucial here because element widths might not be
			// correctly calculated until all images and resources are loaded, especially in Chrome.
			// This ensures accurate scrollable area width calculations and correct auto-scrolling start.
			$(window).load(function () {

				// Recalculate the scrollable area width if the scroller is not hidden.
				if (!(o.hiddenOnStart)) {
					self.recalculateScrollableArea();
				}

				// Start auto-scrolling if enabled and not hidden.
				if ((o.autoScrollingMode.length > 0) && !(o.hiddenOnStart)) {
					self.startAutoScrolling();
				}

				// Handle initial visibility of hotspot backgrounds based on configuration.
				if (o.autoScrollingMode !== "always") {

					switch (o.visibleHotSpotBackgrounds) {
						case "always":
							self.showHotSpotBackgrounds();
							break;

						case "onStart":
							self.showHotSpotBackgrounds();
							el.data("hideHotSpotBackgroundsInterval", setTimeout(function () {
								self.hideHotSpotBackgrounds(250); // Hide after a delay.
							}, o.hotSpotsVisibleTime));
							break;

						case "hover":
							// Show on mouse enter, hide on mouse leave.
							el.mouseenter(function (event) {
								if (o.hotSpotScrolling) {
									event.stopPropagation();
									self.showHotSpotBackgrounds(250);
								}
							}).mouseleave(function (event) {
								if (o.hotSpotScrolling) {
									event.stopPropagation();
									self.hideHotSpotBackgrounds(250);
								}
							});
							break;

						default:
							// No specific action for other cases (e.g., empty string).
							break;
					}
				}

				// Final check and update of hotspot visibility.
				self._showHideHotSpots();

				// Trigger a custom event to indicate setup completion.
				self._trigger("setupComplete");

			}); // End of $(window).load

		}, // End of _create method.

		/**
		 * _init method is called when the widget is initialized or re-initialized
		 * without arguments. It recalculates the scrollable area and updates hotspots.
		 */
		_init: function () {
			var self = this,
				el   = this.element;

			// Recalculate the total width of elements within the scrollable area.
			self.recalculateScrollableArea();

			// Determine which hotspots should be visible based on content width.
			self._showHideHotSpots();

			// Trigger a callback event to signal initialization completion.
			self._trigger("initializationComplete");
		},

		/**
		 * _setOption method handles changes to widget options after initialization.
		 * It ensures that the widget reacts appropriately to dynamic option updates.
		 * @param {string} key - The name of the option being changed.
		 * @param {*} value - The new value for the option.
		 */
		_setOption: function (key, value) {
			var self = this,
				o    = this.options,
				el   = this.element;

			// Always update the option value first.
			o[key] = value;

			// Specific handling for 'hotSpotScrolling' option.
			if (key === "hotSpotScrolling") {
				if (value === true) {
					self._showHideHotSpots(); // Re-evaluate hotspot visibility.
				} else {
					// Hide both hotspots if scrolling is disabled.
					el.data("scrollingHotSpotLeft").hide();
					el.data("scrollingHotSpotRight").hide();
				}
			}
			// Ensure certain options are parsed as integers to avoid issues.
			else if (key === "autoScrollingStep" ||
				key === "easingAfterHotSpotScrollingDistance" ||
				key === "easingAfterHotSpotScrollingDuration" ||
				key === "easingAfterMouseWheelScrollingDuration") {
				o[key] = parseInt(value, 10);
			}
			// Special handling for 'autoScrollingInterval' to restart auto-scrolling.
			else if (key === "autoScrollingInterval") {
				o[key] = parseInt(value, 10);
				self.startAutoScrolling(); // Restart auto-scrolling with new interval.
			}

		} // End of _setOption method.

	}); // End of $.widget definition.

})(jQuery); // End of IIFE.