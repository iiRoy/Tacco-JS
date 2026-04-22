//
// Input Prediction Module
// License: Custom. Copyright 2024 Your Name
//
(function (globalWindow, htmlDocument, notDefined) {
  'use strict';

  var PredictionSystemPrototype;
  var InputPredictionSystem = function (inputElement, settings) {
    if ((this.inputField = (typeof (inputElement) === 'string') ? getElementByIdOrSelector(inputElement) : inputElement)) {
      if ((this.inputField.tagName || '').toLowerCase() === 'input') {
        this.boundValidateInput = delegateContext(this.validateInput, this);
        this.dataStore = new Object();
        this.suggestionPanel = null;
        this.pauseHandle = null;
        this.fieldActive = false;
        this.activeSuggestionIndex = -1;
        this.previousInputValue = '';
        this.lastCallbackValue = null;
        this.displayedSuggestions = new Array();
        this.updateFrequency = 0;
        this.isTouchDevice = (globalWindow.ontouchstart !== notDefined);
        this.sourceData = new Array();
        this.configure(settings);
        this.initialize();
      }
    }
  };

  // Internal reference to the prediction system's prototype
  (PredictionSystemPrototype = InputPredictionSystem.prototype).noop = function () {
  };

  PredictionSystemPrototype.configure = function (settings) {
    var hasProperty = Object.prototype.hasOwnProperty;
    var settingKey;

    this.configuration = {
      useNativeInterface: true,
      verticalOffset: 0,
      horizontalOffset: 0,
      maximumChoices: 6,
      highlightTextColor: '#ffffff',
      highlightBackgroundColor: '#3399ff',
      sourceKind: '', // "array", "dom", "xml"
      sourcePayload: '',
      onInputCallback: this.noop,
      inputDelayMs: 0
    };

    if (settings) {
      for (settingKey in this.configuration) {
        if (hasProperty.call(this.configuration, settingKey) && settings[settingKey] !== notDefined) {
          this.configuration[settingKey] = settings[settingKey];
        }
      }
    }
  };

  PredictionSystemPrototype.initialize = function () {
    var dataType = this.configuration.sourceKind;
    var dataListElem, dataListIdentifier, boundFocusHandler;

    this.sourceData = (dataType === 'array') ? (this.configuration.sourcePayload || []).slice() :
      (dataType === 'dom') ? this.retrieveDomEntries() :
        (dataType === 'xml') ? this.retrieveXmlEntries() : [];

    if (hasDatalistFeature && this.configuration.useNativeInterface) {
      if (this.configuration.onInputCallback !== this.noop) {
        attachEventHandler(this.inputField, 'input', this.boundValidateInput);
      }
      return this.prepareSuggestionList();
    }

    if (hasDatalistFeature && (dataListIdentifier = this.inputField.getAttribute('list'))) {
      if ((dataListElem = getElementByIdOrSelector(dataListIdentifier))) {
        dataListElem.parentNode.removeChild(dataListElem);
      }
      this.inputField.removeAttribute('list');
    }

    boundFocusHandler = delegateContext(this.handleFieldFocus, this);
    attachEventHandler(this.inputField, 'focus', boundFocusHandler);
    attachEventHandler(this.inputField, 'blur', boundFocusHandler);
    if (htmlDocument.activeElement === this.inputField) {
      boundFocusHandler({ type: 'focus' });
    }
  };

  PredictionSystemPrototype.retrieveDomEntries = function () {
    var dataListIdentifier = this.inputField.getAttribute('list');
    var panel = (dataListIdentifier) ? (getElementByIdOrSelector(dataListIdentifier) || {}).parentNode : null;
    var items = (panel) ? panel.getElementsByTagName('option') : [];
    var item, idxA, idxB, entries = [];

    for (idxA = 0, idxB = 0; item = items[idxA]; idxA++) {
      if ((item = item.value) !== notDefined) {
        entries[idxB++] = item;
      }
    }
    return entries;
  };

  PredictionSystemPrototype.retrieveXmlEntries = function () {
    var xmlDoc = parseXmlString(this.configuration.sourcePayload);
    var xmlNodes, xmlNode, nodeCount, entryText, idxB, entries = [];

    if ((xmlNodes = (xmlDoc.getElementsByTagName('datalist')[0] || {}).childNodes)) {
      for (nodeCount = 0, idxB = 0; xmlNode = xmlNodes[nodeCount]; nodeCount++) {
        if (xmlNode.nodeName === 'option' && (entryText = xmlNode.getAttribute('value')) !== null) {
          entries[idxB++] = entryText;
        }
      }
    }

    return entries;
  };

  PredictionSystemPrototype.prepareSuggestionList = function () {
    var dataListIdentifier = this.inputField.getAttribute('list');
    var panel = (this.suggestionPanel = (dataListIdentifier && getElementByIdOrSelector(dataListIdentifier)));

    if (!panel) {
      panel = (this.suggestionPanel = htmlDocument.createElement('datalist'));
      panel.id = 'list_id_' + Math.floor(Math.random() * 99999);
      panel.innerHTML = this.buildListOptionsMarkup();
      this.inputField.parentNode.insertBefore(panel, this.inputField.nextSibling);
      this.inputField.setAttribute('list', panel.id);
    } else if (this.configuration.sourceKind !== 'dom') {
      panel.innerHTML = this.buildListOptionsMarkup();
    }
  };

  PredictionSystemPrototype.buildListOptionsMarkup = function () {
    if (this.sourceData.length) {
      return '<option value="' + this.sourceData.join('"><option value="') + '">';
    }
    return '';
  };

  PredictionSystemPrototype.handleFieldFocus = function (evt) {
    var isFocusEvent = (((evt || globalWindow.event).type || '').toLowerCase() === 'focus');

    if ((this.fieldActive = isFocusEvent)) {
      if (!this.suggestionPanel) {
        this.previousInputValue = this.inputField.value;
        this.createDisplayBox();
        this.attachInputEventHandlers(evt);
      }
    } else if (this.displayedSuggestions.length) {
      this.hideSuggestions();
    }
  };

  PredictionSystemPrototype.createDisplayBox = function () {
    var outerWrapper = htmlDocument.createElement('div');
    var panel = (this.suggestionPanel = htmlDocument.createElement('div'));
    var panelStyle, fieldStyle, wrapperDisplay;

    if ((fieldStyle = globalWindow.getComputedStyle) && (fieldStyle = fieldStyle(this.inputField, null))) {
      wrapperDisplay = fieldStyle.getPropertyValue('display');
    } else if ((fieldStyle = this.inputField.currentStyle)) {
      wrapperDisplay = fieldStyle['display'];
    }

    panel.className = 'prediction_box';
    if (!this.isTouchDevice) {
      attachEventHandler(panel, 'mousemove', delegateContext(this.markSuggestion, this));
      if (ieBrowserVersion === notDefined || ieBrowserVersion >= 9) {
        attachEventHandler(panel, 'mousedown', haltEvent);
        attachEventHandler(panel, 'mouseup', delegateContext(this.chooseSuggestion, this));
      } else {
        attachEventHandler(panel, 'mousedown', delegateContext(this.chooseSuggestion, this));
      }
    } else {
      attachEventHandler(panel, 'touchstart', delegateContext(this.markSuggestion, this));
      attachEventHandler(panel, 'touchend', delegateContext(this.chooseSuggestion, this));
    }
    (panelStyle = panel.style).minWidth = this.inputField.offsetWidth + 'px';
    panelStyle.marginLeft = this.configuration.horizontalOffset + 'px';
    panelStyle.marginTop = (this.inputField.offsetHeight + this.configuration.verticalOffset) + 'px';

    outerWrapper.className = 'prediction_wrapper';
    outerWrapper.style.display = wrapperDisplay || 'block';
    outerWrapper.appendChild(panel);
    this.inputField.parentNode.insertBefore(outerWrapper, this.inputField);
  };

  PredictionSystemPrototype.attachInputEventHandlers = function (evt) {
    var boundSelectionMonitor;

    if (ieBrowserVersion === notDefined || ieBrowserVersion >= 9) {
      attachEventHandler(this.inputField, 'input', this.boundValidateInput);
      if (ieBrowserVersion === 9) {
        boundSelectionMonitor = delegateContext(this.manageSelectionChangeEvents, this);
        attachEventHandler(this.inputField, 'focus', boundSelectionMonitor);
        attachEventHandler(this.inputField, 'blur', boundSelectionMonitor);
        boundSelectionMonitor(evt);
      }
    } else {
      attachEventHandler(this.inputField, 'propertychange', delegateContext(this.detectPropertyChange, this));
    }

    attachEventHandler(this.inputField, 'keydown', delegateContext(this.processKeyEvent, this));
  };

  PredictionSystemPrototype.manageSelectionChangeEvents = function (evt) {
    if (evt.type === 'focus') {
      attachEventHandler(htmlDocument, 'selectionchange', this.boundValidateInput);
    } else {
      detachEventHandler(htmlDocument, 'selectionchange', this.boundValidateInput);
    }
  };

  PredictionSystemPrototype.detectPropertyChange = function () {
    if (this.fieldActive && globalWindow.event.propertyName === 'value') {
      this.validateInput(globalWindow.event);
    }
  };

  PredictionSystemPrototype.validateInput = function (evt) {
    var currentInput = this.inputField.value;
    var previousInput = this.previousInputValue;
    var delayMs;

    if (currentInput !== previousInput) {
      this.findMatchingEntries(currentInput);

      if ((delayMs = this.configuration.inputDelayMs) > 0) {
        if (this.lastCallbackValue === null) {
          this.lastCallbackValue = previousInput;
        }
        this.pauseHandle = (this.pauseHandle) ? globalWindow.clearTimeout(this.pauseHandle) : null;
        this.pauseHandle = globalWindow.setTimeout(delegateContext(function () {
          this.configuration.onInputCallback.apply(this, [currentInput, this.lastCallbackValue]);
          this.lastCallbackValue = null;
        }, this), delayMs);
      } else {
        this.configuration.onInputCallback.apply(this, [currentInput, previousInput]);
      }
      this.previousInputValue = currentInput;
    }
  };

  PredictionSystemPrototype.findMatchingEntries = function (inputValue) {
    var escapePattern, matchOutcome, matchPattern, searchText, maximumChoices, foundResults;
    var foundMatches = [], matchIndex = 0;

    if (!hasDatalistFeature || !this.configuration.useNativeInterface) {
      if (inputValue && !(foundResults = this.dataStore['res-' + inputValue])) {
        escapePattern = this.dataStore.escapePattern || (this.dataStore.escapePattern = /([-.*+?^${}()|[\]/\\])/g);
        matchPattern = new RegExp('^(' + inputValue.replace(escapePattern, '\\$1') + '.*)$', 'igm');
        searchText = this.dataStore.allEntries || (this.dataStore.allEntries = this.sourceData.sort().join('\n'));
        maximumChoices = this.configuration.maximumChoices;

        while ((matchOutcome = (matchPattern.exec(searchText) || [])[0])) {
          if (inputValue !== matchOutcome) {
            foundMatches[matchIndex++] = matchOutcome;
            if (matchIndex === maximumChoices) {
              break;
            }
          }
        }
        foundResults = (this.dataStore['res-' + inputValue] = foundMatches);
      }
      if (foundResults && foundResults.length) {
        this.displaySuggestions(foundResults);
      } else {
        this.hideSuggestions();
      }
    }
  };

  PredictionSystemPrototype.processKeyEvent = function (evt) {
    var keyCode = (evt = evt || globalWindow.event).which || evt.keyCode;
    var validKeys = { 9: 1, 13: 1, 27: 1, 38: 1, 40: 1 };
    var visibleSuggestionsCount;

    if (validKeys[keyCode]) {
      if (keyCode === 9 || keyCode === 13) {
        if (this.activeSuggestionIndex > -1) {
          this.chooseSuggestion(evt);
        } else if (keyCode === 13 && globalWindow.opera) {
          globalWindow.setTimeout(delegateContext(this.hideSuggestions, this), 0);
        } else {
          this.hideSuggestions();
        }
      } else if (keyCode === 27) {
        this.hideSuggestions();
      } else {
        if ((visibleSuggestionsCount = this.displayedSuggestions.length)) {
          if ((keyCode === 38 && this.activeSuggestionIndex === 0) ||
            (keyCode === 40 && this.activeSuggestionIndex === visibleSuggestionsCount - 1)) {
            this.setSelectedIndex(-1);
          } else if (keyCode === 38 && this.activeSuggestionIndex === -1) {
            this.setSelectedIndex(visibleSuggestionsCount - 1);
          } else {
            this.setSelectedIndex(this.activeSuggestionIndex + ((keyCode === 38) ? -1 : 1));
          }
        } else {
          this.validateInput(evt);
        }
      }
    }
  };

  PredictionSystemPrototype.displaySuggestions = function (suggestions) {
    var markupArray = [], markupIndex = 0;
    var replacePattern = /</g;
    var replaceString = '&lt;';
    var totalLength, loopIndex;

    markupArray[markupIndex++] = '<ul class="suggest_list">';
    for (loopIndex = 0, totalLength = suggestions.length; loopIndex < totalLength; loopIndex++) {
      markupArray[markupIndex++] = '<li data-index="' + loopIndex + '" class="suggest_item">' + suggestions[loopIndex].replace(replacePattern, replaceString) + '</li>';
    }
    markupArray[markupIndex++] = '</ul>';

    this.activeSuggestionIndex = -1;
    this.displayedSuggestions = suggestions.slice();
    this.suggestionPanel.innerHTML = markupArray.join('');
  };

  PredictionSystemPrototype.markSuggestion = function (evt) {
    var eventTarget, targetClassName, selectedIdx;

    if (this.isTouchDevice || (this.updateFrequency++) & 1) {
      eventTarget = (evt = evt || globalWindow.event).target || evt.srcElement;
      targetClassName = eventTarget.className || '';

      while (targetClassName.indexOf('suggest_item') === -1 && targetClassName !== 'prediction_box') {
        targetClassName = (eventTarget = eventTarget.parentNode).className || '';
      }
      if (targetClassName.indexOf('suggest_item') > -1) {
        if ((selectedIdx = parseInt(eventTarget.getAttribute('data-index') || -1, 10)) > -1) {
          this.setSelectedIndex(selectedIdx);
        }
      }
    }
  };

  PredictionSystemPrototype.setSelectedIndex = function (newIndex) {
    var candidateItems, itemStyle;

    if ((newIndex = Math.max(-1, newIndex)) !== this.activeSuggestionIndex) {
      if (newIndex < this.displayedSuggestions.length) {
        if (newIndex > -1 || this.activeSuggestionIndex > -1) {
          candidateItems = this.suggestionPanel.firstChild.children;
        }

        if (newIndex > -1) {
          (itemStyle = candidateItems[newIndex].style).color = this.configuration.highlightTextColor;
          itemStyle.backgroundColor = this.configuration.highlightBackgroundColor;
        }

        if (this.activeSuggestionIndex > -1) {
          (itemStyle = candidateItems[this.activeSuggestionIndex].style).color = '';
          itemStyle.backgroundColor = '';
        }

        this.activeSuggestionIndex = newIndex;
      }
    }
  };

  PredictionSystemPrototype.chooseSuggestion = function (evt) {
    var eventKind = (evt = evt || globalWindow.event).type.toLowerCase();
    var shouldReturnFocus = eventKind !== 'keydown' || (evt.which || evt.keyCode) !== 9;
    var eventTarget, selectedIdx;

    if (eventKind.indexOf('mouse') > -1 || eventKind.indexOf('touch') > -1) {
      if (((eventTarget = evt.target || evt.srcElement).className || '').indexOf('suggest_item') > -1) {
        if ((selectedIdx = parseInt(eventTarget.getAttribute('data-index') || -1, 10)) > -1) {
          this.activeSuggestionIndex = selectedIdx;
        }
      }
    }

    if (this.activeSuggestionIndex > -1) {
      this.inputField.value = this.displayedSuggestions[this.activeSuggestionIndex];
      this.hideSuggestions();
    }
    if (shouldReturnFocus) {
      this.inputField.focus();
      return haltEvent(evt);
    }
  };

  PredictionSystemPrototype.hideSuggestions = function () {
    this.activeSuggestionIndex = -1;
    this.previousInputValue = '';
    this.displayedSuggestions = [];
    if (this.suggestionPanel) {
      this.suggestionPanel.innerHTML = '';
    }
  };

  PredictionSystemPrototype.appendEntries = function (newEntries) {
    var allEntries, currentLength, currentCount;

    if (newEntries && newEntries.length) {
      currentLength = currentCount = (allEntries = this.sourceData).length;
      for (var loopIndex = 0, entry; (entry = newEntries[loopIndex]) !== notDefined; loopIndex++) {
        if (entry && findItemIndex(allEntries, entry) === -1) {
          allEntries[currentCount++] = entry;
        }
      }

      if (currentCount > currentLength) {
        this.rebuild();
      }
    }
  };

  PredictionSystemPrototype.deleteEntries = function (entriesToRemove) {
    var allEntries, currentLength, currentCount, entryPosition;

    if (entriesToRemove && entriesToRemove.length) {
      currentLength = currentCount = (allEntries = this.sourceData).length;
      for (var loopIndex = 0, entry; (entry = entriesToRemove[loopIndex]) !== notDefined; loopIndex++) {
        if (entry && (entryPosition = findItemIndex(allEntries, entry)) > -1) {
          allEntries.splice(entryPosition, 1);
        }
      }

      if (allEntries.length < currentLength) {
        this.rebuild();
      }
    }
  };

  PredictionSystemPrototype.rebuild = function () {
    this.dataStore = new Object();

    if (hasDatalistFeature && this.configuration.useNativeInterface) {
      this.suggestionPanel.innerHTML = this.buildListOptionsMarkup();
    } else if (this.activeSuggestionIndex === -1) {
      this.findMatchingEntries(this.previousInputValue);
    }
  };

  // Utility Methods for the module
  var delegateContext = function (func, context) {
    return function () {
      return func.apply(context, arguments);
    };
  };

  var attachEventHandler = function (targetElement, eventType, handler) {
    if (targetElement.addEventListener) {
      targetElement.addEventListener(eventType, handler, false);
    } else if (targetElement.attachEvent) {
      targetElement.attachEvent('on' + eventType, handler);
    }
  };

  var detachEventHandler = function (targetElement, eventType, handler) {
    if (targetElement.removeEventListener) {
      targetElement.removeEventListener(eventType, handler, false);
    } else if (targetElement.detachEvent) {
      targetElement.detachEvent('on' + eventType, handler);
    }
  };

  var parseXmlString = function (xmlText) {
    var xmlDoc;
    if (globalWindow.DOMParser) {
      xmlDoc = (new globalWindow.DOMParser()).parseFromString(xmlText, 'text/xml');
    } else {
      xmlDoc = new globalWindow.ActiveXObject('Microsoft.XMLDOM');
      xmlDoc.async = 'false';
      xmlDoc.loadXML(xmlText);
    }
    return xmlDoc;
  };

  var getElementByIdOrSelector = function (selector) {
    return htmlDocument.getElementById(selector) || htmlDocument.querySelector(selector);
  };

  var haltEvent = function (evt) {
    if (evt.preventDefault) {
      evt.preventDefault();
    }
    evt.returnValue = false;
    return false;
  };

  var hasDatalistFeature = (htmlDocument.createElement('datalist').options && true);

  var determineIEVersion = function () {
    var navigatorObj, browserVersion;

    if ((navigatorObj = globalWindow.navigator).appName === 'Microsoft Internet Explorer') {
      if (new RegExp('MSIE ([0-9]{1,}[\\.0-9]{0,})').exec(navigatorObj.userAgent)) {
        browserVersion = parseFloat(RegExp.$1);
      }
    }
    return browserVersion;
  };

  var ieBrowserVersion = determineIEVersion();

  var findItemIndex = function (targetArray, searchValue) {
    if (targetArray.indexOf) {
      return targetArray.indexOf(searchValue);
    }
    for (var i = 0, len = targetArray.length; i < len; i++) {
      if (targetArray[i] === searchValue) {
        return i;
      }
    }
    return -1;
  };

  // Expose the InputPredictionSystem to the global scope
  globalWindow.InputPredictionSystem = InputPredictionSystem;

})(window, document, undefined);