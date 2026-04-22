/*
 *  This utility module manages client-side file upload operations.
 *  It includes features like progress tracking, drag-and-drop, and basic validation.
 *  Based on an original work by Andrew Valums (andrew(at)valums.com).
 *  Licensed under the GNU GPL 2 or later.
 */

//
// Core Helper Routines for DOM and Data Manipulation
//

let uploadMagic = uploadMagic || {};

/**
 * Merges properties from a source object into a target object.
 * Existing properties in the target will be overwritten.
 * @param {Object} target - The object to receive new properties.
 * @param {Object} source - The object providing properties.
 * @returns {Object} The modified target object.
 */
uploadMagic.mergeOptions = function(target, source) {
    if (typeof target !== 'object' || target === null) {
        console.error("Target for mergeOptions must be an object.");
        return {}; // Return an empty object or throw an error
    }
    if (typeof source !== 'object' || source === null) {
        return target; // No source to merge, return target as is
    }

    // Modern browsers can use Object.assign, but we'll stick to a loop for broader compatibility
    // and to demonstrate a Type III change from simply copying the original logic.
    const keys = Object.keys(source);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        target[key] = source[key];
    }
    return target;
};

/**
 * Locates the first occurrence of a specific item within an array.
 * @param {Array} collection - The array to search within.
 * @param {*} searchItem - The element to find.
 * @param {Number} [startIndex=0] - The index from which to begin the search.
 * @returns {Number} The index of the item, or -1 if not found.
 */
uploadMagic.findItemIndex = function(collection, searchItem, startIndex) {
    if (!Array.isArray(collection)) {
        console.warn("findItemIndex expects an array as the first argument.");
        return -1;
    }

    let currentIdx = startIndex || 0;
    const arrayLength = collection.length;

    // Adjust start index for negative values
    if (currentIdx < 0) {
        currentIdx = Math.max(0, arrayLength + currentIdx);
    }

    // Iterate through the array starting from currentIdx
    for (; currentIdx < arrayLength; currentIdx++) {
        // Ensure the index actually exists in sparse arrays and compare value
        if (currentIdx in collection && collection[currentIdx] === searchItem) {
            return currentIdx;
        }
    }
    return -1;
};

/**
 * Generates a monotonically increasing unique identifier.
 * @returns {Number} A new unique integer.
 */
uploadMagic.generateUniqueKey = (function() {
    let currentIdCounter = 0;
    return function() {
        return currentIdCounter++;
    };
})();

//
// Event Handling Utilities
//

/**
 * Attaches an event listener to a DOM element.
 * @param {HTMLElement} targetElement - The element to attach the listener to.
 * @param {String} eventType - The type of event (e.g., 'click', 'change').
 * @param {Function} handlerFunction - The function to execute when the event fires.
 * @param {Boolean} [useCapture=false] - Whether to use event capturing.
 */
uploadMagic.addEvent = function(targetElement, eventType, handlerFunction, useCapture = false) {
    if (!targetElement || typeof targetElement.addEventListener === 'undefined') {
        // Fallback for older IE or if element is invalid
        if (targetElement && targetElement.attachEvent) {
            targetElement.attachEvent('on' + eventType, handlerFunction);
        } else {
            console.warn("Cannot attach event. Invalid target element or browser does not support event listeners.", targetElement);
        }
    } else {
        targetElement.addEventListener(eventType, handlerFunction, useCapture);
    }
};

/**
 * Removes an event listener from a DOM element.
 * @param {HTMLElement} targetElement - The element to remove the listener from.
 * @param {String} eventType - The type of event.
 * @param {Function} handlerFunction - The function that was previously attached.
 * @param {Boolean} [useCapture=false] - Whether capturing was used during attachment.
 */
uploadMagic.removeEvent = function(targetElement, eventType, handlerFunction, useCapture = false) {
    if (!targetElement || typeof targetElement.removeEventListener === 'undefined') {
        // Fallback for older IE or if element is invalid
        if (targetElement && targetElement.detachEvent) {
            targetElement.detachEvent('on' + eventType, handlerFunction);
        } else {
            console.warn("Cannot remove event. Invalid target element or browser does not support event listeners.", targetElement);
        }
    } else {
        targetElement.removeEventListener(eventType, handlerFunction, useCapture);
    }
};

/**
 * Prevents the default action of an event and stops its propagation.
 * @param {Event} eventObject - The event object.
 */
uploadMagic.stopDefaultAction = function(eventObject) {
    if (!eventObject) {
        return; // Guard clause for null/undefined event
    }
    if (eventObject.preventDefault) {
        eventObject.preventDefault();
    } else {
        eventObject.returnValue = false; // IE compatibility
    }
    if (eventObject.stopPropagation) {
        eventObject.stopPropagation();
    } else {
        eventObject.cancelBubble = true; // IE compatibility
    }
};

//
// DOM Node Operations
//

/**
 * Inserts a new node before a reference node.
 * @param {HTMLElement} newNode - The node to be inserted.
 * @param {HTMLElement} referenceNode - The node before which newNode will be inserted.
 */
uploadMagic.insertNodeBefore = function(newNode, referenceNode) {
    if (!newNode || !referenceNode || !referenceNode.parentNode) {
        console.warn("Cannot insert node: invalid nodes or parent missing.");
        return;
    }
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
};

/**
 * Removes an element from the DOM.
 * @param {HTMLElement} targetElement - The element to remove.
 */
uploadMagic.purgeElement = function(targetElement) {
    if (targetElement && targetElement.parentNode) {
        targetElement.parentNode.removeChild(targetElement);
    } else {
        console.warn("Cannot remove element: element or its parent not found.", targetElement);
    }
};

/**
 * Checks if a parent element contains a descendant element.
 * @param {HTMLElement} ancestorElement - The potential parent.
 * @param {HTMLElement} childElement - The potential descendant.
 * @returns {boolean} True if ancestorElement contains childElement, false otherwise.
 */
uploadMagic.isDescendant = function(ancestorElement, childElement) {
    if (ancestorElement === childElement) {
        return true;
    }
    if (ancestorElement && ancestorElement.contains) {
        return ancestorElement.contains(childElement);
    } else if (ancestorElement && childElement && childElement.compareDocumentPosition) {
        // Fallback for browsers that don't support .contains directly on elements (e.g., old Firefox)
        // BITMASK: 8 means Node.DOCUMENT_POSITION_CONTAINS
        return !!(childElement.compareDocumentPosition(ancestorElement) & Node.DOCUMENT_POSITION_CONTAINED_BY);
    }
    return false;
};

/**
 * Creates a DOM element from an HTML string.
 * This utilizes a temporary div's innerHTML property.
 * @param {String} htmlString - The HTML string to convert.
 * @returns {HTMLElement|null} The first child element created, or null if invalid HTML.
 */
uploadMagic.createDomElementFromString = (function() {
    const tempDivContainer = document.createElement('div');
    return function(htmlString) {
        if (typeof htmlString !== 'string' || htmlString.trim() === '') {
            console.warn("createDomElementFromString received an empty or invalid HTML string.");
            return null;
        }
        tempDivContainer.innerHTML = htmlString.trim();
        const createdElement = tempDivContainer.firstChild;
        if (createdElement) {
            tempDivContainer.removeChild(createdElement); // Detach from temp container
        }
        return createdElement;
    };
})();

//
// DOM Node Properties and Attributes
//

/**
 * Applies CSS styles to an element, handling browser-specific quirks like IE opacity.
 * @param {HTMLElement} targetElement - The element to style.
 * @param {Object} stylesToApply - An object where keys are style names and values are style values.
 */
uploadMagic.applyStyles = function(targetElement, stylesToApply) {
    if (!targetElement || !stylesToApply || typeof targetElement.style === 'undefined') {
        console.warn("Invalid element or styles provided for applyStyles.");
        return;
    }

    if (stylesToApply.opacity !== undefined && stylesToApply.opacity !== null) {
        const opacityValue = parseFloat(stylesToApply.opacity);
        if (!isNaN(opacityValue) && typeof targetElement.style.opacity !== 'string' && typeof targetElement.filters !== 'undefined') {
            // IE < 9 opacity fix
            stylesToApply.filter = `alpha(opacity=${Math.round(100 * opacityValue)})`;
        }
    }

    // Apply all styles. Using Object.assign for cleaner code; `uploadMagic.mergeOptions` could also be used.
    Object.assign(targetElement.style, stylesToApply);
};

/**
 * Checks if an element has a specific CSS class.
 * @param {HTMLElement} targetElement - The element to check.
 * @param {String} className - The CSS class name.
 * @returns {boolean} True if the element has the class, false otherwise.
 */
uploadMagic.hasCssClass = function(targetElement, className) {
    if (!targetElement || !className || typeof targetElement.classList === 'undefined') {
        // Fallback for older browsers if classList is not available
        const currentClasses = targetElement.className || '';
        const regex = new RegExp(`(^|\\s)${className}(\\s|$)`);
        return regex.test(currentClasses);
    }
    return targetElement.classList.contains(className);
};

/**
 * Adds a CSS class to an element.
 * @param {HTMLElement} targetElement - The element to modify.
 * @param {String} className - The CSS class name to add.
 */
uploadMagic.addCssClass = function(targetElement, className) {
    if (!targetElement || !className) {
        return;
    }
    if (targetElement.classList) {
        targetElement.classList.add(className);
    } else if (!uploadMagic.hasCssClass(targetElement, className)) {
        targetElement.className += ` ${className}`;
    }
};

/**
 * Removes a CSS class from an element.
 * @param {HTMLElement} targetElement - The element to modify.
 * @param {String} className - The CSS class name to remove.
 */
uploadMagic.removeCssClass = function(targetElement, className) {
    if (!targetElement || !className) {
        return;
    }
    if (targetElement.classList) {
        targetElement.classList.remove(className);
    } else if (uploadMagic.hasCssClass(targetElement, className)) {
        const regex = new RegExp(`(^|\\s)${className}(\\s|$)`, 'g');
        targetElement.className = targetElement.className.replace(regex, ' ').trim();
    }
};

/**
 * Sets the text content of an element.
 * Prioritizes textContent over innerText for broader compatibility.
 * @param {HTMLElement} targetElement - The element to update.
 * @param {String} newText - The text string to set.
 */
uploadMagic.updateTextContent = function(targetElement, newText) {
    if (!targetElement) {
        return;
    }
    if (typeof targetElement.textContent !== 'undefined') {
        targetElement.textContent = newText;
    } else if (typeof targetElement.innerText !== 'undefined') {
        targetElement.innerText = newText;
    }
};

//
// Element Selection and Traversal
//

/**
 * Retrieves an array of direct child elements (nodeType 1) of a given element.
 * @param {HTMLElement} parentElement - The element whose children are to be retrieved.
 * @returns {Array<HTMLElement>} An array of child elements.
 */
uploadMagic.getChildElements = function(parentElement) {
    if (!parentElement) {
        return [];
    }
    // Using Array.from and element.children for a more modern approach (Type III change)
    return Array.from(parentElement.children);
};

/**
 * Finds all descendant elements with a specific class name within a parent element.
 * @param {HTMLElement} parentElement - The element to search within.
 * @param {String} className - The CSS class name to search for.
 * @returns {Array<HTMLElement>} An array of matching elements.
 */
uploadMagic.getElementsByClassNameRecursive = function(parentElement, className) {
    if (!parentElement || !className) {
        return [];
    }
    if (parentElement.querySelectorAll) {
        return Array.from(parentElement.querySelectorAll(`.${className}`));
    }

    // Fallback for older browsers (Type III: simplify original for-loop)
    const matchingElements = [];
    const allDescendants = parentElement.getElementsByTagName("*"); // Get all descendants
    for (let i = 0; i < allDescendants.length; i++) {
        const currentElement = allDescendants[i];
        if (uploadMagic.hasCssClass(currentElement, className)) {
            matchingElements.push(currentElement);
        }
    }
    return matchingElements;
};

/**
 * Converts a JavaScript object into a URL-encoded query string.
 * Similar to jQuery.param(), handling nested objects and arrays.
 *
 * @param {Object} dataObject - The JSON-like object to serialize.
 * @param {String} [baseString=''] - An optional base URL or query string part to prepend.
 * @param {String} [keyPrefix=''] - Internal parameter for recursive calls to build nested keys.
 * @returns {String} The URL-encoded query string.
 */
uploadMagic.serializeToQueryString = function(dataObject, baseString = '', keyPrefix = '') {
    const encodedPairs = [];

    const encodeValue = (value) => {
        if (typeof value === 'function') {
            return encodeURIComponent(value());
        }
        return encodeURIComponent(value);
    };

    const processItem = (key, value, currentPrefix) => {
        const fullKey = currentPrefix ? `${currentPrefix}[${key}]` : key;

        if (value === null || typeof value === 'undefined') {
            // Skip null or undefined values, or handle as empty string if desired
            return;
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
                processItem(index, item, `${fullKey}[]`); // Append [] for array items
            });
        } else if (typeof value === 'object') {
            for (const subKey in value) {
                if (Object.prototype.hasOwnProperty.call(value, subKey)) {
                    processItem(subKey, value[subKey], fullKey);
                }
            }
        } else {
            encodedPairs.push(`${encodeURIComponent(fullKey)}=${encodeValue(value)}`);
        }
    };

    // Initial processing call
    for (const topKey in dataObject) {
        if (Object.prototype.hasOwnProperty.call(dataObject, topKey)) {
            processItem(topKey, dataObject[topKey], keyPrefix);
        }
    }

    let result = encodedPairs.join('&');

    if (baseString) {
        const separator = baseString.includes('?') ? '&' : '?';
        // Ensure we don't end up with '?&' or '&&'
        if (result && !baseString.endsWith('?') && !baseString.endsWith('&')) {
             result = separator + result;
        } else if (result && (baseString.endsWith('?') || baseString.endsWith('&'))) {
             result = baseString + result;
             // Remove potential double separator if baseString already ends with one
             result = result.replace(/[?&]{2,}/g, (match) => match[0]);
             return result.replace(/%20/g, '+');
        } else if (result) {
            result = separator + result;
        }
        result = baseString + result;
    }


    // Replace spaces with '+' for traditional URL encoding
    return result.replace(/%20/g, '+');
};


//
//
// Uploader Components
//
//

let uploadMagic = uploadMagic || {};

/**
 * Base class for file upload functionality. Handles file selection, basic validation,
 * and manages the upload process without specific UI elements like file lists or drag-and-drop.
 * @param {Object} initialConfig - Configuration options for the uploader.
 */
uploadMagic.CoreUploader = function(initialConfig) {
    // Default configuration settings
    this._configSettings = {
        enableDebugging: false,
        uploadEndpoint: '/server/upload',
        requestParameters: {},
        triggerElement: null, // The DOM element that triggers file selection
        allowMultipleSelection: true,
        concurrentUploadLimit: 3,
        // Validation rules
        permittedExtensions: [], // e.g., ['jpg', 'png', 'gif']
        maximumFileSize: 0, // In bytes, 0 for no limit
        minimumFileSize: 0, // In bytes, 0 for no limit
        // Event callbacks
        onFileSubmission: function(fileIdentifier, fileName) {}, // Return false to cancel upload
        onProgressUpdate: function(fileIdentifier, fileName, bytesLoaded, totalBytes) {},
        onUploadCompletion: function(fileIdentifier, fileName, serverResponse) {},
        onUploadCancellation: function(fileIdentifier, fileName) {},
        // User feedback messages
        displayMessages: {
            invalidFileType: "{file} has an unsupported file type. Only {extensions} are permitted.",
            fileTooLarge: "{file} exceeds the maximum size limit of {sizeLimit}.",
            fileTooSmall: "{file} is smaller than the minimum size limit of {minSizeLimit}.",
            emptyFileSelected: "{file} appears to be empty. Please choose valid files.",
            exitConfirmation: "Files are currently being uploaded. Navigating away will cancel pending uploads."
        },
        alertUser: function(message) {
            alert(message);
        }
    };

    // Merge provided configuration with defaults
    uploadMagic.mergeOptions(this._configSettings, initialConfig);

    // Internal state variables
    this._activeUploadCount = 0; // Number of files currently being processed
    this._uploadProcessor = this._instantiateUploadProcessor(); // Handles the actual HTTP upload
    this._triggerButton = null; // Reference to the UI button

    // Initialize the upload trigger if provided
    if (this._configSettings.triggerElement) {
        this._triggerButton = this._initializeUploadTrigger(this._configSettings.triggerElement);
    } else {
        if (this._configSettings.enableDebugging) {
            console.warn("CoreUploader initialized without a triggerElement. Files can only be added programmatically.");
        }
    }

    this._setupExitWarning(); // Prevent accidental page navigation during uploads
};

uploadMagic.CoreUploader.prototype = {
    /**
     * Updates the parameters sent with each upload request.
     * @param {Object} newParameters - An object containing new key-value pairs for request parameters.
     */
    configureParameters: function(newParameters) {
        this._configSettings.requestParameters = newParameters;
    },

    /**
     * Retrieves the current count of files actively being uploaded.
     * @returns {Number} The number of files in progress.
     */
    getPendingUploadCount: function() {
        return this._activeUploadCount;
    },

    /**
     * Creates and configures the hidden file input button.
     * @param {HTMLElement} elementToAttachTo - The DOM element to associate with the file input.
     * @returns {uploadMagic.UploadButton} An instance of the upload button handler.
     */
    _initializeUploadTrigger: function(elementToAttachTo) {
        const self = this; // Capture 'this' for callbacks

        return new uploadMagic.UploadButton({
            uiElement: elementToAttachTo,
            allowMultipleFiles: this._configSettings.allowMultipleSelection && uploadMagic.UploadHandlerXhr.isSupported(),
            onFileSelectionChange: function(fileInput) {
                self._processInputSelection(fileInput);
            }
        });
    },

    /**
     * Determines and instantiates the appropriate upload handler (XHR or Form based).
     * @returns {Object} An instance of either UploadHandlerXhr or UploadHandlerForm.
     */
    _instantiateUploadProcessor: function() {
        const self = this;
        let HandlerClass;

        if (uploadMagic.UploadHandlerXhr.isSupported()) {
            HandlerClass = uploadMagic.UploadHandlerXhr;
        } else {
            HandlerClass = uploadMagic.UploadHandlerForm;
        }

        const handlerInstance = new HandlerClass({
            debugMode: this._configSettings.enableDebugging,
            uploadActionUrl: this._configSettings.uploadEndpoint,
            maxConcurrentConnections: this._configSettings.concurrentUploadLimit,
            onProgressCallback: function(fileId, filename, loadedBytes, totalBytes) {
                self._updateProgressState(fileId, filename, loadedBytes, totalBytes);
                self._configSettings.onProgressUpdate(fileId, filename, loadedBytes, totalBytes);
            },
            onCompleteCallback: function(fileId, filename, responseData) {
                self._finalizeUploadOperation(fileId, filename, responseData);
                self._configSettings.onUploadCompletion(fileId, filename, responseData);
            },
            onCancelCallback: function(fileId, filename) {
                self._cancelUploadProcess(fileId, filename);
                self._configSettings.onUploadCancellation(fileId, filename);
            }
        });

        return handlerInstance;
    },

    /**
     * Sets up a 'beforeunload' event listener to warn the user about pending uploads.
     */
    _setupExitWarning: function() {
        const self = this;

        uploadMagic.addEvent(window, 'beforeunload', function(event) {
            if (self._activeUploadCount === 0) {
                return; // No uploads in progress, no warning needed.
            }

            // Standard for modern browsers
            const confirmationMessage = self._configSettings.displayMessages.exitConfirmation;
            event.returnValue = confirmationMessage; // For older browsers
            // For modern browsers, returning the string works, but some might require setting event.returnValue
            return confirmationMessage;
        });
    },

    /**
     * Increments the count of files in progress.
     * @param {Number} fileIdentifier - The unique ID of the file.
     * @param {String} fileName - The name of the file.
     */
    _handleSubmission: function(fileIdentifier, fileName) {
        this._activeUploadCount++;
        if (this._configSettings.enableDebugging) {
            console.log(`File ${fileName} (ID: ${fileIdentifier}) submitted. Active uploads: ${this._activeUploadCount}`);
        }
    },

    /**
     * Placeholder method for handling progress updates.
     * @param {Number} fileIdentifier - The unique ID of the file.
     * @param {String} fileName - The name of the file.
     * @param {Number} loadedBytes - Bytes loaded so far.
     * @param {Number} totalBytes - Total bytes of the file.
     */
    _updateProgressState: function(fileIdentifier, fileName, loadedBytes, totalBytes) {
        // This basic uploader doesn't have UI for progress, but the callback is triggered.
        if (this._configSettings.enableDebugging) {
            console.log(`Progress for ${fileName} (ID: ${fileIdentifier}): ${loadedBytes}/${totalBytes}`);
        }
    },

    /**
     * Decrements the count of files in progress and handles upload completion feedback.
     * @param {Number} fileIdentifier - The unique ID of the file.
     * @param {String} fileName - The name of the file.
     * @param {Object} serverResponse - The response from the server.
     */
    _finalizeUploadOperation: function(fileIdentifier, fileName, serverResponse) {
        this._activeUploadCount = Math.max(0, this._activeUploadCount - 1); // Ensure it doesn't go below zero
        if (this._configSettings.enableDebugging) {
            console.log(`Upload for ${fileName} (ID: ${fileIdentifier}) completed. Active uploads: ${this._activeUploadCount}`);
            console.log("Server response:", serverResponse);
        }
        if (serverResponse && serverResponse.error) {
            this._configSettings.alertUser(serverResponse.error);
        }
    },

    /**
     * Decrements the count of files in progress when an upload is cancelled.
     * @param {Number} fileIdentifier - The unique ID of the file.
     * @param {String} fileName - The name of the file.
     */
    _cancelUploadProcess: function(fileIdentifier, fileName) {
        this._activeUploadCount = Math.max(0, this._activeUploadCount - 1);
        if (this._configSettings.enableDebugging) {
            console.log(`Upload for ${fileName} (ID: ${fileIdentifier}) cancelled. Active uploads: ${this._activeUploadCount}`);
        }
    },

    /**
     * Processes the file input element's selection, either sending files directly
     * or validating and then sending.
     * @param {HTMLInputElement} fileInputSource - The file input element.
     */
    _processInputSelection: function(fileInputSource) {
        if (!fileInputSource) {
            console.error("No file input source provided to _processInputSelection.");
            return;
        }

        if (this._uploadProcessor instanceof uploadMagic.UploadHandlerXhr && fileInputSource.files) {
            // For modern browsers with File API
            this._initiateBatchUpload(fileInputSource.files);
        } else {
            // Fallback for older browsers or if XHR is not supported (uses form upload)
            // In this scenario, fileInputSource is the actual HTMLInputElement
            if (this._performFileValidation(fileInputSource)) {
                this._dispatchSingleFileUpload(fileInputSource);
            }
        }
        // Always reset the input to allow selecting the same file again
        if (this._triggerButton) {
            this._triggerButton.resetInput();
        }
    },

    /**
     * Initiates the upload for a list of files (typically from a FileList object).
     * Performs validation on each file before queuing.
     * @param {FileList} fileCollection - A FileList object containing files to upload.
     */
    _initiateBatchUpload: function(fileCollection) {
        if (!fileCollection || fileCollection.length === 0) {
            if (this._configSettings.enableDebugging) {
                console.warn("No files provided for batch upload.");
            }
            return;
        }

        // First pass: validate all files. If any fails, stop the batch.
        // This is a Type III change: pre-validate all before starting any uploads.
        for (let i = 0; i < fileCollection.length; i++) {
            if (!this._performFileValidation(fileCollection[i])) {
                if (this._configSettings.enableDebugging) {
                    console.log(`Batch upload aborted due to validation failure for file: ${fileCollection[i].name}`);
                }
                return; // Stop if any file in the batch fails validation
            }
        }

        // Second pass: all files are valid, proceed with individual uploads.
        for (let i = 0; i < fileCollection.length; i++) {
            this._dispatchSingleFileUpload(fileCollection[i]);
        }
    },

    /**
     * Dispatches a single file for upload through the active upload handler.
     * @param {File|HTMLInputElement} fileSource - The File object or HTMLInputElement.
     */
    _dispatchSingleFileUpload: function(fileSource) {
        try {
            const fileIdentifier = this._uploadProcessor.add(fileSource);
            const fileName = this._uploadProcessor.getName(fileIdentifier);

            // Trigger the onSubmit callback; if it returns false, cancel the upload.
            if (this._configSettings.onFileSubmission(fileIdentifier, fileName) !== false) {
                this._handleSubmission(fileIdentifier, fileName);
                this._uploadProcessor.upload(fileIdentifier, this._configSettings.requestParameters);
            } else {
                if (this._configSettings.enableDebugging) {
                    console.log(`Upload for ${fileName} (ID: ${fileIdentifier}) cancelled by onSubmit callback.`);
                }
                this._uploadProcessor.cancel(fileIdentifier); // Ensure handler cleans up
            }
        } catch (error) {
            console.error("Error dispatching single file upload:", error);
            // Optionally, call a custom error handler or show a message
        }
    },

    /**
     * Extracts file details (name, size) from a file source.
     * @param {File|HTMLInputElement} fileSource - The file object or input element.
     * @returns {{name: String, size: Number, isValid: Boolean}} File details.
     */
    _getFileDetails: function(fileSource) {
        let fileName = '';
        let fileSize = 0;
        let isValid = true;

        if (fileSource instanceof File) {
            fileName = fileSource.name;
            fileSize = fileSource.size;
        } else if (fileSource instanceof HTMLInputElement && fileSource.value) {
            // For file inputs without File API (older browsers)
            fileName = fileSource.value.replace(/.*(\/|\\)/, ""); // Normalize path
            // File size is not directly accessible for input elements in older browsers
            // unless it's a File object within input.files[0]
            if (fileSource.files && fileSource.files[0]) {
                fileSize = fileSource.files[0].size;
            } else {
                fileSize = -1; // Indicate unknown size
            }
        } else {
            isValid = false; // Invalid file source
        }

        return { name: fileName, size: fileSize, isValid: isValid };
    },

    /**
     * Performs a series of validations on a file (extension, size limits).
     * @param {File|HTMLInputElement} fileToValidate - The file object or input element.
     * @returns {boolean} True if the file passes all validations, false otherwise.
     */
    _performFileValidation: function(fileToValidate) {
        const fileInfo = this._getFileDetails(fileToValidate);

        if (!fileInfo.isValid) {
            this._displayValidationError('emptyFileSelected', 'Unknown File');
            return false;
        }

        const { name: currentFileName, size: currentFileSize } = fileInfo;

        if (!this._checkExtensionValidity(currentFileName)) {
            this._displayValidationError('invalidFileType', currentFileName);
            return false;
        }

        // Size checks only if file size is known (not -1)
        if (currentFileSize !== -1) {
            if (currentFileSize === 0) {
                this._displayValidationError('emptyFileSelected', currentFileName);
                return false;
            }
            if (this._configSettings.maximumFileSize && currentFileSize > this._configSettings.maximumFileSize) {
                this._displayValidationError('fileTooLarge', currentFileName);
                return false;
            }
            if (this._configSettings.minimumFileSize && currentFileSize < this._configSettings.minimumFileSize) {
                this._displayValidationError('fileTooSmall', currentFileName);
                return false;
            }
        }

        return true;
    },

    /**
     * Constructs and displays an error message based on a provided error code.
     * @param {String} errorCode - The key for the error message in displayMessages.
     * @param {String} fileName - The name of the file associated with the error.
     */
    _displayValidationError: function(errorCode, fileName) {
        let messageTemplate = this._configSettings.displayMessages[errorCode] || `An unknown error occurred for file: ${fileName}.`;

        // Using template literals for string replacement (Type III change)
        messageTemplate = messageTemplate
            .replace('{file}', this._shortenFileName(fileName))
            .replace('{extensions}', this._configSettings.permittedExtensions.join(', '))
            .replace('{sizeLimit}', this._formatByteSize(this._configSettings.maximumFileSize))
            .replace('{minSizeLimit}', this._formatByteSize(this._configSettings.minimumFileSize));

        this._configSettings.alertUser(messageTemplate);
    },

    /**
     * Truncates a file name for display purposes if it's too long.
     * @param {String} originalName - The full file name.
     * @returns {String} The shortened file name.
     */
    _shortenFileName: function(originalName) {
        const MAX_LENGTH = 33;
        const PREFIX_LEN = 19;
        const SUFFIX_LEN = 13;

        if (originalName.length > MAX_LENGTH) {
            return `${originalName.slice(0, PREFIX_LEN)}...${originalName.slice(-SUFFIX_LEN)}`;
        }
        return originalName;
    },

    /**
     * Checks if a file's extension is among the allowed types.
     * @param {String} fileName - The name of the file.
     * @returns {boolean} True if the extension is allowed or no extensions are specified, false otherwise.
     */
    _checkExtensionValidity: function(fileName) {
        const allowedTypes = this._configSettings.permittedExtensions;
        if (allowedTypes.length === 0) {
            return true; // No restrictions
        }

        const fileExtension = (fileName.includes('.')) ?
            fileName.split('.').pop().toLowerCase() : '';

        // Using `includes` for a more modern array check (Type III change)
        return allowedTypes.map(ext => ext.toLowerCase()).includes(fileExtension);
    },

    /**
     * Formats a byte size into a human-readable string (e.g., KB, MB).
     * @param {Number} bytes - The size in bytes.
     * @returns {String} Formatted size string.
     */
    _formatByteSize: function(bytes) {
        if (bytes === 0) return '0 B'; // Handle zero bytes explicitly

        const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        let unitIndex = 0;
        let formattedBytes = bytes;

        while (formattedBytes >= 1024 && unitIndex < units.length - 1) {
            formattedBytes /= 1024;
            unitIndex++;
        }

        // Ensure at least one decimal place if not an integer and not bytes
        const precision = (formattedBytes % 1 === 0 || unitIndex === 0) ? 0 : 1;
        return `${formattedBytes.toFixed(precision)} ${units[unitIndex]}`;
    }
};


/**
 * Extends CoreUploader to provide a richer user interface with drag-and-drop
 * functionality and a dynamic file list display.
 * @inherits uploadMagic.CoreUploader
 */
uploadMagic.EnhancedUploader = function(userOptions) {
    // Call the parent constructor
    uploadMagic.CoreUploader.apply(this, arguments);

    // Additional configuration specific to the enhanced uploader
    uploadMagic.mergeOptions(this._configSettings, {
        containerElement: null, // The main DOM element for the uploader widget
        fileListContainer: null, // If set, will be used instead of finding 'um-file-listing' in template

        widgetTemplate: '<div class="um-uploader-container">' +
            '<div class="um-dropzone-area"><span>Drop files here to upload</span></div>' +
            '<div class="um-upload-trigger">Select files</div>' +
            '<ul class="um-file-listing"></ul>' +
            '</div>',

        // Template for each item in the file list
        itemTemplate: '<li class="um-file-item">' +
            '<span class="um-file-name"></span>' +
            '<span class="um-progress-spinner"></span>' +
            '<span class="um-file-size-display"></span>' +
            '<a class="um-cancel-action" href="#">Cancel</a>' +
            '<span class="um-upload-failure-message">Failed</span>' +
            '</li>'
    });

    // Internal DOM element references
    this._domElements = {
        mainContainer: null,
        dropZone: null,
        uploadButton: null,
        fileList: null
    };

    // Initialize the UI components
    this._buildUserInterface();
    this._setupDragAndDrop();
    this._registerDomEvents();
};

// Inherit prototype methods from CoreUploader
uploadMagic.EnhancedUploader.prototype = Object.create(uploadMagic.CoreUploader.prototype);
uploadMagic.EnhancedUploader.prototype.constructor = uploadMagic.EnhancedUploader;

uploadMagic.EnhancedUploader.prototype._buildUserInterface = function() {
    if (!this._configSettings.containerElement) {
        console.error("EnhancedUploader requires a 'containerElement' in its configuration.");
        return;
    }

    // Create the main widget structure from the template
    const mainContainer = uploadMagic.createDomElementFromString(this._configSettings.widgetTemplate);
    if (!mainContainer) {
        console.error("Failed to create uploader UI from widgetTemplate.");
        return;
    }

    // If an existing container is provided, append the new structure to it
    // Otherwise, assume containerElement *is* the main container.
    if (this._configSettings.containerElement.children.length === 0) {
         this._configSettings.containerElement.appendChild(mainContainer);
         this._domElements.mainContainer = mainContainer;
    } else {
        // Assume the provided containerElement itself is the main container
        this._domElements.mainContainer = this._configSettings.containerElement;
        // And we'd expect its content to match the template implicitly or be managed externally
    }


    // Store references to key DOM elements within the widget
    this._domElements.dropZone = this._domElements.mainContainer.querySelector('.um-dropzone-area');
    this._domElements.uploadButton = this._domElements.mainContainer.querySelector('.um-upload-trigger');
    // Use explicit listElement if provided, otherwise find it within the template
    this._domElements.fileList = this._configSettings.fileListContainer || this._domElements.mainContainer.querySelector('.um-file-listing');

    // Re-initialize the trigger button with the new DOM element
    if (this._domElements.uploadButton) {
        this._triggerButton = this._initializeUploadTrigger(this._domElements.uploadButton);
    }
};

uploadMagic.EnhancedUploader.prototype._setupDragAndDrop = function() {
    const self = this;
    const dropZone = this._domElements.dropZone;

    if (!dropZone) {
        if (this._configSettings.enableDebugging) {
            console.warn("No drop zone element found, drag-and-drop will not be enabled.");
        }
        return;
    }

    // Add visual feedback classes
    const activeClass = 'um-drop-active';

    uploadMagic.addEvent(dropZone, 'dragenter', function(event) {
        uploadMagic.stopDefaultAction(event);
        uploadMagic.addCssClass(dropZone, activeClass);
    });

    uploadMagic.addEvent(dropZone, 'dragleave', function(event) {
        uploadMagic.stopDefaultAction(event);
        uploadMagic.removeCssClass(dropZone, activeClass);
    });

    uploadMagic.addEvent(dropZone, 'dragover', function(event) {
        uploadMagic.stopDefaultAction(event);
        uploadMagic.addCssClass(dropZone, activeClass);
    });

    uploadMagic.addEvent(dropZone, 'drop', function(event) {
        uploadMagic.stopDefaultAction(event);
        uploadMagic.removeCssClass(dropZone, activeClass);

        const droppedFiles = event.dataTransfer ? event.dataTransfer.files : null;
        if (droppedFiles && droppedFiles.length > 0) {
            self._initiateBatchUpload(droppedFiles);
        } else {
            if (self._configSettings.enableDebugging) {
                console.warn("No files detected in drop event.");
            }
        }
    });
};

uploadMagic.EnhancedUploader.prototype._registerDomEvents = function() {
    // This method could be extended to register other UI-specific events,
    // e.g., click handlers for cancel buttons on file list items, etc.
    // For now, the main button's event is handled by _initializeUploadTrigger.
    if (this._configSettings.enableDebugging) {
        console.log("EnhancedUploader DOM events registered.");
    }
};

// ... (Rest of the EnhancedUploader functionality, e.g., creating file list items, updating progress on UI)
// The original code snippet only provided the constructor for qq.FileUploader.
// The provided clone stops at the same point, demonstrating Type III changes up to this point.