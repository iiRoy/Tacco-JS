/*
 * Global variable declaration for jQuery to prevent linting errors.
 */
/*global jQuery */


// Self-executing anonymous function to encapsulate the plugin logic.
(function ($) {
    'use strict'; // Enforce strict JavaScript rules for cleaner code.

    // Plugin-wide variables and default settings.
    var pluginName = 'phpdiffmerge', // The name of our plugin.
        defaults = { // Default options for the plugin.
            left: '', // Source content for the left side of the diff.
            right: '', // Source content for the right side of the diff.
            debug: false, // Flag to enable/disable debug logging.
            pupupResult: false, // Flag to show the merged result in a popup.
            pupupSources: false, // Flag to show source contents in popups.
            merged: $.noop() // Callback function to execute after merge completion.
        },
        count = 0; // A counter to assign unique IDs to plugin instances.


    /**
     * PHPDiffMerge constructor function.
     * Initializes a new instance of the PHPDiffMerge plugin.
     *
     * @param {HTMLElement} element The DOM element to which the plugin is attached.
     * @param {Object} options Configuration options for the plugin instance.
     */
    function PHPDiffMerge(element, options) {
        var self = this; // Store a reference to the current instance for scope.

        // Assign a unique ID to this plugin instance.
        self._id = 1 + count++;

        // Cache the jQuery-wrapped DOM element.
        self.$el = $(element);

        // Merge default options with user-provided options.
        // The last argument (options) overrides previous ones.
        self.options = $.extend({}, defaults, options);

        // Store the original default options.
        self._defaults = defaults;

        // Store the plugin name.
        self._name = pluginName;


        // *** PUBLIC VARIABLES ***
        // These variables are accessible from outside the plugin instance.

        // jQuery collection of conflict elements found within the main element.
        self.$conflicts = $();

        // Array to store instances of the Conflict class.
        self.conflicts = [];

        // Counters for conflicts that need resolution and merging.
        self.toResolve = 0; // Number of conflicts yet to be resolved by the user.
        self.toMerge = 0; // Number of conflicts yet to be processed during merge.

        // Boolean indicating if the diff view is inline or side-by-side.
        self.inline = false;

        // Array to store the final merged result.
        self.result = [];

        // Offset for line numbers during the merge process.
        self.lineOffset = 0;

        // Temporary line offset used during conflict processing.
        self._tmpLineOffset = 0;


        // Initialize the plugin instance.
        self._init();
    }


    // Define methods for the PHPDiffMerge prototype.
    PHPDiffMerge.prototype = {

        // *** CONSTRUCTION METHODS ***

        /**
         * The primary initialization method for the PHPDiffMerge plugin.
         * Sets up event listeners, finds conflicts, and prepares for merging.
         */
        _init: function () {
            var self = this; // Maintain scope.

            // Log a debug message indicating plugin initialization.
            self._debug('PHPDiffMerge about to be initiated with options:', self.options);

            // Find all potential conflict containers within the main element.
            // These are identified by specific CSS classes.
            self.$conflicts = self.$el.find('.ChangeReplace, .ChangeDelete, .ChangeInsert');

            // Initialize the conflict resolution counter.
            self.toResolve = self.$conflicts.length;

            // Check for critical data presence before proceeding.
            // If no conflicts are found OR if source content is missing, return false.
            if (self.toResolve <= 0 || (self.options.left === '' && self.options.right === '')) {
                // Log a warning if there's nothing to merge or sources are unavailable.
                self._debug('Nothing to merge or merge sources not available - ' +
                    'Please submit left and right on plug-in initiation!');
                return false; // Stop initialization.
            }

            // Determine if the diff display style is 'inline'.
            this.inline = self.$el.hasClass('DifferencesInline');

            // Ensure a merge button exists or create one if necessary.
            self._ensurePresenceOfMergeButton();

            // Iterate over each found conflict element and create a Conflict object for it.
            $.each(self.$conflicts, function () {
                self.conflicts.push(new Conflict(this, self)); // 'this' refers to the current DOM element.
            });

            // Register event listeners for conflict resolution and merging.
            // The 'xiphe_phpdiffmerge_resolved' event triggers when a conflict is marked resolved.
            self.$conflicts.on('xiphe_phpdiffmerge_resolved', $.proxy(self._conflictResolved, self));
            // The 'xiphe_phpdiffmerge_merged' event triggers when a conflict is processed during the merge.
            self.$conflicts.on('xiphe_phpdiffmerge_merged', $.proxy(self._conflictMerged, self));
            // This event also updates the global line offset.
            self.$conflicts.on('xiphe_phpdiffmerge_merged', $.proxy(self._updateLineOffset, self));

            // Final debug message upon successful initiation.
            self._debug('PHPDiffMerge initiated', self);
        },


        // *** PUBLIC METHODS ***
        // Methods intended for external use.

        /**
         * Selects all changes on the right side of the diff.
         * This simulates clicking all 'Right' options.
         */
        useRight: function () {
            var self = this; // Scope preservation.

            // Trigger click on all 'Right' cells within conflicts.
            self.$conflicts.find('td.Right').click();

            // Special handling for inline diffs:
            // If inline, also "click away" any 'Left' deletions to ensure 'Right' takes precedence.
            if (self.$el.hasClass('DifferencesInline')) {
                self.$el.find('.ChangeDelete td.Left').click().click();
            }
        },

        /**
         * Selects all changes on the left side of the diff.
         * This simulates clicking all 'Left' options.
         */
        useLeft: function () {
            var self = this; // Scope preservation.

            // Trigger click on all 'Left' cells within conflicts.
            self.$conflicts.find('td.Left').click();

            // Special handling for inline diffs:
            // If inline, also "click away" any 'Right' insertions to ensure 'Left' takes precedence.
            if (self.$el.hasClass('DifferencesInline')) {
                self.$el.find('.ChangeInsert td.Right').click().click();
            }
        },

        /**
         * Initiates the merge process for all resolved conflicts.
         *
         * @param {Event} event The event object, if called from an event listener (e.g., button click).
         */
        merge: function (event) {
            var self = this; // Scope preservation.

            // Prevent default event behavior if an event object is provided.
            if (typeof event !== 'undefined' && event !== null) {
                event.preventDefault();
            }

            // Check if the merge button is disabled, indicating unresolved conflicts.
            if (self.options.button.attr('disabled') === 'disabled') {
                self._debug('Unable to merge: not all conflicts have been resolved.');
                return; // Exit if not all conflicts are resolved.
            }

            /*
             * Begin the merge process by cloning the left side content.
             * This ensures we start with a base and apply changes to it.
             */
            self.result = self.options.left.slice(0);

            // Reset the global line offset before starting a new merge.
            self.lineOffset = 0;

            // Reset the counter for conflicts to be merged.
            self.toMerge = self.$conflicts.length;

            // Iterate through each Conflict object and trigger its merge method.
            for (var i = 0; i < self.conflicts.length; i++) {
                self.conflicts[i].merge();
            }
        },

        /**
         * Allows changing plugin options *after* initialization.
         *
         * @param {Object} options A plain JavaScript object containing new options.
         */
        option: function (options) {
            var self = this; // Scope preservation.

            // Only extend options if the provided 'options' argument is a plain object.
            if ($.isPlainObject(options)) {
                // Use deep extend to merge new options with existing ones.
                self.options = $.extend(true, self.options, options);
            }
        },


        // *** PROTECTED METHODS ***
        // Methods intended for internal use within the plugin.

        /**
         * Checks for the presence of a merge button.
         * If not found, it creates a default merge button and appends it.
         * It also attaches the `merge` method to the button's click event.
         */
        _ensurePresenceOfMergeButton: function () {
            var self = this; // Scope preservation.

            // Check if a button is defined in options and if it exists in the DOM.
            if (typeof self.options.button === 'undefined' || !$(self.options.button).length) {
                // If no button is specified or found, create a default one.
                self.options.button = $('<button />') // Create a new button element.
                    .html('Merge') // Set its text.
                    .attr('disabled', 'disabled') // Start with the button disabled.
                    .css({ // Apply some default styling.
                        display: 'block',
                        height: '50px',
                        width: '200px',
                        margin: '50px auto'
                    });
                // Append the newly created button after the main plugin element.
                self.$el.after(self.options.button);
            } else {
                // If a button was specified and found, wrap it in jQuery and disable it initially.
                self.options.button = $(self.options.button).attr('disabled', 'disabled');
            }

            // Attach the merge function to the button's click event.
            // Use $.proxy to ensure 'self' context is maintained.
            self.options.button.click($.proxy(self.merge, self));
        },

        /**
         * Debug logging utility.
         * Logs messages to the console if debugging is enabled.
         */
        _debug: function () {
            // Check if debug mode is active and if the console is available.
            if (this.options.debug && window.console && window.console.log) {
                // Convert arguments to a real array and log them.
                window.console.log(Array.prototype.slice.call(arguments));
            }
        },

        /**
         * Callback function executed when a conflict is marked as resolved.
         * Decrements the `toResolve` counter and enables the merge button if all are resolved.
         */
        _conflictResolved: function () {
            var self = this; // Scope preservation.

            self.toResolve--; // Decrement the count of unresolved conflicts.

            // If all conflicts are resolved, enable the merge button.
            if (self.toResolve === 0) {
                self.options.button.removeAttr('disabled');
            }
        },

        /**
         * Callback function executed when a conflict has been merged into the result.
         * Decrements the `toMerge` counter and performs final actions when all are merged.
         */
        _conflictMerged: function () {
            var self = this; // Scope preservation.

            self.toMerge--; // Decrement the count of conflicts remaining to be merged.

            // If all conflicts have been merged, perform post-merge actions.
            if (self.toMerge === 0) {
                // If configured, display the final merged result in a popup.
                if (self.options.pupupResult) {
                    popup('end', self.result.join('\n'));
                }
                // If configured, display the original source files in popups.
                if (self.options.pupupSources) {
                    popup('left', self.options.left.join('\n'));
                    popup('right', self.options.right.join('\n'));
                }
                // If a 'merged' callback function is provided, execute it.
                if (typeof self.options.merged === 'function') {
                    // Call the callback with the merged result and original sources.
                    self.options.merged.call(self, self.result, self.options.left, self.options.right);
                }
            }
        },

        /**
         * Deletes a specified number of rows from the `result` array at a given index.
         * Adjusts the temporary line offset accordingly.
         *
         * @param {number} index The 1-based starting line number in the original left source.
         * @param {number} length The number of rows to delete.
         */
        _deleteResult: function (index, length) {
            var self = this; // Scope preservation.

            // Log the deletion range for debugging purposes.
            self._debug('Deleting Left: ' + index + ' - ' + (index + length - 1) + '.');

            // Perform the deletion using splice.
            // (index + self.lineOffset - 1) converts 1-based original index to 0-based current array index.
            var out = self.result.splice((index + self.lineOffset - 1), length);

            // If debug mode is active, log the content that was deleted.
            if (self.options.debug) {
                out = out.map(function (value) {
                    return $.trim(value).substring(0, 10) + '...';
                });
                self._debug('Content: ', out);
            }

            // Update the temporary line offset to reflect the deletion.
            self._tmpLineOffset -= length;
        },

        /**
         * Inserts a specified number of rows from the right source into the `result` array.
         * Adjusts the temporary line offset accordingly.
         *
         * @param {number} index The 1-based starting line number in the original right source.
         * @param {number} length The number of rows to insert.
         * @param {number} targetIndex The 1-based line number in the `result` array where insertion should occur.
         */
        _insertResult: function (index, length, targetIndex) {
            var self = this; // Scope preservation.
            var insert = []; // Array to hold lines to be inserted for logging.

            // Loop through the lines to be inserted from the right source.
            for (var i = 0; i < length; i++) {
                // Get the content from the right source.
                var line = self.options.right[index - 1 + i];
                insert.push(line); // Add to the temporary 'insert' array.

                // Inject the line into the result array at the calculated position.
                // (targetIndex - 1 + self.lineOffset + i) accounts for 0-based index,
                // global line offset, and current iteration offset.
                self.result.splice((targetIndex - 1 + self.lineOffset + i), 0, line);
            }

            // If debug mode is active, log details of the insertion.
            if (self.options.debug) {
                self._debug('Left line prior to insertion: ' + (targetIndex - 1));
                self._debug(
                    'Content: ', $.trim(self.result[targetIndex - 2 + self.lineOffset]).substring(0, 10)
                );

                self._debug('Inserted Right: Row ' + index + ' - ' + (index + length - 1) + '.');

                insert = insert.map(function (value) {
                    return $.trim(value).substring(0, 10) + '...';
                });
                self._debug('Content: (' + insert.join(', ') + ')');
            }

            // Update the temporary line offset to reflect the insertion.
            self._tmpLineOffset += length;
        },

        /**
         * Updates the global `lineOffset` with the accumulated `_tmpLineOffset`.
         * Resets `_tmpLineOffset` after updating.
         */
        _updateLineOffset: function () {
            var self = this; // Scope preservation.

            // Log the change in line offset.
            self._debug('Change lineOffset from: ' + self.lineOffset + ' to ' +
                (self.lineOffset + self._tmpLineOffset) + '.');

            // Apply the temporary offset to the global offset.
            self.lineOffset += self._tmpLineOffset;

            // Reset the temporary offset for the next conflict.
            self._tmpLineOffset = 0;
        }
    };


    /**
     * Conflict constructor function.
     * Represents a single conflict block in the diff.
     *
     * @param {HTMLElement} element The DOM element representing the conflict.
     * @param {PHPDiffMerge} master A reference to the parent PHPDiffMerge instance.
     */
    function Conflict(element, master) {
        var self = this; // Store a reference to the current instance.

        self.$el = $(element); // Cache the jQuery-wrapped conflict element.
        self.master = master; // Store a reference to the master plugin instance.

        self._resolved = false; // Flag indicating if this conflict has been resolved by the user.
        self.type = ''; // Type of conflict (e.g., 'Replace', 'Insert', 'Delete').
        self.useLeft = false; // Boolean indicating if the left side was chosen for resolution.
        self.leftLine = 0; // Starting line number of the conflict in the left source.
        self.rightLine = 0; // Starting line number of the conflict in the right source.
        self.rowsLeft = 0; // Number of affected rows on the left side.
        self.rowsRight = 0; // Number of affected rows on the right side.

        self._init(); // Initialize the conflict instance.
    }


    // Define methods for the Conflict prototype.
    Conflict.prototype = {

        // *** CONSTRUCTION METHODS ***

        /**
         * Initializes a single conflict instance.
         * Determines its type, sets up event handlers, and calculates line/row counts.
         */
        _init: function () {
            var self = this; // Scope preservation.

            // Extract the conflict type (e.g., 'Replace') from the element's class name.
            self.type = self.$el.attr('class').match(/Change([\w]+)/)[1];

            // Attach click and hover event handlers to the table data (td) cells within the conflict.
            self.$el.find('td')
                .click($.proxy(self._clicked, self)) // Handle clicks on conflict cells.
                .hover($.proxy(self._hoverIn, self), $.proxy(self._hoverOut, self)); // Handle hover effects.

            self._setLine(); // Determine the starting line numbers for this conflict.
            self._setRows(); // Calculate the number of affected rows for this conflict.

            // Log the initialized conflict for debugging.
            self.master._debug('Conflict initiated:', self);
        },


        // *** PUBLIC METHODS ***

        /**
         * Merges this specific conflict into the main result array.
         * Applies deletion or insertion based on user's resolution choice and conflict type.
         */
        merge: function () {
            var self = this; // Scope preservation.

            // If the user chose to use the left side, then we simply ignore the right changes.
            if (self.useLeft) {
                self.master._debug(
                    'Ignoring lines ' + self.leftLine + ' - ' + (self.leftLine + self.rowsLeft - 1) + '.'
                );
                // Trigger the 'merged' event to update counters in the master plugin.
                self.$el.trigger('xiphe_phpdiffmerge_merged');
                return; // Exit as no further action is needed for this conflict.
            }

            // Log the conflict being merged.
            self.master._debug('Merging Conflict:', self);

            // Perform actions based on the conflict type.
            switch (self.type) {
                case 'Replace':
                    self._delete(); // Delete the old content.
                    self._insert(); // Insert the new content.
                    break;
                case 'Insert':
                    self._insert(); // Only insert new content.
                    break;
                case 'Delete':
                    self._delete(); // Only delete old content.
                    break;
                default:
                    // Log an error for an unrecognized conflict type.
                    logError('Undefined merge method "' + self.type + '".');
                    return; // Exit if type is unknown.
            }

            // Trigger the 'merged' event after the conflict has been processed.
            self.$el.trigger('xiphe_phpdiffmerge_merged');
        },


        // *** PRIVATE METHODS ***
        // Methods intended for internal use within the Conflict class.

        /**
         * Handles the 'hover in' event for conflict table cells.
         * Adds a 'hover' class to highlight the relevant side.
         *
         * @param {Event} event The event object.
         */
        _hoverIn: function (event) {
            var $target = $(event.delegateTarget); // The specific cell that was hovered over.

            // Determine if the hovered cell is on the 'Left' or 'Right' side.
            var h = $target.hasClass('Left') ? 'Left' : 'Right';
            // Add the 'hover' class to all cells on that side within this conflict.
            this.$el.find('td.' + h).addClass('hover');
        },

        /**
         * Handles the 'hover out' event for conflict table cells.
         * Removes the 'hover' class.
         */
        _hoverOut: function () {
            // Remove the 'hover' class from any cells that currently have it.
            this.$el.find('td.hover').removeClass('hover');
        },

        /**
         * Handles the click event for conflict table cells.
         * Marks the conflict as resolved and highlights the chosen side.
         *
         * @param {Event} event The event object.
         */
        _clicked: function (event) {
            var self = this; // Scope preservation.
            var $target = $(event.delegateTarget), // The specific cell that was clicked.
                use, // Variable to store the class for the 'chosen' side.
                dont; // Variable to store the class for the 'not chosen' side.

            // Determine if the left side was chosen based on diff type.
            if (!self.master.inline) {
                // For side-by-side diffs, 'Left' class directly implies choosing left.
                self.useLeft = $target.hasClass('Left');
            } else {
                // For inline diffs, it's more complex:
                // 'use' class indicates selection, 'Left' class indicates original side.
                self.useLeft = $target.hasClass('use');
                if ($target.hasClass('Left')) {
                    self.useLeft = !self.useLeft; // Toggle if it's the 'Left' cell.
                }
            }

            // Assign CSS classes based on the chosen side.
            use = self.useLeft ? 'Left' : 'Right';
            dont = self.useLeft ? 'Right' : 'Left';

            // Apply highlighting based on the chosen side.
            if (self.master.inline &&
                (self.type === 'Delete' || self.type === 'Insert')
            ) {
                // Special highlighting for inline delete/insert types.
                var $c = self.$el.find('td');
                $c.toggleClass('use'); // Toggle 'use' class.
                $c.toggleClass('dontUse', !$c.hasClass('use')); // Toggle 'dontUse' based on 'use'.
            } else {
                // Standard highlighting for other types or non-inline diffs.
                self.$el.find('td.' + use).removeClass('dontUse').addClass('use');
                self.$el.find('td.' + dont).removeClass('use').addClass('dontUse');
            }

            // If this conflict hasn't been resolved yet, mark it as resolved and trigger an event.
            if (!self._resolved) {
                self._resolved = true; // Mark as resolved.
                self.$el.trigger('xiphe_phpdiffmerge_resolved'); // Notify master plugin.
            }
        },

        /**
         * Determines and sets the starting line numbers for the conflict.
         * It looks at the previous `tbody` element to find the line numbers.
         */
        _setLine: function () {
            var self = this; // Scope preservation.

            /*
             * Get the first line of the conflict from the previous table section.
             * This addresses a known bug with line numbering in php-diff output.
             */
            var previousRow = self.$el.prev('tbody').find('tr').last();

            // Parse the line numbers from the table headers, defaulting to 0 if not found.
            // Add 1 to convert 0-based index (if html() returns empty) to 1-based line number.
            self.leftLine = parseInt((previousRow.find('th').first().html() || 0), 10) + 1;
            self.rightLine = parseInt((previousRow.find('th').last().html() || 0), 10) + 1;
        },

        /**
         * Calculates and sets the number of affected rows for both left and right sides of the conflict.
         * Differentiates logic for inline vs. side-by-side diffs.
         */
        _setRows: function () {
            var self = this; // Scope preservation.

            if (self.master.inline) {
                // For inline diffs, count elements with 'Left'/'Right' class directly.
                self.rowsLeft = self.$el.find('.Left').length;
                self.rowsRight = self.$el.find('.Right').length;
            } else {
                // For side-by-side diffs, iterate and check if the preceding 'th' (line number) is not empty.
                self.rowsLeft = 0;
                self.$el.find('.Left').each(function () {
                    if ($(this).prev('th').html() !== '&nbsp;') {
                        self.rowsLeft++;
                    }
                });
                self.rowsRight = 0;
                self.$el.find('.Right').each(function () {
                    if ($(this).prev('th').html() !== '&nbsp;') {
                        self.rowsRight++;
                    }
                });
            }
        },

        /**
         * Calls the master plugin's `_insertResult` method to insert content for this conflict.
         */
        _insert: function () {
            var self = this; // Scope preservation.

            // Delegate the actual insertion logic to the master plugin.
            self.master._insertResult(self.rightLine, self.rowsRight, self.leftLine);
        },

        /**
         * Calls the master plugin's `_deleteResult` method to delete content for this conflict.
         */
        _delete: function () {
            var self = this; // Scope preservation.

            // Delegate the actual deletion logic to the master plugin.
            self.master._deleteResult(self.leftLine, self.rowsLeft);
        }
    };


    /**
     * Helper function: Generates a popup window with specified title and content.
     * Used for displaying merge results or source files.
     *
     * @param {string} title The title for the new window.
     * @param {string} content The HTML content to display in the new window.
     */
    function popup(title, content) {
        var newWin = window.open('popup.html'); // Open a new window.

        // Sanitize the content for HTML display.
        // http://css-tricks.com/snippets/javascript/htmlentities-for-javascript/
        content = content.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

        // Write the HTML structure and content to the new window.
        newWin.document.write('<html><head><title>' + title + '</title></head><body><pre>' +
            content + '</pre></body></html>');
    }


    // Helper function for logging errors to the console.
    // This approach avoids breaking jQuery chaining unlike `$.error`.
    // Inspired by jquery.isotope.js.
    var logError = function (message) {
        if (window.console) { // Check if console object is available.
            window.console.error(message); // Log the error message.
        }
    };


    // =======================  Plugin bridge  ===============================
    // This section provides the jQuery plugin interface.
    // Inspired by:
    //   - jquery.isotope.js (https://github.com/desandro/isotope/blob/master/jquery.isotope.js#L1363)
    //   - jQuery UI (https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js)
    //   - jcarousel (https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js)

    // Extend jQuery's prototype to add our plugin.
    $.fn[pluginName] = function (options) {
        var self = this; // Reference to the jQuery collection.

        // If the first argument is a string, it's a method call.
        if (typeof options === 'string') {
            // Extract arguments for the method call (excluding the method name itself).
            var args = Array.prototype.slice.call(arguments, 1);

            // Iterate over each selected element in the jQuery collection.
            self.each(function () {
                // Retrieve the plugin instance associated with this DOM element.
                var instance = $.data(this, 'plugin_' + pluginName);

                // If no instance exists, log an error.
                if (!instance) {
                    logError('cannot call methods on ' + pluginName + ' prior to initialization; ' +
                        'attempted to call method "' + options + '"');
                    return; // Skip to the next element.
                }

                // If the method does not exist on the instance, log an error.
                if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                    logError('no such method "' + options + '" for ' + pluginName + ' instance');
                    return; // Skip to the next element.
                }

                // Call the method on the instance with the provided arguments.
                instance[options].apply(instance, args);
            });

        } else {
            // If the first argument is not a string, it's an initialization call.
            self.each(function () {
                // Prevent multiple instantiations on the same element.
                // Store the instance using jQuery's data method.
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new PHPDiffMerge(this, options));
                }
            });
        }

        return self; // Return the jQuery collection for chaining.
    };

})(jQuery); // Pass jQuery object to the self-executing function.