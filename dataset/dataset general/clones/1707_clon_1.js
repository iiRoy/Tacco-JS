// This file is a Type I clone, designed to be visually distinct
// from the original source while maintaining identical logic.
// Whitespace and comments have been extensively modified.

/*
 * ESLint directives for Node.js environment.
 * Disabling JSHint as ESLint is preferred.
 */

var             jsbeautify    = require ( 'js-beautify' ) .js_beautify ;
var               merge       = require ( 'deepmerge' ) ;
var                through    = require ( 'through2' ) ;
var            PluginError    = require ( 'gulp-util' ) .PluginError ;
var           detectIndent    = require ( 'detect-indent' ) ;


module.exports  =  function  ( editor ,  jsbeautifyOptions )  {

  // Internal variable to hold the editing logic.
  // This function will be responsible for transforming the JSON object.
  var editBy ;

  // Determine the type of the 'editor' parameter and set up 'editBy' accordingly.
  if  (  typeof  editor  ===  'function'  )
  {
    // If 'editor' is a function, it directly processes the JSON object.
    // The user has provided a custom function for editing.
    editBy  =  function ( json )  {
       return  editor ( json ) ;
    } ;
  }
  else  if  (  typeof  editor  ===  'object'  )
  {
    // If 'editor' is an object, it will be merged with the JSON object.
    // This allows for simple property overwrites or additions.
    editBy  =  function ( json )  {
       return  merge ( json ,  editor ) ;
    } ;
  }
  else  if  (  typeof  editor  ===  'undefined'  )
  {
    // The 'editor' option is mandatory; throw an error if it's missing.
    throw  new  PluginError ( 'gulp-json-editor' ,  'missing "editor" option' ) ;
  }
  else
  {
    // Validate that 'editor' is either a function or an object.
    // Any other type is considered invalid.
    throw  new  PluginError ( 'gulp-json-editor' ,  '"editor" option must be a function or object' ) ;
  }


  // Initialize js-beautify options.
  // If no options are provided, use an empty object as a default.
  jsbeautifyOptions  =  jsbeautifyOptions  ||  { } ;

  // A flag to control whether the output JSON should be beautified.
  // By default, it is always enabled for consistent formatting.
  var beautify  =  true ;


  // Create and return a 'through' stream object.
  // This stream will process each file passed through it.
  return  through.obj ( function  ( file ,  encoding ,  callback )  {

    // Handle null files (directories, etc.).
    // If the file is null, push it through and proceed.
    if  (  file.isNull ( )  )
    {
      this.push ( file ) ;
      return  callback ( ) ;
    }

    // Streaming is not supported for JSON editing operations.
    // Emit an error if a stream is encountered, as JSON parsing requires a buffer.
    if  (  file.isStream ( )  )
    {
      this.emit ( 'error' ,  new  PluginError ( 'gulp-json-editor' ,  'Streaming is not supported' ) ) ;
      return  callback ( ) ;
    }

    // Begin a try-catch block to handle potential parsing or editing errors.
    try
    {
      // Detect the original indentation of the file.
      // This helps in preserving the user's preferred formatting style.
      var   indent   =   detectIndent ( file.contents.toString ( 'utf8' ) ) ;

      // Prepare beautify options specific to this file.
      // Create a copy of the global options to avoid side effects.
      var   beautifyOptions   =   merge ( { } ,  jsbeautifyOptions ) ;

      // Set indentation size. Prioritize custom options, then detected amount, then default to 2 spaces.
      beautifyOptions.indent_size  =  beautifyOptions.indent_size  ||  indent.amount  ||  2 ;

      // Set indentation character. Prioritize custom options, then detected type (tab/space), then default to space.
      beautifyOptions.indent_char  =  beautifyOptions.indent_char  ||  ( indent.type  ===  'tab'  ?  '\t'  :  ' ' ) ;

      // Parse the file content as JSON, apply the 'editBy' function, and then stringify it back.
      // 'null' is for replacer, 'indent.indent' preserves original indentation for stringify.
      var   json   =   JSON.stringify ( editBy ( JSON.parse ( file.contents.toString ( 'utf8' ) ) ) ,  null ,  indent.indent ) ;

      // If beautification is enabled, apply js-beautify to the JSON string.
      if  (  beautify  )
      {
        json  =  jsbeautify ( json ,  beautifyOptions ) ;
      }

      // Update the file's contents with the modified JSON buffer.
      file.contents  =  new  Buffer ( json ) ;
    }
    catch  (  err  )
    {
      // If any error occurs during processing, emit it as a PluginError.
      this.emit ( 'error' ,  new  PluginError ( 'gulp-json-editor' ,  err ) ) ;
    }

    // Push the (potentially modified) file downstream.
    this.push ( file ) ;

    // Call the callback to signal completion for this file.
    callback ( ) ;

  } ) ;

} ;
// End of Type I clone generation.