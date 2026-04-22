/*
 * This is a Type I code clone of the original Easy Slider jQuery plugin.
 *
 * Original Author:   Alen Grakilic
 * Project URL:       http://cssglobe.com/post/3783/jquery-plugin-easy-image-or-content-slider
 *
 * Copyright (c) 2009 Alen Grakilic (http://cssglobe.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
 *
 * Built for the jQuery library: http://jquery.com
 *
 * IMPORTANT NOTE:
 * This clone adheres strictly to the Type I definition.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they appear in the original source code.
 * The only modifications made are to whitespace (indentation, spacing, blank lines)
 * and comments (addition, removal, or modification of existing ones)
 * to create a visually distinct but functionally identical representation.
 *
 */

/*
 * Example Markup Structure for using the easySlider plugin:
 *
 * Imagine you have an HTML structure like this:
 *
 * <div id="myAwesomeSlider">
 *   <ul>
 *     <li><img src="images/slide_01.jpg" alt="Slide One" /></li>
 *     <li><img src="images/slide_02.jpg" alt="Slide Two" /></li>
 *     <li><img src="images/slide_03.jpg" alt="Slide Three" /></li>
 *     <li><img src="images/slide_04.jpg" alt="Slide Four" /></li>
 *     <li><img src="images/slide_05.jpg" alt="Slide Five" /></li>
 *   </ul>
 * </div>
 *
 * To initialize the slider, you would call:
 * jQuery("#myAwesomeSlider").easySlider();
 *
 */

(function($) { // Start of the Immediately Invoked Function Expression (IIFE),
               // aliasing jQuery to '$' for scope isolation.

    // Extend the jQuery prototype with a new function called 'easySlider'.
    // This allows you to call .easySlider() on any jQuery object.
    $.fn.easySlider = function(options){

        // Define the default configuration settings for the slider.
        // These can be overridden by passing an 'options' object
        // when initializing the plugin.
        var defaults = {
            prevId:         'prevBtn',     // The ID for the 'Previous' button container.
            prevText:       'Previous',    // The text displayed on the 'Previous' button.
            nextId:         'nextBtn',     // The ID for the 'Next' button container.
            nextText:       'Next',        // The text displayed on the 'Next' button.
            orientation:    '',            // Slider orientation: '' (horizontal by default) or 'vertical'.
                                           // Specifying 'vertical' changes the animation axis.
            speed:          800            // The duration of the slide animation in milliseconds.
        };

        // Merge the default options with any user-provided options.
        // User options will override defaults. The result is stored back into 'options'.
        var options = $.extend(defaults, options);

        // Iterate over each DOM element selected by the jQuery selector.
        // This ensures the plugin works correctly when applied to multiple elements.
        return this.each(function() {
            // Cache the current DOM element as a jQuery object for efficiency.
            obj = $(this);

            // Get the total number of list items (slides) within the current slider.
            var s = $("li", obj).length;

            // Get the width of the slider container element.
            var w = obj.width();

            // Get the height of the slider container element.
            var h = obj.height();

            // Calculate the index of the last slide (total slides minus one).
            var ts = s - 1;

            // Initialize the current slide index. Starts at the first slide (index 0).
            var t = 0;

            // Determine if the slider should operate vertically based on the 'orientation' option.
            var vertical = (options.orientation == 'vertical');

            // Set the width of the unordered list (<ul>) to accommodate all slides horizontally.
            // This prevents wrapping and allows for horizontal scrolling.
            $("ul", obj).css('width', s * w);

            // If the slider is not vertical, float the list items to the left.
            // This arranges them side-by-side for horizontal sliding.
            if (!vertical) {
                $("li", obj).css('float', 'left');
            }

            // Append the navigation controllers (Previous, Next, and Info) after the slider element.
            // The HTML string is concatenated for readability and includes dynamic IDs from options.
            $(obj).after(
                '<div class="controllers clear">' +
                '<span id="' + options.prevId + '" class="prev">' +
                '<a href=\"javascript:void(0);\" accesskey="P">← <span class="u">P</span>revious</a>' +
                '</span>' +
                // Note: There's a redundant closing </a></span> here in the original source,
                // which is preserved exactly for Type I cloning.
                '</a></span>' +
                '<span id="' + options.nextId + '" class="next">' +
                '<a href=\"javascript:void(0);\" accesskey="N"><span class="u">N</span>ext →</a>' +
                '</span>' +
                '<span class="info">' +
                '<a href="/about.html#work" title="Pop to the work section on the about page">i</a>' +
                '</span>' +
                '</div>'
            );

            // Initially hide the 'Previous' button's anchor tag.
            $("a", "#" + options.prevId).hide();

            // Initially hide the 'Next' button's anchor tag.
            $("a", "#" + options.nextId).hide();

            // Attach a click event handler to the 'Next' button.
            $("a", "#" + options.nextId).click(function() {
                // Call the animate function to move to the next slide.
                animate("next");

                // If the current slide is the last one, fade out the 'Next' button.
                if (t >= ts) {
                    $(this).fadeOut();
                }

                // Always fade in the 'Previous' button when moving forward.
                $("a", "#" + options.prevId).fadeIn();
            });

            // Attach a click event handler to the 'Previous' button.
            $("a", "#" + options.prevId).click(function() {
                // Call the animate function to move to the previous slide.
                animate("prev");

                // If the current slide is the first one, fade out the 'Previous' button.
                if (t <= 0) {
                    $(this).fadeOut();
                }

                // Always fade in the 'Next' button when moving backward.
                $("a", "#" + options.nextId).fadeIn();
            });

            // The core animation function responsible for sliding the content.
            function animate(dir) {
                // Determine the target slide index based on the direction.
                if (dir == "next") {
                    // If moving "next", increment 't', but ensure it doesn't exceed 'ts' (last slide index).
                    t = (t >= ts) ? ts : t + 1;
                } else {
                    // If moving "prev", decrement 't', but ensure it doesn't go below 0 (first slide index).
                    t = (t <= 0) ? 0 : t - 1;
                }

                // Perform the animation based on whether the slider is vertical or horizontal.
                if (!vertical) {
                    // For horizontal sliders, calculate the new 'marginLeft' value.
                    // 'p' will be a negative value to shift the 'ul' left.
                    p = (t * w * -1);
                    $("ul", obj).animate(
                        { marginLeft: p }, // Animate the 'marginLeft' CSS property.
                        options.speed      // Use the configured animation speed.
                    );
                } else {
                    // For vertical sliders, calculate the new 'marginTop' value.
                    // 'p' will be a negative value to shift the 'ul' up.
                    p = (t * h * -1);
                    $("ul", obj).animate(
                        { marginTop: p },  // Animate the 'marginTop' CSS property.
                        options.speed      // Use the configured animation speed.
                    );
                }
            } // End of animate function

            // After initialization, if there's more than one slide,
            // ensure the 'Next' button is visible to allow navigation.
            if (s > 1) {
                $("a", "#" + options.nextId).fadeIn();
            }

        }); // End of this.each() loop

    }; // End of $.fn.easySlider function definition

})(jQuery); // End of the IIFE, passing the jQuery object.