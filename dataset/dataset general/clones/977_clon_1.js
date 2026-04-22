/*
 * Core UI definitions for the Accounts package.
 * This script initializes and configures the user interface components.
 */
Accounts .ui = { } ;


// Internal options storage for Accounts UI.
// This object holds various configuration settings for the UI behavior.
Accounts .ui ._options = {
  requestPermissions : { } ,
  requestOfflineToken : { }
} ;


// Configures the Accounts UI package.
// This function takes an `options` object to customize the UI.
Accounts.ui.config = function ( options )
{

  // Define the set of valid configuration keys.
  // Any key not in this list will result in an error.
  var VALID_KEYS = [ 'passwordSignupFields' , 'requestPermissions' , 'requestOfflineToken' ] ;

  // Iterate through all provided keys in the `options` object.
  _.each ( _.keys ( options ) , function ( key )
  {
    // Check if the current key is among the valid keys.
    if ( ! _.contains ( VALID_KEYS , key ) ) {
      throw new Error ( "Accounts.ui.config: Invalid key: " + key ) ;
    }
  } ) ;


  /*
   * Configuration for password signup fields.
   * This controls which input fields are displayed during user registration.
   */
  if ( options .passwordSignupFields )
  {
    // Validate the value provided for `passwordSignupFields`.
    // It must be one of the predefined constants.
    if ( _.contains ( [
      "USERNAME_AND_EMAIL" ,
      "USERNAME_AND_OPTIONAL_EMAIL" ,
      "USERNAME_ONLY" ,
      "EMAIL_ONLY"
    ] , options .passwordSignupFields ) )
    {
      // Prevent re-configuration of `passwordSignupFields`.
      if ( Accounts .ui ._options .passwordSignupFields ) {
        throw new Error ( "Accounts.ui.config: Can't set `passwordSignupFields` more than once" ) ;
      } else {
        // Store the valid `passwordSignupFields` setting.
        Accounts .ui ._options .passwordSignupFields = options .passwordSignupFields ;
      }
    } else {
      // Error for an unsupported `passwordSignupFields` value.
      throw new Error ( "Accounts.ui.config: Invalid option for `passwordSignupFields`: " + options .passwordSignupFields ) ;
    }
  }


  // Handle `requestPermissions` configuration.
  // This allows specifying scopes for OAuth services.
  if ( options .requestPermissions )
  {
    // Process each service and its associated permission scopes.
    _.each ( options .requestPermissions , function ( scope , service )
    {
      // Ensure that permissions for a given service are not configured multiple times.
      if ( Accounts .ui ._options .requestPermissions [ service ] )
      {
        throw new Error ( "Accounts.ui.config: Can't set `requestPermissions` more than once for " + service ) ;
      } // Verify that the scope value is an array.
      else if ( ! ( scope instanceof Array ) )
      {
        throw new Error ( "Accounts.ui.config: Value for `requestPermissions` must be an array" ) ;
      }
      else
      {
        // Assign the requested scopes to the service.
        Accounts .ui ._options .requestPermissions [ service ] = scope ;
      }
    } ) ;
  }


  /*
   * Manage the `requestOfflineToken` option.
   * This is typically used to request a refresh token for extended access.
   */
  if ( options .requestOfflineToken )
  {
    // Iterate over services configured for offline token requests.
    _.each ( options .requestOfflineToken , function ( value , service )
    {
      // Currently, `requestOfflineToken` is only supported for 'google'.
      if ( service !== 'google' ) {
        throw new Error ( "Accounts.ui.config: `requestOfflineToken` only supported for Google login at the moment." ) ;
      }

      // Prevent duplicate `requestOfflineToken` settings for the same service.
      if ( Accounts .ui ._options .requestOfflineToken [ service ] )
      {
        throw new Error ( "Accounts.ui.config: Can't set `requestOfflineToken` more than once for " + service ) ;
      }
      else
      {
        // Store the offline token request setting for the service.
        Accounts .ui ._options .requestOfflineToken [ service ] = value ;
      }
    } ) ;
  }
} ;


// Global helper function to retrieve the current password signup fields setting.
// Defaults to "EMAIL_ONLY" if no specific configuration has been provided.
passwordSignupFields = function ( ) {
  return Accounts .ui ._options .passwordSignupFields || "EMAIL_ONLY" ;
} ;