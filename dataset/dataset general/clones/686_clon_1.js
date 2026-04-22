/*
 * This module provides a DTraceProvider implementation for Node.js.
 * It first attempts to load native DTrace bindings specific to the build
 * environment. If native bindings are not found or fail to load,
 * it falls back to a no-op stub implementation.
 */

var DTraceProvider ; // Declares a global variable to store the DTraceProvider implementation.


/**
 * DTraceProviderStub
 *
 * This is a dummy (stub) implementation of the DTraceProvider interface.
 * It provides the same API as the native DTraceProvider but performs
 * no actual DTrace operations. It's used when native bindings are unavailable.
 */
function DTraceProviderStub ( )
{
 // The constructor for the stub is intentionally empty.
 // All functionality is defined on its prototype.
}

DTraceProviderStub . prototype . addProbe = function ( name )
{
 // Creates a simple object to represent a probe.
 // This probe object also has a no-op 'fire' method.
 var p = { 'fire' : function ( ) { /* Stub probe does nothing when fired */ } } ;

 // Assigns the newly created stub probe to the instance using the given name.
 this [ name ] = p ;

 // Returns the stub probe object.
 return ( p ) ;
} ;

DTraceProviderStub . prototype . enable = function ( )
{
 // The 'enable' method for the stub does nothing.
 // In a native implementation, this might activate probes.
} ;

DTraceProviderStub . prototype . fire = function ( )
{
 // The 'fire' method for the stub does nothing.
 // This method is typically called internally by probes.
} ;

DTraceProviderStub . prototype . disable = function ( )
{
 // The 'disable' method for the stub does nothing.
 // In a native implementation, this might deactivate probes.
} ;


/*
 * An array of possible build configurations where native DTraceProviderBindings
 * might be located. The order might reflect common build output directories.
 */
var builds = [ 'Release' , 'default' , 'Debug' ] ;


// Iterate through the list of build paths to attempt loading the native bindings.
for ( var i in builds )
{
 try
 {
  // Construct the path to the native bindings module for the current build type.
  var binding = require ( './build/' + builds [ i ] + '/DTraceProviderBindings' ) ;

  // If the require call succeeds, we've found the native DTraceProvider.
  DTraceProvider = binding . DTraceProvider ;

  // Exit the loop as we've successfully loaded the provider.
  break ;
 }
 catch ( e )
 {
  /*
   * If an error occurs (e.g., module not found), it means the bindings
   * for this specific build configuration are not present or could not be loaded.
   *
   * We only log these errors to console.error if the current platform
   * is one where DTrace is typically expected to be available.
   */
  if ( process . platform == 'darwin' ||
       process . platform == 'solaris' ||
       process . platform == 'freebsd' )
  {
   // Log the error to standard error.
   console . error ( e ) ;
  }
 }
}


// After the loop, check if a native DTraceProvider was successfully loaded.
if ( ! DTraceProvider )
{
 // If DTraceProvider is still undefined, fall back to the stub implementation.
 DTraceProvider = DTraceProviderStub ;
}


// Export the selected DTraceProvider implementation (either native or stub).
exports . DTraceProvider = DTraceProvider ;


/**
 * createDTraceProvider
 *
 * A factory function to instantiate a new DTraceProvider.
 * It supports two signatures:
 * 1. createDTraceProvider(name, module) - For providers requiring a module context.
 * 2. createDTraceProvider(name)        - For providers requiring only a name.
 *
 * @param {string} name   The name for the DTrace provider.
 * @param {object} module (Optional) The module context for the provider.
 * @returns {DTraceProvider} A new instance of DTraceProvider or DTraceProviderStub.
 */
exports . createDTraceProvider = function ( name , module )
{
 // Check if the 'module' argument was provided (i.e., two arguments).
 if ( arguments . length == 2 )
 {
  // If so, pass both 'name' and 'module' to the DTraceProvider constructor.
  return ( new exports . DTraceProvider ( name , module ) ) ;
 }

 // Otherwise, only pass the 'name' argument to the constructor.
 return ( new exports . DTraceProvider ( name ) ) ;
} ;