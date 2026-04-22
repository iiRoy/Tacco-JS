/*
 *  Website: https://www.example.com/multi-upload-tool
 *
 *  Robust file upload module with visual progress bar, supporting drag-and-drop.
 *  © 2023 MyCompany ( info(at)mycompany.org )
 *
 *  Licensed under the MIT License, see license.md for details.
 */

//
//  Essential utility methods
//

let mu = mu || {};

/**
 * Copies all absent attributes from a source object to a target object.
 * @param {object} targetObj The object to receive new properties.
 * @param {object} sourceObj The object providing properties to copy.
 */
mu.mergeProperties = function (targetObj, sourceObj) {
  for (let keyName in sourceObj) {
    targetObj[keyName] = sourceObj[keyName];
  }
};

/**
 * Locates the position of a specific item within an array, returning -1 if not found.
 * @param {Array} dataArray The array to search within.
 * @param {*} itemToFind The element to search for.
 * @param {number} [startIndex=0] The index from which to commence the search.
 * @returns {number} The index of the first occurrence of the item, or -1.
 */
mu.findPosition = function (dataArray, itemToFind, startIndex) {
  if (dataArray.indexOf) {
    return dataArray.indexOf(itemToFind, startIndex);
  }

  startIndex = startIndex || 0;
  let arrayLength = dataArray.length;

  if (startIndex < 0) {
    startIndex += arrayLength;
  }

  for (; startIndex < arrayLength; startIndex++) {
    if (startIndex in dataArray && dataArray[startIndex] === itemToFind) {
      return startIndex;
    }
  }
  return -1;
};

mu.getNextIdentifier = (function () {
  let currentID = 0;
  return function () {
    return currentID++;
  };
})();

//
//  DOM event handling utilities
//

mu.addEvent = function (domElement, eventType, eventHandler) {
  if (domElement.addEventListener) {
    domElement.addEventListener(eventType, eventHandler, false);
  } else if (domElement.attachEvent) {
    domElement.attachEvent("on" + eventType, eventHandler);
  }
};
mu.removeEvent = function (domElement, eventType, eventHandler) {
  if (domElement.removeEventListener) {
    domElement.removeEventListener(eventType, eventHandler, false);
  } else if (domElement.attachEvent) {
    domElement.detachEvent("on" + eventType, eventHandler);
  }
};

mu.blockDefaultAction = function (eventObject) {
  if (eventObject.preventDefault) {
    eventObject.preventDefault();
  } else {
    eventObject.returnValue = false;
  }
};

//
//  DOM Node manipulation
//

/**
 * Inserts a new DOM node before a specified reference node.
 * @param {Node} newChild The node to insert.
 * @param {Node} referenceChild The node before which to insert the new node.
 */
mu.placeBefore = function (newChild, referenceChild) {
  referenceChild.parentNode.insertBefore(newChild, referenceChild);
};
mu.deleteNode = function (nodeToRemove) {
  nodeToRemove.parentNode.removeChild(nodeToRemove);
};

mu.isAncestorOf = function (ancestorNode, descendantNode) {
  // compareDocumentPosition might return false if nodes are identical
  if (ancestorNode == descendantNode) {
    return true;
  }

  if (ancestorNode.contains) {
    return ancestorNode.contains(descendantNode);
  } else {
    return !!(descendantNode.compareDocumentPosition(ancestorNode) & 8);
  }
};

/**
 * Generates and returns a DOM element from an HTML string.
 * This method leverages innerHTML for element creation.
 * @param {string} htmlString The HTML markup to convert.
 * @returns {Element} The newly created DOM element.
 */
mu.convertHtmlToNode = (function () {
  let tempContainer = document.createElement("div");
  return function (htmlString) {
    tempContainer.innerHTML = htmlString;
    let createdNode = tempContainer.firstChild;
    tempContainer.removeChild(createdNode);
    return createdNode;
  };
})();

//
//  DOM Node properties and attributes management
//

/**
 * Applies a set of CSS styles to a given element.
 * Includes a fix for opacity rendering in older IE browsers (IE6-8).
 * @param {Element} targetNode The DOM element to style.
 * @param {object} styleProps An object containing CSS property-value pairs.
 */
mu.applyStyles = function (targetNode, styleProps) {
  if (styleProps.opacity !== null) {
    if (
      typeof targetNode.style.opacity != "string" &&
      typeof targetNode.filters != "undefined"
    ) {
      styleProps.filter =
        "alpha(opacity=" + Math.round(100 * styleProps.opacity) + ")";
    }
  }
  mu.mergeProperties(targetNode.style, styleProps);
};
mu.hasClassName = function (targetNode, className) {
  let classRegex = new RegExp("(^| )" + className + "( |$)");
  return classRegex.test(targetNode.className);
};
mu.addClassName = function (targetNode, className) {
  if (!mu.hasClassName(targetNode, className)) {
    targetNode.className += " " + className;
  }
};
mu.removeClassName = function (targetNode, className) {
  let classRegex = new RegExp("(^| )" + className + "( |$)");
  targetNode.className = targetNode.className
    .replace(classRegex, " ")
    .replace(/^\s+|\s+$/g, "");
};
mu.updateTextContent = function (targetNode, textContent) {
  targetNode.innerText = textContent;
  targetNode.textContent = textContent;
};

//
//  Methods for selecting DOM elements
//

mu.getChildElements = function (parentNode) {
  let childList = [],
    currentNode = parentNode.firstChild;

  while (currentNode) {
    if (currentNode.nodeType == 1) {
      childList.push(currentNode);
    }
    currentNode = currentNode.nextSibling;
  }

  return childList;
};

mu.getNodesByClass = function (searchRoot, targetClass) {
  if (searchRoot.querySelectorAll) {
    return searchRoot.querySelectorAll("." + targetClass);
  }

  let foundElements = [];
  let allDescendants = searchRoot.getElementsByTagName("*");
  let candidateCount = allDescendants.length;

  for (let idx = 0; idx < candidateCount; idx++) {
    if (mu.hasClassName(allDescendants[idx], targetClass)) {
      foundElements.push(allDescendants[idx]);
    }
  }
  return foundElements;
};

/**
 * Converts a JavaScript object into a URL-encoded query string.
 * This is functionally similar to jQuery's `$.param()` method.
 *
 * Usage example:
 *
 *    `mu.objectToQueryString({alpha:'beta',gamma:'delta'},'https://example.org/api?existing=true');`
 *
 * This will produce:
 *
 *    `https://example.org/api?existing=true&alpha=beta&gamma=delta`
 *
 * @param  {object} dataObject The JSON-like object to serialize.
 * @param  {string} [currentQueryPart] An optional existing query string part to append to.
 * @param  {boolean} [prefixAlreadyHandled] Internal flag to manage prefixing.
 * @returns {string} The URL-encoded query string.
 */
mu.objectToQueryString = function (
  dataObject,
  currentQueryPart,
  prefixAlreadyHandled
) {
  let querySegments = [],
    separatorChar = "&",
    appendSegment = function (itemValue, itemKey) {
      let segmentName = currentQueryPart
        ? /\[\]$/.test(currentQueryPart) // avoid double-encoding for array-like names
          ? currentQueryPart
          : currentQueryPart + "[" + itemKey + "]"
        : itemKey;
      if (segmentName != "undefined" && itemKey != "undefined") {
        querySegments.push(
          typeof itemValue === "object"
            ? mu.objectToQueryString(itemValue, segmentName, true)
            : Object.prototype.toString.call(itemValue) ===
              "[object Function]"
            ? encodeURIComponent(segmentName) +
              "=" +
              encodeURIComponent(itemValue())
            : encodeURIComponent(segmentName) +
              "=" +
              encodeURIComponent(itemValue)
        );
      }
    };

  if (!prefixAlreadyHandled && currentQueryPart) {
    separatorChar = /\?/.test(currentQueryPart)
      ? /\?$/.test(currentQueryPart)
        ? ""
        : "&"
      : "?";
    querySegments.push(currentQueryPart);
    querySegments.push(mu.objectToQueryString(dataObject));
  } else if (
    Object.prototype.toString.call(dataObject) === "[object Array]" &&
    typeof dataObject != "undefined"
  ) {
    // Iterate over arrays without a for-in loop for better performance
    for (let itemKey = 0, objectLength = dataObject.length; itemKey < objectLength; ++itemKey) {
      appendSegment(dataObject[itemKey], itemKey);
    }
  } else if (
    typeof dataObject != "undefined" &&
    dataObject !== null &&
    typeof dataObject === "object"
  ) {
    // For all other object types, use a for-in loop
    for (let itemKey in dataObject) {
      appendSegment(dataObject[itemKey], itemKey);
    }
  } else {
    querySegments.push(
      encodeURIComponent(currentQueryPart) +
        "=" +
        encodeURIComponent(dataObject)
    );
  }

  return querySegments
    .join(separatorChar)
    .replace(/^&/, "")
    .replace(/%20/g, "+");
};

//
//
//  Primary Uploader Components
//
//

let mu = mu || {};

/**
 * Base class for file upload functionality, handles validation but not UI features like list or D&D.
 * @param {object} configOptions Configuration object for the uploader.
 */
mu.CoreFileUploader = function (configOptions) {
  this._configuration = {
    // Set to true for verbose logging of server responses
    debugMode: false,
    uploadEndpoint: "/api/upload",
    requestParameters: {},
    triggerButton: null,
    allowMultiple: true,
    maxConcurrentConnections: 3,
    // File validation rules
    permittedExtensions: [],
    maxFileSize: 0,
    minFileSize: 0,
    // Event callbacks
    // Returning false from onUploadInitiate will halt the upload
    onUploadInitiate: function (uploadId, uploadFileName) {},
    onUploadProgress: function (uploadId, uploadFileName, bytesLoaded, totalBytes) {},
    onUploadComplete: function (uploadId, uploadFileName, uploadResult) {},
    onUploadCancel: function (uploadId, uploadFileName) {},
    // User messages
    statusMessages: {
      invalidExtension:
        "{file} has an unsupported file type. Only {extensions} are allowed.",
      fileTooLarge:
        "{file} exceeds the maximum size limit of {sizeLimit}.",
      fileTooSmall:
        "{file} is below the minimum size of {minSizeLimit}.",
      fileEmpty:
        "{file} is empty. Please select valid files.",
      navigationWarning:
        "Files are currently uploading. Navigating away will cancel the process.",
    },
    displayAlert: function (messageText) {
      alert(messageText);
    },
  };
  mu.mergeProperties(this._configuration, configOptions);

  // Counter for currently active uploads
  this._activeUploadCount = 0;
  this._uploadProcessor = this._instantiateUploadProcessor();

  if (this._configuration.triggerButton) {
    this._uploadInitiator = this._buildUploadInitiator(
      this._configuration.triggerButton
    );
  }

  this._preventNavigationWhileUploading();
};

mu.CoreFileUploader.prototype = {
  configureParameters: function (newParameters) {
    this._configuration.requestParameters = newParameters;
  },
  getActiveUploads: function () {
    return this._activeUploadCount;
  },
  _buildUploadInitiator: function (buttonElement) {
    let instanceRef = this;

    return new mu.UploadButton({
      domElement: buttonElement,
      allowMultiple:
        this._configuration.allowMultiple && mu.XhrUploadHandler.isSupported(),
      onFileSelection: function (fileInputNode) {
        instanceRef._handleFileInputChange(fileInputNode);
      },
    });
  },
  _instantiateUploadProcessor: function () {
    let instanceRef = this,
      processorType;

    if (mu.XhrUploadHandler.isSupported()) {
      processorType = "XhrUploadHandler";
    } else {
      processorType = "FormUploadHandler";
    }

    let processorInstance = new mu[processorType]({
      debugMode: this._configuration.debugMode,
      uploadEndpoint: this._configuration.uploadEndpoint,
      maxConcurrentConnections: this._configuration.maxConcurrentConnections,
      onUploadProgress: function (uploadId, uploadFileName, bytesLoaded, totalBytes) {
        instanceRef._onUploadProgress(uploadId, uploadFileName, bytesLoaded, totalBytes);
        instanceRef._configuration.onUploadProgress(uploadId, uploadFileName, bytesLoaded, totalBytes);
      },
      onUploadComplete: function (uploadId, uploadFileName, uploadResult) {
        instanceRef._onUploadCompletion(uploadId, uploadFileName, uploadResult);
        instanceRef._configuration.onUploadComplete(uploadId, uploadFileName, uploadResult);
      },
      onUploadCancel: function (uploadId, uploadFileName) {
        instanceRef._onUploadCancellation(uploadId, uploadFileName);
        instanceRef._configuration.onUploadCancel(uploadId, uploadFileName);
      },
    });

    return processorInstance;
  },
  _preventNavigationWhileUploading: function () {
    let instanceRef = this;

    mu.addEvent(window, "beforeunload", function (eventObj) {
      if (!instanceRef._activeUploadCount) {
        return;
      }

      let currentEvent = eventObj || window.event;
      // For Internet Explorer, Firefox
      currentEvent.returnValue = instanceRef._configuration.statusMessages.navigationWarning;
      // For Webkit-based browsers
      return instanceRef._configuration.statusMessages.navigationWarning;
    });
  },
  _onUploadInitiate: function (uploadId, uploadFileName) {
    this._activeUploadCount++;
  },
  _onUploadProgress: function (uploadId, uploadFileName, bytesLoaded, totalBytes) {
    // This method can be overridden by subclasses for custom progress handling
  },
  _onUploadCompletion: function (uploadId, uploadFileName, uploadResult) {
    this._activeUploadCount--;
    if (uploadResult.error) {
      this._configuration.displayAlert(uploadResult.error);
    }
  },
  _onUploadCancellation: function (uploadId, uploadFileName) {
    this._activeUploadCount--;
  },
  _handleFileInputChange: function (fileInputNode) {
    if (this._uploadProcessor instanceof mu.XhrUploadHandler) {
      this._processFileList(fileInputNode.files);
    } else {
      if (this._checkFileValidity(fileInputNode)) {
        this._initiateFileUpload(fileInputNode);
      }
    }
    this._uploadInitiator.reset();
  },
  _processFileList: function (fileArray) {
    for (let fileIndex = 0; fileIndex < fileArray.length; fileIndex++) {
      if (!this._checkFileValidity(fileArray[fileIndex])) {
        return; // Stop processing if any file is invalid
      }
    }

    for (let fileIndex = 0; fileIndex < fileArray.length; fileIndex++) {
      this._initiateFileUpload(fileArray[fileIndex]);
    }
  },
  _initiateFileUpload: function (fileObject) {
    let uploadId = this._uploadProcessor.add(fileObject);
    let uploadFileName = this._uploadProcessor.getName(uploadId);

    if (this._configuration.onUploadInitiate(uploadId, uploadFileName) !== false) {
      this._onUploadInitiate(uploadId, uploadFileName);
      this._uploadProcessor.upload(uploadId, this._configuration.requestParameters);
    }
  },
  _checkFileValidity: function (fileObject) {
    let itemName, itemSize;

    if (fileObject.value) {
      // It's a file input element
      // Extract filename, removing path for normalization
      itemName = fileObject.value.replace(/.*(\/|\\)/, "");
    } else {
      // Handle missing properties in Safari/older browsers
      itemName = fileObject.fileName !== null ? fileObject.fileName : fileObject.name;
      itemSize = fileObject.fileSize !== null ? fileObject.fileSize : fileObject.size;
    }

    if (!this._isExtensionPermitted(itemName)) {
      this._displayErrorMessage("invalidExtension", itemName);
      return false;
    } else if (itemSize === 0) {
      this._displayErrorMessage("fileEmpty", itemName);
      return false;
    } else if (itemSize && this._configuration.maxFileSize && itemSize > this._configuration.maxFileSize) {
      this._displayErrorMessage("fileTooLarge", itemName);
      return false;
    } else if (itemSize && itemSize < this._configuration.minFileSize) {
      this._displayErrorMessage("fileTooSmall", itemName);
      return false;
    }

    return true;
  },
  _displayErrorMessage: function (errorCode, uploadFileName) {
    let messageText = this._configuration.statusMessages[errorCode];

    function replacePlaceholder(placeholderName, replacementValue) {
      messageText = messageText.replace(placeholderName, replacementValue);
    }

    replacePlaceholder("{file}", this._trimFileName(uploadFileName));
    replacePlaceholder("{extensions}", this._configuration.permittedExtensions.join(", "));
    replacePlaceholder("{sizeLimit}", this._formatByteSize(this._configuration.maxFileSize));
    replacePlaceholder("{minSizeLimit}", this._formatByteSize(this._configuration.minFileSize));

    this._configuration.displayAlert(messageText);
  },
  _trimFileName: function (inputFileName) {
    if (inputFileName.length > 33) {
      inputFileName =
        inputFileName.slice(0, 19) + "..." + inputFileName.slice(-13);
    }
    return inputFileName;
  },
  _isExtensionPermitted: function (fileName) {
    let fileExtension =
      -1 !== fileName.indexOf(".")
        ? fileName.replace(/.*[.]/, "").toLowerCase()
        : "";
    let permittedExtensions = this._configuration.permittedExtensions;

    if (!permittedExtensions.length) {
      return true;
    }

    for (let fileIndex = 0; fileIndex < permittedExtensions.length; fileIndex++) {
      if (permittedExtensions[fileIndex].toLowerCase() == fileExtension) {
        return true;
      }
    }

    return false;
  },
  _formatByteSize: function (byteCount) {
    let unitIndex = -1;
    do {
      byteCount = byteCount / 1024;
      unitIndex++;
    } while (byteCount > 99);

    return (
      Math.max(byteCount, 0.1).toFixed(1) +
      ["KB", "MB", "GB", "TB", "PB", "EB"][unitIndex]
    );
  },
};

/**
 * Extends the basic file uploader to include drag-and-drop and a file list display.
 * @augments mu.CoreFileUploader
 * @param {object} configurationSettings Configuration object for the uploader.
 */
mu.DragDropFileUploader = function (configurationSettings) {
  // Invoke the parent constructor
  mu.CoreFileUploader.apply(this, arguments);

  // Additional configuration parameters
  mu.mergeProperties(this._configuration, {
    containerElement: null,
    // If provided, this element will be used for the file list instead of the default template's list.
    displayListElement: null,

    componentTemplate:
      '<div class="mu-upload-wrapper">' +
      '<div class="mu-upload-drop-zone"><span>Drag files here to begin upload</span></div>' +
      '<div class="mu-upload-trigger-button">Select a file</div>' +
      '<ul class="mu-upload-item-list"></ul>' +
      "</div>",

    // HTML template for a single item within the file list
    itemTemplate:
      "<li>" +
      '<span class="mu-upload-file-name"></span>' +
      '<span class="mu-upload-progress-spinner"></span>' +
      '<span class="mu-upload-file-size"></span>' +
      '<a class="mu-upload-action-cancel" href="#">Remove</a>' +
      '<span class="mu-upload-status-message">Upload Failed</span>' +
      "</li>",