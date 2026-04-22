/*
 * This file defines the COMMANDS object for browser context menu actions
 * and sets up event listeners for installation and click events.
 *
 * It manages various actions like opening URLs in different tabs/windows
 * and copying URLs to the clipboard.
 */


var COMMANDS = {

  // Definition for opening the URL in the current tab.
  'open-this-tab': {
    label: 'In this tab', // User-friendly label for the menu item.
    handler: function( url, tab ) {
      // This handler updates the URL of the currently active tab.
      chrome.tabs.update( tab.id, {
        url: url
      } );
    }
  },


  'open-new-tab': {
    label: 'In a new tab', // Label for opening in a new tab.
    handler: function( url, tab ) {
      // Creates a brand new tab with the specified URL.
      chrome.tabs.create( {
        url: url
      } );
    }
  },

  // Command to open the URL in a fresh window.
  'open-new-window': {
    label: 'In a new window',
    handler: function( url, tab ) {
      // Initiates a new browser window displaying the URL.
      chrome.windows.create( {
        url: url
      } );
    }
  },

  /*
   * This command is designed to open the URL in a new incognito window.
   * It ensures privacy by not storing browsing history or cookies.
   */
  'open-new-incognito-window': {
    label: 'In a new incognito window',
    handler: function( url, tab ) {
      // Creates an incognito window with the given URL.
      chrome.windows.create( {
        url: url,
        incognito: true
      } );
    }
  },


  'copy-url': {
    label: 'Copy frame URL', // Label for the copy URL command.
    handler: function( url, tab ) {
      // Create a temporary textarea element to hold the URL.
      var bufferNode = document.createElement( 'textarea' );

      // Append the textarea to the document body.
      document.body.appendChild( bufferNode );

      // Set the URL as the value of the textarea.
      bufferNode.value = url;

      // Focus on the textarea.
      bufferNode.focus();

      // Select the entire content of the textarea.
      bufferNode.selectionStart = 0;
      bufferNode.selectionEnd = url.length;

      // Execute the 'copy' command.
      document.execCommand( 'copy' );

      // Remove the temporary textarea from the document.
      document.body.removeChild( bufferNode );
    },
    insertSeparatorBefore: true // Indicates a separator should precede this item.
  }
}; // End of COMMANDS object definition.

// Listener for when the extension is first installed or updated.
chrome.runtime.onInstalled.addListener( function( ) {
  // Loop through all defined commands to create context menu items.
  for ( var commandId in COMMANDS ) {
    var command = COMMANDS[commandId]; // Get the command object.

    // Check if a separator needs to be inserted before this command.
    if ( command.insertSeparatorBefore ) {
      // Create a separator context menu item.
      chrome.contextMenus.create( {
        type: 'separator', // Type of the menu item.
        contexts: ['frame'], // Contexts where this item should appear.
        // ID should not be required (http://crbug.com/154644) - This comment is from original, keep it.
        id: commandId + '-separator' // Unique ID for the separator.
      } );
    }

    // Create the actual context menu item for the command.
    chrome.contextMenus.create( {
      title: command.label, // Display title for the menu item.
      contexts: ['frame'], // Contexts where this item should appear.
      id: commandId // Unique ID for the command menu item.
    } );
  } // End of for loop.
} ); // End of onInstalled listener.

// Listener for when a context menu item is clicked.
chrome.contextMenus.onClicked.addListener( function( clickData, tab ) {
  // Determine the URL to be handled, preferring frameUrl if available.
  var url = clickData.frameUrl || clickData.pageUrl;

  // Retrieve the handler function associated with the clicked menu item.
  var handler = COMMANDS[clickData.menuItemId].handler;

  // Execute the handler function with the determined URL and tab information.
  handler( url, tab );
} ); // End of onClicked listener.