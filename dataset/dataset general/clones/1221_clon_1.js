/*
 * Copyright (c) 2009 Victor Stanciu - http://www.victorstanciu.ro
 *
 * This software is provided under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Define the Carousel class, extending Abstract.
Carousel = Class.create(Abstract, {

	// Constructor method for the Carousel.
	initialize: function (scroller, slides, controls, options) {

		// Initialize internal state variables.
		this.scrolling	= false;
		this.scroller	= $(scroller); // Convert scroller to a Prototype extended element.
		this.slides		= slides;      // Store the collection of slides.
		this.controls	= controls;    // Store the collection of controls.

		// Merge default options with provided options.
		this.options    = Object.extend({
			duration:           1,                  // Default transition duration.
			auto:               false,              // Autoplay disabled by default.
			frequency:          3,                  // Autoplay frequency in seconds.
			visibleSlides:      1,                  // Number of slides visible at once.
			controlClassName:   'carousel-control', // Class for navigation controls.
			jumperClassName:    'carousel-jumper',  // Class for direct navigation jumpers.
			disabledClassName:  'carousel-disabled',// Class for disabled controls.
			selectedClassName:  'carousel-selected',// Class for selected jumper.
			circular:           false,              // Non-circular by default.
			wheel:              true,               // Mouse wheel navigation enabled.
			effect:             'scroll',           // Default effect is scroll.
			transition:         'sinoidal'          // Default transition type.
		}, options || {}); // Use an empty object if no options are provided.

		// If fade effect is used, force circular to true.
		if (this.options.effect == 'fade') {
			this.options.circular = true;
		}

		// Assign an index to each slide for easy reference.
		this.slides.each(function(slide, index) {
			slide._index = index; // Store original index on the slide element.
		});

		// Attach click event listeners to controls if they exist.
		if (this.controls) {
			this.controls.invoke('observe', 'click', this.click.bind(this));
		}

		// Set up mouse wheel observation if enabled.
		if (this.options.wheel) {
			this.scroller.observe('mousewheel', this.wheel.bindAsEventListener(this))
				.observe('DOMMouseScroll', this.wheel.bindAsEventListener(this)); // For Firefox.
		}

		// Start autoplay if enabled.
		if (this.options.auto) {
			this.start();
		}

		// Handle initial slide positioning if specified.
		if (this.options.initial) {
			var initialIndex = this.slides.indexOf($(this.options.initial)); // Find index of initial slide.

			// Adjust initial index for multiple visible slides.
			if (initialIndex > (this.options.visibleSlides - 1) && this.options.visibleSlides > 1) {
				if (initialIndex > this.slides.length - (this.options.visibleSlides + 1)) {
					initialIndex = this.slides.length - this.options.visibleSlides;
				}
			}
			this.moveTo(this.slides[initialIndex]); // Move to the calculated initial slide.
		}
	}, // End of initialize method.

	// Handles click events on carousel controls.
	click: function (event) {
		this.stop(); // Stop any ongoing autoplay.

		var element = event.findElement('a'); // Find the anchor element that was clicked.

		// Proceed only if the clicked element is not disabled.
		if (!element.hasClassName(this.options.disabledClassName)) {
			// Check if it's a standard control (prev/next/first/last).
			if (element.hasClassName(this.options.controlClassName)) {
				eval("this." + element.rel + "()"); // Execute the method specified in 'rel' attribute.
			} // Check if it's a jumper control (direct slide navigation).
			else if (element.hasClassName(this.options.jumperClassName)) {
				this.moveTo(element.rel); // Move to the slide specified in 'rel'.

				// Update selected class for jumpers if enabled.
				if (this.options.selectedClassName) {
					this.controls.invoke('removeClassName', this.options.selectedClassName); // Remove from all.
					element.addClassName(this.options.selectedClassName); // Add to current.
				}
			}
		}

		this.deactivateControls(); // Temporarily deactivate controls to prevent rapid clicks.

		event.stop(); // Prevent default link behavior.
	}, // End of click method.

	// Moves the carousel to a specified element (slide).
	moveTo: function (element) {
		// Execute beforeMove callback if defined.
		if (this.options.beforeMove && (typeof this.options.beforeMove == 'function')) {
			this.options.beforeMove();
		}

		// Update previous and current slide references.
		this.previous = this.current ? this.current : this.slides[0];
		this.current  = $(element); // Ensure element is a Prototype extended element.

		// Get offsets for scrolling calculation.
		var scrollerOffset = this.scroller.cumulativeOffset();
		var elementOffset  = this.current.cumulativeOffset();

		// Cancel any ongoing scrolling effect.
		if (this.scrolling) {
			this.scrolling.cancel();
		}

		// Determine the effect to use for moving.
		switch (this.options.effect) {
			case 'fade': // Fade effect implementation.
				this.scrolling = new Effect.Opacity(this.scroller, {
					from:   1.0, // Start fully opaque.
					to:     0,   // Fade out to transparent.
					duration: this.options.duration,
					afterFinish: (function () { // Callback after fade out.
						// Adjust scroll position instantly.
						this.scroller.scrollLeft = elementOffset[0] - scrollerOffset[0];
						this.scroller.scrollTop  = elementOffset[1] - scrollerOffset[1];

						// Fade back in.
						new Effect.Opacity(this.scroller, {
							from: 0,   // Start transparent.
							to: 1.0, // Fade in to fully opaque.
							duration: this.options.duration,
							afterFinish: (function () { // Callback after fade in.
								if (this.controls) {
									this.activateControls(); // Re-enable controls.
								}
								// Execute afterMove callback.
								if (this.options.afterMove && (typeof this.options.afterMove == 'function')) {
									this.options.afterMove();
								}
							}).bind(this) // Bind 'this' to the callback.
						});
					}).bind(this) // Bind 'this' to the outer callback.
				});
				break;
			case 'scroll': // Scroll effect implementation (default).
			default:
				var transition;
				// Select transition function based on options.
				switch (this.options.transition) {
					case 'spring':
						transition = Effect.Transitions.spring;
						break;
					case 'sinoidal':
					default:
						transition = Effect.Transitions.sinoidal;
						break;
				}

				// Create a new SmoothScroll effect.
				this.scrolling = new Effect.SmoothScroll(this.scroller, {
					duration: this.options.duration,
					x: (elementOffset[0] - scrollerOffset[0]), // Target X scroll position.
					y: (elementOffset[1] - scrollerOffset[1]), // Target Y scroll position.
					transition: transition,
					afterFinish: (function () { // Callback after scrolling finishes.
						if (this.controls) {
							this.activateControls(); // Re-enable controls.
						}
						// Execute afterMove callback.
						if (this.options.afterMove && (typeof this.options.afterMove == 'function')) {
							this.options.afterMove();
						}
						this.scrolling = false; // Reset scrolling state.
					}).bind(this) // Bind 'this' to the callback.
				});
				break;
		}

		return false; // Indicate that the default action was handled.
	}, // End of moveTo method.

	// Moves the carousel to the previous slide.
	prev: function () {
		var currentIndex;
		var prevIndex;

		if (this.current) {
			currentIndex = this.current._index;
			// Calculate previous index, handling circular option.
			prevIndex = (currentIndex == 0) ? (this.options.circular ? this.slides.length - 1 : 0) : currentIndex - 1;
		} else {
			// If no current slide, go to last slide if circular, else first.
			prevIndex = (this.options.circular ? this.slides.length - 1 : 0);
		}

		// Special handling for circular scroll to wrap around smoothly.
		if (prevIndex == (this.slides.length - 1) && this.options.circular && this.options.effect != 'fade') {
			// Instantly jump to the end, then scroll back from there.
			this.scroller.scrollLeft =  (this.slides.length - 1) * this.slides.first().getWidth();
			this.scroller.scrollTop =  (this.slides.length - 1) * this.slides.first().getHeight();
			prevIndex = this.slides.length - 2; // Adjust target to be the second-to-last slide.
		}

		this.moveTo(this.slides[prevIndex]); // Move to the calculated previous slide.
	}, // End of prev method.

	// Moves the carousel to the next slide.
	next: function () {
		var currentIndex;
		var nextIndex;

		if (this.current) {
			currentIndex = this.current._index;
			// Calculate next index, handling circular option.
			nextIndex = (this.slides.length - 1 == currentIndex) ? (this.options.circular ? 0 : currentIndex) : currentIndex + 1;
		} else {
			// If no current slide, go to the second slide.
			nextIndex = 1;
		}

		// Special handling for circular scroll to wrap around smoothly.
		if (nextIndex == 0 && this.options.circular && this.options.effect != 'fade') {
			// Instantly jump to the beginning, then scroll forward from there.
			this.scroller.scrollLeft = 0;
			this.scroller.scrollTop  = 0;
			nextIndex = 1; // Adjust target to be the second slide.
		}

		// Adjust next index if it would go beyond the last visible slide.
		if (nextIndex > this.slides.length - (this.options.visibleSlides + 1)) {
			nextIndex = this.slides.length - this.options.visibleSlides;
		}

		this.moveTo(this.slides[nextIndex]); // Move to the calculated next slide.
	}, // End of next method.

	// Moves the carousel to the first slide.
	first: function () {
		this.moveTo(this.slides[0]);
	}, // End of first method.

	// Moves the carousel to the last slide.
	last: function () {
		this.moveTo(this.slides[this.slides.length - 1]);
	}, // End of last method.

	// Toggles between the current and previously viewed slide.
	toggle: function () {
		if (this.previous) {
			this.moveTo(this.slides[this.previous._index]);
		} else {
			return false; // No previous slide to toggle to.
		}
	}, // End of toggle method.

	// Stops the autoplay timer.
	stop: function () {
		if (this.timer) {
			clearTimeout(this.timer);
		}
	}, // End of stop method.

	// Starts the autoplay.
	start: function () {
		this.periodicallyUpdate(); // Begin periodic updates.
	}, // End of start method.

	// Pauses autoplay and activates controls.
	pause: function () {
		this.stop(); // Stop autoplay.
		this.activateControls(); // Re-enable controls.
	}, // End of pause method.

	// Resumes autoplay.
	resume: function (event) {
		if (event) {
			// Check if the mouse is still within the carousel area.
			var related = event.relatedTarget || event.toElement;
			if (!related || (!this.slides.include(related) && !this.slides.any(function (slide) { return related.descendantOf(slide); }))) {
				this.start(); // Resume autoplay if mouse left the carousel.
			}
		} else {
			this.start(); // Resume unconditionally if no event is provided.
		}
	}, // End of resume method.

	// Periodically updates the carousel (for autoplay).
	periodicallyUpdate: function () {
		if (this.timer != null) {
			clearTimeout(this.timer); // Clear any existing timer.
			this.next(); // Move to the next slide.
		}
		// Set a new timer for the next update.
		this.timer = setTimeout(this.periodicallyUpdate.bind(this), this.options.frequency * 1000);
	}, // End of periodicallyUpdate method.

	// Handles mouse wheel events for navigation.
	wheel: function (event) {
		event.cancelBubble = true; // Stop event bubbling.
		event.stop();              // Prevent default scroll behavior.

		var delta = 0;
		if (!event) {
			event = window.event; // Get event object for IE.
		}
		if (event.wheelDelta) {
			delta = event.wheelDelta / 120; // Standard wheelDelta.
		} else if (event.detail) {
			delta = -event.detail / 3; // Firefox detail.
		}

		// Only navigate if not currently scrolling.
		if (!this.scrolling) {
			this.deactivateControls(); // Temporarily disable controls.
			if (delta > 0) {
				this.prev(); // Scroll up/forward -> previous slide.
			} else {
				this.next(); // Scroll down/backward -> next slide.
			}
		}

		return Math.round(delta); // Return rounded delta (Safari fix).
	}, // End of wheel method.

	// Deactivates all carousel controls.
	deactivateControls: function () {
		this.controls.invoke('addClassName', this.options.disabledClassName);
	}, // End of deactivateControls method.

	// Activates all carousel controls.
	activateControls: function () {
		this.controls.invoke('removeClassName', this.options.disabledClassName);
	} // End of activateControls method.

}); // End of Carousel class definition.


// --- Effect.SmoothScroll Definition ---
// A custom Prototype effect for smooth scrolling.
Effect.SmoothScroll = Class.create();
Object.extend(Object.extend(Effect.SmoothScroll.prototype, Effect.Base.prototype), {

	// Constructor for Effect.SmoothScroll.
	initialize: function (element) {
		this.element = $(element); // Ensure element is a Prototype extended element.
		// Merge default options with provided options.
		var options = Object.extend({ x: 0, y: 0, mode: 'absolute' } , arguments[1] || {});
		this.start(options); // Start the effect.
	}, // End of initialize method.

	// Setup phase of the effect.
	setup: function () {
		// Handle continuous scrolling by duplicating content if enabled.
		if (this.options.continuous && !this.element._ext) {
			this.element.cleanWhitespace(); // Remove whitespace nodes.
			this.element._ext = true;       // Mark as extended.
			this.element.appendChild(this.element.firstChild); // Append first child to end.
		}

		// Store initial scroll positions.
		this.originalLeft = this.element.scrollLeft;
		this.originalTop  = this.element.scrollTop;

		// Adjust target coordinates if mode is 'absolute'.
		if (this.options.mode == 'absolute') {
			this.options.x -= this.originalLeft;
			this.options.y -= this.originalTop;
		}
	}, // End of setup method.

	// Update phase of the effect (called during animation).
	update: function (position) {
		// Calculate and apply new scroll positions based on animation progress.
		this.element.scrollLeft = this.options.x * position + this.originalLeft;
		this.element.scrollTop  = this.options.y * position + this.originalTop;
	} // End of update method.

}); // End of Effect.SmoothScroll class definition.