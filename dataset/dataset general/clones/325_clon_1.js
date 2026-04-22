/**
 *
 *  Eve.js <evejs.com> - v0.8.4 February 18, 2013
 *
 *  A JavaScript meta-framework for scoped event delegation.
 *
 *  Copyright (c) 2012 Michelle Steigerwalt, http://evejs.com/
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *
 */

// This self-executing anonymous function encapsulates the Eve.js library
// within its own scope, preventing global variable pollution.
( function ( ns ) {


  // Internal data structures for Eve.js.
  var _registry     = {}, // Stores registered modules by their name.
      _scopes       = {}, // Stores scoped event listeners.
      _attachments  = {}, // Keeps track of attached modules.
      _extensions   = {}, // Holds extensions that can be added to scopes.
      _debugging    = [], // List of modules currently being debugged.
      _debugAll     = false, // Flag to enable debugging for all modules.
      _framework,       // Stores the detected JavaScript framework (e.g., jQuery, Zepto).
      _dom;             // Reference to the DOM utility for the detected framework.


  // This function attempts to detect the current JavaScript framework in use.
  function detectFramework ( ) {

    // If a framework has already been detected, return it immediately.
    if ( _framework ) return _framework;

    // List of common JavaScript frameworks to check for.
    var fws = [ 'Zepto', 'jQuery', 'MooTools', 'YUI', 'Prototype', 'dojo' ];

    // Iterate through the list of frameworks.
    for ( var i = 0; i <= fws.length; i++ ) {

      // Check if the framework's global object exists in the window scope.
      if ( window[ fws[ i ] ] ) {

        // If found, set it as the active framework for Eve.js.
        Eve.setFramework( fws[ i ] );

        // Return the name of the detected framework.
        return fws[ i ];

      }
    }

    // If no supported framework is found, log an error to the console.
    console.error( "Eve doesn't support your JavaScript framework." );

  }


  // Determines if a specific framework is in use, or returns the currently detected framework.
  function using ( guess ) {

    // Get the current framework, detecting it if necessary.
    var fw = _framework || detectFramework( );

    // If a 'guess' is provided, check if the current framework matches the guess (case-insensitive).
    // Otherwise, return the name of the current framework.
    return ( guess ) ? ( _framework == guess.toLowerCase( ) ) : _framework;

  }


  // Provides a debugging utility that logs messages to the console based on module name or global debug setting.
  function dbug ( name, message ) {

    // If the browser does not support console, exit early.
    if ( !window.console ) {

      return;

    }

    var debug = _debugAll; // Initialize debug flag with global setting.

    // If not debugging all modules, check if the specific module is in the debugging list.
    if ( !_debugAll ) {

      debug = false; // Reset debug flag for specific checks.

      // Iterate through the list of modules explicitly enabled for debugging.
      for ( var i = 0; i < _debugging.length; i++ ) {

        // If the current module name matches, enable debugging for it.
        if ( _debugging[ i ] == name ) debug = true;

      }
    }

    // If debugging is not enabled for this module or globally, exit.
    if ( !debug ) {

      return;

    }

    // Pad the module name with spaces to a fixed length for consistent log formatting.
    while ( name.length < 10 ) {

      name = name + ' ';

    }

    // Truncate the name to ensure it's not too long, then append a separator.
    name = name.substring( 0, 10 ) + " - ";

    // Log the formatted message to the console.
    console.info( name, message );

  }


  // Binds a function to a specific scope, applying extensions and framework-specific initializations.
  function bindToScope ( fun, obj, reg, name ) {

    // Copy properties from the global Scope object to the new object.
    for ( var k in Scope ) obj[ k ] = Scope[ k ];

    // Apply any registered extensions to the object.
    for ( k in _extensions ) obj[ k ] = _extensions[ k ];


    // Handle framework-specific initialization for YUI.
    if ( using( "YUI" ) ) {

      // Use YUI's 'node' module for DOM manipulation.
      YUI( ).use( 'node', function ( Y ) {

        _dom  = Y.one; // Assign YUI's 'one' method for DOM selection.

        reg[ name ] = fun.apply( obj ); // Execute the function within the new object's context.

      } );

    }
    // Handle framework-specific initialization for Dojo.
    else if ( using( "dojo" ) ) {

      // Require Dojo's DOM and traversal modules.
      require( [ "dojo/NodeList-dom", "dojo/NodeList-traverse" ], function ( dom ) {

        _dom  = dom; // Assign Dojo's DOM utility.

        reg[ name ] = fun.apply( obj ); // Execute the function within the new object's context.

      } );

    }
    // For other frameworks or no specific framework setup needed.
    else {

      reg[ name ] = fun.apply( obj ); // Execute the function directly.

    }

  }


  // The main Eve API object, exposed via the namespace 'ns'.
  ns.Eve = {

    // Sets the JavaScript framework that Eve.js should use.
    setFramework: function ( fw ) {

      _framework = ( fw + "" ).toLowerCase( ); // Normalize framework name to lowercase.

      // Handle jQuery compatibility for no-conflict mode.
      if ( _framework == 'jquery' ) $ = jQuery;

      // Handle Zepto compatibility for no-conflict mode.
      if ( _framework == 'zepto' ) $ = Zepto;

    },

    // Enables debugging for specific modules or all modules.
    debug: function ( moduleName ) {

      // If a module name is provided, add it to the debugging list.
      if ( moduleName ) {

        _debugging.push( moduleName );

      }
      // Otherwise, enable debugging for all modules.
      else {

        _debugAll = true;

      }

    },

    // Registers a new module with Eve.js.
    register: function ( name, obj ) {

      dbug( name, "registered" ); // Log the registration event.

      // Check if a module with the same name already exists.
      if ( _registry[ name ] ) {

        throw new Error( "Module already exists: " + name ); // Prevent duplicate registrations.

      }

      _registry[ name ] = obj; // Store the module object.

      return this; // Allow for method chaining.

    },

    // Extends all future scopes with a new key-value pair (function).
    extend: function ( key, fun ) {

      _extensions[ key ] = fun; // Add the extension to the internal extensions object.

    },

    // Creates a new scope for event delegation.
    scope: function ( ns, fun ) {

      // Warn if a namespace is being duplicated.
      if ( _scopes[ ns ] ) {

        console.warn( "Duplicate namespace: " + ns );

      }

      // Bind the provided function to the new scope object.
      bindToScope( fun, {

        name: ns, // The name of the scope.
        namespace: ns // The namespace for the scope.

      }, _scopes, ns );

    },

    // Attaches a registered module to a specific namespace for event delegation.
    attach: function ( moduleName, namespace ) {

      var fun, args = [], i = 0;

      // Collect all arguments passed to the attach function.
      for ( i; i < arguments.length; i++ ) args[ args.length ] = arguments[ i ];

      // Create a wrapper function that applies the module's logic.
      fun = function ( ) { _registry[ moduleName ].apply( this, args.slice( 2 ) ); }

      dbug( moduleName, "attached to " + namespace ); // Log the attachment event.

      // Prevent re-attaching the same module to the same namespace.
      if ( _attachments[ moduleName + namespace ] ) {

        return false;

      }

      // Check if the module to be attached actually exists.
      if ( !_registry[ moduleName ] ) {

        console.warn( "Module not found: " + moduleName ); // Warn if module is not found.

        return false;

      }

      // Bind the module's function to a new scope for attachment.
      var mod = bindToScope( fun, {

        namespace: namespace, // The namespace for this attachment.
        name: moduleName      // The name of the module being attached.

      }, _attachments, moduleName + namespace );

      return true; // Indicate successful attachment.

    }

  };


  // The base Scope object, providing common methods for event listening and DOM manipulation within a scope.
  var Scope = {

    // Listens for an event on a specified selector within the scope.
    listen: function ( selector, event, handler ) {

      // Handle optional 'selector' parameter by re-assigning arguments.
      if ( !handler ) {

        handler = event;      // The second argument is the handler.
        event = selector;     // The first argument is the event.
        selector = '';        // No selector was provided.

      }

      selector = selector || ''; // Ensure selector is an empty string if null/undefined.

      // Determine the DOM scope for event delegation.
      // If an event is currently active, scope to its target; otherwise, use the document body.
      var scope = ( this.event ) ? this.find( ) : document.body;

      var name = this.name, // The name of the current scope.
          sel  = ( this.namespace + ' ' + selector ).trim( ), // Combined namespace and selector.
          obj  = { }; // An object to hold a copy of the current scope's properties.

      // Copy properties from 'this' to 'obj' to create a distinct context for the handler.
      for ( var k in this ) if ( this.hasOwnProperty( k ) ) obj[ k ] = this[ k ];

      // The actual event handler function.
      function fun ( e, t ) {

        dbug( name, sel + ':' + event ); // Log the event being handled.

        obj.event = e; // Attach the event object to the handler's context.

        // Adjust event target for MooTools.
        if ( using( "MooTools" ) ) { e.target = t; }

        // Adjust event target for jQuery/Zepto.
        if ( using( "jQuery" ) || using( "Zepto" ) ) { e.target = e.currentTarget; }

        // Adjust event target for Dojo.
        if ( using( "dojo" ) ) { e.target = e.explicitOriginalTarget; }

        // Call the original handler with the adjusted context and arguments.
        handler.apply( obj, arguments );

      }

      // Delegate events using the detected JavaScript framework's methods.
      if ( using( "jQuery" ) || using( "Zepto" ) ) {

        $( scope ).delegate( sel, event, fun );

      }
      else if ( using( 'MooTools' ) ) {

        // MooTools uses a specific 'relay' syntax for event delegation.
        $( scope ).addEvent( event + ':relay(' + sel + ')', fun );

      }
      else if ( using( "YUI" ) ) {

        _dom( scope ).delegate( event, fun, sel );

      }
      else if ( using( "Prototype" ) ) {

        $( scope ).on( event, sel, fun );

      }
      else if ( using( "dojo" ) ) {

        // Dojo requires an 'on' module for event handling.
        require( [ "dojo/on" ], function ( on ) {

          on( scope, sel + ':' + event, fun );

        } );

      }

    },

    // Finds DOM elements within the current scope or based on an event target.
    find: function ( sel ) {

      var scope,
          ns = this.namespace; // Get the current namespace.

      // If 'sel' is not provided or is a string, normalize it.
      if ( !sel || typeof( sel ) == 'string' ) { sel = ( sel || '' ).trim( ); }

      // Determine the starting point for DOM traversal.
      // If an event is active, start from its target; otherwise, from the document body.
      var t = ( this.event ) ? this.event.target : document.body;

      // Wrap the target element with framework-specific DOM utility.
      if ( using( 'jQuery' ) ) t = jQuery( t );
      if ( using( 'Zepto' ) ) t = Zepto( t );
      if ( _dom ) t = _dom( t );

      // Mapping of framework-specific DOM methods.
      var map = {
        jQuery:    [ 'is', 'parents', 'find' ],
        Zepto:     [ 'is', 'parents', 'find' ],
        MooTools:  [ 'match', 'getParent', 'getElements' ],
        Prototype: [ 'match', 'up', 'select' ],
        YUI:       [ 'test', 'ancestor', 'all' ],
        dojo:      [ '', 'closest', 'query' ]
      };

      // Iterate through framework mappings to find the active framework.
      for ( var fw in map ) {

        if ( !using( fw ) ) continue; // Skip if this framework is not in use.

        var m     = map[ fw ],
            match = m[ 0 ], // Method to check if an element matches a selector.
            up    = m[ 1 ], // Method to get an ancestor element.
            all   = m[ 2 ]; // Method to find all matching descendant elements.

        // For non-Dojo frameworks, check if the target itself matches the namespace.
        if ( !using( 'dojo' ) && t[ match ]( ns ) ) return t;

        // Determine the scope for the search: ancestor if an event is active, otherwise the initial target.
        scope = ( this.event ) ? t[ up ]( ns ) : t;

        // Return the found elements, adjusting the selector based on whether an event is active.
        return ( this.event ) ? scope[ all ]( sel ) : scope[ all ]( ns + ' ' + sel );

      }

    },

    // Retrieves the first element found by the 'find' method.
    first: function ( sel, result ) {

      // If 'result' is not provided, call 'find' to get the elements.
      result = ( arguments.length == 2 ) ? result : this.find( sel );

      // For YUI, convert NodeList to raw DOM nodes.
      if ( using( 'YUI' ) ) result = result.getDOMNodes( );

      return result[ 0 ]; // Return the very first element.

    },

    // Creates a nested scope within the current scope's namespace.
    scope: function ( ns, fun ) {

      // Delegate to the main Eve.scope method, prepending the current namespace.
      Eve.scope( this.namespace + ' ' + ns, fun );

    },

    // Attaches a module to a nested namespace within the current scope.
    attach: function ( moduleName, ns ) {

      // Delegate to the main Eve.attach method, prepending the current namespace.
      Eve.attach( moduleName, this.namespace + ' ' + ( ns || '' ) );

    }

  };


} )( this ); // Pass 'this' (window in browser, global in Node.js) as the namespace.


// Export Eve.js for Node.js environments if module.exports is available.
if ( this.module && this.module.exports ) {

  this.module.exports = this.Eve;

}