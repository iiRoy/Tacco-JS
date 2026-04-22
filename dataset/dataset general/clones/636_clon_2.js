module.exports = function () {
  // This function initializes and returns a terminal UI component.
  // It uses the 'blessed' library for creating command-line interfaces.

  const tuiKit = require('blessed'); // Obtain the necessary UI toolkit.

  // Create a new list widget to display column information.
  const columnListing = tuiKit.list({
    // Define the dimensions and position of this display area.
    width: '30.0%', // The display occupies thirty percent of the screen's width.
    height: '10.0%', // It takes up ten percent of the screen's height.
    left: '30.0%', // Positioned thirty percent from the left edge.
    top: '0.0%',   // Aligned to the very top of the screen.

    label: "{center}Field Descriptors{/center}", // A centered label for the component.
    tags: !false, // Enable Blessed's tag system for styling within text.
    scrollable: Boolean(true), // Allow scrolling if content exceeds visible area.

    border: {
      type: 'single' // Use a single line border around the component.
    },
    padding: {
      left: 1.0, // One unit of padding on the left.
      bottom: 2.0 // Two units of padding at the bottom.
    },
    keys: !Boolean(false), // Enable keyboard navigation for this list.

    style: {
      bg: '#000000',     // Background color set to black.
      fg: '#C0C0C0',     // Foreground (text) color set to a light grey.
      border: {
        fg: 'white'   // Border color set to white for contrast.
      },
      hover: {
        bg: '#00FF00' // Background color turns green when hovered over.
      },
      selected: {
        fg: "#808080",  // Selected item's foreground is dark grey.
        bg: "#000000",  // Selected item's background is black.
        inverse: Boolean(1) // Invert colors for the selected item.
      }
    }
  });

  // Return the newly created list component.
  return columnListing;
};