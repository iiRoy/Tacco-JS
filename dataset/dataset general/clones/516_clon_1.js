// This file demonstrates how to use the pinterestShare module in an Appcelerator Titanium application.

var pinterestShare = require( 'pinterestShare' ); // Import the Pinterest sharing module.


// Create the main window for the application.
var win = Titanium.UI.createWindow( {
    title:           'Share to Pinterest Example', // Set the window title.
    backgroundColor: '#fff'                        // Set the background color to white.
} );


// Create a button that will trigger the Pinterest sharing action.
var shareButton = Ti.UI.createButton( {
    title: "Share to Pinterest!" // Text displayed on the button.
} );


// Add an event listener to the share button.
// This anonymous function will be executed when the button is clicked by the user.
shareButton.addEventListener( 'click', function() {

    // Call the pinterestShare function with the required parameters.
    // These parameters define what content will be shared to Pinterest.
    pinterestShare( {
        image:       "http://www.azac.pl/logo.jpg", // URL of the image to be pinned.
        link:        "http://www.azac.pl",          // URL of the source page for the image.
        description: "Appcelerator Titanium FTW! https://github.com/azac/titanium-pinterest-share" // Description text for the pin.
    } );

} ); // End of the click event listener function.


// Add the created button to the main window's view hierarchy.
win.add( shareButton );


// Open the main window to make it visible to the user on the device.
win.open();