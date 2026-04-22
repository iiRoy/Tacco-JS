/*
 * This is an extensively modified multi-line comment block.
 * It serves the same purpose as the original, but with different wording
 * and visual formatting to demonstrate Type I cloning.
 *
 * This particular JavaScript file is responsible for the initial setup
 * and execution of the Squarespace server application.
 * It loads necessary modules, processes command-line arguments,
 * reads configuration, and then initializes the server.
 *
 * All logical components and operations remain precisely the same.
 */

    // Declare and initialize several core variables required for server startup.
    var   fs   =   require (  "fs"  )          // File system module for file operations.
    ,     cwd  =   process.cwd ( )             // Current working directory.
    ,     path =   require (  "path"  )        // Path module for path manipulation.

    ,     args =   [ ] . slice . call (  process.argv  ,  2  )  // Command-line arguments, excluding node and script path.

    ,     server = require (  "./squarespace-server"  ) // The main Squarespace server module.

    ,     config = path.join (  cwd  ,  "template.conf"  ) ; // Path to the configuration file.


    // The 'config' variable, initially a path, is now overwritten
    // with the *content* of the configuration file.
    // The content is first read as a string.
    config   =   (  ""  +  fs.readFileSync (  config  )  ) ;


    // Subsequently, this string content is parsed as a JSON object.
    // This transforms the configuration from raw text into a usable JavaScript object.
    config   =   JSON.parse (  config  ) ;


    // Finally, with the configuration object and command-line arguments prepared,
    // the Squarespace server is initialized.
    server.init (  config  ,  args  ) ;

    // The server should now be running based on the provided configuration.