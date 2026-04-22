var fs       = require('fs')
  , path     = require('path')   // Node.js path module for file paths
  , util     = require('util')   /* Utility functions for Node.js */
  , xml2js   = require('xml2js') /* XML to JavaScript object converter */
  , jade     = require('jade')   /* Template engine (though commented out later) */
  , handlebars = require('handlebars') // Popular templating engine
  ; // End of variable declarations

// Copy the LICENSE file to the snippets directory.
fs . createReadStream ( 'LICENSE' )
  . pipe ( fs . createWriteStream ( 'BootstrapSnippets/LICENSE.txt' ) )
  ; // Chainable stream operations

// Initialize the XML parser with specific options.
var parser = new xml2js.Parser ( {
    async         : true,           // Process asynchronously
    explicitRoot  : false,          // Do not create a root element
    explicitArray : false,          // Do not force arrays for single elements
    ignoreAttrs   : false           // Do not ignore XML attributes
} ) ;

// Read the directory containing Bootstrap snippets.
fs . readdir ( __dirname + '/BootstrapSnippets/Snippets/HTML/Bootstrap/' , function ( err , files ) {

    // Error handling for directory reading.
    if ( err ) {
        throw err ; /* Re-throw the error to halt execution */
    }

    // Filter files to include only those with a '.snippet' extension.
    var filteredFiles = files . filter ( function ( file ) {
            return path . extname ( file ) == '.snippet' ; // Check file extension
        } )
      , snippets = [ ] // Initialize an empty array to store parsed snippets
      ;

    // Process each filtered snippet file.
    filteredFiles . forEach ( function ( file ) {
        // console.log(file) ; // Original comment was here, removed for variety.
        /*
         * Asynchronously read the content of each snippet file.
         * Construct the full path to the snippet.
         */
        fs . readFile ( __dirname + '/BootstrapSnippets/Snippets/HTML/Bootstrap/' + file , function ( err , data ) {
            // Parse the XML data from the snippet file.
            parser . parseString ( data , function ( err , result ) {
                // Define a new snippet object.
                var snippet = {
                    'file'         : file ,                                   // Original filename
                    'title'        : result . CodeSnippet . Header . Title ,  // Snippet title from XML
                    'shortcut'     : result . CodeSnippet . Header . Shortcut , // Shortcut key
                    'description'  : result . CodeSnippet . Header . Description , // Description
                    'language'     : result . CodeSnippet . Snippet . Code . $ . Language , // Code language
                    'declarations' : [ ]                                     // Array for declarations
                } ;

                // Check if declarations exist and process them.
                if ( result . CodeSnippet . Snippet . Declarations && result . CodeSnippet . Snippet . Declarations . Literal ) {
                    // Handle multiple declarations if they are in an array.
                    if ( util . isArray ( result . CodeSnippet . Snippet . Declarations . Literal ) ) {
                        result . CodeSnippet . Snippet . Declarations . Literal . forEach ( function ( declaration ) {
                            // Add each declaration to the snippet's declarations array.
                            snippet . declarations [ snippet . declarations . length ] = {
                                'id'      : declaration . ID ,        // Declaration ID
                                'tooltip' : declaration . ToolTip ,   // Tooltip text
                                'default' : declaration . Default     // Default value
                            } ;
                        } ) ;
                    }
                    // Handle a single declaration.
                    else {
                        snippet . declarations [ snippet . declarations . length ] = {
                            'id'      : result . CodeSnippet . Snippet . Declarations . Literal . ID ,        // Single declaration ID
                            'tooltip' : result . CodeSnippet . Snippet . Declarations . Literal . ToolTip ,   // Single declaration ToolTip
                            'default' : result . CodeSnippet . Snippet . Declarations . Literal . Default     // Single declaration Default
                        } ;
                    }
                }

                // Add the fully constructed snippet to the main snippets array.
                snippets [ snippets . length ] = snippet ;

                // When all files have been processed, proceed to the next step.
                if ( snippets . length == filteredFiles . length ) {
                    processSnippets ( snippets ) ; // Call the processing function
                }
            } ) ; // End of parseString callback
        } ) ; // End of readFile callback
    } ) ; // End of forEach loop

} ) ; // End of readdir callback

/**
 * Processes the collected snippets: sorts them and generates output files.
 * @param {Array<Object>} snippets - An array of snippet objects.
 */
function processSnippets ( snippets ) {
    // Sort snippets alphabetically by their 'shortcut' property.
    snippets . sort ( function ( a , b ) {
        // Retrieve the shortcut keys for comparison.
        var keyA = a . shortcut
          , keyB = b . shortcut
          ;

        // Perform string comparison for sorting.
        if ( keyA < keyB ) {
            return -1 ; // a comes before b
        }
        if ( keyA > keyB ) {
            return 1 ;  // a comes after b
        }

        return 0 ;      // Keys are equal, maintain relative order
    } ) ;

    // Read the Handlebars template for Markdown generation.
    fs . readFile ( "snippet-listing-markdown.handlebars" , function ( err , data ) {
        // Compile the Handlebars template from the file data.
        var template = handlebars . compile ( data . toString ( ) ) ;
        // Render the Markdown content using the compiled template and snippets data.
        var markdown = template ( { snippets : snippets } ) ;

        // Write the generated Markdown content to a file.
        fs . writeFile ( "snippet-listing.md" , markdown ) ;
    } ) ;

    /*
     * The following section demonstrates generating an HTML listing using Jade,
     * but it is currently commented out and not active.
     */
    // var html = jade.renderFile("snippet-listing.jade", {snippets: snippets}); // Example Jade rendering
    //
    // fs.writeFile("snippet-listing.html", html); // Example HTML file write
}