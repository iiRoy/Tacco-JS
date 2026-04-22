( function ( $ ) {

  // This is a self-executing anonymous function to encapsulate the plugin code,
  // preventing global variable pollution and ensuring jQuery is available as '$'.

  /**
   * jQuery plugin: jsonTable
   * Initializes a table with an empty header and body based on provided settings.
   * Stores configuration for later use with jsonTableUpdate.
   *
   * @param {object} options - Configuration options for the table.
   * @param {Array} options.head - An array of strings for table header columns.
   * @param {Array} options.json - An array defining the structure of JSON data to be displayed.
   * @returns {jQuery} The jQuery object representing the table, for chaining.
   */
  $.fn.jsonTable = function( options )
  {
    // Merge default settings with the user-provided options.
    // The 'table' property is always set to the current jQuery object (the table itself).
    var settings = $.extend(
      {
        head : [ ],  // Default empty array for table headers
        json : [ ]   // Default empty array for JSON data structure mapping
      },
      options,
      {
        table : this // A reference to the current jQuery object (the table element)
      }
    ) ;

    // Assign the current jQuery object to a variable named 'table'.
    // Note: 'table' is implicitly global here if not declared elsewhere,
    // matching the original code's behavior.
    table = this ;

    // Store the combined settings object on the table element's data.
    // This allows jsonTableUpdate to retrieve the configuration.
    table.data( "settings", settings ) ;

    // Check if a <thead> element exists within the table.
    // If not found, create a new <thead> and append an empty <tr> inside it.
    if ( table.find( "thead" ) .length == 0 )
    {
      table.append( $( "<thead></thead>" ) .append( "<tr></tr>" ) ) ;
    }

    // After ensuring <thead> exists, check if it contains any <tr> elements.
    // If no <tr> is found inside <thead>, append one.
    if ( table.find( "thead" ) .find( "tr" ) .length == 0 )
    {
      table.find( "thead" ) .append( "<tr></tr>" ) ;
    }

    // Check if a <tbody> element exists within the table.
    // If not found, create a new empty <tbody>.
    if ( table.find( "tbody" ) .length == 0 )
    {
      table.append( $( "<tbody></tbody>" ) ) ;
    }

    // Iterate over each header string provided in the 'settings.head' array.
    // For each header, create a <th> element and append it to the <thead>'s <tr>.
    $.each( settings.head, function( i, header )
    {
      table.find( "thead" ) .find( "tr" ) .append( "<th>" + header + "</th>" ) ;
    } ) ;

    // Return the original jQuery object to maintain chainability.
    return table ;
  } ; // End of $.fn.jsonTable plugin definition


  /**
   * jQuery plugin: jsonTableUpdate
   * Updates the table's content by fetching data from a source and populating rows.
   *
   * @param {object} options - Options for updating the table.
   * @param {string|object} options.source - A URL string for AJAX data retrieval, or a direct JSON object.
   * @param {string} [options.rowClass] - Optional CSS class to apply to each newly created table row.
   * @param {function} [options.callback] - Optional callback function to execute after the update is complete.
   */
  $.fn.jsonTableUpdate = function( options )
  {
    // Extend default update options with any user-provided options.
    var opt = $.extend(
      {
        source   : undefined, // URL string or object containing the data
        rowClass : undefined, // CSS class for new rows
        callback : undefined  // Function to call post-update
      },
      options
    ) ;

    // Retrieve the stored settings object from the table element's data.
    var settings = this.data( "settings" ) ;

    // Determine how to handle the data source based on its type.
    if ( typeof opt.source == "string" )
    {
      // If the source is a string, assume it's a URL and perform an AJAX GET request.
      $.get(
        opt.source,
        function( data )
        {
          // On successful data retrieval, call the internal updateFromObj function.
          $.fn.updateFromObj( data, settings, opt.rowClass, opt.callback ) ;
        }
      ) ;
    }
    else if ( typeof opt.source == "object" )
    {
      // If the source is already an object, pass it directly to updateFromObj.
      $.fn.updateFromObj( opt.source, settings, opt.rowClass, opt.callback ) ;
    }
  } // End of $.fn.jsonTableUpdate plugin definition


  /**
   * Internal helper function: updateFromObj
   * Populates the table's tbody with data from a given object.
   * This function is intended for internal use by jsonTableUpdate.
   *
   * @param {object} obj - The JSON object containing the data for the table rows.
   * @param {object} settings - The plugin's configuration settings.
   * @param {string} rowClass - The CSS class to apply to each table row.
   * @param {function} callback - A function to execute after the table is populated.
   */
  $.fn.updateFromObj = function( obj, settings, rowClass, callback )
  {
    // Clear all existing content from the table's tbody before adding new rows.
    settings.table.find( "tbody" ) .empty( ) ;

    // Iterate over each item (which will become a row) in the provided data object.
    $.each( obj, function( i, line )
    {
      // Create a new table row element and apply the specified CSS class.
      var tableRow = $( "<tr></tr>" ) .addClass( rowClass ) ;

      // For each data item ('line'), iterate over the JSON structure definition
      // from the settings to determine which data points go into which cells.
      $.each( settings.json, function( j, identity )
      {
        // If the 'identity' is a special asterisk character,
        // it signifies that the cell should display the row number.
        if ( identity == '*' )
        {
          // Append a table data cell containing the 1-based row index.
          tableRow.append( $( "<td>" + ( i + 1 ) + "</td>" ) ) ;
        }
        else
        {
          // Otherwise, the 'identity' refers to a property name in the 'line' object.
          // Append a table data cell with the value corresponding to that property.
          // 'this' refers to the current 'identity' in this $.each context.
          tableRow.append( $( "<td>" + line[ this ] + "</td>" ) ) ;
        }
      } ) ; // End of inner $.each loop (for identities/columns)

      // After all cells for the current row are created, append the row to the table.
      settings.table.append( tableRow ) ;
    } ) ; // End of outer $.each loop (for data objects/rows)


    // If a callback function was provided, execute it now.
    if ( typeof callback === "function" )
    {
      callback( ) ;
    }

    // Trigger a 'resize' event on the window object.
    // This can be useful for other components (e.g., responsive layouts)
    // that might need to re-evaluate their dimensions after table content changes.
    $( window ) .trigger( 'resize' ) ;
  } // End of $.fn.updateFromObj function definition

} ( jQuery ) ) ; // End of the plugin's self-executing function