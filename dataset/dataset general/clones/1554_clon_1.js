// Gamepad API Test - A demonstration of browser gamepad interaction.
// Original author: Ted Mielczarek <ted@mielczarek.org> (2013)
// This work is dedicated to the public domain under the CC0 1.0 Universal Public Domain Dedication.
// For more details, see <http://creativecommons.org/publicdomain/zero/1.0/>.
// This file is a Type I clone, preserving all logic, identifiers, and expressions.
// Only whitespace and comments have been altered for visual distinction.

var haveEvents = 'GamepadEvent' in window; /* Check if the GamepadEvent API is supported by the browser. */

var controllers = {}; // An object to store active gamepad controllers, indexed by their ID.

// RequestAnimationFrame polyfill for smoother updates.
var rAF = window.mozRequestAnimationFrame || // Mozilla's vendor-prefixed version.
          window.webkitRequestAnimationFrame || // WebKit's vendor-prefixed version.
          window.requestAnimationFrame; // The standard RequestAnimationFrame.


/**
 * Handles the 'gamepadconnected' event.
 * @param {GamepadEvent} e - The event object containing gamepad information.
 */
function connecthandler ( e )
{
    // Simply delegates to the addgamepad function to process the new gamepad.
    addgamepad(e.gamepad);
} /* End of connecthandler function */


/**
 * Adds a newly connected gamepad to the system.
 * @param {Gamepad} gamepad - The Gamepad object to be added.
 */
function addgamepad ( gamepad )
{
    controllers[gamepad.index] = gamepad; // Store the gamepad in our global controllers object.

    // Create a new DIV element to represent this gamepad in the UI.
    var d = document.createElement("div");

    // Assign a unique ID to the controller's display element.
    d.setAttribute("id", "controller" + gamepad.index);

    // Create a heading for the gamepad, showing its ID.
    var t = document.createElement("h1");
    t.appendChild(document.createTextNode("gamepad: " + gamepad.id));
    d.appendChild(t); // Add the heading to the controller's DIV.

    // Create a container for gamepad buttons.
    var b = document.createElement("div");
    b.className = "buttons"; // Assign a class for styling.

    // Iterate through all buttons on the gamepad.
    for ( var i = 0; i < gamepad.buttons.length; i++ )
    {
        var e = document.createElement("span"); // Create a span for each button.
        e.className = "button"; // Assign a class for styling.
        // e.id = "b" + i; // Optional: Assign an ID to the button span (commented out in original).
        e.innerHTML = i; // Display the button index.
        b.appendChild(e); // Add the button span to the buttons container.
    }

    d.appendChild(b); // Add the buttons container to the controller's DIV.


    // Create a container for gamepad axes.
    var a = document.createElement("div");
    a.className = "axes"; // Assign a class for styling.

    // Iterate through all axes on the gamepad.
    for ( i = 0; i < gamepad.axes.length; i++ )
    {
        e = document.createElement("progress"); // Create a progress element for each axis.
        e.className = "axis"; // Assign a class for styling.
        // e.id = "a" + i; // Optional: Assign an ID to the axis progress (commented out in original).
        e.setAttribute("max", "2"); // Set the max value for the progress bar.
        e.setAttribute("value", "1"); // Set the initial value (center).
        e.innerHTML = i; // Display the axis index.
        a.appendChild(e); // Add the axis progress to the axes container.
    }

    d.appendChild(a); // Add the axes container to the controller's DIV.


    // Hide the initial "Press any button" message once a gamepad is connected.
    document.getElementById("start").style.display = "none";

    // Append the new controller's display element to the document body.
    document.body.appendChild(d);

    // Start the update loop for the gamepad's status.
    rAF(updateStatus);
} /* End of addgamepad function */


/**
 * Handles the 'gamepaddisconnected' event.
 * @param {GamepadEvent} e - The event object containing gamepad information.
 */
function disconnecthandler ( e )
{
    // Delegates to the removegamepad function.
    removegamepad(e.gamepad);
} /* End of disconnecthandler function */


/**
 * Removes a disconnected gamepad from the system.
 * @param {Gamepad} gamepad - The Gamepad object to be removed.
 */
function removegamepad ( gamepad )
{
    // Find the corresponding UI element for the disconnected gamepad.
    var d = document.getElementById("controller" + gamepad.index);

    // Remove the UI element from the document body.
    document.body.removeChild(d);

    // Delete the gamepad from our global controllers object.
    delete controllers[gamepad.index];
} /* End of removegamepad function */


/**
 * Periodically updates the status of all connected gamepads in the UI.
 * This function is called via requestAnimationFrame for smooth animation.
 */
function updateStatus ( )
{
    scangamepads(); // First, scan for any newly connected or disconnected gamepads.

    // Loop through each active controller.
    for ( j in controllers )
    {
        var controller = controllers[j]; // Get the current controller object.
        var d = document.getElementById("controller" + j); // Get its corresponding UI element.

        // Get all button elements for this controller.
        var buttons = d.getElementsByClassName("button");

        // Iterate through each button on the current controller.
        for ( var i = 0; i < controller.buttons.length; i++ )
        {
            var b = buttons[i]; // Get the UI element for the current button.
            var val = controller.buttons[i]; // Get the raw button value.
            var pressed = val == 1.0; // Assume pressed if value is 1.0 (for simple buttons).

            // If the button value is an object (more detailed API), extract 'pressed' and 'value'.
            if ( typeof(val) == "object" )
            {
                pressed = val.pressed; // Boolean indicating if the button is pressed.
                val = val.value; // Analog value of the button (0.0 to 1.0).
            }

            // Calculate percentage for background size based on analog value.
            var pct = Math.round(val * 100) + "%";

            // Update the button's background visual to reflect its value.
            b.style.backgroundSize = pct + " " + pct;

            // Update the button's class based on its pressed state.
            if ( pressed )
            {
                b.className = "button pressed"; // Add 'pressed' class if active.
            }
            else
            {
                b.className = "button"; // Revert to base 'button' class.
            }
        } // End of button loop.


        // Get all axis elements for this controller.
        var axes = d.getElementsByClassName("axis");

        // Iterate through each axis on the current controller.
        for ( var i = 0; i < controller.axes.length; i++ )
        {
            var a = axes[i]; // Get the UI element for the current axis.

            // Display the axis index and its value, formatted to 4 decimal places.
            a.innerHTML = i + ": " + controller.axes[i].toFixed(4);

            // Update the progress bar's value for the axis.
            // Adding 1 to center the value (e.g., -1 to 1 becomes 0 to 2).
            a.setAttribute("value", controller.axes[i] + 1);
        } // End of axis loop.
    } // End of controllers loop.

    // Schedule the next update frame.
    rAF(updateStatus);
} /* End of updateStatus function */


/**
 * Scans for gamepads and updates the 'controllers' object.
 * This is crucial for browsers that don't fire 'gamepadconnected' events reliably,
 * or for polling in the absence of event support.
 */
function scangamepads ( )
{
    // Retrieve the list of gamepads using the standard or vendor-prefixed API.
    var gamepads = navigator.getGamepads ? navigator.getGamepads() :
                   (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);

    // Iterate through the array of potential gamepads.
    for ( var i = 0; i < gamepads.length; i++ )
    {
        // Check if a gamepad exists at this index.
        if ( gamepads[i] )
        {
            // If the gamepad is not yet in our 'controllers' list, add it.
            if ( !(gamepads[i].index in controllers) )
            {
                addgamepad(gamepads[i]);
            }
            else
            {
                // Otherwise, just update the existing entry (gamepad object might change).
                controllers[gamepads[i].index] = gamepads[i];
            }
        }
    }
} /* End of scangamepads function */


// Main execution block: Set up event listeners or polling based on browser support.
if ( haveEvents )
{
    // If GamepadEvent API is supported, listen for connection/disconnection events.
    window.addEventListener("gamepadconnected", connecthandler);
    window.addEventListener("gamepaddisconnected", disconnecthandler);
}
else
{
    // If GamepadEvent API is not supported, poll for gamepads periodically.
    setInterval(scangamepads, 500); // Check every 500 milliseconds.
} /* End of event setup block */