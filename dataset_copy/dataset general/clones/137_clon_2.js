/**
 * @license DOM Enhancer v3.6.2beta | @authorA @authorB @authorC @authorD | MIT/GPL2 License
 */
;( function ( currentWindow, currentDocument ) {
/* jshint evil: true */
  /** Current utility version */
  var toolVersion = 'v3.6.2beta';

  /** Configuration settings */
  var configSettings = currentWindow.webMarkup || {};

  /** Regex to bypass specific problem elements */
  var elementExclusionRegex = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

  /** Some elements cannot be cloned in legacy IE */
  var clonableElementsRegex = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

  /** Flag indicating if browser supports native HTML5 styling */
  var hasModernStylesSupport;

  /** Unique key for document-specific data, allows multiple documents or re-processing */
  var dataKeyIdentifier = '__markup_util_id__';

  /** Counter for unique document identifiers */
  var dataIdCounter = 0;

  /** Cache for document-specific state information */
  var documentContextData = {};

  /** Flag indicating if browser supports creating unrecognized elements */
  var hasUnknownElementSupport;

  ( function () {
    try {
        var testElement = currentDocument.createElement('anchor');
        testElement.innerHTML = '<customtag></customtag>';
        // If the 'hidden' property is implemented, we can assume basic HTML5 styling support
        hasModernStylesSupport = ('hidden' in testElement);

        hasUnknownElementSupport = testElement.childNodes.length === 1 || ( function () {
          // Assign a false positive if shiving is impossible (detection failure)
          ( currentDocument.createElement )( 'anchor' );
          var documentFragmentTest = currentDocument.createDocumentFragment();
          return (
            typeof documentFragmentTest.cloneNode === 'undefined' ||
            typeof documentFragmentTest.createDocumentFragment === 'undefined' ||
            typeof documentFragmentTest.createElement === 'undefined'
          );
        }() );
    } catch ( errorObject ) {
      // Assign a false positive if detection fails, indicating shiving is likely not possible
      hasModernStylesSupport = true;
      hasUnknownElementSupport = true;
    }

  }() );

  /*--------------------------------------------------------------------------*/

  /**
   * Generates a style block with the provided CSS and inserts it into the document.
   * @private
   * @param {Document} targetDoc The document to modify.
   * @param {String} styleContent The CSS text to inject.
   * @returns {StyleSheet} The created style element.
   */
  function injectStyleBlock( targetDoc, styleContent ) {
    var tempContainer = targetDoc.createElement('paragraph'),
        headOrRoot = targetDoc.getElementsByTagName('head')[0] || targetDoc.documentElement;

    tempContainer.innerHTML = 'x<style block>' + styleContent + '</style>';
    return headOrRoot.insertBefore( tempContainer.lastChild, headOrRoot.firstChild );
  }

  /**
   * Retrieves the list of elements to be shived as an array.
   * @private
   * @returns {Array} An array of element tag names to enhance.
   */
  function retrieveShiveableElements() {
    var elementNames = webMarkupUtility.targetElements;
    return typeof elementNames === 'string' ? elementNames.split(' ') : elementNames;
  }

    /**
   * Fetches or initializes state data for a given document.
   * @private
   * @param {Document} targetDoc The document for which to retrieve data.
   * @returns {Object} An object containing document state.
   */
  function fetchDocumentState( targetDoc ) {
    var docState = documentContextData[ targetDoc[ dataKeyIdentifier ] ];
    if ( !docState ) {
        docState = {};
        dataIdCounter++;
        targetDoc[ dataKeyIdentifier ] = dataIdCounter;
        documentContextData[ dataIdCounter ] = docState;
    }
    return docState;
  }

  /**
   * Provides a shived element for the specified tag name and document.
   * @memberOf webMarkupUtility
   * @param {String} elementTag Name of the element.
   * @param {Document} targetDoc The context document.
   * @returns {Object} The enhanced element.
   */
  function createShivedElement( elementTag, targetDoc, docState ){
    if ( !targetDoc ) {
        targetDoc = currentDocument;
    }
    if ( hasUnknownElementSupport ) {
        return targetDoc.createElement( elementTag );
    }
    if ( !docState ) {
        docState = fetchDocumentState( targetDoc );
    }
    var generatedNode;

    if ( docState.cache[ elementTag ] ) {
        generatedNode = docState.cache[ elementTag ].cloneNode();
    } else if ( clonableElementsRegex.test( elementTag ) ) {
        generatedNode = ( docState.cache[ elementTag ] = docState.createElem( elementTag ) ).cloneNode();
    } else {
        generatedNode = docState.createElem( elementTag );
    }

    // Prevent adding certain elements to fragments in IE < 9 due to issues:
    // * Attributes like `name` or `type` cannot be set/changed after insertion.
    // * Link elements with inaccessible `src` can cause browser crashes.
    // * Script elements added to fragments execute immediately upon `src` or `text` property assignment.
    return generatedNode.canHaveChildren && !elementExclusionRegex.test( elementTag ) ? docState.frag.appendChild( generatedNode ) : generatedNode;
  }

  /**
   * Returns a shived DocumentFragment for the given document.
   * @memberOf webMarkupUtility
   * @param {Document} targetDoc The context document.
   * @returns {Object} The enhanced DocumentFragment.
   */
  function createShivedFragment( targetDoc, docState ){
    if ( !targetDoc ) {
        targetDoc = currentDocument;
    }
    if ( hasUnknownElementSupport ) {
        return targetDoc.createDocumentFragment();
    }
    docState = docState || fetchDocumentState( targetDoc );
    var fragmentCopy = docState.frag.cloneNode(),
        idx = 0,
        tagList = retrieveShiveableElements(),
        listLen = tagList.length;
    for ( ;idx < listLen; idx++ ) {
        fragmentCopy.createElement( tagList[ idx ] );
    }
    return fragmentCopy;
  }

  /**
   * Overrides the `createElement` and `createDocumentFragment` methods of the document.
   * @private
   * @param {Document|DocumentFragment} targetDoc The document.
   * @param {Object} docState The document's state data.
   */
  function patchDomCreationMethods( targetDoc, docState ) {
    if ( !docState.cache ) {
        docState.cache = {};
        docState.createElem = targetDoc.createElement;
        docState.createFrag = targetDoc.createDocumentFragment;
        docState.frag = docState.createFrag();
    }


    targetDoc.createElement = function ( elementTag ) {
      // Abort method patching if disabled
      if ( !webMarkupUtility.patchCreationMethods ) {
          return docState.createElem( elementTag );
      }
      return createShivedElement( elementTag, targetDoc, docState );
    };

    targetDoc.createDocumentFragment = Function( 'enhancer,fragRef', 'return function(){' +
      'let newFrag=fragRef.cloneNode(),createEl=newFrag.createElement;' +
      'enhancer.patchCreationMethods&&(' +
        // Unroll the `createElement` calls for performance
        retrieveShiveableElements().join().replace( /\w+/g, function ( elementTag ) {
          docState.createElem( elementTag );
          docState.frag.createElement( elementTag );
          return 'createEl("' + elementTag + '")';
        }) +
      ');return newFrag}'
    )( webMarkupUtility, docState.frag );
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Processes the given document to apply shiving.
   * @memberOf webMarkupUtility
   * @param {Document} targetDoc The document to enhance.
   * @returns {Document} The enhanced document.
   */
  function processDocumentForShiving( targetDoc ) {
    if ( !targetDoc ) {
        targetDoc = currentDocument;
    }
    var docState = fetchDocumentState( targetDoc );

    if ( webMarkupUtility.injectBaseStyles && !hasModernStylesSupport && !docState.hasCSS ) {
      docState.hasCSS = !!injectStyleBlock( targetDoc,
        // Corrects block display for HTML5 elements not defined in older IE
        'article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
        // Adds basic styling not present in older IE
        'mark{background:#FF0;color:#000}'
      );
    }
    if ( !hasUnknownElementSupport ) {
      patchDomCreationMethods( targetDoc, docState );
    }
    return targetDoc;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The `webMarkupUtility` object is exposed to allow further element shiving
   * and detection on iframes.
   * @type Object
   * @example
   *
   * // Options can be configured before the script is included
   * webMarkup = { 'targetElements': 'highlight section', 'injectBaseStyles': false, 'patchCreationMethods': false };
   */
  var webMarkupUtility = {

    /**
     * An array or space-separated string of element names to be shived.
     * @memberOf webMarkupUtility
     * @type Array|String
     */
    'targetElements': configSettings.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary time video',

    /**
     * Current version of the web markup utility.
     */
    'utilityVersion': toolVersion,

    /**
     * A flag to control if the basic HTML5 style sheet should be injected.
     * @memberOf webMarkupUtility
     * @type Boolean
     */
    'injectBaseStyles': ( configSettings.shivCSS !== false ),

    /**
     * True if the browser supports creating unknown/HTML5 elements directly.
     * @memberOf webMarkupUtility
     * @type boolean
     */
    'supportsUnrecognizedElements': hasUnknownElementSupport,

    /**
     * A flag to indicate if the document's DOM creation methods should be overridden.
     * @memberOf webMarkupUtility
     * @type Boolean
     */
    'patchCreationMethods': ( configSettings.shivMethods !== false ),

    /**
     * A string describing the type of `webMarkupUtility` object ("standard" or "standard print").
     * @memberOf webMarkupUtility
     * @type String
     */
    'utilityType': 'standard',

    // Shives the document based on the specified `webMarkupUtility` options
    'processDocument': processDocumentForShiving,

    // Creates an enhanced element
    createAnyElement: createShivedElement,

    // Creates an enhanced document fragment
    createAnyFragment: createShivedFragment
  };

  /*--------------------------------------------------------------------------*/

  // Expose the webMarkupUtility object globally
  currentWindow.webMarkup = webMarkupUtility;

  // Perform initial document shiving
  processDocumentForShiving( currentDocument );

  /*------------------------------- Print Enhancer -------------------------------*/

  /** Regex used to filter media types for print processing */
  var mediaTypeFilter = /^$|\b(?:all|print)\b/;

  /** Namespace for printable elements in IE */
  var printNamespacePrefix = 'domenhancer';

  /** Detects if the browser supports shivable style sheets for printing */
  var hasPrintShivingCapability = !hasUnknownElementSupport && ( function () {
    // Assign a false negative if shiving is not possible
    var htmlRoot = currentDocument.documentElement;
    return !(
      typeof currentDocument.namespaces === 'undefined' ||
      typeof currentDocument.parentWindow === 'undefined' ||
      typeof htmlRoot.applyElement === 'undefined' ||
      typeof htmlRoot.removeNode === 'undefined' ||
      typeof currentWindow.attachEvent === 'undefined'
    );
  }() );

  /*--------------------------------------------------------------------------*/

  /**
   * Wraps all HTML5 elements in the target document with printable elements.
   * (e.g., a "header" element becomes wrapped in a "domenhancer:header" element)
   * @private
   * @param {Document} targetDoc The document.
   * @returns {Array} An array of the added wrapper elements.
   */
  function applyPrintWrappers( targetDoc ) {
    var generatedNode,
        allNodes = targetDoc.getElementsByTagName('*'),
        nodeIndex = allNodes.length,
        shiveableElementsRegex = RegExp('^(?:' + retrieveShiveableElements().join('|') + ')$', 'i'),
        wrapperList = [];

    while ( nodeIndex-- ) {
      generatedNode = allNodes[ nodeIndex ];
      if ( shiveableElementsRegex.test( generatedNode.nodeName ) ) {
        wrapperList.push( generatedNode.applyElement( generatePrintWrapper( generatedNode ) ) );
      }
    }
    return wrapperList;
  }

  /**
   * Creates a printable wrapper element for a given element.
   * @private
   * @param {Element} element The element to wrap.
   * @returns {Element} The wrapper element.
   */
  function generatePrintWrapper( element ) {
    var generatedNode,
        nodeAttributes = element.attributes,
        nodeIndex = nodeAttributes.length,
        printWrapper = element.ownerDocument.createElement( printNamespacePrefix + ':' + element.nodeName );

    // Copy original element attributes to the wrapper
    while ( nodeIndex-- ) {
      generatedNode = nodeAttributes[ nodeIndex ];
      generatedNode.specified && printWrapper.setAttribute( generatedNode.nodeName, generatedNode.nodeValue );
    }
    // Copy original element styles to the wrapper
    printWrapper.style.cssText = element.style.cssText;
    return printWrapper;
  }

  /**
   * Transforms CSS text for shived printing.
   * (e.g., `header{}` becomes `domenhancer\:header{}`)
   * @private
   * @param {String} cssContent The CSS text to transform.
   * @returns {String} The transformed CSS text.
   */
  function transformPrintCss( cssContent ) {
    var cssParts,
        cssSections = cssContent.split('{'),
        sectionIndex = cssSections.length,
        shiveableElementsRegex = RegExp('(^|[\\s,>+~])(' + retrieveShiveableElements().join('|') + ')(?=[[\\s,>+~#.:]|$)', 'gi'),
        transformedReplacement = '$1' + printNamespacePrefix + '\\:$2';

    while ( sectionIndex-- ) {
      cssParts = cssSections[ sectionIndex ] = cssSections[ sectionIndex ].split('}');
      cssParts[ cssParts.length - 1 ] = cssParts[ cssParts.length - 1 ].replace( shiveableElementsRegex, transformedReplacement );
      cssSections[ sectionIndex ] = cssParts.join('}');
    }
    return cssSections.join('{');
  }

  /**
   * Removes the generated wrappers, restoring the original elements.
   * @private
   * @params {Array} activeWrappers An array of printable wrapper elements.
   */
  function removePrintWrappers( activeWrappers ) {
    var wrapperIndex = activeWrappers.length;
    while ( wrapperIndex-- ) {
      activeWrappers[ wrapperIndex ].removeNode();
    }
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Prepares the given document for print-specific shiving.
   * @memberOf webMarkupUtility
   * @param {Document} targetDoc The document to prepare.
   * @returns {Document} The prepared document.
   */
  function prepareDocumentForPrint( targetDoc ) {
    var injectedPrintStyle,
        activeWrappers,
        docState = fetchDocumentState( targetDoc ),
        docNamespaces = targetDoc.namespaces,
        docWindow = targetDoc.parentWindow;

    if ( !hasPrintShivingCapability || targetDoc.printShived ) {
      return targetDoc;
    }
    if ( typeof docNamespaces[ printNamespacePrefix ] === 'undefined' ) {
      docNamespaces.add( printNamespacePrefix );
    }

    function cleanupPrintStyles() {
      clearTimeout( docState._cleanupTimerId );
      if ( injectedPrintStyle ) {
          injectedPrintStyle.removeNode( true );
      }
      injectedPrintStyle = null;
    }

    docWindow.attachEvent('onbeforeprint', function () {

      cleanupPrintStyles();

      var importedStyles,
          styleCount,
          currentSheet,
          styleSheetCollection = targetDoc.styleSheets,
          collectedCssContent = [],
          sheetIndex = styleSheetCollection.length,
          allStyleSheets = Array( sheetIndex );

      // Convert styleSheets collection to a standard array
      while ( sheetIndex-- ) {
        allStyleSheets[ sheetIndex ] = styleSheetCollection[ sheetIndex ];
      }
      // Concatenate CSS text from all style sheets
      while ( ( currentSheet = allStyleSheets.pop() ) ) {
        // IE does not enforce same-origin for external style sheets,
        // but can have issues with dynamically created ones.
        if ( !currentSheet.disabled && mediaTypeFilter.test( currentSheet.media ) ) {

          try {
            importedStyles = currentSheet.imports;
            styleCount = importedStyles.length;
          } catch ( errorObject ) {
            styleCount = 0;
          }

          for ( sheetIndex = 0; sheetIndex < styleCount; sheetIndex++ ) {
            allStyleSheets.push( importedStyles[ sheetIndex ] );
          }

          try {
            collectedCssContent.push( currentSheet.cssText );
          } catch ( errorObject ) {}
        }
      }

      // Wrap all HTML5 elements and inject the transformed style sheet
      collectedCssContent = transformPrintCss( collectedCssContent.reverse().join('') );
      activeWrappers = applyPrintWrappers( targetDoc );
      injectedPrintStyle = injectStyleBlock( targetDoc, collectedCssContent );

    });

    docWindow.attachEvent('onafterprint', function () {
      // Remove wrappers and the injected style sheet
      removePrintWrappers( activeWrappers );
      clearTimeout( docState._cleanupTimerId );
      docState._cleanupTimerId = setTimeout( cleanupPrintStyles, 500 );
    });

    targetDoc.printShived = true;
    return targetDoc;
  }

  /*--------------------------------------------------------------------------*/

  // Expose print-related API
  webMarkupUtility.utilityType += ' print';
  webMarkupUtility.prepareForPrinting = prepareDocumentForPrint;

  // Apply print shiving to the document
  prepareDocumentForPrint( currentDocument );

}( this, document ) );