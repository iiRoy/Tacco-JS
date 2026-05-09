/* This file defines the primary view for the application's navigation screen. */
framework.ui.defineView("app.module.MainScreen",
{
    // Function to retrieve the associated controller's identifier.
    obtainControllerIdentifier: function()
    {
        return "app.module.MainScreen";
    },

    // Method to construct and return the view's visual components.
    composeLayout: function(ctrlInstance)
    {
        // Define the template for individual items within the navigation list.
        var itemDisplayPattern = new sap.m.StandardListItem({
            title:       "{title}",          // Item's main display text
            icon:        "{icon}",           // Icon associated with the item
            description: "{description}",    // A brief description of the item
            type:        sap.m.ListType.Navigation, // Indicates that the item is navigable
            customData:  new sap.ui.core.CustomData({ // Additional data for the item
                key:   "destinationPage", // Key for the custom data
                value: "{targetPage}"     // Value indicating the target page
            })
        });

        // Initialize the main navigation list control.
        var mainNavigationList = new sap.m.List
        (
        {
            selectionChange: [ctrlInstance.handleSelectionAction, ctrlInstance], // Event handler for item selection
            mode:            sap.m.ListMode.SingleSelectMaster                  // Selection mode for the list
        }
        );
        // Bind the list's items aggregation to a data model path using the defined template.
        mainNavigationList.attachDataCollection("entries", "/MainItems", itemDisplayPattern);


        // Return the main page component containing the header, content, and footer.
        return new sap.m.Page
        (
        {
            customHeader: new sap.m.Bar
            (
            {
                contentLeft: [
                                new sap.m.Image("appIcon", // Application logo image
                                {
                                    src:    "img/57_iPhone_Desktop_Launch.png", // Source path for the image
                                    width:  "35px",                               // Image width
                                    height: "35px"                                // Image height
                                }
                                )
                             ],
                contentMiddle: [
                                new sap.m.Text // Main title text in the header
                                (
                                {
                                    text: "{i18n>GREETING_HEADLINE}" // Text bound to i18n model
                                }
                                )
                               ]
            }
            ),
            content:      [mainNavigationList], // The navigation list as the main content
            footer:       new sap.m.Bar
            (
            {
                contentMiddle: [
                                new sap.m.Link("projectInfoLink", // Link in the footer
                                {
                                    text: "version_alpha_release", // Link display text
                                    href: "https://www.companyblog.com/tags/appframework/" // URL for the link
                                }
                                )
                               ]
            }
            )
        }
        );
    }

}
);