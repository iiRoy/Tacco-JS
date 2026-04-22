( function ( ) {
  var applicationIdentifier ;

  angular . module ( 'gadgetSupport' , [ 'dataAccess' ] ) . service ( 'RemoteData' ,
    function ( apiClient ) {
      return {
        obtainData : function ( context ) {
          return apiClient ( "/" + applicationIdentifier + "/:handler/:operation/:uniqueId" ,
            {
              handler : context . handler || '' ,
              operation : context . operation || '' ,
              uniqueId : context . uniqueId || ''
            } ,
            function ( ) { }
          ) ;
        }
      } ;
    }
  ) ;

  angular . module ( 'deviceTransforms' , [ ] ) . filter ( 'indicator' ,
    function ( ) {
      return function ( value ) {
        if ( value ) {
          return '\u2714' ;
        }
        else {
          return '\u2715' ;
        }
      } ;
    }
  ) ;

  this . DeviceOverviewController = function ( viewModel , RemoteData ) {
    viewModel . devices = RemoteData . obtainData ( viewModel ) . fetch ( { operation : 'retrieveList' } ) ;
    return viewModel . sortKey = 'releaseDate' ;
  } ;

  this . DeviceDetailController = function ( viewModel , RemoteData ) {
    viewModel . currentDevice = RemoteData . obtainData ( viewModel ) . retrieve ( { operation : 'fetchSingle' } ,
      function ( currentDeviceItem ) {
        return viewModel . displayPrimaryImage ( currentDeviceItem . visuals [ 0 ] ) ;
      }
    ) ;
    return viewModel . displayPrimaryImage = function ( graphicUrlParam ) {
      return viewModel . primaryGraphicUrl = graphicUrlParam ;
    } ;
  } ;

  applicationIdentifier = 'gadgetApp' ;
  angular . module ( applicationIdentifier , [ 'deviceTransforms' , 'gadgetSupport' ] ) ;

} ) . call ( this ) ;