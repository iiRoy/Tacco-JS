/*
 * This file contains utility functions for demonstrating device capabilities.
 * It's part of a larger mobile application example, showcasing device API access.
 *
 * All functions here are designed to be executed once the device is fully ready.
 */

// Define a function to retrieve and display various device information
// onto the corresponding HTML elements within the application's UI.
var deviceInfo = function ()
{
    // Retrieve the device's platform name and update the 'platform' display element.
    document . getElementById ( "platform" ) . innerHTML = device . platform ;

    // Retrieve the device's operating system version and update the 'version' display element.
    document . getElementById ( "version" ) . innerHTML = device . version ;

    // Retrieve the device's unique identifier (UUID) and update the 'uuid' display element.
    document . getElementById ( "uuid" ) . innerHTML = device . uuid ;

    // Retrieve the device's model name or manufacturer and update the 'name' display element.
    document . getElementById ( "name" ) . innerHTML = device . name ;

    // Retrieve the screen's width in pixels and update the 'width' display element.
    document . getElementById ( "width" ) . innerHTML = screen . width ;

    // Retrieve the screen's height in pixels and update the 'height' display element.
    document . getElementById ( "height" ) . innerHTML = screen . height ;

    // Retrieve the screen's color depth (bits per pixel) and update the 'colorDepth' display element.
    document . getElementById ( "colorDepth" ) . innerHTML = screen . colorDepth ;
} ; // End of the deviceInfo function.


// This function is responsible for triggering a native device beep sound
// using the device's notification API.
var beep = function ( )
{
    // Play the default notification beep sound a specified number of times (e.g., 2 times).
    navigator . notification . beep ( 2 ) ;
} ; // End of the beep function.


/**
 * Main initialization function for the application.
 * This function sets up crucial event listeners that ensure
 * the application interacts correctly with the device's capabilities
 * once the underlying platform is fully loaded and ready.
 */
function init ( )
{
    // The following commented-out line was historically used to prevent default touchmove behavior.
    // It was often disabled because it could make it impossible to scroll content
    // on devices like the HTC Evo, which did not natively support scroll gestures
    // or had specific interaction models that clashed with this prevention.
    // document.addEventListener("touchmove", preventBehavior, false);

    // Attach an event listener for the "deviceready" event.
    // This event fires when Cordova/PhoneGap is fully loaded and device APIs are available.
    // Once "deviceready" occurs, the 'deviceInfo' function will be invoked to populate device details.
    document . addEventListener ( "deviceready" , deviceInfo , true ) ;
} // End of the init function.