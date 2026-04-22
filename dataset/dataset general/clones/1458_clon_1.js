/*
 * StyleDocco Preview and Rendering Logic
 * ===================================================================
 * This module is responsible for taking raw HTML code from designated
 * preview textareas and dynamically rendering it within iframes.
 * It also applies specified preview CSS and JavaScript resources
 * to ensure accurate representation of the documented styles and components.
 */

( function() {

  'use strict' ; // Enforce strict mode for cleaner, safer code.

  // Prevent recursive iframe loading. If the current page is already a
  // preview (indicated by `#__preview__` hash or a `data:` protocol),
  // we should terminate execution to avoid infinite loops within iframes.
  // This is particularly relevant in WebKit-based browsers where `location.href`
  // might be used as the iframe source.
  if ( location.hash === '#__preview__' || location.protocol === 'data:' ) {
    return ;
  }

  /*
   * Utility Helper Functions
   * These functions extend Array.prototype methods to work with NodeLists,
   * which are commonly returned by DOM query methods.
   */
  var forEach = function ( arr , it ) {
    return Array . prototype . forEach . call ( arr , it ) ;
  } ;


  var invoke = function ( obj , fn ) {
    var args = Array . prototype . slice . call ( arguments , 2 ) ;
    return map ( obj , function ( value ) {
      return ( isFunction ( fn ) ? fn || value : value [ fn ] ) . apply ( value , args ) ;
    } ) ;
  } ;


  var isFunction = function ( obj ) {
    return Object . prototype . toString . call ( obj ) === '[object Function]' ;
  } ;


  var map = function ( arr , it ) {
    return Array . prototype . map . call ( arr , it ) ;
  } ;


  var pluck = function ( arr , prop ) {
    return map ( arr , function ( item ) {
      return item [ prop ] ;
    } ) ;
  } ;


  /*
   * keyvalParse: Parses a semicolon-separated string of key-value pairs.
   * Typically used for parsing cookie strings.
   * Example: "key1=value1; key2=value2" => { key1: "value1", key2: "value2" }
   */
  var keyvalParse = function ( str ) {
    var obj = { } ;
    var pairs = str . split ( ';' ) ;
    for ( var i = 0 ; pairs . length > i ; i ++ ) {
      var kvs = pairs [ i ] . trim ( ) . split ( '=' ) ;
      obj [ kvs [ 0 ] ] = kvs [ 1 ] ;
    }
    return obj ;
  } ;


  var removeClass = function ( els , className ) {
    return invoke ( pluck ( els , 'classList' ) , 'remove' , className ) ;
  } ;


  var postMessage = function ( target , msg ) {
    target . contentDocument . defaultView . postMessage ( msg , '*' ) ;
  } ;


  // Cache references to the <head> and <body> elements for efficiency.
  var headEl = document . getElementsByTagName ( 'head' ) [ 0 ] ;
  var bodyEl = document . getElementsByTagName ( 'body' ) [ 0 ] ;

  // Extract preview-specific styles embedded in <style type="text/preview"> tags
  // located within the document's head. These will be injected into iframes.
  var styles = pluck (
    headEl . querySelectorAll ( 'style[type="text/preview"]' ) ,
    'innerHTML'
  ) . join ( '' ) ;

  // Extract preview-specific scripts embedded in <script type="text/preview"> tags
  // from the head. These will also be injected into iframes.
  var scripts = pluck (
    headEl . querySelectorAll ( 'script[type="text/preview"]' ) ,
    'innerHTML'
  ) . join ( '' ) ;

  // Construct the URL for internal iframe previews.
  // This ensures the iframe loads with the `#__preview__` hash.
  var previewUrl = location . href . split ( '#' ) [ 0 ] + '#__preview__' ;


  /*
   * Check for `data:` URI same-origin support.
   * Some browsers might not treat `data:` URIs as same-origin, which affects
   * how we can interact with their contentDocument.
   * We create a temporary iframe to test this capability.
   */
  var iframeEl = document . createElement ( 'iframe' ) ;
  iframeEl . src = 'data:text/html,' ;
  bodyEl . appendChild ( iframeEl ) ;

  iframeEl . addEventListener ( 'load' , function ( ) {
    var support = { sameOriginDataUri : false } ;
    try {
      // Attempt to access contentDocument. If it throws an error,
      // same-origin policy is likely preventing access.
      this . contentDocument ;
      if ( ! this . contentDocument ) {
        support . sameOriginDataUri = false ;
      }
    } catch ( e ) {
      support . sameOriginDataUri = false ;
    }
    // Clean up the temporary iframe.
    this . parentNode . removeChild ( this ) ;

    // Iterate over all <textarea> elements in the body, assuming they contain
    // code that needs to be rendered as previews.
    forEach ( bodyEl . getElementsByTagName ( 'textarea' ) , function ( codeEl , idx ) {
      addIframe ( codeEl , support , idx ) ; // Render each code block in an iframe.
      resizeableButtons ( ) ; // Initialize resize handlers for preview buttons.
      autoResizeTextArea ( codeEl ) ; // Enable auto-resizing for the textarea itself.
    } ) ;
  } ) ;


  /*
   * addIframe: Creates and appends an iframe for a given code element.
   * This function handles the dynamic creation of iframes and the injection
   * of code, styles, and scripts into them.
   */
  var addIframe = function ( codeEl , support , iframeId ) {
    var previewEl , resizeableEl , iframeEl ;

    previewEl = document . createElement ( 'div' ) ;
    previewEl . appendChild ( resizeableEl = document . createElement ( 'div' ) ) ;
    previewEl . className = 'bs-example' ; // Bootstrap-style example wrapper

    resizeableEl . appendChild ( iframeEl = document . createElement ( 'iframe' ) ) ;
    resizeableEl . className = 'resizeable' ; // Class for resize handlers

    iframeEl . setAttribute ( 'scrolling' , 'no' ) ;
    iframeEl . name = 'iframe' + iframeId ++ ; // Assign a unique name for postMessage targeting.

    iframeEl . addEventListener ( 'load' , function ( ) {
      var htmlEl , bodyEl , scriptEl , styleEl , headEl , oldHeadEl , doc ;
      doc = this . contentDocument ; // Get the iframe's document object.

      // If loading a data URI in a browser without same-origin data URI support,
      // and the source is not the `previewUrl` (which is used as a fallback),
      // then we abort as we cannot safely manipulate its content.
      if ( ! support . sameOriginDataUri && this . src !== previewUrl ) {
        return ;
      } else if ( this . src === previewUrl ) {
        // If the iframe loaded the `previewUrl` (our internal fallback),
        // we replace its entire HTML content with the code from the textarea.
        htmlEl = doc . createElement ( 'html' ) ;
        htmlEl . appendChild ( doc . createElement ( 'head' ) ) ; // Add a head element.
        htmlEl . appendChild ( bodyEl = doc . createElement ( 'body' ) ) ; // Add a body element.
        bodyEl . innerHTML = codeEl . textContent ; // Inject the actual code.
        doc . replaceChild ( htmlEl , doc . documentElement ) ; // Replace the default document.
      }

      // Now, inject the global preview scripts and styles into the iframe's head.
      headEl = doc . createElement ( 'head' ) ;
      headEl . appendChild ( styleEl = doc . createElement ( 'style' ) ) ;
      headEl . appendChild ( scriptEl = doc . createElement ( 'script' ) ) ;

      scriptEl . textContent = scripts ; // Global preview JavaScript
      styleEl . textContent = styles ;   // Global preview CSS

      oldHeadEl = doc . getElementsByTagName ( 'head' ) [ 0 ] ;
      oldHeadEl . parentNode . replaceChild ( headEl , oldHeadEl ) ; // Replace the existing head.

      // After content is loaded and injected, request the iframe's height
      // to adjust the parent container.
      postMessage ( this , 'getHeight' ) ;
    } ) ;

    var iframeSrc ;
    // Determine the iframe's `src` attribute.
    if ( ! support . sameOriginDataUri ) {
      // If data URI same-origin is not supported, use the `previewUrl` fallback.
      iframeSrc = previewUrl ;
    } else {
      // Otherwise, construct a `data:` URI directly with the HTML content.
      // This allows direct manipulation of the iframe's contentDocument.
      iframeSrc = 'data:text/html;charset=utf-8,' +
        encodeURIComponent (
          '<!doctype html><html><head></head></body>' +
          codeEl . textContent
        ) ;
    }
    iframeEl . setAttribute ( 'src' , iframeSrc ) ;

    // Event handlers for when the code in the textarea changes.
    // This updates the iframe's content dynamically.
    var codeDidChange = function ( ) {
      iframeEl . contentDocument . body . innerHTML = this . value ;
      postMessage ( iframeEl , 'getHeight' ) ; // Request new height after content update.
    } ;

    codeEl . addEventListener ( 'keypress' , codeDidChange ) ;
    codeEl . addEventListener ( 'keyup' , codeDidChange ) ;

    /*
     * The following commented-out block is for potential future integration
     * with a syntax highlighter, wrapping the `codeEl` in a `highlight` div.
     * For now, it remains commented out as per project requirements.
     *
     var highlight ;
     highlight = document . createElement ( 'div' ) ;
     highlight . appendChild ( codeEl ) ;
     highlight . className = 'highlight' ;
     codeEl . parentNode . insertBefore ( previewEl , highlight ) ;
     */

    // Insert the preview element (which contains the iframe) before the textarea.
    codeEl . parentNode . insertBefore ( previewEl , codeEl ) ;
  } ;


  /*
   * autoResizeTextArea: Dynamically adjusts the height of a textarea
   * based on its content, preventing scrollbars unless content exceeds
   * a maximum height.
   */
  var autoResizeTextArea = function ( el ) {
    var mirrorEl = document . createElement ( 'div' ) ;
    mirrorEl . className = 'preview-code' ; // Use the same styling as the textarea.
    mirrorEl . style . position = 'absolute' ;
    mirrorEl . style . top = 0 ;
    mirrorEl . style . left = '-9999px' ; // Position off-screen.
    bodyEl . appendChild ( mirrorEl ) ;

    // Get the maximum height defined for the textarea.
    var maxHeight = parseInt (
      window . getComputedStyle ( el ) . getPropertyValue ( 'max-height' ) ,
      10
    ) ;

    var codeDidChange = function ( ev ) {
      mirrorEl . textContent = this . value + '\n' ; // Mirror the textarea content.
      var height = mirrorEl . offsetHeight + 2 ; // Account for potential borders.

      if ( height >= maxHeight ) {
        this . style . overflow = 'auto' ; // Enable scrollbar if max height is reached.
      } else {
        this . style . overflow = 'hidden' ; // Hide scrollbar otherwise.
      }
      // Set the textarea's height, adding extra padding.
      this . style . height = ( mirrorEl . offsetHeight + 2 + 16 ) + 'px' ;
    } ;

    el . addEventListener ( 'keypress' , codeDidChange ) ; // Update on keypress.
    el . addEventListener ( 'keyup' , codeDidChange ) ;   // Update on keyup.

    codeDidChange . call ( el ) ; // Initial height adjustment.
  } ;


  /*
   * resizeableButtons: Manages the functionality of buttons that control
   * the width of the preview iframes. It also handles postMessage events
   * for iframe height adjustments.
   */
  var resizeableButtons = function ( ) {
    var settingsEl = bodyEl . getElementsByClassName ( 'settings' ) [ 0 ] ;
    var resizeableEls = bodyEl . getElementsByClassName ( 'resizeable' ) ;
    var resizeableElOffset = 30 ; // Padding compensation for `.resizeable` elements.

    var resizePreviews = function ( width ) {
      document . cookie = 'preview-width=' + width ; // Store the preferred width in a cookie.
      forEach ( resizeableEls , function ( el ) {
        if ( width === 'auto' ) {
          width = el . parentNode . offsetWidth ; // Use parent width for 'auto'.
        }
        el . style . width = width + 'px' ; // Apply the new width.

        /*
         * TODO: Implement CSS transitions for smoother resizing and
         * update iframe height *after* the `transitionend` event fires.
         * This would improve visual fluidity during width changes.
         */
        postMessage ( el . getElementsByTagName ( 'iframe' ) [ 0 ] , 'getHeight' ) ;
      } ) ;
    } ;

    // On page load, attempt to restore preview width from a cookie.
    var previewWidth = keyvalParse ( document . cookie ) [ 'preview-width' ] ;
    if ( previewWidth ) {
      resizePreviews ( previewWidth ) ;
      removeClass ( settingsEl . getElementsByClassName ( 'is-active' ) , 'is-active' ) ;
      var btn = settingsEl . querySelector ( 'button[data-width="' + previewWidth + '"]' ) ;
      if ( btn ) {
        btn . classList . add ( 'is-active' ) ;
      }
    }

    // Listen for messages from iframes (e.g., to report their content height).
    window . addEventListener ( 'message' , function ( ev ) {
      if ( ev . data == null || ! ev . source ) {
        return ;
      }
      var data = ev . data ;
      // Find the specific iframe that sent the message using its name.
      var sourceFrameEl = document . getElementsByName ( ev . source . name ) [ 0 ] ;
      // If height data is present and the source iframe is found,
      // adjust the parent container's height.
      if ( data . height != null && sourceFrameEl ) {
        sourceFrameEl . parentNode . style . height = ( data . height + resizeableElOffset ) + 'px' ;
      }
    } , false ) ;

    // Initialize resizing buttons if they exist and there are resizeable elements.
    if ( settingsEl && resizeableEls . length > 0 ) {
      settingsEl . hidden = false ; // Make settings visible.
      settingsEl . addEventListener ( 'click' , function ( event ) {
        var tagName = event . target . tagName . toLowerCase ( ) ;
        var btn ;
        if ( tagName === 'button' ) {
          btn = event . target ;
        } else if ( tagName === 'svg' ) {
          btn = event . target . parentNode ;
        } else {
          return ; // Not a button or SVG inside a button.
        }
        event . preventDefault ( ) ; // Prevent default button action.

        // Deactivate all currently active buttons.
        removeClass ( settingsEl . getElementsByClassName ( 'is-active' ) , 'is-active' ) ;
        btn . classList . add ( 'is-active' ) ; // Activate the clicked button.
        var width = btn . dataset . width ; // Get the target width from data attribute.
        resizePreviews ( width ) ; // Apply the new width to all previews.
      } ) ;
    }
  } ;

} ) ( ) ; // Immediately-invoked function expression (IIFE) closure.