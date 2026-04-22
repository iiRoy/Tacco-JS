/**
* @license Component Compatibility Layer v3.6.2 | @author_a @author_b @author_c @author_d | MIT/GPL2 Open Source
*/
;(function(globalObj, docElem) {
/*jsl:ignore:evil */
  /** Version number */
  var currentRevision = '3.6.2';

  /** Initial configuration object */
  var configuration = globalObj.webComponents || {};

  /** Regular expression to bypass certain elements */
  var elementExclusionPattern = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

  /** Elements that can be safely cloned in older IE versions **/
  var clonableElementsRegex = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

  /** Flag indicating if the browser supports modern HTML5 display styles */
  var hasModernStylesSupport;

  /** Internal key for storing document-specific data */
  var internalIdentifier = '_webCompShiv';

  /** Counter for unique document IDs */
  var identifierCounter = 0;

  /** Object to store cached metadata for each processed document */
  var documentSpecificData = {};

  /** Flag indicating if the browser can create unknown HTML elements */
  var canCreateUnknownElements;

  (function() {
    try {
        var tempAnchor = docElem.createElement('a');
        tempAnchor.innerHTML = '<dummyElement></dummyElement>';
        // If the 'hidden' attribute is available, we assume basic HTML5 styling support.
        hasModernStylesSupport = ('hidden' in tempAnchor);

        canCreateUnknownElements = tempAnchor.childNodes.length == 1 || (function() {
          // Assign a positive value if feature detection fails or indicates limited support.
          (docElem.createElement)('a');
          var documentFragmentInstance = docElem.createDocumentFragment();
          return (
            typeof documentFragmentInstance.cloneNode == 'undefined' ||
            typeof documentFragmentInstance.createDocumentFragment == 'undefined' ||
            typeof documentFragmentInstance.createElement == 'undefined'
          );
        }());
    } catch(errorOccurred) {
      // If an error occurs during detection, assume full support (fail-safe).
      hasModernStylesSupport = true;
      canCreateUnknownElements = true;
    }

  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Generates a style block with the provided CSS and appends it to the document.
   * @private
   * @param {Document} targetDocument The document to modify.
   * @param {String} styleContent The CSS rules as a string.
   * @returns {StyleSheet} The created style element.
   */
  function injectStyleBlock(targetDocument, styleContent) {
    var tempParagraph = targetDocument.createElement('p'),
        headOrRoot = targetDocument.getElementsByTagName('head')[0] || targetDocument.documentElement;

    tempParagraph.innerHTML = 'x<style>' + styleContent + '</style>';
    return headOrRoot.insertBefore(tempParagraph.lastChild, headOrRoot.firstChild);
  }

  /**
   * Retrieves the list of HTML5 component names configured for shimming.
   * @private
   * @returns {Array} An array of element tags to be shived.
   */
  function retrieveComponentNames() {
    var componentList = webComponents.structuredElements;
    return typeof componentList == 'string' ? componentList.split(' ') : componentList;
  }

    /**
   * Fetches or initializes document-specific metadata.
   * @private
   * @param {Document} targetDocument The document in question.
   * @returns {Object} An object containing document metadata.
   */
  function fetchDocMetadata(targetDocument) {
    var metadata = documentSpecificData[targetDocument[internalIdentifier]];
    if (!metadata) {
        metadata = {};
        identifierCounter++;
        targetDocument[internalIdentifier] = identifierCounter;
        documentSpecificData[identifierCounter] = metadata;
    }
    return metadata;
  }

  /**
   * Provides a compatibility-aware element creation method.
   * @memberOf webComponents
   * @param {String} elementTag The name of the HTML element to create.
   * @param {Document} targetDocument The contextual document.
   * @returns {Object} The newly created element, potentially shived.
   */
  function constructElementNode(elementTag, targetDocument, docMetadata){
    if (!targetDocument) {
        targetDocument = docElem;
    }
    if(canCreateUnknownElements){
        return targetDocument.createElement(elementTag);
    }
    if (!docMetadata) {
        docMetadata = fetchDocMetadata(targetDocument);
    }
    var generatedNode;

    if (docMetadata.cache[elementTag]) {
        generatedNode = docMetadata.cache[elementTag].cloneNode();
    } else if (clonableElementsRegex.test(elementTag)) {
        generatedNode = (docMetadata.cache[elementTag] = docMetadata.createElem(elementTag)).cloneNode();
    } else {
        generatedNode = docMetadata.createElem(elementTag);
    }

    // Workaround for IE < 9 issues when adding certain elements to fragments:
    // * Attributes like `name` or `type` are fixed upon insertion.
    // * Link elements with inaccessible `src` can crash the browser.
    // * Script elements execute immediately when `src` or `text` is set.
    return generatedNode.canHaveChildren && !elementExclusionPattern.test(elementTag) ? docMetadata.frag.appendChild(generatedNode) : generatedNode;
  }

  /**
   * Provides a compatibility-aware document fragment creation method.
   * @memberOf webComponents
   * @param {Document} targetDocument The contextual document.
   * @returns {Object} The compatibility-processed DocumentFragment.
   */
  function buildDocFragment(targetDocument, docMetadata){
    if (!targetDocument) {
        targetDocument = docElem;
    }
    if(canCreateUnknownElements){
        return targetDocument.createDocumentFragment();
    }
    docMetadata = docMetadata || fetchDocMetadata(targetDocument);
    var fragmentClone = docMetadata.frag.cloneNode(),
        idx = 0,
        componentNames = retrieveComponentNames(),
        len = componentNames.length;
    for(;idx<len;idx++){
        fragmentClone.createElement(componentNames[idx]);
    }
    return fragmentClone;
  }

  /**
   * Overrides the `createElement` and `createDocumentFragment` methods of the document
   * to provide HTML5 compatibility.
   * @private
   * @param {Document|DocumentFragment} targetDocument The document or fragment.
   * @param {Object} docMetadata Document-specific data.
   */
  function overrideDocumentMethods(targetDocument, docMetadata) {
    if (!docMetadata.cache) {
        docMetadata.cache = {};
        docMetadata.createElem = targetDocument.createElement;
        docMetadata.createFrag = targetDocument.createDocumentFragment;
        docMetadata.frag = docMetadata.createFrag();
    }


    targetDocument.createElement = function(elementTag) {
      // Abort compatibility processing if disabled
      if (!webComponents.overrideNativeMethods) {
          return docMetadata.createElem(elementTag);
      }
      return constructElementNode(elementTag, targetDocument, docMetadata);
    };

    targetDocument.createDocumentFragment = Function('hostObj, fragmentObj', 'return function(){' +
      'var n=fragmentObj.cloneNode(),c=n.createElement;' +
      'hostObj.overrideNativeMethods&&(' +
        // Unroll the `createElement` calls for performance
        retrieveComponentNames().join().replace(/\w+/g, function(elementTag) {
          docMetadata.createElem(elementTag);
          docMetadata.frag.createElement(elementTag);
          return 'c("' + elementTag + '")';
        }) +
      ');return n}'
    )(webComponents, docMetadata.frag);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Applies HTML5 compatibility fixes to the given document.
   * @memberOf webComponents
   * @param {Document} targetDocument The document to process.
   * @returns {Document} The processed document.
   */
  function processDocumentForCompatibility(targetDocument) {
    if (!targetDocument) {
        targetDocument = docElem;
    }
    var docMetadata = fetchDocMetadata(targetDocument);

    if (webComponents.applyDefaultStyles && !hasModernStylesSupport && !docMetadata.hasCSS) {
      docMetadata.hasCSS = !!injectStyleBlock(targetDocument,
        // Corrects block display for HTML5 elements in older IE
        'article,aside,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
        // Adds default styling for 'mark' element
        'mark{background:#FF0;color:#000}' +
        // Hides 'template' element by default
        'template{display:none}'
      );
    }
    if (!canCreateUnknownElements) {
      overrideDocumentMethods(targetDocument, docMetadata);
    }
    return targetDocument;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The `webComponents` object provides an API for configuring
   * and detecting HTML5 compatibility.
   * @type Object
   * @example
   *
   * // Configuration can be set before script inclusion
   * webComponents = { 'structuredElements': 'mark section', 'applyDefaultStyles': false, 'overrideNativeMethods': false };
   */
  var webComponents = {

    /**
     * An array or space-separated string of element names to make compatible.
     * @memberOf webComponents
     * @type Array|String
     */
    'structuredElements': configuration.structuredElements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

    /**
     * Current library revision.
     */
    'libraryVersion': currentRevision,

    /**
     * A flag to control insertion of the default HTML5 style sheet.
     * @memberOf webComponents
     * @type Boolean
     */
    'applyDefaultStyles': (configuration.applyDefaultStyles !== false),

    /**
     * True if the browser natively supports creating unknown/HTML5 elements.
     * @memberOf webComponents
     * @type boolean
     */
    'supportsDynamicElements': canCreateUnknownElements,

    /**
     * A flag to control whether the document's `createElement` and `createDocumentFragment`
     * methods should be overridden.
     * @memberOf webComponents
     * @type Boolean
     */
    'overrideNativeMethods': (configuration.overrideNativeMethods !== false),

    /**
     * Describes the type of `webComponents` object ("default" or "default print").
     * @memberOf webComponents
     * @type String
     */
    'implementationType': 'default',

    // Processes the document according to the specified options
    'processDocument': processDocumentForCompatibility,

    // Creates a compatibility-aware element
    createCustomElement: constructElementNode,

    // Creates a compatibility-aware document fragment
    createCustomFragment: buildDocFragment
  };

  /*--------------------------------------------------------------------------*/

  // Expose the API globally
  globalObj.webComponents = webComponents;

  // Process the initial document for compatibility
  processDocumentForCompatibility(docElem);

  /*------------------------------- Print Compatibility -------------------------------*/

  /** Regular expression to filter media types for print */
  var mediaTypeFilter = /^$|\b(?:all|print)\b/;

  /** Namespace prefix for printable elements */
  var compatibilityNamespace = 'webcompshiv';

  /** Flag indicating if the browser supports shivable style sheets for printing */
  var supportsPrintShimming = !canCreateUnknownElements && (function() {
    // Assign a negative value if detection indicates lack of support
    var documentRoot = docElem.documentElement;
    return !(
      typeof docElem.namespaces == 'undefined' ||
      typeof docElem.parentWindow == 'undefined' ||
      typeof documentRoot.applyElement == 'undefined' ||
      typeof documentRoot.removeNode == 'undefined' ||
      typeof globalObj.attachEvent == 'undefined'
    );
  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Encloses all HTML5 elements in the given document with printable wrapper elements.
   * (e.g., a "header" element becomes "webcompshiv:header")
   * @private
   * @param {Document} targetDocument The document to modify.
   * @returns {Array} An array of the added wrapper elements.
   */
  function applyPrintWrappers(targetDocument) {
    var currentElement,
        allNodes = targetDocument.getElementsByTagName('*'),
        idx = allNodes.length,
        targetElementRegex = RegExp('^(?:' + retrieveComponentNames().join('|') + ')$', 'i'),
        wrapperCollection = [];

    while (idx--) {
      currentElement = allNodes[idx];
      if (targetElementRegex.test(currentElement.nodeName)) {
        wrapperCollection.push(currentElement.applyElement(generatePrintWrapper(currentElement)));
      }
    }
    return wrapperCollection;
  }

  /**
   * Creates a printable wrapper element for a given original element.
   * @private
   * @param {Element} originalElement The element to wrap.
   * @returns {Element} The generated wrapper element.
   */
  function generatePrintWrapper(originalElement) {
    var attributeNode,
        attributesList = originalElement.attributes,
        idx = attributesList.length,
        newWrapper = originalElement.ownerDocument.createElement(compatibilityNamespace + ':' + originalElement.nodeName);

    // Copy original element attributes to the wrapper
    while (idx--) {
      attributeNode = attributesList[idx];
      attributeNode.specified && newWrapper.setAttribute(attributeNode.nodeName, attributeNode.nodeValue);
    }
    // Copy original element styles to the wrapper
    newWrapper.style.cssText = originalElement.style.cssText;
    return newWrapper;
  }

  /**
   * Transforms CSS text to target namespaced printable elements.
   * (e.g., `header{}` becomes `webcompshiv\:header{}`)
   * @private
   * @param {String} originalCss The CSS text to transform.
   * @returns {String} The transformed CSS text.
   */
  function transformCssForPrint(originalCss) {
    var cssRuleParts,
        ruleBlocks = originalCss.split('{'),
        idx = ruleBlocks.length,
        targetElementRegex = RegExp('(^|[\\s,>+~])(' + retrieveComponentNames().join('|') + ')(?=[[\\s,>+~#.:]|$)', 'gi'),
        rewrittenSelector = '$1' + compatibilityNamespace + '\\:$2';

    while (idx--) {
      cssRuleParts = ruleBlocks[idx] = ruleBlocks[idx].split('}');
      cssRuleParts[cssRuleParts.length - 1] = cssRuleParts[cssRuleParts.length - 1].replace(targetElementRegex, rewrittenSelector);
      ruleBlocks[idx] = cssRuleParts.join('}');
    }
    return ruleBlocks.join('{');
  }

  /**
   * Removes the generated print wrappers, restoring the original elements.
   * @private
   * @params {Array} wrapperList An array of printable wrapper elements.
   */
  function cleanupPrintWrappers(wrapperList) {
    var idx = wrapperList.length;
    while (idx--) {
      wrapperList[idx].removeNode();
    }
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Prepares the given document for printing, applying compatibility fixes.
   * @memberOf webComponents
   * @param {Document} targetDocument The document to prepare.
   * @returns {Document} The print-compatible document.
   */
  function prepareDocumentForPrinting(targetDocument) {
    var injectedStyleSheet,
        printWrappers,
        docMetadata = fetchDocMetadata(targetDocument),
        docNamespaces = targetDocument.namespaces,
        parentWindow = targetDocument.parentWindow;

    if (!supportsPrintShimming || targetDocument.printShived) {
      return targetDocument;
    }
    if (typeof docNamespaces[compatibilityNamespace] == 'undefined') {
      docNamespaces.add(compatibilityNamespace);
    }

    function purgeStyleSheet() {
      clearTimeout(docMetadata._removeSheetTimer);
      if (injectedStyleSheet) {
          injectedStyleSheet.removeNode(true);
      }
      injectedStyleSheet= null;
    }

    parentWindow.attachEvent('onbeforeprint', function() {

      purgeStyleSheet();

      var importedSheets,
          sheetCount,
          currentSheet,
          styleSheetCollection = targetDocument.styleSheets,
          combinedCssContent = [],
          idx = styleSheetCollection.length,
          allStyleSheets = Array(idx);

      // Convert styleSheets collection to a standard array
      while (idx--) {
        allStyleSheets[idx] = styleSheetCollection[idx];
      }
      // Concatenate CSS content from all relevant style sheets
      while ((currentSheet = allStyleSheets.pop())) {
        // IE has peculiar behavior with external style sheets and dynamic ones.
        if (!currentSheet.disabled && mediaTypeFilter.test(currentSheet.media)) {

          try {
            importedSheets = currentSheet.imports;
            sheetCount = importedSheets.length;
          } catch(err){
            sheetCount = 0;
          }

          for (idx = 0; idx < sheetCount; idx++) {
            allStyleSheets.push(importedSheets[idx]);
          }

          try {
            combinedCssContent.push(currentSheet.cssText);
          } catch(err){}
        }
      }

      // Wrap HTML5 elements with print-specific wrappers and inject transformed CSS
      combinedCssContent = transformCssForPrint(combinedCssContent.reverse().join(''));
      printWrappers = applyPrintWrappers(targetDocument);
      injectedStyleSheet = injectStyleBlock(targetDocument, combinedCssContent);

    });

    parentWindow.attachEvent('onafterprint', function() {
      // Remove wrappers, restoring original elements, and remove the injected style sheet
      cleanupPrintWrappers(printWrappers);
      clearTimeout(docMetadata._removeSheetTimer);
      docMetadata._removeSheetTimer = setTimeout(purgeStyleSheet, 500);
    });

    targetDocument.printShived = true;
    return targetDocument;
  }

  /*--------------------------------------------------------------------------*/

  // Extend the API for print functionality
  webComponents.implementationType += ' print';
  webComponents.prepareDocumentForPrinting = prepareDocumentForPrinting;

  // Apply print compatibility to the current document
  prepareDocumentForPrinting(docElem);

}(this, document));