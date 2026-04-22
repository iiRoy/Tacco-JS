/**
 * @preserve HTML5 Shiv v3.6.2 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
 * This is a highly modified version for demonstration purposes.
 * All logic and structure remain identical, only whitespace and comments are altered.
 * Original source: https://github.com/aFarkas/html5shiv
 */
; (  function ( window , document ) {

/*jshint evil:true */ /* This JSHint directive is kept as-is. */


  /**
   * Holds the current version string.
   * This variable stores the version number for the HTML5 Shiv utility.
   * @type {string}
   */
    var version = '3.6.2' ;

  /**
   * Options object, potentially pre-set by the user.
   * We check `window.html5` for any custom configurations.
   * @type {Object}
   */
    var options = window . html5 || {} ;

  /**
   * A regular expression to identify elements that should be skipped during shiv processing.
   * These elements often cause issues when their structure is altered.
   * This list includes common form elements, media, and object tags.
   */
    var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i ;

  /**
   * Another regex, specifically for elements that can be safely cloned in older IE versions.
   * Not all elements behave well when cloned, especially in IE's DOM.
   * This helps avoid crashes or unexpected behavior.
   */
    var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i ;

  /**
   * A flag to determine if the browser natively supports HTML5 styling.
   * This is typically checked by creating a dummy element and inspecting its properties.
   * Will be set after the initial feature detection.
   */
    var supportsHtml5Styles ;



  /**
   * Expando property name.
   * Used to attach data directly to DOM objects without polluting the global namespace.
   * This allows for unique identification across different documents or re-shiving scenarios.
   */
    var expando = '_html5shiv' ;

  /**
   * Incremental ID for the expando property.
   * Ensures uniqueness for each document's stored data.
   */
    var expanID = 0 ;

  /**
   * Cache for expando data associated with each document.
   * Maps an expando ID to a data object for a specific document.
   */
    var expandoData = {} ;


  /**
   * A boolean flag indicating whether the browser supports unknown elements.
   * This is crucial for determining if shiv methods are actually necessary.
   */
    var supportsUnknownElements ;


  // Self-executing function for initial feature detection.
  // This block runs immediately to set up the `supportsHtml5Styles` and `supportsUnknownElements` flags.
  (function( ) {
    try {
        var a = document.createElement('a') ; // Create a dummy element for testing.
        a.innerHTML = '<xyz></xyz>' ; // Assign innerHTML with an unknown element.
        // Check for the 'hidden' property to infer basic HTML5 style support.
        // If 'hidden' exists, it's a good sign for modern HTML5 style handling.
        supportsHtml5Styles = ('hidden' in a) ;

        // Determine if the browser can handle unknown elements correctly.
        // This is a complex check, including cloning and fragment creation.
        supportsUnknownElements = a.childNodes.length == 1 || (function( ) {
          // Inner self-executing function to perform more detailed checks.
          // This part is for browsers that might report childNodes.length == 1 but still fail.
          ( document.createElement ) ( 'a' ) ; // Just a redundant call to createElement, might be for side-effects or compatibility.
          var frag = document.createDocumentFragment() ; // Create a document fragment.
          return (
            typeof frag.cloneNode == 'undefined' ||           // Check if cloneNode is available.
            typeof frag.createDocumentFragment == 'undefined' || // Check fragment creation.
            typeof frag.createElement == 'undefined'          // Check createElement on fragment.
          ) ;
        }()) ; // Invoke the inner function.
    } catch ( e ) { // If any of the above operations fail (e.g., in very old browsers).
      // Assign false positives to ensure the shiv attempts to work.
      // If detection itself fails, we assume shiving is needed.
      supportsHtml5Styles = true ;
      supportsUnknownElements = true ;
    }

  }()) ; // Invoke the outer function.

  /*--------------------------------------------------------------------------*/
  /* Section separator: Core utility functions. */

  /**
   * Dynamically injects a stylesheet into the document's head.
   * This is used to apply default HTML5 element display styles for older IE versions.
   *
   * @private
   * @param {Document} ownerDocument The document object to which the style sheet will be added.
   * @param {String} cssText The CSS rules as a string.
   * @returns {StyleSheet} The created style element.
   */
  function addStyleSheet( ownerDocument , cssText ) {
    var p = ownerDocument.createElement ( 'p' ) , // Create a temporary paragraph element.
        parent = ownerDocument.getElementsByTagName ( 'head' ) [0] || ownerDocument.documentElement ; // Get head or root.

    p.innerHTML = 'x<style>' + cssText + '</style>' ; // Embed the style within the temporary element.
    // Insert the style element into the head or document element.
    return parent.insertBefore ( p.lastChild , parent.firstChild ) ;
  }

  /**
   * Retrieves the list of HTML5 elements that need shiving.
   * This list is either a user-defined string/array or a default set.
   *
   * @private
   * @returns {Array} An array of element node names.
   */
  function getElements( ) {
    var elements = html5.elements ; // Access the elements property from the html5 configuration object.
    // Convert a space-separated string of elements into an array if it's a string.
    return typeof elements == 'string' ? elements.split(' ') : elements ;
  }

    /**
   * Fetches or initializes the expando data for a given document.
   * Each document gets its own unique data cache.
   *
   * @private
   * @param {Document} ownerDocument The document for which to retrieve data.
   * @returns {Object} An object containing cached data for the document.
   */
  function getExpandoData( ownerDocument ) {
    var data = expandoData [ ownerDocument [ expando ] ] ; // Try to retrieve existing data using the expando ID.
    if ( ! data ) { // If no data exists for this document, initialize it.
        data = {} ; // Create a new data object.
        expanID++ ; // Increment the global expando ID counter.
        ownerDocument [ expando ] = expanID ; // Assign the new ID to the document's expando property.
        expandoData [ expanID ] = data ; // Store the new data object in the global cache.
    }
    return data ; // Return the (existing or new) data object.
  }

  /**
   * Creates a "shived" element, ensuring compatibility with older browsers.
   * This function intelligently uses caching and native methods where possible.
   *
   * @memberOf html5
   * @param {String} nodeName The name of the element to create (e.g., 'article').
   * @param {Document} ownerDocument The context document. Defaults to the global `document`.
   * @param {Object} data Optional expando data for the document.
   * @returns {Object} The created shived element.
   */
  function createElement( nodeName , ownerDocument , data ){
    if ( ! ownerDocument ) { // If ownerDocument is not provided, use the global document.
        ownerDocument = document ;
    }
    if ( supportsUnknownElements ) { // If the browser natively supports unknown elements, just use the native method.
        return ownerDocument.createElement ( nodeName ) ;
    }
    if ( ! data ) { // If data is not provided, retrieve it using getExpandoData.
        data = getExpandoData ( ownerDocument ) ;
    }
    var node ; // Variable to hold the created node.

    if ( data.cache [ nodeName ] ) { // Check if the element is already in the cache.
        node = data.cache [ nodeName ] . cloneNode ( ) ; // Clone from cache if available.
    } else if ( saveClones.test ( nodeName ) ) { // If it's a "safe to clone" element.
        // Create, cache, and then clone the element.
        node = ( data.cache [ nodeName ] = data.createElem ( nodeName ) ) . cloneNode ( ) ;
    } else { // For other elements, just create it directly.
        node = data.createElem ( nodeName ) ;
    }

    // Special handling for IE < 9 to avoid issues with certain elements in fragments.
    // Elements like 'link' or 'script' can cause crashes or unexpected execution.
    // We append to a fragment only if it can have children and is not a "skip" element.
    return node.canHaveChildren && ! reSkip.test ( nodeName ) ? data.frag.appendChild ( node ) : node ;
  }

  /**
   * Creates a "shived" DocumentFragment, ensuring compatibility for older browsers.
   * It populates the fragment with shived elements from the `getElements` list.
   *
   * @memberOf html5
   * @param {Document} ownerDocument The context document. Defaults to the global `document`.
   * @param {Object} data Optional expando data for the document.
   * @returns {Object} The shived DocumentFragment.
   */
  function createDocumentFragment( ownerDocument , data ){
    if ( ! ownerDocument ) { // Default to global document if none provided.
        ownerDocument = document ;
    }
    if ( supportsUnknownElements ) { // If native support exists, use it directly.
        return ownerDocument.createDocumentFragment ( ) ;
    }
    data = data || getExpandoData ( ownerDocument ) ; // Get expando data, initializing if necessary.
    var clone = data.frag.cloneNode ( ) , // Clone the pre-shived fragment.
        i = 0 , // Loop counter.
        elems = getElements ( ) , // Get the list of HTML5 elements.
        l = elems.length ; // Length of the elements array.
    for ( ; i < l ; i++ ) { // Iterate through the elements.
        clone.createElement ( elems [ i ] ) ; // Create each element within the cloned fragment.
    }
    return clone ; // Return the populated fragment.
  }

  /**
   * Overwrites the `createElement` and `createDocumentFragment` methods of the document
   * to ensure that HTML5 elements are properly shived.
   *
   * @private
   * @param {Document|DocumentFragment} ownerDocument The document whose methods will be shived.
   * @param {Object} data Document-specific expando data.
   */
  function shivMethods( ownerDocument , data ) {
    if ( ! data.cache ) { // If the cache doesn't exist for this document, initialize it.
        data.cache = {} ; // Initialize element cache.
        data.createElem = ownerDocument.createElement ; // Store the original createElement method.
        data.createFrag = ownerDocument.createDocumentFragment ; // Store the original createDocumentFragment method.
        data.frag = data.createFrag ( ) ; // Create a base document fragment.
    }


    ownerDocument.createElement = function ( nodeName ) {
      // Abort shiv if `shivMethods` is explicitly set to false in html5 options.
      if ( ! html5.shivMethods ) {
          return data.createElem ( nodeName ) ; // Return the original createElement behavior.
      }
      // Otherwise, use our custom shived createElement.
      return createElement ( nodeName , ownerDocument , data ) ;
    } ;

    // Overwrite createDocumentFragment using a Function constructor for dynamic generation.
    // This allows for unrolling createElement calls for better performance in some contexts.
    ownerDocument.createDocumentFragment = Function ( 'h,f' , 'return function(){' +
      'var n=f.cloneNode(),c=n.createElement;' + // Clone the base fragment, get its createElement.
      'h.shivMethods&&(' + // If shivMethods is enabled...
        // Unroll the `createElement` calls for all shivable elements.
        getElements ( ) . join ( ) . replace ( /\w+/g , function ( nodeName ) {
          data.createElem ( nodeName ) ; // Create element using original method (for caching).
          data.frag.createElement ( nodeName ) ; // Also create on the internal fragment.
          return 'c("' + nodeName + '")' ; // Return a string that calls the fragment's createElement.
        } ) +
      ') ; return n}' // End of the function body.
    ) ( html5 , data.frag ) ; // Pass html5 and the base fragment as arguments to the generated function.
  }

  /*--------------------------------------------------------------------------*/
  /* Section separator: Document shiving. */

  /**
   * The main function to shiv a given document.
   * Applies CSS fixes and method overwrites if necessary.
   *
   * @memberOf html5
   * @param {Document} ownerDocument The document to be shived. Defaults to the global `document`.
   * @returns {Document} The shived document.
   */
  function shivDocument( ownerDocument ) {
    if ( ! ownerDocument ) { // Use global document if no specific document is provided.
        ownerDocument = document ;
    }
    var data = getExpandoData ( ownerDocument ) ; // Get document-specific expando data.

    // Apply HTML5 CSS styles if shivCSS is enabled, styles are not supported, and CSS hasn't been added yet.
    if ( html5.shivCSS && ! supportsHtml5Styles && ! data.hasCSS ) {
      data.hasCSS = !! addStyleSheet ( ownerDocument ,
        // CSS rules to correct block display for HTML5 elements in older IE.
        'article,aside,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
        // Basic styling for 'mark' element.
        'mark{background:#FF0;color:#000}' +
        // Hide 'template' element by default.
        'template{display:none}'
      ) ;
    }
    if ( ! supportsUnknownElements ) { // If the browser doesn't support unknown elements, overwrite methods.
      shivMethods ( ownerDocument , data ) ;
    }
    return ownerDocument ; // Return the (potentially shived) document.
  }

  /*--------------------------------------------------------------------------*/
  /* Section separator: API exposure and initial shiving. */

  /**
   * The `html5` object is exposed globally to allow for configuration and
   * detection of shiving status, especially useful for iframes.
   * @type {Object}
   * @example
   * // Options can be set before the script is included.
   * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
   */
  var html5 = {

    /**
     * Defines the HTML5 elements that should be shived.
     * Can be an array of strings or a space-separated string.
     * Defaults to a comprehensive list of HTML5 semantic elements.
     * @memberOf html5
     * @type {Array|String}
     */
    'elements' : options.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary template time video' ,

    /**
     * The current version of html5shiv.
     * @type {string}
     */
    'version' : version ,

    /**
     * A flag to control whether the HTML5 default stylesheet should be inserted.
     * Defaults to true unless explicitly set to false in options.
     * @memberOf html5
     * @type {Boolean}
     */
    'shivCSS' : ( options.shivCSS !== false ) ,

    /**
     * Indicates if the browser natively supports creating unknown/HTML5 elements.
     * This property is set during the initial feature detection phase.
     * @memberOf html5
     * @type {boolean}
     */
    'supportsUnknownElements' : supportsUnknownElements ,

    /**
     * A flag to control whether the document's `createElement` and `createDocumentFragment`
     * methods should be overwritten. Defaults to true unless explicitly set to false.
     * @memberOf html5
     * @type {Boolean}
     */
    'shivMethods' : ( options.shivMethods !== false ) ,

    /**
     * Describes the type of `html5` object, useful for debugging or conditional logic.
     * Initially 'default', later 'default print' if print shiv is active.
     * @memberOf html5
     * @type {String}
     */
    'type' : 'default' ,

    // Public API method: shivs the document based on current html5 object options.
    'shivDocument' : shivDocument ,

    // Public API method: creates a shived element.
    createElement : createElement ,

    // Public API method: creates a shived document fragment.
    createDocumentFragment : createDocumentFragment
  } ;

  /*--------------------------------------------------------------------------*/

  // Expose the html5 object to the global window scope.
  window.html5 = html5 ;

  // Perform initial shiving of the current document.
  shivDocument ( document ) ;

  /*------------------------------- Print Shiv -------------------------------*/
  /* Section dedicated to print-specific shiving logic. */

  /**
   * Regular expression to filter media types for stylesheets.
   * Only 'all' or 'print' media types are considered.
   */
  var reMedia = /^$|\b(?:all|print)\b/ ;

  /**
   * Namespace prefix for printable elements.
   * Used in IE to create custom elements for print styling.
   */
  var shivNamespace = 'html5shiv' ;

  /**
   * Detects if the browser supports shivable stylesheets for printing.
   * This typically involves checking for IE-specific APIs.
   * Will be false if `supportsUnknownElements` is true (modern browser).
   */
  var supportsShivableSheets = ! supportsUnknownElements && (function ( ) {
    // Assign a false negative if the detection process itself fails.
    var docEl = document.documentElement ; // Reference to the document's root element.
    return ! ( // Check for the presence of various IE-specific properties/methods.
      typeof document.namespaces == 'undefined' ||
      typeof document.parentWindow == 'undefined' ||
      typeof docEl.applyElement == 'undefined' ||
      typeof docEl.removeNode == 'undefined' ||
      typeof window.attachEvent == 'undefined'
    ) ;
  }()) ; // Immediately execute this detection function.

  /*--------------------------------------------------------------------------*/
  /* Section separator: Print shiv utility functions. */

  /**
   * Wraps all identified HTML5 elements in the given document with printable elements.
   * This is a workaround for IE's print rendering issues with unknown elements.
   * For example, `<header>` becomes `<html5shiv:header>`.
   *
   * @private
   * @param {Document} ownerDocument The document to process.
   * @returns {Array} An array of the wrapper elements that were added.
   */
  function addWrappers( ownerDocument ) {
    var node , // Current node in the iteration.
        nodes = ownerDocument.getElementsByTagName ( '*' ) , // Get all elements in the document.
        index = nodes.length , // Start from the last element.
        reElements = RegExp ( '^(?:' + getElements ( ) . join ( '|' ) + ')$' , 'i' ) , // Regex to match shivable elements.
        result = [ ] ; // Array to store the added wrappers.

    while ( index-- ) { // Iterate backwards through all elements.
      node = nodes [ index ] ;
      if ( reElements.test ( node.nodeName ) ) { // If the node's name matches a shivable HTML5 element.
        result.push ( node.applyElement ( createWrapper ( node ) ) ) ; // Apply a wrapper around it.
      }
    }
    return result ; // Return the list of wrappers.
  }

  /**
   * Creates a printable wrapper element for a given HTML5 element.
   * This wrapper will have the `shivNamespace` prefix (e.g., `html5shiv:header`).
   * Attributes and styles from the original element are copied to the wrapper.
   *
   * @private
   * @param {Element} element The original HTML5 element.
   * @returns {Element} The newly created wrapper element.
   */
  function createWrapper( element ) {
    var node , // Temporary variable for attribute nodes.
        nodes = element.attributes , // Get all attributes of the original element.
        index = nodes.length , // Number of attributes.
        // Create the wrapper element with the shiv namespace and original node name.
        wrapper = element.ownerDocument.createElement ( shivNamespace + ':' + element.nodeName ) ;

    // Copy element attributes to the wrapper element.
    while ( index-- ) {
      node = nodes [ index ] ;
      // Only copy specified attributes to avoid default/implicit ones.
      node.specified && wrapper.setAttribute ( node.nodeName , node.nodeValue ) ;
    }
    // Copy inline styles from the original element to the wrapper.
    wrapper.style.cssText = element.style.cssText ;
    return wrapper ; // Return the constructed wrapper.
  }

  /**
   * Transforms CSS text to include the `shivNamespace` for HTML5 elements.
   * For example, `header{}` becomes `html5shiv\:header{}`.
   * This ensures print styles apply to the wrapped elements.
   *
   * @private
   * @param {String} cssText The original CSS text to shiv.
   * @returns {String} The shived CSS text.
   */
  function shivCssText( cssText ) {
    var pair , // Holds parts of a CSS rule (selector and declaration).
        parts = cssText.split ( '{' ) , // Split CSS by opening brace to isolate selectors.
        index = parts.length , // Number of CSS rule parts.
        // Regex to find HTML5 element names in selectors.
        reElements = RegExp ( '(^|[\\s,>+~])(' + getElements ( ) . join ( '|' ) + ')(?=[[\\s,>+~#.:]|$)' , 'gi' ) ,
        replacement = '$1' + shivNamespace + '\\:$2' ; // The replacement pattern with namespace.

    while ( index-- ) { // Iterate backwards through the CSS parts.
      pair = parts [ index ] = parts [ index ] . split ( '}' ) ; // Split by closing brace.
      // Replace HTML5 element names in the selector part (first part of 'pair').
      pair [ pair.length - 1 ] = pair [ pair.length - 1 ] . replace ( reElements , replacement ) ;
      parts [ index ] = pair.join ( '}' ) ; // Rejoin the parts of the rule.
    }
    return parts.join ( '{' ) ; // Rejoin all CSS rules.
  }

  /**
   * Removes the previously added wrapper elements, restoring the original HTML5 elements.
   * This is typically called after the print operation is complete.
   *
   * @private
   * @param {Array} wrappers An array of wrapper elements to remove.
   */
  function removeWrappers( wrappers ) {
    var index = wrappers.length ; // Get the number of wrappers.
    while ( index-- ) { // Iterate backwards.
      wrappers [ index ] . removeNode ( ) ; // Remove each wrapper node.
    }
  }

  /*--------------------------------------------------------------------------*/
  /* Section separator: Print shiv main function. */

  /**
   * Shivs the given document specifically for print.
   * This involves adding wrappers, shiving stylesheets, and handling print events.
   *
   * @memberOf html5
   * @param {Document} ownerDocument The document to shiv for print.
   * @returns {Document} The shived document.
   */
  function shivPrint( ownerDocument ) {
    var shivedSheet , // Variable to hold the dynamically created shived stylesheet.
        wrappers , // Array to store the wrapper elements created during print.
        data = getExpandoData ( ownerDocument ) , // Document-specific expando data.
        namespaces = ownerDocument.namespaces , // IE's document namespaces collection.
        ownerWindow = ownerDocument.parentWindow ; // Reference to the parent window.

    // If print shiving is not supported or already shived for print, return early.
    if ( ! supportsShivableSheets || ownerDocument.printShived ) {
      return ownerDocument ;
    }
    if ( typeof namespaces [ shivNamespace ] == 'undefined' ) { // If our namespace doesn't exist.
      namespaces.add ( shivNamespace ) ; // Add the custom namespace for print elements.
    }

    // Inner function to remove the shived stylesheet.
    function removeSheet( ) {
      clearTimeout ( data._removeSheetTimer ) ; // Clear any pending removal timer.
      if ( shivedSheet ) { // If a shived stylesheet exists.
          shivedSheet.removeNode ( true ) ; // Remove the stylesheet node.
      }
      shivedSheet = null ; // Reset the reference.
    }

    // Attach an event listener for `onbeforeprint`.
    // This executes just before the print dialog appears.
    ownerWindow.attachEvent ( 'onbeforeprint' , function ( ) {

      removeSheet ( ) ; // Ensure any previous shived sheet is removed.

      var imports , // Holds imported stylesheets.
          length , // Length of imports array.
          sheet , // Current stylesheet being processed.
          collection = ownerDocument.styleSheets , // Collection of all stylesheets.
          cssText = [ ] , // Array to accumulate all CSS text.
          index = collection.length , // Start index for iteration.
          sheets = Array ( index ) ; // Create a new array to hold stylesheets.

      // Convert the live `styleSheets` collection to a static array.
      while ( index-- ) {
        sheets [ index ] = collection [ index ] ;
      }
      // Concatenate CSS text from all relevant stylesheets.
      while ( ( sheet = sheets.pop ( ) ) ) { // Process sheets from the end of the array.
        // IE has relaxed same-origin policy for external stylesheets, but can error with dynamic ones.
        if ( ! sheet.disabled && reMedia.test ( sheet.media ) ) { // If sheet is enabled and matches print media.

          try {
            imports = sheet.imports ; // Get imported stylesheets.
            length = imports.length ;
          } catch ( er ) { // Catch errors if imports are inaccessible.
            length = 0 ;
          }

          for ( index = 0 ; index < length ; index++ ) { // Add imported stylesheets to the processing queue.
            sheets.push ( imports [ index ] ) ;
          }

          try {
            cssText.push ( sheet.cssText ) ; // Extract and store the CSS text.
          } catch ( er ) { } // Catch errors if cssText is inaccessible.
        }
      }

      // Shiv the accumulated CSS text and wrap HTML5 elements.
      cssText = shivCssText ( cssText.reverse ( ) . join ( '' ) ) ; // Reverse and join, then shiv CSS.
      wrappers = addWrappers ( ownerDocument ) ; // Add wrappers around HTML5 elements.
      shivedSheet = addStyleSheet ( ownerDocument , cssText ) ; // Inject the shived stylesheet.

    } ) ; // End of onbeforeprint handler.

    // Attach an event listener for `onafterprint`.
    // This executes after the print operation is finished or cancelled.
    ownerWindow.attachEvent ( 'onafterprint' , function ( ) {
      // Remove the wrappers and clean up the shived stylesheet.
      removeWrappers ( wrappers ) ; // Remove the temporary wrappers.
      clearTimeout ( data._removeSheetTimer ) ; // Clear any existing timer.
      // Set a new timer to remove the stylesheet after a short delay.
      // This delay helps ensure the stylesheet is not removed before the browser is truly done with it.
      data._removeSheetTimer = setTimeout ( removeSheet , 500 ) ;
    } ) ; // End of onafterprint handler.

    ownerDocument.printShived = true ; // Mark the document as print-shived.
    return ownerDocument ; // Return the print-shived document.
  }

  /*--------------------------------------------------------------------------*/
  /* Section separator: Final API exposure. */

  // Update the `html5.type` to reflect that print shiving is active.
  html5.type += ' print' ;
  // Expose the `shivPrint` function on the `html5` object.
  html5.shivPrint = shivPrint ;

  // Perform print shiving for the current document immediately.
  shivPrint ( document ) ;

} ( this , document ) ) ; // Execute the main IIFE, passing `this` (window) and `document`.