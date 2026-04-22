// Module for handling dynamic content display and styling within a document.
// This component processes HTML snippets from input areas and embeds them
// into iframes, applying custom stylesheets and scripts for presentation.

(function () {

'use strict';

// Terminate execution if already within a visual presentation frame
// to prevent infinite embedding loops. This scenario is common in WebKit
// when the frame's source is set to the current document's URL.
if (window.location.hash === '#__preview__' || window.location.protocol === 'data:') return;

// Utility routines. Leveraging native Array methods for DOM collections.
var iterateOver = function (collection, operation) {
  return Array.prototype.forEach.call(collection, operation);
};
var applyMethod = function (objectList, methodName) {
  var methodArgs = Array.prototype.slice.call(arguments, 2);
  return transform(objectList, function (currentValue) {
    return (isCallable(methodName) ? methodName || currentValue : currentValue[methodName]).apply(currentValue, methodArgs);
  });
};
var isCallable = function (candidate) {
  return Object.prototype.toString.call(candidate) === '[object Function]';
};
var transform = function (collection, operation) {
  return Array.prototype.map.call(collection, operation);
};
var extractProp = function (collection, propertyName) {
  return transform(collection, function (itemUnit) { return itemUnit[propertyName]; } );
};

// Deconstruct 'attribute=value; attribute=value' strings, like browser cookies.
var parseKeyValueString = function (inputString) {
  var dataObject = {};
  var keyValPairs = inputString.split(';');
  for (var k = 0; keyValPairs.length > k; k++) {
    var parts = keyValPairs[k].trim().split('=');
    dataObject[parts[0]] = parts[1];
  }
  return dataObject;
};
var stripClass = function (elements, classToRemove) {
  return applyMethod(extractProp(elements, 'classList'), 'remove', classToRemove);
};

var sendFrameMessage = function (targetFrame, messageContent) {
  targetFrame.contentDocument.defaultView.postMessage(messageContent, '*');
};

var docHeader = document.getElementsByTagName('head')[0];
var docBody = document.getElementsByTagName('body')[0];

// Retrieve presentation stylesheets designated for embedded frames.
var embedStyles = extractProp(
  docHeader.querySelectorAll('style[type="text/preview"]'),
  'innerHTML').join('');
// Obtain display scripts meant for embedded frames.
var embedScripts = extractProp(
  docHeader.querySelectorAll('script[type="text/preview"]'),
  'innerHTML').join('');

var renderFrameLink = window.location.href.split('#')[0] + '#__preview__';

// Verify if the browser considers data URIs as originating from the same domain.
var temporaryFrame = document.createElement('iframe');
temporaryFrame.src = 'data:text/html,';
docBody.appendChild(temporaryFrame);
temporaryFrame.addEventListener('load', function () {
  var browserCapability = { sameOriginDataUri: false };
  try {
    this.contentDocument;
    if (!this.contentDocument) browserCapability.sameOriginDataUri = false;
  } catch (err) {
    browserCapability.sameOriginDataUri = false;
  }
  this.parentNode.removeChild(this);
  // Iterate over all code input fields and render their content in display frames.
  iterateOver(docBody.getElementsByTagName('textarea'), function (sourceInput, itemIndex) {
    insertDisplayFrame(sourceInput, browserCapability, itemIndex);
    setupResizeControls();
    enableAutoTextareaHeight(sourceInput);
  });
});

var insertDisplayFrame = function (sourceInput, browserCapability, frameIdentifier) {
  var displayContainer, sizeAdjuster, displayFrame;
  displayContainer = document.createElement('div');
  displayContainer.appendChild(sizeAdjuster = document.createElement('div'));
  displayContainer.className = 'bs-example';
  sizeAdjuster.appendChild(displayFrame = document.createElement('iframe'));
  sizeAdjuster.className = 'resizeable';
  displayFrame.setAttribute('scrolling', 'no');
  displayFrame.name = 'iframe' + frameIdentifier++;
  displayFrame.addEventListener('load', function () {
    var rootHtml, frameBody, scriptNode, styleNode, frameHeader, originalHeader, frameDoc;
    frameDoc = this.contentDocument;
    // Exit if a data URI is being loaded in a browser lacking proper same-origin
    // security for such URI types.
    if (!browserCapability.sameOriginDataUri && this.src !== renderFrameLink) {
      return;
    // Otherwise, update the embedded frame's content with the provided markup.
    } else if (this.src === renderFrameLink) {
      rootHtml = frameDoc.createElement('html');
      rootHtml.appendChild(frameDoc.createElement('head'));
      rootHtml.appendChild(frameBody = frameDoc.createElement('body'));
      frameBody.innerHTML = sourceInput.textContent;
      frameDoc.replaceChild(rootHtml, frameDoc.documentElement);
    }
    // Add scripts and styles.
    frameHeader = frameDoc.createElement('head');
    frameHeader.appendChild(styleNode = frameDoc.createElement('style'));
    frameHeader.appendChild(scriptNode = frameDoc.createElement('script'));
    scriptNode.textContent = embedScripts;
    styleNode.textContent = embedStyles;
    originalHeader = frameDoc.getElementsByTagName('head')[0];
    originalHeader.parentNode.replaceChild(frameHeader, originalHeader);
    sendFrameMessage(this, 'getHeight');
  });
  var frameSource;
  if (!browserCapability.sameOriginDataUri) {
    frameSource = renderFrameLink;
  } else {
    frameSource = 'data:text/html;charset=utf-8,' +
      encodeURIComponent('<!doctype html><html><head></head><body>' +
        sourceInput.textContent);
  }
  displayFrame.setAttribute('src', frameSource);
  var inputContentModified = function () {
    displayFrame.contentDocument.body.innerHTML = this.value;
    sendFrameMessage(displayFrame, 'getHeight');
  };
  sourceInput.addEventListener('keypress', inputContentModified);
  sourceInput.addEventListener('keyup', inputContentModified);
  sourceInput.parentNode.insertBefore(displayContainer, sourceInput);
};

// Insert a temporary element mirroring the input field's styles and text
// to accurately determine the required height for its content.
var enableAutoTextareaHeight = function (targetElement) {
  var sizingMirror = document.createElement('div');
  sizingMirror.className = 'preview-code';
  sizingMirror.style.position = 'absolute';
  sizingMirror.style.top = 0;
  sizingMirror.style.left = '-9999px';
  docBody.appendChild(sizingMirror);
  var maximumHeight = parseInt(
    window.getComputedStyle(targetElement).getPropertyValue('max-height'),
    10);
  var contentChangeHandler = function (eventObj) {
    sizingMirror.textContent = this.value + '\n';
    var calculatedHeight = sizingMirror.offsetHeight + 2; // Adjust for border dimensions.
    if (calculatedHeight >= maximumHeight) {
      this.style.overflow = 'auto';
    } else {
      this.style.overflow = 'hidden';
    }
    this.style.height = (sizingMirror.offsetHeight + 2 + 16) + 'px';
  };
  targetElement.addEventListener('keypress', contentChangeHandler);
  targetElement.addEventListener('keyup', contentChangeHandler);
  contentChangeHandler.call(targetElement);
};

var setupResizeControls = function () {
  var configPanel = docBody.getElementsByClassName('settings')[0];
  var adjustableElements = docBody.getElementsByClassName('resizeable');
  var adjustablePadding = 30; // `.resizeable` padding
  var adjustDisplaySizes = function (newWidth) {
    document.cookie = 'preview-width=' + newWidth;
    iterateOver(adjustableElements, function (elementNode) {
      if (newWidth === 'auto') newWidth = elementNode.parentNode.offsetWidth;
      elementNode.style.width = newWidth + 'px';
      // Future improvement: Implement CSS transitions and update vertical size
      // following the 'transitionend' event.
      sendFrameMessage(elementNode.getElementsByTagName('iframe')[0], 'getHeight');
    });
  };

  // Adjust display dimensions based on stored cookie preferences.
  var storedWidth = parseKeyValueString(document.cookie)['preview-width'];
  if (storedWidth) {
    adjustDisplaySizes(storedWidth);
    stripClass(configPanel.getElementsByClassName('is-active'), 'is-active');
    var actionButton = configPanel.querySelector('button[data-width="' + storedWidth + '"]');
    if (actionButton) { actionButton.classList.add('is-active'); }
  }

  window.addEventListener('message', function (eventObj) {
    if (eventObj.data == null || !eventObj.source) return;
    var messageData = eventObj.data;
    var originatingFrame = document.getElementsByName(eventObj.source.name)[0];
    // Set iframe height
    if (messageData.height != null && originatingFrame) {
      originatingFrame.parentNode.style.height = (messageData.height + adjustablePadding) + 'px';
    }
  }, false);

  // Interactive sizing controls.
  if (configPanel && adjustableElements.length > 0) {
    configPanel.hidden = false;
    configPanel.addEventListener('click', function (eventObj) {
      var elementTag = eventObj.target.tagName.toLowerCase();
      var clickedButton;
      if (elementTag === 'button') clickedButton = eventObj.target;
      else if (elementTag === 'svg') clickedButton = eventObj.target.parentNode;
      else return;
      eventObj.preventDefault();
      stripClass(configPanel.getElementsByClassName('is-active'), 'is-active');
      clickedButton.classList.add('is-active');
      var selectedWidth = clickedButton.dataset.width;
      adjustDisplaySizes(selectedWidth);
    });
  }
};

}) ();