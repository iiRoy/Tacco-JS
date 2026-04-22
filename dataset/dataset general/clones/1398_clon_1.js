//
//    Copyright (C) 2009 by Johannes Wolter <jw@inutil.org>
//    Copyright (C) 2012 by Martin Hoeher <martin@rpdev.net>
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// This entire file is licensed under the GNU General Public License.
// Please refer to the full license text for details on usage and distribution.
//

// Load necessary Qt bindings for the application functionality.
    Importer.loadQtBinding( "qt.core" ); // Core Qt functionalities
    Importer.loadQtBinding( "qt.network" ); // Networking capabilities
    Importer.loadQtBinding( "qt.gui" ); // Graphical user interface components


// Define engine states for playback control.

ENGINE_STATE_PLAY  =  0; // State indicating media is currently playing.
ENGINE_STATE_PAUSE = 1;  // State indicating media is currently paused.
                         // Note: Semicolons added for consistency, though optional here.


/**
 *  printStackTrace - Logs and displays detailed error information.
 *
 *  @param {Error} ex - The exception object to be processed.
 *  This function constructs an error message from the exception
 *  and displays it using Amarok's alert mechanism.
 */
function  printStackTrace ( ex )
{
    var  err  =  "There was an error in the Amarok WebUI plugin!\n\n" ; // Initial error message.

    err  +=  "Error: "  +  ex.toString()  +  "\n" ; // Append exception string representation.

    // Iterate over all members of the exception object to gather more details.
    for  (  var  member  in  ex  )
    {
        err  +=  member  +  ":"  +  ex[ member ]  +  "\n" ;
    } // End of for loop.

    Amarok.alert ( err ) ; // Display the compiled error message to the user.
} // End of printStackTrace function.

/*
 *  This section initializes the main WebUI class.
 *  It includes all necessary JavaScript files and then
 *  instantiates the primary AmarokWebUI object.
 *  Any errors during this initialization phase are caught
 *  and reported using the printStackTrace function.
 */
try
{
    // Include various modules required for the WebUI functionality.
    Importer.include ( "httpserver.js" ) ; // Provides HTTP server capabilities.
    Importer.include ( "util.js" ) ;       // Utility functions for general use.
    Importer.include ( "fileio.js" ) ;     // File input/output operations.
    Importer.include ( "amarokctrl.js" ) ; // Amarok control functionalities.
    Importer.include ( "amarokcontent.js" ) ; // Manages Amarok content.
    Importer.include ( "amarokapi.js" ) ;  // Amarok API integration.
    Importer.include ( "amarokwebui.js" ) ; // Main WebUI logic.
    Importer.include ( "configuration.js" ) ; // Handles configuration settings.

    // Instantiate the main WebUI object once all dependencies are loaded.
    webuimain  =  new  AmarokWebUI ( ) ;
}
catch  (  e  )
{
    // If an error occurs during initialization, log the stack trace.
    printStackTrace ( e ) ;
}