// This JavaScript file orchestrates a user interface component for social media sharing.
// It leverages a third-party module to facilitate content distribution to Pinterest.

// Import the necessary module for Pinterest sharing.
// The module is aliased for clarity and to differentiate from its original name.
const socialMediaLinker = require('pinterestShare');

// Centralized configuration for user interface elements to maintain consistency.
// These values can be easily updated without diving deep into component creation logic.
const userInterfaceSettings = {
    displayFrameTitle: 'Application Content Sharing Interface',
    mainBackgroundColor: '#E0E0E0', // A light grey for the background
    actionButtonText: 'Initiate Pinterest Content Post!',
    instructionalMessage: 'Tap the button below to share our featured content directly to Pinterest.'
};

// Data payload containing the specifics of the content to be shared.
// Encapsulating these details makes them easy to manage and update.
const contentBroadcastDetails = {
    visualSourceURL: "http://www.azac.pl/logo.jpg",
    targetWebLink: "http://www.azac.pl",
    narrativeSummary: "Discover the power of Appcelerator Titanium for mobile app development! For more insights and code, visit: https://github.com/azac/titanium-pinterest-share. Created with passion by AZAC."
};

// Create the primary viewing area (window) for the application.
// Using a different variable name and property names for Type II changes.
let mainApplicationViewport = Ti.UI.createWindow({
    windowTitle: userInterfaceSettings.displayFrameTitle,
    backgroundColor: userInterfaceSettings.mainBackgroundColor,
    navBarHidden: false // Explicitly show the navigation bar, could be a new addition
});

// A root-level container view to organize child elements.
// This adds an extra layer of structural abstraction (Type III change).
let interfaceWrapper = Ti.UI.createView({
    layout: 'vertical', // Arrange children vertically
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15 // Added padding for better aesthetics
});

// Add an informational label to guide the user (Type III addition).
let userGuidanceLabel = Ti.UI.createLabel({
    text: userInterfaceSettings.instructionalMessage,
    font: { fontSize: 18, fontFamily: 'Arial', fontWeight: 'bold' },
    color: '#424242', // Darker grey for text
    top: 30,
    left: 20,
    right: 20,
    height: Ti.UI.SIZE,
    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
});
interfaceWrapper.add(userGuidanceLabel);

// Create the interactive element that triggers the sharing action.
let broadcastActionTrigger = Ti.UI.createButton({
    title: userInterfaceSettings.actionButtonText,
    width: '70%', // Changed to percentage width
    height: 50,
    top: 70, // Positioned relative to the label
    borderRadius: 8, // Added border radius for modern look
    backgroundColor: '#FF6666', // Pinterest-like color
    color: '#FFFFFF', // White text
    font: { fontSize: 20, fontWeight: 'bold' }
});

// Define a utility function to validate the sharing data (Type III addition - guard clause helper).
function validateSharingPayload(payloadObject) {
    if (!payloadObject) {
        console.error("Error: Share payload is null or undefined.");
        return false;
    }
    if (!payloadObject.visualSourceURL || payloadObject.visualSourceURL.trim() === '') {
        console.warn("Validation Warning: Visual resource URL is missing or empty.");
        return false; // Image is often essential for Pinterest
    }
    if (!payloadObject.targetWebLink || payloadObject.targetWebLink.trim() === '') {
        console.warn("Validation Warning: Target web link is missing or empty.");
        // This might not be critical, but we'll make it so for this example
        return false;
    }
    return true;
}

// Attach an event listener to the button to handle user interactions.
broadcastActionTrigger.addEventListener('click', function(eventDetail) {
    // Log the event source for debugging (Type III addition).
    // console.log("User tapped the broadcast button at:", new Date().toISOString());
    // console.log("Event details:", eventDetail);

    // Construct the final object for the sharing module.
    // This involves mapping our internal names to the module's expected properties.
    const finalizedShareObject = {
        image: contentBroadcastDetails.visualSourceURL,
        link: contentBroadcastDetails.targetWebLink,
        description: contentBroadcastDetails.narrativeSummary
    };

    // Perform validation before attempting to share (Type III guard clause).
    if (!validateSharingPayload(finalizedShareObject)) {
        Ti.UI.createAlertDialog({
            title: 'Sharing Error',
            message: 'Cannot share: Essential content details (image or link) are missing. Please check configuration.'
        }).show();
        return; // Halt execution if validation fails.
    }

    // Verify the sharing module is available and callable (Type III guard clause).
    if (typeof socialMediaLinker === 'function') {
        try {
            // Execute the sharing action.
            socialMediaLinker(finalizedShareObject);
            // Optionally add a success feedback (Type III addition).
            // Ti.UI.createNotification({ message: 'Content sent to Pinterest!', duration: Ti.UI.NOTIFICATION_DURATION_LONG }).show();
        } catch (error) {
            console.error("Failed to execute Pinterest share:", error);
            Ti.UI.createAlertDialog({
                title: 'Sharing Failure',
                message: 'An unexpected error occurred while attempting to share content. ' + error.message
            }).show();
        }
    } else {
        console.error("Pinterest sharing module is not properly loaded or is not a function.");
        Ti.UI.createAlertDialog({
            title: 'Module Error',
            message: 'The Pinterest sharing functionality is currently unavailable. Please try again later.'
        }).show();
    }
});

// Add the action button to the intermediate container.
interfaceWrapper.add(broadcastActionTrigger);

// Finally, add the container wrapper to the main window.
mainApplicationViewport.add(interfaceWrapper);

// Open the main window to make the application visible to the user.
mainApplicationViewport.open();