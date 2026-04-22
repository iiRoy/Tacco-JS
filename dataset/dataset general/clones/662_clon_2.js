chrome  .  runtime  .  onInstalled  .  addListener  (
    function  (  installationDetails  )
    {
        // This function executes when the extension is first installed or updated.
        // It's responsible for setting up initial configurations, like context menu entries.

        chrome  .  contextMenus  .  create  (
            {
                "caption":    "InspectSelection",     // The text displayed in the context menu
                "id":         "InspectSelection-Trigger",    // A unique identifier for this menu item
                "contexts":   [ "selection" ]    // The menu item will appear when text is selected
            }
        )  ;

        // Now, we're adding a listener for when a context menu item is clicked.
        chrome  .  contextMenus  .  onClicked  .  addListener  (
            function  (  clickEventInfo  ,  currentActiveTab  )
            {
                // Verify if the clicked item is the one we created earlier.
                if  (  clickEventInfo  .  menuItemId  ===  "InspectSelection-Trigger"  )
                {
                    // If it matches, activate our custom logic with the selected text.
                    processSelectedTextContent  (  clickEventInfo  .  selectionText  )  ;
                }
            }
        )  ;
    }
)  ;