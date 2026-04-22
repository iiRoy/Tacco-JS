/*
 * easyPlug Framework - A JavaScript Plugin Utility
 *
 * This software is provided under the MIT License.
 *
 * Copyright (c) 2023 François "cahnory" Germain <cahnory@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * @author     François "cahnory" Germain <cahnory@gmail.com>
 * @license    http://www.opensource.org/licenses/mit-license.php MIT License
 */
( function( $ ) {

    'use strict'; /* Enforce strict mode for cleaner code */

    var
        // Internal reference for the plugin name
        easyPlug  =   'easyPlug',

        // This prefix is used for all easyPlug-managed plugins
        namespace =   easyPlug + '__';

    // The main easyPlug entry point: register a new jQuery plugin.
    // ====================================================================

    $[ easyPlug ] = function ( manifest ) {

        var
            Plugin, // The constructor for our new plugin
            name,   // The actual name of the plugin instance
            awake,  // Flag to ensure 'init' runs only once
            i;      // Loop counter

        // Ensure manifest is an object, even if not provided
        manifest = manifest || {};

        // Define the plugin's constructor function
        // ==========================================================

        Plugin = function ( element, settings ) {

            // Store a reference to the jQuery element and associate this instance
            this.element  =  $ ( element ) .data ( namespace + name, this );

            // Merge default settings with user-provided settings
            this.settings =  $ .extend ( {}, Plugin.presets, settings );

            // Call the 'init' method from the manifest, but only once for the first instance
            if  ( ! awake  &&  typeof manifest.init === 'function' ) {

                awake  =  true; // Mark as initialized
                manifest.init .call ( Plugin );
            }

            // Call the 'construct' method from the manifest for each new instance
            if  ( typeof manifest.construct === 'function' ) {

                manifest.construct .call ( this );
            }
        };

        // Determine the plugin's name, using a timestamp if not specified
        name  =  manifest.name || easyPlug + ( new Date() .getTime() );

        // STATIC METHODS for the Plugin
        // ----------------------------------------------------------

        // Utility function to add the plugin-specific prefix to strings (e.g., event names, data keys)
        Plugin .addPrefix = function ( generic ) {

            // Remove leading/trailing whitespace, then add the prefix to each part
            return generic .replace ( /^[\s]+|[\s]+$/g, '' ) .replace ( /([\s])+|^/g, '$1' + namespace + name + '-' );
        };

        // Utility function to add a namespace to events for binding/unbinding
        Plugin .addNamespace = function ( global, local ) {

            // Remove leading/trailing whitespace, then add the namespace
            return global .replace ( /^[\s]+|[\s]+$/g, '' ) .replace ( /([\s])+|$/g, '.' + namespace + name + ( ( local && '.' + local ) || '' ) + '$1' );
        };

        // Returns the name of the plugin
        Plugin .getName = function () {

            return name;
        };

        // STATIC ATTRIBUTES for the Plugin
        // ----------------------------------------------------------

        // Extend the plugin's static presets with those defined in the manifest
        Plugin.presets = $ .extend ( {}, manifest.presets );

        // Process and prefix custom events defined in the manifest
        if ( manifest.events ) {

            Plugin.events  =  {};
            for ( i = 0; i < manifest.events.length; i++ ) {

                // Store prefixed event name: 'easyPlug-pluginName-eventName'
                Plugin.events[ manifest.events[i] ] = Plugin.addPrefix ( manifest.events[i] );
            }
        }

        // Extend the plugin's prototype with methods from the manifest
        $ .extend ( Plugin.prototype, manifest.prototype );


        // INTEGRATE INTO JQUERY
        // ----------------------------------------------------------

        // Make the plugin constructor accessible directly via jQuery (e.g., $.MyPlugin)
        $[ name ] = Plugin;

        // Define the jQuery method for the plugin (e.g., $(selector).myPlugin())
        $ .fn [ name ] = function ( option ) {

            var
                result, // Stores the return value of a method call
                args    = Array.prototype.slice.call ( arguments, 1 ); // Arguments for method calls

            // Iterate over each selected element
            this .each ( function () {

                var
                    plugin,  // The plugin instance for the current element
                    element  = $ ( this ); // The current jQuery element

                // Retrieve existing plugin instance or create a new one
                plugin = element .data ( namespace + name ) || new Plugin ( element, option );

                // If no result yet, attempt to call a method
                // We keep looping to ensure all elements are instantiated
                if ( result === undefined ) {

                    // Call the specified method if it exists on the plugin instance
                    if ( typeof plugin[ option ] === 'function' ) {

                        result = plugin[ option ] .apply ( plugin, args );

                    // If 'option' is a string but not a direct method, try 'invoke'
                    } else if ( typeof manifest.invoke === 'function' && typeof option === 'string' ) {

                        result = manifest.invoke .call ( plugin, option, args );
                    }
                }
            } );

            // If a method returned a value, break the jQuery chain
            if ( result !== undefined ) {

                return result;
            }

            // Otherwise, maintain the jQuery chain for further operations
            return this;
        };

        // Return the plugin constructor for advanced usage (e.g., extending its prototype)
        return Plugin;
    };

    // Helper method: Check if an element has a specific easyPlug plugin attached
    $ [ easyPlug ] .isPluggedTo = function ( element, plugin ) {

        return element .data ( namespace + plugin ) instanceof $ [ plugin ];
    };

    // Helper method: Retrieve the instance of a specific easyPlug plugin from an element
    $ [ easyPlug ] .getInstance = function ( element, plugin ) {

        return element .data ( namespace + plugin );
    };

} ( jQuery ) ); // Immediately-invoked function expression with jQuery as argument