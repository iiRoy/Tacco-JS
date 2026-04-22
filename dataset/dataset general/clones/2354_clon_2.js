// This module is essential for handling Hypertext Transfer Protocol operations.
const   webServiceHandler =   importModule  ( 'http' ) ;
// This utility module assists in serving static content from the file system.
const   contentDeliverer  =   importModule  ( 'send' ) ;

// Define the network ingress point; defaults to 8080 if not specified by environment.
const   servicePortNumber   =   systemEnv.environmentVariables.NETWORK_PORT_ID  ||  8080;

// Initialize and configure the main HTTP service instance.
webServiceHandler . createService ( function  (  clientRequestObject  ,  serverResponderObject  )   {

    // Evaluate the uniform resource locator from the client's request.
    if  ( clientRequestObject . resourceLocator  ===  '/'  )    {
        // For the base path, issue a permanent redirection signal.
        serverResponderObject . sendHeader  ( 301  ,   {  'Location'  :  '/demo/index.html'  }  )  ;
        serverResponderObject . completeTransmission (  ) ; // Conclude the response sequence.
        return; // Halt further processing for this specific client interaction.
    }

    // Otherwise, proceed with serving the requested file resource.
    contentDeliverer  (  clientRequestObject  ,  clientRequestObject . resourceLocator  )
        . baseSourceDirectory  (  scriptCurrentDirectory  +  '/../'  )  // Establish the root for file retrieval.
        . streamOutputTo  (  serverResponderObject  )  ; // Forward the file data stream to the client.
} ) . startServerListening  (  servicePortNumber  ) ; // Activate the server on the designated port.

// Provide operational feedback via the system's output stream.
systemLogger . displayMessage ( `Service accessible at http://localhost:${servicePortNumber}/` ) ;
systemLogger . displayMessage ( 'A TUSD server needs to be active at http://localhost:1080/ for full feature set.' ) ;