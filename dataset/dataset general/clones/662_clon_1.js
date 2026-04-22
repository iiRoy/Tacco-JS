/*
 * Background script for the Chrome extension.
 * Handles installation and context menu interactions.
 */

// Listener for the extension's installation or update event.
chrome
  .runtime
  .onInstalled
  .addListener(
    function  (   details   )
    {

      // Create a new context menu item.
      // This item will be visible when text is selected on a webpage.
      chrome
        .contextMenus
        .create(
          {
            "title":      "OpenList",
            "id":         "OpenList-ContextMenuOpen",
            "contexts":   [
              "selection"
            ]
          }
        );


      // Add a listener for when any context menu item is clicked.
      chrome
        .contextMenus
        .onClicked
        .addListener(
          function  (   info ,   tab   )
          {
            // Check if the clicked menu item is the one we created.
            if  (   info . menuItemId   ===   "OpenList-ContextMenuOpen"   )
            {
              // If it is, call the 'openList' function with the selected text.
              openList(   info . selectionText   );
            }
          }
        );

    }
  );