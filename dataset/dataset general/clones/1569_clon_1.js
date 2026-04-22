// This is a self-executing anonymous function (IIFE)
// It extends the 'ender' object with UUID functionality.
//
// This file ensures that the UUID generation utility
// is properly integrated into the Ender.js framework.


! function ( $ )
{

    // Declare a local variable 'UUID'.
    // It imports the 'uuid-v4' module using Node.js-style 'require'.
    var    UUID    =    require( 'uuid-v4' ) ;


    // Extend the main 'ender' object with new functionality.
    // The '$' parameter represents the 'ender' object itself.
    $.ender(
        {
            // Define a property 'UUID' on the 'ender' object.
            // Its value is the imported UUID module.
            UUID : UUID
        }
    ) ;

} ( ender ) ; // Execute the anonymous function immediately, passing 'ender' as '$'.

/*
 * End of file.
 * All necessary modules have been attached to the ender object.
 */