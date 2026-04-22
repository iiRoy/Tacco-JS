module.exports = function () {
    /*
     * This module exports a factory function.
     * When invoked, this function initializes and returns a Blessed UI component.
     * The component created is a 'list' type, designed to display information,
     * likely representing columns of a table within a terminal interface.
     */
    var blessed = require( 'blessed' ); // Load the 'blessed' library for terminal UI.


    // Initialize a new Blessed list widget.
    // This widget will be used to present a list of columns or similar tabular data.
    var tableInfo = blessed.list( {

        // --- Layout and Positioning ---
        width:      '30%',  // Specifies the width of the list as a percentage of the screen.
        height:     '10%',  // Specifies the height of the list as a percentage of the screen.
        left:       '30%',  // Positions the list 30% from the left edge of the screen.
        top:        '0%',   // Aligns the list to the very top of the screen.


        // --- Content and Interaction ---
        label:      "{center}columns{/center}", // Sets the title for the widget, centered and using Blessed tags.
        tags:       true,   // Enables Blessed markup tags (e.g., {center}) within the label.
        scrollable: true,   // Allows the list content to be scrolled if it overflows its height.


        // --- Visual Components ---
        border: {
            type: 'line'    // Defines a simple line border around the widget.
        },

        padding:    {
            left:   1,      // Adds 1 unit of padding on the left side of the content.
            bottom: 2       // Adds 2 units of padding on the bottom side of the content.
        },

        keys:       true,   // Enables keyboard navigation (e.g., arrow keys) within the list.


        // --- Styling Configuration ---
        style:      {
            bg:         'black',        // Sets the default background color of the widget.
            fg:         '#cccccc',      // Sets the default foreground (text) color.

            border:     {
                fg: '#ffffff'          // Sets the color of the widget's border.
            },

            hover:      {
                bg: 'green'             // Background color when an item is hovered over.
            },

            selected:   {
                fg:      "gray",        // Text color for a selected item.
                bg:      "black",       // Background color for a selected item.
                inverse: true           // Inverts the foreground and background colors for selection.
            }
        }

    } ); // End of blessed.list configuration object.


    // Return the configured Blessed list widget instance.
    return tableInfo;

}; // End of the module's exported function.