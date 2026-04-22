/*
 * This file defines a self-executing anonymous function
 * that sets up a basic application window with a table view.
 * It demonstrates how to handle clicks and open new windows.
 * This is a Type I clone, preserving all logic and identifiers.
 */

(
  {
    // Application properties and references
    text : Ti.UI.currentTab.title,    // Title for the current tab
    app  : Ti.UI.currentWindow.app,   // Reference to the main application object
    win  : Ti.UI.currentWindow,       // Reference to the current window


    /**
     *  Method to demonstrate JSONP functionality.
     *  Opens a new window to display cat pictures from Flickr.
     */
    jsonpTest:   function (  )
    {

      this.app.foundation.UI.openWindow(
        'Cats pictures (Flickr API)',
        Ti.UI.currentTab,
        {
          file : 'jsonpTest.js'
        }
      );

    }, // End of jsonpTest method


    /**
     *  Initialization method.
     *  Sets up the table view and its event listeners.
     */
    init: function( )
    {

      // Define the data for the table view
      var data = [
        {
          title   : 'JSONP request',
          fn      : 'jsonpTest',
          hasChild: true
        }
      ];


      // Create the table view UI component
      var table = Ti.UI.createTableView(
        {
          data: data // Assign the prepared data
        }
      );


      // Store a reference to 'this' for use within the event listener callback
      var self = this;

      // Add an event listener for table row clicks
      table.addEventListener(
        'click',
        function ( e )
        {
          // Check if the function specified by 'fn' in rowData exists
          if (  typeof self[ e.rowData.fn ]  ==  'function'  )
          {
            // If it exists, execute the function in the context of 'self'
            self[ e.rowData.fn ].apply( self );
          }
        }
      );


      // Add the created table view to the current window
      this.win.add( table );

    } // End of init method

  } // End of object literal
)
.init(  ); // Immediately invoke the init method upon definition