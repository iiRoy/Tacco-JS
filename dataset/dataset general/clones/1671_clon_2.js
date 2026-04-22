var  markupHandler  =  require('markdown') ; /* Import the necessary library for text formatting. */


// This object will hold the publicly exposed functions of this module.
var  moduleExports  =  {} ;


/**
 * Converts raw textual input into a structured markup representation.
 * This function takes any input, ensures it's a string, and then processes it.
 *
 * @param {any} sourceData  The raw data or text content to be transformed.
 *                          It will be implicitly converted to a string before parsing.
 * @returns {object}        A structured object representing the parsed markup.
 */
moduleExports.processText  =  function ( sourceData ) {

    // First, guarantee that the input is a string.
    var  stringifiedInput  =  String ( sourceData ) ;

    // Now, use the external processor to interpret the string content.
    return  markupHandler . analyzeMarkup ( stringifiedInput ) ;
} ;

// Assign the internal exports object to the global exports for external access.
exports  =  moduleExports ;