/*
 * @author: verdyckb
 * @name: TD.plugin.SUD
 * @version: 0.0.1
 * @date: 17/01/12
 * @dependencies: none
 * @copyright: These Days
 */


// This is an additional comment for the SUD plugin.
// It doesn't affect the code logic.


/*
 * @author: verdyckb
 * @name: TD.os
 * @version: 0.0.1
 * @date: 17/01/12
 * @dependencies:
 * @copyright: These Days
 */
/* jslint devel: true, browser: true, maxerr: 50, indent: 4 */
( function ( window, TD ) {
  'use strict' ; // Enables strict mode for safer JavaScript.

  /*
   *  @name:          TD.os
   *  @Description:   All os info for the current user agent.
   *  @Parameters:    None
   *  @Usage:         TD.os || TD.os.win // Access OS properties
  */
  TD.os = ( function ( ) {
    var appVersion, userAgent, os, win, linux, mac, unix, tmpArray, version, android, iphone, ipod, ipad; // Declare all local variables at the top.

    os = { } ;
    appVersion = navigator.appVersion.toLowerCase ( ) ;
    userAgent = navigator.userAgent.toLowerCase ( ) ;

    win = 'win' ;
    mac = 'mac' ;
    unix = 'x11' ;
    linux = 'linux' ;
    android = 'android' ;
    iphone = 'iphone' ;
    ipod = 'ipod' ;
    ipad = 'ipad' ;

    os.win = false ;
    os.mac = false ;
    os.unix = false ;
    os.linux = false ;
    os.android = false ;
    os.ios = false ;
    os.phone = false ;
    os.iphone = false ;
    os.ipad = false ;

    os.name = 'unknown' ; // Default OS name
    os.version = 'unknown' ; // Default OS version

    // Check for Windows
    if ( appVersion.indexOf ( win ) > -1 ) {
      os.win = true ;
    }
    // Check for Mac
    if ( appVersion.indexOf ( mac ) > -1 ) {
      os.mac = true ;
    }
    // Check for Unix
    if ( appVersion.indexOf ( unix ) > -1 ) {
      os.unix = true ;
    }
    // Check for Linux
    if ( appVersion.indexOf ( linux ) > -1 ) {
      os.linux = true ;
    }
    // Check for Android
    if ( userAgent.indexOf ( android ) > -1 ) {
      os.android = true ;
      os.phone = true ; // Android is typically a phone OS
    }
    // Check for iOS devices (iPod, iPhone, iPad)
    if ( userAgent.indexOf ( ipod ) > -1 || userAgent.indexOf ( iphone ) > -1 || userAgent.indexOf ( ipad ) > -1 ) {
      os.ios = true ;
      os.mac = false ; // iOS is not Mac OS
      os.phone = true ; // iOS devices are phones/tablets

      if ( userAgent.indexOf ( ipod ) > -1 || userAgent.indexOf ( iphone ) > -1 ) {
        os.iphone = true ;
      } else {
        os.ipad = true ;
      }
    }

    // Determine Windows version
    if ( os.win ) {
      if ( appVersion.indexOf ( 'win16' ) >= -1 ) { version = '3.11' ; }
      if ( appVersion.indexOf ( '95' ) >= -1 ) { version = '95' ; }
      if ( appVersion.indexOf ( '98' ) >= -1 ) { version = '98' ; }
      if ( appVersion.indexOf ( '4.0' ) >= -1 || appVersion.indexOf ( 'winnt' ) >= -1 ) { version = 'NT 4.0' ; }
      if ( appVersion.indexOf ( '2000' ) >= -1 || appVersion.indexOf ( 'nt 5.0' ) >= -1 ) { version = '2000' ; }
      if ( appVersion.indexOf ( ' me ' ) >= -1 ) { version = 'ME' ; }
      if ( appVersion.indexOf ( 'xp' ) >= -1 || appVersion.indexOf ( 'nt 5.1' ) >= -1 ) { version = 'XP' ; }
      if ( appVersion.indexOf ( 'nt 5.2' ) >= -1 ) { version = 'Server 2003' ; }
      if ( appVersion.indexOf ( 'nt 6.0' ) >= -1 ) { version = 'Vista' ; }
      if ( appVersion.indexOf ( 'nt 7.0' ) >= -1 || appVersion.indexOf ( 'nt 6.1' ) >= -1 ) { version = '7' ; }

      os.name = 'Microsoft Windows' ;
      os.version = version ;
    }
    // Determine Mac OS X version
    if ( os.mac ) {
      tmpArray = userAgent.split ( 'mac os x ' ) ;
      if ( tmpArray[1] ) {
        version = tmpArray[1] ;
        version = version.split ( ';' ) ;
        if ( version[0] ) {
          version = version[0] ;
          version = version.replace ( /_/g, '.' ) ;
        }

        if ( version.indexOf ( ')' ) ) {
          version = version.split ( ')' ) ;
          version = version[0] ;
        }
      } else {
        version = 'unknown' ;
      }
      os.version = 'OS X ' + version ;
      os.name = 'Mac' ;
    }
    // Set Unix name
    if ( os.unix ) {
      os.name = 'Unix' ;
    }
    // Set Linux name
    if ( os.linux ) {
      os.name = 'Linux' ;
    }
    // Determine Android version
    if ( os.android ) {
      tmpArray = userAgent.split ( 'android ' ) ;
      if ( tmpArray[1] ) {
        version = tmpArray[1].split ( ';' ) ;
        version = version[0] ;
      }
      os.version = version ;
      os.name = 'Android' ;
    }
    // Determine iOS version and specific device
    if ( os.ios ) {
      tmpArray = userAgent.split ( ' os ' ) ;
      version = tmpArray[1] ;
      version = version.split ( ' ' ) ;
      if ( version[0] ) {
        version = version[0] ;
        version = version.replace ( /_/g, '.' ) ;
      }
      os.version = version ;
      os.name = 'iOS' ;
      if ( os.iphone ) {
        os.name = 'iOS iPhone/iPod' ;
      }
      if ( os.ipad ) {
        os.name = 'iOS iPad' ;
      }
    }

    return os ; // Return the OS object
  } ( ) ) ;

  window.TD = TD ; // Assign TD back to window object if it was modified.
} ( window, window.TD || { } ) ) ;

/**
 * @author: verdyckb
 * @name: TD.browser
 * @version: 0.0.1
 * @date: 17/01/12
 * @dependencies:
 * @copyright: These Days
 * This section handles browser detection.
 */

/* jslint devel: true, browser: true, maxerr: 50, indent: 4 */

( function( window, TD ) {
    'use strict' ;

    /*
     *  @name:          TD.browser
     *  @Description:   All browser info
     *  @Parameters:    None
     *  @Usage:         TD.browser || TD.browser.webkit // Example usage
    */
  TD.browser = ( function ( ) {

    var appName, vendor, userAgent, chrome, safari, ie, firefox, opera, browser, tmpArray, version;

    browser = { } ;

    appName = navigator.appName.toLowerCase ( ) ;
    userAgent = navigator.userAgent.toLowerCase ( ) ;
    vendor = navigator.vendor ;

    browser.webkit = false ;
    browser.chrome = false ;
    browser.safari = false ;
    browser.msie = false ;
    browser.firefox = false ;
    browser.opera = false ;
    browser.name = 'unknown' ;
    browser.version = 'unknown' ;

    ie = 'msie' ;
    firefox = 'firefox' ;
    opera = 'presto' ;

    // Check if vendor string exists, usually for Chrome & Safari (Webkit browsers)
    if ( vendor ) {
      vendor = vendor.toLowerCase ( ) ;
      chrome = vendor.indexOf ( 'google' ) ;
      safari = vendor.indexOf ( 'apple' ) ;

      if ( chrome > -1 || safari > -1 ) {
        browser.webkit = true ; // It's a Webkit browser

        if ( chrome > -1 ) {
          browser.chrome = true ;
          browser.name = 'Google Chrome' ;
        }
        if ( safari > -1 ) {
          browser.safari = true ;
          browser.name = 'Safari' ;
        }
      }
    }

    // If not Webkit, check for other common browsers
    if ( userAgent.indexOf ( ie ) > -1 ) {
      browser.msie = true ;
      browser.name = 'Microsoft Internet Explorer' ;
    }
    if ( userAgent.indexOf ( firefox ) > -1 ) {
      browser.firefox = true ;
      browser.name = 'Mozilla Firefox' ;
    }
    if ( userAgent.indexOf ( opera ) > -1 ) {
      browser.opera = true ;
      browser.name = 'Opera' ;
    }

    // Now, determine the version of the detected browser
    if ( browser.msie ) {
      tmpArray = userAgent.split ( '; ' ) ;
      if ( tmpArray[1] ) {
        version = tmpArray[1].split ( ' ' ) ;
        if ( version[1] ) {
          version = version[1] ;
        }
      }
    }
    if ( browser.opera ) {
      tmpArray = userAgent.split ( 'version/' ) ;
      if ( tmpArray[1] ) {
        version = tmpArray[1] ;
      }
    }
    if ( browser.chrome ) {
      tmpArray = userAgent.split ( 'chrome/' ) ;
      if ( tmpArray[1] ) {
        version = tmpArray[1].split ( ' ' ) ;
        if ( version[0] ) { version = version[0] ; }
      }
    }
    if ( browser.safari ) {
      tmpArray = userAgent.split ( 'version/' ) ;
      if ( tmpArray[1] ) {
        version = tmpArray[1].split ( ' ' ) ;
        if ( version[0] ) { version = version[0] ; }
      }
    }
    if ( browser.firefox ) {
      tmpArray = userAgent.split ( 'firefox/' ) ;
      if ( tmpArray[1] ) {
        version = tmpArray[1] ;
      }
    }

    // Assign the determined version if found
    if ( version ) {
      browser.version = version ;
    }

    return browser ; // Return the browser info object

  } ( ) ) ;

  window.TD = TD ; // Ensure TD is attached to the global window object.
} ( window, window.TD || { } ) ) ;

/**
 * @author: verdyckb
 * @name: MediaQuery
 * @version: 0.0.1
 * @date: 4/11/11
 * @dependencies:
 * @copyright: These Days
 * This file provides functionality for media query detection.
 */
( function ( window, TD, undefined ) {
    /**
     *  @name:          MediaQuery
     *  @description:   Get the right type of a js object. This description is misleading, it's about media queries.
     *  @parameters:    None
     *  @usage:         TD.mq || TD.mq.screen || ... // Access media query properties
     */

  TD.mq = ( function ( ) {
    var mq = {
      minRegex:       /min-(device-){0,1}width:( *)(\d+)px/gi, // Regex for min-width media queries
      maxRegex:       /max-(device-){0,1}width:( *)(\d+)px/gi, // Regex for max-width media queries
      windowWidth:    window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth, // Current window width
      stylesheets:    document.styleSheets // All stylesheets in the document
    } ;

    mq.init = function ( ) {
      mq.stylesheets = selectStylesheets ( mq.stylesheets ) ; // Filter out print stylesheets
      mq.queries = parseStylesheets ( mq.stylesheets ) ; // Parse media queries from selected stylesheets
      getCurrentMQ ( ) ; // Determine the current active media query
    } ;

    function selectStylesheets ( sheets ) {
      var i, length, selected, sheet, media ;

      selected = [ ] ;

      for ( i = 0, length = sheets.length ; i < length ; i += 1 ) {
        sheet = sheets[i] ;

        media = sheet.media || "" ; // Get media attribute, default to empty string

        // Exclude print stylesheets
        if ( sheet.media.mediaText && sheet.media.mediaText.indexOf ( 'print' ) >= 0 ) { continue ; }
        if ( sheet.media.toString ( ).indexOf ( 'print' ) >= 0 ) { continue ; }

        selected.push ( sheet ) ; // Add to selected stylesheets
      }

      return selected ;
    }

    function parseStylesheets ( sheets ) {
      var i, sheetLength, layouts, layout, sheetmedia, media, sheet, rules, rule, j, rulesLength ;

      layouts = { } ; // Object to store parsed layouts, keyed by min-width

      for ( i = 0, sheetLength = sheets.length ; i < sheetLength ; i += 1 ) {
        sheet = sheets[i] ;

        // Process media attribute of the stylesheet itself
        if ( sheet.media ) {
          if ( sheet.media.hasOwnProperty ( 'mediaText' ) ) {
            sheetmedia = sheet.media.mediaText ;
          } else {
            sheetmedia = "" + sheet.media ; // Convert media object to string
          }

          if ( sheetmedia && sheetmedia.indexOf ( 'print' ) < 0 ) { // Ensure it's not a print media query
            layout = { } ;
            layout.min = sheetmedia.match ( mq.minRegex ) ;
            layout.max = sheetmedia.match ( mq.maxRegex ) ;

            if ( layout.min || layout.max ) {
              if ( layout.min ) {
                layout.min = layout.min[0].split ( ':' )[1] ;
                layout.min = parseInt ( layout.min, 10 ) ;
              } else {
                layout.min = 0 ; // Default min-width if not specified
              }
              if ( layout.max ) {
                layout.max = layout.max[0].split ( ':' )[1] ;
                layout.max = parseInt ( layout.max, 10 ) ;
              } else {
                layout.max = 'to infinity and beyond!' ; // Placeholder for no max-width
              }

              layout.query = sheetmedia ;
              layouts[layout.min] = layouts[layout.min] || [ ] ; // Initialize array if not exists
              layouts[layout.min].push ( layout ) ;
            }
          }
        }

        // Process CSS rules within the stylesheet
        try {
          rules = sheet.cssRules || sheet.rules || null ; // Get CSS rules
        } catch ( e ) {
          TD.log ( 'Failed to parse stylesheet with error: ', e ) ; // Log parsing errors
          return false ;
        }

        if ( rules ) {
          for ( j = 0, rulesLength = rules.length ; j < rulesLength ; j += 1 ) {
            rule = rules[j] ;

            // Skip rules without media queries
            if ( !rule.media ) { continue ; }

            media = rule.media.mediaText || rule.media ; // Get media text
            if ( media.indexOf ( 'print' ) >= 0 ) { continue ; } // Skip print media queries

            layout = { } ;
            layout.min = media.match ( mq.minRegex ) ;
            layout.max = media.match ( mq.maxRegex ) ;

            // Skip if no min-width or max-width is found
            if ( !layout.min && !layout.max ) { continue ; }

            if ( layout.min ) {
              layout.min = layout.min[0].split ( ':' )[1] ;
              layout.min = parseInt ( layout.min, 10 ) ;
            } else {
              layout.min = 0 ;
            }
            if ( layout.max ) {
              layout.max = layout.max[0].split ( ':' )[1] ;
              layout.max = parseInt ( layout.max, 10 ) ;
            } else {
              layout.max = 'to infinity and beyond!' ;
            }

            layout.query = media ;

            layouts[layout.min] = layouts[layout.min] || [ ] ;

            layouts[layout.min].push ( layout ) ;

            // Sort layouts by max-width
            layouts[layout.min].sort ( function ( a, b ) {
              if ( typeof a.max == "string" && typeof b.max == typeof "" ) { return 0 ; }
              if ( typeof a.max == "string" ) { return 1 ; }
              if ( typeof b.max == "string" ) { return 1 ; }

              return a.max - b.max ;
            } ) ;
          }
        }
      }

      return layouts ; // Return the parsed layouts
    }

    function getCurrentMQ ( ) {
      var queries, key, i, length, currentLayout, layout, screen ;

      queries = mq.queries ;

      // Update window width
      mq.windowWidth = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth ;

      currentLayout = [ ] ;

      screen = 0 ;
      for ( key in queries ) {
        if ( queries.hasOwnProperty ( key ) ) { // Check for own properties
          // mq.currentMQ = queries[key]; // This line was commented out in original, keeping it that way
          if ( key < mq.windowWidth ) {
            screen += 1 ;
            currentLayout = queries[key] ; // Store layouts for the current screen size
            mq.screen = screen ;
          } else {
            break ; // Break once a larger key is encountered
          }
        }
      }

      // Find the most specific media query for the current window width
      for ( i = 0, length = currentLayout.length ; i < length ; i += 1 ) {
        layout = currentLayout[i] ;
        if ( typeof layout.max == "string" || layout.max >= mq.windowWidth ) { mq.currentMQ = layout ; }
      }
    }

    function resize ( ) {
      // Recalculate window width on resize
      mq.windowWidth = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth ;
      clearTimeout ( mq.resizeTimer ) ; // Clear previous resize timer
      mq.resizeTimer = setTimeout ( getCurrentMQ, 10 ) ; // Debounce resize event
    }

    mq.init ( ) ; // Initialize media query detection

    // Attach resize event listener
    if ( window.addEventListener ) {
      window.addEventListener ( 'resize', resize, true ) ;
    } else {
      window.attachEvent ( 'onresize', resize ) ;
    }

    window.TD = TD ; // Ensure TD is accessible globally

    return mq ; // Return the mq object

  } ( ) ) ;

} ( window, window.TD || { } ) ) ;

( function ( window, TD ) {
  var resizeTimer ; // Declared but not used in this snippet.

  // The following line was commented out in the original source, preserving its state.
  // if(!TD.mq.screen) { alert('No responsive stylesheets found in head'); return false; }

  function init ( ) {
    var html, wrapper, clearfix, clear, left, right, browser, close, os, mqinfo, el, min, max, current ;

    el = document.getElementById ( 'td_plugin_sud_wrapper' ) ;

    // If the element already exists, prevent re-initialization.
    if ( el ) {
      return false ;
    }

    min = TD.mq.currentMQ.min ;
    max = TD.mq.currentMQ.max ;
    current = TD.mq.windowWidth ;

    // Append 'px' unit if min is a number.
    if ( typeof min != "string" ) {
      min += "px" ;
    }