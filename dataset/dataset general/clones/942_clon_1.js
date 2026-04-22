// This is a jQuery plugin designed for table filtering capabilities.
// For more details, refer to the original project documentation, if available.
// This specific file serves as a Type I clone; all functional aspects
// and identifiers remain identical to the source.

( function ( $ ) {


 $.fn .table_filter = function ( options ) {


  // Define the plugin's default configuration settings.
  // These can be overridden by passing an 'options' object during initialization.
  var settings = $.extend ( {


   'filter_inverse' : false , // If true, shows rows that *do not* match the filter.
   'enable_space' : false ,   // If true, treats spaces in filter text as delimiters.
   'table' : '' ,             // Selector for the table to be filtered.
   'cell_selector' : 'td' ,   // Selector for cells within rows to be checked for content.
   'no_result' : '' ,         // Text to display when no results are found.
   'no_result_selector' : ''  // Selector for the element to display 'no_result' text.


  } , options ) ;


  // The plugin's core logic is applied to each selected element.
  // This ensures jQuery chainability.
  return this .each ( function ( ) {


   var $this = $ ( this ) ;


   // Bind the keyup event to the input element (the filter field).
   // This triggers the filtering process whenever the user types.
   $this .bind ( "keyup" , function ( ) {


    // Retrieve the current value from the filter input, convert to lowercase, and trim whitespace.
    var txt = $this .val ( ) .toLowerCase ( ) .trim ( ) ;
    // Identify all filterable rows in the target table.
    // Excludes header rows (those containing 'th' elements).
    var obj = $ ( settings .table )
     .find ( "tr:not(:has('th'))" ) ;


    // Iterate over each identified table row.
    $.each ( obj , function ( ) {


     // Initialize a flag to control row visibility.
     // Its initial state depends on the 'filter_inverse' setting.
     var show_tr = ( settings .filter_inverse ) ? true : false ;
     // Select the specific cells within the current row that should be checked.
     var inner_obj = $ ( this ) .find ( settings .cell_selector ) ;
     var change = 0 ; // Counter for how many cells match the filter criteria.


     // Iterate over each filterable cell in the current row.
     $.each ( inner_obj , function ( ) {


      // Get the text content of the cell, trim it, and convert to lowercase for case-insensitive matching.
      var td_txt = $.trim ( $ ( this ) .text ( ) ) .toLowerCase ( ) ;


      // Check if 'enable_space' is active, which changes how the filter text is processed.
      if ( settings .enable_space ) {


       // Split the filter text by spaces to treat each word as an individual filter term.
       var td_array = txt .split ( " " ) ;
       $.each ( td_array , function ( i ) {


        var td_value = td_array [ i ] ;


        // If the cell's text contains any of the individual filter terms, increment the match counter.
        if ( td_txt .indexOf ( td_value ) != -1 ) {
         change ++ ;
        }


       } ) ;


      } else {


       // If 'enable_space' is not active, treat the entire filter text as one term.
       if ( td_txt .indexOf ( txt ) != -1 ) {
        change ++ ;
       }


      }


     } ) ; // End of inner_obj.each


     // Determine the final visibility of the row based on whether any matches were found.
     // The 'filter_inverse' setting is applied here.
     show_tr = ( change > 0 ) ? ! show_tr : show_tr ;
     if ( show_tr ) {
      $ ( this ) .show ( ) ; // Display the row if it should be shown.
     } else {
      $ ( this ) .hide ( ) ; // Hide the row if it should not be shown.
     }


    } ) ; // End of obj.each


    // After all rows have been processed, check if the filter text is empty.
    // If it is, all table rows (including headers) should be visible again.
    if ( $.trim ( txt ) == "" ) {
     $ ( settings .table ) .find ( "tr" ) .show ( ) ;
    }


    // Logic to display or hide the "No Results" message.
    // This is triggered if no matching rows are visible after filtering.
    var num_rows = $ ( settings .table ) .find ( "tr:not(:has('th')):visible" ) .size ( ) ;
    if ( num_rows == 0
     && settings .no_result != ""
     && settings .no_result_selector != ""
    ) {
     $ ( settings .no_result_selector ) .text ( settings .no_result ) .show ( ) ;
    } else {
     $ ( settings .no_result_selector ) .text ( "" ) .hide ( ) ;
    }


   } ) ; // End of keyup bind


  } ) ; // End of this.each


 } ; // End of $.fn.table_filter


} ) ( jQuery ) ; // End of IIFE