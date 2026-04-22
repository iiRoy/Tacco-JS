'use strict';

// This is the primary server script for the demo application.
// It uses Express.js to serve static files and dynamically rendered HTML pages.
// No specific CORS configuration is needed for this local setup.

var fs              = require('fs');
var express         = require('express');

// Custom routes for the Peri$scope functionality
var periscopeRoutes = require('./periscope');

// Initialize the Express application instance.
var app             = express();

// Define the server port. This value should ideally match the one in gulpfile.js.
var SERVER_PORT     = 3000;

// Set up a custom template engine for rendering demo pages.
app.engine   ('html'
             , myTemplateEngine );


// Configure the views directory.
app.set      ( 'views'
             , './views' );

// Specify the default view engine.
app.set      ( 'view engine'
             , 'html' );


// Route for serving dynamic demo pages.
// Parameters: :demoPage (e.g., 'nested_ctrls'), :angularVersion (e.g., '1.6').
app.get( '/demos/:demoPage/:angularVersion' , function ( req
                                                        , res )
{
    // Render the specified demo page using the custom template engine.
    res.render( req.params.demoPage
              , {
                    demoPage:       req.params.demoPage
                  , angularVersion: req.params.angularVersion
                } );
} );


// Serve static assets from the 'public' directory.
app.use( express.static( __dirname
                       + '/public' ) );


// Serve Bower components, making them accessible via '/bower_components'.
app.use( '/bower_components'
       , express.static( __dirname
                       + '/bower_components' ) );


// Mount the Peri$scope-specific routes at the root path.
app.use( '/'
       , periscopeRoutes );


// Start the server and listen on the defined port.
var server = app.listen( SERVER_PORT
                       , function ( )
{
    // Log a message to the console once the server is running.
    console.log( 'App/Peri$scope server listening on port %d'
               , server.address().port );
} );


// --- Constants for HTML Template Generation ---

// The header content for all demo pages.
var DEMO_HEADER     = '<!doctype html>'
                    + '<html lang="en">'
                    + '<head>'
                    + '  <meta charset="utf-8">'
                    + '  <title>#angularVersion# #demoPageTitle#</title>'
                    + '  <link rel="stylesheet" href="/styles/demos.css">'
                    + '  <base href="/">'
                    + '</head>'
                    + '<body ng-app="myApp">'
                    + '<div><img class="logo" src="/images/periscope_small.png" alt="Peri$scope">'
                    +   '<span class="page-title">Angular #angularVersion# - #demoPageTitle#</span>'
                    + '  <button onclick="instructionEl.style.display = \'none\'">hide instructions</button>'
                    + '  <button onclick="instructionEl.style.display = \'block\'">show instructions</button>'
                    + '  <button onclick="instructionEl.style.height = (instructionEl.offsetHeight + 20) + \'px\'"> + </button>'
                    + '  <button onclick="instructionEl.style.height = (instructionEl.offsetHeight - 40) + \'px\'"> - </button>'
                    + '</div>';


// The footer content for all demo pages, including scripts.
var DEMO_FOOTER     = '<div periscope></div>'
                    + '<script>var instructionEl = document.getElementById("instructions");</script>'
                    + '<script src="/bower_components/angularjs-#angularVersion#/angular.js"></script>'
                    + '<script src="/scripts/periscopeModule.js"></script>';


// A mapping of demo page identifiers to their display titles.
var DEMO_PAGE_TITLES =
{
      nested_ctrls:       'nested controllers'
    , scope_props:        '$scope properties'
    , simple_form:        'simple form'
    , nested_forms:       'nested forms'
    , ngrepeat:           'ngRepeat'
    , ngview:             'ngView'
    , nginclude:          'ngInclude'
    , ngif:               'ngIf'
    , ngswitch:           'ngSwitch'
    , dir_noscope:        'directive with no new scope'
    , dir_scope:          'directive with a new child scope'
    , dir_isolate:        'directive with an isolate scope'
    , dir_trans_noscope:  'directive with a transcluded scope only'
    , dir_trans_scope:    'directive with a transcluded scope and a child scope'
    , dir_trans_isolate:  'directive with a transcluded scope and an isolate scope'
    , dir_multiple:       'multiple directives on one element'
    , service:            'referencing data in a service'
    , service_inject_dir: 'injecting a service into a directive'
    , controller_as:      '"controller as"'
};


// HTML tags for code block formatting.
var CODE_PRE        = '<div class="code"><pre>';
var CODE_POST       = '</pre></div>';


/**
 * Custom template engine for Express.js to process HTML files.
 * It replaces placeholders with dynamic content and includes common header/footer.
 * @param {string} filePath - The path to the template file.
 * @param {object} options - Options containing demoPage and angularVersion.
 * @param {function} callback - Callback function to return the rendered HTML.
 */
function myTemplateEngine ( filePath
                          , options
                          , callback )
{
    // Read the content of the template file asynchronously.
    fs.readFile( filePath
               , function ( err
                          , content )
    {
        // If an error occurs during file reading, throw it.
        if ( err )
        {
            throw new Error( err );
        }

        // Convert the file content to a string and perform placeholder replacements.
        var rendered = content.toString()

            // Replace the header placeholder with the global DEMO_HEADER.
            .replace( '#header#'
                    , DEMO_HEADER )

            // Replace the footer placeholder with the global DEMO_FOOTER.
            .replace( '#footer#'
                    , DEMO_FOOTER )

            // Replace all occurrences of #demoPageTitle# with the appropriate title.
            .replace( /#demoPageTitle#/g
                    , DEMO_PAGE_TITLES[options.demoPage] )

            // Replace the #demoPage# placeholder.
            .replace( '#demoPage#'
                    , options.demoPage )

            // Replace all occurrences of #angularVersion# with the specified version.
            .replace( /#angularVersion#/g
                    , options.angularVersion )

            // Replace Peri$scope button shortcut.
            .replace( /#psb#/g
                    , 'Peri$scope button' )

            // Replace reset button shortcut.
            .replace( /#rb#/g
                    , 'reset button' )

            // Replace custom |...| syntax with <tt> tags for inline code.
            .replace( /\|([$-\w\.\(\)]+)\|/g
                    , '<tt>$1</tt>' );


        // Handle specific logic for the 'ngview' demo page.
        if ( options.demoPage === 'ngview' )
        {
            // Angular versions 1.0 and 1.2 do not require separate ngRoute scripts/modules.
            if ( options.angularVersion === '1.0'
              || options.angularVersion === '1.2' )
            {
                rendered = rendered
                  .replace( '#ngroute-script#'
                          , '' )
                  .replace( '#ngroute-module#'
                          , '' );
            }
            // For other Angular versions, include the ngRoute script and module.
            else
            {
                rendered = rendered
                  .replace( '#ngroute-script#'
                          , '<script src="/bower_components/angularjs-route-'
                          + options.angularVersion
                          + '/angular-route.js"></script>' )
                  .replace( '#ngroute-module#'
                          , "'ngRoute'," );
            }
        }

        // Return the final rendered content after processing side-by-side code blocks.
        return callback( null
                       , sideBySideCode( rendered ) );
    } );
}


/**
 * Processes content to extract and format code blocks for side-by-side display.
 * @param {string} content - The HTML content to process.
 * @returns {string} The content with formatted code blocks.
 */
function sideBySideCode ( content )
{
    // Check if both code start and end markers exist in the content.
    if ( ( content.indexOf( '#code-start#' ) > -1 )
      && ( content.indexOf( '#code-end#'   ) > -1 ) )
    {
        // Extract the raw code block between the markers.
        var code = content.slice( content.indexOf( '#code-start#' )
                                + '#code-start#'.length
                                , content.indexOf( '#code-end#' ) );

        // Format the extracted code for display.
        code = CODE_PRE
             + code
                // Remove <br> tags, which might be used for line breaks in templates.
                .replace( /<br>/g
                        , '' )
                // Remove <i> or </i> tags.
                .replace( /<\/?i>/g
                        , '' )
                // Escape HTML angle brackets to display as text.
                .replace( /</g
                        , '&lt;' )
                // Modify Angular's {{...}} interpolation syntax to prevent browser rendering.
                .replace( /{{/g
                        , '{<span></span>{' )
                // Remove trailing whitespace at the end of the code block.
                .replace( /\n\s+$/
                        , '' )
             + CODE_POST;

        // Replace the markers and insert the formatted code block back into the content.
        content = content
          .replace( '#code-start#'
                  , code )
          .replace( '#code-end#'
                  , '' );
    }

    // Return the processed content.
    return content;
}