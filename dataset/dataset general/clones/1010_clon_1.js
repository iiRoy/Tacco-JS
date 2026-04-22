var fs = require("fs") , url = require("url") , path = require("path") ;

/*
 * This Bobsled framework provides a basic HTTP server with routing,
 * template rendering, and static file serving capabilities.
 * It's designed to be lightweight and extensible.
 *
 * Initial TODOs for future development include:
 *  - Refactoring argument names for clarity.
 *  - Organizing template configuration and compiler logic into a more modular structure.
 */

function Bobsled ( opts )
{

  // Inherit from Node.js's native HTTP Server.
  require('http').Server.call ( this ) ;

  // Initialize options if not provided, ensuring 'opts' is always an object.
  if ( typeof ( opts ) == "undefined" ) {
    opts = { } ;
  }

  // Set the server port, defaulting to 8085 if not specified.
  // The number '8085' visually resembles 'BOBS' on an old calculator display.
  this.port = ( "port" in opts ) ? opts.port : 8085 ;

  // Configure environment-specific settings.
  if ( "env" in opts ) { this.env = opts.env ; }
  // Set user ID for process, if provided.
  if ( "uid" in opts ) { this.uid = opts.uid ; }
  // Set group ID for process, if provided.
  if ( "gid" in opts ) { this.gid = opts.gid ; }


  // Assign a template compiler function. If none is provided,
  // calling it will result in an error, ensuring proper setup.
  this.template_compiler = ( "template_compiler" in opts )
                         ? opts.template_compiler
                         : function ( ) {
                             throw new Error ( "no template compiler configured" ) ;
                           } ;


  // Define configuration for the template engine.
  // Currently set up for Erb-like delimiters.
  this.template_config = {
    evaluate    :    /<%([\s\S]+?)%>/g  , // Delimiters for code evaluation.
    interpolate : /<%=([\s\S]+?)%>/g   , // Delimiters for interpolated variables.
    varname     : [ "Page" , "Server" ] , // Names of variables passed to templates.
    strip       : false                 , // Do not strip whitespace by default.
    append      : true                    // Append output by default.
  } ;

  // Storage for compiled templates, indexed by their base names.
  this.templates = { } ;

  /*
   * Compiles all loaded templates. This method is useful during application
   * startup to pre-compile templates and catch any syntax errors early.
   */
  this.compileTemplates = function ( ) {
    for ( var template_name in this.templates ) {
      this.templates[ template_name ] . compile ( ) ;
    }
  } ;


  // Define server controllers for various request types.
  this.controllers = {

    // Handles requests for templates.
    template: function ( pathinfo, request, response ) {
      var template_name = pathinfo.basename || "index" ; // Default to 'index' if no basename.

      if ( template_name in this.templates ) {
        // If the template exists, render and respond.
        this.templateResponder ( template_name , pathinfo , response ) ;
      } else {
        // Otherwise, emit a 'notFound' event.
        this.emit ( "notFound" , pathinfo , request , response ) ;
      }
    } . bind ( this ) , // Ensure 'this' context is preserved.

    // Handles requests for static files (e.g., CSS, JS, images).
    "static": function ( pathinfo, request, response ) {
      var filename = "." + pathinfo.dirname + "/" + pathinfo.basename + pathinfo.extname ;

      // Check if the file exists and is indeed a file.
      if ( ! fs.statSync ( filename ) . isFile ( ) ) {
        this.emit ( "notFound" , pathinfo , request , response ) ;
      } else {
        // HACK: Content-type is hardcoded here. A proper MIME type mapping is needed.
        response.writeHead ( 200 , { "content-type" : "text/css" } ) ;
        fs.readFile ( filename , function ( err , data ) { response.end ( data ) ; } ) ;
      }
    } . bind ( this ) , // Ensure 'this' context is preserved.

    // Handles requests for the favicon.
    favicon: function ( pathinfo, request, response ) {
      // TODO: Implement proper caching headers (e.g., Expires, Cache-Control).
      response.writeHead ( 200 , { "content-type" : "image/x-icon" } ) ;
      fs.readFile ( "favicon.ico" , function ( err , data ) { response.end ( data ) ; } ) ;
    } ,

    // Handles requests for resources that were not found (404).
    notFound: function ( pathinfo, request, response ) {
      // Check if a custom '404' template is available.
      if ( "404" in this.templates ) {
        this.templateResponder ( "404" , { statusCode : 404 , pathinfo : pathinfo , request : request } , response ) ;
      } else {
        // Fallback to a plain text 404 response.
        response.writeHead ( 404 , { "content-type" : "text/plain" } ) ;
        response.end ( request.url + " not found" ) ;
      }
    } . bind ( this ) // Ensure 'this' context is preserved.

  } ;


  // Define the routing table for different HTTP methods and paths.
  this.routes = {

    GET: {
      "/": {
        "favicon.ico" : this.controllers.favicon , // Route for the favicon.
        "*.html"      : this.controllers.template   // Catch-all for HTML templates.
      }
    } ,

    POST: { } // Currently no POST routes defined by default.

  } ;


  // Setup static file routes dynamically.
  // A configuration option (e.g., opts.static_path) could be used here.
  if ( true ) { // This condition could be replaced by a check like `if (opts.serveStatic)`

    // Define default static folders. These could also be passed via opts.
    var static_folders = { "css" : "/css" , "img" : "/img" , "js" : "/js" } ;

    // Iterate through potential static folders.
    for ( folder in static_folders ) {
      // Check if the folder exists on the file system and is a directory.
      if ( fs.existsSync ( folder ) && fs.statSync ( folder ) . isDirectory ( ) ) {
        // Assign the static controller to handle requests for this folder.
        this.routes.GET[ static_folders[ folder ] ] = { "*" : this.controllers.static } ;
      }
    }
  }


  // Conditionally add an environment information route if 'env' option is enabled.
  if ( opts.env ) {

    // The path for this route could be configurable.
    this.routes.GET[ "/" ][ "env" ] = function ( pathinfo, request, response ) {

      // Set content type to JSON. TODO: Switch to HTML if extname suggests it.
      response.writeHead ( 200 , { "content-type" : "application/json" } ) ;

      // Gather various environment and OS details.
      var data = { env : process.env , uid : process.getuid ( ) , os : { } } ;
      var os = require ( "os" ) ;

      // Populate OS-related information.
      [ "hostname" , "type" , "platform" , "arch" , "release" , "networkInterfaces" , "cpus" ]
        . forEach ( function ( a ) {
          data.os[ a ] = os[ a ] ( ) ;
        } ) ;

      // If HOME environment variable is set, list its contents.
      if ( process.env.HOME ) {
        data.home = fs.readdirSync ( process.env.HOME ) ;
      }

      // data.passwd = require("getpw").getpwuid(data.uid); (TODO: pass to constructor to eliminate hard dep)

      // Send the JSON response, formatted for readability.
      response.end ( JSON.stringify ( data , null , "  " ) ) ;
    }
  }


  // Helper function for performing HTTP redirects.
  this.redirect = function ( new_url , response ) {
      response.writeHead ( 302 , { 'Location' : new_url } ) ; // HTTP 302 Found status.
      response.end ( ) ; // End the response.
  } ;


  // Register the 'notFound' controller to handle 'notFound' events.
  this.on ( "notFound" , this.controllers.notFound ) ;


  // The main routing logic, invoked for every incoming request.
  this.route = function ( request, response, body ) {

    // Parse the URL to extract components.
    var parsed_url = url.parse ( request.url , true ) ;

    var method   = request.method                                   ,
        dirname  = path.dirname ( parsed_url.pathname ) . replace ( /\/*$/, '' ) , // Remove trailing slash.
        extname  = path.extname ( parsed_url.pathname )             , // File extension. TODO: Default if missing?
        basename = path.basename ( parsed_url.pathname , extname ) || "index" ; // Base file name, default 'index'.


    // Log the incoming request details for debugging purposes.
    // This logging could be toggled by a configuration switch.
    console.log ( "%s %s/%s%s" , method , dirname , basename , extname ) ;


    // Special handling for the root directory.
    if ( dirname == "" ) {
      dirname = "/" ;
    }


    // TODO: Add an option for case-insensitive routing.
    // dirname = dirname.toLowerCase();
    // basename = basename.toLowerCase();


    var controller = this.controllers.notFound ; // Default to 404 controller.

    // Attempt to find a matching route based on method and directory.
    if ( this.routes[ method ] && this.routes[ method ][ dirname ] ) {

       // Search for the most specific route match.
       var candidate ,
           candidates = [ basename + extname , basename , "*" + extname , "*" ] ;

       // Iterate through candidates in order of specificity.
       while ( candidate = candidates.shift ( ) ) {
         if ( candidate in this.routes[ method ][ dirname ] ) {
             controller = this.routes[ method ][ dirname ][ candidate ] ;
             break ; // Found the most specific controller, exit loop.
         }
       }
    }

    // Execute the determined controller with parsed path information.
    return controller ( { dirname : dirname , basename : basename , extname : extname , query : parsed_url.query } , request , response , body ) ;
  } ;

} // End of Bobsled constructor function.


// Inherit Bobsled from Node.js's HTTP Server prototype.
// TODO: Consider using Node's `util.inherits` for cleaner inheritance.
Bobsled.prototype = Object.create ( require('http').Server.prototype ) ;
Bobsled.prototype.constructor = Bobsled ;


// Retrieves the current process user's name.
Bobsled.prototype.process_user = function ( ) {
  var pwuid_name = "" ;
  try {
    // Attempt to get the user name using 'getpw' module.
    pwuid_name = require("getpw").getpwuid ( process.getuid ( ) ) . pw_name ;
  } catch ( e ) {
    // Fallback if 'getpw' fails (e.g., module not installed or permission issues).
    pwuid_name = "user id " + process.getuid ( ) ;
  }
  return pwuid_name ;
} ;


// Provide access to commonly used Node.js built-in modules within templates.
Bobsled.prototype.util        = require ( "util" ) ;
Bobsled.prototype.querystring = require ( "querystring" ) ;


/*
 * A simple and "quick-and-dirty" HTML encoder.
 * This function is accessible in templates via `Server.html_encode()` or `Server.h()`.
 * It escapes basic HTML entities to prevent XSS.
 */
Bobsled.prototype.html_encode = Bobsled.prototype.h = function ( s ) {
  return s.replace ( /&/g , '\&amp;' ) . replace ( /</g , '\&lt;' ) . replace ( />/g , '\&gt;' ) ;
} ;

/*
 * Provides URI encoding for consistent naming and template access.
 * Accessible as `Server.url_encode()` or `Server.u()`.
 */
Bobsled.prototype.url_encode = Bobsled.prototype.u = function ( s ) {
  return encodeURIComponent ( s ) ;
} ;


// Adds a new template to the Bobsled server.
Bobsled.prototype.addTemplate = function ( opts ) {

  // Allow passing just the filename as a string.
  if ( typeof ( opts ) == "string" ) {
    opts = { filename : opts , compiler : this.template_compiler } ;
  }

  // Ensure template configuration is set, defaulting to server's config.
  if ( ! ( "config" in opts ) ) {
    opts.config = this.template_config ;
  }

  var extname  = path.extname ( opts.filename ) , // Extract file extension.
      basename = path.basename ( opts.filename , extname ) ; // Extract base name.

  // TODO: Implement logic to handle multiple extensions (e.g., 'template.html.dot').

  // TODO: Support template paths or nested template names.

  // Store the new template instance, indexed by its basename.
  this.templates[ basename ] = new Template ( opts ) ;
} ;


// Renders a named template and returns its content as a string.
Bobsled.prototype.partial = function ( template_name , data ) {
  return this.templates[ template_name ] . render ( data , this ) ;
} ;


// Handles responding to a request with a rendered template.
Bobsled.prototype.templateResponder = function ( template_name , data , response ) {
  var body = this.partial ( template_name , data ) ; // Render the template.
  var statusCode = ( data && data.statusCode ) || 200 ; // Determine HTTP status code.

  // Set response headers. TODO: Calculate and set "content-length".
  response.writeHead ( statusCode , { "content-type" : "text/html; charset=utf-8" } ) ;
  response.end ( body ) ; // Send the rendered HTML.
} ;


// Handles responding to a request with JSON data.
Bobsled.prototype.jsonResponder = function ( data , response ) {
  var json = JSON.stringify ( data , null , 2 ) ; // Convert data to formatted JSON string.

  // Set response headers. TODO: Calculate and set "content-length".
  response.writeHead ( 200 , { "content-type" : "application/json; charset=utf-8" } ) ;
  response.end ( json ) ; // Send the JSON response.
} ;


// Initiates the Bobsled server.
Bobsled.prototype.start = function ( ) {

  // Register the main request handler.
  this.on ( "request" , function ( request , response ) {
    var body = "" ;

    // For POST requests, accumulate the request body.
    if ( request.method == "POST" ) {
      request.on ( "data" , function ( chunk ) { body += chunk ; } ) ;
    }

    // Once the request ends, route it.
    request.on ( "end" , function ( ) {
      // Pass the body only for POST requests.
      this.route ( request , response , request.method == "POST" && body ) ;
    } . bind ( this ) ) ;
  } ) ;

  // Event handler for when the server starts listening.
  this.once ( "listening" , function ( ) {
      // Drop privileges if UID/GID are configured.
      if ( this.uid ) { process.setuid ( this.uid ) ; }
      if ( this.gid ) { process.setgid ( this.gid ) ; }

      // Log server status.
      console.log ( "Bobsled now running as " + this.process_user ( ) + " and listening at port " + this.port ) ;
  } ) ;

  // Start the HTTP server on the configured port.
  this.listen ( this.port ) ;
} ;


/*
 * Template class constructor.
 * Manages individual template files, compilation, and rendering.
 */
function Template ( opts )
{
  // The compiler function provided by Bobsled.
  this.compiler = opts.compiler ;
  // Configuration for the template engine.
  this.config   = opts.config ;

  // Ensure a filename is always provided for the template.
  if ( ! opts.filename ) {
    throw new Error ( "filename required for template" ) ;
  }

  // Verify that the template file exists and is accessible.
  if ( ! fs.existsSync ( opts.filename ) || ! fs.statSync ( opts.filename ) . isFile ( ) ) {
    throw new Error ( "template file not found: " + opts.filename ) ;
  }

  this.filename = opts.filename ; // Store the template's file path.

  // On the first compilation, set up a file watcher.
  // This could be made optional or conditional based on environment (e.g., dev mode).
  this.once ( "compiled" , function ( template ) {
    fs.watchFile ( template.filename , function ( curr , prev ) {
        // If the modification time has changed, emit a 'modified' event.
        if ( curr.mtime - prev.mtime ) {
          this.emit ( "modified" ) ;
        }
    } . bind ( template ) ) ;
  } ) ;

  // Recompile the template whenever it's modified.
  this.on ( "modified" , function ( ) {
    this.compile ( ) ;
  } ) ;
} // End of Template constructor.


// Template class inherits from EventEmitter to handle 'compiled' and 'modified' events.
Template.prototype = Object.create ( require('events').EventEmitter.prototype ) ;
Template.prototype.constructor = Template ;


// Compiles the template file into a render function.
Template.prototype.compile = function ( ) {
  // Read the template file content.
  var templateContent = fs.readFileSync ( this.filename , "utf8" ) ;
  // Use the configured compiler to create the render function.
  this.render = this.compiler ( templateContent , this.config ) ;
  // Emit 'compiled' event once compilation is complete.
  this.emit ( "compiled" , this ) ;
} ;


// Renders the template with provided data and context.
Template.prototype.render = function ( data , context ) {
  // If the template hasn't been compiled yet, compile it.
  // This also serves as a lazy compilation mechanism.
  this.compile ( ) ;
  // Call the newly compiled render function.
  return this.render ( data , context ) ;
} ;


// Export the Bobsled and Template classes, along with recipes.
if ( exports ) {
  exports.Bobsled  = Bobsled  ;
  exports.Template = Template ;
  exports.recipes  = require ( "./recipes" ) ;
}