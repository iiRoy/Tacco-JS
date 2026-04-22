/**
* @license DOM Elements Polyfill v3.6.2 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
*/
;(function(globalObj, domRef) {
  'use strict'; // Enforce strict mode for modern code style

  /** Library version identifier */
  const libVersion = '3.6.2';

  /** Initial configuration loaded from global scope */
  const configSettings = globalObj.domElementsPolyfill || {}; // Renamed html5 to domElementsPolyfill

  /** Regular expression to identify elements that should not be shived (e.g., form controls) */
  const elementSkipPattern = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

  /** Regular expression for elements that can be safely cloned in older IE */
  const clonableElementsPattern = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

  /** Flag indicating if the browser inherently supports HTML5 block-level styling */
  let hasModernStylesSupport;

  /** Key for storing internal data on a document object */
  const dataKey = '_domPolyfillData';

  /** Counter for unique document data IDs */
  let dataCounter = 0;

  /** Cache for document-specific shiv data */
  const documentCache = {};

  /** Flag indicating if the browser can create and style unknown HTML elements without shivving */
  let canCreateUnknownElements;

  // Feature detection block for HTML5 styles and unknown element creation
  (function() {
    try {
      const testAnchor = domRef.createElement('a');
      testAnchor.innerHTML = '<custom-tag></custom-tag>'; // Use a custom tag name

      // Check for 'hidden' property as a proxy for basic HTML5 styling support
      hasModernStylesSupport = testAnchor.hasOwnProperty('hidden'); // Using hasOwnProperty for robustness

      // Determine if unknown elements are rendered correctly
      canCreateUnknownElements = (testAnchor.childNodes.length === 1 && testAnchor.childNodes[0].nodeName.toLowerCase() === 'custom-tag') || (function() {
        // Fallback detection if direct check is ambiguous
        domRef.createElement('a'); // Ensure createElement is callable
        const testFragment = domRef.createDocumentFragment();
        return (
          typeof testFragment.cloneNode === 'undefined' ||
          typeof testFragment.createDocumentFragment === 'undefined' ||
          typeof testFragment.createElement === 'undefined'
        );
      }());
    } catch(err) {
      // If detection fails, assume the worst (no native support) to ensure shiv activates
      hasModernStylesSupport = false; // Changed to false to force shiv activation
      canCreateUnknownElements = false; // Changed to false to force shiv activation
      if (globalObj.console && typeof globalObj.console.warn === 'function') {
          globalObj.console.warn('DOM Elements Polyfill: Feature detection failed, assuming no native HTML5 support.', err);
      }
    }
  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Injects a style block with the given CSS content into the document's head.
   * @private
   * @param {Document} targetDoc The document to modify.
   * @param {String} styleContent The CSS rules to inject.
   * @returns {StyleSheet} The injected style element.
   */
  function injectStyleBlock(targetDoc, styleContent) {
    const tempContainer = targetDoc.createElement('p'); // Use a paragraph as a temporary wrapper
    const headOrRoot = targetDoc.querySelector('head') || targetDoc.documentElement; // Prefer head, fall back to document element

    tempContainer.innerHTML = `_x<style>${styleContent}</style>`; // Add a dummy char to ensure style tag is parsed
    const injectedStyle = tempContainer.lastChild; // The style element is the last child
    return headOrRoot.insertBefore(injectedStyle, headOrRoot.firstChild); // Insert at the beginning of head/root
  }

  /**
   * Retrieves the list of HTML5 element names to be shived.
   * @private
   * @returns {Array<String>} An array of element names.
   */
  function retrieveShivElements() {
    const elementList = shivCore.elementList;
    return typeof elementList === 'string' ? elementList.split(' ') : elementList;
  }

  /**
   * Fetches or initializes document-specific state data for shivving.
   * @private
   * @param {Document} targetDoc The document for which to retrieve data.
   * @returns {Object} An object containing document state.
   */
  function fetchDocumentState(targetDoc) {
    let docState = documentCache[targetDoc[dataKey]];
    if (!docState) {
        docState = {};
        dataCounter++;
        targetDoc[dataKey] = dataCounter;
        documentCache[dataCounter] = docState;
    }
    return docState;
  }

  /**
   * Generates a shived element for the specified tag name and document.
   * @memberOf shivCore
   * @param {String} tagName The name of the element to create.
   * @param {Document} [targetDoc=document] The context document.
   * @param {Object} [docState] The document's shiv state data.
   * @returns {Object} The shived element.
   */
  function generateElement(tagName, targetDoc, docState) {
    targetDoc = targetDoc || domRef; // Default to global document if not provided

    if (canCreateUnknownElements) {
        return targetDoc.createElement(tagName);
    }
    
    docState = docState || fetchDocumentState(targetDoc); // Ensure docState is available

    let elementNode;
    // Cache for elements that are frequently created
    if (docState.cachedNodes && docState.cachedNodes[tagName]) {
        elementNode = docState.cachedNodes[tagName].cloneNode(true); // Deep clone from cache
    } else if (clonableElementsPattern.test(tagName)) {
        // If clonable, create and cache it
        docState.cachedNodes = docState.cachedNodes || {}; // Ensure cache exists
        elementNode = (docState.cachedNodes[tagName] = docState.originalCreateElement(tagName)).cloneNode(true);
    } else {
        // Otherwise, just create it directly without caching
        elementNode = docState.originalCreateElement(tagName);
    }

    // Special handling for elements within fragments in IE < 9 to avoid issues
    // (e.g., attributes not settable, script execution, inaccessible links)
    if (elementNode.canHaveChildren && !elementSkipPattern.test(tagName)) {
        // Append to a master fragment to ensure it's "known" to the DOM
        docState.fragmentCache = docState.fragmentCache || docState.originalCreateFragment(); // Ensure master fragment exists
        return docState.fragmentCache.appendChild(elementNode);
    }
    return elementNode;
  }

  /**
   * Generates a shived DocumentFragment for the given document.
   * @memberOf shivCore
   * @param {Document} [targetDoc=document] The context document.
   * @param {Object} [docState] The document's shiv state data.
   * @returns {Object} The shived DocumentFragment.
   */
  function generateFragment(targetDoc, docState) {
    targetDoc = targetDoc || domRef; // Default to global document

    if (canCreateUnknownElements) {
        return targetDoc.createDocumentFragment();
    }
    
    docState = docState || fetchDocumentState(targetDoc);

    const fragmentClone = (docState.fragmentCache || docState.originalCreateFragment()).cloneNode(); // Clone the master fragment
    const elementsToShiv = retrieveShivElements();
    const len = elementsToShiv.length;

    // Ensure all shived elements are recognized within the new fragment
    for (let idx = 0; idx < len; idx++) {
        fragmentClone.createElement(elementsToShiv[idx]); // Call createElement on the fragment clone
    }
    return fragmentClone;
  }

  /**
   * Overrides the `createElement` and `createDocumentFragment` methods of the document.
   * @private
   * @param {Document|DocumentFragment} targetDoc The document to modify.
   * @param {Object} docState The document's shiv state data.
   */
  function overrideDocumentMethods(targetDoc, docState) {
    // Initialize cache and store original methods if not already done
    if (!docState.cachedNodes) {
        docState.cachedNodes = {};
        docState.originalCreateElement = targetDoc.createElement;
        docState.originalCreateFragment = targetDoc.createDocumentFragment;
        docState.fragmentCache = docState.originalCreateFragment(); // Master fragment
    }

    // Override createElement
    targetDoc.createElement = function(tagName) {
      // Abort shiv if method overriding is disabled
      if (!shivCore.enableMethodOverrides) {
          return docState.originalCreateElement(tagName);
      }
      return generateElement(tagName, targetDoc, docState);
    };

    // Override createDocumentFragment using a dynamic function constructor for specific IE behavior
    // This approach is kept to maintain the original's intent for older IE environments.
    const elementNamesForFragmentShiv = retrieveShivElements();
    let createElementCallsString = '';
    if (shivCore.enableMethodOverrides) {
        createElementCallsString = elementNamesForFragmentShiv.map(name => {
            docState.originalCreateElement(name); // Ensure original document knows the element
            docState.fragmentCache.createElement(name); // Ensure the master fragment knows it
            return `clonedFrag.createElement('${name}');`; // Call the cloned fragment's createElement
        }).join('');
    }

    targetDoc.createDocumentFragment = new Function('coreRef', 'state', `
        return function() {
            const clonedFrag = state.fragmentCache.cloneNode();
            // If method overriding is active, ensure these elements are recognized by the new fragment
            if (coreRef.enableMethodOverrides) {
                ${createElementCallsString}
            }
            return clonedFrag;
        };
    `)(shivCore, docState);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Applies the HTML5 shiv to the given document.
   * @memberOf shivCore
   * @param {Document} [targetDoc=document] The document to shiv.
   * @returns {Document} The shived document.
   */
  function processDocument(targetDoc) {
    targetDoc = targetDoc || domRef; // Default to global document
    const docState = fetchDocumentState(targetDoc);

    // If CSS shivving is enabled, styles are not natively supported, and not already shived
    if (shivCore.enableCssShiv && !hasModernStylesSupport && !docState.hasInjectedCss) {
      docState.hasInjectedCss = Boolean(injectStyleBlock(targetDoc,
        // Corrects block display for HTML5 elements in older IE
        'article,aside,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
        // Adds basic styling for mark element
        'mark{background:#FF0;color:#000}' +
        // Hides template element
        'template{display:none}'
      ));
    }
    // If unknown elements are not natively supported, override document methods
    if (!canCreateUnknownElements) {
      overrideDocumentMethods(targetDoc, docState);
    }
    return targetDoc;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The `shivCore` object exposes configuration and API for the polyfill.
   * @type Object
   * @example
   * // Options can be set before the script loads
   * window.domElementsPolyfill = { 'elementList': 'mark section', 'enableCssShiv': false, 'enableMethodOverrides': false };
   */
  const shivCore = {

    /**
     * An array or space-separated string of element names to be shived.
     * @memberOf shivCore
     * @type Array<String>|String
     */
    'elementList': configSettings.elementList || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

    /**
     * Current version of the polyfill.
     */
    'version': libVersion,

    /**
     * Flag to control insertion of the HTML5 style sheet.
     * @memberOf shivCore
     * @type Boolean
     */
    'enableCssShiv': (configSettings.enableCssShiv !== false),

    /**
     * Indicates if the browser supports creating unknown/HTML5 elements natively.
     * @memberOf shivCore
     * @type boolean
     */
    'supportsNativeUnknownElements': canCreateUnknownElements,

    /**
     * Flag to control whether `document.createElement` and `createDocumentFragment` are overwritten.
     * @memberOf shivCore
     * @type Boolean
     */
    'enableMethodOverrides': (configSettings.enableMethodOverrides !== false),

    /**
     * Describes the type of `shivCore` object ("default" or "default print").
     * @memberOf shivCore
     * @type String
     */
    'type': 'default',

    // Main function to process a document with the shiv
    'processDocument': processDocument,

    // Public API for creating a shived element
    createElement: generateElement,

    // Public API for creating a shived document fragment
    createDocumentFragment: generateFragment
  };

  /*--------------------------------------------------------------------------*/

  // Expose the shivCore object globally
  globalObj.domElementsPolyfill = shivCore;

  // Apply the shiv to the initial document
  processDocument(domRef);

  /*------------------------------- Print Shiv Enhancements -------------------------------*/

  /** Regular expression to filter media types for print stylesheets */
  const mediaTypePattern = /^$|\b(?:all|print)\b/;

  /** Namespace prefix for printable elements (e.g., `html5shiv:header`) */
  const shivPrefix = 'html5shiv';

  /** Flag indicating if the browser supports shivable style sheets for print */
  const canShivPrintStyles = !canCreateUnknownElements && (function() {
    // Attempt to detect if IE's proprietary methods for print shiv are available
    const docEl = domRef.documentElement;
    return Boolean(
      domRef.namespaces &&
      domRef.parentWindow &&
      docEl.applyElement &&
      docEl.removeNode &&
      globalObj.attachEvent // Check for IE-specific event model
    );
  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Wraps all identified HTML5 elements in the given document with printable elements.
   * (e.g., a "header" element becomes wrapped by a "html5shiv:header" element)
   * @private
   * @param {Document} targetDoc The document.
   * @returns {Array<Element>} An array of the added wrapper elements.
   */
  function applyPrintWrappers(targetDoc) {
    const allNodes = targetDoc.getElementsByTagName('*');
    let nodeCount = allNodes.length;
    const targetElementsRegex = RegExp('^(?:' + retrieveShivElements().join('|') + ')$', 'i');
    const addedWrappers = [];

    while (nodeCount--) {
      const elementNode = allNodes[nodeCount];
      if (targetElementsRegex.test(elementNode.nodeName)) {
        addedWrappers.push(elementNode.applyElement(createPrintWrapper(elementNode)));
      }
    }
    return addedWrappers;
  }

  /**
   * Creates a printable wrapper element for the given HTML5 element.
   * @private
   * @param {Element} originalElement The element to wrap.
   * @returns {Element} The newly created wrapper element.
   */
  function createPrintWrapper(originalElement) {
    const elementAttributes = originalElement.attributes;
    let attrCount = elementAttributes.length;
    // Create a namespaced wrapper element
    const wrapperNode = originalElement.ownerDocument.createElement(`${shivPrefix}:${originalElement.nodeName}`);

    // Copy all specified attributes from the original element to the wrapper
    while (attrCount--) {
      const currentAttr = elementAttributes[attrCount];
      if (currentAttr.specified) { // Only copy attributes that were explicitly set
        wrapperNode.setAttribute(currentAttr.nodeName, currentAttr.nodeValue);
      }
    }
    // Copy inline styles
    wrapperNode.style.cssText = originalElement.style.cssText;
    return wrapperNode;
  }

  /**
   * Transforms CSS text by prefixing HTML5 element selectors for print shiv.
   * (e.g., `header{}` becomes `html5shiv\:header{}`)
   * @private
   * @param {String} originalCssText The CSS text to transform.
   * @returns {String} The transformed CSS text.
   */
  function transformPrintCss(originalCssText) {
    const cssChunks = originalCssText.split('{');
    let chunkIndex = cssChunks.length;
    // Regex to find shivable element names in selectors
    const elementSelectorRegex = RegExp('(^|[\\s,>+~])(' + retrieveShivElements().join('|') + ')(?=[[\\s,>+~#.:]|$)', 'gi');
    const prefixReplacement = `$1${shivPrefix}\\:$2`; // The replacement string

    while (chunkIndex--) {
      const cssRuleParts = cssChunks[chunkIndex].split('}');
      // Apply the prefixing regex to the selector part (first part of the split)
      cssRuleParts[cssRuleParts.length - 1] = cssRuleParts[cssRuleParts.length - 1].replace(elementSelectorRegex, prefixReplacement);
      cssChunks[chunkIndex] = cssRuleParts.join('}');
    }
    return cssChunks.join('{');
  }

  /**
   * Removes the print-specific wrapper elements, restoring the original HTML5 elements.
   * @private
   * @param {Array<Element>} wrapperElements An array of the wrapper elements to remove.
   */
  function removePrintWrappers(wrapperElements) {
    let wrapperIndex = wrapperElements.length;
    while (wrapperIndex--) {
      wrapperElements[wrapperIndex].removeNode(); // IE-specific method to remove a node from its parent
    }
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Activates the print shiv for the given document.
   * This prepares the document for printing by applying necessary IE-specific hacks.
   * @memberOf shivCore
   * @param {Document} targetDoc The document to shiv for print.
   * @returns {Document} The shived document.
   */
  function activatePrintShiv(targetDoc) {
    let injectedPrintSheet;
    let activeWrappers;
    const docState = fetchDocumentState(targetDoc);
    const documentNamespaces = targetDoc.namespaces;
    const owningWindow = targetDoc.parentWindow;

    // Guard clause: Do not shiv if print styles are not supported or already shived
    if (!canShivPrintStyles || docState.printShivInitialized) {
      return targetDoc;
    }

    // Add the custom namespace if it doesn't exist
    if (documentNamespaces[shivPrefix] === undefined) {
      documentNamespaces.add(shivPrefix);
    }

    // Helper function to clean up the injected print stylesheet
    function disposePrintSheet() {
      clearTimeout(docState.sheetRemovalTimer);
      if (injectedPrintSheet) {
          injectedPrintSheet.removeNode(true); // Remove the style node
      }
      injectedPrintSheet = null;
    }

    // Attach event handler for before print
    owningWindow.attachEvent('onbeforeprint', function() {
      disposePrintSheet(); // Ensure any previous sheet is removed

      const styleSheetCollection = targetDoc.styleSheets;
      const cssRulesAccumulator = [];
      let currentSheet;
      let sheetIndex = styleSheetCollection.length;
      const allSheets = new Array(sheetIndex); // Pre-allocate array

      // Convert live collection to a static array for iteration
      while (sheetIndex--) {
        allSheets[sheetIndex] = styleSheetCollection[sheetIndex];
      }

      // Iterate through all stylesheets (including imported ones)
      while ((currentSheet = allSheets.pop())) {
        // Only process enabled stylesheets that apply to 'all' or 'print' media
        if (!currentSheet.disabled && mediaTypePattern.test(currentSheet.media)) {
          try {
            const importedSheets = currentSheet.imports;
            const importCount = importedSheets.length;
            for (let importIdx = 0; importIdx < importCount; importIdx++) {
              allSheets.push(importedSheets[importIdx]); // Add imported sheets to the processing queue
            }
          } catch(error) {
            // Ignore errors for cross-origin or problematic stylesheets
            if (globalObj.console && typeof globalObj.console.debug === 'function') {
                globalObj.console.debug('DOM Elements Polyfill: Could not process stylesheet imports.', error);
            }
          }

          try {
            cssRulesAccumulator.push(currentSheet.cssText); // Extract CSS text
          } catch(error) {
            // Ignore errors for stylesheets that cannot be read
            if (globalObj.console && typeof globalObj.console.debug === 'function') {
                globalObj.console.debug('DOM Elements Polyfill: Could not read stylesheet CSS text.', error);
            }
          }
        }
      }

      // Transform the accumulated CSS and inject it
      const combinedTransformedCss = transformPrintCss(cssRulesAccumulator.reverse().join(''));
      activeWrappers = applyPrintWrappers(targetDoc); // Apply the print wrappers
      injectedPrintSheet = injectStyleBlock(targetDoc, combinedTransformedCss); // Inject the transformed CSS
    });

    // Attach event handler for after print
    owningWindow.attachEvent('onafterprint', function() {
      removePrintWrappers(activeWrappers); // Remove the print wrappers
      clearTimeout(docState.sheetRemovalTimer);
      // Delay removal of the injected stylesheet to avoid flicker in some IE versions
      docState.sheetRemovalTimer = setTimeout(disposePrintSheet, 500);
    });

    docState.printShivInitialized = true; // Mark as initialized
    return targetDoc;
  }

  /*--------------------------------------------------------------------------*/

  // Extend the shivCore API for print functionality
  shivCore.type += ' print';
  shivCore.activatePrintShiv = activatePrintShiv;

  // Apply the print shiv to the initial document
  activatePrintShiv(domRef);

}(this, document));