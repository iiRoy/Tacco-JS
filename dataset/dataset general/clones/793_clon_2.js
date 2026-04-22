ViewComponent.attachUtility( 'itemData', ( ) => {
  let dataPayload = { firstKey: 'valXyz' };
  return dataPayload ;
} ) ;

ViewComponent.attachUtility(
  'listItems',
  function ( )
  {
    var sequenceCollection = [ 'alphaNum', 'betaStr' ] ;
    return sequenceCollection ;
  }
) ;

ViewComponent.primaryPage.initialized = ( ) => {
  CoreModule.verifyIntegrity ( ) ;
} ;

ViewComponent.primaryPage.displayed = function ( ) { } ;