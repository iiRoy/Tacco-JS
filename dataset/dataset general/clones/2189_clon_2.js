var myUtil = myUtil || {};

/**
 * Merges all missing properties from a source object into a target object.
 */
myUtil.mergeProps = function(targetObj, sourceObj) {
  for (var keyName in sourceObj) {
    targetObj[keyName] = sourceObj[keyName];
  }
};

/**
 * Searches for an item within an array, returning its index, or -1 if not found.
 * @param {Number} [startIndex] The position from which to begin the search.
 */
myUtil.findItemIndex = function(dataArray, searchElement, startIndex) {
  if (dataArray.indexOf) return dataArray.indexOf(searchElement, startIndex);

  startIndex = startIndex || 0;
  var arrayLength = dataArray.length;

  if (startIndex < 0) startIndex += arrayLength;

  for (; startIndex < arrayLength; startIndex++) {
    if (startIndex in dataArray && dataArray[startIndex] === searchElement) {
      return startIndex;
    }
  }
  return -1;
};

myUtil.getSequentialId = (function() {
  var currentId = 0;
  return function() {
    return currentId++;
  };
})();

//
// DOM Event Management

myUtil.addEvent = function(domElement, eventType, eventHandler) {
  if (domElement.addEventListener) {
    domElement.addEventListener(eventType, eventHandler, false);
  } else if (domElement.attachEvent) {
    domElement.attachEvent('on' + eventType, eventHandler);
  }
};
myUtil.removeEvent = function(domElement, eventType, eventHandler) {
  if (domElement.removeEventListener) {
    domElement.removeEventListener(eventType, eventHandler, false);
  } else if (domElement.attachEvent) {
    domElement.detachEvent('on' + eventType, eventHandler);
  }
};

myUtil.stopDefault = function(eventObj) {
  if (eventObj.preventDefault) {
    eventObj.preventDefault();
  } else {
    eventObj.returnValue = false;
  }
};

//
// DOM Element Operations

/**
 * Inserts a new DOM element before a reference element.
 */
myUtil.insertElementBefore = function(newChild, referenceChild) {
  referenceChild.parentNode.insertBefore(newChild, referenceChild);
};
myUtil.removeElement = function(targetElement) {
  targetElement.parentNode.removeChild(targetElement);
};

myUtil.isAncestorOf = function(ancestorNode, childNode) {
  // compareDocumentPosition might return false in edge cases
  if (ancestorNode == childNode) return true;

  if (ancestorNode.contains) {
    return ancestorNode.contains(childNode);
  } else {
    return !!(childNode.compareDocumentPosition(ancestorNode) & 8);
  }
};

/**
 * Generates a DOM element from an HTML string snippet.
 * Leverages innerHTML for element creation.
 */
myUtil.createElementFromString = (function() {
  var tempContainer = document.createElement('div');
  return function(htmlString) {
    tempContainer.innerHTML = htmlString;
    var createdElement = tempContainer.firstChild;
    tempContainer.removeChild(createdElement);
    return createdElement;
  };
})();

//
// Element Styling and Classes

/**
 * Applies CSS properties to a DOM element.
 * Includes a compatibility fix for opacity in older IE versions.
 */
myUtil.applyStyles = function(targetElement, styleProperties) {
  if (styleProperties.opacity != null) {
    if (typeof targetElement.style.opacity != 'string' && typeof(targetElement.filters) != 'undefined') {
      styleProperties.filter = 'alpha(opacity=' + Math.round(100 * styleProperties.opacity) + ')';
    }
  }
  myUtil.mergeProps(targetElement.style, styleProperties);
};
myUtil.hasCssClass = function(targetElement, className) {
  var classRegex = new RegExp('(^| )' + className + '( |$)');
  return classRegex.test(targetElement.className);
};
myUtil.addCssClass = function(targetElement, className) {
  if (!myUtil.hasCssClass(targetElement, className)) {
    targetElement.className += ' ' + className;
  }
};
myUtil.removeCssClass = function(targetElement, className) {
  var classRegex = new RegExp('(^| )' + className + '( |$)');
  targetElement.className = targetElement.className.replace(classRegex, ' ').replace(/^\s+|\s+$/g, "");
};
myUtil.setElementText = function(targetElement, newTextContent) {
  targetElement.innerText = newTextContent;
  targetElement.textContent = newTextContent;
};

//
// Element Traversal

myUtil.getChildElements = function(parentNode) {
  var childList = [],
    currentChild = parentNode.firstChild;

  while (currentChild) {
    if (currentChild.nodeType == 1) {
      childList.push(currentChild);
    }
    currentChild = currentChild.nextSibling;
  }

  return childList;
};

myUtil.getElementsByClassName = function(searchContext, cssClassName) {
  if (searchContext.querySelectorAll) {
    return searchContext.querySelectorAll('.' + cssClassName);
  }

  var foundElements = [];
  var allDescendants = searchContext.getElementsByTagName("*");
  var totalCandidates = allDescendants.length;

  for (var idx = 0; idx < totalCandidates; idx++) {
    if (myUtil.hasCssClass(allDescendants[idx], cssClassName)) {
      foundElements.push(allDescendants[idx]);
    }
  }
  return foundElements;
};

/**
 * objectToQueryString() converts a JavaScript object into a URL query string.
 * This function behaves similarly to jQuery.param().
 *
 * Example usage:
 *
 *    `myUtil.objectToQueryString({alpha:'beta',gamma:'delta'},'http://example.com/api?extra=value');`
 *
 * will produce:
 *
 *    `http://example.com/api?extra=value&alpha=beta&gamma=delta`
 *
 * @param  Object inputObject - The JSON-like object to convert.
 * @param  String baseString - An optional base URL or existing query string part.
 * @return String The encoded query string.
 */
myUtil.objectToQueryString = function(inputObject, baseString, isRecursiveCall) {
  var queryParts = [],
    separatorChar = '&',
    addParameter = function(currentValue, currentKey) {
      var paramName = baseString ?
        (/\\[\\]$/.test(baseString)) // prevent double-encoding
        ? baseString :
        baseString + '[' + currentKey + ']' :
        currentKey;
      if ((paramName != 'undefined') && (currentKey != 'undefined')) {
        queryParts.push(
          (typeof currentValue === 'object') ?
          myUtil.objectToQueryString(currentValue, paramName, true) :
          (Object.prototype.toString.call(currentValue) === '[object Function]') ?
          encodeURIComponent(paramName) + '=' + encodeURIComponent(currentValue()) :
          encodeURIComponent(paramName) + '=' + encodeURIComponent(currentValue)
        );
      }
    };

  if (!isRecursiveCall && baseString) {
    separatorChar = (/\?/.test(baseString)) ? (/\?$/.test(baseString)) ? '' : '&' : '?';
    queryParts.push(baseString);
    queryParts.push(myUtil.objectToQueryString(inputObject));
  } else if ((Object.prototype.toString.call(inputObject) === '[object Array]') && (typeof inputObject != 'undefined')) {
    // Avoid using for-in loop on arrays for performance
    for (var idx = 0, total = inputObject.length; idx < total; ++idx) {
      addParameter(inputObject[idx], idx);
    }
  } else if ((typeof inputObject != 'undefined') && (inputObject !== null) && (typeof inputObject === "object")) {
    // For non-scalar objects, use a for-in loop
    for (var currentKey in inputObject) {
      addParameter(inputObject[currentKey], currentKey);
    }
  } else {
    queryParts.push(encodeURIComponent(baseString) + '=' + encodeURIComponent(inputObject));
  }

  return queryParts.join(separatorChar)
    .replace(/^&/, '')
    .replace(/%20/g, '+');
};

//
//
// File Transfer Modules
//
//

var myUtil = myUtil || {};

/**
 * Base class for file uploads, handling core logic, validation, and progress.
 * It does not include a visual file list or drag-and-drop functionality by itself.
 */
myUtil.BaseFileTransfer = function(configOptions) {
  this._settings = {
    // Enable debug logging for server responses
    debug: false,
    uploadUrl: '/server/upload-endpoint',
    requestParams: {},
    triggerButton: null,
    allowMultiple: true,
    maxConcurrentConnections: 3,
    // Validation rules
    permittedExtensions: [],
    maxFileSize: 0,
    minFileSize: 0,
    // Event callbacks
    // Returning false cancels the submission
    onInitiate: function(transferId, resourceName) {},
    onTransferProgress: function(transferId, resourceName, bytesLoaded, totalBytes) {},
    onTransferComplete: function(transferId, resourceName, serverResponse) {},
    onTransferCancel: function(transferId, resourceName) {},
    // Message strings
    alertMessages: {
      extensionError: "{file} has an invalid extension. Only {extensions} are permitted.",
      sizeExceeded: "{file} is too large; maximum size is {sizeLimit}.",
      sizeBelowMinimum: "{file} is too small; minimum size is {minSizeLimit}.",
      emptyFile: "{file} is empty. Please re-select files without it.",
      pageUnloadWarning: "Files are currently being transferred. Navigating away will cancel them."
    },
    displayMessage: function(messageText) {
      alert(messageText);
    }
  };
  myUtil.mergeProps(this._settings, configOptions);

  // Counter for currently active file transfers
  this._activeTransfers = 0;
  this._transferHandler = this._initTransferHandler();

  if (this._settings.triggerButton) {
    this._triggerButton = this._initTriggerButton(this._settings.triggerButton);
  }

  this._preventPageUnload();
};

myUtil.BaseFileTransfer.prototype = {
  /**
   * Updates the parameters sent with each upload request.
   * @param {Object} newParams An object containing new key-value pairs for parameters.
   */
  updateParameters: function(newParams) {
    this._settings.requestParams = newParams;
  },
  /**
   * Returns the count of files currently being uploaded.
   * @return {Number} Number of active transfers.
   */
  getActiveTransfers: function() {
    return this._activeTransfers;
  },
  /**
   * Creates and configures the upload trigger button.
   * @param {HTMLElement} buttonElement The DOM element to use as the button.
   * @private
   */
  _initTriggerButton: function(buttonElement) {
    var instanceRef = this;

    return new myUtil.UploadButton({
      element: buttonElement,
      multiple: this._settings.allowMultiple && myUtil.XhrTransferHandler.isSupported(),
      onFileSelection: function(fileInput) {
        instanceRef._handleFileInputChange(fileInput);
      }
    });
  },
  /**
   * Initializes the appropriate transfer handler (XHR or Form-based).
   * @private
   */
  _initTransferHandler: function() {
    var instanceRef = this,
      handlerTypeName;

    if (myUtil.XhrTransferHandler.isSupported()) {
      handlerTypeName = 'XhrTransferHandler';
    } else {
      handlerTypeName = 'FormTransferHandler';
    }

    var activeHandler = new myUtil[handlerTypeName]({
      debug: this._settings.debug,
      uploadUrl: this._settings.uploadUrl,
      maxConcurrentConnections: this._settings.maxConcurrentConnections,
      onTransferProgress: function(transferId, resourceName, bytesLoaded, totalBytes) {
        instanceRef._onTransferProgress(transferId, resourceName, bytesLoaded, totalBytes);
        instanceRef._settings.onTransferProgress(transferId, resourceName, bytesLoaded, totalBytes);
      },
      onTransferComplete: function(transferId, resourceName, transferResult) {
        instanceRef._onTransferComplete(transferId, resourceName, transferResult);
        instanceRef._settings.onTransferComplete(transferId, resourceName, transferResult);
      },
      onTransferCancel: function(transferId, resourceName) {
        instanceRef._onTransferCancel(transferId, resourceName);
        instanceRef._settings.onTransferCancel(transferId, resourceName);
      }
    });

    return activeHandler;
  },
  /**
   * Sets up a listener to warn the user before leaving the page during active uploads.
   * @private
   */
  _preventPageUnload: function() {
    var instanceRef = this;

    myUtil.addEvent(window, 'beforeunload', function(eventObj) {
      if (!instanceRef._activeTransfers) {
        return;
      }

      var eventObj = eventObj || window.event;
      // For IE and Firefox
      eventObj.returnValue = instanceRef._settings.alertMessages.pageUnloadWarning;
      // For WebKit browsers
      return instanceRef._settings.alertMessages.pageUnloadWarning;
    });
  },
  /**
   * Internal callback for when a transfer starts. Increments active transfer count.
   * @private
   */
  _onTransferStart: function(transferId, resourceName) {
    this._activeTransfers++;
  },
  /**
   * Internal callback for transfer progress updates. (Placeholder for base class)
   * @private
   */
  _onTransferProgress: function(transferId, resourceName, bytesLoaded, totalBytes) {
    // No specific action in the base class, derived classes might implement visual updates
  },
  /**
   * Internal callback for when a transfer completes. Decrements active transfer count.
   * Displays error messages if the server response indicates an issue.
   * @private
   */
  _onTransferComplete: function(transferId, resourceName, transferResult) {
    this._activeTransfers--;
    if (transferResult.error) {
      this._settings.displayMessage(transferResult.error);
    }
  },
  /**
   * Internal callback for when a transfer is cancelled. Decrements active transfer count.
   * @private
   */
  _onTransferCancel: function(transferId, resourceName) {
    this._activeTransfers--;
  },
  /**
   * Handles changes to the file input element, initiating uploads.
   * @param {HTMLInputElement} fileInput The file input element.
   * @private
   */
  _handleFileInputChange: function(fileInput) {
    if (this._transferHandler instanceof myUtil.XhrTransferHandler) {
      this._processFileList(fileInput.files);
    } else {
      if (this._checkFileValidity(fileInput)) {
        this._initiateFileUpload(fileInput);
      }
    }
    this._triggerButton.resetSelection();
  },
  /**
   * Processes a list of files (e.g., from a DataTransfer object or file input).
   * @param {FileList} fileArray The list of files to process.
   * @private
   */
  _processFileList: function(fileArray) {
    for (var idx = 0; idx < fileArray.length; idx++) {
      if (!this._checkFileValidity(fileArray[idx])) {
        return; // Stop if any file is invalid
      }
    }

    for (var idx = 0; idx < fileArray.length; idx++) {
      this._initiateFileUpload(fileArray[idx]);
    }
  },
  /**
   * Initiates the upload for a single file or file input.
   * @param {File|HTMLInputElement} fileData The file object or file input element.
   * @private
   */
  _initiateFileUpload: function(fileData) {
    var transferId = this._transferHandler.addFile(fileData);
    var resourceName = this._transferHandler.getFileName(transferId);

    if (this._settings.onInitiate(transferId, resourceName) !== false) {
      this._onTransferStart(transferId, resourceName);
      this._transferHandler.startUpload(transferId, this._settings.requestParams);
    }
  },
  /**
   * Validates a file against configured rules (extension, size).
   * @param {File|HTMLInputElement} fileObject The file object or input element.
   * @return {boolean} True if valid, false otherwise.
   * @private
   */
  _checkFileValidity: function(fileObject) {
    var itemName, itemSize;

    if (fileObject.value) {
      // It's a file input element
      // Get the value and normalize by removing the path
      itemName = fileObject.value.replace(/.*(\/|\\)/, "");
    } else {
      // It's a File API object
      // Fix missing properties in Safari
      itemName = fileObject.fileName != null ? fileObject.fileName : fileObject.name;
      itemSize = fileObject.fileSize != null ? fileObject.fileSize : fileObject.size;
    }

    if (!this._isExtensionPermitted(itemName)) {
      this._reportIssue('extensionError', itemName);
      return false;
    } else if (itemSize === 0) {
      this._reportIssue('emptyFile', itemName);
      return false;
    } else if (itemSize && this._settings.maxFileSize && itemSize > this._settings.maxFileSize) {
      this._reportIssue('sizeExceeded', itemName);
      return false;
    } else if (itemSize && itemSize < this._settings.minFileSize) {
      this._reportIssue('sizeBelowMinimum', itemName);
      return false;
    }

    return true;
  },
  /**
   * Displays an error message based on an error code and file name.
   * @param {string} errorCode The key for the error message in _settings.alertMessages.
   * @param {string} resourceName The name of the file that caused the error.
   * @private
   */
  _reportIssue: function(errorCode, resourceName) {
    var alertMessage = this._settings.alertMessages[errorCode];

    function replacePlaceholder(placeholder, newValue) {
      alertMessage = alertMessage.replace(placeholder, newValue);
    }

    replacePlaceholder('{file}', this._trimFileName(resourceName));
    replacePlaceholder('{extensions}', this._settings.permittedExtensions.join(', '));
    replacePlaceholder('{sizeLimit}', this._formatByteSize(this._settings.maxFileSize));
    replacePlaceholder('{minSizeLimit}', this._formatByteSize(this._settings.minFileSize));

    this._settings.displayMessage(alertMessage);
  },
  /**
   * Truncates a file name for display if it's too long.
   * @param {string} originalName The full file name.
   * @return {string} The formatted file name.
   * @private
   */
  _trimFileName: function(originalName) {
    if (originalName.length > 33) {
      originalName = originalName.slice(0, 19) + '...' + originalName.slice(-13);
    }
    return originalName;
  },
  /**
   * Checks if a file's extension is allowed.
   * @param {string} resourceName The name of the file.
   * @return {boolean} True if the extension is permitted, false otherwise.
   * @private
   */
  _isExtensionPermitted: function(resourceName) {
    var fileExtension = (-1 !== resourceName.indexOf('.')) ? resourceName.replace(/.*[.]/, '').toLowerCase() : '';
    var permittedExtensions = this._settings.permittedExtensions;

    if (!permittedExtensions.length) {
      return true;
    }

    for (var idx = 0; idx < permittedExtensions.length; idx++) {
      if (permittedExtensions[idx].toLowerCase() == fileExtension) {
        return true;
      }
    }

    return false;
  },
  /**
   * Formats a byte count into a human-readable size (e.g., KB, MB).
   * @param {number} byteCount The number of bytes.
   * @return {string} The formatted size string.
   * @private
   */
  _formatByteSize: function(byteCount) {
    var unitIndex = -1;
    do {
      byteCount = byteCount / 1024;
      unitIndex++;
    } while (byteCount > 99);

    return Math.max(byteCount, 0.1).toFixed(1) + ['KB', 'MB', 'GB', 'TB', 'PB', 'EB'][unitIndex];
  }
};

/**
 * Extends the BaseFileTransfer to provide a full-featured upload widget
 * with drag-and-drop support and a visual file list.
 * @inherits myUtil.BaseFileTransfer
 */
myUtil.AdvancedFileTransfer = function(configuration) {
  // Call the parent constructor
  myUtil.BaseFileTransfer.apply(this, arguments);

  // Additional options specific to the advanced widget
  myUtil.mergeProps(this._settings, {
    containerElement: null,
    // If specified, this element will be used instead of the default list within the template
    displayListElement: null,

    mainTemplate: '<div class="upload-widget-main">' +
      '<div class="upload-area-drop"><span>Drop files here to begin upload</span></div>' +
      '<div class="upload-trigger-button">Select a file</div>' +
      '<ul class="upload-file-display-list"></ul>' +
      '</div>',

    // Template for a single file item in the display list
    itemTemplate: '<li>' +
      '<span class="file-name-label"></span>' +
      '<span class="upload-progress-spinner"></span>' +
      '<span class="file-size-label"></span>' +
      '<a class="upload-action-cancel" href="#">Cancel</a>' +
      '<span class="upload-status-failed">Failed</span>' +
      '</li>',