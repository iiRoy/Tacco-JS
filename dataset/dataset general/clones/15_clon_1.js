/*
 * FooTable Sortable Plugin - Type I Clone
 * This file contains a Type I clone of the original FooTable Sortable plugin code.
 * It is designed to be functionally identical, with only variations in whitespace and comments.
 * All identifiers, variable names, function names, operators, and expressions remain unchanged.
 *
 * This plugin adds sorting capabilities to FooTable.
 * Requires footable.js to be loaded prior to this script.
 */

( function (   $,   w,   undefined   )
{

    // Check if FooTable is loaded; if not, throw an error to prevent further execution.
    if (   w.footable   ===   undefined   ||   w.footable   ===   null   )
    {
        throw new Error( 'Please check and make sure footable.js is included in the page and is loaded prior to this script.'   )   ;
    }


    /*
     * Default options for the Sortable plugin.
     * These can be overridden during FooTable initialization.
     */
    var   defaults   =   {

        sort   :   true,  // Enable sorting by default

        // Custom sorter functions for different data types.
        sorters   :   {
            alpha   :   function   ( a,   b )   {
                if (   a   ===   b   )   return   0   ;
                if (   a   <   b   )   return   -1   ;
                return   1   ;
            },
            numeric   :   function   ( a,   b )   {
                return   a   -   b   ;
            }
        },

        // CSS classes used by the sorting functionality.
        classes   :   {
            sort   :   {
                sortable   :   'footable-sortable',
                sorted   :   'footable-sorted',
                descending   :   'footable-sorted-desc',
                indicator   :   'footable-sort-indicator'
            }
        },

        // Event names triggered by the sorting functionality.
        events   :   {
            sort   :   {
                sorting   :   'footable_sorting',
                sorted   :   'footable_sorted'
            }
        }
    }   ;


    /**
     * Sortable plugin constructor.
     * @constructor
     */
    function   Sort   (   )
    {
        var   p   =   this   ; // Reference to the plugin instance.

        p.name   =   'Footable Sortable'   ; // Plugin name.

        /**
         * Initializes the Sortable plugin for a given FooTable instance.
         * @param {object} ft - The FooTable instance.
         */
        p.init   =   function   (   ft   )
        {
            // Only proceed if sorting is enabled in FooTable options.
            if (   ft.options.sort   ===   true   )
            {
                // Bind event handlers to the FooTable instance.
                $(   ft.table   ).bind(   {
                    'footable_initialized'   :   function   (   e   )   {
                        // Retrieve necessary CSS classes and event names from FooTable options.
                        var   cls   =   ft.options.classes.sort,
                              evt   =   ft.options.events.sort,
                              column   ;

                        // Cache jQuery objects for the table, tbody, and th elements.
                        var   $table   =   $(   ft.table   ),
                              $tbody   =   $table.find(   '> tbody'   ),
                              $th   ;

                        // If sorting is explicitly disabled on the table element, exit.
                        if (   $table.data(   'sort'   )   ===   false   )   return   ;

                        // Iterate over all header cells in the last row of the thead.
                        $table.find(   '> thead > tr:last-child > th, > thead > tr:last-child > td'   ).each(   function   (   ec   )   {
                            $th   =   $(   this   ),   column   =   ft.columns[   $th.index(   )   ]   ;
                            // Add 'sortable' class and indicator span if sorting is not ignored for this column.
                            if (   column.sort.ignore   !==   true   &&   !$th.hasClass(   cls.sortable   )   )
                            {
                                $th.addClass(   cls.sortable   )   ;
                                $(   '<span />'   ).addClass(   cls.indicator   ).appendTo(   $th   )   ;
                            }
                        }   )   ;

                        // Bind click event to sortable header cells.
                        $table.find(   '> thead > tr:last-child > th.'   +   cls.sortable   +   ', > thead > tr:last-child > td.'   +   cls.sortable   ).unbind(   'click.footable'   ).bind(   'click.footable',   function   (   ec   )   {
                            ec.preventDefault(   )   ; // Prevent default link behavior.

                            $th   =   $(   this   ),   column   =   ft.columns[   $th.index(   )   ]   ;
                            // If sorting is ignored for this column, do nothing.
                            if (   column.sort.ignore   ===   true   )   return   true   ;

                            var   sort   =   true   ;
                            var   ascending   =   true   ;

                            // Determine current sort state and desired direction.
                            if (   $th.hasClass(   cls.sorted   )   )
                            {
                                sort   =   false   ;
                                ascending   =   false   ;
                            }   else   if (   $th.hasClass(   cls.descending   )   )
                            {
                                sort   =   false   ;
                            }


                            /* Raise a pre-sorting event so that we can cancel the sorting if needed. */
                            var   event   =   ft.raise(   evt.sorting,   {   column   :   column,   direction   :   ascending   ?   'ASC'   :   'DESC'   }   )   ;
                            // If the event was cancelled, stop sorting.
                            if (   event   &&   event.result   ===   false   )   return   ;


                            // Store the index of the sorted column.
                            $table.data(   'sorted',   column.index   )   ;

                            // Remove sort classes from other header cells.
                            $table.find(   '> thead > tr:last-child > th, > thead > tr:last-child > td'   ).not(   $th   ).removeClass(   cls.sorted   +   ' '   +   cls.descending   )   ;

                            // Apply appropriate sort class to the clicked header cell.
                            if (   ascending   )
                            {
                                $th.removeClass(   cls.descending   ).addClass(   cls.sorted   )   ;
                            }   else
                            {
                                $th.removeClass(   cls.sorted   ).addClass(   cls.descending   )   ;
                            }

                            // Perform the actual sorting or reversing.
                            if (   sort   )
                            {
                                p.sort(   ft,   $tbody,   column   )   ;
                            }   else
                            {
                                p.reverse(   ft,   $tbody   )   ;
                            }

                            // Rebind toggle selectors after sorting.
                            ft.bindToggleSelectors(   )   ;
                            // Raise the 'sorted' event.
                            ft.raise(   evt.sorted,   {   column   :   column,   direction   :   ascending   ?   'ASC'   :   'DESC'   }   )   ;
                            return   false   ;
                        }   )   ;

                        // Check for initial sort configuration.
                        var   didSomeSorting   =   false   ;
                        for (   var   c   in   ft.columns   )
                        {
                            column   =   ft.columns[   c   ]   ;
                            if (   column.sort.initial   )
                            {
                                p.sort(   ft,   $tbody,   column   )   ;
                                didSomeSorting   =   true   ;
                                $th   =   $table.find(   '> thead > tr:last-child > th:eq('   +   c   +   '), > thead > tr:last-child > td:eq('   +   c   +   ')'   )   ;

                                if (   column.sort.initial   ===   'descending'   )
                                {
                                    p.reverse(   ft,   $tbody   )   ;
                                    $th.addClass(   cls.descending   )   ;
                                }   else
                                {
                                    $th.addClass(   cls.sorted   )   ;
                                }

                                break   ; // Only apply the first initial sort found.
                            }
                        }
                        // If initial sorting occurred, rebind toggle selectors.
                        if (   didSomeSorting   )
                        {
                            ft.bindToggleSelectors(   )   ;
                        }
                    },
                    // Handle column data event to extract sort-related data attributes.
                    'footable_column_data'   :   function   (   e   )   {
                        var   $th   =   $(   e.column.th   )   ;
                        e.column.data.sort   =   e.column.data.sort   ||   {   }   ;
                        e.column.data.sort.initial   =   $th.data(   'sort-initial'   )   ||   false   ;
                        e.column.data.sort.ignore   =   $th.data(   'sort-ignore'   )   ||   false   ;
                        e.column.data.sort.selector   =   $th.data(   'sort-selector'   )   ||   null   ;

                        var   match   =   $th.data(   'sort-match'   )   ||   0   ;
                        if (   match   >=   e.column.data.matches.length   )   match   =   0   ;
                        e.column.data.sort.match   =   e.column.data.matches[   match   ]   ;
                    }
                }   )   ;
            }
        }   ;

        /**
         * Extracts rows from the tbody, including detail rows if present.
         * @param {object} ft - The FooTable instance.
         * @param {jQuery} tbody - The jQuery object for the tbody.
         * @param {object} [column] - The column object for which to extract sort values.
         * @returns {Array<object>} An array of row objects, each containing the row element and its value.
         */
        p.rows   =   function   (   ft,   tbody,   column   )
        {
            var   rows   =   [   ]   ;
            tbody.find(   '> tr'   ).each(   function   (   )   {
                var   $row   =   $(   this   ),   $next   =   null   ;
                // Skip detail rows as they are handled with their parent row.
                if (   $row.hasClass(   ft.options.classes.detail   )   )   return   true   ;
                // Check if the next sibling is a detail row.
                if (   $row.next(   ).hasClass(   ft.options.classes.detail   )   )
                {
                    $next   =   $row.next(   ).get(   0   )   ;
                }
                var   row   =   {   'row'   :   $row,   'detail'   :   $next   }   ;
                // If a column is provided, parse the sort value from the corresponding cell.
                if (   column   !==   undefined   )
                {
                    row.value   =   ft.parse(   this.cells[   column.sort.match   ],   column   )   ;
                }
                rows.push(   row   )   ;
                return   true   ;
            }   ).detach(   )   ; // Detach rows to improve performance during reordering.
            return   rows   ;
        }   ;

        /**
         * Sorts the table rows based on the specified column.
         * @param {object} ft - The FooTable instance.
         * @param {jQuery} tbody - The jQuery object for the tbody.
         * @param {object} column - The column object to sort by.
         */
        p.sort   =   function   (   ft,   tbody,   column   )
        {
            var   rows   =   p.rows(   ft,   tbody,   column   )   ;
            // Get the appropriate sorter function, defaulting to alpha.
            var   sorter   =   ft.options.sorters[   column.type   ]   ||   ft.options.sorters.alpha   ;
            // Sort the rows using the selected sorter.
            rows.sort(   function   (   a,   b   )   {
                return   sorter(   a.value,   b.value   )   ;
            }   )   ;
            // Re-append the sorted rows to the tbody.
            for (   var   j   =   0   ;   j   <   rows.length   ;   j++   )
            {
                tbody.append(   rows[   j   ].row   )   ;
                if (   rows[   j   ].detail   !==   null   )
                {
                    tbody.append(   rows[   j   ].detail   )   ;
                }
            }
        }   ;

        /**
         * Reverses the order of the table rows.
         * @param {object} ft - The FooTable instance.
         * @param {jQuery} tbody - The jQuery object for the tbody.
         */
        p.reverse   =   function   (   ft,   tbody   )
        {
            var   rows   =   p.rows(   ft,   tbody   )   ;
            // Re-append rows in reverse order.
            for (   var   i   =   rows.length   -   1   ;   i   >=   0   ;   i--   )
            {
                tbody.append(   rows[   i   ].row   )   ;
                if (   rows[   i   ].detail   !==   null   )
                {
                    tbody.append(   rows[   i   ].detail   )   ;
                }
            }
        }   ;
    }

    // Register the Sortable plugin with FooTable.
    w.footable.plugins.register(   new   Sort(   ),   defaults   )   ;

}   )   (   jQuery,   window   )   ;