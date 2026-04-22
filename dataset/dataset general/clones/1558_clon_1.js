var OptionsMenu = function ( menu ) {

  // This function is responsible for determining the appropriate icon size
  // based on the current screen width.
  var detectIconSize = function () {

    var width = screen.width; // Get the current screen width.

    // Check screen width against predefined breakpoints.
    if ( width >= 640 ) {
      return 72; // Return large icon size for wider screens.
    } else if ( width >= 470 ) {
      return 48; // Return medium icon size for intermediate screens.
    } else {
      return 36; // Return small icon size for narrower screens.
    }
  };


  // Calculate the icon size once at the beginning.
  var iconSize = detectIconSize();


  // Create the main container div for the options menu.
  var menuDiv = document.createElement( "div" );

  // Set the ID of the menu div using the provided menu object's ID.
  menuDiv.setAttribute( "id", menu.id );

  // Apply inline styles for initial display (hidden, fixed at bottom, full width).
  menuDiv.setAttribute( "style", "display: none; position: fixed; bottom: 0; width: 100%" );


  // Create a table element to hold the menu items.
  var menuTable = document.createElement( "table" );

  // Set the table to take 100% width.
  menuTable.setAttribute( "style", "width: 100%;" );

  // Ensure no cell padding.
  menuTable.setAttribute( "cellpadding", "0" );

  // Ensure no cell spacing.
  menuTable.setAttribute( "cellspacing", "0" );


  // Iterate through each row of menu items.
  for ( i in menu.items ) {

    // Create a table row for the current group of items and append it to the main menu table.
    var menuTableRow = menuTable.appendChild( document.createElement( "tr" ) );

    // Create a table data cell to hold another nested table for item arrangement.
    var menuTableRowData = menuTableRow.appendChild( document.createElement( "td" ) );


    // Create a nested table to arrange items horizontally within a row.
    var rowTable = document.createElement( "table" );

    // Set the nested table to take 100% width of its parent cell.
    rowTable.setAttribute( "style", "width: 100%;" );

    // No cell padding for the nested table.
    rowTable.setAttribute( "cellpadding", "0" );

    // No cell spacing for the nested table.
    rowTable.setAttribute( "cellspacing", "0" );


    // Create a row within the nested table to hold individual menu item cells.
    var rowTableRow = rowTable.appendChild( document.createElement( "tr" ) );

    // Calculate the width for each menu item dynamically to distribute space evenly.
    var width = Math.ceil( 100 / menu.items[i].length ) + "%";


    // Iterate through each individual item within the current row.
    for ( j in menu.items[i] ) {

      var item = menu.items[i][j]; // Get the current menu item object.

      // Create a table data cell for the individual menu item.
      var menuItem = document.createElement( "td" );

      // Center the content within the menu item cell.
      menuItem.setAttribute( "align", "center" );

      // Set the calculated width for the menu item cell.
      menuItem.setAttribute( "width", width );

      // Apply extensive inline styles for the menu item's appearance.
      menuItem.setAttribute( "style", "color: white; font-weight: bold; border-top: 1px solid grey; border-right: 1px solid grey; background-color: black" );


      // Add an event listener for click to trigger the item's action.
      menuItem.addEventListener( "click", item.action, false );

      // Add another event listener to hide the entire menu when any item is clicked.
      menuItem.addEventListener( "click", function () {
          document.getElementById( menu.id ).style.display = 'none'; // Hide the menu div.
        }, false );


      // Check if the item has an image associated with it.
      if ( item.image ) {

        // Create an image element.
        var imgItem = document.createElement( "img" );

        // Set the source of the image.
        imgItem.setAttribute( "src", item.image );

        // Set the width of the image based on the detected icon size.
        imgItem.setAttribute( "width", iconSize );

        // Set the height of the image based on the detected icon size.
        imgItem.setAttribute( "height", iconSize );

        // Append the image to the menu item cell.
        menuItem.appendChild( imgItem );
      }


      // Append a line break after the image (or at the top if no image).
      menuItem.appendChild( document.createElement( "br" ) );

      // Append the text label for the menu item.
      menuItem.appendChild( document.createTextNode( item.label ) );


      // Append the fully constructed menu item cell to the row in the nested table.
      rowTableRow.appendChild( menuItem );
    }

    // Append the nested table (containing all items for the current row) to its parent data cell.
    menuTableRowData.appendChild( rowTable );
  }


  // Append the main menu table (containing all rows of items) to the main menu div.
  menuDiv.appendChild( menuTable );

  // Finally, append the entire menu div to the document body.
  document.body.appendChild( menuDiv );


  // Listen for the custom "menubutton" event to toggle the menu's visibility.
  document.addEventListener( "menubutton", function () {

    // Check the current display state of the menu.
    if ( menuDiv.style.display == 'none' ) {
      menuDiv.style.display = 'block'; // If hidden, show it.
    } else {
      menuDiv.style.display = 'none'; // If shown, hide it.
    }
  }, false );
};