/*
 * Project: https://github.com/myorg/awesome-uploader
 *
 * Comprehensive file transfer module with visual progress and drag-and-drop.
 * © 2023 Acme Corp ( info@acmecorp.com )
 *
 * Distributed under the MIT License, see license.md.
 */

//
// Core utility functions for various operations
//

let _fuf = _fuf || {};

/**
 * Merges properties from a source object into a target object.
 * Existing properties in the target will be overwritten.
 */
_fuf.mergeProps = function (targetObj, sourceObj) {
  for (let propertyKey in sourceObj) {
    if (Object.prototype.hasOwnProperty.call(sourceObj, propertyKey)) {
      targetObj[propertyKey] = sourceObj[propertyKey];
    }
  }
};

/**
 * Locates an item within an array, returning its index or -1 if not found.
 * @param {number} [startIndex] The position in the array to begin the search.
 */
_fuf.findInArray = function (targetArray, searchItem, startIndex) {
  if (targetArray.indexOf) {
    return targetArray.indexOf(searchItem, startIndex);
  }

  startIndex = startIndex || 0;
  let arrayLength = targetArray.length;

  if (startIndex < 0) {
    startIndex += arrayLength;
  }

  for (; startIndex < arrayLength; startIndex++) {
    if (startIndex in targetArray && targetArray[startIndex] === searchItem) {
      return startIndex;
    }
  }
  return -1;
};

_fuf.generateUniqueKey = (function () {
  let currentId = 1000;
  // This closure ensures the ID is incremented each time.
  return function () {
    return currentId++;
  };
})();

//
// DOM Event management utilities
//

_fuf.addEvent = function (elementNode, eventName, handlerFunction) {
  if (elementNode.addEventListener) {
    elementNode.addEventListener(eventName, handlerFunction, false);
  } else if (elementNode.attachEvent) {
    elementNode.attachEvent('on' + eventName, handlerFunction);
  }
};

_fuf.removeEvent = function (elementNode, eventName, handlerFunction) {
  if (elementNode.removeEventListener) {
    elementNode.removeEventListener(eventName, handlerFunction, false);
  } else if (elementNode.attachEvent) {
    elementNode.detachEvent('on' + eventName, handlerFunction);
  }
};

_fuf.suppressDefault = function (eventObject) {
  if (eventObject.preventDefault) {
    eventObject.preventDefault();
  } else {
    eventObject.returnValue = false;
  }
};

//
// HTML Node manipulation routines
//

/**
 * Inserts a new DOM node before an existing reference node.
 */
_fuf.placeBefore = function (newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode);
};

_fuf.eraseNode = function (nodeToRemove) {
  nodeToRemove.parentNode.removeChild(nodeToRemove);
};

_fuf.hasDescendant = function (ancestorNode, potentialDescendant) {
  // compareDocumentPosition might return false if nodes are identical
  if (ancestorNode === potentialDescendant) return true;

  if (ancestorNode.contains) {
    return ancestorNode.contains(potentialDescendant);
  } else {
    // Fallback for older browsers using bitwise comparison
    return !!(potentialDescendant.compareDocumentPosition(ancestorNode) & 8);
  }
};

/**
 * Generates an HTML element from a provided string.
 * This method leverages innerHTML to parse the string into a DOM node.
 */
_fuf.createElementFromString = (function () {
  let tempDiv = document.createElement('section');
  return function (htmlString) {
    tempDiv.innerHTML = htmlString;
    let createdElement = tempDiv.firstChild;
    tempDiv.removeChild(createdElement); // Clean up the temporary div
    return createdElement;
  };
})();

//
// Node styling and attribute management
//

/**
 * Applies a set of CSS styles to a given element.
 * Includes a fix for opacity handling in older IE versions.
 */
_fuf.applyStyles = function (elementNode, visualStyles) {
  if (visualStyles.opacity != null) {
    if (typeof elementNode.style.opacity !== 'string' && typeof elementNode.filters !== 'undefined') {
      visualStyles.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + Math.round(100 * visualStyles.opacity) + ')';
    }
  }
  _fuf.mergeProps(elementNode.style, visualStyles);
};

_fuf.hasCssClass = function (elementNode, classNameToMatch) {
  let classRegex = new RegExp('(^|\\s)' + classNameToMatch + '(\\s|$)', 'g');
  return classRegex.test(elementNode.className);
};

_fuf.addCssClass = function (elementNode, newClass) {
  if (!_fuf.hasCssClass(elementNode, newClass)) {
    elementNode.className += ' ' + newClass;
  }
};

_fuf.removeCssClass = function (elementNode, classToRemove) {
  let classRegex = new RegExp('(^|\\s)' + classToRemove + '(\\s|$)', 'g');
  elementNode.className = elementNode.className.replace(classRegex, ' ').replace(/(^\s+|\s+$)/g, '');
};

_fuf.updateTextContent = function (targetNode, contentString) {
  targetNode.innerText = contentString;
  targetNode.textContent = contentString;
};

//
// Element query and selection methods
//

_fuf.getChildNodes = function (parentElement) {
  let childElements = [],
    currentChild = parentElement.firstChild;

  while (currentChild) {
    if (currentChild.nodeKind === 1) { // Node.ELEMENT_NODE
      childElements.push(currentChild);
    }
    currentChild = currentChild.nextSibling;
  }

  return childElements;
};

_fuf.getNodesByClass = function (targetElement, classToFind) {
  if (targetElement.querySelectorAll) {
    return targetElement.querySelectorAll('.' + classToFind);
  }

  let matchedElements = [];
  let potentialMatches = targetElement.getElementsByTagName("*");
  let totalCandidates = potentialMatches.length;

  for (let elementIndex = 0; elementIndex < totalCandidates; elementIndex++) {
    if (_fuf.hasCssClass(potentialMatches[elementIndex], classToFind)) {
      matchedElements.push(potentialMatches[elementIndex]);
    }
  }
  return matchedElements;
};

/**
 * Converts a JavaScript object into an URL-encoded query string.
 * This utility mimics the functionality of jQuery.param().
 *
 * Example Usage:
 *
 *    `_fuf.objectToQueryString({first:'alpha', second:'beta'}, 'https://api.example.com/data?existingKey=value');`
 *
 * Will produce:
 *
 *    `https://api.example.com/data?existingKey=value&first=alpha&second=beta`
 *
 * @param  {object} dataObject - The JavaScript object to be serialized.
 * @param  {string} initialString - An optional base URL or query string to append to.
 * @return {string} The fully encoded query string.
 */
_fuf.objectToQueryString = function (dataObject, initialString, isPrefixed) {
  let querySegments = [],
    separatorChar = '&',
    appendSegment = function (currentValue, currentIndex) {
      let currentKey = initialString
        ? (/\[\]$/.test(initialString)) // check for array-like keys
          ? initialString
          : initialString + '[' + currentIndex + ']'
        : currentIndex;
      if ((currentKey !== 'undefined') && (currentIndex !== 'undefined')) {
        querySegments.push(
          (typeof currentValue === 'object')
            ? _fuf.objectToQueryString(currentValue, currentKey, true)
            : (Object.prototype.toString.call(currentValue) === '[object Function]')
              ? encodeURIComponent(currentKey) + '=' + encodeURIComponent(currentValue())
              : encodeURIComponent(currentKey) + '=' + encodeURIComponent(currentValue)
        );
      }
    };

  if (!isPrefixed && initialString) {
    separatorChar = (/\?/.test(initialString)) ? (/\?$/.test(initialString)) ? '' : '&' : '?';
    querySegments.push(initialString);
    querySegments.push(_fuf.objectToQueryString(dataObject));
  } else if ((Object.prototype.toString.call(dataObject) === '[object Array]') && (typeof dataObject !== 'undefined')) {
    // Iterate over arrays using a standard for loop for performance
    for (let currentIdx = 0, arrayLen = dataObject.length; currentIdx < arrayLen; ++currentIdx) {
      appendSegment(dataObject[currentIdx], currentIdx);
    }
  } else if ((typeof dataObject !== 'undefined') && (dataObject !== null) && (typeof dataObject === "object")) {
    // For general objects, a for-in loop is appropriate
    for (let keyProp in dataObject) {
      if (Object.prototype.hasOwnProperty.call(dataObject, keyProp)) {
        appendSegment(dataObject[keyProp], keyProp);
      }
    }
  } else {
    querySegments.push(encodeURIComponent(initialString) + '=' + encodeURIComponent(dataObject));
  }

  return querySegments.join(separatorChar)
    .replace(/^&/, '')
    .replace(/%20/g, '+');
};

//
//
// File Upload Modules
//
//

let _fuf = _fuf || {};

/**
 * Establishes a basic file uploader, handling button interaction and validation,
 * but without visual lists or drag-and-drop features.
 */
_fuf.BasicFileProcessor = function (configuration) {
  this._settings = {
    // Enable debug messages in the console
    debugMode: false,
    uploadEndpoint: '/upload/target',
    requestParameters: {},
    triggerButton: null,
    allowMultiple: true,
    maximumParallelConnections: 3,
    // File validation parameters
    permittedFileTypes: [],
    maxFileSize: 0,
    minFileSize: 0,
    // Event callbacks
    // Returning false from onSubmit will halt the upload
    onSubmission: function (transferId, resourceName) {
    },
    onTransferProgression: function (transferId, resourceName, bytesTransferred, totalBytes) {
    },
    onTransferCompletion: function (transferId, resourceName, serverResponse) {
    },
    onTransferCancellation: function (transferId, resourceName) {
    },
    // Notification messages for various scenarios
    notificationMessages: {
      invalidTypeError: "{item} has an unsupported file type. Only {types} are permitted.",
      tooLargeError: "{item} exceeds the maximum size. Max size is {maxSize}.",
      tooSmallError: "{item} is below the minimum size. Min size is {minSize}.",
      emptyFileError: "{item} is empty. Please re-select files.",
      navigationWarning: "Files are currently uploading. Leaving this page will cancel the process."
    },
    displayNotification: function (notificationMessage) {
      console.warn(notificationMessage);
    }
  };
  _fuf.mergeProps(this._settings, configuration);

  // Counter for currently active uploads
  this._activeTransfers = 0;
  this._transferHandler = this._initializeTransferHandler();

  if (this._settings.triggerButton) {
    this._inputButton = this._buildInputButton(this._settings.triggerButton);
  }

  this._blockNavigationDuringTransfer();
};

_fuf.BasicFileProcessor.prototype = {
  configureParameters: function (newParameters) {
    this._settings.requestParameters = newParameters;
  },
  getActiveTransfers: function () {
    return this._activeTransfers;
  },
  _buildInputButton: function (domElement) {
    let instanceRef = this;

    return new _fuf.FileSelectButton({
      element: domElement,
      multiple: this._settings.allowMultiple && _fuf.XhrTransferAgent.isCapabilitySupported(),
      onSelectionChange: function (fileInputEl) {
        instanceRef._handleInputChange(fileInputEl);
      }
    });
  },
  _initializeTransferHandler: function () {
    let instanceRef = this,
      agentClass;

    if (_fuf.XhrTransferAgent.isCapabilitySupported()) {
      agentClass = 'XhrTransferAgent';
    } else {
      agentClass = 'FormTransferAgent';
    }

    let handlerInstance = new _fuf[agentClass]({
      debug: this._settings.debugMode,
      action: this._settings.uploadEndpoint,
      maxConnections: this._settings.maximumParallelConnections,
      onProgress: function (transferId, resourceName, bytesTransferred, totalBytes) {
        instanceRef._onTransferProgression(transferId, resourceName, bytesTransferred, totalBytes);
        instanceRef._settings.onTransferProgression(transferId, resourceName, bytesTransferred, totalBytes);
      },
      onComplete: function (transferId, resourceName, transferResult) {
        instanceRef._onTransferFinished(transferId, resourceName, transferResult);
        instanceRef._settings.onTransferCompletion(transferId, resourceName, transferResult);
      },
      onCancel: function (transferId, resourceName) {
        instanceRef._onTransferCanceled(transferId, resourceName);
        instanceRef._settings.onTransferCancellation(transferId, resourceName);
      }
    });

    return handlerInstance;
  },
  _blockNavigationDuringTransfer: function () {
    let instanceRef = this;

    _fuf.addEvent(window, 'beforeunload', function (browserEvent) {
      if (!instanceRef._activeTransfers) {
        return;
      }

      let eventData = browserEvent || window.event;
      // For Internet Explorer and Firefox
      eventData.returnValue = instanceRef._settings.notificationMessages.navigationWarning;
      // For WebKit-based browsers
      return instanceRef._settings.notificationMessages.navigationWarning;
    });
  },
  _onSubmissionStart: function (transferId, resourceName) {
    this._activeTransfers++;
  },
  _onTransferProgression: function (transferId, resourceName, bytesTransferred, totalBytes) {
    // Placeholder for internal progress handling, if needed
  },
  _onTransferFinished: function (transferId, resourceName, transferResult) {
    this._activeTransfers--;
    if (transferResult.error) {
      this._settings.displayNotification(transferResult.error);
    }
  },
  _onTransferCanceled: function (transferId, resourceName) {
    this._activeTransfers--;
  },
  _handleInputChange: function (fileInputEl) {
    if (this._transferHandler instanceof _fuf.XhrTransferAgent) {
      this._processFileList(fileInputEl.files);
    } else {
      if (this._checkFileValidity(fileInputEl)) {
        this._processSingleFile(fileInputEl);
      }
    }
    this._inputButton.reset(); // Clear the file input for re-selection
  },
  _processFileList: function (fileList) {
    for (let fileIdx = 0; fileIdx < fileList.length; fileIdx++) {
      if (!this._checkFileValidity(fileList[fileIdx])) {
        // If any file in the list is invalid, stop processing the rest
        return;
      }
    }

    for (let fileIdx = 0; fileIdx < fileList.length; fileIdx++) {
      this._processSingleFile(fileList[fileIdx]);
    }
  },
  _processSingleFile: function (currentFile) {
    let transferId = this._transferHandler.add(currentFile);
    let resourceName = this._transferHandler.getName(transferId);

    if (this._settings.onSubmission(transferId, resourceName) !== false) {
      this._onSubmissionStart(transferId, resourceName);
      this._transferHandler.upload(transferId, this._settings.requestParameters);
    }
  },
  _checkFileValidity: function (fileObject) {
    let resourceIdentifier, resourceSize;

    if (fileObject.value) {
      // This is an <input type="file"> element
      // Extract file name by removing the path
      resourceIdentifier = fileObject.value.replace(/.*(\/|\\)/, "");
    } else {
      // This is a File API object
      // Handle browser inconsistencies for file properties
      resourceIdentifier = fileObject.fileName != null ? fileObject.fileName : fileObject.name;
      resourceSize = fileObject.fileSize != null ? fileObject.fileSize : fileObject.size;
    }

    if (!this._checkExtensionAllowed(resourceIdentifier)) {
      this._displayError('invalidTypeError', resourceIdentifier);
      return false;

    } else if (resourceSize === 0) {
      this._displayError('emptyFileError', resourceIdentifier);
      return false;

    } else if (resourceSize && this._settings.maxFileSize && resourceSize > this._settings.maxFileSize) {
      this._displayError('tooLargeError', resourceIdentifier);
      return false;

    } else if (resourceSize && resourceSize < this._settings.minFileSize) {
      this._displayError('tooSmallError', resourceIdentifier);
      return false;
    }

    return true;
  },
  _displayError: function (errorCode, resourceName) {
    let notificationMessage = this._settings.notificationMessages[errorCode];

    function substitute(placeholder, substituteValue) {
      notificationMessage = notificationMessage.replace(placeholder, substituteValue);
    }

    substitute('{item}', this._shortenFileName(resourceName));
    substitute('{types}', this._settings.permittedFileTypes.join(', '));
    substitute('{maxSize}', this._formatFileSize(this._settings.maxFileSize));
    substitute('{minSize}', this._formatFileSize(this._settings.minFileSize));

    this._settings.displayNotification(notificationMessage);
  },
  _shortenFileName: function (fullFileName) {
    if (fullFileName.length > 33) {
      fullFileName = fullFileName.slice(0, 19) + '...' + fullFileName.slice(-13);
    }
    return fullFileName;
  },
  _checkExtensionAllowed: function (fullFileName) {
    let fileExtension = (-1 !== fullFileName.indexOf('.')) ? fullFileName.replace(/.*[.]/, '').toLowerCase() : '';
    let permittedExtensions = this._settings.permittedFileTypes;

    if (!permittedExtensions.length) {
      return true; // No restrictions if the list is empty
    }

    for (let extensionIdx = 0; extensionIdx < permittedExtensions.length; extensionIdx++) {
      if (permittedExtensions[extensionIdx].toLowerCase() === fileExtension) {
        return true;
      }
    }

    return false;
  },
  _formatFileSize: function (byteCount) {
    let unitIndex = -1;
    do {
      byteCount = byteCount / 1024;
      unitIndex++;
    } while (byteCount > 99); // Loop until bytes are less than 100 for formatting

    return Math.max(byteCount, 0.1).toFixed(1) + ['kB', 'MB', 'GB', 'TB', 'PB', 'EB'][unitIndex];
  }
};


/**
 * Implements a full-featured file uploader with drag-and-drop functionality
 * and a dynamic file status list.
 *
 * @augments _fuf.BasicFileProcessor
 */
_fuf.IntegratedFileUploader = function (initialOptions) {
  // Invoke the parent class constructor
  _fuf.BasicFileProcessor.apply(this, arguments);

  // Additional configuration options specific to the enhanced uploader
  _fuf.mergeProps(this._config, {
    targetElement: null,
    // If provided, this element will be used as the file list container
    displayListElement: null,

    mainTemplate: '<div class="file-upload-container">' +
      '<div class="upload-drop-zone"><span>Drag files here to upload</span></div>' +
      '<div class="upload-trigger-button">Select a file</div>' +
      '<ul class="transfer-status-list"></ul>' +
      '</div>',

    // Template structure for individual file entries in the list
    itemTemplate: '<li>' +
      '<span class="transfer-file-name"></span>' +
      '<span class="transfer-progress-spinner"></span>' +
      '<span class="transfer-file-size"></span>' +
      '<a class="transfer-cancel-link" href="#">Cancel</a>' +
      '<span class="transfer-failed-message">Failed</span>' +
      '</li>',