/*
 * This is a self-executing anonymous function (IIFE) to encapsulate the plugin.
 * It takes 'jQuery' as an argument, aliased as '$'.
 * This ensures that '$' refers to jQuery within this scope, preventing conflicts.
 */
!function ($) {

    // Define the MMPaginator constructor function.
    // Instances of this function will manage pagination logic and UI.
    var MMPaginator = function (element, options) {
        // Store the jQuery-wrapped DOM element associated with this paginator instance.
        this.$el = $(element);
        // Store the options passed during initialization for later use.
        this.opts = options;
    };

    // Extend the prototype of MMPaginator to add methods that will be shared
    // across all instances of the paginator.
    MMPaginator.prototype = {

        /*
         * _initLayout: Initializes the visual layout of the paginator.
         * This method is responsible for creating the necessary DOM elements
         * like the total count label, page number list, and the limit (items per page) selector.
         */
        _initLayout: function () {
            // Cache 'this' (the MMPaginator instance) in a variable 'that'
            // to maintain context within nested functions (e.g., event handlers).
            var that = this;

            // Get local references to the main element and options for easier access and readability.
            var $el = this.$el;
            var opts = this.opts;

            // Add the base CSS class to the paginator's root element for styling.
            $el.addClass("mmPaginator");

            // Define the HTML structure for the main components of the paginator.
            // This array will be joined to form a single HTML string.
            var pgHtmls = [
                '<div class="totalCountLabel"></div>', // Placeholder for displaying total record count.
                '<ul class="pageList"></ul>',           // Container for page number links.
                '<div class="limit"><select></select></div>' // Container for the "items per page" dropdown.
            ];
            // Append the generated HTML string to the main paginator element.
            // Using `join('')` is often more performant than concatenating strings in a loop.
            $el.append($(pgHtmls.join('')));

            // Cache jQuery objects for frequently accessed sub-elements.
            // This reduces redundant DOM traversals.
            this.$totalCountLabel = $el.find('.totalCountLabel');
            this.$pageList = $el.find('.pageList');
            this.$limitList = $el.find('.limit select');

            // Populate the limit (items per page) dropdown list based on options.
            var $limitList = this.$limitList; // Local reference to the limit select element.
            $.each(opts.limitList, function () { // Iterate over the predefined limit options (e.g., [10, 20, 50]).
                var $option = $('<option></option>') // Create a new <option> element.
                    .prop('value', this) // Set the option's value (e.g., 20).
                    .text(that.formatString(opts.limitLabel, [this])); // Set the display text (e.g., "每页20条").
                $limitList.append($option); // Add the newly created option to the select element.
            });

            // Attach a change event listener to the limit dropdown.
            // When the user selects a new limit, the paginator needs to update.
            $limitList.on('change', function () {
                // When the limit changes, the pagination should typically reset to the first page.
                $el.data('page', 1);
                // Trigger a reload of the associated grid component to fetch data with the new limit.
                that.$mmGrid.load();
            });

        } // End of _initLayout method

        , /*
         * _plain: Renders the standard 'plain' style pagination controls.
         * This typically includes 'Previous', page numbers (with ellipses), and 'Next' buttons.
         *
         * @param {number} page - The current page number.
         * @param {number} totalCount - The total number of records.
         * @param {number} limit - The number of items displayed per page.
         */
        _plain: function (page, totalCount, limit) {
            // Maintain context for event handlers.
            var that = this;
            // Shorthand references for frequently used elements.
            var $el = this.$el;
            var $pageList = this.$pageList;

            // Calculate the total number of pages required.
            // If totalCount is a perfect multiple of limit, totalPage is totalCount / limit.
            // Otherwise, it's (totalCount / limit) + 1 to account for the last partial page.
            var totalPage = totalCount % limit === 0 ? parseInt(totalCount / limit) : parseInt(totalCount / limit) + 1;
            // Handle edge cases where totalPage might be zero or invalid (e.g., from division by zero or NaN).
            totalPage = totalPage ? totalPage : 0;

            // Adjust the current page number if it falls out of valid bounds.
            if (totalPage === 0) {
                page = 1; // If there are no pages, the current page is logically 1.
            } else if (page > totalPage) {
                page = totalPage; // If current page exceeds total, set it to the last page.
            } else if (page < 1 && totalPage != 0) { // If current page is less than 1 (and there are actual pages).
                page = 1; // Set it to the first page.
            }

            // --- Render 'Previous' button ---
            var $prev = $('<li class="prev"><a>«</a></li>');
            if (page <= 1) {
                // If on the first page, disable the 'Previous' button.
                $prev.addClass('disable');
            } else {
                // Otherwise, enable it and attach a click handler.
                $prev.find('a').on('click', function () {
                    $el.data('page', page - 1); // Decrement the page number.
                    that.$mmGrid.load(); // Trigger a grid reload for the previous page.
                });
            }
            $pageList.append($prev); // Add the 'Previous' button to the page list.

            // --- Logic to generate the list of page numbers to display ---
            // This logic aims to show a few pages around the current page,
            // always including the first and last page, and using ellipses for gaps.
            var list = [1]; // Always start with page 1.
            if (page > 4) { // If the current page is significantly far from page 1, add an ellipsis.
                list.push('...');
            }
            // Add a range of 5 pages centered around the current page (current - 2 to current + 2).
            for (var i = 0; i < 5; i++) {
                var no = page - 2 + i; // Calculate a potential page number.
                // Ensure the calculated page number is valid and not redundant (i.e., not 1 or totalPage).
                if (no > 1 && no <= totalPage - 1) {
                    list.push(no);
                }
            }
            if (page + 1 < totalPage - 1) { // If the current page is significantly far from the last page, add an ellipsis.
                list.push('...');
            }
            if (totalPage > 1) { // Always include the last page, unless there's only one page.
                list.push(totalPage);
            }

            // --- Render each page number or ellipsis in the generated list ---
            $.each(list, function (index, item) {
                var $li = $('<li><a></a></li>'); // Create a new list item for the page number.
                if (item === '...') {
                    $li.addClass('').html('...'); // For ellipses, just display text, no click handler.
                } else if (item === page) {
                    $li.addClass('active').find('a').text(item); // For the current page, mark it as active.
                } else {
                    // For other valid page numbers, make them clickable links.
                    $li.find('a').text(item).prop('title', '第' + item + '页').on('click', function (e) {
                        $el.data('page', item); // Set the new page number in the element's data.
                        that.$mmGrid.load(); // Trigger a grid reload for the selected page.
                    });
                }
                $pageList.append($li); // Add the page list item to the main page list.
            });

            // --- Render 'Next' button ---
            var $next = $('<li class="next"><a title="下一页">»</a></li>');
            if (page >= totalPage) {
                // If on the last page or beyond, disable the 'Next' button.
                $next.addClass('disable');
            } else {
                // Otherwise, enable it and attach a click handler.
                $next.find('a').on('click', function () {
                    $el.data('page', page + 1); // Increment the page number.
                    that.$mmGrid.load(); // Trigger a grid reload for the next page.
                });
            }
            $pageList.append($next); // Add the 'Next' button to the page list.
        } // End of _plain method

        , /*
         * _search: Placeholder method for a potential 'search' style pagination.
         * This method is intentionally left empty in the original implementation.
         * It could be extended in the future to implement a different pagination UI/logic,
         * for example, a text input for direct page number entry.
         *
         * @param {number} page - The current page number.
         * @param {number} totalCount - The total number of records.
         * @param {number} limit - The number of items displayed per page.
         */
        _search: function (page, totalCount, limit) {
            // No implementation provided for '_search' style pagination.
        }

        , /*
         * load: Loads and updates the pagination state based on provided parameters.
         * This is the primary method called by the associated grid or directly
         * to refresh the paginator's display.
         *
         * @param {object} params - An object containing pagination parameters
         *                          such as page, totalCount, and limit.
         */
        load: function (params) {
            // Local references for convenience and potential performance.
            var $el = this.$el;
            var $limitList = this.$limitList;
            var opts = this.opts;

            // Ensure the 'params' object is initialized, even if not provided.
            if (!params) {
                params = {};
            }

            // Determine the current page number.
            // Prioritize the 'page' from the 'params' object.
            var page = params[opts.pageParamName];
            if (page === undefined || page === null) {
                // If not found in params, retrieve it from the element's data attribute.
                page = $el.data('page');
            }
            // Store the determined page number back into the element's data.
            $el.data('page', page);

            // Determine the total count of records.
            // Prioritize 'totalCount' from the 'params' object.
            var totalCount = params[opts.totalCountName];
            if (totalCount === undefined) {
                totalCount = 0; // Default to 0 if totalCount is not provided.
            }
            // Store the determined total count into the element's data.
            $el.data('totalCount', totalCount);

            // Determine the limit (items per page).
            // Prioritize 'limit' from the 'params' object.
            var limit = params[opts.limitParamName];
            if (!limit) {
                // If not found in params, get the currently selected value from the limit dropdown.
                limit = $limitList.val();
            }
            // Update the limit dropdown's selected value to reflect the determined limit.
            this.$limitList.val(limit);

            // Update the text of the total count label using the format string.
            this.$totalCountLabel.html(this.formatString(opts.totalCountLabel, [totalCount]));
            // Clear all existing page number elements before rendering the new set.
            this.$pageList.empty();

            // Render the actual pagination controls using the '_plain' method (default style).
            this._plain(page, totalCount, this.$limitList.val());
        }

        , /*
         * formatString: A utility method to format a string by replacing placeholders.
         * It replaces `{0}`, `{1}`, etc., with corresponding values from an arguments array.
         *
         * @param {string} text - The format string containing placeholders.
         * @param {Array} args - An array of values to substitute into the placeholders.
         * @returns {string} The formatted string.
         */
        formatString: function (text, args) {
            // Use a regular expression to find all occurrences of placeholders like {digit}.
            return text.replace(/{(\d+)}/g, function (match, number) {
                // Check if the argument at the specified index exists.
                return typeof args[number] != 'undefined'
                    ? args[number] // If it exists, return the argument's value.
                    : match        // Otherwise, return the original placeholder string.
                ;
            });
        }

        , /*
         * params: Returns an object containing the current pagination parameters.
         * This object is suitable for passing to a server-side API when fetching data.
         *
         * @returns {object} An object with current page and limit parameters.
         */
        params: function () {
            // Local references for options, main element, and limit list.
            var opts = this.opts;
            var $el = this.$el;
            var $limitList = this.$limitList;

            var params = {};
            // Populate the params object with the current page and limit values.
            params[opts.pageParamName] = $el.data('page');
            params[opts.limitParamName] = $limitList.val();
            return params;
        }

        , /*
         * init: Initializes the paginator and links it to a grid component.
         * This method sets up initial state, renders the layout, and attaches
         * event listeners to communicate with the grid.
         *
         * @param {jQuery} $grid - The jQuery object representing the associated grid component.
         */
        init: function ($grid) {
            var that = this; // Cache 'this' for use in event handlers.
            var opts = that.opts; // Get the options for this paginator instance.

            this.$mmGrid = $grid; // Store a reference to the associated grid.
            this._initLayout(); // Call the layout initialization method.

            // Attach a 'loadSuccess' event listener to the grid.
            // This ensures that whenever the grid successfully loads new data,
            // the paginator is updated with the new total count and current page.
            this.$mmGrid.on('loadSuccess', function (e, data) {
                that.load(data); // Call the paginator's load method with the grid's data.
            });

            // Set initial pagination parameters based on default options and load them.
            var params = {};
            params[opts.totalCountName] = 0; // Initialize total count to 0.
            params[opts.pageParamName] = opts.page; // Set initial page from options.
            params[opts.limitParamName] = opts.limit; // Set initial limit from options.
            this.load(params); // Trigger an initial load of the paginator.

            // If the grid has an index column (e.g., for row numbering),
            // override its renderer to display correct, paginated row numbers.
            if ($grid.opts.indexCol) {
                var indexCol = $grid.opts.cols[0]; // Assuming the index column is the first column.
                // Define a custom renderer function for the index column.
                indexCol.renderer = function (val, item, rowIndex) {
                    var params = that.params(); // Get the current pagination parameters.
                    // Calculate the actual row index considering the current page and limit.
                    return '<label class="mmg-index">' +
                        (rowIndex + 1 + ((params[opts.pageParamName] - 1) * params[opts.limitParamName])) +
                        '</label>';
                };
            }

        }

    }; // End of MMPaginator.prototype definition.

    /*
     * jQuery plugin definition for 'mmPaginator'.
     * This makes the MMPaginator functionality available as a jQuery plugin,
     * allowing users to call `.mmPaginator()` on a jQuery-wrapped element.
     */
    $.fn.mmPaginator = function () {

        // Check the arguments to determine if it's an initialization call or a method call.
        if (arguments.length === 0 || typeof arguments[0] === 'object') {
            // This branch handles plugin initialization:
            var option = arguments[0] // The options object passed by the user (can be undefined).
                , data = this.data('mmPaginator') // Check if an MMPaginator instance already exists on this element.
                , options = $.extend(true, {}, $.fn.mmPaginator.defaults, option); // Merge default options with user-provided options.

            if (!data) {
                // If no instance exists, create a new one.
                data = new MMPaginator(this[0], options);
                this.data('mmPaginator', data); // Store the new instance in the element's jQuery data.
            }
            // Return the jQuery object, extended with the paginator instance's methods.
            // This allows for chaining jQuery methods.
            return $.extend(true, this, data);
        }

        // This branch handles method calls (e.g., `$(selector).mmPaginator('load', params)`):
        if (typeof arguments[0] === 'string') {
            var data = this.data('mmPaginator'); // Retrieve the MMPaginator instance from the element's data.
            var fn = data[arguments[0]]; // Get the method to be called from the instance.

            if (fn) {
                var args = Array.prototype.slice.call(arguments); // Convert the arguments object to a real array.
                // Call the method on the paginator instance, passing all arguments
                // except the first one (which is the method name itself).
                return fn.apply(data, args.slice(1));
            }
        }
    };

    // Define default options for the mmPaginator plugin.
    // These defaults can be overridden during plugin initialization.
    $.fn.mmPaginator.defaults = {
        style: 'plain' // The default visual style of the paginator (e.g., 'plain', 'search').
        , totalCountName: 'totalCount' // The key name for total record count in data objects.
        , page: 1 // The initial page number to display.
        , pageParamName: 'page' // The parameter name used for page number in API requests.
        , limitParamName: 'limit' // The parameter name used for items per page in API requests.
        , limitLabel: '每页{0}条' // The label format for the limit dropdown options.
        , totalCountLabel: '共<span>{0}</span>条记录' // The label format for displaying total records.
        , limit: undefined // The default number of items per page. If undefined, the first from limitList is often used.
        , limitList: [20, 30, 40, 50] // An array of available options for items per page dropdown.
    };

    // Make the MMPaginator constructor itself accessible via the jQuery plugin object.
    // This allows advanced users to directly access the constructor if needed,
    // for example, to extend it or create instances without jQuery chaining.
    $.fn.mmPaginator.Constructor = MMPaginator;

}(window.jQuery); // Pass 'window.jQuery' (or 'jQuery' if available globally) into the IIFE as '$'.