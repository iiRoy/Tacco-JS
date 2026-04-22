/*
 *  tinyTables jQuery Plugin - A responsive table solution.
 *  This script enhances HTML tables by making them responsive,
 *  allowing them to shrink and become scrollable with a pinned header
 *  when the viewport width falls below a specified threshold.
 *
 *  Version: 1.0.0
 *  Author: Your Name (or original author)
 *  Date: 2023-10-27
 *
 *  License: MIT (or original license)
 *
 *  Note: This is a Type I code clone, meaning its functionality and
 *        structure are identical to the original. Only whitespace
 *        and comments have been altered significantly to demonstrate
 *        visual difference while preserving exact logic.
 */

( function ( $ ) { /* Start of the Immediately Invoked Function Expression (IIFE) */

  "use strict" ; /* Enforces strict mode for cleaner code and fewer errors. */


  // Extend jQuery's prototype to add the tinyTables plugin.
  $ . fn . extend ( {


    /*
     *  tinyTables: The main plugin function.
     *  Initializes the responsive table behavior on selected table elements.
     *
     *  @param {object} options - Configuration options for the plugin.
     *                           - shrinkAt:   (number) The window width at which tables should shrink.
     *                           - tableClass: (string) CSS class added to the original table.
     *                           - tableWrapperClass: (string) CSS class for the outermost wrapper div.
     *                           - scrollingClass: (string) CSS class for the scrolling wrapper div.
     *                           - pinnedClass: (string) CSS class for the pinned header wrapper div.
     */
    tinyTables : function ( options ) {

      // Define default configuration options for the plugin.
      var defaults = {
        shrinkAt          :  900 , /* Default breakpoint for shrinking tables, in pixels. */
        tableClass        :  'tiny-tables' , /* Class applied to the original table element. */
        tableWrapperClass :  'tiny-tables-wrap' , /* Class for the main wrapper around the entire setup. */
        scrollingClass    :  'tiny-tables-scroll' , /* Class for the div containing the scrollable part of the table. */
        pinnedClass       :  'tiny-tables-pinned' /* Class for the div containing the pinned header/column. */
      } ; // End of defaults object definition.


      // Merge user-provided options with the defaults.
      // The `options` object will now contain all settings, with user values overriding defaults.
      options = $ . extend ( defaults , options ) ;


      // Return 'this' to maintain jQuery chainability.
      // The 'each' method ensures the plugin operates on all selected elements.
      return this . each ( function ( ) {

        // Cache the current table element as a jQuery object for efficiency.
        var originalTable = $ ( this ) ; // 'this' refers to the current DOM element in the 'each' loop.

        // Apply the base class to the original table.
        originalTable . addClass ( options . tableClass ) ;

        // Perform an initial update to determine if the table needs to be split or unsplit.
        updateTables ( originalTable ) ;

        // Bind the 'resize' event to the window object.
        // This ensures the table's state is re-evaluated whenever the browser window is resized.
        $ ( window ) . bind ( "resize" , function ( ) {
          // Call the update function again on window resize.
          updateTables ( originalTable ) ;
        } ) ; // End of window resize event handler.

      } ) ; // End of 'this.each' loop.


      /*
       *  updateTables: Helper function to manage the table's responsive state.
       *  Checks the current window width against the 'shrinkAt' threshold
       *  and calls the appropriate function to split or undo the split.
       *
       *  @param {jQuery} originalTable - The jQuery object representing the original table.
       */
      function updateTables ( originalTable ) {

        // Get the current width of the browser window.
        var windowWidth = $ ( window ) . width ( ) ;

        // Check if the window width is less than the defined shrink point.
        if ( ( windowWidth < options . shrinkAt ) ) {
          // If true, the table should be in its "shrunk" (split) state.
          splitTable ( originalTable ) ;
        }

        // Check if the window width is greater than the defined shrink point.
        // This 'else if' prevents unnecessary operations if the table is already in the correct state.
        else if ( ( windowWidth > options . shrinkAt ) ) {
          // If true, the table should be in its "unshrunk" (unsplit) state.
          undoSplit ( originalTable ) ;
        }

      } // End of updateTables function.


      /*
       *  splitTable: Function to transform the table into a scrollable, pinned header layout.
       *  This involves wrapping the table in several divs and cloning parts for the pinned section.
       *
       *  @param {jQuery} originalTable - The jQuery object representing the table to be split.
       */
      function splitTable ( originalTable ) {

        // Check if the table is already split (by looking for the scrollingClass on its parent).
        if ( ! originalTable . parent ( ) . hasClass ( options . scrollingClass ) ) {

          // Step 1: Wrap the original table in the main wrapper div.
          // This div will contain both the scrolling part and the pinned part.
          originalTable . wrap ( '<div class="' + options . tableWrapperClass + '" />' ) ;

          // Step 2: Create a clone of the original table.
          // This clone will serve as the "pinned" part (e.g., pinned header or first column).
          var pinnedTable = originalTable . clone ( ) ;

          // Step 3: Append the cloned table to the main wrapper.
          // It's important to find the closest wrapper first, as the originalTable might now be nested.
          originalTable . closest ( '.' + options . tableWrapperClass ) . append ( pinnedTable ) ;

          // Step 4: Wrap the original table again, this time for the scrolling functionality.
          originalTable . wrap ( '<div class="' + options . scrollingClass + '" />' ) ;

          // Step 5: Wrap the cloned (pinned) table in its dedicated pinned wrapper div.
          pinnedTable . wrap ( '<div class="' + options . pinnedClass + '" />' ) ;

        } // End of check if table is already split.

      } // End of splitTable function.


      /*
       *  undoSplit: Function to revert the table to its original, non-split state.
       *  Removes the extra wrapper divs and the cloned pinned table.
       *
       *  @param {jQuery} originalTable - The jQuery object representing the table to be unsplit.
       */
      function undoSplit ( originalTable ) {

        // Check if the table is currently split (by checking its parent's class).
        if ( originalTable . parent ( ) . hasClass ( options . scrollingClass ) ) {

          // Step 1: Remove the cloned pinned table and its wrapper.
          // Selects all elements with the pinned class and removes them from the DOM.
          $ ( '.' + options . pinnedClass ) . remove ( ) ;

          // Step 2: Unwrap the original table from the scrolling wrapper div.
          originalTable . unwrap ( ) ;

          // Step 3: Unwrap the original table from the main table wrapper div.
          // This brings the original table back to its initial position in the DOM.
          originalTable . unwrap ( ) ;

        } // End of check if table is currently split.

      } // End of undoSplit function.

    } // End of tinyTables plugin function definition.

  } ) ; // End of $.fn.extend call.

} ) ( jQuery ) ; /* Pass jQuery object to the IIFE, mapping it to '$'. */
// End of tinyTables plugin script.