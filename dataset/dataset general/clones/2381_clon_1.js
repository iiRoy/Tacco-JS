(function( jQuery ) {
    // This is a self-executing anonymous function to encapsulate the plugin logic.
    var ResponsiveTopScreen = function() {}; // Define the main constructor for the ResponsiveTopScreen functionality.

    // Extend the prototype of ResponsiveTopScreen to add methods and properties.
    ResponsiveTopScreen.prototype = {

        // Property to hold the jQuery-wrapped window element.
        windowElement: jQuery(window),

        // This property will store the main target element for fullscreen.
        targetElement: undefined,

        // This property will store the actual media element (e.g., video, image) within the target.
        targetMediaElement: undefined,

        // This property will store the optional gradient overlay element.
        filmElement: undefined,

        // Configuration options for the plugin instance.
        options: undefined,

        /**
         * Initializes the responsive top screen behavior for a given element.
         * @param {jQuery} targetElement The element to make fullscreen responsive.
         */
        run: function ( targetElement ) {
            var _this = this; // Cache 'this' for use in event handlers.

            // Set up the target element and its initial styles.
            this.setTarget(targetElement);

            // Immediately trigger the resize logic once after setup.
            this.onWindowResize(undefined);

            // Attach a resize event listener to the window.
            this.windowElement.resize(function (event) {
                _this.onWindowResize(event); // Call the handler with the event object.
            });
        }, // End of run method.

        /**
         * Handles the window resize event to adjust element dimensions.
         * @param {Event} event The resize event object (can be undefined on initial call).
         */
        onWindowResize: function (event) {
            var windowWidth = this.windowElement.width(); // Get current window width.
            var windowHeight = this.windowElement.height(); // Get current window height.
            var mediaWidth = this.targetMediaElement.data('original-width'); // Original media width.
            var mediaHeight = this.targetMediaElement.data('original-height'); // Original media height.

            // Adjust the size of the main target element to match the window.
            this.targetElement.width(windowWidth);
            this.targetElement.height(windowHeight);

            // If a screen filter image is defined, resize the film element too.
            if (this.options.screenFilterImage != undefined) {
                this.filmElement.width(windowWidth);
                this.filmElement.height(windowHeight);
            }

            // Calculate ratios for media element sizing.
            var windowRatio = windowWidth / windowHeight;
            var mediaRatio = mediaWidth / mediaHeight;

            // Determine if width or height should be constrained.
            if (mediaRatio > windowRatio) {
                // Media is wider than window aspect ratio, constrain by height.
                this.targetMediaElement.height(windowHeight);
                this.targetMediaElement.width(mediaWidth * (windowHeight / mediaHeight));
                this.targetMediaElement.css({
                    left: - ( ( this.targetMediaElement.width() - windowWidth ) / 2 ), // Center horizontally.
                    top: 0
                });
            } else {
                // Media is taller than window aspect ratio, constrain by width.
                this.targetMediaElement.width(windowWidth);
                this.targetMediaElement.height(mediaHeight * (windowWidth / mediaWidth));
                this.targetMediaElement.css({
                    left: 0,
                    top: - ( ( this.targetMediaElement.height() - windowHeight ) / 2 ) // Center vertically.
                });
            }

        }, // End of onWindowResize method.

        // Configures the target element and its immediate child (media element).
        setTarget: function ( targetElement ) {
            this.targetElement = targetElement; // Store the reference to the target element.
            targetElement.css({
                display: "block",
                overflow: "hidden",
                margin: 0,
                padding: 0,
                position: "relative"
            });

            // Get the first child of the target element, assuming it's the media.
            var targetMediaElement = targetElement.children(":first-child");
            this.targetMediaElement = targetMediaElement; // Store the media element.
            targetMediaElement.css({
                display: "block",
                margin: 0,
                padding: 0,
                position: "absolute",
                zIndex: -10 // Place media behind other content.
            });

            // If a screen filter is specified, create and show it.
            if (this.options.screenFilterImage != undefined) {
                this.showGradientFilm();
            }
        }, // End of setTarget method.

        // Creates and appends a gradient film overlay.
        showGradientFilm: function () {
            var filmElement = jQuery("<div>"); // Create a new div for the film.
            var windowWidth = this.windowElement.width();
            var windowHeight = this.windowElement.height();

            filmElement.height(windowHeight); // Set initial height.
            filmElement.width(windowWidth); // Set initial width.
            filmElement.css({
                display: "block",
                margin: 0,
                padding: 0,
                position: "absolute",
                zIndex: -5, // Place film between media and content.
                background: "url(" + this.options.screenFilterImage + ") repeat-x left bottom"
            });

            this.targetElement.append(filmElement); // Add film to the target element.
            this.filmElement = filmElement; // Store reference to the film element.
        }, // End of showGradientFilm method.

        // Assigns options to the instance.
        setOptions: function (options) {
            this.options = options;
        } // End of setOptions method.
    }; // End of ResponsiveTopScreen.prototype.

    // Extend jQuery's prototype to add the responsiveTopScreen plugin.
    jQuery.fn.responsiveTopScreen = function (options) {
        // Merge default options with user-provided options.
        var options = jQuery.extend(jQuery.fn.responsiveTopScreen.defaults, options);

        // Get the jQuery object for the element(s) on which the plugin is called.
        var targetElement = jQuery(this);

        // Instantiate the ResponsiveTopScreen object.
        var topScreen = new ResponsiveTopScreen(); // No options passed to constructor, set later.
        topScreen.setOptions(options); // Pass the merged options.
        topScreen.run(targetElement); // Start the responsive behavior.

        return this; // Allow for jQuery method chaining.
    }; // End of jQuery.fn.responsiveTopScreen.

    // Define default options for the plugin.
    jQuery.fn.responsiveTopScreen.defaults = {
        // Default value for the screen filter image URL.
        screenFilterImage: undefined
    };

})(jQuery); // End of the IIFE.