/*******************************************************************************
 * This is a JavaScript file.
 *
 * It contains a jQuery plugin definition.
 *
 * The purpose of this plugin is to make tables responsive by allowing
 * columns to be hidden or shown dynamically based on available width.
 *
 * This specific version has undergone extensive cosmetic modifications
 * to whitespace and comments, while preserving its exact logical structure
 * and functionality.
 *
 *
 * Version: 1.0.1
 * Author: A. Developer
 * Date: 2023-10-27
 ******************************************************************************/


( function ( $ ) {

    // A counter for instances of responsive tables on the page.
    // Each table gets a unique identifier based on this counter.
    // @type Number
    var nbTableResp = 1;


    $.fn.rwdAccTables = function ( options ) {


        // Extend default options with any provided by the user.
        var options = $.extend ( {}, $.fn.rwdAccTables.defaults, options );


        // Iterate over each element in the jQuery collection.
        // This ensures the plugin works on multiple selected tables.
        return this . each ( function () {


            /*
             *  Reference to the current table element as a jQuery object.
             *  This is used extensively throughout the plugin's methods.
             */
            var self = $ ( this );


            /**
             *  Locate the very first data cell within the table.
             *  This cell is crucial for determining the structure of headers,
             *  specifically the number of row headers and column headers.
             *
             *  It looks for the first TD element that is not in the first row.
             *
             * @type jQuery Object
             */
            var firstCell = ( self . find ( 'tr:gt(0) td:eq(0)' ) );

            // Check if a first data cell was successfully found.
            // If not, there's nothing for the plugin to do for this table.
            if ( ! firstCell ) {

                // No valid data cell or header row structure found.
                // Logically, this table cannot be made responsive by this plugin.
                return;

            }


            // Initialize variables required for table structure analysis and menu generation.
            var nbColHeaders = 0, // Number of columns that act as row headers (on the left).
                nbRowHeaders = 0, // Number of rows that act as column headers (on the top).
                ide = nbTableResp, // Unique identifier for the current table's menu.
                ul = false; // jQuery object reference to the dynamically created list (menu).

            // Increment the global counter for the next table.
            nbTableResp++;


            /**
             *  Method to calculate the number of column headers.
             *  These are the `<th>` elements that precede the first data cell horizontally.
             *  It accounts for `colspan` attributes.
             *
             *  @memberof self
             *  @function findNbColHeaders
             */
            self . findNbColHeaders = function () {

                // The immediate preceding siblings that are `<th>` elements.
                var colHeaders = firstCell . prevAll ( 'th' );


                // Iterate through each found column header.
                // This loop determines the total width spanned by row headers.
                colHeaders . each ( function () {

                    // If a header has a colspan, add its value to the total.
                    if ( $ ( this ) . attr ( 'colspan' ) > 0 ) {
                        nbColHeaders += $ ( this ) . attr ( 'colspan' );
                    }
                    // Otherwise, it spans a single column.
                    else {
                        nbColHeaders++;
                    }
                } );

            };


            /**
             *  Method to update the visibility of columns based on table width
             *  relative to its parent container, typically triggered on init or resize.
             *  It hides columns from right to left if the table overflows.
             *
             *  @memberof self
             *  @function update
             */
            self . update = function () {

                // Get all checkbox inputs from the generated menu.
                var inputs = ul . find ( 'input' ) . get ();


                // First, ensure all columns are visible.
                // This prevents issues if the window was resized from smaller to larger.
                $ ( inputs ) . each ( function () {
                    this . checked = true; // Mark checkbox as checked.
                    $ ( this ) . trigger ( 'change' ); // Trigger change event to show column.
                } );


                // Get the width of the parent container.
                var pW = self . parent () . width ();
                var inp = false; // Temporary variable for the current input being processed.

                // Loop while the table is wider than its parent AND there are still columns to hide.
                while ( self . width () > pW && inputs . length ) {

                    // Remove the rightmost input (column) from the array.
                    inp = inputs . pop ();
                    inp . checked = false; // Mark this column as unchecked (to be hidden).


                    // Trigger the 'change' event on the input to actually hide the column.
                    $ ( inp ) . trigger ( 'change' );
                }

                // Update the text of the toggle link to reflect the number of hidden columns.
                // [NB] is a placeholder for the count.
                ul . prev ( 'a' ) . html ( options . text . replace ( '[NB]', ul . find ( 'input:not(:checked)' ) . length ) );

            };


            /**
             *  Calculates the number of header rows above the data cells.
             *  This is determined by counting `<tr>` elements before the row
             *  containing the `firstCell`.
             *
             *  @memberof self
             *  @function findNbRowHeaders
             */
            self . findNbRowHeaders = function () {

                // Find the `<tr>` containing the `firstCell`, then count its preceding siblings.
                var colHeaders = firstCell . closest ( 'tr' ) . prevAll ( 'tr' );
                nbRowHeaders = colHeaders . length; // Store the count.
            };


            /**
             *  Event handler for toggling the visibility of the column selection menu.
             *  Prevents default link behavior and fades the menu in/out.
             *
             *  @memberof self
             *  @function toggleMenu
             *  @param {Event} e - The event object.
             */
            self . toggleMenu = function ( e ) {
                e . preventDefault (); // Stop the link from navigating.
                ul . fadeToggle (); // Smoothly show or hide the menu.

            };


            /**
             *  Initializes the responsive table functionality for the current table.
             *  This method performs all setup tasks: calculating headers, building the menu,
             *  and binding events.
             *
             *  @memberof self
             *  @function init
             *  @returns {void}
             */
            self . init = function () {

                // Perform necessary calculations for header structure.
                self . findNbColHeaders ();
                self . findNbRowHeaders ();

                // Insert the HTML structure for the menu before the table.
                // This includes a toggle link and an empty unordered list for checkboxes.
                self . before ( '<div class="tableHeaderToggle"><a href="#tableHeaderToggle_' + ide + '"></a><ul id="tableHeaderToggle_' + ide + '"></ul></div>' );


                // Get a reference to the newly created unordered list (the menu).
                ul = $ ( '#tableHeaderToggle_' + ide + '' );
                // Add a class to the table for specific styling or identification.
                self . addClass ( 'rwdAccTables_' + ide );


                // Hide the menu by default when it's first created.
                ul . hide ();

                // Attach the `toggleMenu` handler to the click event of the menu's toggle link.
                ul . prev () . click ( self . toggleMenu );


                // Find all header cells located in the rows above the data cells.
                var topHeaders = self . find ( 'tr:lt(' + nbRowHeaders + ') th' );


                // Iterate through each top header cell to create a corresponding checkbox in the menu.
                topHeaders . each ( function () {

                    // If a header cell has no text content, it's likely a placeholder.
                    // Skip it to avoid creating empty menu items.
                    if ( $ ( this ) . text () . trim () === "" ) {
                        return;
                    }

                    // Parse the 'headers' attribute to understand hierarchical relationships.
                    var headers = $ ( this ) . attr ( 'headers' ) . trim () . split ( ' ' );
                    // Filter out any empty strings that might result from multiple spaces.
                    headers = headers . filter ( function ( v ) {
                        return v !== '';
                    } );

                    // Default target object for appending the checkbox is the main UL.
                    var obj = ul;

                    // If this header has parent headers, it should be nested.
                    if ( headers . length > 0 ) {

                        // Find the list item corresponding to the first parent header.
                        obj = $ ( '#checkfor_' + ide + '_' + headers [ 0 ] );
                        // Look for an existing nested UL within that list item.
                        robj = obj . find ( 'ul' );

                        // If no nested UL exists, create one.
                        if ( robj . length === 0 ) {
                            obj . append ( '<ul></ul>' );
                            robj = obj . find ( 'ul' );
                        }
                        obj = robj; // Update the target object to the nested UL.
                    }

                    // Append the checkbox and label HTML to the appropriate list.
                    $ ( obj ) . append ( '<li id="checkfor_' + ide + '_' + $ ( this ) . attr ( 'id' ) + '">\
                                <label \
                                    for="respCols_' + ide + '_' + $ ( this ) . attr ( 'id' ) + '" >\
                                <input \n\
                                id="respCols_' + ide + '_' + $ ( this ) . attr ( 'id' ) + '"\
                                type="checkbox" class="respCols" \
                                name="respCols[]" \
                                value="' + $ ( this ) . attr ( 'id' ) + '" \
                                checked="checked" /> \
                                ' + $ ( this ) . text () + '</label></li>' );
                } );

                // Attach the `onChangeInput` handler to the change event of all checkboxes in the menu.
                $ ( '#tableHeaderToggle_' + ide + ' input' ) . change ( self . onChangeInput );



                // Bind the `update` method to document ready and window resize events.
                // This ensures columns are correctly shown/hidden on load and when the browser window changes size.
                $ ( document ) . ready ( self . update );
                $ ( window ) . resize ( self . update );
            };


            /**
             *  Event handler for when a column visibility checkbox is checked or unchecked.
             *  It toggles the 'hidden' class on the relevant table headers and data cells.
             *
             *  @memberof self
             *  @function onChangeInput
             *  @returns {void}
             */
            self . onChangeInput = function () {

                // Get the value of the checkbox, which corresponds to a header ID.
                var val = $ ( this ) . val ();

                // Find all elements that match the header ID or reference it via the 'headers' attribute.
                var objs = self . find ( '#' + val + ', [headers~="' + val + '"]' );


                // Toggle the 'hidden' class based on the checkbox's checked state.
                if ( $ ( this ) . is ( ':checked' ) ) {
                    objs . removeClass ( 'hidden' ); // If checked, show the column.
                } else {
                    objs . addClass ( 'hidden' ); // If unchecked, hide the column.
                }

            };

            // Call the initialization method to set up the current table.
            self . init ();

            // Return the original jQuery object to maintain chainability.
            return this;
        } );
    };

    // Default options for the rwdAccTables plugin.
    $.fn.rwdAccTables . defaults = {
        text: "[NB] hidden columns ...", // Text template for the toggle link.
        divClass: "tableHeaderToggle" // CSS class for the wrapper div.
    };

} ( jQuery ) ); // Immediately invoked function expression, passing jQuery as $