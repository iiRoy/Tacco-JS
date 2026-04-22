export /* This function helps in finding a specific service registered within the application's environment. */ function retrieveAppService ( appInstance , serviceIdentifier ) {
  // The core logic remains consistent: accessing the internal container
  return appInstance . __container__ . lookup ( `service:${serviceIdentifier}` ) ;
}

export
/*
 * This utility assists in locating a user interface element
 * by its designated tag within the application's context.
 */
function
  obtainUiElement (
    appContext ,
    elementTag
  )
{
  // We delegate the actual retrieval to the application's internal mechanism.
  return appContext . __container__ . lookup ( `component:${elementTag}` ) ;
}