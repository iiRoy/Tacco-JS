( function ( )
{
  // This immediately invoked function expression (IIFE) encapsulates the entire script
  // to prevent global scope pollution.

  var fwUl,                                     // Holds the reference to the main unordered list element.
      fwLi = [ ],                               // An array to store list item elements, though only one is used at a time.
      fwRemove,                                 // Function to remove the main UL from the DOM.
      wtFramework = document.getElementById('_wtframework'); // Checks if the framework display already exists.

  // Define the function to remove the framework display from the document body.
  fwRemove = function ( )
  {
    // Ensure the element exists before attempting to remove it.
    if (fwUl && fwUl.parentNode === document.body) {
      document.body.removeChild(fwUl);
    }
  };

  // Check if the '_wtframework' element already exists in the DOM.
  // If it does, remove it and exit the script to prevent duplicates.
  if ( wtFramework ) {
    document.body.removeChild( wtFramework );
    return ; // Exit the IIFE.
  }

  /**
   * Represents a framework item with its version paths and CDNJS name.
   * @param {string|Array<string>} verPaths - One or more paths to check for framework version.
   * @param {string} [cdnjsName] - The name of the framework on cdnjs.com.
   */
  function fwItem ( verPaths, cdnjsName )
  {
    // Ensure verPaths is always an array for consistent processing.
    if ( ! ( verPaths instanceof Array ) ) {
      verPaths = [ verPaths ] ;
    }
    this.verPaths = verPaths ;
    this.cdnjsName = cdnjsName || '' ; // Default to an empty string if cdnjsName is not provided.
  }

  /**
   * Applies a set of CSS styles to a given DOM element.
   * Uses setProperty for better compatibility, falls back to direct style assignment.
   * @param {HTMLElement} element - The DOM element to style.
   * @param {object} styles - An object where keys are CSS properties and values are their values.
   */
  function fwApplyStyles ( element, styles )
  {
    for ( var s in styles )
    {
      // Check if setProperty is available for more robust style application.
      if ( typeof element.style.setProperty !== 'undefined' )
      {
        element.style.setProperty( s, styles[s], null ); // 'null' for priority, not strictly needed here.
      }
      else
      {
        // Fallback for older browsers or environments without setProperty.
        element.style[s] = styles[s] ;
      }
    }
  }

  // --- Framework Definitions ---
  // A comprehensive list of JavaScript frameworks and their detection methods.
  var fwList = {
    'Ace'                        : new fwItem( 'ace', 'ace' ),
    'ActiveJS'                   : new fwItem( 'ActiveSupport' ),
    'AngularJS'                  : new fwItem( 'angular.version.full' ),
    'Backbone.js'                : new fwItem( 'Backbone.VERSION', 'backbone.js' ),
    'Backbone localStorage'      : new fwItem( 'Store', 'backbone-localstorage.js' ),
    'Base2'                      : new fwItem( 'base2.version' ),
    'Batman.js'                  : new fwItem( 'Batman' ),
    'CamanJS'                    : new fwItem( 'Caman.version.release', 'camanjs' ),
    'Chainvas'                   : new fwItem( 'Chainvas' ),
    'CoffeeScript'               : new fwItem( 'CoffeeScript', 'coffee-script' ),
    'Clientcide Libraries'       : new fwItem( 'Clientcide.version' ),
    'Crafty'                     : new fwItem( 'Crafty.init' ),
    'CSS 3 Finalize'             : new fwItem( '$.cssFinalize', 'css3finalize' ),
    'CSS 3 Pie'                  : new fwItem( 'PIE', 'css3pie' ),
    'Cufón'                      : new fwItem( 'Cufon', 'cufon' ),
    'D3'                         : new fwItem( 'd3.version', 'd3' ),
    'Datejs'                     : new fwItem( 'Date.today', 'datejs' ),
    'Davis.js'                   : new fwItem( 'Davis.version', 'davis.js' ),
    'DD_belatedPNG'              : new fwItem( 'DD_belatedPNG', 'dd_belatedpng' ),
    'DocumentUp'                 : new fwItem( 'DocumentUp', 'documentup' ),
    'DHTMLX'                     : new fwItem( 'dhtmlx' ),
    'Dojo'                       : new fwItem( 'dojo.version', 'dojo' ),
    'Dojo Mobile'                : new fwItem( 'dojox.mobile' ),
    'Ember'                      : new fwItem( 'Ember.VERSION', 'ember.js' ),
    'Enyo'                       : new fwItem( 'enyo' ),
    'Ext JS'                     : new fwItem( [ 'Ext.version', 'Ext.versions.core.version' ], 'ext-core' ),
    'fancyBox'                   : new fwItem( '$.fancybox.version', 'fancybox' ),
    'flexie'                     : new fwItem( 'Flexie.version', 'flexie' ),
    'Flot'                       : new fwItem( '$.plot.version', 'flot' ),
    'Galleria'                   : new fwItem( 'Galleria.version', 'galleria' ),
    'Google Chrome Frame'        : new fwItem( 'CFInstall', 'chrome-frame' ),
    'g.Raphaël'                  : new fwItem( 'Raphael.fn.g', 'graphael' ),
    'Glow'                       : new fwItem( 'glow.VERSION' ),
    'Handlebars'                 : new fwItem( 'Handlebars.VERSION', 'handlebars.js' ),
    'Head JS'                    : new fwItem( 'head.js', 'headjs' ),
    'Highcharts JS'              : new fwItem( 'Highcharts.version', 'highcharts' ),
    'History.js'                 : new fwItem( 'History.Adapter', 'History.js' ),
    'Hogan.js'                   : new fwItem( 'Hogan' ),
    'html5shiv'                  : new fwItem( 'html5', 'html5shiv' ),
    'ICanHaz.js'                 : new fwItem( 'ich.VERSION', 'ICanHaz.js' ),
    'JS State Machine'           : new fwItem( 'StateMachine.VERSION', 'javascript-state-machine' ),
    'JavaScriptMVC'              : new fwItem( 'steal.fn' ),
    'jQuery'                     : new fwItem( 'jQuery.fn.jquery', 'jquery' ),
    'jQuery Mobile'              : new fwItem( 'jQuery.mobile' ),
    'jQuery throttle / debounce' : new fwItem( 'jQuery.debounce', 'jquery-throttle-debounce' ),
    'jQuery Tools'               : new fwItem( 'jQuery.tools.version', 'jquery-tools' ),
    'jQuery Cycle'               : new fwItem( 'jQuery.fn.cycle.ver', 'jquery.cycle' ),
    'jQuery UI'                  : new fwItem( '$.ui.version', 'jqueryui' ),
    'js-signals'                 : new fwItem( 'signals.VERSION', 'js-signals' ),
    'JSXGraph'                   : new fwItem( 'JXG', 'jsxgraph' ),
    'Kendo UI'                   : new fwItem( 'kendo' ),
    'Knockout'                   : new fwItem( 'ko', 'knockout' ),
    'LABjs'                      : new fwItem( '$LAB', 'labjs' ),
    'LESS'                       : new fwItem( 'less', 'less.js' ),
    'LightningJS'                : new fwItem( 'lightningjs' ),
    'LungoJS'                    : new fwItem( 'LUNGO.VERSION' ),
    'Masonry'                    : new fwItem( 'jQuery.fn.masonry', 'masonry' ),
    'Midori'                     : new fwItem( 'midori.domReady' ),
    'Modernizr'                  : new fwItem( 'Modernizr._version', 'modernizr' ),
    'MochiKit'                   : new fwItem( 'MochiKit.MochiKit.VERSION' ),
    'MooTools A.R.T.'            : new fwItem( 'ART.version' ),
    'MooTools Core'              : new fwItem( 'MooTools.version', 'mootools' ),
    'MooTools More'              : new fwItem( 'MooTools.More.version' ),
    'Mustache'                   : new fwItem( 'Mustache.version', 'mustache.js' ),
    'Ninja UI'                   : new fwItem( 'jQuery.ninja.version', 'ninjaui' ),
    'Noisy'                      : new fwItem( 'jQuery.fn.noisy', 'noisy' ),
    'oCanvas'                    : new fwItem( 'oCanvas', 'ocanvas' ),
    'o2.js'                      : new fwItem( 'o2.version' ),
    'PageDown'                   : new fwItem( 'Markdown', 'pagedown' ),
    'Prettify'                   : new fwItem( 'prettyPrint', 'prettify' ),
    'Processing.js'              : new fwItem( 'Processing.version', 'processing.js' ),
    'Prototype'                  : new fwItem( 'Prototype.Version', 'prototype' ),
    'PubNub'                     : new fwItem( 'PUBNUB', 'pubnub' ),
    'Qooxdoo'                    : new fwItem( 'qx.$$libraries.qx.version' ),
    'Raphaël'                    : new fwItem( 'Raphael.version', 'raphael' ),
    'Rico'                       : new fwItem( 'Rico.Version' ),
    'RightJS'                    : new fwItem( 'RightJS.version' ),
    'Sammy'                      : new fwItem( 'Sammy.VERSION', 'sammy.js' ),
    '$script.js'                 : new fwItem( '$script', 'script.js' ),
    'Script.aculo.us'            : new fwItem( 'Scriptaculous.Version', 'scriptaculous' ),
    'Scripty2'                   : new fwItem( 'S2.Version' ),
    'Sencha Touch'               : new fwItem( 'Ext.util.TapRepeater' ),
    'Sizzle'                     : new fwItem( 'Sizzle', 'sizzle' ),
    'Snack'                      : new fwItem( 'snack.v' ),
    'Socket.io'                  : new fwItem( 'io.version', 'socket.io' ),
    'Spine'                      : new fwItem( 'Spine.version', 'spinejs' ),
    'SproutCore'                 : new fwItem( 'SC.isReady' ),
    'Spry'                       : new fwItem( 'Spry.$' ),
    'Sugar'                      : new fwItem( 'Object.SugarMethods' ),
    'SWFObject'                  : new fwItem( 'swfobject', 'swfobject' ),
    'Terrific'                   : new fwItem( 'Tc' ),
    'Tiny Scrollbar'             : new fwItem( 'jQuery.fn.tinyscrollbar', 'tinyscrollbar' ),
    'Twitter Lib'                : new fwItem( 'twitterlib', 'twitterlib.js' ),
    'Underscore.js'              : new fwItem( '_.VERSION', 'underscore.js' ),
    'Waypoints'                  : new fwItem( 'jQuery.waypoints', 'waypoints' ),
    'Wink toolkit'               : new fwItem( 'wink' ),
    'WebFont Loader'             : new fwItem( 'WebFont', 'webfont' ),
    'xui'                        : new fwItem( 'x$', 'xuijs' ),
    'yepnope.js'                 : new fwItem( 'yepnope', 'yepnope' ),
    'YUI'                        : new fwItem( [ 'YAHOO.VERSION', 'YUI.version' ], 'yui' ),
    'Zepto'                      : new fwItem( 'Zepto', 'zepto' ),
    'ZK'                         : new fwItem( 'zk.version' )
  };

  // --- CSS Styles for the List Items (fwLi) ---
  var fwStyleLi = {
    'cursor'            : 'pointer', // Indicates interactivity.
    'text-align'        : 'left',    // Text alignment within the list item.
    'padding'           : '12px 16px', // Inner spacing.
    'margin'            : '0 0 8px',   // Outer spacing, creates separation between items.
    'list-style'        : 'none',    // Removes default list bullet points.
    'font'              : 'bold 12px Helvetica, Arial, sans-serif', // Font styling.
    // The original code had commented out linear gradients, we'll keep the solid background.
    //'background'    : '-moz-linear-gradient(top, rgba(255, 255, 255, 0.9) 0%, rgba(243, 243, 243, 0.9) 100%)',
    //'background'    : '-webkit-linear-gradient(top, rgba(255, 255, 255, 0.8) 0%, rgba(243, 243, 243, 0.8) 100%)',
    //'background'    : '-o-linear-gradient(top, rgba(255, 255, 255, 0.9) 0%, rgba(243, 243, 243, 0.9) 100%)',
    //'background'    : 'linear-gradient(top, rgba(255, 255, 255, 0.9) 0%, rgba(243, 243, 243, 0.9) 100%)',
    'background'        : 'rgba(243, 243, 243, 0.9)', // Semi-transparent light grey background.
    'color'             : '#666',      // Text color.
    'border-radius'     : '4px',     // Rounded corners.
    'border'            : 'solid 1px rgba(255, 255, 255, 0.9)', // Light border.
    'text-shadow'       : '0 1px 0 #fff', // Subtle text shadow for depth.
    'box-shadow'        : '0 0 8px rgba(0, 0, 0, 0.6)', // Drop shadow for the list item.
    'float'             : 'right',   // Floats items to the right.
    'clear'             : 'both',    // Clears floats on both sides, ensuring items stack vertically.
    'min-width'         : '170px'    // Minimum width for the list item.
  };

  // --- CSS Styles for the Unordered List Container (fwUl) ---
  var fwStyleUl = {
    'position'  : 'fixed',   // Positioned relative to the viewport.
    'padding'   : '0',       // No inner padding.
    'margin'    : '0',       // No outer margin.
    'right'     : '10px',    // 10 pixels from the right edge of the viewport.
    'top'       : '10px',    // 10 pixels from the top edge of the viewport.
    'z-index'   : 16777271   // A very high z-index to ensure it's always on top.
  };

  // --- CSS Styles for the Anchor Tags (fwA) within List Items ---
  var fwStyleA = {
    'color'             : '#666',      // Text color for links.
    'font'              : 'bold 12px Helvetica, Arial, sans-serif', // Font styling for links.
    'text-decoration'   : 'none'     // Removes default underline from links.
  };

  // --- Properties for the main UL element ---
  var props = {
    id      : '_wtframework', // Unique ID for the container UL.
    onclick : fwRemove        // Attach the removal function to the click event of the UL.
  };

  // Create the main unordered list element.
  fwUl = document.createElement( 'ul' );

  // Apply properties from the 'props' object to the newly created UL.
  for ( var prop in props ) {
    fwUl[prop] = props[prop];
  }

  // Apply the predefined styles for the UL container.
  fwApplyStyles( fwUl, fwStyleUl );

  // Append the UL to the document body, making it visible.
  document.body.appendChild( fwUl );

  /**
   * Displays information about a detected framework in a list item.
   * Creates a new list item and appends it to the main UL.
   * @param {string} fwName - The name of the framework.
   * @param {string} [fwVersion] - The detected version of the framework.
   */
  var showInfo = function ( fwName, fwVersion ) {
    var pkgs = window.wtfPkgs, // Reference to cached CDNJS package data.
        s;                     // General purpose variable (unused here, could be removed or used).

    // Retrieve additional information from CDNJS data if available.
    var cdnjsInfo = ( fwList[fwName] && pkgs && pkgs[fwList[fwName].cdnjsName] )
                  ? pkgs[fwList[fwName].cdnjsName]
                  : null ;

    // Extract relevant details from cdnjsInfo or set defaults.
    var curVer      = ( cdnjsInfo ) ? cdnjsInfo.version  : null ,
        homepageUrl = ( cdnjsInfo ) ? cdnjsInfo.homepage : '#'  , // Default to '#' if no homepage.
        description = ( cdnjsInfo ) ? cdnjsInfo.description : '' ;

    // Append latest version info to description if available.
    if ( curVer !== null ) {
      description += ' (Latest version: ' + curVer + ')' ;
    }

    // Create a new list item element for the framework.
    fwLi = document.createElement( 'li' );

    // Create an anchor element for the framework name, linking to its homepage.
    fwLink = document.createElement( 'a' );
    fwLink.href = homepageUrl ;
    fwLink.title = description ; // Tooltip shows description and latest version.
    fwLink.appendChild( document.createTextNode( fwName ) ); // Add framework name as text.
    fwApplyStyles( fwLink, fwStyleA ); // Apply link styles.

    fwLi.appendChild( fwLink ); // Add the link to the list item.

    // If a framework version is detected and it's not a build placeholder.
    if ( fwVersion && ( fwVersion != '%build%' ) ) {
      fwLi.appendChild( document.createTextNode( ' (' ) ); // Append opening parenthesis.

      // If CDNJS info exists, compare detected version with latest.
      if ( curVer !== null ) {
        var verSpan = document.createElement( 'span' ); // Create a span for version text.
        // Color the version based on whether it matches the latest CDNJS version.
        verSpan.style.color = ( curVer != fwVersion ) ? '#f33' : '#090' ;
        verSpan.appendChild( document.createTextNode( fwVersion ) ); // Add detected version text.
        fwLi.appendChild( verSpan ); // Append the colored version span.
      } else {
        // If no CDNJS info, just add the detected version as plain text.
        fwLi.appendChild( document.createTextNode( fwVersion ) );
      }

      fwLi.appendChild( document.createTextNode( ')' ) ); // Append closing parenthesis.
    }

    fwApplyStyles( fwLi, fwStyleLi ); // Apply list item styles.
    fwUl.appendChild( fwLi ); // Add the completed list item to the main UL.
  };

  /**
   * Iterates through the predefined framework list, attempts to detect them,
   * and displays their information if found.
   */
  var findFrameworks = function ( ) {
    var howMany = 0; // Counter for detected frameworks.

    // Loop through each framework definition in fwList.
    for ( var fwNs in fwList ) {
      // Ensure it's an own property to avoid iterating over prototype chain.
      if ( fwList.hasOwnProperty( fwNs ) ) {
        // Loop through all possible version paths defined for the current framework.
        for ( var j = 0; j < fwList[fwNs].verPaths.length; j++ ) {
          var exists = window, // Start checking from the global window object.
              verPath = fwList[fwNs].verPaths[j] ; // Current version path string.

          // Split the path (e.g., "jQuery.fn.jquery") and traverse the object.
          for ( var i = 0, idents = verPath.split( '.' ); i < idents.length; i++ ) {
            exists = exists && exists[idents[i]] ; // Navigate down the object chain.
          }

          // If the path exists (i.e., the framework is detected).
          if ( exists ) {
            var version = false ; // Initialize version variable.
            // If it's a string and not a Grunt/build placeholder.
            if ( typeof exists === 'string' && ! exists.match( /^<%=/ ) ) {
              version = exists ;
            }
            // If it's an object with a toString method.
            else if ( typeof exists === 'object' && exists.hasOwnProperty( 'toString' ) ) {
              version = exists.toString( ) ;
            }

            // Clean up the version string, removing build numbers like "(12345)".
            if ( version !== false ) {
              version = version.replace( /\s*\(.+\)\s*/, '' ) ;
            }

            // Display the framework information.
            showInfo( fwNs, version );
            howMany++; // Increment the counter.
            break;     // Move to the next framework in fwList after finding one path.
          }
        }
      }
    }

    // If no frameworks were detected, display a message.
    if ( ! howMany ) {
      showInfo( 'No known framework detected.' );
    }
  };

  // --- CDNJS Package Loading Logic ---
  // Check if CDNJS package data is already loaded in the window object.
  if ( ! window.wtfPkgs ) {
    // If not, load packages from cdnjs.com using YQL as a JSONP proxy.
    // The URL points to Yahoo's YQL service which fetches cdnjs.com/packages.min.json
    // and wraps it in a JSONP callback.

    // Define the JSONP callback function.
    window.wtfJsonpCb = function ( json ) {
      var pkgs = json.query.results.json.packages; // Extract package array from YQL response.
      var pHash = { }; // Initialize an empty object to store packages by name.

      // Populate pHash with package data, using lowercase name as key.
      for ( var i = 0; i < pkgs.length; i++ ) {
        if ( pkgs[i] ) { // Ensure package object is not null.
          pHash[pkgs[i].name.toLowerCase( )] = pkgs[i] ;
        }
      }
      window.wtfPkgs = pHash ; // Store the processed package data globally.
      findFrameworks( ) ;     // Now that data is loaded, find frameworks.
    };

    // Create a script element to initiate the JSONP request.
    var jsonp = document.createElement( 'script' );
    jsonp.setAttribute( 'src', "//query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D'http%3A%2F%2Fwww.cdnjs.com%2Fpackages.min.json'&format=json&callback=wtfJsonpCb" );
    // Append the script to the head to execute the JSONP request.
    document.getElementsByTagName( 'head' )[0].appendChild( jsonp );
  }
  else
  {
    // If CDNJS package data is already available, proceed directly to finding frameworks.
    findFrameworks( ) ;
  }

} ) ( ) ; // Execute the IIFE immediately.