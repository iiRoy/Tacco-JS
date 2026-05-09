/**
 * @license HTML5 Element Polyfill v3.6.2pre | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
 * This is a modified version for enhanced compatibility and performance.
 */
;(function(globalWindow, targetDocument) {
  'use strict'; // Enforce strict mode for cleaner code

  /** Current version string of the polyfill. */
  const libVersion = '3.6.2pre';

  /** Configuration object, potentially from global scope. */
  let configSettings = globalWindow.html5 || {};

  /** Regular expression to identify elements that should not be cloned or processed with children. */
  const elementExclusionPattern = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

  /** Regular expression for elements that can be safely cloned in IE (to avoid issues). */
  const cloneableElementsPattern = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

  /** Flag indicating if the browser supports basic HTML5 styling rules (e.g., `hidden` attribute). */
  let hasModernCssSupport;

  /** Unique identifier key for document-specific data. */
  const dataKeyIdentifier = '_html5shim_data';

  /** Counter for assigning unique IDs to documents. */
  let currentIdCounter = 0;

  /** Cache for storing document-specific metadata and overrides. */
  const documentCache = {};

  /** Flag indicating if the browser can create unknown/HTML5 elements without issues. */
  let canCreateForeignElements;

  // --- Feature Detection Block ---
  (() => {
    let testAnchor;
    try {
      testAnchor = targetDocument.createElement('a');
      testAnchor.innerHTML = '<dummyElement></dummyElement>';

      // Check for HTML5 style support using the 'hidden' property.
      hasModernCssSupport = (testAnchor.hidden !== undefined); // Updated check

      // Determine if unknown elements are supported.
      // The original logic was complex and contained a no-op. Simplified here.
      // We check if a newly created fragment can create elements, and if cloneNode works.
      const tempFrag = targetDocument.createDocumentFragment();
      canCreateForeignElements = (testAnchor.childNodes.length === 1 && typeof tempFrag.cloneNode === 'function' && typeof tempFrag.createElement === 'function');

    } catch (err) {
      // If any error occurs during detection, assume no shimming is possible or necessary for safety.
      hasModernCssSupport = true;
      canCreateForeignElements = true;
    } finally {
      // Ensure testAnchor is cleaned up if it was created.
      if (testAnchor && testAnchor.parentNode) {
        testAnchor.parentNode.removeChild(testAnchor);
      }
    }
  })();

  // --- Core Utility Functions ---

  /**
   * Injects a style block into the document's head with the provided CSS content.
   * @private
   * @param {Document} targetDoc The document to modify.
   * @param {String} styleContent The CSS text to inject.
   * @returns {HTMLStyleElement} The injected style element.
   */
  function injectStyleBlock(targetDoc, styleContent) {
    const styleElem = targetDoc.createElement('style');
    styleElem.type = 'text/css'; // Explicitly set type for older IE.
    styleElem.appendChild(targetDoc.createTextNode(styleContent)); // More robust than innerHTML for style.

    const headOrRoot = targetDoc.getElementsByTagName('head')[0] || targetDoc.documentElement;
    if (headOrRoot) {
      headOrRoot.appendChild(styleElem); // Simpler append
    } else {
      // Fallback if head isn't ready, though unlikely for shiv.
      targetDoc.body.appendChild(styleElem);
    }
    return styleElem;
  }

  /**
   * Retrieves the list of HTML5 elements to be shived, from config settings.
   * @private
   * @returns {Array<String>} An array of element tag names.
   */
  function retrieveShivableElementNames() {
    const targetElements = shivManager.targetElements;
    return typeof targetElements === 'string' ? targetElements.split(' ') : Array.isArray(targetElements) ? targetElements : [];
  }

  /**
   * Fetches or initializes document-specific metadata for shiv operations.
   * @private
   * @param {Document} targetDoc The document for which to retrieve data.
   * @returns {Object} An object containing document-specific shiv data.
   */
  function fetchDocumentMetadata(targetDoc) {
    let docIdentifier = targetDoc[dataKeyIdentifier];
    let docInfo = documentCache[docIdentifier];

    if (!docInfo) {
      docInfo = {};
      currentIdCounter++;
      targetDoc[dataKeyIdentifier] = currentIdCounter;
      documentCache[currentIdCounter] = docInfo;
    }
    return docInfo;
  }

  /**
   * Creates an HTML5 element, ensuring it's properly shived if needed.
   * @memberOf shivManager
   * @param {String} tagName The name of the element to create.
   * @param {Document} [targetDoc] The context document; defaults to global `targetDocument`.
   * @param {Object} [docInfo] Pre-fetched document metadata.
   * @returns {Element} The created (and potentially shived) element.
   */
  function createShivedElement(tagName, targetDoc, docInfo) {
    targetDoc = targetDoc || targetDocument; // Use provided document or global default.

    if (canCreateForeignElements) {
      return targetDoc.createElement(tagName);
    }

    docInfo = docInfo || fetchDocumentMetadata(targetDoc);
    let elementNode;

    if (docInfo.elementCache && docInfo.elementCache[tagName]) {
      elementNode = docInfo.elementCache[tagName].cloneNode();
    } else if (cloneableElementsPattern.test(tagName)) {
      // Cache the element if it's safe to clone.
      const createdElem = docInfo.originalCreateElement(tagName);
      docInfo.elementCache = docInfo.elementCache || {}; // Ensure cache exists
      elementNode = (docInfo.elementCache[tagName] = createdElem).cloneNode();
    } else {
      elementNode = docInfo.originalCreateElement(tagName);
    }

    // Append to fragment if it can have children and isn't a special element.
    // This is to prevent issues in IE < 9.
    if (elementNode.canHaveChildren && !elementExclusionPattern.test(tagName)) {
      docInfo.fragmentContainer.appendChild(elementNode);
      return elementNode; // Return the node after appending to fragment.
    }
    return elementNode;
  }

  /**
   * Creates a DocumentFragment, ensuring HTML5 elements within it are shived.
   * @memberOf shivManager
   * @param {Document} [targetDoc] The context document; defaults to global `targetDocument`.
   * @param {Object} [docInfo] Pre-fetched document metadata.
   * @returns {DocumentFragment} The created (and potentially shived) DocumentFragment.
   */
  function createShivedFragment(targetDoc, docInfo) {
    targetDoc = targetDoc || targetDocument;

    if (canCreateForeignElements) {
      return targetDoc.createDocumentFragment();
    }

    docInfo = docInfo || fetchDocumentMetadata(targetDoc);
    const fragmentClone = docInfo.fragmentContainer.cloneNode();
    const elementList = retrieveShivableElementNames();
    const fragmentCreateElement = fragmentClone.createElement; // Cache reference for performance

    for (let idx = 0; idx < elementList.length; idx++) {
      fragmentCreateElement(elementList[idx]); // Shiv elements within the fragment.
    }
    return fragmentClone;
  }

  /**
   * Overrides the document's `createElement` and `createDocumentFragment` methods
   * to provide shiv functionality.
   * @private
   * @param {Document|DocumentFragment} targetDoc The document or fragment to modify.
   * @param {Object} docInfo The document's metadata object.
   */
  function overrideDomMethods(targetDoc, docInfo) {
    if (!docInfo.elementCache) {
      docInfo.elementCache = {};
      docInfo.originalCreateElement = targetDoc.createElement;
      docInfo.originalCreateFragment = targetDoc.createDocumentFragment;
      docInfo.fragmentContainer = docInfo.originalCreateFragment(); // Initialize a base fragment.
    }

    // Override createElement
    targetDoc.createElement = function(tagName) {
      // If shiving methods are disabled, use the original method.
      if (!shivManager.shivMethodsEnabled) {
        return docInfo.originalCreateElement(tagName);
      }
      return createShivedElement(tagName, targetDoc, docInfo);
    };

    // Override createDocumentFragment - a more direct implementation than the original's Function constructor.
    targetDoc.createDocumentFragment = function() {
      const newFragment = docInfo.originalCreateFragment();
      if (shivManager.shivMethodsEnabled) {
        const fragmentCreator = newFragment.createElement;
        const elementNames = retrieveShivableElementNames();
        for (let i = 0; i < elementNames.length; i++) {
          fragmentCreator(elementNames[i]); // Ensure shived elements are created within the fragment.
        }
      }
      return newFragment;
    };
  }

  // --- Main Shiv Functionality ---

  /**
   * Processes a given document to apply HTML5 shivs.
   * @memberOf shivManager
   * @param {Document} [targetDoc] The document to shiv; defaults to global `targetDocument`.
   * @returns {Document} The shived document.
   */
  function processDocumentForShiv(targetDoc) {
    targetDoc = targetDoc || targetDocument;
    const docInfo = fetchDocumentMetadata(targetDoc);

    // Inject default HTML5 CSS if enabled, not supported natively, and not yet injected.
    if (shivManager.injectCss && !hasModernCssSupport && !docInfo.hasInjectedCss) {
      const defaultCss = [
        'article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}', // Block display for HTML5 elements
        'mark{background:#FF0;color:#000}' // Default styling for <mark>
      ].join('');
      docInfo.hasInjectedCss = Boolean(injectStyleBlock(targetDoc, defaultCss));
    }

    // Override DOM methods if unknown elements are not natively supported.
    if (!canCreateForeignElements) {
      overrideDomMethods(targetDoc, docInfo);
    }
    return targetDoc;
  }

  // --- Shiv Manager Configuration Object ---

  /**
   * The `shivManager` object exposes configuration and API for HTML5 shiv operations.
   * @type Object
   * @example
   * // Options can be set before including the script:
   * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
   */
  const shivManager = {
    /**
     * An array or space-separated string of element names to be shived.
     * @memberOf shivManager
     * @type Array<String>|String
     */
    'targetElements': configSettings.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary time video',

    /**
     * Current version of the HTML5 shiv.
     */
    'version': libVersion,

    /**
     * Flag to enable/disable injection of default HTML5 CSS.
     * @memberOf shivManager
     * @type Boolean
     */
    'injectCss': (configSettings.shivCSS !== false), // Default true

    /**
     * Indicates if the browser supports creating unknown/HTML5 elements directly.
     * @memberOf shivManager
     * @type boolean
     */
    'supportsNativeUnknownElements': canCreateForeignElements,

    /**
     * Flag to enable/disable overriding `createElement` and `createDocumentFragment` methods.
     * @memberOf shivManager
     * @type Boolean
     */
    'shivMethodsEnabled': (configSettings.shivMethods !== false), // Default true

    /**
     * Describes the type of `shivManager` object ("default" or "default print").
     * @memberOf shivManager
     * @type String
     */
    'type': 'default',

    // Public API functions
    'processDocument': processDocumentForShiv,
    'createShivedElement': createShivedElement,
    'createShivedFragment': createShivedFragment
  };

  // Expose the shivManager object globally
  globalWindow.html5 = shivManager;

  // Apply shiv to the initial document
  processDocumentForShiv(targetDocument);

  // --- Print Shiv Functionality ---

  /** Regular expression to filter media types for print. */
  const printMediaPattern = /^$|\b(?:all|print)\b/;

  /** XML namespace prefix for print shiv wrappers. */
  const xmlNamespacePrefix = 'html5shiv';

  /** Flag indicating if the browser supports shivable stylesheets for printing (IE-specific). */
  let canHandlePrintStyles = !canCreateForeignElements && (() => {
    // Assign a false negative if unable to shiv, or if certain IE-specific APIs are missing.
    const htmlRoot = targetDocument.documentElement;
    // Check for IE-specific APIs related to namespaces and element manipulation for print.
    return !(
      typeof targetDocument.namespaces === 'undefined' ||
      typeof targetDocument.parentWindow === 'undefined' || // parentWindow for IE
      typeof htmlRoot.applyElement === 'undefined' ||
      typeof htmlRoot.removeNode === 'undefined' ||
      typeof globalWindow.attachEvent === 'undefined' // IE event model
    );
  })();

  /**
   * Wraps all identified HTML5 elements in the document with print-specific wrapper elements.
   * @private
   * @param {Document} targetDoc The document to process.
   * @returns {Array<Element>} An array of the added wrapper elements.
   */
  function wrapHtml5Elements(targetDoc) {
    const allNodes = targetDoc.getElementsByTagName('*');
    const elementNames = retrieveShivableElementNames();
    const matchedElementsPattern = new RegExp('^(?:' + elementNames.join('|') + ')$', 'i');
    const wrapperCollection = [];

    // Iterate backwards for safer node removal/replacement.
    for (let j = allNodes.length - 1; j >= 0; j--) {
      const currentNode = allNodes[j];
      if (matchedElementsPattern.test(currentNode.nodeName)) {
        // Apply the wrapper and add the result to the collection.
        wrapperCollection.push(currentNode.applyElement(generatePrintWrapper(currentNode)));
      }
    }
    return wrapperCollection;
  }

  /**
   * Creates a printable wrapper element for a given HTML5 element.
   * @private
   * @param {Element} originalElement The original HTML5 element.
   * @returns {Element} The generated wrapper element.
   */
  function generatePrintWrapper(originalElement) {
    const generatedWrapper = originalElement.ownerDocument.createElement(xmlNamespacePrefix + ':' + originalElement.nodeName);
    const nodeAttributes = originalElement.attributes;

    // Copy attributes from the original element to the wrapper.
    for (let k = nodeAttributes.length - 1; k >= 0; k--) {
      const attr = nodeAttributes[k];
      if (attr && attr.specified) { // Check if attribute was explicitly set.
        generatedWrapper.setAttribute(attr.nodeName, attr.nodeValue);
      }
    }
    // Copy inline styles.
    generatedWrapper.style.cssText = originalElement.style.cssText;
    return generatedWrapper;
  }

  /**
   * Transforms CSS text by prefixing HTML5 element selectors for print shiving.
   * (e.g., `header{}` becomes `html5shiv\:header{}`)
   * @private
   * @param {String} originalCssText The CSS text to transform.
   * @returns {String} The shived CSS text.
   */
  function transformPrintCss(originalCssText) {
    const cssRuleParts = originalCssText.split('{');
    const elementNames = retrieveShivableElementNames();
    const selectorReplacementPattern = new RegExp('(^|[\\s,>+~])(' + elementNames.join('|') + ')(?=[[\\s,>+~#.:]|$)', 'gi');
    const prefixReplacement = '$1' + xmlNamespacePrefix + '\\:$2';

    // Process each part of the CSS (selector block, then rules).
    for (let i = cssRuleParts.length - 1; i >= 0; i--) {
      const cssRulePair = cssRuleParts[i].split('}');
      if (cssRulePair.length > 0) {
        // Replace element selectors in the first part of the pair (the selector).
        cssRulePair[0] = cssRulePair[0].replace(selectorReplacementPattern, prefixReplacement);
      }
      cssRuleParts[i] = cssRulePair.join('}');
    }
    return cssRuleParts.join('{');
  }

  /**
   * Removes the print-specific wrapper elements, restoring the original HTML5 elements.
   * @private
   * @param {Array<Element>} activeWrappers An array of wrapper elements to remove.
   */
  function restoreOriginalElements(activeWrappers) {
    for (let l = activeWrappers.length - 1; l >= 0; l--) {
      if (activeWrappers[l] && typeof activeWrappers[l].removeNode === 'function') {
        activeWrappers[l].removeNode(); // IE-specific removal.
      }
    }
  }

  // --- Print Shiv Orchestration ---

  /**
   * Applies print-specific shims to a given document.
   * This involves wrapping HTML5 elements and injecting print stylesheets.
   * @memberOf shivManager
   * @param {Document} targetDoc The document to shiv for print.
   * @returns {Document} The shived document.
   */
  function applyPrintShims(targetDoc) {
    const docInfo = fetchDocumentMetadata(targetDoc);
    const domNamespaces = targetDoc.namespaces;
    const parentWindowRef = targetDoc.parentWindow || globalWindow; // Fallback to globalWindow for non-IE

    // Only proceed if print shiving is supported and not already applied.
    if (!canHandlePrintStyles || docInfo.printShivedFlag) {
      return targetDoc;
    }

    // Ensure the XML namespace is defined for print wrappers.
    if (typeof domNamespaces[xmlNamespacePrefix] === 'undefined') {
      domNamespaces.add(xmlNamespacePrefix);
    }

    let dynamicPrintStylesheet = null;
    let currentWrappers = [];

    /** Cleans up the dynamically injected print stylesheet. */
    const cleanupPrintSheet = function() {
      if (docInfo.removeSheetTimer) {
        clearTimeout(docInfo.removeSheetTimer);
      }
      if (dynamicPrintStylesheet) {
        if (typeof dynamicPrintStylesheet.removeNode === 'function') {
          dynamicPrintStylesheet.removeNode(true);
        } else if (dynamicPrintStylesheet.parentNode) {
          dynamicPrintStylesheet.parentNode.removeChild(dynamicPrintStylesheet);
        }
      }
      dynamicPrintStylesheet = null;
    };

    // Attach event listener for before print (IE-specific).
    parentWindowRef.attachEvent('onbeforeprint', function() {
      cleanupPrintSheet(); // Clear any previous sheet.

      let allCssText = [];
      const stylesheetCollection = targetDoc.styleSheets;
      const temporaryStylesheetArray = [];

      // Convert live collection to array.
      for (let i = 0; i < stylesheetCollection.length; i++) {
        temporaryStylesheetArray.push(stylesheetCollection[i]);
      }

      let currentSheet;
      // Concatenate CSS text from all applicable stylesheets.
      while ((currentSheet = temporaryStylesheetArray.pop())) {
        // Only process enabled sheets with 'all' or 'print' media types.
        if (!currentSheet.disabled && printMediaPattern.test(currentSheet.media)) {
          let importedSheets;
          try {
            importedSheets = currentSheet.imports; // IE-specific property for imported stylesheets.
            for (let i = 0; i < importedSheets.length; i++) {
              temporaryStylesheetArray.push(importedSheets[i]); // Add imported sheets to be processed.
            }
          } catch (er) {
            // Ignore errors for cross-origin or inaccessible stylesheets.
          }

          try {
            allCssText.push(currentSheet.cssText); // Get the CSS content.
          } catch (er) {
            // Ignore errors for inaccessible cssText.
          }
        }
      }

      // Transform and inject the collected CSS, then wrap elements.
      const transformedCss = transformPrintCss(allCssText.reverse().join(''));
      currentWrappers = wrapHtml5Elements(targetDoc);
      dynamicPrintStylesheet = injectStyleBlock(targetDoc, transformedCss);
    });

    // Attach event listener for after print (IE-specific).
    parentWindowRef.attachEvent('onafterprint', function() {
      restoreOriginalElements(currentWrappers); // Remove wrappers.
      currentWrappers = []; // Clear the reference.
      // Schedule cleanup of the print stylesheet after a short delay.
      docInfo.removeSheetTimer = setTimeout(cleanupPrintSheet, 500);
    });

    docInfo.printShivedFlag = true; // Mark document as print-shived.
    return targetDoc;
  }

  // --- Expose Print API and Apply ---
  shivManager.type += ' print';
  shivManager.applyPrintShims = applyPrintShims;

  // Apply print shiv to the initial document
  applyPrintShims(targetDocument);

})(window, document);