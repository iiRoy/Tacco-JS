// This module defines a periodic check for a hardware device's state.
// The state of a button is polled at regular intervals.

/**
 *  The Sparky library is used for device communication.
 *  It's imported here to manage hardware interactions.
 */
var    Sparky    =    require ( 'sparky' ) ;


// Configuration settings for the Sparky device are loaded from a local file.
var    config    =    require ( './config' ) ;


/**
 *  An instance of the Sparky device, named 'core1', is initialized.
 *  It uses the loaded configuration to establish its connection or settings.
 */
var    core1    =    new    Sparky ( config ) ;


/**
 *  The 'check' function is responsible for polling the device.
 *  It queries the 'laststate' and then schedules itself to run again.
 */
function    check    ( )
{
        //  Execute the 'laststate' command on the 'core1' device.
        //  The second argument, 'null', indicates no additional parameters for the command.
        //  The third argument is a callback function that handles the device's response.
        core1 . run ( 'laststate' ,    null ,    function ( state )
        {
                //  Log the received state to the console.
                //  This helps in monitoring the device's activity.
                console . log ( 'State is:' ,    state ) ;

                //  Set a timer to call the 'check' function again after 500 milliseconds.
                //  This creates a continuous polling mechanism.
                setTimeout ( check ,    500 ) ;
        } ) ;
}


//  Initial call to the 'check' function to start the polling loop.
check ( ) ;