/*
 *   jQuery BlockUI Plugin: Version 2.61.0 - 2013.06.06
 *
 *   This plugin provides a way to block the user interface during AJAX requests or other operations.
 *   It requires jQuery v1.7 or later.
 *   Examples and documentation can be found at: http://malsup.com/jquery/block/
 *
 *   Copyright (c) 2007-2013 M. Alsup
 *   Dual licensed under the MIT and GPL licenses.
 *   MIT License: http://www.opensource.org/licenses/mit-license.php
 *   GPL License: http://www.gnu.org/licenses/gpl.html
 *
 *   Special thanks to Amir-Hossein Sobhi for his valuable contributions.
 */

; ( function () {

// The "use strict" directive enables strict mode in JavaScript.
"use strict" ;

  /**
   * Initializes the BlockUI plugin by extending jQuery.
   * @param {jQuery} $ - The jQuery object.
   */
  function setup ( $ ) {

    // Preserve the original fadeIn method.
    $.fn._fadeIn = $.fn.fadeIn ;


    // A no-operation function, used as a fallback for $.noop.
    var noOp = $ . noop || function ( ) { } ;


    // Determine if the browser is Internet Explorer to handle specific quirks.
    // This section checks for IE versions and document mode to apply workarounds.
    var msie   = /MSIE/ . test ( navigator . userAgent ) ;
    var ie6    = /MSIE 6.0/ . test ( navigator . userAgent ) && ! /MSIE 8.0/ . test ( navigator . userAgent ) ;
    var mode   = document . documentMode || 0 ;
    var setExpr = $ . isFunction ( document . createElement ( 'div' ) . style . setExpression ) ;


    // Global jQuery methods for blocking and unblocking the entire page.
    $. blockUI   = function ( opts ) {
      install ( window , opts ) ;
    } ;

    $. unblockUI = function ( opts ) {
      remove ( window , opts ) ;
    } ;


    /**
     * Convenience method for creating "growl-like" notifications.
     * @param {string} title - The title of the growl message.
     * @param {string} message - The main message content.
     * @param {number} timeout - Duration in milliseconds before auto-unblocking.
     * @param {function} onClose - Callback function executed when the growl is unblocked.
     */
    $. growlUI = function ( title , message , timeout , onClose ) {
      // Create the main growl message container.
      var $m = $ ( '<div class="growlUI"></div>' ) ;

      // Append title if provided.
      if ( title ) {
        $m . append ( '<h1>' + title + '</h1>' ) ;
      }

      // Append message if provided.
      if ( message ) {
        $m . append ( '<h2>' + message + '</h2>' ) ;
      }

      // Set default timeout if not specified.
      if ( timeout === undefined ) {
        timeout = 3000 ;
      }


      // Added by konapun: Set timeout to 30 seconds if this growl is moused over,
      // similar to how normal toast notifications behave.
      var callBlock = function ( opts ) {
        opts = opts || { } ;

        $ . blockUI ( {
          message     : $m ,
          fadeIn      : typeof opts . fadeIn  !== 'undefined' ? opts . fadeIn  : 700 ,
          fadeOut     : typeof opts . fadeOut !== 'undefined' ? opts . fadeOut : 1000 ,
          timeout     : typeof opts . timeout !== 'undefined' ? opts . timeout : timeout ,
          centerY     : false ,
          showOverlay : false ,
          onUnblock   : onClose ,
          css         : $ . blockUI . defaults . growlCSS
        } ) ;
      } ;

      callBlock ( ) ;

      // Store initial opacity to restore later if needed (though not explicitly used here).
      var nonmousedOpacity = $m . css ( 'opacity' ) ;

      // Handle mouseover event for the growl message.
      $m . mouseover ( function ( ) {
        callBlock ( {
          fadeIn  : 0 ,
          timeout : 30000 // Extended timeout on mouseover.
        } ) ;

        var displayBlock = $ ( '.blockMsg' ) ;
        displayBlock . stop ( ) ; // Stop any ongoing fadeOut animation.
        displayBlock . fadeTo ( 300 , 1 ) ; // Make the message fully opaque for readability.
      } ) . mouseout ( function ( ) {
        // On mouseout, fade out the message.
        $ ( '.blockMsg' ) . fadeOut ( 1000 ) ;
      } ) ;
      // End konapun additions.
    } ;


    /**
     * Plugin method for blocking content of a specific element.
     * @param {object} opts - Options for blocking.
     * @returns {jQuery} - The jQuery object for chaining.
     */
    $ . fn . block = function ( opts ) {
      // If the target is the window, use the global blockUI method.
      if ( this [ 0 ] === window ) {
        $ . blockUI ( opts ) ;
        return this ;
      }
      // Merge default options with provided options.
      var fullOpts = $ . extend ( { } , $ . blockUI . defaults , opts || { } ) ;

      // Iterate over each element to block.
      this . each ( function ( ) {
        var $el = $ ( this ) ;
        // If 'ignoreIfBlocked' is true and element is already blocked, do nothing.
        if ( fullOpts . ignoreIfBlocked && $el . data ( 'blockUI.isBlocked' ) )
          return ;
        // Unblock with fadeOut: 0 to ensure clean state before re-blocking.
        $el . unblock ( { fadeOut : 0 } ) ;
      } ) ;

      return this . each ( function ( ) {
        // If element position is static, change it to relative for proper layering.
        if ( $ . css ( this , 'position' ) == 'static' ) {
          this . style . position = 'relative' ;
          $ ( this ) . data ( 'blockUI.static' , true ) ;
        }
        // Force 'hasLayout' in IE for correct rendering.
        this . style . zoom = 1 ;
        // Install the block.
        install ( this , opts ) ;
      } ) ;
    } ;


    /**
     * Plugin method for unblocking content of a specific element.
     * @param {object} opts - Options for unblocking.
     * @returns {jQuery} - The jQuery object for chaining.
     */
    $ . fn . unblock = function ( opts ) {
      // If the target is the window, use the global unblockUI method.
      if ( this [ 0 ] === window ) {
        $ . unblockUI ( opts ) ;
        return this ;
      }
      // Iterate over each element to unblock.
      return this . each ( function ( ) {
        remove ( this , opts ) ;
      } ) ;
    } ;

    // Current version of the BlockUI plugin.
    $ . blockUI . version = 2.60 ;


    // Default options for BlockUI. These can be overridden globally or per-call.
    $ . blockUI . defaults = {
      // Message displayed when blocking (set to null for no message).
      message:  '<h1>Please wait...</h1>' ,

      title: null , // Title string; only used when theme is true.
      draggable: true , // Only used when theme is true (requires jquery-ui.js).

      theme: false , // Set to true to integrate with jQuery UI themes.

      // Styles for the message block.
      // To use an external stylesheet, set this to `{}` in your code.
      css: {
        padding         : 0 ,
        margin          : 0 ,
        width           : '30%' ,
        top             : '40%' ,
        left            : '35%' ,
        textAlign       : 'center' ,
        color           : '#000' ,
        border          : '3px solid #aaa' ,
        backgroundColor : '#fff' ,
        cursor          : 'wait'
      } ,

      // Minimal style set specifically for themed blocks.
      themedCSS: {
        width : '30%' ,
        top   : '40%' ,
        left  : '35%'
      } ,

      // Styles for the overlay layer.
      overlayCSS:  {
        backgroundColor : '#000' ,
        opacity         : 0.6 ,
        cursor          : 'wait'
      } ,

      // Cursor style to revert to after unblocking, fixing lingering wait cursors.
      cursorReset: 'default' ,

      // Styles applied when using $.growlUI.
      growlCSS: {
        width                   : '350px' ,
        top                     : '10px' ,
        left                    : '' ,
        right                   : '10px' ,
        border                  : 'none' ,
        padding                 : '5px' ,
        opacity                 : 0.6 ,
        cursor                  : 'default' ,
        color                   : '#fff' ,
        backgroundColor         : '#000' ,
        '-webkit-border-radius' : '10px' ,
        '-moz-border-radius'    : '10px' ,
        'border-radius'         : '10px'
      } ,

      // IE iframeSrc issue: 'about:blank' fails on HTTPS, 'javascript:false' is slow.
      // Determines the iframe's src attribute based on the current protocol.
      iframeSrc: /^https/i . test ( window . location . href || '' ) ? 'javascript:false' : 'about:blank' ,

      // Force usage of an iframe even in non-IE browsers (useful for blocking applets).
      forceIframe: false ,

      // Base z-index for the blocking overlay and message.
      baseZ: 1000 ,

      // Automatically center the message block.
      // centerX only affects element blocking; page block is controlled by CSS.
      centerX: true ,
      centerY: true ,

      // Allow the body element to be stretched in IE6 for better appearance on short pages.
      allowBodyStretch: true ,

      // Enable/disable key and mouse events on blocked content.
      bindEvents: true ,

      // By default, BlockUI suppresses tab navigation from leaving blocked content.
      constrainTabKey: true ,

      // FadeIn duration in milliseconds; set to 0 to disable.
      fadeIn:  200 ,

      // FadeOut duration in milliseconds; set to 0 to disable.
      fadeOut:  400 ,

      // Auto-unblock timeout in milliseconds; set to 0 to disable auto-unblock.
      timeout: 0 ,

      // Show/hide the overlay layer.
      showOverlay: true ,

      // If true, focus will be placed in the first available input field when page blocking.
      focusInput: true ,

      // Selector for elements that can receive focus within the blocked area.
      focusableElements: ':input:enabled:visible' ,

      // Callback invoked after fadeIn completes and message is visible.
      onBlock: null ,

      // Callback invoked after unblocking completes.
      // Passed the element (window for page blocks) and options.
      onUnblock: null ,

      // Callback invoked when the overlay area is clicked.
      // Setting this changes the cursor to a pointer.
      onOverlayClick: null ,

      // Quirks mode offset hack for IE (details: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493)
      quirksmodeOffsetHack: 4 ,

      // CSS class name for the message block.
      blockMsgClass: 'blockMsg' ,

      // If an element is already blocked, ignore subsequent block calls (don't unblock and reblock).
      ignoreIfBlocked: false
    } ;


    // --- Private data and helper functions ---

    var pageBlock    = null ; // Reference to the page block message element.
    var pageBlockEls = [ ] ;  // List of focusable elements within a page block.


    /**
     * Installs the block UI on a given element.
     * @param {Element} el - The DOM element to block (or window for page block).
     * @param {object} opts - Options for the block.
     */
    function install ( el , opts ) {
      var css , themedCSS ;
      var full = ( el == window ) ; // Check if blocking the entire window.
      // Determine the message content.
      var msg = ( opts && opts . message !== undefined ? opts . message : undefined ) ;
      // Merge defaults with provided options.
      opts = $ . extend ( { } , $ . blockUI . defaults , opts || { } ) ;

      // Do not block if ignoreIfBlocked is true and the element is already blocked.
      if ( opts . ignoreIfBlocked && $ ( el ) . data ( 'blockUI.isBlocked' ) )
        return ;

      // Merge overlay CSS options.
      opts . overlayCSS = $ . extend ( { } , $ . blockUI . defaults . overlayCSS , opts . overlayCSS || { } ) ;
      // Merge general CSS options.
      css = $ . extend ( { } , $ . blockUI . defaults . css , opts . css || { } ) ;
      // If onOverlayClick is defined, change overlay cursor to pointer.
      if ( opts . onOverlayClick )
        opts . overlayCSS . cursor = 'pointer' ;

      // Merge themed CSS options.
      themedCSS = $ . extend ( { } , $ . blockUI . defaults . themedCSS , opts . themedCSS || { } ) ;
      // Re-evaluate message in case it was undefined.
      msg = msg === undefined ? opts . message : msg ;

      // If blocking the full page and a block already exists, remove it first.
      if ( full && pageBlock )
        remove ( window , { fadeOut : 0 } ) ;

      // If an existing element is used as the blocking content, capture its state
      // to restore it later when unblocking.
      if ( msg && typeof msg != 'string' && ( msg . parentNode || msg . jquery ) ) {
        var node = msg . jquery ? msg [ 0 ] : msg ;
        var data = { } ;
        $ ( el ) . data ( 'blockUI.history' , data ) ;
        data . el       = node ;
        data . parent   = node . parentNode ;
        data . display  = node . style . display ;
        data . position = node . style . position ;
        if ( data . parent )
          data . parent . removeChild ( node ) ;
      }

      // Store the onUnblock callback for later use.
      $ ( el ) . data ( 'blockUI.onUnblock' , opts . onUnblock ) ;
      var z = opts . baseZ ; // Get the base z-index.

      // BlockUI uses three layers:
      // 1. Iframe layer (lyr1): to suppress bleed-through of underlying content.
      // 2. Overlay layer (lyr2): provides opacity and a wait cursor.
      // 3. Message content layer (lyr3): displays the actual blocking message.
      var lyr1 , lyr2 , lyr3 , s ;

      // Create the iframe layer for IE or if forced.
      if ( msie || opts . forceIframe )
        lyr1 = $ ( '<iframe class="blockUI" style="z-index:' + ( z ++ ) + ';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="' + opts . iframeSrc + '"></iframe>' ) ;
      else
        lyr1 = $ ( '<div class="blockUI" style="display:none"></div>' ) ;

      // Create the overlay layer.
      if ( opts . theme )
        lyr2 = $ ( '<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:' + ( z ++ ) + ';display:none"></div>' ) ;
      else
        lyr2 = $ ( '<div class="blockUI blockOverlay" style="z-index:' + ( z ++ ) + ';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>' ) ;

      // Construct the message layer based on theme and full page blocking.
      if ( opts . theme && full ) {
        s = '<div class="blockUI ' + opts . blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:' + ( z + 10 ) + ';display:none;position:fixed">' ;
        if ( opts . title ) {
          s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + ( opts . title || '&nbsp;' ) + '</div>' ;
        }
        s += '<div class="ui-widget-content ui-dialog-content"></div>' ;
        s += '</div>' ;
      }
      else if ( opts . theme ) {
        s = '<div class="blockUI ' + opts . blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:' + ( z + 10 ) + ';display:none;position:absolute">' ;
        if ( opts . title ) {
          s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + ( opts . title || '&nbsp;' ) + '</div>' ;
        }
        s += '<div class="ui-widget-content ui-dialog-content"></div>' ;
        s += '</div>' ;
      }
      else if ( full ) {
        s = '<div class="blockUI ' + opts . blockMsgClass + ' blockPage" style="z-index:' + ( z + 10 ) + ';display:none;position:fixed"></div>' ;
      }
      else {
        s = '<div class="blockUI ' + opts . blockMsgClass + ' blockElement" style="z-index:' + ( z + 10 ) + ';display:none;position:absolute"></div>' ;
      }
      lyr3 = $ ( s ) ;

      // Apply styling to the message layer if a message is present.
      if ( msg ) {
        if ( opts . theme ) {
          lyr3 . css ( themedCSS ) ;
          lyr3 . addClass ( 'ui-widget-content' ) ;
        }
        else
          lyr3 . css ( css ) ; // Apply custom CSS for non-themed messages.
      }

      // Style the overlay layer.
      if ( ! opts . theme /*&& (!opts.applyPlatformOpacityRules)*/ )
        lyr2 . css ( opts . overlayCSS ) ;
      lyr2 . css ( 'position' , full ? 'fixed' : 'absolute' ) ;

      // Make the iframe layer transparent in IE.
      if ( msie || opts . forceIframe )
        lyr1 . css ( 'opacity' , 0.0 ) ;

      // Append all layers to the appropriate parent element (body or target element).
      var layers = [ lyr1 , lyr2 , lyr3 ] , $par = full ? $ ( 'body' ) : $ ( el ) ;
      $ . each ( layers , function ( ) {
        this . appendTo ( $par ) ;
      } ) ;

      // Enable draggable functionality for themed blocks if jQuery UI Draggable is available.
      if ( opts . theme && opts . draggable && $ . fn . draggable ) {
        lyr3 . draggable ( {
          handle : '.ui-dialog-titlebar' ,
          cancel : 'li'
        } ) ;
      }

      // Handle IE6/IE7 quirks mode issues, especially with activeX and scrolling.
      var expr = setExpr && ( ! $ . support . boxModel || $ ( 'object,embed' , full ? null : el ) . length > 0 ) ;
      if ( ie6 || expr ) {
        // Give body 100% height for full page blocks in IE6.
        if ( full && opts . allowBodyStretch && $ . support . boxModel )
          $ ( 'html,body' ) . css ( 'height' , '100%' ) ;

        // Fix IE6 issue when blocked element has a border width.
        if ( ( ie6 || ! $ . support . boxModel ) && ! full ) {
          var t = sz ( el , 'borderTopWidth' ) , l = sz ( el , 'borderLeftWidth' ) ;
          var fixT = t ? ' ( 0 - ' + t + ' ) ' : 0 ;
          var fixL = l ? ' ( 0 - ' + l + ' ) ' : 0 ;
        }

        // Simulate fixed position for layers in IE.
        $ . each ( layers , function ( i , o ) {
          var s = o [ 0 ] . style ;
          s . position = 'absolute' ;
          if ( i < 2 ) { // Iframe and overlay layers.
            if ( full )
              s . setExpression ( 'height' , 'Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:' + opts . quirksmodeOffsetHack + ') + "px"' ) ;
            else
              s . setExpression ( 'height' , 'this.parentNode.offsetHeight + "px"' ) ;
            if ( full )
              s . setExpression ( 'width' , 'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"' ) ;
            else
              s . setExpression ( 'width' , 'this.parentNode.offsetWidth + "px"' ) ;
            if ( fixL ) s . setExpression ( 'left' , fixL ) ;
            if ( fixT ) s . setExpression ( 'top' , fixT ) ;
          }
          else if ( opts . centerY ) { // Message layer, center vertically.
            if ( full ) s . setExpression ( 'top' , ' ( document.documentElement.clientHeight || document.body.clientHeight ) / 2 - ( this.offsetHeight / 2 ) + ( blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop ) + "px"' ) ;
            s . marginTop = 0 ;
          }
          else if ( ! opts . centerY && full ) { // Message layer, top position for full page.
            var top = ( opts . css && opts . css . top ) ? parseInt ( opts . css . top , 10 ) : 0 ;
            var expression = ' ( ( document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop ) + ' + top + ' ) + "px"' ;
            s . setExpression ( 'top' , expression ) ;
          }
        } ) ;
      }

      // Display the message content.
      if ( msg ) {
        if ( opts . theme )
          lyr3 . find ( '.ui-widget-content' ) . append ( msg ) ;
        else
          lyr3 . append ( msg ) ; // Append the message directly if not themed.
        if ( msg . jquery || msg . nodeType )
          $ ( msg ) . show ( ) ;
      }

      // Show the iframe layer if needed.
      if ( ( msie || opts . forceIframe ) && opts . showOverlay )
        lyr1 . show ( ) ;

      // Handle fade-in animation.
      if ( opts . fadeIn ) {
        var cb = opts . onBlock ? opts . onBlock : noOp ;
        var cb1 = ( opts . showOverlay && ! msg ) ? cb : noOp ;
        var cb2 = msg ? cb : noOp ;
        if ( opts . showOverlay )
          lyr2 . _fadeIn ( opts . fadeIn , cb1 ) ;
        if ( msg )
          lyr3 . _fadeIn ( opts . fadeIn , cb2 ) ;
      }
      else {
        // If no fade-in, just show the layers.
        if ( opts . showOverlay )
          lyr2 . show ( ) ;
        if ( msg )
          lyr3 . show ( ) ;
        if ( opts . onBlock )
          opts . onBlock ( ) ;
      }

      // Bind key and mouse events according to options.
      bind ( 1 , el , opts ) ;

      // For full page blocks, store references and potentially focus an input.
      if ( full ) {
        pageBlock    = lyr3 [ 0 ] ;
        pageBlockEls = $ ( opts . focusableElements , pageBlock ) ;
        if ( opts . focusInput )
          setTimeout ( focus , 20 ) ;
      }
      else
        // Center the message block for element blocks.
        center ( lyr3 [ 0 ] , opts . centerX , opts . centerY ) ;

      // Set up auto-unblock if a timeout is specified.
      if ( opts . timeout ) {
        var to = setTimeout ( function ( ) {
          if ( full )
            $ . unblockUI ( opts ) ;
          else
            $ ( el ) . unblock ( opts ) ;
        } , opts . timeout ) ;
        $ ( el ) . data ( 'blockUI.timeout' , to ) ;
      }
    }


    /**
     * Removes the block UI from a given element.
     * @param {Element} el - The DOM element to unblock (or window for page unblock).
     * @param {object} opts - Options for the unblock.
     */
    function remove ( el , opts ) {
      var count ;
      var full = ( el == window ) ;
      var $el  = $ ( el ) ;
      var data = $el . data ( 'blockUI.history' ) ;
      var to   = $el . data ( 'blockUI.timeout' ) ;

      // Clear any existing auto-unblock timeout.
      if ( to ) {
        clearTimeout ( to ) ;
        $el . removeData ( 'blockUI.timeout' ) ;
      }

      // Merge defaults with provided options.
      opts = $ . extend ( { } , $ . blockUI . defaults , opts || { } ) ;
      bind ( 0 , el , opts ) ; // Unbind events.

      // Restore the onUnblock callback if it was set.
      if ( opts . onUnblock === null ) {
        opts . onUnblock = $el . data ( 'blockUI.onUnblock' ) ;
        $el . removeData ( 'blockUI.onUnblock' ) ;
      }

      var els ;
      // Select the blockUI elements to remove.
      if ( full ) // Handles odd field errors in IE6/7.
        els = $ ( 'body' ) . children ( ) . filter ( '.blockUI' ) . add ( 'body > .blockUI' ) ;
      else
        els = $el . find ( '>.blockUI' ) ;

      // Fix cursor issue by resetting it.
      if ( opts . cursorReset ) {
        if ( els . length > 1 )
          els [ 1 ] . style . cursor = opts . cursorReset ;
        if ( els . length > 2 )
          els [ 2 ] . style . cursor = opts . cursorReset ;
      }

      // Clear page block references if unblocking the full page.
      if ( full )
        pageBlock = pageBlockEls = null ;

      // Handle fade-out animation.
      if ( opts . fadeOut ) {
        count = els . length ;
        els . fadeOut ( opts . fadeOut , function ( ) {
          if ( --count === 0 )
            reset ( els , data , opts , el ) ;
        } ) ;
      }
      else
        // If no fade-out, just reset immediately.
        reset ( els , data , opts , el ) ;
    }

    // This section contains internal helper functions for the BlockUI plugin.

    /**
     * Resets the blocked elements and restores their original state.
     * @param {jQuery} els - The jQuery collection of block UI elements to remove.
     * @param {object} data - Stored historical data about the blocked element.
     * @param {object} opts - Options used for blocking.
     * @param {Element} el - The original element that was blocked.
     */
    function reset ( els , data , opts , el ) {
      // Remove the blockUI elements from the DOM.
      els . remove ( ) ;

      // If historical data exists, restore the original element's state.
      if ( data && data . el ) {
        data . el . style . display  = data . display ;
        data . el . style . position = data . position ;
        if ( data . parent )
          data . parent . appendChild ( data . el ) ;
        $ ( el ) . removeData ( 'blockUI.history' ) ;
      }

      // If the element's position was changed to relative, revert it to static.
      if ( $ ( el ) . data ( 'blockUI.static' ) ) {
        $ ( el ) . css ( 'position' , 'static' ) ;
      }

      // Call the onUnblock callback if provided.
      if ( typeof opts . onUnblock == 'function' )
        opts . onUnblock ( el , opts ) ;
    }

    /**
     * Gets the size of a CSS property for an element.
     * @param {Element} el - The DOM element.
     * @param {string} prop - The CSS property name.
     * @returns {number} - The size in pixels.
     */
    function sz ( el , prop ) {
      return parseInt ( $ . css ( el , prop ) , 10 ) || 0 ;
    }

    /**
     * Centers the message block within its parent.
     * @param {Element} el - The message block element.
     * @param {boolean} centerX - Whether to center horizontally.
     * @param {boolean} centerY - Whether to center vertically.
     */
    function center ( el , centerX , centerY ) {
      var $el = $ ( el ) ;
      var $parent = $el . parent ( ) ;

      // Get dimensions of the message and its parent.
      var p = $el . outerWidth ( ) ;
      var q = $el . outerHeight ( ) ;
      var z = $parent . width ( ) ;
      var A = $parent . height ( ) ;

      // Calculate new position.
      var top    = ( centerY ? ( A - q ) / 2 : 0 ) + sz ( $parent [ 0 ] , 'borderTopWidth' ) ;
      var left   = ( centerX ? ( z - p ) / 2 : 0 ) + sz ( $parent [ 0 ] , 'borderLeftWidth' ) ;

      // Apply the new position.
      $el . css ( { top : top + 'px' , left : left + 'px' } ) ;
    }

    /**
     * Focuses the first focusable element within the blocked area.
     */
    function focus ( ) {
      if ( pageBlockEls && pageBlockEls . length > 0 ) {
        pageBlockEls . eq ( 0 ) . focus ( ) ;
      }
    }

    /**
     * Binds or unbinds events to prevent interaction with blocked content.
     * @param {number} go - 1 to bind, 0 to unbind.
     * @param {Element} el - The element (or window) being blocked/unblocked.
     * @param {object} opts - Options for blocking.
     */
    function bind ( go , el , opts ) {
      var full = ( el == window ) ;
      var $el  = $ ( el ) ;

      // If events are not bound, return.
      if ( ! opts . bindEvents ) {
        return ;
      }

      // If binding events (go=1).
      if ( go ) {
        // Mark the element as blocked.
        $el . data ( 'blockUI.isBlocked' , true ) ;
        // Bind keydown event to prevent tabbing out of the blocked area.
        $el . bind ( 'keydown.blockUI' , function ( e ) {
          if ( opts . constrainTabKey && full && e . keyCode === 9 ) {
            if ( pageBlock && pageBlockEls && pageBlockEls . length > 0 ) {
              var $target = $ ( e . target || e . srcElement ) ;
              var first = pageBlockEls [ 0 ] ;
              var last  = pageBlockEls [ pageBlockEls . length - 1 ] ;
              if ( e . shiftKey ) {
                if ( $target [ 0 ] === first ) {
                  last . focus ( ) ;
                  return false ;
                }
              } else {
                if ( $target [ 0 ] === last ) {
                  first . focus ( ) ;
                  return false ;
                }
              }
            }
          }
          return true ;
        } ) ;

        // Bind mouse events to the overlay for onOverlayClick callback.
        $el . bind ( 'mousedown.blockUI' , function ( e ) {
          if ( full && opts . onOverlayClick && $ ( e . target ) . is ( '.blockOverlay' ) ) {
            opts . onOverlayClick . call ( window , e ) ;
            return false ;
          }
        } ) ;
      }
      else { // If unbinding events (go=0).
        // Mark the element as unblocked.
        $el . data ( 'blockUI.isBlocked' , false ) ;
        // Unbind all blockUI related events.
        $el . unbind ( 'keydown.blockUI mousedown.blockUI' ) ;
      }
    }

    // If jQuery is available, call setup immediately.
    if ( typeof $ == 'function' ) {
      setup ( $ ) ;
    }
    // If not, wait for jQuery to be ready.
    else {
      // In a CommonJS-like environment, `module.exports` might be defined.
      // In a browser, `jQuery` might be defined later.
      // This part ensures `setup` is called when jQuery is available.
      // A more robust way would be to check `window.jQuery` or `window.$`.
      var tryAgain = window . jQuery ;
      tryAgain ( function ( ) {
        setup ( tryAgain ) ;
      } ) ;
    }

} ) ( ) ; // Immediately invoke the anonymous function.