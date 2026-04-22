// This is a jQuery plugin designed to create and manage responsive equal height rows for elements.
// It helps in maintaining a consistent visual layout across different screen sizes and device orientations.
// Project Repository: https://github.com/Sam152/Javascript-Equal-Height-Responsive-Rows
// Author: Sam152 - for any questions or contributions, please refer to the GitHub page.

( function ( $ ) {

    // Enforce strict mode for the entire plugin to ensure cleaner code and prevent common pitfalls.
    'use strict' ;

    /*
     * $.fn.equalHeight
     *
     * This core method iterates through a jQuery collection of elements and sets their CSS 'height'
     * property to the maximum height found among them. This ensures that all elements within the
     * collection have a uniform height.
     *
     * The height calculation intelligently considers the 'box-sizing' CSS property to correctly
     * account for padding.
     *
     * @returns {jQuery} The original jQuery collection, allowing for method chaining.
     */
    $.fn.equalHeight = function ( ) {

        var heights = [ ] ; // Initialize an empty array to store the calculated heights of individual elements.

        // Use jQuery's `each` method to iterate over every DOM element currently in the collection.
        $.each ( this , function ( i , element ) {

            var $element = $( element ) ; // Wrap the native DOM element in a jQuery object for easier manipulation.
            var elementHeight ;           // Declare a variable to temporarily hold the height of the current element.

            // Determine if the element's box model is 'border-box' or 'content-box'.
            // 'border-box' includes padding and border in the total width/height.
            // '-moz-box-sizing' is for older Firefox versions.
            var includePadding = ( $element.css ( 'box-sizing' ) === 'border-box' ) ||
                                 ( $element.css ( '-moz-box-sizing' ) === 'border-box' ) ;

            if ( includePadding ) {
                // If 'border-box' is active, `innerHeight()` returns the height including padding.
                elementHeight = $element.innerHeight ( ) ;
            } else {
                // Otherwise, `height()` returns only the content height, excluding padding and border.
                elementHeight = $element.height ( ) ;
            }

            // Add the determined height to our `heights` array for later comparison.
            heights.push ( elementHeight ) ;

        } ) ; // End of $.each loop.

        // After collecting all heights, set the CSS 'height' of all elements in the collection
        // to the maximum value found in the `heights` array.
        // `Math.max.apply(window, heights)` is used to find the maximum value in an array.
        this.css ( 'height' , Math.max.apply ( window , heights ) + 'px' ) ;

        return this ; // Return the jQuery object to preserve chainability.

    } ; // End of $.fn.equalHeight method definition.


    /*
     * $.fn.equalHeightGrid
     *
     * This method organizes elements into a conceptual grid based on a specified number of columns
     * and then applies the `equalHeight` function to each row. This creates a visually consistent
     * grid where all items in a given row share the same height.
     *
     * @param {number} columns - The fixed number of columns that the grid should have.
     * @returns {jQuery} The original jQuery collection.
     */
    $.fn.equalHeightGrid = function ( columns ) {

        // Filter the current collection to include only elements that are currently visible.
        var $tiles = this.filter ( ':visible' ) ;

        // Reset the height of all filtered tiles to 'auto'. This is crucial to ensure
        // that the browser recalculates their natural heights before equalizing them.
        $tiles.css ( 'height' , 'auto' ) ;

        // Loop through the visible tiles, processing them in chunks equivalent to the number of columns.
        for ( var i = 0 ; i < $tiles.length ; i ++ ) {

            // Check if the current tile marks the beginning of a new row.
            if ( i % columns === 0 ) {

                var row = $( $tiles [ i ] ) ; // Initialize a new jQuery collection representing the current row, starting with the first tile.

                // Add subsequent tiles to the current row collection, up to the defined number of columns.
                for ( var n = 1 ; n < columns ; n ++ ) {
                    row = row.add ( $tiles [ i + n ] ) ; // Append the next tile in the row to the `row` collection.
                }

                row.equalHeight ( ) ; // Apply the `equalHeight` method to the entire row collection.

            } // End of conditional block for new row detection.

        } // End of main 'for' loop.

        return this ; // Return the jQuery object for further chaining.

    } ; // End of $.fn.equalHeightGrid method definition.


    /*
     * $.fn.detectGridColumns
     *
     * This utility method attempts to automatically detect the number of columns in a grid layout.
     * It does this by checking the top offset of consecutive elements. Elements with the same
     * top offset are considered part of the same row. The count stops when an element with a
     * different top offset is encountered, signifying the start of a new row.
     *
     * @returns {number} The detected number of columns. Returns 0 if no visible tiles are found.
     */
    $.fn.detectGridColumns = function ( ) {

        var offset = 0 , // Stores the top offset of the first element in the detected row. Initialized to 0.
            cols   = 0 , // Counter for the number of columns found in the first row.
            $tiles = this.filter ( ':visible' ) ; // Get only the visible elements, as hidden elements don't affect layout.

        // Iterate over each visible tile in the collection.
        $tiles.each ( function ( i , elem ) {

            var elemOffset = $( elem ).offset ( ).top ; // Get the absolute top position of the current element.

            // If it's the very first element (offset is 0) or its top offset matches the
            // reference offset, it's considered part of the current row.
            if ( offset === 0 || elemOffset === offset ) {
                cols ++ ;            // Increment the column counter.
                offset = elemOffset ; // Update the reference offset to that of the current element.
            } else {
                // If the current element's top offset is different, a new row has started.
                // We've successfully detected all columns in the first row, so we can stop iterating.
                return false ;
            }

        } ) ; // End of $tiles.each loop.

        return cols ; // Return the total number of columns detected.

    } ; // End of $.fn.detectGridColumns method definition.


    // A unique identifier used to generate distinct event namespaces for each instance
    // of `responsiveEqualHeightGrid` to prevent event conflicts.
    var grids_event_uid = 0 ;

    /*
     * $.fn.responsiveEqualHeightGrid
     *
     * This method applies responsive equal height behavior to the selected elements.
     * It ensures that heights are calculated and synchronized immediately upon call,
     * and then automatically re-adjusts them whenever the window is resized or the
     * page finishes loading.
     *
     * @returns {jQuery} The original jQuery collection.
     */
    $.fn.responsiveEqualHeightGrid = function ( ) {

        var _this = this ; // Cache the current jQuery object reference for use within closures.

        // Generate a unique event namespace using the `grids_event_uid`.
        // This allows specific events to be bound and unbound without affecting others.
        var event_namespace = '.grids_' + grids_event_uid ;

        // Store the generated event namespace in the data attribute of the jQuery object.
        // This is crucial for later unbinding these specific events.
        _this.data ( 'grids-event-namespace' , event_namespace ) ;

        // Define the `syncHeights` function, which will perform the actual height synchronization.
        function syncHeights ( ) {
            var cols = _this.detectGridColumns ( ) ; // Dynamically detect the current number of columns.
            _this.equalHeightGrid ( cols ) ;         // Apply the equal height grid logic using the detected columns.
        }

        // Bind the `syncHeights` function to the window's 'resize' and 'load' events.
        // The unique `event_namespace` is appended to allow for targeted unbinding.
        $( window ).bind ( 'resize' + event_namespace + ' load' + event_namespace , syncHeights ) ;

        syncHeights ( ) ; // Call `syncHeights` immediately to set the initial heights on page load.

        grids_event_uid ++ ; // Increment the UID for the next instance of this method.

        return this ; // Return the jQuery object for chainability.

    } ; // End of $.fn.responsiveEqualHeightGrid method definition.


    /*
     * $.fn.responsiveEqualHeightGridDestroy
     *
     * This method reverses the effects of `responsiveEqualHeightGrid`. It resets the height
     * of the elements to 'auto' and unbinds all associated window events, effectively
     * disabling the responsive equal height behavior for the selected elements.
     *
     * @returns {jQuery} The original jQuery collection.
     */
    $.fn.responsiveEqualHeightGridDestroy = function ( ) {

        var _this = this ; // Cache the current jQuery object reference.

        _this.css ( 'height' , 'auto' ) ; // Reset the CSS 'height' property of the elements back to 'auto'.

        // Unbind the events that were specifically bound using the stored event namespace.
        // This prevents memory leaks and ensures that the functionality is fully removed.
        $( window ).unbind ( _this.data ( 'grids-event-namespace' ) ) ;

        return this ; // Allow for method chaining.

    } ; // End of $.fn.responsiveEqualHeightGridDestroy method definition.

} ) ( window.jQuery ) ; // The plugin is encapsulated in an Immediately-Invoked Function Expression (IIFE)
                       // to create a private scope and pass `window.jQuery` as `$` for compatibility.