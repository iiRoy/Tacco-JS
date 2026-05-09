/*
 * This is a JavaScript UI5 View definition file.
 * It defines the structure and content for the 'Menu' view.
 * File: ui5bp.view.Menu.js
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Purpose: Demonstrate Type I code cloning by altering only whitespace and comments.
 */
sap.ui.jsview
(
  "ui5bp.view.Menu" // The unique name of this view
  ,
  {
    // --- View Controller Name Definition ---
    /**
     * This function returns the fully qualified name of the controller
     * that is associated with this specific UI5 view.
     * @returns {string} The name of the controller.
     */
    getControllerName: function
    (
      // No parameters are expected for this function.
    )
    {
      // Returning the predefined controller name as a string literal.
      return "ui5bp.view.Menu"
      ; // Explicit semicolon for clarity.
    }
    , // Separator for object properties, ensuring valid JavaScript syntax.

    // --- Content Creation Method ---
    /**
     * This method is responsible for constructing and returning the UI controls
     * that will form the visual representation of this view.
     * It is called by the UI5 framework when the view is initialized.
     * @param {sap.ui.core.mvc.Controller} oController - The controller instance
     *                                                  associated with this view.
     * @returns {sap.ui.core.Control} The root control of the view, typically a Page.
     */
    createContent: function
    (
      oController // The controller object, passed as an argument.
    )
    {
      // --- List Item Template Definition ---
      // Declare a variable to hold the template for items within the list.
      var oListTemplate
        =
        new sap.m.StandardListItem
        (
          {
            // Properties for the standard list item template.
            title: "{title}" // Data binding for the item's title.
            ,
            icon: "{icon}" // Data binding for the item's icon source.
            ,
            description: "{description}" // Data binding for the item's description text.
            ,
            type: sap.m.ListType.Navigation // Sets the item type to navigation, indicating it leads somewhere.
            ,
            customData: new sap.ui.core.CustomData
            (
              {
                key: "targetPage" // Key for the custom data property.
                ,
                value: "{targetPage}" // Value for the custom data, typically used for navigation.
              }
            )
          }
        )
      ; // End of oListTemplate variable declaration.

      // --- Main List Control Definition ---
      // Declare a variable for the main list control that will display menu items.
      var oList
        =
        new sap.m.List
        (
          {
            // Configuration for the list control.
            selectionChange: [oController.doNavOnSelect, oController] // Event handler for selection changes.
            ,
            mode: sap.m.ListMode.SingleSelectMaster // Defines the selection mode for the list.
          }
        )
      ; // End of oList variable declaration.

      // --- Data Binding for the List ---
      // Bind the 'items' aggregation of the list to a model path.
      // The oListTemplate will be used to render each item from the model.
      oList.bindAggregation
      (
        "items" // The name of the aggregation to bind.
        ,
        "/Menu" // The path within the model from which to retrieve data.
        ,
        oListTemplate // The control template to be used for each item in the aggregation.
      )
      ; // End of bindAggregation method call.


      // --- Root Page Control Definition ---
      // Return the main page control which encapsulates all other UI elements.
      return new sap.m.Page
      (
        {
          // Custom header bar configuration for the page.
          customHeader: new sap.m.Bar
          (
            {
              // Content to be displayed on the left side of the header bar.
              contentLeft:
                [
                  new sap.m.Image
                  (
                    "ui5Logo" // Unique ID for the image control.
                    ,
                    {
                      src: "img/57_iPhone_Desktop_Launch.png" // Source path for the image asset.
                      ,
                      width: "35px" // Desired width of the image.
                      ,
                      height: "35px" // Desired height of the image.
                    }
                  )
                ]
              , // Separator for contentLeft property.

              // Content to be displayed in the middle of the header bar.
              contentMiddle:
                [
                  new sap.m.Text
                  (
                    {
                      text: "{i18n>WELCOME_TITLE}" // Text content, bound to an i18n model property.
                    }
                  )
                ]
            }
          )
          , // Separator for customHeader property.

          // The main content area of the page.
          content: [oList] // An array containing the previously defined list control.
          , // Separator for content property.

          // Footer bar configuration for the page.
          footer: new sap.m.Bar
          (
            {
              // Content to be displayed in the middle of the footer bar.
              contentMiddle:
                [
                  new sap.m.Link
                  (
                    "myproLink" // Unique ID for the link control.
                    ,
                    {
                      text: "v0.8.0" // The display text for the link.
                      ,
                      href: "http://blog.mypro.de/tag/ui5boilerplate/" // The URL the link points to.
                    }
                  )
                ]
            }
          )
        }
      )
      ; // End of return statement for the new sap.m.Page instance.
    } // End of createContent function definition.

  } // End of the view definition object literal.
)
; // Final semicolon for the sap.ui.jsview call.