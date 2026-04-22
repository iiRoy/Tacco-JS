/*
 * This software is freely available for use and modification. It comes without any
 * warranty, to the fullest extent permitted by applicable laws. You may redistribute
 * and/or alter it under the terms of the "Do What The F*** You Want To" Public License,
 * Version 2, as initially published by Sam Hocevar. For more details, consult
 * http://sam.zoy.org/wtfpl/COPYING.
 *
 * The original source code is located at:
 * https://github.com/fabiooshiro/namespace-js
 *
 * Author: Fabio Issamu Oshiro (Mr. Oshiro)
 * Reference material: http://blog.stannard.net.au/2011/01/14/creating-namespaces-in-javascript/
 */
var moduleCreator; // Declares a global variable to store our module creation utility.

( function (  ) // An Immediately Invoked Function Expression (IIFE) to encapsulate scope.
{
    // Determines if a hypothetical framework, 'Foundation' (analogous to Backbone), is present.
    var isFrameworkAvailable = typeof ( Foundation ) !== 'undefined';
    var executionContext   = this; // Captures the global context (e.g., 'window' in browsers).
    var retrieveApiTools;           // Function responsible for fetching DSL (Domain Specific Language) utilities.
    var releaseApiTools;          // Function for releasing or cleaning up DSL utilities.

    if ( isFrameworkAvailable ) // Conditional block: if the framework is detected.
    {
        retrieveApiTools = function ( targetContainer, fullPath ) // Defines the function for framework-specific API tools.
        {
            // Inner function to define a data model using the framework's capabilities.
            var createDataModel = function ( modelIdentifier, modelPayload )
            {
                modelPayload['className'] = fullPath + '.' + modelIdentifier; // Sets a fully qualified class name.
                targetContainer[modelIdentifier] = Foundation.Model.extend(    // Extends the framework's Model class.
                    {
                        defaults: modelPayload // Sets default attributes for the model.
                    }
                );
            };

            // Inner function to define a user interface view using the framework.
            var createUiView = function ( viewIdentifier, viewDefinition )
            {
                targetContainer[viewIdentifier] = Foundation.View.extend( viewDefinition ); // Extends the framework's View class.
            };

            // Returns an array containing the two specialized creation functions.
            return [createDataModel, createUiView];
        };

        releaseApiTools = function ( ) // Defines the cleanup function (currently an empty operation).
        {
        };
    }
    else // Else block: if the framework is not detected.
    {
        retrieveApiTools = function ( targetContainer, fullPath ) // Provides a no-op version of the API tools retrieval.
        {
        };
        releaseApiTools = function ( ) // Provides a no-op version of the API tools release.
        {
        };
    }

    // Assigns the main module creation logic to the global `moduleCreator` variable.
    moduleCreator = function ( fullPath, exposedComponents )
    {
        var pathSegments = fullPath.split( '\.' ); // Splits the module path string into an array of segments.
        var currentPathFragment = '';             // An accumulating string for the current path being evaluated.

        // Iterates through each segment to ensure that every part of the module path exists as an object.
        for ( var segmentIdx = 0; segmentIdx < pathSegments.length; segmentIdx++ )
        {
            currentPathFragment += pathSegments[segmentIdx]; // Appends the current segment to the fragment.

            // Checks if the object represented by `currentPathFragment` does not exist in the global scope.
            if ( typeof ( eval( 'this.' + currentPathFragment ) ) === 'undefined' )
            {
                eval( currentPathFragment + '={}' ); // If it doesn't exist, create an empty object for it.
            }
            currentPathFragment += '.'; // Adds a dot separator for the next segment.
        }

        var targetContainer = eval( fullPath ); // Retrieves the final, innermost object for the module.
        var dslTools        = retrieveApiTools( targetContainer, fullPath ); // Fetches the relevant DSL tools.

        // If 'exposedComponents' is a function, execute it to get the actual components to be exposed.
        if ( typeof exposedComponents === 'function' )
        {
            exposedComponents = exposedComponents.apply( executionContext, dslTools ); // Invokes the function with the global context and DSL tools.
        }

        releaseApiTools( ); // Executes any post-processing or cleanup for the API tools.

        // Iterates over the collected 'exposedComponents' and attaches them to the `targetContainer`.
        for ( var componentName in exposedComponents )
        {
            targetContainer[componentName] = exposedComponents[componentName]; // Assigns each component.
        }
    };
} ) ( );