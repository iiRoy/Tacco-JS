/*
 * jQuery Late Loader - A module for dynamically loading JavaScript and CSS files.
 *
 * Copyright (c) 2009 Erik Zaadi. All rights reserved.
 *
 * This plugin's official home page: http://plugins.jquery.com/project/TODO!
 * Detailed documentation (wiki): http://wiki.github.com/erikzaadi/jQueryPlugins/jquerylateloader
 *
 * Dual licensed under the MIT and GPL licenses.
 * You may use this code under the terms of either license:
 *   - MIT License: http://www.opensource.org/licenses/mit-license.php
 *   - GPL License: http://www.gnu.org/licenses/gpl.html
 */
;
( function ( $ ) {

  // The main plugin object, attached to jQuery's namespace.
  $.LateLoader = {
    // Public method to load a script or CSS file.
    LoadScriptOrCSS: _LoadScriptOrCSS,
    /*
     * Loads a javascript or CSS file from the specified URL.
     * It checks if the file was previously loaded to avoid duplicates.
     *
     * The `OptionsOrURL` parameter can be:
     *   - A string representing the URL (default options will be used).
     *   - An object containing specific options (see `Defaults` below for available properties).
     *
     * Example usage:
     *   $.LateLoader.LoadScriptOrCSS("path/to/my_script.js");
     *   $.LateLoader.LoadScriptOrCSS({ URL: "path/to/my_styles.css", Type: "css" });
     */

    // Public method to check if a script or CSS file has been loaded.
    IsScriptOrCSSLoaded: _IsScriptOrCSSLoaded,
    /*
     * Determines whether a specific javascript or CSS file has already been loaded
     * through `LoadScriptOrCSS`.
     *
     * Parameters:
     *   - `URL`: The relative or absolute URL of the script/CSS file.
     *   - `Type`: A string, either 'js' for JavaScript or 'css' for CSS. Defaults to 'js'.
     *
     * Returns:
     *   `true` if the file is loaded, `false` otherwise.
     */

    // Public method to retrieve all loaded scripts and CSS files.
    GetLoadedScriptOrCSSs: _GetScriptOrCSSArray,
    /*
     * Retrieves a comprehensive list of all JavaScript and CSS files
     * that have been successfully loaded by the LateLoader plugin.
     *
     * Returns:
     *   An object containing two arrays: `css` and `js`, each listing the URLs.
     */

    // Public method to retrieve loaded scripts or CSS files by type.
    GetLoadedScriptOrCSSsByType: _GetScriptOrCSSArrayByType,
    /*
     * Fetches a list of loaded files, filtered by their type.
     *
     * Parameter:
     *   - `Type`: A string, either 'js' for JavaScript or 'css' for CSS.
     *
     * Returns:
     *   An array of URLs for the specified type, or `false` if none are found.
     */

    // Default configuration for the plugin's internal workings.
    PluginDefaults: {
      ArrayDataKey: "LateLoaderDataKey", // Unique key to store loaded file data in jQuery's data collection.
      ElementToAttachDataTo: "body",    // The DOM element where the data collection is attached (e.g., 'body' or 'html').
      RemoteTimeout: 1500               // Timeout in milliseconds for remote script loading checks.
    },

    // Default options for individual `LoadScriptOrCSS` calls.
    Defaults: {
      URL: null,                        // Placeholder for the URL, filled by `LoadScriptOrCSS` parameter.
      Type: 'js',                       // Default type is JavaScript. Can be 'js' or 'css'.
      LoadedCallBackFunction: null,     // Function to call upon successful loading. Takes the URL as an argument.
      ErrorCallBackFunction: null       // Function to call if an error occurs during loading. Takes an error message.
    }
  }; // End of $.LateLoader object definition.

  // --- Public method implementations ---

  /**
   * Loads a script or CSS file based on the provided options or URL.
   *
   * @param {string|object} OptionsOrURL - URL string or options object.
   */
  function _LoadScriptOrCSS( OptionsOrURL ) {
    var options;

    // Determine if the input is a URL string or an options object.
    if ( typeof ( OptionsOrURL ) == 'string' ) {
      options = $.extend( {}, $.LateLoader.Defaults, { URL: OptionsOrURL } );
    } else {
      options = $.extend( {}, $.LateLoader.Defaults, OptionsOrURL );
    }

    // Check if the script/CSS is already loaded. If so, call success callback and exit.
    if ( _IsScriptOrCSSLoaded( options.URL, options.Type ) ) {
      _CallFunctionIfAvailable( options.LoadedCallBackFunction, options.URL );
      return;
    }

    // Handle JavaScript file loading.
    if ( options.Type == 'js' ) {
      // If it's a remote script, set a timeout to check for potential loading failures.
      if ( _URLIsRemote( options.URL ) ) {
        setTimeout( function () {
          // If after the timeout, the script is still not marked as loaded, trigger an error.
          if ( ! _IsScriptOrCSSLoaded( options.URL, options.Type ) ) {
            _Error( options );
          }
        }, $.LateLoader.PluginDefaults.RemoteTimeout );
      }

      // Use jQuery's AJAX function to load the script.
      $.ajax( {
        dataType: 'script',
        url: options.URL,
        success: function () {
          _Success( options ); // Call success handler on completion.
        },
        error: function () {
          _Error( options );   // Call error handler if AJAX fails.
        },
        data: {}             // Empty data object, as scripts usually don't need POST data.
      } );
    }
    // Handle CSS file loading.
    else {
      _AddCSSFile( options ); // Delegate to a separate function for CSS.
    }
  }

  /**
   * Checks if a given script or CSS file has been loaded.
   *
   * @param {string} URL - The URL of the file.
   * @param {string} Type - The type of file ('js' or 'css').
   * @returns {boolean} - True if loaded, false otherwise.
   */
  function _IsScriptOrCSSLoaded( URL, Type ) {
    var ScriptOrCSSArray = _GetScriptOrCSSArray() || {};
    // Check if the type exists in the array and if the URL is present within that type's list.
    return ( ScriptOrCSSArray[ Type ] && ( $.inArray( URL, ScriptOrCSSArray[ Type ] ) != -1 ) ) ? true : false;
  }

  /**
   * Retrieves the stored array of all loaded scripts and CSS files.
   *
   * @returns {object|boolean} - An object containing 'js' and 'css' arrays, or false if no data.
   */
  function _GetScriptOrCSSArray() {
    // Get the data stored on the specified DOM element using the plugin's data key.
    var ScriptOrCSSData = $( $.LateLoader.PluginDefaults.ElementToAttachDataTo ).data( $.LateLoader.PluginDefaults.ArrayDataKey );
    // Extract the 'ScriptOrCSSs' property from the data.
    var ScriptOrCSSArray = ScriptOrCSSData && ScriptOrCSSData[ 'ScriptOrCSSs' ] ? ScriptOrCSSData.ScriptOrCSSs : false;

    if ( ! ScriptOrCSSArray ) {
      return false;
    } else {
      return ScriptOrCSSArray;
    }
  }

  /**
   * Retrieves a filtered list of loaded scripts or CSS files by type.
   *
   * @param {string} Type - The type of file ('js' or 'css').
   * @returns {Array|boolean} - An array of URLs for the specified type, or false if none.
   */
  function _GetScriptOrCSSArrayByType( Type ) {
    var ScriptOrCSSArray = _GetScriptOrCSSArray() || false;

    if ( ! ScriptOrCSSArray ) {
      return false; // No overall loaded data.
    }
    if ( ! ScriptOrCSSArray[ Type ] ) {
      return false; // No loaded files of this specific type.
    }

    return ScriptOrCSSArray[ Type ];
  }

  // --- Private helper functions ---

  /**
   * Handles an error condition during loading.
   * Invokes the error callback function if available.
   *
   * @param {object} options - The options object associated with the load request.
   */
  function _Error( options ) {
    _CallFunctionIfAvailable( options.ErrorCallBackFunction, 'error loading ' + options.Type + ' - ' + options.URL );
  }

  /**
   * Handles a successful loading condition.
   * Adds the loaded file to the internal tracking array and invokes the success callback.
   *
   * @param {object} options - The options object associated with the load request.
   */
  function _Success( options ) {
    _AddLoadedScriptOrCSSToArray( options );
    _CallFunctionIfAvailable( options.LoadedCallBackFunction, options.URL );
  }

  /**
   * Validates if a dynamically added CSS file has been successfully loaded.
   * This function attempts to check the `readyState` for IE, or relies on a placeholder for others.
   *
   * @param {object} options - The options for the CSS file.
   */
  function _ValidateCSSFileLoaded( options ) {
    var $createdLink = $( "link[href='" + options.URL + "']" );
    var success = true;

    // Check if the link element actually exists in the DOM.
    if ( ! $createdLink.length ) {
      success = false;
    }

    // Attempt to check readyState for IE.
    if ( $createdLink.get( 0 ).readyState ) {
      var created = $createdLink.get( 0 ).readyState;
      success = created == "complete" || created == "loaded";
    }
    // For non-IE browsers, actual validation is harder.
    else {
      // TODO: Need a robust non-IE solution to validate external stylesheet loading.
      if ( false /* Placeholder for future validation logic */ ) {
        success = false;
      }
    }

    // Based on validation, call success or error handlers.
    if ( success ) {
      _Success( options );
    } else {
      _Error( options );
    }
  }

  /**
   * Adds a CSS file to the document. Handles both remote and local CSS.
   * For local CSS, it fetches content via AJAX and injects into a <style> tag.
   * For remote CSS, it appends a <link> tag.
   *
   * @param {object} options - The options for the CSS file.
   */
  function _AddCSSFile( options ) {
    // If the CSS file is local (not remote), fetch its content via AJAX.
    if ( ! _URLIsRemote( options.URL ) ) {
      $.ajax( {
        url: options.URL,
        dataType: "text",
        success: function ( data ) {
          var randID = Math.round( Math.random() * 321312 ); // Generate a unique ID for the style tag.
          var $link = $( "<style />" )
            .attr( { "rel": "stylesheet", "type": "text/css", "id": randID.toString() } );

          $link.appendTo( "head" ); // Append the style tag to the head.

          // Use a small timeout to ensure the element is in the DOM before manipulating its stylesheet.
          setTimeout( function () {
            var created = $( "#" + randID.toString() );
            // For IE, use styleSheet.cssText; for others, use text().
            if ( $.browser.msie ) {
              created.get( 0 ).styleSheet.cssText = data;
            } else {
              created.text( data );
            }
            _Success( options ); // Mark as successful after content injection.
          }, 15 );
        },
        error: function () {
          _Error( options ); // Handle AJAX error for local CSS.
        },
        data: {}
      } );
    }
    // If the CSS file is remote, append a <link> tag.
    else {
      $( "<link />" )
        // Use .ready() with a timeout to asynchronously validate the loaded CSS.
        .ready( function () { setTimeout( function () { _ValidateCSSFileLoaded( options ); }, 15 ); } )
        .attr( { "rel": "stylesheet", "type": "text/css", "href": options.URL } )
        .appendTo( "head" ); // Add the link tag to the head.
    }
  }

  /**
   * Adds the URL of a successfully loaded script or CSS file to the internal tracking array.
   *
   * @param {object} options - The options object containing URL and Type.
   */
  function _AddLoadedScriptOrCSSToArray( options ) {
    var ScriptOrCSSArray = _GetScriptOrCSSArray() || {}; // Get existing array or initialize an empty object.

    // If the specific type array doesn't exist, create it.
    if ( ! ScriptOrCSSArray[ options.Type ] ) {
      ScriptOrCSSArray[ options.Type ] = new Array();
    }

    ScriptOrCSSArray[ options.Type ].push( options.URL ); // Add the URL to the array for its type.

    // Store the updated array back into jQuery's data collection.
    $( $.LateLoader.PluginDefaults.ElementToAttachDataTo ).data( $.LateLoader.PluginDefaults.ArrayDataKey, { ScriptOrCSSs: ScriptOrCSSArray } );
  }

  /**
   * Calls a function if it is defined and is a valid function.
   *
   * @param {function} method - The function to call.
   * @param {*} param - The parameter to pass to the function.
   */
  function _CallFunctionIfAvailable( method, param ) {
    if ( method && $.isFunction( method ) ) {
      method( param );
    }
  }

  /**
   * Determines if a given URL points to a remote resource (i.e., not on the same domain/protocol).
   *
   * @param {string} url - The URL to check.
   * @returns {boolean} - True if remote, false otherwise.
   */
  function _URLIsRemote( url ) {
    // Check if URL starts with "http" and is not on the current host.
    return url.indexOf( "http" ) > -1 &&
      ( url.indexOf( "http://" + window.location.host ) == -1 && url.indexOf( "https://" + window.location.host ) == -1 );
  }

} )( jQuery ); // Pass jQuery object into the anonymous function for encapsulation.