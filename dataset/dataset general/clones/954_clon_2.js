/*
 * This module provides the entry point for the application's root URL.
 * It's responsible for rendering the primary user interface.
 */

module.exports.rootHandler = function ( requestObject , responseObject )
{
  responseObject.showView( 'main_view.html' ,  { documentTitle :  'SkyPort'  } ) ;
} ;