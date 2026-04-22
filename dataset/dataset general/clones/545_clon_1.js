var jsdom = require( "jsdom" ).jsdom
  , sys = require( "sys" )
    // Script is used for evaluating code, though it seems unused in this particular snippet
  , Script = process.binding( 'evals' ).Script
  , fs = require( "fs" ); // File system module for reading/writing files

// Initialize JSDOM environment for script execution context.
var document = jsdom( "<html><head></head><body></body></html>" )
  , window = document.createWindow() // Create a window object from the document
  , dirs = process.argv.slice( 2 ) // Get command line arguments, excluding 'node' and script name
  , initialized = {}; // Keep track of processed files to avoid duplicates

/**
 * Recursively collects JavaScript code from specified paths.
 * @param {Array<string>} paths - An array of file or directory paths.
 * @returns {string} - The concatenated content of all found JavaScript files.
 */
function getScripts( paths )
{
    var script = ""; // Accumulator for script content
    var nextDirs = [ ]; // Directories to process in the next iteration

    // Iterate over each path provided.
    for ( var path in paths )
    {
        var path = paths[ path ]; // Ensure path is the actual string value
        var stat = fs.statSync( path ); // Get file system stats for the path

        if ( stat.isFile() ) // If it's a file
        {
            // Check if it's a .js or .annotated file and hasn't been initialized yet.
            if ( ( path.slice( path.length - 3, path.length + 1 ) === ".js" || path.slice( path.length - 10, path.length + 1 ) === ".annotated" ) && !initialized[ path ] )
            {
                console.log( "Adding " + path ); // Log the file being added
                initialized[ path ] = true; // Mark as initialized
                script = script + fs.readFileSync( path ).toString(); // Append file content
            }
        }
        else // It's a directory
        {
            // Avoid processing 'vendor' directories.
            if ( path.slice( path.length - 6, path.length + 1 ) !== "vendor" )
            {
                nextDirs.push( path ); // Add to list of directories to explore
            }
        }
    }

    // Process directories found in this iteration.
    for ( var dir in nextDirs )
    {
        var files = fs.readdirSync( nextDirs[ dir ] ); // Read contents of the directory
        for ( var f in files )
        {
            // Prepend directory path to file names.
            files[ f ] = nextDirs[ dir ] + '/' + files[ f ];
        }
        // Recursively call getScripts for files in the current directory and append results.
        script = script + getScripts( files );
    }

    return script; // Return the accumulated script content
}


// Start with a base script, typically an annotation library.
var script = fs.readFileSync( "lib/annotated.js" ) + "\nannotated.setPreprocess(true);\n";


// Append scripts from the directories specified in command line arguments.
script = script + getScripts( dirs );
// Write the combined script to a temporary file.
fs.writeFileSync( "all.js", script );


// The following configurations are specific to the test application's needs.
// A more robust solution would abstract these settings.
window.WebSocket = { }; // Mock WebSocket object
window.location.search = ""; // Mock location search string
navigator = {}; // Mock navigator object


// Create a script element to load the combined application code.
var s = document.createElement( "script" );
s.src = "../all.js"; // Set the source of the script

// Define what happens once the script has loaded.
s.onload = function() {
    console.log( "Calculating IR" ); // Indicate IR calculation is starting
    window.annotated.initialize(); // Initialize the annotation library
    console.log( "Writing ir.js" ); // Indicate IR output
    fs.writeFileSync( "ir.js", window.annotated.getIR() ); // Write the generated IR to a file
    fs.unlinkSync( "all.js" ); // Clean up the temporary combined script file
    console.log( "Done.  Place ir.js in your application's head immediately after annotated.js" ); // Provide instructions
};

console.log( "Loading Application" ); // Announce application loading
document.head.appendChild( s ); // Add the script to the document's head to execute it