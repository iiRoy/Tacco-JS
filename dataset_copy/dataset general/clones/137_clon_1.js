/**
* @preserve HTML5 Shiv v3.6.2pre | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
*/
;(function ( window , document ) {

  // JSHint directive for eval usage
 /* jshint evil: true */

  // Current version of the shiv
  var version = '3.6.2pre' ;

  // Retrieve preset options from the window object, or an empty object
  var options = window.html5 || { } ;

  // Regular expression to skip problem elements during shiving
  var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i ;

  // Elements that can be safely cloned in IE (avoiding issues with `cloneNode`)
  var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i ;

  // Flag to detect if the browser supports default HTML5 styling
  var supportsHtml5Styles ;

  // Unique identifier for the expando property, to manage multiple documents or re-shiv
  var expando = '_html5shiv' ;

  // Counter for unique expando IDs
  var expanID = 0 ;

  // Cache for document-specific data
  var expandoData = { } ;

  // Flag to detect if the browser supports unknown elements
  var supportsUnknownElements ;

  // Self-executing function to perform feature detection
  (function( ) {
    try {
        var a = document.createElement('a') ;
        a.innerHTML = '<xyz></xyz>' ;

        // If the 'hidden' property is supported, we assume basic HTML5 styles are also supported
        supportsHtml5Styles = ('hidden' in a) ;

        // Check if unknown elements are supported. This involves creating a fragment and checking its methods.
        supportsUnknownElements = a.childNodes.length == 1 || (function() {
          // Assign a false positive if unable to shiv due to API limitations
          (document.createElement)('a') ;
          var frag = document.createDocumentFragment() ;
          return (
            typeof frag.cloneNode == 'undefined' ||
            typeof frag.createDocumentFragment == 'undefined' ||
            typeof frag.createElement == 'undefined'
          ) ;
        }());
    } catch ( e ) {
      // If detection fails (e.g., security error), assume false positives to prevent shiv from running
      supportsHtml5Styles = true ;
      supportsUnknownElements = true ;
    }

  }( )) ;


  // --------------------------------------------------------------------------

  /**
   * Creates a style sheet with the given CSS text and adds it to the document.
   * @private
   * @param {Document} ownerDocument The document to which the stylesheet will be added.
   * @param {String} cssText The CSS rules to include.
   * @returns {StyleSheet} The created style element.
   */
  function addStyleSheet(ownerDocument , cssText )
  {
    var p = ownerDocument.createElement('p') ,
        parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement ;

    p.innerHTML = 'x<style>' + cssText + '</style>' ;
    return parent.insertBefore(p.lastChild, parent.firstChild) ;
  }

  /**
   * Returns the value of `html5.elements` as an array.
   * @private
   * @returns {Array} An array of shived element node names.
   */
  function getElements( )
  {
    var elements = html5.elements ;
    return typeof elements == 'string' ? elements.split(' ') : elements ;
  }

  /**
   * Retrieves or creates data associated with the given document.
   * @private
   * @param {Document} ownerDocument The document.
   * @returns {Object} An object containing document-specific data.
   */
  function getExpandoData( ownerDocument )
  {
    var data = expandoData[ownerDocument[expando]] ;
    if (!data) {
        data = { } ;
        expanID++ ;
        ownerDocument[expando] = expanID ;
        expandoData[expanID] = data ;
    }
    return data ;
  }

  /**
   * Returns a shived element for the given nodeName and document.
   * @memberOf html5
   * @param {String} nodeName Name of the element to create.
   * @param {Document} ownerDocument The context document.
   * @returns {Object} The shived element.
   */
  function createElement(nodeName , ownerDocument , data )
  {
    if ( !ownerDocument ) {
        ownerDocument = document ;
    }
    if ( supportsUnknownElements ) {
        return ownerDocument.createElement(nodeName) ;
    }
    if ( !data ) {
        data = getExpandoData(ownerDocument) ;
    }
    var node ;

    if ( data.cache[nodeName] ) {
        node = data.cache[nodeName].cloneNode( ) ;
    } else if ( saveClones.test(nodeName) ) {
        node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode( ) ;
    } else {
        node = data.createElem(nodeName) ;
    }

    // Avoid adding some elements to fragments in IE < 9 because of various issues
    // like attribute setting, link `src` crashes, and script execution.
    return node.canHaveChildren && !reSkip.test(nodeName) ? data.frag.appendChild(node) : node ;
  }

  /**
   * Returns a shived DocumentFragment for the given document.
   * @memberOf html5
   * @param {Document} ownerDocument The context document.
   * @returns {Object} The shived DocumentFragment.
   */
  function createDocumentFragment( ownerDocument , data )
  {
    if ( !ownerDocument ) {
        ownerDocument = document ;
    }
    if ( supportsUnknownElements ) {
        return ownerDocument.createDocumentFragment( ) ;
    }
    data = data || getExpandoData(ownerDocument) ;
    var clone = data.frag.cloneNode( ) ,
        i = 0 ,
        elems = getElements( ) ,
        l = elems.length ;
    for ( ; i < l ; i++ ) {
        clone.createElement(elems[i]) ;
    }
    return clone ;
  }

  /**
   * Shivs the `createElement` and `createDocumentFragment` methods of the document.
   * @private
   * @param {Document|DocumentFragment} ownerDocument The document or fragment to shiv.
   * @param {Object} data Document-specific data.
   */
  function shivMethods( ownerDocument , data )
  {
    if ( !data.cache ) {
        data.cache = { } ;
        data.createElem = ownerDocument.createElement ;
        data.createFrag = ownerDocument.createDocumentFragment ;
        data.frag = data.createFrag( ) ;
    }


    ownerDocument.createElement = function( nodeName ) {
      // Abort shiv if `shivMethods` is explicitly set to false
      if ( !html5.shivMethods ) {
          return data.createElem(nodeName) ;
      }
      return createElement(nodeName, ownerDocument, data) ;
    } ;

    // Overwrite createDocumentFragment using a Function constructor for dynamic element creation
    ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
      'var n=f.cloneNode(),c=n.createElement;' +
      'h.shivMethods&&(' +
        // Unroll the `createElement` calls for all shived elements
        getElements().join().replace(/\w+/g, function(nodeName) {
          data.createElem(nodeName) ; // Ensure element exists in main document
          data.frag.createElement(nodeName) ; // Ensure element exists in fragment template
          return 'c("' + nodeName + '")' ; // Call createElement on the new fragment
        }) +
      ');return n}'
    )(html5, data.frag) ;
  }

  // --------------------------------------------------------------------------

  /**
   * Shivs the given document.
   * @memberOf html5
   * @param {Document} ownerDocument The document to shiv.
   * @returns {Document} The shived document.
   */
  function shivDocument( ownerDocument )
  {
    if ( !ownerDocument ) {
        ownerDocument = document ;
    }
    var data = getExpandoData(ownerDocument) ;

    // Add default HTML5 CSS if shivCSS is enabled and styles are not supported
    if ( html5.shivCSS && !supportsHtml5Styles && !data.hasCSS ) {
      data.hasCSS = !!addStyleSheet(ownerDocument,
        // CSS to correct block display for HTML5 elements in older IEs
        'article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
        // CSS for mark element
        'mark{background:#FF0;color:#000}'
      ) ;
    }
    // Shiv createElement and createDocumentFragment if unknown elements are not supported
    if ( !supportsUnknownElements ) {
      shivMethods(ownerDocument, data) ;
    }
    return ownerDocument ;
  }

  // --------------------------------------------------------------------------

  /**
   * The `html5` object is exposed globally to allow for customization
   * and detection of shiving on iframes.
   * @type Object
   * @example
   *
   * // Options can be changed before the script is included:
   * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
   */
  var html5 = {

    /**
     * An array or space-separated string of node names to shiv.
     * @memberOf html5
     * @type Array|String
     */
    'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary time video' ,

    /**
     * Current version of html5shiv.
     */
    'version': version ,

    /**
     * A flag indicating whether the HTML5 style sheet should be inserted.
     * @memberOf html5
     * @type Boolean
     */
    'shivCSS': (options.shivCSS !== false) ,

    /**
     * Is true if the browser supports creating unknown/HTML5 elements directly.
     * @memberOf html5
     * @type boolean
     */
    'supportsUnknownElements': supportsUnknownElements ,

    /**
     * A flag indicating whether the document's `createElement` and `createDocumentFragment`
     * methods should be overwritten.
     * @memberOf html5
     * @type Boolean
     */
    'shivMethods': (options.shivMethods !== false) ,

    /**
     * A string describing the type of `html5` object ("default" or "default print").
     * @memberOf html5
     * @type String
     */
    'type': 'default' ,

    // Function to shiv the document based on the specified `html5` object options
    'shivDocument': shivDocument ,

    // Function to create a shived element
    createElement: createElement ,

    // Function to create a shived documentFragment
    createDocumentFragment: createDocumentFragment
  } ;

  // --------------------------------------------------------------------------

  // Expose the html5 object to the global window scope
  window.html5 = html5 ;

  // Shiv the main document immediately
  shivDocument(document) ;

  // ------------------------------- Print Shiv -------------------------------

  /** Used to filter media types for stylesheets */
  var reMedia = /^$|\b(?:all|print)\b/ ;

  /** Namespace for printable elements in IE */
  var shivNamespace = 'html5shiv' ;

  /** Detect whether the browser supports shivable style sheets for printing */
  var supportsShivableSheets = !supportsUnknownElements && (function( ) {
    // Assign a false negative if unable to shiv due to missing IE-specific APIs
    var docEl = document.documentElement ;
    return !(
      typeof document.namespaces == 'undefined' ||
      typeof document.parentWindow == 'undefined' ||
      typeof docEl.applyElement == 'undefined' ||
      typeof docEl.removeNode == 'undefined' ||
      typeof window.attachEvent == 'undefined'
    ) ;
  }( )) ;

  // --------------------------------------------------------------------------

  /**
   * Wraps all HTML5 elements in the given document with printable elements
   * (e.g., "header" becomes "html5shiv:header").
   * @private
   * @param {Document} ownerDocument The document.
   * @returns {Array} An array of wrappers added.
   */
  function addWrappers( ownerDocument )
  {
    var node ,
        nodes = ownerDocument.getElementsByTagName('*') ,
        index = nodes.length ,
        reElements = RegExp('^(?:' + getElements().join('|') + ')$', 'i') ,
        result = [ ] ;

    while ( index-- ) {
      node = nodes[index] ;
      if ( reElements.test(node.nodeName) ) {
        result.push(node.applyElement(createWrapper(node))) ;
      }
    }
    return result ;
  }

  /**
   * Creates a printable wrapper for the given element.
   * @private
   * @param {Element} element The element to wrap.
   * @returns {Element} The created wrapper element.
   */
  function createWrapper( element )
  {
    var node ,
        nodes = element.attributes ,
        index = nodes.length ,
        wrapper = element.ownerDocument.createElement(shivNamespace + ':' + element.nodeName) ;

    // Copy element attributes to the wrapper
    while ( index-- ) {
      node = nodes[index] ;
      node.specified && wrapper.setAttribute(node.nodeName, node.nodeValue) ;
    }
    // Copy element styles to the wrapper
    wrapper.style.cssText = element.style.cssText ;
    return wrapper ;
  }

  /**
   * Shivs the given CSS text for print.
   * (e.g., `header{}` becomes `html5shiv\:header{}`).
   * @private
   * @param {String} cssText The CSS text to shiv.
   * @returns {String} The shived CSS text.
   */
  function shivCssText( cssText )
  {
    var pair ,
        parts = cssText.split('{') ,
        index = parts.length ,
        reElements = RegExp('(^|[\\s,>+~])(' + getElements().join('|') + ')(?=[[\\s,>+~#.:]|$)', 'gi') ,
        replacement = '$1' + shivNamespace + '\\:$2' ;

    while ( index-- ) {
      pair = parts[index] = parts[index].split('}') ;
      pair[pair.length - 1] = pair[pair.length - 1].replace(reElements, replacement) ;
      parts[index] = pair.join('}') ;
    }
    return parts.join('{') ;
  }

  /**
   * Removes the given wrappers, leaving the original elements.
   * @private
   * @params {Array} wrappers An array of printable wrappers to remove.
   */
  function removeWrappers( wrappers )
  {
    var index = wrappers.length ;
    while ( index-- ) {
      wrappers[index].removeNode( ) ;
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Shivs the given document for print.
   * @memberOf html5
   * @param {Document} ownerDocument The document to shiv for printing.
   * @returns {Document} The shived document.
   */
  function shivPrint( ownerDocument )
  {
    var shivedSheet ,
        wrappers ,
        data = getExpandoData(ownerDocument) ,
        namespaces = ownerDocument.namespaces ,
        ownerWindow = ownerDocument.parentWindow ;

    if ( !supportsShivableSheets || ownerDocument.printShived ) {
      return ownerDocument ;
    }
    if ( typeof namespaces[shivNamespace] == 'undefined' ) {
      namespaces.add(shivNamespace) ;
    }

    function removeSheet( ) {
      clearTimeout(data._removeSheetTimer) ;
      if ( shivedSheet ) {
          shivedSheet.removeNode(true) ;
      }
      shivedSheet = null ;
    }

    ownerWindow.attachEvent('onbeforeprint', function( ) {

      removeSheet( ) ;

      var imports ,
          length ,
          sheet ,
          collection = ownerDocument.styleSheets ,
          cssText = [ ] ,
          index = collection.length ,
          sheets = Array(index) ;

      // Convert styleSheets collection to an array for easier manipulation
      while ( index-- ) {
        sheets[index] = collection[index] ;
      }
      // Concatenate all style sheet CSS text
      while ( (sheet = sheets.pop( )) ) {
        // IE does not enforce a same origin policy for external style sheets,
        // but can have issues with dynamically created stylesheets.
        if ( !sheet.disabled && reMedia.test(sheet.media) ) {

          try {
            imports = sheet.imports ;
            length = imports.length ;
          } catch ( er ) {
            length = 0 ;
          }

          for ( index = 0 ; index < length ; index++ ) {
            sheets.push(imports[index]) ;
          }

          try {
            cssText.push(sheet.cssText) ;
          } catch ( er ) { }
        }
      }

      // Wrap all HTML5 elements with printable elements and add the shived style sheet
      cssText = shivCssText(cssText.reverse().join('')) ;
      wrappers = addWrappers(ownerDocument) ;
      shivedSheet = addStyleSheet(ownerDocument, cssText) ;

    }) ;

    ownerWindow.attachEvent('onafterprint', function( ) {
      // Remove wrappers, leaving the original elements, and remove the shived style sheet
      removeWrappers(wrappers) ;
      clearTimeout(data._removeSheetTimer) ;
      data._removeSheetTimer = setTimeout(removeSheet, 500) ;
    }) ;

    ownerDocument.printShived = true ;
    return ownerDocument ;
  }

  // --------------------------------------------------------------------------

  // Update the type property to reflect print shiving
  html5.type += ' print' ;
  // Expose the shivPrint function
  html5.shivPrint = shivPrint ;

  // Shiv for print functionality immediately
  shivPrint(document) ;

}(this , document)) ;