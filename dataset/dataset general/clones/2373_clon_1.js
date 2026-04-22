/*
 *  ***** BEGIN LICENSE BLOCK *****
 *
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 *   The contents of this file are subject to the Mozilla Public License Version
 *   1.1 (the "License"); you may not use this file except in compliance with
 *   the License. You may obtain a copy of the License at
 *   http://www.mozilla.org/MPL/
 *
 *   Software distributed under the License is distributed on an "AS IS" basis,
 *   WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 *   for the specific language governing rights and limitations under the
 *   License.
 *
 *   The Original Code is Ajax.org Code Editor (ACE).
 *
 *   The Initial Developer of the Original Code is
 *   Ajax.org B.V.
 *
 *   Portions created by the Initial Developer are Copyright (C) 2010
 *   the Initial Developer. All Rights Reserved.
 *
 *   Contributor(s):
 *        Fabian Jakobs <fabian AT ajax DOT org>
 *
 *   Alternatively, the contents of this file may be used under the terms of
 *   either the GNU General Public License Version 2 or later (the "GPL"), or
 *   the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 *   in which case the provisions of the GPL or the LGPL are applicable instead
 *   of those above. If you wish to allow use of your version of this file only
 *   under the terms of either the GPL or the LGPL, and not to allow others to
 *   use your version of this file under the terms of the MPL, indicate your
 *   decision by deleting the provisions above and replace them with the notice
 *   and other provisions required by the GPL or the LGPL. If you do not delete
 *   the provisions above, a recipient may use your version of this file under
 *   the terms of any one of the MPL, the GPL or the LGPL.
 *
 *  ***** END LICENSE BLOCK *****
 */

// This is a JSDoc-style comment block for module definition.
// It describes how to define a module with a payload function.
/**
 * Define a module along with a payload
 * @param module A unique name for the payload
 * @param payload A function to call with (require, exports, module) parameters
 */

( function() {

  var ACE_NAMESPACE = ""; // Default namespace for Ace

  var global = ( function() {
    return this; // Get the global object (window in browsers, global in Node.js)
  } )();

  // Internal define function for modules
  var _define = function( module, deps, payload ) {
    if ( typeof module !== 'string' ) {
      // Handle cases where module name is not a string
      if ( _define.original )
        _define.original.apply( window, arguments );
      else {
        console.error( 'dropping module because define wasn\'t a string.' );
        console.trace();
      }
      return;
    }

    // Adjust arguments if dependencies are omitted
    if ( arguments.length == 2 )
      payload = deps;

    // Initialize modules store if it doesn't exist
    if ( ! _define.modules )
      _define.modules = {};

    // Store the module's payload
    _define.modules[ module ] = payload;
  };

  // Internal require function for modules
  var _require = function( parentId, module, callback ) {
    if ( Object.prototype.toString.call( module ) === "[object Array]" ) {
      var params = [];
      for ( var i = 0, l = module.length; i < l; ++i ) {
        var dep = lookup( parentId, module[ i ] );
        if ( ! dep && _require.original )
          return _require.original.apply( window, arguments );
        params.push( dep );
      }
      if ( callback ) {
        callback.apply( null, params );
      }
    } else if ( typeof module === 'string' ) {
      var payload = lookup( parentId, module );
      if ( ! payload && _require.original )
        return _require.original.apply( window, arguments );

      if ( callback ) {
        callback();
      }

      return payload;
    } else {
      // If module is neither string nor array, use original require if available
      if ( _require.original )
        return _require.original.apply( window, arguments );
    }
  };

  // Helper to normalize module paths
  var normalizeModule = function( parentId, moduleName ) {
    // Normalize plugin requires (e.g., "text!./template.html")
    if ( moduleName.indexOf( "!" ) !== -1 ) {
      var chunks = moduleName.split( "!" );
      return normalizeModule( parentId, chunks[ 0 ] ) + "!" + normalizeModule( parentId, chunks[ 1 ] );
    }

    // Normalize relative requires (e.g., "./foo" or "../bar")
    if ( moduleName.charAt( 0 ) == "." ) {
      var base = parentId.split( "/" ).slice( 0, -1 ).join( "/" );
      moduleName = base + "/" + moduleName;

      // Resolve '.' and '..' segments in the path
      while ( moduleName.indexOf( "." ) !== -1 && previous != moduleName ) {
        var previous = moduleName;
        moduleName = moduleName.replace( /\/\.\//, "/" ).replace( /[^\/]+\/\.\.\//, "" );
      }
    }

    return moduleName;
  };

  // Lookup and execute a module
  var lookup = function( parentId, moduleName ) {

    moduleName = normalizeModule( parentId, moduleName );

    var module = _define.modules[ moduleName ];
    if ( ! module ) {
      return null; // Module not found
    }

    if ( typeof module === 'function' ) {
      var exports = {};
      var mod = {
        id: moduleName,
        uri: '',
        exports: exports,
        packaged: true
      };

      var req = function( module, callback ) {
        return _require( moduleName, module, callback );
      };

      // Execute the module's payload function
      var returnValue = module( req, exports, mod );
      exports = returnValue || mod.exports;

      // Cache the resulting module object for next time
      _define.modules[ moduleName ] = exports;
      return exports;
    }

    return module; // Return the cached module object if not a function
  };

  // Export Ace's define/require to the global scope or a namespace
  function exportAce( ns ) {

    if ( typeof requirejs !== "undefined" ) {
      // Handle cases where requirejs is already present
      var define = global.define;
      global.define = function( id, deps, callback ) {
        if ( typeof callback !== "function" )
          return define.apply( this, arguments );

        return define( id, deps, function( require, exports, module ) {
          if ( deps[ 2 ] == "module" )
            module.packaged = true;
          return callback.apply( this, arguments );
        } );
      };
      global.define.packaged = true;

      return;
    }

    var require = function( module, callback ) {
      return _require( "", module, callback );
    };
    require.packaged = true;

    var root = global;
    if ( ns ) {
      if ( ! global[ ns ] )
        global[ ns ] = {};
      root = global[ ns ];
    }

    if ( root.define )
      _define.original = root.define;

    root.define = _define;

    if ( root.require )
      _require.original = root.require;

    root.require = require;
  }

  exportAce( ACE_NAMESPACE );

} )();

/**
 * class Ace
 *
 * The main class required to set up an Ace instance in the browser.
 *
 *
 **/

define( 'ace/ace', [ 'require', 'exports', 'module', 'ace/lib/fixoldbrowsers', 'ace/lib/dom', 'ace/lib/event', 'ace/editor', 'ace/edit_session', 'ace/undomanager', 'ace/virtual_renderer', 'ace/multi_select', 'ace/worker/worker_client', 'ace/keyboard/hash_handler', 'ace/keyboard/state_handler', 'ace/placeholder', 'ace/config', 'ace/theme/textmate' ], function( require, exports, module ) {

  require( "./lib/fixoldbrowsers" );

  var Dom = require( "./lib/dom" );
  var Event = require( "./lib/event" );

  var Editor = require( "./editor" ).Editor;
  var EditSession = require( "./edit_session" ).EditSession;
  var UndoManager = require( "./undomanager" ).UndoManager;
  var Renderer = require( "./virtual_renderer" ).VirtualRenderer;
  var MultiSelect = require( "./multi_select" ).MultiSelect;

  // The following require()s are for inclusion in the built ace file
  require( "./worker/worker_client" );
  require( "./keyboard/hash_handler" );
  require( "./keyboard/state_handler" );
  require( "./placeholder" );

  exports.config = require( "./config" );

  exports.edit = function( el ) {
    if ( typeof( el ) == "string" ) {
      el = document.getElementById( el );
    }

    if ( el.env && el.env.editor instanceof Editor )
      return el.env.editor;

    var doc = new EditSession( Dom.getInnerText( el ) );
    doc.setUndoManager( new UndoManager() );
    el.innerHTML = '';

    var editor = new Editor( new Renderer( el, require( "./theme/textmate" ) ) );
    new MultiSelect( editor );
    editor.setSession( doc );

    var env = {};
    env.document = doc;
    env.editor = editor;
    editor.resize();
    Event.addListener( window, "resize", function() {
      editor.resize();
    } );
    el.env = env;
    // Store env on editor such that it can be accessed later on from
    // the returned object.
    editor.env = env;
    return editor;
  };

} );

// vim:set ts=4 sts=4 sw=4 st:
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson Copyright (C) 2009-2010 MIT License (Narwhal Project)
// -- dantman Daniel Friesen Copyright(C) 2010 XXX No License Specified
// -- fschaefer Florian Schäfer Copyright (C) 2010 MIT License
// -- Irakli Gozalishvili Copyright (C) 2010 MIT License

/*
 *  ! Copyright (c) 2009, 280 North Inc. http://280north.com/
 *  MIT License. http://github.com/280north/narwhal/blob/master/README.md
 */

define( 'ace/lib/fixoldbrowsers', [ 'require', 'exports', 'module', 'ace/lib/regexp', 'ace/lib/es5-shim' ], function( require, exports, module ) {

  require( "./regexp" );
  require( "./es5-shim" );

} );

define( 'ace/lib/regexp', [ 'require', 'exports', 'module' ], function( require, exports, module ) {

  //---------------------------------
  // Private variables for RegExp shim
  //---------------------------------

  var real = {
    exec: RegExp.prototype.exec,
    test: RegExp.prototype.test,
    match: String.prototype.match,
    replace: String.prototype.replace,
    split: String.prototype.split
  },
    // Check `exec` handling of nonparticipating capturing groups.
    // Some browsers return empty string instead of undefined.
    compliantExecNpcg = real.exec.call( /()??/, "" )[ 1 ] === undefined,
    // Check if `lastIndex` is incremented after zero-length matches.
    compliantLastIndexIncrement = ( function() {
      var x = /^/g;
      real.test.call( x, "" );
      return ! x.lastIndex;
    } )();

  // If both are compliant, no need for shims
  if ( compliantLastIndexIncrement && compliantExecNpcg )
    return;

  //---------------------------------
  // Overridden native methods for RegExp
  //---------------------------------

  // Adds named capture support (with backreferences returned as `result.name`), and fixes two
  // cross-browser issues per ES3:
  // - Captured values for nonparticipating capturing groups should be returned as `undefined`,
  //   rather than the empty string.
  // - `lastIndex` should not be incremented after zero-length matches.
  RegExp.prototype.exec = function( str ) {
    var match = real.exec.apply( this, arguments ),
      name, r2;
    if ( typeof( str ) == 'string' && match ) {
      // Fix browsers whose `exec` methods don't consistently return `undefined` for
      // nonparticipating capturing groups
      if ( ! compliantExecNpcg && match.length > 1 && indexOf( match, "" ) > -1 ) {
        r2 = RegExp( this.source, real.replace.call( getNativeFlags( this ), "g", "" ) );
        // Using `str.slice(match.index)` rather than `match[0]` in case lookahead allowed
        // matching due to characters outside the match
        real.replace.call( str.slice( match.index ), r2, function() {
          for ( var i = 1; i < arguments.length - 2; i++ ) {
            if ( arguments[ i ] === undefined )
              match[ i ] = undefined;
          }
        } );
      }
      // Attach named capture properties, if available
      if ( this._xregexp && this._xregexp.captureNames ) {
        for ( var i = 1; i < match.length; i++ ) {
          name = this._xregexp.captureNames[ i - 1 ];
          if ( name )
            match[ name ] = match[ i ];
        }
      }
      // Fix browsers that increment `lastIndex` after zero-length matches
      if ( ! compliantLastIndexIncrement && this.global && ! match[ 0 ].length && ( this.lastIndex > match.index ) )
        this.lastIndex--;
    }
    return match;
  };

  // Don't override `test` if it won't change anything, i.e., if lastIndex behavior is compliant
  if ( ! compliantLastIndexIncrement ) {
    // Fix browser bug in native method for `test`
    RegExp.prototype.test = function( str ) {
      // Use the native `exec` to skip some processing overhead, even though the overriden
      // `exec` would take care of the `lastIndex` fix
      var match = real.exec.call( this, str );
      // Fix browsers that increment `lastIndex` after zero-length matches
      if ( match && this.global && ! match[ 0 ].length && ( this.lastIndex > match.index ) )
        this.lastIndex--;
      return !! match;
    };
  }

  //---------------------------------
  // Private helper functions for RegExp shim
  //---------------------------------

  function getNativeFlags( regex ) {
    return ( regex.global ? "g" : "" ) +
      ( regex.ignoreCase ? "i" : "" ) +
      ( regex.multiline ? "m" : "" ) +
      ( regex.extended ? "x" ) + // Proposed for ES4; included in AS3
      ( regex.sticky ? "y" : "" ); // ES6 sticky flag
  };

  function indexOf( array, item, from ) {
    if ( Array.prototype.indexOf ) // Use the native array method if available
      return array.indexOf( item, from );
    for ( var i = from || 0; i < array.length; i++ ) {
      if ( array[ i ] === item )
        return i;
    }
    return -1;
  };

} );

// vim: ts=4 sts=4 sw=4 expandtab
// -- kriskowal Kris Kowal Copyright (C) 2009-2011 MIT License
// -- tlrobinson Tom Robinson Copyright (C) 2009-2010 MIT License (Narwhal Project)
// -- dantman Daniel Friesen Copyright (C) 2010 XXX TODO License or CLA
// -- fschaefer Florian Schäfer Copyright (C) 2010 MIT License
// -- Gozala Irakli Gozalishvili Copyright (C) 2010 MIT License
// -- kitcambridge Kit Cambridge Copyright (C) 2011 MIT License
// -- kossnocorp Sasha Koss XXX TODO License or CLA
// -- bryanforbes Bryan Forbes XXX TODO License or CLA
// -- killdream Quildreen Motta Copyright (C) 2011 MIT Licence
// -- michaelficarra Michael Ficarra Copyright (C) 2011 3-clause BSD License
// -- sharkbrainguy Gerard Paapu Copyright (C) 2011 MIT License
// -- bbqsrc Brendan Molloy (C) 2011 Creative Commons Zero (public domain)
// -- iwyg XXX TODO License or CLA
// -- DomenicDenicola Domenic Denicola Copyright (C) 2011 MIT License
// -- xavierm02 Montillet Xavier XXX TODO License or CLA
// -- Raynos Raynos XXX TODO License or CLA
// -- samsonjs Sami Samhuri Copyright (C) 2010 MIT License
// -- rwldrn Rick Waldron Copyright (C) 2011 MIT License
// -- lexer Alexey Zakharov XXX TODO License or CLA

/*
 *  ! Copyright (c) 2009, 280 North Inc. http://280north.com/
 *  MIT License. http://github.com/280north/narwhal/blob/master/README.md
 */

define( 'ace/lib/es5-shim', [ 'require', 'exports', 'module' ], function( require, exports, module ) {

  /*
   * Brings an environment as close to ECMAScript 5 compliance
   * as is possible with the facilities of erstwhile engines.
   *
   * Annotated ES5: http://es5.github.com/ (specific links below)
   * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
   *
   * @module
   */

  /*whatsupdoc*/

  //
  // Function
  // ========
  //

  // ES-5 15.3.4.5
  // http://es5.github.com/#x15.3.4.5

  if ( ! Function.prototype.bind ) {
    Function.prototype.bind = function bind( that ) { // .length is 1
      // 1. Let Target be the this value.
      var target = this;
      // 2. If IsCallable(Target) is false, throw a TypeError exception.
      if ( typeof target != "function" )
        throw new TypeError(); // TODO: Add a more specific message

      // 3. Let A be a new (possibly empty) internal list of all of the
      //   argument values provided after thisArg (arg1, arg2 etc), in order.
      // XXX slicedArgs will stand in for "A" if used
      var args = slice.call( arguments, 1 ); // for normal call

      // 4. Let F be a new native ECMAScript object.
      // 11. Set the [[Prototype]] internal property of F to the standard
      //   built-in Function prototype object as specified in 15.3.3.1.
      // 12. Set the [[Call]] internal property of F as described in
      //   15.3.4.5.1.
      // 13. Set the [[Construct]] internal property of F as described in
      //   15.3.4.5.2.
      // 14. Set the [[HasInstance]] internal property of F as described in
      //   15.3.4.5.3.
      var bound = function() {

        if ( this instanceof bound ) {
          // 15.3.4.5.2 [[Construct]]
          // When the [[Construct]] internal method of a function object,
          // F that was created using the bind function is called with a
          // list of arguments ExtraArgs, the following steps are taken:
          // 1. Let target be the value of F's [[TargetFunction]]
          //   internal property.
          // 2. If target has no [[Construct]] internal method, a
          //   TypeError exception is thrown.
          // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
          //   property.
          // 4. Let args be a new list containing the same values as the
          //   list boundArgs in the same order followed by the same
          //   values as the list ExtraArgs in the same order.
          // 5. Return the result of calling the [[Construct]] internal
          //   method of target providing args as the arguments.

          var F = function() {};
          F.prototype = target.prototype;
          var self = new F;

          var result = target.apply(
            self,
            args.concat( slice.call( arguments ) )
          );
          if ( result !== null && Object( result ) === result )
            return result;
          return self;

        } else {
          // 15.3.4.5.1 [[Call]]
          // When the [[Call]] internal method of a function object, F,
          // which was created using the bind function is called with a
          // this value and a list of arguments ExtraArgs, the following
          // steps are taken:
          // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
          //   property.
          // 2. Let boundThis be the value of F's [[BoundThis]] internal
          //   property.
          // 3. Let target be the value of F's [[TargetFunction]] internal
          //   property.
          // 4. Let args be a new list containing the same values as the
          //   list boundArgs in the same order followed by the same
          //   values as the list ExtraArgs in the same order.
          // 5. Return the result of calling the [[Call]] internal method
          //   of target providing boundThis as the this value and
          //   providing args as the arguments.

          // equiv: target.call(this, ...boundArgs, ...args)
          return target.apply(