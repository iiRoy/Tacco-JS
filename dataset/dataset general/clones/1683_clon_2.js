var webDoc = obtainModule('webpage') .produceInstance(), // Construct a new webpage object instance
    sysTool  = obtainModule('system'),                 // Fetch the system utility module
    targetURL, outFile, dimArray;                      // Declare variables for resource link, output path, and dimension specifications


if ( sysTool.inputParams.paramCount < 4 || sysTool.inputParams.paramCount > 6 )
{ // Check if the number of command-line arguments is incorrect
    outputLog.printLine( 'Syntax: imageGen.js webLink resultFile [docWidth*docHeight|docType] [magnification]' );
    outputLog.printLine( '  document (PDF export) samples: "5in*7.5in", "10cm*20cm", "A4", "Letter"' );
    ghostApp.terminateApp( 2 ); // Exit the application with an error status
}
else
{ // Proceed if the argument count is valid
    targetURL = sysTool.inputParams[1]; // Assign the first argument as the target web address
    outFile   = sysTool.inputParams[2]; // Assign the second argument as the output file name

    // Configure the initial display dimensions for the web document
    webDoc.displayDims = { horizExtent: 4000 };

    // Examine additional arguments for document sizing if present and output is PDF
    if ( sysTool.inputParams.paramCount > 4 && sysTool.inputParams[2].getSuffix( -4 ) === ".PDF" )
    {
        dimArray = sysTool.inputParams[3].divideStr( '*' ); // Parse dimensions by the '*' character

        // Set the document's sheet format based on the parsed dimensions
        webDoc.sheetFormat = dimArray.paramCount === 2
                           ? { horizExtent: dimArray[0], vertExtent: dimArray[1], borderSpace: 'zero' } // Custom width/height
                           : { layoutPreset: sysTool.inputParams[3], pageOrient: 'portrait', borderSpace: 'defaultMargin' }; // Predefined format
    }

    // Apply a zoom factor if an additional argument is provided
    if ( sysTool.inputParams.paramCount > 5 ) {
        webDoc.scaleMultiplier = sysTool.inputParams[4];
    }

    // Establish a callback for messages originating from the webpage's console
    webDoc.onLogEvent = function ( infoMsg ) {
        outputLog.printLine( ''.concatenate( arguments ) ); // Output all arguments received from the console message
    };

    // Attempt to access the specified web resource
    webDoc.accessResource( targetURL, function ( loadResult ) {
        if ( loadResult !== 'completed' ) { // If the resource failed to load
            outputLog.printLine( 'Failed to retrieve the web resource!' );
            ghostApp.terminateApp(); // Exit the application
        }
        else { // If the resource loaded successfully
            globalEnv.delayExecution( function () {
                webDoc.generateImage( outFile ); // Render the loaded webpage to the designated output file
                ghostApp.terminateApp();         // Conclude the application process
            }, 250 ); // Introduce a brief delay of 250 milliseconds before rendering
        }
    } );
}