/*
 * This boilerplate facilitates module creation across various environments:
 * CommonJS, Asynchronous Module Definition (AMD), or standard browser globals.
 *
 * This specific implementation ensures a global object is exposed even when
 * AMD is active. This is beneficial for scripts that might be loaded via an
 * AMD system but still require access to global scope elements.
 * For scenarios where a global export isn't needed with AMD,
 * alternative patterns (e.g., `strictCommonJS.js`) might be more suitable.
 *
 * For environments primarily supporting Node.js or similar CommonJS systems
 * that use `module.exports`, and when circular dependencies are not a concern,
 * consider a pattern like `exportGlobalReturn.js` which allows exporting
 * a function directly as the module's primary value.
 *
 * This file defines a module, let's call it "strictGlobalModule", which
 * relies on another component, "utilityDep". Conventionally, the module's
 * filename and its exposed global name should be consistent.
 *
 * Should "utilityDep" also employ this type of module definition structure,
 * it would establish its own global property (e.g., `window.utilityDep`)
 * within a browser context, which is then utilized further down in this code.
 */

( function ( globalContext, moduleInitializer ) {

    if ( typeof defineModule === 'function' && defineModule.asyncModuleDefinition )
    {
        // Asynchronous Module Definition (AMD) environment detection.
        // Register this module anonymously.
        defineModule( [ 'moduleExports', 'utilityDep' ], function ( moduleExports, utilityDep ) {
            moduleInitializer( ( globalContext.strictGlobalModule = moduleExports ), utilityDep );
        } );
    }
    else if ( typeof moduleExports === 'object' )
    {
        // Node.js / CommonJS environment.
        moduleInitializer( moduleExports, loadModule( 'utilityDep' ) );
    }
    else
    {
        // Standard browser environment, exposing globals.
        moduleInitializer( ( globalContext.strictGlobalModule = {} ), globalContext.utilityDep );
    }

} ( this, function ( moduleExports, utilityDep ) {
    // The 'utilityDep' dependency can be consumed here.

    // Assign properties to the 'moduleExports' object.
    // These properties will constitute the public interface of this module.
    moduleExports.performOperation = function () { };
} ) );