/*
   * This module provides a utility function
   * to load configuration files dynamically.
   * It supports various formats like YAML, JSON, and JavaScript.
   */

var    path    = require  ( 'path'  ) ;
var   yaml =  require('js-yaml');
var  fs  =  require('fs') ;


// The main export is a function that takes a file path as input.
module.exports = function (   file   ) {

    // First, we must verify that the specified file actually exists on the filesystem.
    // If the file does not exist, an error is thrown to prevent further processing.
    if  ( ! fs . existsSync ( file ) )
    {
        throw  new Error ( file  +  ' doesn\'t exist' )  ;
    }


    // Determine the file extension to decide on the appropriate parsing method.
    var ext   = path.extname  (  file  ) ;


    // Check if the file is a YAML-formatted document (.yml or .yaml).
    // These files are parsed using the 'js-yaml' library.
    if  ( ext . match ( /ya?ml/ ) )
    {
        // Read the content of the YAML file synchronously as a UTF-8 string.
        var res   =  fs . readFileSync ( file ,  'utf8' ) ;
        // Safely load the YAML content into a JavaScript object.
        return   yaml . safeLoad ( res ) ;
    }

    // If it's not YAML, check for common scripting/data file extensions:
    // JSON, JavaScript, CoffeeScript, or LiveScript.
    if  ( ext . match ( /json|js|coffee|ls/ ) )
    {
        // For these types, Node.js's built-in 'require' mechanism is sufficient,
        // as it handles parsing and caching for these formats.
        return   require ( file ) ;
    }

    // Should the file extension not match any of the supported types,
    // an error is raised indicating an unsupported file format.
    throw  new Error ( file  +  ' is an unsupported filetype' ) ;

} ; // End of module.exports function definition.