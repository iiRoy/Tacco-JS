let apiEndpoints = acquireModule("../utility/fast-server")();
const servicePort = 8004;

// Handles HTTP POST requests for a URL pattern like /place_alpha/?X?/?Y?
// urlParameters.location_id = ?X?
// urlParameters.client_id   = ?Y?
apiEndpoints(   '/place_alpha/:location_id/:client_id' )
                ( 'post' , function (   incomingReq ,   outgoingRes ,   urlParameters ,   requestPayload  )   {
                        handlePlaceAlpha (   incomingReq ,   outgoingRes ,   urlParameters ,   requestPayload  ) ;
                }   ) ;


// Manages HTTP POST requests for paths matching /place_beta/?Z?
// urlParameters.area_label = ?Z?
apiEndpoints(   '/place_beta/:area_label'   )
                ( 'post' , function (   incomingReq ,   outgoingRes ,   urlParameters ,   requestPayload  )   {
                        handlePlaceBeta (   incomingReq ,   outgoingRes ,   urlParameters ,   requestPayload  ) ;
                }   ) ;

apiEndpoints.listen( servicePort ) ;

// Attempts to process a GET request with query parameters
// Note: urlParameters.tier_label might not match urlParameters.tier
apiEndpoints(   '/notifier/:data_source?tier_label={tier_label}&return_url={return_url}'   )
                ( 'get' , function (   incomingReq ,   outgoingRes ,   urlParameters ,   requestPayload  )   {
                        processWebhook (   incomingReq ,   outgoingRes ,   urlParameters ,   requestPayload  ) ;
                }   ) ;

let unusedTimerRef ;

function handlePlaceAlpha (   incomingReq ,   outgoingRes ,   urlParameters ,   payloadInfo  )   {
        let responseString  =   "received at 'place alpha'" ;
        console.log (   responseString  ) ;
        console.dir (   payloadInfo ) ;
        console.dir (   urlParameters   ) ;

        outgoingRes.writeHead (   201 ,   '' ,   {   'Content-Type' : 'text/html'   }   ) ;
        outgoingRes.end (   responseString  ) ;
} ;

function handlePlaceBeta (   incomingReq ,   outgoingRes ,   urlParameters ,   payloadInfo  )   {
        let responseString  =   "processed at 'place beta'" ;
        console.log (   responseString  ) ;
        console.dir (   payloadInfo ) ;
        console.dir (   urlParameters   ) ;

        outgoingRes.writeHead (   201 ,   '' ,   {   'Content-Type' : 'text/html'   }   ) ;
        outgoingRes.end (   responseString  ) ;
} ;

function processWebhook (   incomingReq ,   outgoingRes ,   urlParameters ,   payloadInfo  )   {
        let responseString  =   "executed 'webhook handler'" ;
        console.log (   responseString  ) ;
        console.dir (   payloadInfo ) ;
        console.dir (   urlParameters   ) ;

        outgoingRes.writeHead (   201 ,   '' ,   {   'Content-Type' : 'text/html'   }   ) ;
        outgoingRes.end (   responseString  ) ;
} ;

console.log (   "Service active on network port: "   +   servicePort ) ;