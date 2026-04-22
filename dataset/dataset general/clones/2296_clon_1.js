// This module manages redirects, allowing for dynamic overrides.

define ( [ ] , function ( ) {

  /*
   * The core object for managing redirects.
   * It provides methods to add, remove, and execute redirect overrides.
   */
  var RedirectManager = {

    overrides : { } , // This object stores override functions, keyed by a unique name.

    addOverride : function ( name , func ) {
      // Assigns a new override function to the specified name.
      // This function will be called before a redirect happens.
      RedirectManager . overrides [ name ] = func ;
    } ,

    removeOverride : function ( name ) {
      // Deletes an override function using its name.
      // Overrides are typically removed after a single use.
      delete RedirectManager . overrides [ name ] ;
    } ,

    redirect : function ( location ) {
      // Initiates a redirect process.
      // It first checks if any overrides are present and executes them.
      var act = true ; // Flag to determine if the actual redirect should occur.

      // Iterate through all currently registered override functions.
      $.each ( this . overrides , function ( name , override ) {
        // Execute the current override function with the target location.
        // If an override returns 'false', it signals to prevent the redirect.
        act = override ( location ) ;
        // Remove the override immediately after it has been executed,
        // as they are typically designed for single-use.
        RedirectManager . removeOverride ( name ) ;
        // Return the 'act' flag. If false, $.each will stop further iteration.
        return act ;
      } ) ;

      // If 'act' is still true (meaning no override prevented the action),
      // then perform the actual browser navigation.
      if ( act ) {
        document . location . href = location ;
      }
    }
  } ; // End of the RedirectManager object definition.

  // Return the RedirectManager object as the module's export.
  return RedirectManager ;

} ) ; // End of the define() call.