/*
 * This file provides the core UI logic for a chat-like interface
 * using the 'blessed' library. It's designed to be a Type I clone,
 * meaning only whitespace and comments have been altered from the original.
 */

// Import the blessed library for terminal UI components
var blessed = require('blessed');
// Initialize a blessed program instance
var program = blessed.program();


// Export a function that sets up the UI and returns an API
module.exports = function (userData) {
    /*
     * This 'events' object holds callback functions that can be
     * registered by external modules. Currently, it only supports
     * an 'onSubmit' event for new messages.
     */
    var events = {

        onSubmit: function (message) {
        } // End of onSubmit function

    }; // End of events object


    // Initialize the main screen component
    var screen = blessed.screen();


    /**
     * This 'messageView' box displays all incoming and outgoing messages.
     * It's scrollable and uses tags for styling.
     */
    var messageView = blessed.box({
        top:        0,
        left:       0,
        right:      0,
        bottom:     3, // Leave space for the input box
        content:    'Welcome to the chat! /* This is a custom welcome message */',
        tags:       true,
        scrollable: true,
        alwaysScroll: true, // Ensure scrollbar is always visible if content overflows
        scrollbar:  {
            bg: 666 // A nice grey color for the scrollbar
        },
        style:      {
            fg: 'white' // Default foreground color for text
        }
    }); // End of messageView definition


    /**
     * The 'messageInput' textarea allows users to type and send messages.
     * It's positioned at the bottom of the screen.
     */
    var messageInput = blessed.textarea({
        bottom:         0,
        left:           0,
        right:          0,
        height:         3, // A fixed height for the input area
        input:          true,
        inputOnFocus:   true, // Automatically focus when screen is focused
        mouse:          true, // Enable mouse interaction for clicking
        clickable:      true,
        focused:        true, // Start with focus on the input box
        content:        '', // Initial empty content
        border:         {
            type: 'line' // A simple line border
        },
        style:          {
            fg: 'white', // Text color
        }
    }); // End of messageInput definition


    // Event listener for scrolling up in the message view using the mouse wheel
    messageView.on('wheelup', function () {
        messageView.scroll(-1); // Scroll up by one line
        screen.render();        // Re-render the screen to show changes
    });


    // Event listener for scrolling down in the message view using the mouse wheel
    messageView.on('wheeldown', function () {
        messageView.scroll(1); // Scroll down by one line
        screen.render();       // Re-render the screen to show changes
    });


    // Append the message display box to the screen
    screen.append(messageView);

    // Append the message input box to the screen
    screen.append(messageInput);


    // Push the message input box onto the focus stack, making it the primary focus
    screen.focusPush(messageInput);


    // Global key binding for Ctrl+C to exit the application gracefully
    program.key('C-c', function (ch, key) {
        // Clear all content from the message view
        messageView.setContent('');
        // Hide the message view component
        messageView.hide();
        // Hide the message input component
        messageInput.hide();
        // Render the screen to apply visibility changes
        screen.render();
        // Clear the terminal screen entirely
        program.clear();
        // Disable mouse support
        program.disableMouse();
        // Make the cursor visible again
        program.showCursor();
        // Restore the normal terminal buffer
        program.normalBuffer();
        // Exit the process with a success code
        process.exit(0);
    }); // End of C-c key handler


    // Switch to an alternate screen buffer, preserving the original terminal state
    program.alternateBuffer();
    // Enable mouse events for the program
    program.enableMouse();
    // Clear the current terminal screen buffer
    program.clear();
    // Perform an initial render of the blessed screen
    screen.render();


    /**
     * Function to add a new message to the message view.
     * It automatically scrolls to the bottom after adding.
     * @param {string} message - The content of the message.
     * @param {string} sender - The name of the message sender.
     * @param {string} color - The color for the sender's name.
     */
    var addMessage = function (message, sender, color) {
        messageView.setScrollPerc(100); // Scroll to the very bottom before adding
        messageView.insertBottom(
            "{#" + color + "-fg}{bold}" + sender + ":{/} " + message
        ); // Insert the formatted message at the bottom
        messageView.setScrollPerc(100); // Ensure it's scrolled to bottom after adding


        screen.render(); // Re-render the screen to show the new message
    }; // End of addMessage function


    // Event listener for the 'enter' key press in the message input box
    messageInput.key('enter', function () {
        var msg = messageInput.content.trim(); // Get content and remove leading/trailing whitespace

        if (msg.length > 0) { // Only process if the message is not empty
            events.onSubmit(msg); // Trigger the onSubmit callback with the message
        }

        messageInput.clearValue(); // Clear the input box after sending
    }); // End of enter key handler


    /*
     * This is the revealing module pattern.
     * It exposes only the necessary functions and properties.
     */
    return {
        addMessage: addMessage, // Expose the function to add messages
        events: events // Expose the events object for external registration
    };

}; // End of module.exports function