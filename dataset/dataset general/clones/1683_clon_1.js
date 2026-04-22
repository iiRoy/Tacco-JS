/*
 * This PhantomJS script serves as a versatile rasterizer.
 * It is capable of converting a given URL into an image or PDF file.
 *
 * Key functionalities include:
 * - Loading a web page from a specified URL.
 * - Configuring page dimensions and paper size for PDF output.
 * - Applying a zoom factor to the rendered content.
 * - Handling console messages from the loaded page.
 * - Saving the rendered page to a file.
 */

var   page   = require( 'webpage' ).create();     // Creates a new instance of a web page.
var   system = require( 'system' );               // Provides access to command-line arguments.

// Declare variables for the URL, output file name, and paper size configuration.
var address;
var output;
var size;


// Validate the number of command-line arguments provided.
// The script expects between 3 and 5 arguments:
// 1. Script name (e.g., rasterize.js)
// 2. URL to render
// 3. Output filename
// 4. (Optional) Paper size/format for PDF output
// 5. (Optional) Zoom factor
if ( system.args.length < 3 || system.args.length > 5 )
{
    // If the argument count is incorrect, display usage instructions.
    console.log( 'Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat] [zoom]' );
    console.log( '  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"' );
    // Terminate the PhantomJS process with an error code.
    phantom.exit( 1 );
}
else
{
    // Assign the second argument as the target URL.
    address = system.args[1];
    // Assign the third argument as the output file path.
    output  = system.args[2];

    // Configure the viewport size of the page.
    // A large width often helps in capturing the full width of responsive designs.
    page.viewportSize = { width: 5000 };

    // Check if paper size/format arguments are provided and if the output is intended for PDF.
    if ( system.args.length > 3 && system.args[2].substr(-4) === ".pdf" )
    {
        // Split the paper size argument (e.g., "5in*7.5in") by the '*' character.
        size = system.args[3].split( '*' );

        // Dynamically set the paper size configuration.
        // If two dimensions are provided (width*height), use them with no margins.
        // Otherwise, treat the argument as a predefined format (e.g., "A4") with portrait orientation and 1cm margins.
        page.paperSize = size.length === 2
            ? { width: size[0], height: size[1], margin: '0px' }
            : { format: system.args[3], orientation: 'portrait', margin: '1cm' };
    }

    // Check if a zoom factor argument is provided.
    if ( system.args.length > 4 )
    {
        // Apply the specified zoom factor to the page.
        page.zoomFactor = system.args[4];
    }

    // Define a callback function for messages logged from within the web page's context.
    page.onConsoleMessage = function ( msg )
    {
        // Forward the page's console messages to the PhantomJS console.
        console.log( ''.join( arguments ) );
    };

    // Open the specified web address (URL).
    // The second argument is a callback function that executes once the page is loaded.
    page.open( address, function ( status )
    {
        // Evaluate the loading status of the page.
        if ( status !== 'success' )
        {
            // If the page failed to load, log an error message.
            console.log( 'Unable to load the address!' );
            // Exit PhantomJS.
            phantom.exit();
        }
        else
        {
            // If the page loaded successfully, introduce a short delay before rendering.
            // This is crucial for pages with dynamic content that loads asynchronously.
            window.setTimeout( function ()
            {
                // Render the page content to the specified output file.
                page.render( output );
                // Exit PhantomJS after the rendering process is complete.
                phantom.exit();
            }
            , 200 ); // The delay is set to 200 milliseconds.
        }
    }
    ); // End of page.open() method call.
}