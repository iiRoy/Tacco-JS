/*
 * ===========================================================================================
 * This is a Type I clone of bootstrap-portfilter.js, originally for Bootstrap v2.3.1.
 * Source repository: https://github.com/geedmo/portfilter
 * ===========================================================================================
 *
 * Original Copyright (c) 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ===========================================================================================
 *
 * This JavaScript file implements a very lightweight portfolio filter functionality
 * for Bootstrap-based web applications, leveraging jQuery.
 *
 * Author: Geedmo (http://geedmo.com)
 * Version: 1.0 (unchanged from original)
 *
 * How to use this filter:
 *   1. For filter control elements (e.g., buttons, links):
 *      <any-tag data-toggle="portfilter" data-target="category-name">...</any-tag>
 *   2. For filterable items within your portfolio:
 *      <any-tag data-tag="category-name">...</any-tag>
 *      Use "all" as data-target to show all items.
 *
 * ===========================================================================================
 */

!function ($) {

  "use strict"; /* This enables strict mode, useful for catching common coding errors. */

    // Define the plugin's name, used for jQuery data storage and method calls.
    var pluginName = 'portfilter';


    /*
     * PUBLIC CLASS DEFINITION
     * ============================================================
     * This section defines the main PortFilter class constructor.
     */

    var PortFilter = function (element) { // The constructor takes the DOM element as an argument.

        // Store a jQuery wrapped version of the element that triggered the filter.
        this.$element = $(element);

        // Find all elements that are candidates for filtering based on 'data-tag'.
        this.stuff = $('[data-tag]');

        // Determine the specific target tag for this filter instance.
        // It defaults to an empty string if not explicitly set.
        this.target = this.$element.data('target') || '';

    }; // End of PortFilter constructor.


    // Define the 'filter' method on the PortFilter prototype.
    PortFilter.prototype.filter = function (params) {

        // Initialize an array to hold items that match the filter criteria.
        var items = [],
            // Get the target category from the current instance.
            target = this.target;

        // Start the filtering process by fading out current items.
        this.stuff
            .fadeOut('fast') // Fade out all filterable items quickly.
            .promise()       // Ensure the fadeOut animation is complete before proceeding.
            .done(function () { // Callback executed once the fadeOut is finished.

                // Iterate over each of the 'stuff' elements.
                $(this).each(function () {
                    // Check if the item's data-tag matches the target or if target is 'all'.
                    if ($(this).data('tag') == target || target == 'all') {
                        items.push(this); // If it matches, add it to the 'items' array.
                    }
                });

                // Now, display only the items that matched the filter criteria.
                $(items).show();

            });

    }; // End of filter method.


    /*
     * PLUGIN DEFINITION
     * ============================================================
     * This section integrates PortFilter into jQuery as a plugin.
     */

    // Store the original jQuery plugin value, if any, to prevent conflicts.
    var old = $.fn[pluginName];

    // Define the jQuery plugin method.
    $.fn[pluginName] = function (option) {

        // Iterate over each selected element.
        return this.each(function () {

            var $this = $(this), // Current element wrapped in jQuery.
                // Retrieve existing plugin instance data from the element, if it exists.
                data = $this.data(pluginName);

            // If no plugin instance exists, create a new one and store it.
            if (!data) $this.data(pluginName, (data = new PortFilter(this)));

            // If the option is 'filter', call the filter method on the instance.
            if (option == 'filter') data.filter();

        });

    }; // End of jQuery plugin definition.


    // DEFAULTS: Provide a place for default options, though none are currently defined.
    $.fn[pluginName].defaults = {};


    // CONSTRUCTOR CONVENTION: Expose the constructor for advanced usage or extension.
    $.fn[pluginName].Constructor = PortFilter;


    /*
     * PORTFILTER NO CONFLICT
     * ============================================================
     * This provides a noConflict mechanism for the plugin.
     */

    $.fn[pluginName].noConflict = function () {
        // Restore the previous value of $.fn[pluginName].
        $.fn[pluginName] = old;
        // Return the current plugin's jQuery object for chaining.
        return this;
    };


    /*
     * PORTFILTER DATA-API
     * ============================================================
     * This enables automatic initialization via data attributes.
     */

    // Attach a click event handler to elements with 'data-toggle^=portfilter'.
    // The event is delegated from the document for efficiency.
    $(document).on('click.portfilter.data-api', '[data-toggle^=portfilter]', function (e) {
        // When clicked, call the 'portfilter' plugin with the 'filter' option.
        $(this).portfilter('filter');
    });


}(window.jQuery); // Pass the jQuery object into the IIFE.