/*
 * This function is responsible for parsing a given URI string
 * and breaking it down into its constituent components.
 * It utilizes a regular expression parser defined in its options.
 */
function parseUri(  str  ) {
    var o = parseUri.options,     // Retrieve parsing options
        m = o.parser[o.strictMode ? "strict" : "loose"].exec(str), // Execute regex based on strict mode
        uri = {},                 // Initialize an empty object to store URI components
        i = 14;                   // Counter for iterating through URI keys


    // Loop backwards through the keys to populate the uri object
    while (   i--   ) {
        uri[ o.key[i] ] = m[i] || ""; // Assign captured groups, default to empty string if undefined
    }


    uri[ o.q.name ] = {}; // Initialize the query string object
    // Parse the query string part of the URI
    uri[ o.key[12] ].replace(o.q.parser, function ( $0, $1, $2 ) {
                                         // If a key ($1) exists, assign its value ($2)
                                         if ( $1 ) {
                                             uri[ o.q.name ][ $1 ] = $2;
                                         }
                                     }
    );


    // Extract the file extension from the file component
    uri['extension'] = uri.file.substr( uri.file.lastIndexOf('.') + 1 );


    return uri; // Return the fully parsed URI object
};


// Configuration options for the parseUri function
parseUri.options = {
    strictMode: false, // Flag to determine strict vs. loose parsing
    key: [
        "source",       // 0: Full original string
        "protocol",     // 1: e.g., 'http'
        "authority",    // 2: e.g., 'www.example.com:8080'
        "userInfo",     // 3: e.g., 'user:pass'
        "user",         // 4: e.g., 'user'
        "password",     // 5: e.g., 'pass'
        "host",         // 6: e.g., 'www.example.com'
        "port",         // 7: e.g., '8080'
        "relative",     // 8: e.g., '/path/to/file.html?query#anchor'
        "path",         // 9: e.g., '/path/to/file.html'
        "directory",    // 10: e.g., '/path/to/'
        "file",         // 11: e.g., 'file.html'
        "query",        // 12: e.g., 'query'
        "anchor"        // 13: e.g., 'anchor'
    ],
    q: { // Query string parsing options
        name: "queryKey", // Name of the property for parsed query parameters
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g // Regex for parsing query string key-value pairs
    },
    parser: { // Regular expressions for URI parsing
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/, // Strict URI regex
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/  // Loose URI regex
    }
};


// This object maps file extensions to syntax highlighting languages.
// The data is based on file types from http://www.fileinfo.com/list/x
var ext_mapper = {
    'c': 'c',
    'h': 'c',
    'm': 'c',

    'css': 'css',

    'cpp': 'cpp',
    'c++': 'cpp',
    'cc': 'cpp',
    // Note: 'h' is duplicated, will be overwritten by 'cpp' entry
    'h': 'cpp',

    'c#': 'csharp',
    'cs': 'csharp',

    'diff': 'diff',
    'patch': 'diff',

    'as': 'flex',

    'html': 'html',
    'htm': 'html',

    'java': 'java',

    'js': 'javascript_dom',

    'tex': 'latex',

    'log': 'log',

    'm4': 'm4',

    'pas': 'pascal',
    '~pa': 'pascal',

    'pl': 'perl',

    'php': 'php',
    'php3': 'php',
    'php4': 'php',
    'php5': 'php',

    'py': 'python',

    'rb': 'ruby',

    'scl': 'scala',

    'sh': 'sh',
    'bash': 'bash',

    'sql': 'sql',

    'tcl': 'tcl',

    'xml': 'xml',
    'xhtml': 'xml',
    'xslt': 'xml',
    'xdl': 'xml',
    'xlnk': 'xml',
    'xsd': 'xml',
    'xsl': 'xml',
    'xspf': 'xml',
    'xul': 'xml',
};


// This object maps specific filenames to syntax highlighting languages.
var fn_mapper = {
    'Makefile': 'makefile' // Example: Makefile for makefile syntax
};


/*
 * Function to handle a document once its URI and source code are available.
 * It parses the URI, determines the syntax highlighting, updates the document title,
 * displays the source, and applies syntax highlighting.
 */
function gotDocument( uri, source ) {
    var components = parseUri( uri ); // Parse the given URI
    var extension = components.extension; // Get the file extension
    var syntax = ext_mapper[ extension ]; // Map extension to a syntax highlighter


    // If no specific syntax is found for the extension
    if ( ( syntax === null ) || ( syntax === undefined ) ) {
        // Check if the source looks like HTML (starts with '<')
        if ( source[0] == '<' ) {
            syntax = 'html'; // Assume HTML
        } else {
            syntax = ''; // No specific syntax, use default (or none)
        }
    }


    // Set the document title to the file name or the full URI if no file name
    document.title = components.file ? components.file : uri;


    $( 'body' ).empty(); // Clear existing body content
    // Create a <pre> tag, set its text, add syntax class, and append to body
    $( '<pre></pre>' )
        .text( source )
        .addClass( 'sh_' + syntax )
        .appendTo( 'body' );


    // If a syntax was determined, apply the syntax highlighting
    if ( syntax != '' ) {
        sh_highlightDocument( 'js/lang/', '.min.js' );
    }


    // Attach a click handler to all 'a' tags that just returns true
    $( 'a' ).click( function() {
                        return true; // Allow default link behavior
                    }
    );
}


/*
 * jQuery document ready function:
 * Initializes the application by fetching a document based on the URL's query string
 * or a default sample file.
 */
$( function() {
    // Determine the URI: from query string (unescaped) or a default sample
    var uri = window.location.search ? unescape( window.location.search.substr(1) ) : 'samples/jquery.timeago.js';
    // Fetch the document content via AJAX
    $.get( uri, function( data ) {
                   gotDocument( uri, data ); // Process the fetched document
               }
    );
});


/*
 * jQuery live click handler for all 'a' tags:
 * Overrides default link behavior to load new content via AJAX,
 * updating the URL's query string.
 */
$( 'a' ).live( 'click', function() {
    var uri = '' + window.location; // Get current window location as string


    // If the URI contains a query string, remove it
    if ( uri.indexOf('?') != -1 ) {
        uri = uri.substr( 0, uri.indexOf('?') - 1 );
    }


    // Update window location with the new link's href as a query parameter
    window.location = '?' + escape( $( this ).attr( 'href' ) );


    return false; // Prevent default link navigation
});