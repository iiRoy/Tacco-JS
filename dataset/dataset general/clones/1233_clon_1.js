/* This file contains the implementation for the jQuery Mobile Slider Button plugin.
 * It's a Type I clone, meaning only whitespace and comments have been altered. */

// JSLint and JSHint directives for code quality and compatibility checks.
/*jslint white: true, vars: true, browser: true, todo: true */
/*jshint camelcase:true, plusplus:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, maxerr:100, white:false, onevar:false */
/*global jQuery:true, $:true */

// Project information:
// jQuery Mobile Slider Button 2.0.1
// Developed by Jochen Ulrich
// Repository: http://github.com/j-ulrich/jquery-sliderbutton
// Copyright (c) 2013 Jochen Ulrich <jochenulrich@t-online.de>
// Licensed under the MIT license (refer to MIT-LICENSE.txt for details).

/**
 * @file This module defines the jQuery Mobile Slider Button widget.
 * @version 2.0.0
 * @copyright 2013 Jochen Ulrich
 * @license MIT (MIT-LICENSE.txt) - Please see the license file for full terms.
 */

(function($) {
    "use strict"; // Enforce strict mode for better code quality.

    /**
     * This jQuery UI widget constructs a mobile slider button.
     * It allows users to "slide to activate" an action.
     * @name sliderbutton
     * @public
     * @function
     * @memberOf jQuery.ju
     */
    $.widget("ju.sliderbutton",

    /**
     * @lends jQuery.ju.sliderbutton.prototype
     * @description Prototype methods and properties for the sliderbutton widget.
     */
    {

        // Widget options and their default values.
        /**
         * Default configuration options for the slider button.
         * These can be overridden during widget initialization.
         * @since 1.0
         */
        options: {
            text: "activate",        // The text displayed on the slider button.
            disabled: false,         // Whether the slider button is initially disabled.
            mini: false,             // Whether to render the button in a mini size.
            direction: "right",      // The direction the slider should move ("right" or "left").
            tolerance: 5,            // The percentage tolerance for activation (e.g., 5% from the end).
            releaseToActivate: true, // If true, activation occurs on release, otherwise on reaching the activation threshold.
            opacity: function(value) { // Function to calculate text opacity based on slider value.
                return 1.0 - (value / 50.0);
            }
        },

        /**
         * Calculates the current position of the slider handle as a percentage.
         * The value is normalized to a 0-100 range.
         * @returns {Number} The current value (position) of the slider, from 0 to 100.
         * @private
         * @author julrich
         * @since 2.0.0
         */
        _value: function() {
            var self = this; // Cache 'this' for consistent access within the function.
            // Calculate percentage based on handle's left position relative to its parent's width.
            return Math.round(self.handle.position().left / self.handle.parent().width() * 100);
        },

        /**
         * Checks if the slider has reached an activation position and,
         * if so, triggers the custom "activate" event.
         * This prevents multiple activations from a single slide action.
         * @private
         * @author julrich
         * @since 2.0.0
         */
        _checkSliderPosAndActivate: function() {
            var self = this,
                value = self._value(); // Get the current slider value.

            // Check if not already activated and if the slider is at the activation threshold.
            if ((self.activated === false) &&
                ((self.options.direction === "right" && value >= (100 - self.options.tolerance)) ||
                 (self.options.direction === "left" && value <= (0 + self.options.tolerance)))) {
                // Trigger the "activate" event with the current value.
                self._trigger("activate", null, {
                    value: value
                });
                self.activated = true; // Mark as activated to prevent re-triggering.
            }
        },

        /**
         * The constructor method for the jQuery Mobile slider button widget.
         * This method is called automatically when the widget is initialized.
         * @private
         * @author julrich
         * @since 1.0
         */
        _create: function() {
            var self = this; // Keep a reference to the widget instance.

            // Clear any existing content within the element and add the base class.
            self.element.empty();
            self.element.addClass("ju-sliderbutton");

            var startValue = 0; // Default start value for the slider.
            if (self.options.direction === "left") {
                startValue = 100; // If direction is left, start from the right end.
            }

            // Create the text span and the actual slider input element.
            var text = $('<span></span>').addClass("ju-sliderbutton-text").text(self.options.text);
            var slider = $('<input></input>').addClass("ju-sliderbutton-input")
                .attr("min", 0)
                .attr("max", 100)
                .attr("step", 1)
                .attr("value", startValue);

            // Append the created elements to the widget's main element.
            self.element.append(text);
            self.element.append(slider);

            // Initialize the slider using jQuery Mobile's slider widget.
            slider.slider();

            // Find the slider handle and remove its default title attribute.
            var handle = self.element.find('.ui-slider-handle');
            handle.attr("title", "");

            // Extend the widget instance with references to key internal elements and state variables.
            $.extend(self, {
                slider: slider,              // The jQuery Mobile slider instance.
                handle: handle,              // The slider handle element.
                text: text,                  // The text element.
                dragging: false,             // Flag to indicate if the handle is currently being dragged.
                tryingToDrag: false,         // Flag to indicate if a drag attempt has started.
                lastVal: 0,                  // Stores the last reported slider value to optimize 'slide' event.
                activated: false             // Flag to prevent multiple activations for a single slide.
            });

            // Apply initial options.
            self._setOption("mini", self.options.mini);
            self._setOption("direction", self.options.direction);
            self._setOption("disabled", self.options.disabled);

            // Disable default key control for the slider handle to prevent accidental movement.
            handle.add(self.element).unbind("keyup").unbind("keydown");

            // Event handler for virtual mouse move (vmousemove).
            // This handles the actual sliding action.
            handle.add(document).bind("vmousemove", function(event) {
                // If attempting to drag while disabled, reset the slider immediately.
                if (self.tryingToDrag && (self.options.disabled || self.element.attr('disabled'))) {
                    self._resetSlider();
                }

                // Proceed only if the slider is actively being dragged.
                if (self.dragging) {
                    self.handle.attr("title", ""); // Ensure handle title is empty during drag.
                    var value = self._value();     // Get the current slider value.

                    // Optimization: if the value hasn't changed, do nothing.
                    if (value === self.lastVal) {
                        return true;
                    }
                    self.lastVal = value; // Update the last reported value.

                    // Trigger the "slide" event, allowing external code to prevent the slide.
                    var allowed = self._trigger("slide", null, {
                        value: value
                    });
                    if (allowed !== false) {
                        // Update text opacity based on slider position.
                        self.text.css("opacity", self.options.opacity((self.options.direction === "left" ? (100 - value) : value)));
                        // If activation is not deferred until release, check for activation now.
                        if (self.options.releaseToActivate === false) {
                            self._checkSliderPosAndActivate();
                        }
                    } else {
                        // If slide was not allowed, reset the slider to its initial position.
                        self._resetSlider();
                    }
                    return allowed; // Return the result of the 'slide' trigger.
                }
            });

            // Event handler for virtual mouse down (vmousedown) on the handle.
            // This initiates a potential drag operation.
            handle.bind("vmousedown", function(event) {
                self.tryingToDrag = true; // Mark that a drag attempt has begun.
                // If not already dragging and not disabled, proceed to start dragging.
                if (!self.dragging && !self.options.disabled && !self.element.attr('disabled')) {
                    // Trigger the "start" event, allowing external code to prevent the drag.
                    var allowed = self._trigger("start", null, {
                        value: self._value()
                    });
                    if (allowed !== false) {
                        self.dragging = true;    // Set dragging flag.
                        self.activated = false;  // Reset activated flag for a new slide attempt.
                    }
                    return allowed; // Return the result of the 'start' trigger.
                }
            });

            // Event handler for virtual mouse up (vmouseup) on the handle or document.
            // This concludes a drag operation.
            handle.add(document).bind("vmouseup", function(event) {
                self.tryingToDrag = false; // Clear the drag attempt flag.
                if (self.dragging) {
                    // If activation is set to occur on release, check for activation now.
                    if (self.options.releaseToActivate !== false) {
                        self._checkSliderPosAndActivate();
                    }
                    // Trigger the "stop" event.
                    self._trigger("stop", null, {
                        value: self._value()
                    });
                    self._reset("fast"); // Reset the slider with a fast animation.
                    self.dragging = false; // Clear the dragging flag.
                } else {
                    // If not dragging but mouseup occurred, ensure slider is reset (e.g., if click on handle without drag).
                    self._resetSlider();
                }
            });
        }, // End of _create method.

        /**
         * Forces the slider handle back to its idle (initial) position immediately.
         * This method does not animate the reset.
         * @private
         * @author julrich
         * @since 1.0
         */
        _resetSlider: function() {
            var self = this; // Reference to the widget instance.

            // Position the handle visually based on the configured direction.
            if (self.options.direction === "right") {
                self.handle.css("left", "0%");
            } else if (self.options.direction === "left") {
                self.handle.css("left", "100%");
            }
            self.activated = false; // Reset the activation flag.

            // Update the underlying slider input's value and the last reported value.
            if (self.options.direction === "right") {
                self.slider.val(0);
                self.lastVal = 0;
            } else if (self.options.direction === "left") {
                self.slider.val(100);
                self.lastVal = 100;
            }
        },

        /**
         * Resets the slider to its idle position, optionally with an animation.
         * @param {Numeric|String|Null} [animationDuration] - If provided and not `null`,
         *   the reset will be animated over this duration (e.g., "fast", "slow", or milliseconds).
         *   If omitted or `null`, the reset is instantaneous.
         * @private
         * @author julrich
         * @since 1.0
         */
        _reset: function(animationDuration) {
            var self = this; // Widget instance reference.

            var resetValue; // Target CSS 'left' percentage for the handle.
            if (self.options.direction === "right") {
                resetValue = 0;
            } else if (self.options.direction === "left") {
                resetValue = 100;
            }

            if (animationDuration === undefined || animationDuration === null) {
                // No animation: reset instantly.
                self._resetSlider();
                self.text.css("opacity", self.options.opacity(0)); // Reset text opacity.
            } else {
                // Animate the handle's position and the text's opacity.
                // Use $.proxy to ensure `self` is correctly scoped in the callback.
                self.handle.animate({
                    left: resetValue + "%"
                }, animationDuration, $.proxy(self._resetSlider, self));
                self.text.animate({
                    opacity: self.options.opacity(0)
                }, animationDuration);
            }
        },

        /**
         * Handles changes to widget options. This method is called by the jQuery UI widget factory
         * whenever an option is changed after initialization.
         * @param {String} option - The name of the option being set.
         * @param value - The new value for the option.
         * @private
         * @author julrich
         * @since 1.0
         */
        _setOption: function(option, value) {
            var self = this; // Reference to the widget instance.
            // Call the base jQuery UI widget's _setOption method.
            $.Widget.prototype._setOption.apply(self, arguments);

            // Handle specific options with custom logic.
            switch (option) {
                case "text":
                    self.text.text(value); // Update the displayed text.
                    break;
                case "mini":
                    // Toggle the 'mini' class and update the underlying slider's 'mini' option.
                    self.element.toggleClass("ju-sliderbutton-mini", value);
                    self.slider.slider("option", "mini", value).slider("refresh");
                    break;
                case "disabled":
                    if (value === true) {
                        // Add disabled classes and attributes.
                        self.element.addClass("ui-disabled ui-state-disabled");
                        self.element.attr("disabled", true);
                        self.element.attr("aria-disabled", true);
                        self.text.css("opacity", ""); // Clear opacity to default.
                        self._resetSlider();          // Reset slider when disabled.
                    } else if (value === false) {
                        // Remove disabled classes and attributes.
                        self.element.removeClass("ui-disabled ui-state-disabled");
                        self.element.attr("disabled", false);
                        self.element.attr("aria-disabled", false);
                    }
                    break;
                case "direction":
                    // Adjust classes based on direction and reset the slider.
                    if (value === "right") {
                        self.element.removeClass("ju-sliderbutton-left");
                    } else if (value === "left") {
                        self.element.addClass("ju-sliderbutton-left");
                    }
                    self._resetSlider();
                    break;
                default:
                    // No specific action for other options.
                    break;
            }
        }

    }); // End of widget definition.

}(jQuery)); // Immediately-invoked function expression to encapsulate the code.