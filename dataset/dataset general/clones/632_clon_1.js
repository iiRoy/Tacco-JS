/*
 *  hColumns - A jQuery plugin for creating column-based navigation interfaces.
 *  Original author: bu <bu@hax4.in>
 *  License: BSD License.
 *
 *  This file contains the core logic for the hColumns plugin,
 *  providing functionalities like node sourcing, column rendering,
 *  and event handling for interactive navigation.
 *
 *  Extensive modifications to whitespace and comments have been made
 *  to present a visually distinct, yet functionally identical,
 *  Type I clone of the original source code.
 */

(function($) {
    // Default configuration options for the hColumns plugin.
    // These can be overridden by user-provided settings during initialization.
    var defaultConfig = {
        nodeSource: function() {
            // A placeholder function for fetching node data.
            // Users MUST provide their own implementation for this.
            return window.alert("dummy source, you need to create a node source");
        },

        // String to display when a column has no content.
        noContentString: "There is no node here",

        // Placeholder text for the search input field.
        searchPlaceholderString: "Search...",

        // Flag to enable/disable the search functionality within columns.
        searchable: false,

        // Custom indicators for different node types.
        // This object maps node types to CSS classes for icons.
        customNodeTypeIndicator: {},

        // Custom handlers for different node types.
        // These functions define the behavior when a node of a specific type is clicked.
        customNodeTypeHandler: {}
    };


    // Default handlers for common node types.
    // These functions define what happens when a 'folder' or 'link' node is clicked.
    var defaultHandler = {

        // Handler for 'folder' type nodes.
        // It fetches children nodes and adds a new column to the view.
        folder: function(hColumn, node, data) {
            // Call the nodeSource to get children of the clicked folder.
            hColumn.nodeSource(data.id, function(err, data) {
                if (err) {
                    // Handle any errors during data fetching.
                    return $.error(err);
                }

                // Add a new column with the fetched data.
                return hColumn.columnView._addColumnList(data, hColumn.columnView);
            });
        },

        // Handler for 'link' type nodes.
        // Opens the URL associated with the link node in a new window.
        link: function(hColumn, node, data) {
            return window.open(data.url);
        }
    };


    // Default icon indicators for standard node types.
    // These are CSS classes that will be applied to <i> elements.
    var defaultIndicator = {
        folder: "icon-chevron-right", // Icon for folder nodes.
        link: "icon-globe" // Icon for link nodes.
    };


    // All public and private methods of the hColumns plugin are encapsulated here.
    var methods = {

        // Initialization method for the plugin.
        // Called when `$(selector).hColumns()` is invoked.
        init: function(options) {
            // Merge default configuration with user-provided options.
            var settings = $.extend(defaultConfig, options);

            // Merge default handlers with any custom handlers provided by the user.
            var handlers = $.extend(defaultHandler, settings.customNodeTypeHandler);

            // Merge default indicators with any custom indicators provided by the user.
            var indicators = $.extend(defaultIndicator, settings.customNodeTypeIndicator);


            // Iterate over each selected element to apply the plugin.
            return this.each(function() {
                var self = $(this), // The current jQuery object for the element.
                    data = self.data("columnView"); // Check if plugin already initialized.

                // Store the merged settings.
                methods.settings = settings;

                // Bind the column view instance and handlers/indicators to the settings object.
                settings.columnView = methods;
                settings.handlers = handlers;
                settings.indicators = indicators;

                // Reference to the main container DOM node.
                settings.container_node = this;

                // Check if the hColumn instance has not been initialized on this element yet.
                if (!data) {
                    // Store the settings object with the element, keyed as "hColumn".
                    self.data("hColumn", settings);

                    // Add a base class for styling the main container.
                    self.addClass("column-view-container");

                    // Create and append the main composition div where columns will reside.
                    $("<div></div>").addClass("column-view-composition").appendTo(self);

                    // Attach a delegated click event handler for list entries within columns.
                    // This uses event delegation for efficiency.
                    self.on("click", ".column ul li:not('.search')", settings.columnView._entryClick);


                    // Perform the initial data load for the first column.
                    // It requests data for a null ID, typically meaning root level items.
                    settings.nodeSource(null, function(err, data) {
                        if (err) {
                            // Display an error if the initial data fetch fails.
                            return $.error(err);
                        }

                        // Add the initial column list to the view.
                        return settings.columnView._addColumnList(data);
                    });
                }
            });
        },


        // Private method: Handles click events on individual list entries (nodes).
        _entryClick: function() {
            // Find the main hColumn container and retrieve its settings.
            var columnView = $(this).parents(".column-view-container").data("hColumn");

            // Store references to relevant DOM elements.
            var current_container = $(this).parents(".column-view-container");
            var current_click_column = $(this).parents(".column");

            // Determine the index (level) of the clicked column.
            var current_click_level = $(this).parents(".column").index();

            // Retrieve data attributes from the clicked list item.
            var current_node_type = $(this).data("node-type");
            var current_node_data = $(this).data("node-data");

            // Remove any columns that are to the right of the clicked column.
            // This ensures only relevant sub-columns are displayed.
            $(current_container).find(".column-view-composition .column:gt(" + current_click_level + ")").remove();

            // Remove 'active' class from previously active items in the current column.
            current_click_column.find(".active").removeClass("active");

            // Add 'active' class to the newly clicked item.
            $(this).addClass("active");

            // Redirect the action based on the node's type using the registered handlers.
            return columnView.handlers[current_node_type](columnView, this, current_node_data);
        },


        // Private method: Adds a new column populated with a list of nodes.
        _addColumnList: function(list, columnView) {
            // Determine the correct context for 'self' (either 'this' or provided columnView).
            var self = (!columnView) ? this : columnView;

            // Create an unordered list element to hold the node entries.
            var ListElm = $("<ul></ul>");


            // If the list of nodes is empty, display a "no content" message.
            if (list.length === 0) {
                var NoContentElm = $("<p></p>").text(columnView.settings.noContentString);

                return self._addColumn(NoContentElm, self);
            }

            // If search is enabled, add a search input field to the column.
            if (self.settings.searchable) {
                self._addColumnSearch(ListElm);
            }

            // Loop through the provided list of nodes to create list items.
            for (var i = 0; i < list.length; i++) {
                // Create a list item element and attach node-specific data.
                var EntryElm = $(document.createElement('li'))
                    .data("node-id", list[i].id)
                    .data("node-type", list[i].type)
                    .data("node-data", list[i])
                    .attr('title', list[i].label);

                // Create an icon element and apply the appropriate indicator class.
                var EntryIconElm = $(document.createElement('i')).addClass(self.settings.indicators[list[i].type]);

                // Append the label text and the icon to the list item.
                EntryElm[0].appendChild(document.createTextNode(list[i].label));
                EntryElm[0].appendChild(EntryIconElm[0]);

                // Append the fully constructed list item to the main unordered list.
                ListElm[0].appendChild(EntryElm[0]);
            }

            // Finally, add the constructed list (within its column) to the view.
            return self._addColumn(ListElm, self);
        },


        // Private method: Adds a search input field to a column.
        _addColumnSearch: function(listElm) {
            // Create the search list item with an input field.
            $('<li class="search"><input type="text" placeholder=" ' + this.settings.searchPlaceholderString + '"></li>')
                .on('keyup', 'input', function(event) { // Attach a keyup event listener to the input.
                    var searchTerm = $(this).val(); // Get the current search term.

                    // Only perform search if the term has at least 2 characters.
                    if (searchTerm.length >= 2) {
                        // Iterate over sibling list items (excluding the search input itself).
                        $(this).closest('li').siblings().each(function() {
                            // Hide items that don't match the search term (case-insensitive).
                            if (searchTerm !== '' && $(this).data('node-data').label.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
                                $(this).hide();
                            } else {
                                // Show items that do match or if search term is empty.
                                $(this).show();
                            }
                        });
                    } else {
                        // If search term is too short, show all sibling items.
                        $(this).closest('li').siblings().show();
                    }
                }).appendTo(listElm); // Append the search item to the provided list element.
        },


        // Private method: Adds a generic content node as a new column to the view.
        _addColumn: function(content_dom_node, columnView) {
            // Create a new div element for the column.
            var ColumnElm = $("<div></div>").addClass("column");

            // Append the provided content (e.g., a list or a "no content" message) to the column.
            ColumnElm.append(content_dom_node);

            // Find the composition area within the main container and append the new column.
            $(columnView.settings.container_node).find(".column-view-composition").append(ColumnElm);

            // Scroll the container horizontally to show the newly added column.
            $(columnView.settings.container_node).scrollLeft($(".column-view-composition").width());
        }
    };


    // jQuery plugin definition: `$.fn.hColumns`
    // This allows users to call the plugin methods like `$(selector).hColumns('init', options)`.
    $.fn.hColumns = function(method) {
        // Method calling logic:
        // Check if the requested method exists in our 'methods' object.
        if (methods[method]) {
            // If it exists, call the method and pass arguments (excluding the method name itself).
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        // If no method is specified, or if the argument is an object (meaning options for init),
        // then call the 'init' method.
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        // If an unknown method is requested, throw an error.
        else {
            $.error('Method ' + method + ' does not exist on jQuery.hColumns');
        }
    };

})(jQuery); // Pass jQuery object into the Immediately Invoked Function Expression (IIFE).