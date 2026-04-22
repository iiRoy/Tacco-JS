( function  ( $ )   {
    // Define default options for the plugin.
    // These can be overridden by user-provided settings.
    var  defaults  =  {
            rowsToDisplay :  10
        } ;


    // Constant for scrollbar width, and a variable for fixed table width (initially undefined).
    var  scrollBarWidth  =  15  ,  fixedTableWidth  ;

    // Main plugin entry point.
    // This function initializes the scrollable table body functionality.
    $.fn.scrollTableBody =  function  ( options )  {
        // Extend default options with user-provided options.
        options  =  $.extend (  defaults  ,  options  ) ;


        // 'this' refers to the jQuery object containing the table(s).
        var  table  =  this  ;

        // Call helper functions to set up the table structure and alignment.
        wrapTable (  table  ,  options  ) ;
        alignColumns (  table  ) ;

        // Prepare the resize alignment function.
        var  resizeAlignFunction  =  function  (  )  {  alignOnResize (  table  ) ;  } ;

        // Check if Lodash or an equivalent debounce utility is available.
        var  canDebounce  =  typeof  _  ==  'function'  &&  typeof  _ . debounce  ==  'function' ;

        // If a debounce utility is present, apply it to the resize function to improve performance.
        if  (  canDebounce  )
            { resizeAlignFunction  =  _ . debounce (  resizeAlignFunction  ,  150  ) ; }

        // Attach the (potentially debounced) resize handler to the window.
        $ (  window  ) . resize (  resizeAlignFunction  ) ;
    } ;

    /*
     * Helper function: wrapTable
     * Creates the necessary DOM structure for fixed header/footer and scrollable body.
     * @param {jQuery} table - The original table jQuery object.
     * @param {Object} options - Plugin options.
     */
    function  wrapTable (  table  ,  options  )
    {
        // Capture existing classes and margin-bottom from the original table.
        var  existingClasses  =  table . attr (  'class'  ) ;
        var  existingMarginBottom  =  table . css (  'margin-bottom'  ) ;

        // Reset the original table's bottom margin to prevent double margins.
        table . css (  'margin-bottom'  ,  0  ) ;

        // Calculate the height required for the scrollable area.
        var  rowHeight  =  table . find (  'tbody tr:first'  ) . outerHeight (  ) ;
        var  tableHeight  =  rowHeight  *  options . rowsToDisplay  ;

        // Construct the HTML for the fixed header table, fixed footer table, and the scrollable div.
        var  headerTable  =  $ (  '<table style="table-layout:fixed;width:auto;margin-bottom:0;" class="jqstb-header-table '  +  existingClasses  +  '"><thead><tr><td></td></tr></thead></table>'  )  ,
            footerTable  =  $ (  '<table style="table-layout:fixed;width:auto;margin-bottom:'  +  existingMarginBottom  +  ';" class="jqstb-footer-table '  +  existingClasses  +  '"><tfoot><tr><td></td></tr></tfoot></table>'  )  ,
            scrollDiv  =  '<div class="jqstb-scroll" style="height:'  +  tableHeight  +  'px;overflow-y:auto"></div>'  ;

        // Insert the newly created elements around the original table.
        // The order is important: header table, then scroll div (which will contain the original table), then footer table.
        table . before (  headerTable  ) . before (  scrollDiv  ) . after (  footerTable  ) ;
    }

    /**
     * Function: alignColumns
     * This function is responsible for synchronizing column widths and
     * handling horizontal scrolling for the fixed header/footer.
     * @param {jQuery} table - The original table jQuery object.
     */
    function  alignColumns (  table  )
    {
        table . each (  function  ( index )  {

            // Initialize jQuery objects for the current data table, header table, and footer table.
            // Using .eq(index) ensures we're targeting the correct elements if multiple tables are initialized.
            var  $dataTable  =  $ (  this  ) ;
            var  $headerTable  =  $ (  'table.jqstb-header-table'  ) . eq (  index  ) ;
            var  $footerTable  =  $ (  'table.jqstb-footer-table'  ) . eq (  index  ) ;


            // Move the original data table into its corresponding scrollable div.
            var  $scrollDiv  =  $ (  'div.jqstb-scroll'  ) . eq (  index  ) ;
            $scrollDiv . prepend (  $dataTable  ) ;

            // Get the raw DOM element for scroll calculations.
            var  scrollEl  =  $scrollDiv [  0  ] ;

            // Determine if the content within the scroll div is wider than the scroll div itself.
            var  hasHorizontalScroll  =  scrollEl . clientWidth  <  scrollEl . scrollWidth  ;

            // Set the initial outer width of the scroll div.
            // fixedTableWidth is assumed to be set elsewhere or default to 0.
            $scrollDiv . outerWidth (  fixedTableWidth  +  scrollBarWidth  +  2  ) ;


            if  (  hasHorizontalScroll  )
            {
                // If horizontal scrolling is present, adjust widths for header/footer tables.
                var  dataTableWidth  =  $dataTable . outerWidth (  ) ;
                $headerTable . width (  dataTableWidth  ) ;
                $footerTable . width (  dataTableWidth  ) ;

                // Adjust scroll div width to account for the scrollbar.
                $scrollDiv . outerWidth (  scrollEl . clientWidth  ) ;
                var  scrollDivWidth  =  $scrollDiv . outerWidth (  ) ;

                // Calculate the width for the header/footer scroll wrappers.
                var  width  =  scrollDivWidth  -  scrollBarWidth  ;

                // Create and wrap the header table in a scrollable div to hide its scrollbar.
                var  $headerScrollDiv  =  $ (  '<div style="overflow:hidden;width:'  +  width  +  'px" class="jqstb-header-scroll"></div>'  ) ;
                $headerTable . wrap (  $headerScrollDiv  ) ;

                // Create and wrap the footer table in a scrollable div to hide its scrollbar.
                var  $footerScrollDiv  =  $ (  '<div style="overflow:hidden;width:'  +  width  +  'px" class="jqstb-footer-scroll"></div>'  ) ;
                $footerTable . wrap (  $footerScrollDiv  ) ;

                // Attach a scroll event listener to the main scroll div.
                // This synchronizes the horizontal scroll position of the header and footer.
                $scrollDiv . on (  'scroll'  ,  function (  )  {
                    $ (  'div.jqstb-header-scroll'  ) . scrollLeft (  $ (  this  ) . scrollLeft (  )  ) ;
                    $ (  'div.jqstb-footer-scroll'  ) . scrollLeft (  $ (  this  ) . scrollLeft (  )  ) ;
                }  ) ;
            }


            // Iterate through the first row's header cells and body cells of the original table.
            // Explicitly set their outerWidth to fix their current computed width.
            $dataTable . find (  'thead tr:first th, tbody tr:first td'  ) . each (  function  (  )  {
                $ (  this  ) . outerWidth (  $ (  this  ) . outerWidth (  )  ) ;
            }  ) ;


            // Clone and insert the caption and thead from the original table into the fixed header table.
            $headerTable . find (  'thead'  ) . replaceWith (  $dataTable . children (  'caption, thead'  ) . clone (  )  ) ;


            // Iterate through the first row's footer cells of the original table.
            // Explicitly set their outerWidth to fix their current computed width.
            $dataTable . find (  'tfoot tr:first td'  ) . each (  function  (  )  {
                $ (  this  ) . outerWidth (  $ (  this  ) . outerWidth (  )  ) ;
            }  ) ;


            // Clone and insert the tfoot from the original table into the fixed footer table.
            $footerTable . find (  'tfoot'  ) . replaceWith (  $dataTable . children (  'tfoot'  ) . clone (  )  ) ;


            // Finally, hide the original caption, header, and footer to prevent duplication.
            $dataTable . children (  'caption, thead, tfoot'  ) . hide (  ) ;
        }  ) ;
    }

    /*
     * Function: alignOnResize
     * Adjusts column widths and scroll wrapper sizes when the window is resized.
     * This ensures the fixed header/footer remains aligned with the scrollable body.
     * @param {jQuery} table - The original table jQuery object.
     */
    function  alignOnResize (  table  )
    {
        table . each (  function  ( index )  {
            // Get references to the current data table, header table, and footer table.
            var  $dataTable  =  $ (  this  ) ;
            var  $headerTable  =  $ (  'table.jqstb-header-table'  ) . eq (  index  ) ;
            var  $footerTable  =  $ (  'table.jqstb-footer-table'  ) . eq (  index  ) ;

            // Temporarily make the original table's header and footer visible.
            // This is crucial for accurate width calculations by the browser.
            $dataTable . children (  'thead, tfoot'  ) . show (  ) ;

            // Check for horizontal scroll presence in the main scroll div.
            var  scrollEl  =  $ (  'div.jqstb-scroll'  ) [  0  ] ;
            var  hasHorizontalScroll  =  scrollEl . clientWidth  <  scrollEl . scrollWidth  ;

            if  (  hasHorizontalScroll  )
            {
                // If horizontal scrolling exists, recalculate and set the width of the header/footer scroll wrappers.
                // This accounts for the scrollbar's width.
                var  scrollDivWidth  =  $ (  'div.jqstb-scroll'  ) . outerWidth (  ) ;
                $ (  'div.jqstb-header-scroll'  ) . outerWidth (  scrollDivWidth  -  scrollBarWidth  ) ;
                $ (  'div.jqstb-footer-scroll'  ) . outerWidth (  scrollDivWidth  -  scrollBarWidth  ) ;
            }

            // Update column widths for the fixed header.
            // Get all header columns from the fixed header table.
            var  $headerColumns  =  $headerTable . find (  'thead tr:first th'  ) ;
            // Iterate through the original table's header columns and apply their widths to the fixed header columns.
            $dataTable . find (  'thead tr:first th'  ) . each (  function  ( i )  {
                $headerColumns . eq (  i  ) . outerWidth (  $ (  this  ) . outerWidth (  )  ) ;
            }  ) ;

            // Update column widths for the fixed footer.
            // Get all footer columns from the fixed footer table.
            var  $footerColumns  =  $footerTable . find (  'tfoot tr:first td'  ) ;
            // Iterate through the original table's footer columns and apply their widths to the fixed footer columns.
            $dataTable . find (  'tfoot tr:first td'  ) . each (  function  ( i )  {
                $footerColumns . eq (  i  ) . outerWidth (  $ (  this  ) . outerWidth (  )  ) ;
            }  ) ;

            // After all width adjustments, hide the original table's header and footer again.
            $dataTable . children (  'thead, tfoot'  ) . hide (  ) ;
        }  ) ;
    }
} ) ( jQuery ) ; // End of the IIFE, passing jQuery as an argument.