(function(win, d) {

  var patchVer = '3.6.2-reimagined';

  var configSettings = win.legacyDom || {};

  var elementExclusionPattern = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

  var clonableTagPattern = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

  var hasModernStyleSupport;

  var domDataKey = '_legacyDomPatch';

  var domDataCounter = 0;

  var domRegistry = {};

  var canMakeNewElements;

  (function() {
    try {
      var dummyTestElement = d.createElement('someunknown');
      dummyTestElement.innerHTML = 'x';
      // If innerHTML correctly parses for an unknown tag, it supports unknown elements
      canMakeNewElements = (dummyTestElement.innerHTML === 'x' && dummyTestElement.childNodes.length === 1);

      var styleTestElement = d.createElement('a');
      // If the 'hidden' property is implemented, we can assume basic HTML5 styles are supported
      hasModernStyleSupport = ('hidden' in styleTestElement);

    } catch (e) {
      // If detection fails, assume worst case, then try to fix
      hasModernStyleSupport = true;
      canMakeNewElements = true;
    }
  }());

  /*--------------------------------------------------------------------------*/

  function injectStyleBlock(targetDoc, styleContent) {
    var newStyleElement = targetDoc.createElement('style');
    newStyleElement.type = 'text/css';
    var firstHeadChild = targetDoc.getElementsByTagName('head')[0] || targetDoc.documentElement;

    if (newStyleElement.styleSheet) { // IE-specific
      newStyleElement.styleSheet.cssText = styleContent;
    } else {
      newStyleElement.appendChild(targetDoc.createTextNode(styleContent));
    }
    return firstHeadChild.insertBefore(newStyleElement, firstHeadChild.firstChild);
  }

  function fetchTargetTags() {
    var tags = legacyDomFix.eligibleTags;
    return typeof tags === 'string' ? tags.split(' ') : tags;
  }

  function retrieveDomData(targetDoc) {
    var currentMap = domRegistry[targetDoc[domDataKey]];
    if (!currentMap) {
      currentMap = {};
      domDataCounter++;
      targetDoc[domDataKey] = domDataCounter;
      domRegistry[domDataCounter] = currentMap;
    }
    return currentMap;
  }

  function forgeElement(tagName, contextDoc, elementData) {
    if (!contextDoc) {
      contextDoc = d;
    }
    if (canMakeNewElements) {
      return contextDoc.createElement(tagName);
    }
    var documentMetadata = elementData || retrieveDomData(contextDoc);
    var createdNode;

    if (!documentMetadata.elementMemo) {
      documentMetadata.elementMemo = {};
      documentMetadata.tempFragmentForRegistration = documentMetadata.originalCreateFragment();
    }

    if (documentMetadata.elementMemo[tagName]) {
      createdNode = documentMetadata.elementMemo[tagName].cloneNode(false);
    } else {
      createdNode = documentMetadata.originalCreateElement(tagName);
      // For elements that can be cloned and are not in the skip list,
      // temporarily add to a fragment to "register" them with IE's parser.
      if (clonableTagPattern.test(tagName) && !elementExclusionPattern.test(tagName)) {
        documentMetadata.tempFragmentForRegistration.appendChild(createdNode);
        documentMetadata.elementMemo[tagName] = createdNode.cloneNode(false);
        documentMetadata.tempFragmentForRegistration.removeChild(createdNode);
      }
    }

    // Ensure elements that can have children and are not skipped are added to the fragment
    // for proper parsing/styling in older IE.
    return createdNode.canHaveChildren && !elementExclusionPattern.test(tagName) ? documentMetadata.tempFragmentForRegistration.appendChild(createdNode) : createdNode;
  }

  function constructFragment(contextDoc, elementData) {
    if (!contextDoc) {
      contextDoc = d;
    }
    if (canMakeNewElements) {
      return contextDoc.createDocumentFragment();
    }
    var documentMetadata = elementData || retrieveDomData(contextDoc);
    var freshFragment = documentMetadata.originalCreateFragment();

    // Override the createElement method of this new fragment
    // to ensure shivved elements are created correctly within it.
    freshFragment.createElement = function(tag) {
      return forgeElement(tag, contextDoc, documentMetadata);
    };
    return freshFragment;
  }

  function overrideDomCreation(targetDoc, docData) {
    if (!docData.elementMemo) { // Use a different name for cache
      docData.elementMemo = {};
      docData.originalCreateElement = targetDoc.createElement;
      docData.originalCreateFragment = targetDoc.createDocumentFragment;
      docData.tempFragmentForRegistration = docData.originalCreateFragment(); // Initialize for element registration
    }

    targetDoc.createElement = function(tagName) {
      if (!legacyDomFix.enableOverrides) {
        return docData.originalCreateElement(tagName);
      }
      return forgeElement(tagName, targetDoc, docData);
    };

    targetDoc.createDocumentFragment = function() {
      if (!legacyDomFix.enableOverrides) {
        return docData.originalCreateFragment();
      }
      return constructFragment(targetDoc, docData);
    };
  }

  /*--------------------------------------------------------------------------*/

  function processDocument(currentDoc) {
    if (!currentDoc) {
      currentDoc = d;
    }
    var docMetadata = retrieveDomData(currentDoc);

    if (legacyDomFix.enableCssInjection && !hasModernStyleSupport && !docMetadata.hasInjectedCss) {
      docMetadata.hasInjectedCss = !!injectStyleBlock(currentDoc,
        'article,aside,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
        'mark{background:#FF0;color:#000}' +
        'template{display:none}'
      );
    }
    if (!canMakeNewElements) {
      overrideDomCreation(currentDoc, docMetadata);
    }
    return currentDoc;
  }

  /*--------------------------------------------------------------------------*/

  var legacyDomFix = {

    'eligibleTags': configSettings.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

    'version': patchVer,

    'enableCssInjection': (configSettings.shivCSS !== false),

    'canMakeNewElements': canMakeNewElements,

    'enableOverrides': (configSettings.shivMethods !== false),

    'type': 'default',

    'processDocument': processDocument,

    createElement: forgeElement,

    createDocumentFragment: constructFragment
  };

  /*--------------------------------------------------------------------------*/

  win.legacyDom = legacyDomFix;

  processDocument(d);

  /*------------------------------- Print Shiv -------------------------------*/

  var printMediaPattern = /^$|\b(?:all|print)\b/;

  var printWrapperPrefix = 'legacyprint';

  var canHandlePrintStyles;

  (function() {
    var rootElement = d.documentElement;
    // Check for IE-specific APIs required for print shiv
    canHandlePrintStyles = !canMakeNewElements && (
      typeof d.namespaces !== 'undefined' &&
      typeof d.parentWindow !== 'undefined' &&
      typeof rootElement.applyElement !== 'undefined' && // This is used in the original, but I'll replace it
      typeof rootElement.removeNode !== 'undefined' && // This is used in the original, but I'll replace it
      typeof win.attachEvent !== 'undefined'
    );
  }());

  /*--------------------------------------------------------------------------*/

  function applyPrintWrappers(targetDoc) {
    var allElements = targetDoc.getElementsByTagName('*');
    var total = allElements.length;
    var targetTagRegex = new RegExp('^(?:' + fetchTargetTags().join('|') + ')$', 'i');
    var appliedWrappers = [];

    while (total--) {
      var currentElement = allElements[total];
      if (targetTagRegex.test(currentElement.nodeName)) {
        var newWrapper = buildPrintWrapper(currentElement);
        // Manually replace the element with a wrapper
        currentElement.parentNode.insertBefore(newWrapper, currentElement);
        newWrapper.appendChild(currentElement); // Move original element into wrapper
        appliedWrappers.push(newWrapper);
      }
    }
    return appliedWrappers;
  }

  function buildPrintWrapper(originalElement) {
    var sourceNode = originalElement;
    var attributeList = sourceNode.attributes;
    var attrCount = attributeList.length;
    var wrapperNode = sourceNode.ownerDocument.createElement(printWrapperPrefix + ':' + sourceNode.nodeName);

    // Copy element attributes to the wrapper
    while (attrCount--) {
      var currentAttr = attributeList[attrCount];
      if (currentAttr.specified) {
        wrapperNode.setAttribute(currentAttr.nodeName, currentAttr.nodeValue);
      }
    }
    // Copy element styles to the wrapper
    wrapperNode.style.cssText = sourceNode.style.cssText;
    return wrapperNode;
  }

  function transformCssSelectors(cssTextContent) {
    var sectionDelimiter = '{';
    var ruleParts = cssTextContent.split(sectionDelimiter);
    var partIndex = ruleParts.length;
    var selectorPattern = new RegExp('(^|[\\s,>+~])(' + fetchTargetTags().join('|') + ')(?=[[\\s,>+~#.:]|$)', 'gi');
    var replacementText = '$1' + printWrapperPrefix + '\\:$2';

    while (partIndex--) {
      var currentSection = ruleParts[partIndex].split('}');
      currentSection[currentSection.length - 1] = currentSection[currentSection.length - 1].replace(selectorPattern, replacementText);
      ruleParts[partIndex] = currentSection.join('}');
    }
    return ruleParts.join(sectionDelimiter);
  }

  function undoPrintWrappers(wrapperElements) {
    var wrapperCount = wrapperElements.length;
    while (wrapperCount--) {
      var currentWrapper = wrapperElements[wrapperCount];
      // Manually unwrap: move children out, then remove wrapper
      while (currentWrapper.firstChild) {
        currentWrapper.parentNode.insertBefore(currentWrapper.firstChild, currentWrapper);
      }
      currentWrapper.parentNode.removeChild(currentWrapper);
    }
  }

  /*--------------------------------------------------------------------------*/

  function enablePrintFix(targetDoc) {
    var docRef = targetDoc;
    var printMetadata = retrieveDomData(docRef);
    var docWindow = docRef.parentWindow;

    if (!canHandlePrintStyles || docRef.printActivated) {
      return docRef;
    }
    // IE-specific: Add namespace for print wrappers
    if (typeof docRef.namespaces[printWrapperPrefix] === 'undefined') {
      docRef.namespaces.add(printWrapperPrefix);
    }

    var activePrintSheet;
    var appliedPrintWrappers;

    function clearTempSheet() {
      clearTimeout(printMetadata.timeoutHandle);
      if (activePrintSheet) {
        activePrintSheet.parentNode.removeChild(activePrintSheet);
      }
      activePrintSheet = null;
    }

    docWindow.attachEvent('onbeforeprint', function() {
      clearTempSheet();

      var allStyleCollections = docRef.styleSheets;
      var styleArray = Array(allStyleCollections.length);
      var collectedCss = [];
      var idx = allStyleCollections.length;

      // Convert styleSheets collection to an array
      while (idx--) {
        styleArray[idx] = allStyleCollections[idx];
      }
      // Concat all style sheet CSS text
      var tempSheet;
      while ((tempSheet = styleArray.pop())) {
        if (!tempSheet.disabled && printMediaPattern.test(tempSheet.media)) {

          try {
            var importedSheets = tempSheet.imports;
            var importLen = importedSheets.length;
          } catch (err) {
            importLen = 0;
          }

          for (var i = 0; i < importLen; i++) {
            styleArray.push(importedSheets[i]);
          }

          try {
            collectedCss.push(tempSheet.cssText);
          } catch (err) {}
        }
      }

      // Wrap all HTML5 elements with printable elements and add the transformed style sheet
      var processedCss = transformCssSelectors(collectedCss.reverse().join(''));
      appliedPrintWrappers = applyPrintWrappers(docRef);
      activePrintSheet = injectStyleBlock(docRef, processedCss);
    });

    docWindow.attachEvent('onafterprint', function() {
      // Remove wrappers, leaving the original elements, and remove the shived style sheet
      undoPrintWrappers(appliedPrintWrappers);
      clearTimeout(printMetadata.timeoutHandle);
      printMetadata.timeoutHandle = setTimeout(clearTempSheet, 500);
    });

    docRef.printActivated = true;
    return docRef;
  }

  /*--------------------------------------------------------------------------*/

  legacyDomFix.type += ' print';
  legacyDomFix.enablePrintFix = enablePrintFix;

  enablePrintFix(d);

}(this, document));