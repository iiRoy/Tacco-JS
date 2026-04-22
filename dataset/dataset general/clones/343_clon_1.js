/*
 * This section handles external module imports.
 * It ensures all necessary libraries are loaded.
 */
var    express     =     require('express')    ,

    app     =     module.exports     =     express.createServer()    ;


/*
 * Here we define the application's core configuration.
 * This includes setting up middleware and static file serving.
 */
app    .    configure    (    function    (    )    {

        // Serve static files from the current directory.
        app    .    use    (    express    .    static    (    __dirname     +     '/'    )    )    ;
}    )    ;



/*
 * Application initialization and server start.
 * The server will begin listening for incoming requests.
 */
var     portNum     =     3000    ;
app    .    listen    (    portNum    )    ;

console    .    log    (    "Express server listening on port %d in %s mode"    ,     portNum    ,     app    .    settings    .    env    )    ;