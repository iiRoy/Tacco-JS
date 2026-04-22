/*
 * ResponsiveNavigation jQuery Plugin
 *
 * This plugin provides responsive navigation functionality.
 *
 * Original Copyright (c) 2012 Jeremy Worboys.
 * Licensed under the ☺ Licence.
 * See http://licence.visualidiot.com for details.
 *
 * This file is a Type I clone:
 * - Identifiers, variable names, function names, operators, and expressions are unchanged.
 * - Whitespace (indentation, spacing, blank lines) and comments have been extensively modified.
 */

; (function ($, undefined) {

    // Main plugin function definition for jQuery
    $.fn.responsiveNavigation = function (options) {

        // Ensure options object is initialized, if not provided
        if (options === undefined) {
            options = {}; // Initialize to an empty object
        }

        // Define default options, merging with any provided options
        var opts = $.extend(
            {
                search: "nav", // Selector for navigation elements to convert
                nested: true, // Whether to handle nested navigation elements

                wrap: true, // Whether to wrap the generated select element
                wrapper: "nav", // HTML tag for the wrapper element
                wrapperClass: "responsive-nav-wrapper", // CSS class for the wrapper
                wrapperId: "", // ID for the wrapper element

                selectClass: "responsive-nav", // CSS class for the generated select
                selectId: "", // ID for the generated select element

                defaultText: "Navigation...", // Default text for the first option in the select

                group: true, // Whether to group options into optgroups
                groupLabel: "label", // Data attribute for optgroup labels
                groupOrder: "order" // Data attribute for optgroup sorting order
            },
            options
        ),

            // Helper function for sorting option groups based on a data attribute
            optgroupSort = function ($a, $b) {
                // Parse integer values from data attributes for comparison
                var a = parseInt($a.data("order"), 10),
                    b = parseInt($b.data("order"), 10);

                // Handle cases where data attributes might be missing or not numbers
                if ((isNaN(a) && isNaN(b)) || a === b) {
                    return 0; // Treat as equal if both are NaN or values are identical
                } else if (isNaN(b) || a < b) {
                    return -1; // 'a' comes before 'b' if 'b' is NaN or 'a' is smaller
                }
                return 1; // 'b' comes before 'a' otherwise
            };

        // Iterate over each selected element (e.g., header) to apply the plugin
        return this.each(function () {
            var $header = $(this), // Current header element being processed
                $navs = $header.find(opts.search), // All navigation elements within the header
                optgroups = [], // Array to store generated optgroups or options
                $select; // Variable to hold the generated select element

            // If no navigation elements are found, skip this header
            if ($navs.length < 1) {
                return; // Move to the next element in the collection
            }

            // If only one navigation element exists, disable grouping by default
            // unless explicitly enabled in options
            if ($navs.length === 1) {
                opts.group = options.group || false;
            }

            // If nested navigation handling is enabled
            if (opts.nested) {
                // Iterate through each main navigation element
                $navs.each(function () {
                    // Detach any nested navigation elements and re-append them to the main header.
                    // This flattens the navigation structure for processing.
                    $(this)
                        .find(opts.search) // Find nested navs
                        .detach() // Remove from current parent
                        .appendTo($header); // Add back to the main header
                });
            }

            // Process each identified navigation element
            $navs.each(function () {
                var $nav = $(this), // The current navigation element
                    options = []; // Array to hold <option> elements for this nav

                // Find all anchor links within the current navigation
                $nav
                    .find("a") // Select all 'a' tags
                    .each(function () {
                        var $link = $(this); // Current anchor link

                        // Create an <option> element for each link
                        options.push(
                            $("<option>") // Create new option element
                                .val($link.attr("href")) // Set its value to the link's href
                                .text($link.text()) // Set its text to the link's text
                        );
                    });

                // If grouping is enabled, create an optgroup
                if (opts.group) {
                    // Create a new optgroup element
                    var $optgroup = $("<optgroup>")
                        .attr("label", $nav.data(opts.groupLabel)) // Set label from nav's data
                        .data("order", $nav.data(opts.groupOrder)); // Store order for sorting

                    // Append all generated options to this optgroup
                    $.each(options, function (i, opt) {
                        $optgroup.append(opt);
                    });

                    // Replace the options array with the single optgroup for subsequent processing
                    options = $optgroup;
                }

                // Add the processed options (or optgroup) to the global optgroups array
                $.each(options, function (i, grp) {
                    optgroups.push($(grp)); // Ensure it's a jQuery object
                });
            });

            // Sort the collected optgroups if grouping is enabled
            if (opts.group) {
                optgroups = optgroups.sort(optgroupSort);
            }

            // Create the main <select> element
            $select = $("<select>")
                .addClass(opts.selectClass) // Apply configured class
                .attr("id", opts.selectId); // Apply configured ID

            // Add the default "Navigation..." option to the select
            $select.append(
                $("<option>")
                    .text(opts.defaultText) // Set default text
                    .attr("disabled", "disabled") // Make it non-selectable
            );

            // Append all collected optgroups/options to the select element
            $(optgroups).each(function () {
                $select.append($(this));
            });

            // Attach a change event handler to the select element
            $select.on("change", function () {
                // Redirect the browser to the URL of the selected option
                window.location = $(this)
                    .find(":selected") // Find the currently selected option
                    .val(); // Get its value (which is the URL)
            });

            // If wrapping is enabled, create a wrapper element
            if (opts.wrap) {
                $select = $("<" + opts.wrapper + ">") // Create wrapper element (e.g., <nav>)
                    .addClass(opts.wrapperClass) // Apply wrapper class
                    .attr("id", opts.wrapperId) // Apply wrapper ID
                    .append($select); // Place the select inside the wrapper
            }

            // Finally, append the generated select (or its wrapper) to the header
            $header.append($select);
        });
    };
})(jQuery); // Pass jQuery as $ and undefined to ensure local scope