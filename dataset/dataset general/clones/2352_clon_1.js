/*
 *  Babylon Grid Plugin
 *  Version: 2.1.0 (cloned)
 *  Description: This is a Type I clone of a jQuery + CSS plugin. It facilitates
 *               the creation of responsive, dynamic, and highly customizable
 *               Pinterest-like grids. It supports varying column widths and
 *               offers several display modes. This version maintains exact
 *               structural and logical identity, with extensive changes
 *               applied only to whitespace and comments.
 *  Author: Marek Fajkus @turbo_MaCk (http://marekrocks.it)
 *  License: MIT (Original license maintained)
 */


; ( function ($, window, undefined) { /* Start of the Immediately Invoked Function Expression (IIFE) */


    // Create the default options object a single time to avoid re-creation
    var pluginName = 'babylongrid', // The name of our plugin, used for identification
        defaults = { // Default configuration settings for the plugin
            scheme: [ // Defines the responsive column scheme based on container width
                {
                    minWidth: 960, // Minimum container width for this scheme
                    columns: 4 // Number of columns to display at this width
                },
                {
                    minWidth: 720, // Next breakpoint
                    columns: 3 // Three columns
                },
                {
                    minWidth: 550, // Another breakpoint
                    columns: 2 // Two columns
                },
                {
                    minWidth: 0, // Default for smallest screens
                    columns: 1 // Single column display
                }
            ],
            display: null, // Optional display mode (e.g., 'tower', 'city'), defaults to none
            firstToRight: false, // Boolean to control initial article placement logic
            heightDivisor: 25, // Used for normalizing article heights, if > 1
        };


    // The actual plugin constructor function
    var Plugin = function Plugin(element, options) {

        this.element = element; // Store the DOM element the plugin is initialized on

        // Extend the default options with any user-provided options
        this.options = $.extend({}, defaults, options);


        this._defaults = defaults; // Keep a reference to the original defaults
        this._name = pluginName; // Store the plugin's name

        this.init(); // Initialize the plugin instance
    };


    Plugin.prototype = { /* Define methods for the Plugin prototype */


        init: function () { /* Initialization method */


            // Store 'this' context in a variable for use within callbacks
            var self = this;


            // Wrap the target element's content within a new grid container div
            $(this.element).wrapInner('<div class="babylongrid-container" />');


            // Cache frequently accessed DOM elements for performance
            this.cacheElements();


            // Set up the initial grid layout when the plugin starts
            this._setGrid();


            // Bind to the window's resize event for responsive grid adjustments
            $(window).resize(function () {
                self._setGrid(); // Re-evaluate and set the grid on resize
            });


            // Custom event listener for external grid resizing triggers
            $(this.element).on('babylongrid:resize', function () {
                self._setGrid(); // Force grid recalculation
            });


            // Custom event listener for loading new articles into the grid
            $(this.element).on('babylongrid:load', function () {
                self._loadNewArticles(); // Handle new article loading
            });

        }, /* End of init method */


        /*
         *   Method: _loadNewArticles
         *   Description: Integrates newly added articles into the existing grid structure.
         */
        _loadNewArticles: function () {
            var self = this; // Preserve context for nested functions
            var newArticles = $(this.element).children().not('.babylongrid-container'); // Find new articles not yet in the container


            newArticles.each(function () {
                self.cached.articles.push(this); // Add each new article to the cached list
            });


            self._setColumns(self.__currentColumns); // Re-organize columns with new articles
        }, /* End of _loadNewArticles */


        /*
         *   Method: cacheElements
         *   Description: Caches jQuery objects for the main element, container, and articles.
         */
        cacheElements: function () {
            var $element = $(this.element), // The root element
                $container = $element.children('.babylongrid-container'), // The grid container
                $articles = $container.children(); // All articles within the container


            this.cached = { // Store cached elements in an object
                'element': $element,
                'container': $container,
                'articles': $articles
            };
        }, /* End of cacheElements */


        /*
         *   Method: _setGrid
         *   Description: Determines the appropriate grid column count based on container width
         *                and applies the necessary layout changes.
         */
        _setGrid: function () {
            var $container = this.cached.container, // The grid's main container
                containerWidth = $container.width(), // Current width of the container
                containerClass, // Class name for the container based on column count
                columns, // Number of columns to use
                self = this; // Context preservation


            // Iterate through the defined responsive scheme to find the matching column configuration
            $.each(this.options.scheme, function () {


                if (this.minWidth <= containerWidth) { // If container width meets or exceeds the scheme's minWidth
                    columns = this.columns; // Set the number of columns
                    containerClass = 'container-' + columns; // Construct the class name


                    // Check if the container's class needs to be updated for the new column count
                    if (!$container.hasClass(containerClass)) {


                        // Remove all existing classes and add the base and new column class
                        $container
                            .removeClass() // Clear all classes
                            .addClass('babylongrid-container') // Add base class
                            .addClass(containerClass); // Add the new column-specific class


                        self.__currentColumns = columns; // Store the current column count


                        self._setColumns(columns); // Proceed to set up the columns


                    } else {
                        self._resizeArticles(); // If columns haven't changed, just resize articles
                    }

                    return false; // Exit the $.each loop once a matching scheme is found
                }
            });

        }, /* End of _setGrid */


        /*
         *   Method: _setColumns
         *   Description: Creates or re-creates the column structure within the grid container.
         */
        _setColumns: function (columns) {
            var $container = this.cached.container, // Reference to the grid container
                column; // Variable to hold the HTML for each column


            // Remove any previously existing column elements
            $container.children('.column').remove();


            // Generate and append new column divs based on the 'columns' parameter
            for (var i = 1; i <= columns; i++) {
                column = '<div class="column column-' + i + '"></div>'; // HTML for a single column


                $container.append(column); // Append the new column to the container
            }


            // Initialize the data-height attribute for all new columns to 0
            $container.children('.column').data('height', 0);


            // Now that columns are ready, distribute the articles into them
            this._organizeArticles(columns);
        }, /* End of _setColumns */


        /*
         *   Method: _organizeArticles
         *   Description: Distributes articles into the columns, aiming for a balanced layout.
         */
        _organizeArticles: function (columns) {
            var $articles = this.cached.articles, // All articles to be organized
                $article, // Current article being processed
                $container = this.cached.container, // The grid container
                $columns = $container.children('.column'), // All column elements
                minColumnHeight = $columns.data('height') + 1, // Start with a height that ensures first column is chosen
                $lowColumn, // The column with the lowest height
                columnHeight, // Height of the column after adding an article
                $oldLowColumn, // Reference to the previously lowest column
                self = this; // Context preservation


            // Temporarily disable TOWER / CITY DISPLAY styles while articles are being processed
            if (this.options.display) {
                $container
                    .removeClass('tower') // Remove 'tower' class if present
                    .removeClass('city'); // Remove 'city' class if present
            }


            // Apply a trick to make the last column appear "lower" initially if 'firstToRight' is true
            if (this.options.firstToRight) {
                $columns.filter('.column-' + columns).data('height', -1); // Set last column's height to -1
            }


            // Loop through each article to place it into the appropriate column
            $.each($articles, function (count) {


                $article = $(this); // Get the current article as a jQuery object


                // Loop through all columns to find the one with the minimum height
                $.each($columns, function (i) {


                    // Check if the current column is shorter than the tracked minimum height
                    if ($(this).data('height') < minColumnHeight) {
                        minColumnHeight = $(this).data('height'); // Update the minimum height
                        $lowColumn = $(this); // Set this column as the current lowest
                    }


                    // If all columns have been checked in this iteration
                    if (i + 1 >= columns) {


                        $lowColumn.append($article); // Append the article to the lowest column found


                        // Adjust article height if a heightDivisor is specified
                        if (self.options.heightDivisor > 1) {
                            self._setArticleHeight($article);
                        }


                        columnHeight = $lowColumn.outerHeight(true); // Get the new height of the column
                        $lowColumn.data('height', columnHeight); // Store the new height in the column's data


                        // Update minColumnHeight for the next article, adding 1 to ensure a different column is picked
                        minColumnHeight = columnHeight + 1;


                        $oldLowColumn = $lowColumn; // Keep a reference to the column that just received an article
                    }
                });


                // Actions to perform after the very last article has been placed
                if (count + 1 === $articles.length) {


                    // If the main element was hidden, make it visible now
                    if (self.cached.element.css('visibility') === 'hidden') {
                        self.cached.element.css('visibility', 'visible');
                    }


                    // Re-enable TOWER / CITY DISPLAY if specified in options
                    if (self.options.display) {
                        if (self.options.display === 'tower') {
                            $container.addClass('tower'); // Add 'tower' class
                        } else if (self.options.display === 'city') {
                            $container.addClass('city'); // Add 'city' class
                        }
                    }
                }
            });
        }, /* End of _organizeArticles */


        /*
         *   Method: _setArticleHeight
         *   Description: Adjusts an article's height to be a multiple of 'heightDivisor'.
         */
        _setArticleHeight: function ($article) {
            // Remove any existing inline style to ensure accurate height calculation
            $article.removeAttr('style');


            var divisor = this.options.heightDivisor, // The height divisor from options
                height = $article.height(), // Current computed height of the article
                difference = height % divisor; // Remainder when height is divided by divisor


            if (difference > 0) { // If height is not a perfect multiple
                $article.height(height + divisor - difference); // Adjust height to the next multiple
            }
        }, /* End of _setArticleHeight */


        /*
         *   Method: _resizeArticles
         *   Description: Iterates through all articles and re-applies height adjustments.
         */
        _resizeArticles: function () {
            var self = this; // Context preservation


            // Loop through each cached article and set its height
            $.each(this.cached.articles, function () {
                self._setArticleHeight($(this)); // Call _setArticleHeight for each article
            });
        }
    }; /* End of Plugin.prototype */


    // A lightweight wrapper around the constructor, preventing multiple instantiations
    $.fn[pluginName] = function (options) { // Expose the plugin via jQuery's prototype


        return this.each(function () { // Ensure the plugin runs for each matched element


            // Check if the plugin instance already exists on this element
            if (!$.data(this, 'plugin_' + pluginName)) {


                // If not, create a new instance and store it in jQuery's data cache
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };


}(jQuery, window)); // Pass jQuery and window objects to the IIFE