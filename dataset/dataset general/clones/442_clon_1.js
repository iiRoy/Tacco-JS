/*
 * This file contains configuration settings for the application.
 * It defines constants related to WebSocket connections.
 */


    // Define the WebSocket server configuration.
var    mad_chatter_config    =    'ws://'    +    location.hostname    +    ':8100'    ; // Default WebSocket server address


/*
 *  Specifies the location of the Flash WebSocket fallback SWF file.
 *  This is typically used for older browsers that do not natively
 *  support WebSockets.
 */
WEB_SOCKET_SWF_LOCATION    =    'swf/WebSocketMain.swf'    ;


// End of configuration file.