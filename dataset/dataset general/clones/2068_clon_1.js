'use strict'; // This directive enforces strict parsing and error handling in the script.

// Importing the React Native library, which is essential for UI components.
var React = require('react-native');

// Destructuring assignment to extract StyleSheet from the React object.
var   {

    StyleSheet

}   =   React; // StyleSheet is used to create and manage styles for components.

/*
 * This module exports a stylesheet object created using StyleSheet.create().
 * It defines various styles for different UI elements within the application.
 */
module.exports = StyleSheet.create(
    {
        // Style definition for the main container view.
        container:
        {
            backgroundColor : '#ffffff' , // Sets the background color to white.

            flex            : 1         , // Makes the container fill available space.

            flexDirection   : 'row'     , // Arranges children in a horizontal row.

            justifyContent  : 'center'  , // Centers children horizontally.

            paddingTop      : 8         , // Adds top padding.

            paddingBottom   : 8         , // Adds bottom padding.

            paddingLeft     : 8         , // Adds left padding.

            paddingRight    : 8         , // Adds right padding.

            borderBottomWidth: 1        , // Defines a 1-pixel bottom border.

            // The following border properties are commented out and not active.
            // borderTopWidth   : 1        , // Optional: Top border width.
            // borderLeftWidth  : 1        , // Optional: Left border width.
            // borderRightWidth : 1        , // Optional: Right border width.
            // borderRadius     : 4        , // Optional: Border radius for rounded corners.

            borderColor      : '#efeee4', // Sets the color of the border.

            // The following margin properties are commented out and not active.
            // marginTop        : 10       , // Optional: Top margin.
            // marginBottom     : 10       , // Optional: Bottom margin.
            // marginLeft       : 10       , // Optional: Left margin.
            // marginRight      : 10         // Optional: Right margin.
        }
        , // End of container style definition.

        // Style for the content area within the container.
        content:
        {
            flex        : 1 , // Allows content to expand and fill available space.

            marginBottom: 5   // Adds a small margin at the bottom.
        }
        , // End of content style definition.

        // Style for the reply user's name text.
        replyUserName:
        {
            fontSize: 12      , // Sets the font size.

            color   : '#555555' // Sets the text color to a dark gray.
        }
        , // End of replyUserName style definition.

        // Style for the actual reply content text.
        replyContent:
        {
            marginLeft: 5        , // Adds a left margin.

            fontSize  : 14       , // Sets the font size.

            color     : '#666772'  // Sets the text color to a slightly darker gray/blue.
        }
        , // End of replyContent style definition.

        // Style for the user's avatar image.
        avatar:
        {
            width       : 20 , // Sets the width of the avatar.

            height      : 20 , // Sets the height of the avatar.

            marginLeft  : 10 , // Adds a left margin.

            borderRadius: 10   // Creates a circular avatar by setting border radius to half of width/height.
        }
        , // End of avatar style definition.

    }
); // End of StyleSheet.create call.