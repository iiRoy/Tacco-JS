;(function(currentWindow, targetDocument) {
/*jshint evil:true */
  var _polyfillVersion = '1.0.0';

  var _polyfillSettings = currentWindow._polyConfig || {};

  var _ignoreElementsPattern = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

  var _clonableElementsPattern = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

  var _styleSupportPresent;

  var _documentTagId = '_domPolyfill';

  var _nextTagId = 0;

  var _documentMetadata = {};

  var _unknownElementCapable;

  (function() {
    try {
        var testDiv = targetDocument.createElement('div');
        testDiv.innerHTML = '<dummy></dummy>';
        _styleSupportPresent = ('hidden' in testDiv);

        _unknownElementCapable = testDiv.childNodes.length === 1 || (function() {
          targetDocument.createElement('span');
          var fragmentTest = targetDocument.createDocumentFragment();
          return (
            typeof fragmentTest.cloneNode === 'undefined' ||
            typeof fragmentTest.createDocumentFragment === 'undefined' ||
            typeof fragmentTest.createElement === 'undefined'
          );
        }());
    } catch(err) {
      _styleSupportPresent = true;
      _unknownElementCapable = true;
    }
  }());

  function ElementPolyfillEngine(docRef) {
    var self = this;

    docRef = docRef || targetDocument;

    var docSpecificData = _retrieveDocumentData(docRef);

    function _injectStyleBlock(ownerDoc, styleContent) {
      var container = ownerDoc.createElement('section'),
          targetParent = ownerDoc.getElementsByTagName('head')[0] || ownerDoc.documentElement;

      container.innerHTML = 'z<style>' + styleContent + '</style>';
      return targetParent.insertBefore(container.lastChild, targetParent.firstChild);
    }

    function _fetchElementList() {
      var configuredElements = _polyfillSettings.elementNames;
      return typeof configuredElements === 'string' ? configuredElements.split(' ') : configuredElements;
    }

    function _retrieveDocumentData(ownerDoc) {
      var stored = _documentMetadata[ownerDoc[_documentTagId]];
      if (!stored) {
          stored = {};
          _nextTagId++;
          ownerDoc[_documentTagId] = _nextTagId;
          _documentMetadata[_nextTagId] = stored;
      }
      return stored;
    }

    function _createPolyfilledElement(tagName, ownerDoc, dataCache){
      ownerDoc = ownerDoc || targetDocument;
      if(_unknownElementCapable){
          return ownerDoc.createElement(tagName);
      }
      dataCache = dataCache || _retrieveDocumentData(ownerDoc);
      var createdNode;

      if (dataCache.elementStore[tagName]) {
          createdNode = dataCache.elementStore[tagName].cloneNode();
      } else if (_clonableElementsPattern.test(tagName)) {
          createdNode = (dataCache.elementStore[tagName] = dataCache.originalCreateElement(tagName)).cloneNode();
      } else {
          createdNode = dataCache.originalCreateElement(tagName);
      }

      return createdNode.canHaveChildren && !_ignoreElementsPattern.test(tagName) ? dataCache.fragmentTemplate.appendChild(createdNode) : createdNode;
    }

    function _createPolyfilledFragment(ownerDoc, dataCache){
      ownerDoc = ownerDoc || targetDocument;
      if(_unknownElementCapable){
          return ownerDoc.createDocumentFragment();
      }
      dataCache = dataCache || _retrieveDocumentData(ownerDoc);
      var clonedFragment = dataCache.fragmentTemplate.cloneNode(),
          idx = 0,
          elementsToShiv = _fetchElementList(),
          numElements = elementsToShiv.length;
      for(;idx < numElements;idx++){
          clonedFragment.createElement(elementsToShiv[idx]);
      }
      return clonedFragment;
    }

    function _overrideDomMethods(ownerDoc, dataCache) {
      if (!dataCache.elementStore) {
          dataCache.elementStore = {};
          dataCache.originalCreateElement = ownerDoc.createElement;
          dataCache.originalCreateFragment = ownerDoc.createDocumentFragment;
          dataCache.fragmentTemplate = dataCache.originalCreateFragment();
      }

      ownerDoc.createElement = function(tag) {
        if (!_polyfillSettings.enableMethodOverrides) {
            return dataCache.originalCreateElement(tag);
        }
        return _createPolyfilledElement(tag, ownerDoc, dataCache);
      };

      var fragmentConstructorString = 'var newFragment=f.cloneNode(),elCreator=newFragment.createElement;';
      var allElements = _fetchElementList();
      if (_polyfillSettings.enableMethodOverrides) {
          fragmentConstructorString += allElements.join().replace(/\w+/g, function(elemName) {
            dataCache.originalCreateElement(elemName);
            dataCache.fragmentTemplate.createElement(elemName);
            return 'elCreator("' + elemName + '")';
          });
      }
      fragmentConstructorString += ';return newFragment';

      ownerDoc.createDocumentFragment = Function('config,f', 'return function(){' + fragmentConstructorString + '}')(_polyfillSettings, dataCache.fragmentTemplate);
    }

    function _applyPolyfillToDocument(ownerDoc) {
      ownerDoc = ownerDoc || targetDocument;
      var data = _retrieveDocumentData(ownerDoc);

      if (_polyfillSettings.enableCssFix && !_styleSupportPresent && !data.cssApplied) {
        data.cssApplied = !!_injectStyleBlock(ownerDoc,
          'article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
          'mark{background:#FF0;color:#000}'
        );
      }
      if (!_unknownElementCapable) {
        _overrideDomMethods(ownerDoc, data);
      }
      return ownerDoc;
    }

    self.versionTag = _polyfillVersion;
    self.elementRegistry = _polyfillSettings.elementNames || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary time video';
    self.applyCssEnhancements = (_polyfillSettings.enableCssFix !== false);
    self.supportsNativeElements = _unknownElementCapable;
    self.enableMethodOverrides = (_polyfillSettings.enableMethodOverrides !== false);
    self.modeIdentifier = 'standard';

    self.processDocument = _applyPolyfillToDocument;
    self.createCustomElement = _createPolyfilledElement;
    self.createCustomFragment = _createPolyfilledFragment;

    _applyPolyfillToDocument(docRef);

    var _mediaQueryFilter = /^$|\b(?:all|print)\b/;

    var _printNamespace = 'polyfillns';

    var _printSupportCapable = !_unknownElementCapable && (function() {
      var rootElement = targetDocument.documentElement;
      return !(
        typeof targetDocument.namespaces === 'undefined' ||
        typeof targetDocument.parentWindow === 'undefined' ||
        typeof rootElement.applyElement === 'undefined' ||
        typeof rootElement.removeNode === 'undefined' ||
        typeof currentWindow.attachEvent === 'undefined'
      );
    }());

    function _wrapHtml5Elements(ownerDoc) {
        var currentElement,
            allDomNodes = ownerDoc.getElementsByTagName('*'),
            nodeCount = allDomNodes.length,
            targetElementsPattern = RegExp('^(?:' + _fetchElementList().join('|') + ')$', 'i'),
            wrappedElements = [];

        while (nodeCount--) {
          currentElement = allDomNodes[nodeCount];
          if (targetElementsPattern.test(currentElement.nodeName)) {
            wrappedElements.push(currentElement.applyElement(_generateWrapper(currentElement)));
          }
        }
        return wrappedElements;
    }

    function _generateWrapper(originalElement) {
        var attribute,
            attributesList = originalElement.attributes,
            attrCount = attributesList.length,
            wrapperNode = originalElement.ownerDocument.createElement(_printNamespace + ':' + originalElement.nodeName);

        while (attrCount--) {
          attribute = attributesList[attrCount];
          attribute.specified && wrapperNode.setAttribute(attribute.nodeName, attribute.nodeValue);
        }
        wrapperNode.style.cssText = originalElement.style.cssText;
        return wrapperNode;
    }

    function _transformCssRules(cssInputText) {
        var segment,
            ruleBlocks = cssInputText.split('{'),
            blockIndex = ruleBlocks.length,
            elementMatcher = RegExp('(^|[\\s,>+~])(' + _fetchElementList().join('|') + ')(?=[[\\s,>+~#.:]|$)', 'gi'),
            replacementString = '$1' + _printNamespace + '\\:$2';

        while (blockIndex--) {
          segment = ruleBlocks[blockIndex] = ruleBlocks[blockIndex].split('}');
          segment[segment.length - 1] = segment[segment.length - 1].replace(elementMatcher, replacementString);
          ruleBlocks[blockIndex] = segment.join('}');
        }
        return ruleBlocks.join('{');
    }

    function _removeTemporaryWrappers(wrappersArray) {
        var wrapperIndex = wrappersArray.length;
        while (wrapperIndex--) {
          wrappersArray[wrapperIndex].removeNode();
        }
    }

    function _activatePrintPolyfill(ownerDoc) {
        var injectedSheet,
            tempWrappers,
            docSpecificData = _retrieveDocumentData(ownerDoc),
            domNamespaces = ownerDoc.namespaces,
            hostWindow = ownerDoc.parentWindow;

        if (!_printSupportCapable || ownerDoc.printProcessed) {
          return ownerDoc;
        }
        if (typeof domNamespaces[_printNamespace] === 'undefined') {
          domNamespaces.add(_printNamespace);
        }

        function _clearPrintSheet() {
          clearTimeout(docSpecificData._sheetRemovalTimer);
          if (injectedSheet) {
              injectedSheet.removeNode(true);
          }
          injectedSheet = null;
        }

        hostWindow.attachEvent('onbeforeprint', function() {
          _clearPrintSheet();

          var allImports,
              importCount,
              currentSheet,
              styleSheetCollection = ownerDoc.styleSheets,
              accumulatedCss = [],
              sheetCount = styleSheetCollection.length,
              sheetList = Array(sheetCount);

          while (sheetCount--) {
            sheetList[sheetCount] = styleSheetCollection[sheetCount];
          }
          while ((currentSheet = sheetList.pop())) {
            if (!currentSheet.disabled && _mediaQueryFilter.test(currentSheet.media)) {
              try {
                allImports = currentSheet.imports;
                importCount = allImports.length;
              } catch(error){
                importCount = 0;
              }

              for (var i = 0; i < importCount; i++) {
                sheetList.push(allImports[i]);
              }

              try {
                accumulatedCss.push(currentSheet.cssText);
              } catch(error){}
            }
          }

          accumulatedCss = _transformCssRules(accumulatedCss.reverse().join(''));
          tempWrappers = _wrapHtml5Elements(ownerDoc);
          injectedSheet = _injectStyleBlock(ownerDoc, accumulatedCss);
        });

        hostWindow.attachEvent('onafterprint', function() {
          _removeTemporaryWrappers(tempWrappers);
          clearTimeout(docSpecificData._sheetRemovalTimer);
          docSpecificData._sheetRemovalTimer = setTimeout(_clearPrintSheet, 500);
        });

        ownerDoc.printProcessed = true;
        return ownerDoc;
    }

    self.modeIdentifier += ' print_extended';
    self.processPrint = _activatePrintPolyfill;

    _activatePrintPolyfill(docRef);
  }

  currentWindow._elementPolyfill = new ElementPolyfillEngine(targetDocument);

}(this, document));