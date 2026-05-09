// Alias for UI5 core components for brevity and obfuscation
const sap_m_lib = sap.m;
const sap_ui_core_lib = sap.ui.core;

// Define the main application view using a different naming convention
sap.ui.jsview("myApplication.views.MainNavigation", {

    // Helper method to retrieve the associated controller's name
    // This ensures proper MVC wiring within the SAPUI5 framework.
    fetchControllerReference: function() {
        return "myApplication.controllers.MainNavigation";
    },

    // Method responsible for constructing the visual elements of the view
    composeViewStructure: function(controllerHandle) {
        // Log a message indicating the view's content creation is starting.
        // This can be useful for debugging or lifecycle tracking during development.
        console.log("MainNavigation view components composition initiated.");

        // --- Define constants for various properties and paths ---
        const BRAND_ICON_ID = "applicationBrandIcon";
        const BRAND_IMAGE_SOURCE = "img/57_iPhone_Desktop_Launch.png";
        const ICON_DISPLAY_WIDTH = "35px";

        const APP_INFO_LINK_ID = "appVersionInfoLink";
        const APP_VERSION_TEXT_DISPLAY = "v0.8.0";
        const APP_VERSION_EXTERNAL_URL = "http://blog.mypro.de/tag/ui5boilerplate/";

        const MENU_DATA_BINDING_PATH = "/Menu";
        const HEADER_TEXT_I18N_KEY = "{i18n>APP_GREETING_HEADER}";

        // --- Helper for creating a standard list item template ---
        // This function encapsulates the creation logic for the list item,
        // promoting reusability and cleaner code.
        const createNavigationItemTemplate = () => {
            const listItemType = sap_m_lib.ListType.Navigation; // Store enum value in a local variable
            return new sap_m_lib.StandardListItem({
                icon: "{icon}",
                title: "{title}",
                description: "{description}",
                type: listItemType,
                customData: [ // Wrap single custom data in an array for consistency/future expansion
                    new sap_ui_core_lib.CustomData({
                        key: "targetPage",
                        value: "{targetPage}"
                    })
                ]
            });
        };

        // Instantiate the list item template for binding
        const itemDisplayLayoutTemplate = createNavigationItemTemplate();

        // --- Configure the main navigation list ---
        // Use .bind() to ensure the controller's context is correctly passed to the event handler.
        const selectionChangeHandler = controllerHandle.handleNavigationSelection.bind(controllerHandle);

        const primaryNavigationList = new sap_m_lib.List({
            selectionChange: selectionChangeHandler,
            mode: sap_m_lib.ListMode.SingleSelectMaster
        });
        // Bind the 'items' aggregation to the model path using the created template
        primaryNavigationList.bindAggregation("items", MENU_DATA_BINDING_PATH, itemDisplayLayoutTemplate);

        // --- Construct the custom header bar for the page ---
        const viewHeaderBar = new sap_m_lib.Bar({
            contentLeft: [
                new sap_m_lib.Image(BRAND_ICON_ID, {
                    width: ICON_DISPLAY_WIDTH,
                    src: BRAND_IMAGE_SOURCE
                    // Height property deliberately omitted; width should ensure proportional scaling.
                })
            ],
            contentMiddle: [
                new sap_m_lib.Text({
                    text: HEADER_TEXT_I18N_KEY
                })
            ]
        });

        // --- Construct the footer bar for the page ---
        const viewFooterBar = new sap_m_lib.Bar({
            contentMiddle: [
                new sap_m_lib.Link(APP_INFO_LINK_ID, {
                    text: APP_VERSION_TEXT_DISPLAY,
                    href: APP_VERSION_EXTERNAL_URL
                })
            ]
        });

        // --- Assemble the final page object, which is the root of this view's UI ---
        // The page serves as the primary container for the view's content, header, and footer.
        const mainPageView = new sap_m_lib.Page({
            customHeader: viewHeaderBar,
            content: [primaryNavigationList], // The navigation list is the central content of the page
            footer: viewFooterBar,
            showNavButton: false // Explicitly state that no navigation button should be shown.
        });

        // A final log indicating successful component creation.
        console.log("MainNavigation view components fully assembled.");

        return mainPageView;
    }

});