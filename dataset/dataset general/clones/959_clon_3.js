// Module for handling user interface components related to data input.
// This script initializes a modal screen for new record creation.

// Define application-wide visual constants for consistency.
const PRIMARY_BACKGROUND_ASSET = 'images/bg.png'; // Path to the main background image
const SCREEN_HEADER_TEXT = 'Create New Record';   // Text for the window title
const NAV_BUTTON_LABEL = 'Return';              // Text for the navigation button
const DEFAULT_TEXT_COLOR = '#777';              // Default text color for labels
const STATUS_FONT_SIZE = 24;                    // Font size for status messages
const CONTENT_TOP_OFFSET = 80;                  // Top offset for primary content area

// Function to handle the navigation back action.
// This function will be attached to the exit button.
function handleExitAction() {
    // Log an event for debugging or analytics.
    console.log('User initiated screen closure.');
    // Close the current modal window.
    dataEntryView.close();
}

// Configuration object for the main window properties.
const windowConfig = {
    backgroundColor: '#f0f0f0', // A subtle background color for the window frame
    title: SCREEN_HEADER_TEXT,
    modal: true // Ensure the window opens as a modal overlay
};

// Create the primary window for data entry using Titanium UI.
var dataEntryView = Titanium.UI.createWindow(windowConfig);

// Initialize a container view to hold the background image and other UI elements.
// This allows for more flexible layering than setting backgroundImage directly on the window.
var mainContentPanel = Titanium.UI.createView({
    backgroundImage: PRIMARY_BACKGROUND_ASSET, // Set the background image for this panel
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    layout: 'vertical' // Arrange children vertically
});

// Create a navigation button for returning to the previous screen.
var exitFormButton = Titanium.UI.createButton({
    title: NAV_BUTTON_LABEL,
    style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
    accessibilityLabel: 'Go back to previous screen' // Add an accessibility label
});

// Assign the exit button to the left navigation bar of the window.
dataEntryView.setLeftNavButton(exitFormButton);

// Attach the defined handler function to the button's click event.
exitFormButton.addEventListener('click', handleExitAction);

// Create a display area for status or informational messages.
var infoDisplayArea = Titanium.UI.createView({
    backgroundColor: '#ffffff', // White background for the info area
    borderRadius: 10,           // Rounded corners
    top: CONTENT_TOP_OFFSET,
    width: '90%',
    height: 100,
    layout: 'vertical',
    borderColor: '#e0e0e0',     // Light border
    borderWidth: 1,
    shadowColor: '#ccc',        // Subtle shadow
    shadowOffset: {x: 0, y: 2},
    shadowRadius: 3
});

// Create a label to show a dynamic status message within the info display.
var statusMessageLabel = Titanium.UI.createLabel({
    color: DEFAULT_TEXT_COLOR,
    text: 'Module loaded successfully.', // Initial status message
    font: {
        fontSize: STATUS_FONT_SIZE,
        fontFamily: 'Roboto', // Use a different font family
        fontWeight: 'bold'    // Make the font bold
    },
    textAlign: 'center',
    width: Titanium.UI.SIZE, // Adjust width to content
    height: Titanium.UI.SIZE,
    top: 15
});

// Add a secondary, smaller label for additional instructions or details.
var instructionLabel = Titanium.UI.createLabel({
    color: '#a0a0a0',
    text: 'Prepare to enter new data.',
    font: {
        fontSize: 14,
        fontFamily: 'Arial'
    },
    textAlign: 'center',
    width: 'auto',
    top: 5
});

// Add the labels to the info display area.
infoDisplayArea.add(statusMessageLabel);
infoDisplayArea.add(instructionLabel);

// Add the content panel to the main window.
dataEntryView.add(mainContentPanel);

// Add the information display area to the content panel.
mainContentPanel.add(infoDisplayArea);

// Log the window opening event.
console.log('Attempting to open the data entry window.');

// Open the window. A small delay is added for demonstration of an 'added fragment'.
setTimeout(() => {
    dataEntryView.open();
    console.log('Data entry window is now visible.');
}, 100); // 100ms delay before opening