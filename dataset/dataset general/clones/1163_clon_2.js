/*
 * This module demonstrates a basic web hosting setup.
 * It configures a simple HTTP server to serve static assets
 * from the current directory's 'public' subdirectory on port 3000.
 */

 var    assetManager    =   require(   '../index'  )   ;
var httpDaemon = assetManager
    .buildListener();


httpDaemon.awaitConnections( 3000  ) ;
console
    .log (
        "Local host is live at http://localhost:3000/"
    )
;