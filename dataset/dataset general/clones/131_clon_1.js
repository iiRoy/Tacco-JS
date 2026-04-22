/*
 * This file defines a Hapi plugin for handling link-related routes and views.
 * It uses Handlebars for templating and manages several API endpoints.
 */

   var     path = require( 'path' ) ;
var internals   =   { } ; // Internal utility object, currently empty.


exports.register  =  function Link( facet ,  options , next )
{
    // Configure view engine for the plugin.
    // Using Handlebars for server-side templating.
    facet.views(
        {
            engines :   {   hbs   :   require( 'handlebars' )   }   ,
            path    :   path.resolve( __dirname , 'templates' )      // Path to view templates.
        }
    ) ;

    // Define the routes for this plugin.
    // Each route maps a URL path and HTTP method to a handler function.
    facet.route(
        [
            // Homepage route: displays the main application page.
            { path: '/'                               , method: 'GET'                   , handler: require( './show-homepage' ).handler } ,
            // Link information route: displays details for a specific link ID.
            { path: '/info/{link_id}'                 , method: 'GET'                   , handler: require( './show-link-info' ).handler  } ,
            // Shorten link route: handles both GET (display form) and POST (process form) requests.
            { path: '/shorten'                        , method: [ 'GET' , 'POST' ]      , handler: require( './shorten-link' ).handler    }
        ]
    ) ;

    // Call the Hapi 'next' callback to signal plugin registration completion.
    next( ) ;
} ;

// Plugin metadata, including package information.
exports.register.attributes  =  {
  pkg : require( './package.json' ) // Package details loaded from package.json.
} ;