/*
 * This is a highly modified version of the Easy Ticker plugin.
 * Original source and details: http://www.aakashweb.com/
 * Copyright notice: (C) 2014 Aakash Chakravarthy.
 * License information: Distributed under the MIT License.
 *
 * All logical code remains precisely the same; only formatting and comments have been altered.
 */

; ( function ($, window, document, undefined) {

    // Define the plugin's name as a constant.
    var name = "easyTicker"

        // These are the default configuration options for the plugin.
        , defaults = {
            direction: 'up', // 'up' or 'down' for scrolling direction.
            easing: 'swing', // Easing function for animations.
            speed: 'slow', // Animation speed (e.g., 'slow', 'fast', or milliseconds).
            interval: 2000, // Time between each scroll in milliseconds.
            height: 'auto', // Fixed height or 'auto' for dynamic height.
            visible: 0, // Number of items visible at once (0 for all).
            mousePause: 1, // Pause ticker on mouse hover (1 for true, 0 for false).
            controls: { // Control elements for the ticker.
                up: '', // Selector for the 'up' button.
                down: '', // Selector for the 'down' button.
                toggle: '', // Selector for the 'play/pause' button.
                playText: 'Play', // Text for the play button.
                stopText: 'Stop' // Text for the stop button.
            }
        }
    ; // End of defaults object.

    // The main constructor function for the EasyTicker plugin.
    function EasyTicker(el, options) {

        var s = this; // Store a reference to the current instance (self).

        // Merge default options with user-provided options.
        s.opts = $.extend({}, defaults, options);
        // Store the jQuery element for the ticker container.
        s.elem = $(el);
        // Store the target element (the direct child of the container, usually a UL).
        s.targ = $(el).children(':first-child');
        // Initialize timer ID for setInterval.
        s.timer = 0;
        // Mouse hover state (not used in the provided code, but initialized).
        s.mHover = 0;
        // Window focus state (1 for focused, 0 for blurred).
        s.winFocus = 1;

        // Perform initial setup.
        init();
        // Start the ticker animation loop.
        start();

        // Attach focus/blur event listeners to window and document.
        // These events control if the ticker should run when the window is not active.
        $([window, document]).off('focus.jqet').on('focus.jqet', function () {
            s.winFocus = 1; // Window is focused.
        }).off('blur.jqet').on('blur.jqet', function () {
            s.winFocus = 0; // Window is blurred.
        });

        // Implement mouse pause functionality if enabled.
        if (s.opts.mousePause == 1) {
            s.elem.mouseenter(function () {
                s.timerTemp = s.timer; // Store current timer state.
                stop(); // Stop the ticker on mouse enter.
            }).mouseleave(function () {
                // If the ticker was running before mouse enter, restart it.
                if (s.timerTemp !== 0) {
                    start();
                }
            });
        }

        // Attach click event handlers for control buttons.

        // Up button functionality.
        $(s.opts.controls.up).on('click', function (e) {
            e.preventDefault(); // Prevent default link behavior.
            moveDir('up'); // Move the ticker upwards.
        });

        // Down button functionality.
        $(s.opts.controls.down).on('click', function (e) {
            e.preventDefault(); // Prevent default link behavior.
            moveDir('down'); // Move the ticker downwards.
        });

        // Toggle (play/pause) button functionality.
        $(s.opts.controls.toggle).on('click', function (e) {
            e.preventDefault(); // Prevent default link behavior.
            if (s.timer == 0) { // If ticker is stopped, start it.
                start();
            } else { // If ticker is running, stop it.
                stop();
            }
        });

        // Private method: Initializes the ticker's CSS properties.
        function init() {

            // Remove margins from children and their children.
            s.elem.children().css('margin', 0).children().css('margin', 0);

            // Apply essential CSS for the ticker container.
            s.elem.css({
                position: 'relative', // Necessary for absolute positioning of children.
                height: s.opts.height, // Set height as per options.
                overflow: 'hidden' // Hide overflowing content.
            });

            // Apply essential CSS for the target element (the list).
            s.targ.css({
                'position': 'absolute', // Position absolutely within the container.
                'margin': 0 // Remove default margins.
            });

            // Periodically adjust height in case content changes.
            setInterval(function () {
                adjHeight(); // Call height adjustment function.
            }, 100);

        } // End of init() method.

        // Private method: Starts the automatic scrolling.
        function start() {
            // Set up an interval to call the 'move' function periodically.
            s.timer = setInterval(function () {
                // Only move if the window is currently focused.
                if (s.winFocus == 1) {
                    move(s.opts.direction); // Scroll in the specified direction.
                }
            }, s.opts.interval);

            // Update the toggle button's appearance and text.
            $(s.opts.controls.toggle).addClass('et-run').html(s.opts.controls.stopText);

        } // End of start() method.

        // Private method: Stops the automatic scrolling.
        function stop() {
            clearInterval(s.timer); // Clear the interval to stop scrolling.
            s.timer = 0; // Reset the timer ID.
            // Update the toggle button's appearance and text.
            $(s.opts.controls.toggle).removeClass('et-run').html(s.opts.controls.playText);
        } // End of stop() method.

        // Private method: Performs a single scroll animation.
        function move(dir) {
            var sel, eq, appType; // Declare local variables.

            // If the element is not visible, do nothing.
            if (!s.elem.is(':visible')) {
                return;
            }

            // Determine selection, equation, and append type based on direction.
            if (dir == 'up') {
                sel = ':first-child'; // Select the first child.
                eq = '-='; // Move upwards (negative offset).
                appType = 'appendTo'; // Move item to the end of the list.
            } else { // Direction is 'down'.
                sel = ':last-child'; // Select the last child.
                eq = '+='; // Move downwards (positive offset).
                appType = 'prependTo'; // Move item to the beginning of the list.
            }

            // Get the selected child element.
            var selChild = s.targ.children(sel);
            // Get the outer height of the selected child.
            var height = selChild.outerHeight();

            // Animate the target element (list) to create the scrolling effect.
            s.targ.stop(true, true).animate({
                'top': eq + height + "px" // Animate 'top' property.
            }, s.opts.speed, s.opts.easing, function () { // Callback after animation completes.

                // Hide the moved child, append/prepend it, and then fade it in.
                selChild.hide()[appType](s.targ).fadeIn();
                s.targ.css('top', 0); // Reset 'top' position to 0 after rearrangement.

                adjHeight(); // Adjust container height if necessary.

            });
        } // End of move() method.

        // Private method: Moves the ticker in a specific direction and stops auto-play.
        function moveDir(dir) {
            stop(); // Stop automatic scrolling.
            if (dir == 'up') {
                move('up'); // Move one step up.
            } else {
                move('down'); // Move one step down.
            }
            // start(); // Optionally restart after manual move, commented out in original.
        }

        // Private method: Calculates and sets the full height of all list items.
        function fullHeight() {
            var height = 0; // Initialize height accumulator.
            var tempDisp = s.elem.css('display'); // Store current display style.

            s.elem.css('display', 'block'); // Temporarily set display to 'block' for accurate height calculation.

            s.targ.children().each(function () {
                height += $(this).outerHeight(); // Sum up outer heights of all children.
            });

            // Restore original display and set calculated height.
            s.elem.css({
                'display': tempDisp,
                'height': height
            });
        }

        // Private method: Calculates and sets the height for a visible number of items.
        function visHeight(anim) {
            var wrapHeight = 0; // Initialize height accumulator.
            // Iterate over the first 'visible' number of children.
            s.targ.children(':lt(' + s.opts.visible + ')').each(function () {
                wrapHeight += $(this).outerHeight(); // Sum their outer heights.
            });

            // Animate the height change or set it directly.
            if (anim == 1) {
                s.elem.stop(true, true).animate({ height: wrapHeight }, s.opts.speed);
            } else {
                s.elem.css('height', wrapHeight);
            }
        }

        // Private method: Adjusts the height of the ticker container.
        function adjHeight() {
            // Determine if the call is from 'init' to prevent animation on first load.
            var anim = arguments.callee.caller.name == 'init' ? 0 : 1;

            // If height is 'auto' and 'visible' items are specified.
            if (s.opts.height == 'auto' && s.opts.visible != 0) {
                visHeight(anim); // Adjust height based on visible items.
            } else if (s.opts.height == 'auto') { // If height is 'auto' and 'visible' is 0.
                fullHeight(); // Adjust height to fit all items.
            }
        }

        // Public API for the plugin instance.
        return {
            up: function () { moveDir('up'); }, // Programmatically move up.
            down: function () { moveDir('down'); }, // Programmatically move down.
            start: start, // Programmatically start the ticker.
            stop: stop, // Programmatically stop the ticker.
            options: s.opts // Expose current options.
        };

    } // End of EasyTicker constructor.

    // Attach the EasyTicker plugin to jQuery's prototype.
    $.fn[name] = function (options) {
        // Iterate over each selected element.
        return this.each(function () {
            // If the plugin hasn't been initialized on this element yet.
            if (!$.data(this, name)) {
                // Initialize a new EasyTicker instance and store it in jQuery's data.
                $.data(this, name, new EasyTicker(this, options));
            }
        });
    };

})(jQuery, window, document); // End of the Immediately Invoked Function Expression (IIFE).