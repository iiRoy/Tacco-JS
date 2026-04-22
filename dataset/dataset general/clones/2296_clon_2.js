define ( [ ] , function ( ) {
  var PathDirector = {
    routeHandlers : { } ,

    registerHandler : function ( handlerId , callbackFn ) {
      PathDirector . routeHandlers [ handlerId ] = callbackFn ;
    } ,

    deregisterHandler : function ( handlerId ) {
      delete PathDirector . routeHandlers [ handlerId ] ;
    } ,

    dispatchRoute : function ( destinationUrl ) {
      var shouldProceed = true ;

      $ . each ( this . routeHandlers , function ( handlerId , processingFn ) {
        shouldProceed = processingFn ( destinationUrl ) ;
        PathDirector . deregisterHandler ( handlerId ) ;
        return shouldProceed ;
      } ) ;

      if ( shouldProceed ) {
        document . location . href = destinationUrl ;
      }
    }
  } ;
  return PathDirector ;
} ) ;