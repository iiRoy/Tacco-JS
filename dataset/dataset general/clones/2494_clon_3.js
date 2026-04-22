var upldKit = upldKit || {};

//
// Utility functions for DOM and general operations
//

/**
 * Merges properties from a source object into a target object.
 * Existing properties in the target will be overwritten.
 * Only enumerable own properties are considered.
 * @param {object} target - The object to extend.
 * @param {object} source - The object whose properties will be copied.
 */
upldKit.mergeObjects = function(target, source) {
    if (typeof target !== 'object' || target === null) {
        console.warn("upldKit.mergeObjects: Target must be an object.");
        return target;
    }
    if (typeof source !== 'object' || source === null) {
        console.warn("upldKit.mergeObjects: Source is not an object, nothing to merge.");
        return target;
    }

    for (let key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
        }
    }
    return target;
};

/**
 * Locates the first occurrence of an item within an array.
 * @param {Array} collection - The array to search within.
 * @param {*} item - The element to find.
 * @param {Number} [startIndex=0] - The index from which to begin the search.
 * @returns {Number} The index of the item, or -1 if not found.
 */
upldKit.findEntryIndex = function(collection, item, startIndex = 0) {
    // Modern browsers support Array.prototype.indexOf
    if (collection.indexOf) {
        return collection.indexOf(item, startIndex);
    }

    // Fallback for older environments
    let currentIdx = startIndex < 0 ? Math.max(0, collection.length + startIndex) : startIndex;
    const arrayLength = collection.length;

    while (currentIdx < arrayLength) {
        if (Object.prototype.hasOwnProperty.call(collection, currentIdx) && collection[currentIdx] === item) {
            return currentIdx;
        }
        currentIdx++;
    }
    return -1;
};

/**
 * Provides a function that generates unique numeric identifiers.
 * The sequence starts from a predefined initial value.
 */
upldKit.generateUniqueId = (function() {
    let currentSequence = 1000; // Starting ID from a non-zero value
    return function() {
        return `uid_${currentSequence++}`; // Add a prefix for distinction
    };
})();

//
// Event handling utilities
//

/**
 * Attaches an event listener to a DOM element.
 * @param {HTMLElement} targetElement - The element to which the event listener is attached.
 * @param {string} eventType - The type of event (e.g., 'click', 'change').
 * @param {Function} handlerFunc - The function to call when the event occurs.
 */
upldKit.addEvent = function(targetElement, eventType, handlerFunc) {
    if (!targetElement || typeof handlerFunc !== 'function') {
        console.error("upldKit.addEvent: Invalid target element or handler function provided.");
        return;
    }
    try {
        if (targetElement.addEventListener) {
            targetElement.addEventListener(eventType, handlerFunc, {
                capture: false,
                passive: false
            }); // Explicit options
        } else if (targetElement.attachEvent) {
            targetElement.attachEvent('on' + eventType, handlerFunc);
        } else {
            targetElement['on' + eventType] = handlerFunc; // Fallback for very old browsers
        }
    } catch (e) {
        console.error(`Error attaching event ${eventType}:`, e);
    }
};

/**
 * Removes an event listener from a DOM element.
 * @param {HTMLElement} targetElement - The element from which to remove the listener.
 * @param {string} eventType - The type of event.
 * @param {Function} handlerFunc - The function originally attached.
 */
upldKit.removeEvent = function(targetElement, eventType, handlerFunc) {
    if (!targetElement || typeof handlerFunc !== 'function') {
        return;
    }
    try {
        if (targetElement.removeEventListener) {
            targetElement.removeEventListener(eventType, handlerFunc, {
                capture: false
            });
        } else if (targetElement.detachEvent) {
            targetElement.detachEvent('on' + eventType, handlerFunc);
        }
        // No easy way to remove for direct assignment, so skip for very old browsers
    } catch (e) {
        console.error(`Error detaching event ${eventType}:`, e);
    }
};

/**
 * Prevents the default action of an event.
 * @param {Event} eventObject - The event to prevent default on.
 */
upldKit.preventEventDefault = function(eventObject) {
    if (eventObject && typeof eventObject.preventDefault === 'function') {
        eventObject.preventDefault();
    } else if (eventObject) {
        eventObject.returnValue = false; // IE fallback
    }
    return false; // Useful for some event handlers
};

//
// DOM manipulation utilities
//

/**
 * Inserts a new DOM node before a reference node.
 * @param {HTMLElement} newNode - The node to insert.
 * @param {HTMLElement} referenceNode - The node before which to insert.
 */
upldKit.insertChildBefore = function(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode);
    } else {
        console.warn("upldKit.insertChildBefore: Reference node or its parent is missing.");
    }
};

/**
 * Removes a DOM element from its parent.
 * @param {HTMLElement} targetElement - The element to remove.
 */
upldKit.deleteElement = function(targetElement) {
    if (targetElement && targetElement.parentNode) {
        targetElement.parentNode.removeChild(targetElement);
    } else {
        console.warn("upldKit.deleteElement: Element is already detached or does not exist.");
    }
};

/**
 * Checks if a given element is a descendant of another parent element.
 * @param {HTMLElement} ancestorElement - The potential parent.
 * @param {HTMLElement} descendantElement - The potential child.
 * @returns {boolean} True if descendantElement is inside ancestorElement, false otherwise.
 */
upldKit.isDescendantOf = function(ancestorElement, descendantElement) {
    if (ancestorElement === descendantElement) return true;
    if (!ancestorElement || !descendantElement) return false;

    // Use native 'contains' if available
    if (ancestorElement.contains) {
        return ancestorElement.contains(descendantElement);
    }

    // Fallback using compareDocumentPosition for broader browser support
    // Node.DOCUMENT_POSITION_CONTAINS (8)
    return !!(descendantElement.compareDocumentPosition(ancestorElement) & 8);
};

/**
 * Generates an HTMLElement from an HTML string snippet.
 * This utilizes a temporary document fragment for parsing.
 * @param {string} htmlString - The HTML string to convert.
 * @returns {HTMLElement|null} The first parsed element, or null if parsing fails.
 */
upldKit.createElementFromString = (function() {
    // Using Range for more robust HTML parsing than innerHTML on a div
    if (typeof document === 'undefined' || !document.createRange) {
        console.warn("upldKit.createElementFromString: Document or createRange not available. Fallback to div.");
        const tempDiv = document.createElement('div');
        return function(htmlString) {
            tempDiv.innerHTML = htmlString;
            const element = tempDiv.firstElementChild;
            if (element) {
                tempDiv.removeChild(element);
            }
            return element;
        };
    }

    const range = document.createRange();
    // Set context to avoid issues with elements like <td> outside <table>
    range.selectNode(document.body);

    return function(htmlString) {
        if (!htmlString || typeof htmlString !== 'string') {
            return null;
        }
        const fragment = range.createContextualFragment(htmlString.trim());
        if (fragment.childElementCount === 1) {
            return fragment.firstElementChild;
        } else if (fragment.childElementCount > 1) {
            console.warn("upldKit.createElementFromString: HTML string contains multiple root elements. Returning the first one.");
            return fragment.firstElementChild;
        }
        return null;
    };
})();

//
// Element styling and attribute utilities
//

/**
 * Applies a set of CSS styles to an element.
 * Handles IE opacity filter for older versions.
 * @param {HTMLElement} targetElem - The element to style.
 * @param {Object.<string, string|number>} styleProps - An object mapping CSS property names to values.
 */
upldKit.applyStyles = function(targetElem, styleProps) {
    if (!targetElem || !styleProps) {
        return;
    }

    // Handle opacity for older IE versions
    if (styleProps.opacity !== undefined && typeof targetElem.style.opacity !== 'string' && targetElem.filters) {
        const opacityValue = Math.round(parseFloat(styleProps.opacity) * 100);
        targetElem.style.filter = `alpha(opacity=${opacityValue})`;
        delete styleProps.opacity; // Remove from original object to avoid double application
    }

    // Apply other styles
    upldKit.mergeObjects(targetElem.style, styleProps);
};

/**
 * Checks if an element has a specific CSS class.
 * @param {HTMLElement} targetElem - The element to check.
 * @param {string} className - The CSS class name.
 * @returns {boolean} True if the element has the class, false otherwise.
 */
upldKit.hasCssClass = function(targetElem, className) {
    if (!targetElem || !className) return false;
    if (targetElem.classList) {
        return targetElem.classList.contains(className);
    }
    // Fallback for older browsers
    const classRegex = new RegExp(`(?:^|\\s)${className}(?:\\s|$)`);
    return classRegex.test(targetElem.className);
};

/**
 * Adds a CSS class to an element if it doesn't already have it.
 * @param {HTMLElement} targetElem - The element to modify.
 * @param {string} className - The CSS class name to add.
 */
upldKit.addCssClass = function(targetElem, className) {
    if (!targetElem || !className) return;
    if (targetElem.classList) {
        targetElem.classList.add(className);
    } else if (!upldKit.hasCssClass(targetElem, className)) {
        targetElem.className = `${targetElem.className} ${className}`.trim();
    }
};

/**
 * Removes a CSS class from an element.
 * @param {HTMLElement} targetElem - The element to modify.
 * @param {string} className - The CSS class name to remove.
 */
upldKit.removeCssClass = function(targetElem, className) {
    if (!targetElem || !className) return;
    if (targetElem.classList) {
        targetElem.classList.remove(className);
    } else {
        const classRegex = new RegExp(`(?:^|\\s)${className}(?:\\s|$)`, 'g');
        targetElem.className = targetElem.className.replace(classRegex, ' ').trim();
    }
};

/**
 * Sets the text content of an element, supporting both textContent and innerText.
 * @param {HTMLElement} targetElem - The element to update.
 * @param {string} newText - The text string to set.
 */
upldKit.setElementText = function(targetElem, newText) {
    if (!targetElem) {
        console.warn("upldKit.setElementText: Target element is null.");
        return;
    }
    // Prefer textContent for broader browser compatibility and security
    if ('textContent' in targetElem) {
        targetElem.textContent = newText;
    } else if ('innerText' in targetElem) { // IE fallback
        targetElem.innerText = newText;
    }
};

//
// Element selection and traversal utilities
//

/**
 * Retrieves all direct child elements of a given parent element.
 * @param {HTMLElement} parentElem - The parent element.
 * @returns {HTMLElement[]} An array of child elements.
 */
upldKit.getChildElements = function(parentElem) {
    if (!parentElem || parentElem.nodeType !== Node.ELEMENT_NODE) {
        return [];
    }
    // Modern approach using Array.from and element.children
    return Array.from(parentElem.children);
};

/**
 * Finds all descendant elements of a given element that have a specific CSS class.
 * @param {HTMLElement} rootElement - The element to start the search from.
 * @param {string} targetClassName - The CSS class name to search for.
 * @returns {HTMLElement[]} An array of matching elements.
 */
upldKit.getElementsByClassName = function(rootElement, targetClassName) {
    if (!rootElement || !targetClassName) return [];

    // Use querySelectorAll for modern browsers
    if (rootElement.querySelectorAll) {
        return Array.from(rootElement.querySelectorAll(`.${targetClassName}`));
    }

    // Fallback for older browsers: traverse all descendants
    const matchingElements = [];
    const allDescendants = rootElement.getElementsByTagName("*");

    for (let i = 0; i < allDescendants.length; i++) {
        const currentElement = allDescendants[i];
        if (upldKit.hasCssClass(currentElement, targetClassName)) {
            matchingElements.push(currentElement);
        }
    }
    return matchingElements;
};

/**
 * Converts a JavaScript object into a URL-encoded query string.
 * Mimics jQuery.param() behavior for complex objects.
 *
 * Example:
 * `upldKit.objectToQueryString({a:'b', c:'d'}, 'http://example.com/api?other=val');`
 * will yield:
 * `http://example.com/api?other=val&a=b&c=d`
 *
 * @param {object} dataObject - The object to serialize.
 * @param {string} [initialUrl=''] - An optional base URL or existing query string to append to.
 * @param {boolean} [isRecursiveCall=false] - Internal flag for recursive calls.
 * @returns {string} The fully formed query string.
 */
upldKit.objectToQueryString = function(dataObject, initialUrl = '', isRecursiveCall = false) {
    const segments = [];
    const addParam = (key, value) => {
        // Handle functions by calling them, then encoding result
        const processedValue = (typeof value === 'function') ? value() : value;
        segments.push(`${encodeURIComponent(key)}=${encodeURIComponent(processedValue)}`);
    };

    if (!isRecursiveCall && initialUrl) {
        // If it's the initial call and a URL is provided, append it first
        segments.push(initialUrl);
        // Recursively call for the dataObject to generate its part
        segments.push(upldKit.objectToQueryString(dataObject, '', true));
    } else if (Array.isArray(dataObject)) {
        // Process arrays: each item gets an indexed key
        dataObject.forEach((item, index) => {
            const key = initialUrl ? `${initialUrl}[${index}]` : index.toString();
            if (typeof item === 'object' && item !== null) {
                segments.push(upldKit.objectToQueryString(item, key, true));
            } else {
                addParam(key, item);
            }
        });
    } else if (typeof dataObject === 'object' && dataObject !== null) {
        // Process objects: iterate over properties
        for (const prop in dataObject) {
            if (Object.prototype.hasOwnProperty.call(dataObject, prop)) {
                const value = dataObject[prop];
                const key = initialUrl ? `${initialUrl}[${prop}]` : prop;

                if (typeof value === 'object' && value !== null) {
                    segments.push(upldKit.objectToQueryString(value, key, true));
                } else {
                    addParam(key, value);
                }
            }
        }
    } else if (initialUrl) {
        // Handle scalar values when a prefix (initialUrl) is provided
        addParam(initialUrl, dataObject);
    }

    const combinedString = segments.filter(Boolean).join('&'); // Filter empty strings
    return combinedString.replace(/%20/g, '+'); // Replace spaces with '+'
};


//
// Core Uploader Classes
//

var upldKit = upldKit || {}; // Ensure namespace exists

/**
 * CoreFileProcessor: Manages basic file upload logic, validation, and progress tracking.
 * This class handles the backend communication (XHR or form-based) and file validation,
 * but does not include UI elements like file lists or drag-and-drop.
 */
upldKit.CoreFileProcessor = function(setupOptions) {
    // Default configuration for the file processor
    this._configuration = {
        debugMode: false,
        uploadEndpoint: '/api/upload_files',
        extraParams: {},
        uploadButtonElem: null,
        allowMultipleSelection: true,
        maxConcurrentUploads: 3,
        // Validation rules
        permittedFileExtensions: [],
        maxFileSizeLimit: 0, // 0 for unlimited
        minFileSizeLimit: 0, // 0 for unlimited
        // Event callbacks
        onFileQueued: function(jobId, fileName) {},
        onUploadProgress: function(jobId, fileName, uploadedBytes, totalBytes) {},
        onUploadCompleted: function(jobId, fileName, serverResponse) {},
        onUploadCancelled: function(jobId, fileName) {},
        // User-facing messages
        statusMessages: {
            invalidTypeError: "{file} has an unsupported file type. Only {extensions} are permitted.",
            sizeExceededError: "{file} is too large. Max size allowed is {sizeLimit}.",
            sizeBelowMinError: "{file} is too small. Min size required is {minSizeLimit}.",
            emptyFileError: "{file} is empty. Please select a valid file.",
            exitConfirmation: "Active file transfers are in progress. Navigating away will cancel them."
        },
        displayAlert: function(messageText) {
            alert(messageText);
        }
    };
    upldKit.mergeObjects(this._configuration, setupOptions);

    // Internal state variables
    this._activeJobCount = 0;
    this._taskHandler = this._instantiateTransferHandler(); // Handles actual file transfer
    this._triggerButton = null; // Reference to the UI button that initiates uploads

    // If an element for the button is provided, set it up
    if (this._configuration.uploadButtonElem) {
        this._triggerButton = this._setupInitiationButton(this._configuration.uploadButtonElem);
    }

    this._guardAgainstPageExit(); // Prevent accidental page navigation during uploads

    if (this._configuration.debugMode) {
        console.log("CoreFileProcessor initialized with options:", this._configuration);
    }
};

upldKit.CoreFileProcessor.prototype = {
    /**
     * Updates the custom parameters sent with each upload request.
     * @param {object} newParams - An object containing new key-value pairs for parameters.
     */
    updateParameters: function(newParams) {
        this._configuration.extraParams = newParams;
    },

    /**
     * Returns the current number of files actively being uploaded.
     * @returns {number} Count of files in progress.
     */
    getPendingJobsCount: function() {
        return this._activeJobCount;
    },

    /**
     * Creates and configures the UI button for file selection.
     * @param {HTMLElement} buttonElement - The DOM element to transform into an upload button.
     * @returns {upldKit.FileSelectionButton} The created button instance.
     * @private
     */
    _setupInitiationButton: function(buttonElement) {
        const instanceRef = this; // Capture 'this' for the callback scope

        // Assuming upldKit.FileSelectionButton is a separate class
        return new upldKit.FileSelectionButton({
            targetElement: buttonElement,
            allowMultiples: this._configuration.allowMultipleSelection && upldKit.XhrTransferHandler.isSupported(),
            onSelectionChange: function(fileInputElem) {
                instanceRef._processFileInputChange(fileInputElem);
            }
        });
    },

    /**
     * Determines and instantiates the appropriate file transfer handler (XHR or Form).
     * @returns {upldKit.XhrTransferHandler|upldKit.FormTransferHandler} An instance of a transfer handler.
     * @private
     */
    _instantiateTransferHandler: function() {
        const instanceRef = this;
        let HandlerConstructor;

        if (upldKit.XhrTransferHandler && upldKit.XhrTransferHandler.isSupported()) {
            if (this._configuration.debugMode) console.debug("Using XHR for file transfers.");
            HandlerConstructor = upldKit.XhrTransferHandler;
        } else {
            if (this._configuration.debugMode) console.debug("Using Form for file transfers (XHR not supported).");
            HandlerConstructor = upldKit.FormTransferHandler;
        }

        const handlerInstance = new HandlerConstructor({
            debugMode: this._configuration.debugMode,
            uploadUrl: this._configuration.uploadEndpoint,
            maxConnections: this._configuration.maxConcurrentUploads,
            onProgressUpdate: function(jobId, fileName, uploadedBytes, totalBytes) {
                instanceRef._handleJobProgress(jobId, fileName, uploadedBytes, totalBytes);
                instanceRef._configuration.onUploadProgress(jobId, fileName, uploadedBytes, totalBytes);
            },
            onTransferComplete: function(jobId, fileName, serverResponse) {
                instanceRef._handleJobCompletion(jobId, fileName, serverResponse);
                instanceRef._configuration.onUploadCompleted(jobId, fileName, serverResponse);
            },
            onTransferCancelled: function(jobId, fileName) {
                instanceRef._handleJobCancellation(jobId, fileName);
                instanceRef._configuration.onUploadCancelled(jobId, fileName);
            }
        });

        return handlerInstance;
    },

    /**
     * Sets up a 'beforeunload' event listener to warn users about pending uploads.
     * @private
     */
    _guardAgainstPageExit: function() {
        const instanceRef = this;
        upldKit.addEvent(window, 'beforeunload', function(event) {
            if (instanceRef._activeJobCount === 0) {
                return undefined; // No active transfers, allow navigation
            }

            const confirmationMessage = instanceRef._configuration.statusMessages.exitConfirmation;
            // For older browsers
            if (event) {
                event.returnValue = confirmationMessage;
            }
            // For modern browsers
            return confirmationMessage;
        });
    },

    /**
     * Internal handler for when a file upload job is submitted.
     * Increments the active job counter.
     * @param {string} jobId - Unique identifier for the upload job.
     * @param {string} fileName - Name of the file.
     * @private
     */
    _handleJobSubmission: function(jobId, fileName) {
        this._activeJobCount++;
        if (this._configuration.debugMode) {
            console.log(`Job ${jobId} (${fileName}) submitted. Active jobs: ${this._activeJobCount}`);
        }
    },

    /**
     * Internal handler for upload progress updates.
     * Can be overridden by subclasses for custom behavior.
     * @param {string} jobId - Unique identifier for the upload job.
     * @param {string} fileName - Name of the file.
     * @param {number} uploadedBytes - Bytes transferred so far.
     * @param {number} totalBytes - Total bytes of the file.
     * @private
     */
    _handleJobProgress: function(jobId, fileName, uploadedBytes, totalBytes) {
        // Placeholder for internal progress tracking, can be extended by derived classes
    },

    /**
     * Internal handler for upload completion.
     * Decrements active job counter and displays errors if present in the response.
     * @param {string} jobId - Unique identifier for the upload job.
     * @param {string} fileName - Name of the file.
     * @param {object} serverResponse - The JSON response from the server.
     * @private
     */
    _handleJobCompletion: function(jobId, fileName, serverResponse) {
        this._activeJobCount = Math.max(0, this._activeJobCount - 1); // Ensure it doesn't go below zero
        if (this._configuration.debugMode) {
            console.log(`Job ${jobId} (${fileName}) completed. Active jobs: ${this._activeJobCount}`);
        }

        if (serverResponse && serverResponse.error) {
            this._configuration.displayAlert(serverResponse.error);
        }
    },

    /**
     * Internal handler for upload cancellation.
     * Decrements the active job counter.
     * @param {string} jobId - Unique identifier for the upload job.
     * @param {string} fileName - Name of the file.
     * @private
     */
    _handleJobCancellation: function(jobId, fileName) {
        this._activeJobCount = Math.max(0, this._activeJobCount - 1);
        if (this._configuration.debugMode) {
            console.log(`Job ${jobId} (${fileName}) cancelled. Active jobs: ${this._activeJobCount}`);
        }
    },

    /**
     * Processes files selected via a file input element.
     * Differentiates between XHR and form-based uploads.
     * @param {HTMLInputElement} fileInputField - The file input element.
     * @private
     */
    _processFileInputChange: function(fileInputField) {
        if (!fileInputField || (!fileInputField.files && !fileInputField.value)) {
            console.warn("No files selected or invalid input field.");
            this._triggerButton.reset(); // Reset button even if no selection
            return;
        }

        if (this._taskHandler instanceof upldKit.XhrTransferHandler) {
            this._initiateBatchUpload(fileInputField.files);
        } else {
            // For form-based uploads, we typically handle one file input at a time
            if (this._performFileValidation(fileInputField)) {
                this._commenceSingleFileUpload(fileInputField);
            }
        }
        // Always reset the file input to allow re-selection of the same file
        if (this._triggerButton) {
            this._triggerButton.reset();
        }
    },

    /**
     * Initiates the upload process for a list of files (typically from XHR).
     * Validates all files before queuing any for upload.
     * @param {FileList} fileList - A FileList object containing files to upload.
     * @private
     */
    _initiateBatchUpload: function(fileList) {
        const filesToUpload = [];
        let invalidFileCount = 0;

        for (let i = 0; i < fileList.length; i++) {
            const currentFile = fileList[i];
            if (this._performFileValidation(currentFile)) {
                filesToUpload.push(currentFile);
            } else {
                invalidFileCount++;
            }
        }

        if (invalidFileCount > 0) {
            console.warn(`${invalidFileCount} files failed initial validation and will not be uploaded.`);
        }

        filesToUpload.forEach(file => this._commenceSingleFileUpload(file));
    },

    /**
     * Commences the upload of a single file or file input.
     * @param {File|HTMLInputElement} fileSource - The File object or file input element.
     * @private
     */
    _commenceSingleFileUpload: function(fileSource) {
        try {
            const jobId = this._taskHandler.add(fileSource);
            const fileName = this._taskHandler.getName(jobId);

            // Allow the consumer to cancel the upload before it starts
            if (this._configuration.onFileQueued(jobId, fileName) !== false) {
                this._handleJobSubmission(jobId, fileName);
                this._taskHandler.upload(jobId, this._configuration.extraParams);
            } else {
                // If onFileQueued returns false, cancel the job immediately
                this._taskHandler.cancel(jobId);
                if (this._configuration.debugMode) {
                    console.log(`Upload of ${fileName} (Job ID: ${jobId}) cancelled by onFileQueued callback.`);
                }
            }
        } catch (error) {
            console.error("Error adding or uploading file:", error);
            this._configuration.displayAlert(`Failed to prepare file for upload: ${error.message}`);
        }
    },

    /**
     * Performs validation checks on a file (or file input).
     * @param {File|HTMLInputElement} fileEntry - The File object or file input element.
     * @returns {boolean} True if the file is valid, false otherwise.
     * @private
     */
    _performFileValidation: function(fileEntry) {
        let currentFileName, currentFileSize;

        // Determine file name and size based on type (File object vs. input element)
        if (fileEntry instanceof File) {
            currentFileName = fileEntry.name || 'unknown_file';
            currentFileSize = fileEntry.size;
        } else if (fileEntry.value) { // This is likely an HTML input element
            currentFileName = fileEntry.value.replace(/.*(\/|\\)/, ""); // Extract name from path
            // For input elements, file size isn't directly available in older browsers without 'files'
            // For modern browsers, fileEntry.files[0] would be the File object
            if (fileEntry.files && fileEntry.files[0]) {
                currentFileSize = fileEntry.files[0].size;
            } else {
                currentFileSize = undefined; // Cannot determine size for older input elements
            }
        } else {
            this._displayValidationError('emptyFileError', 'N/A');
            return false;
        }

        // --- Validation checks ---
        if (!this._checkAllowedExtension(currentFileName)) {
            this._displayValidationError('invalidTypeError', currentFileName);
            return false;
        }

        if (currentFileSize === 0) {
            this._displayValidationError('emptyFileError', currentFileName);
            return false;
        }

        if (this._configuration.maxFileSizeLimit > 0 && currentFileSize > this._configuration.maxFileSizeLimit) {
            this._displayValidationError('sizeExceededError', currentFileName);
            return false;
        }

        if (this._configuration.minFileSizeLimit > 0 && currentFileSize < this._configuration.minFileSizeLimit) {
            this._displayValidationError('sizeBelowMinError', currentFileName);
            return false;
        }

        return true;
    },

    /**
     * Displays a formatted validation error message to the user.
     * @param {string} errorCode - Key for the error message in `statusMessages`.
     * @param {string} affectedFileName - The name of the file causing the error.
     * @private
     */
    _displayValidationError: function(errorCode, affectedFileName) {
        let messageTemplate = this._configuration.statusMessages[errorCode];
        if (!messageTemplate) {
            console.error(`Unknown error code: ${errorCode}`);
            messageTemplate = "An unknown validation error occurred for {file}.";
        }

        // Replace placeholders in the message template
        let formattedMessage = messageTemplate
            .replace('{file}', this._truncateFileName(affectedFileName))
            .replace('{extensions}', this._configuration.permittedFileExtensions.join(', '))
            .replace('{sizeLimit}', this._formatByteSize(this._configuration.maxFileSizeLimit))
            .replace('{minSizeLimit}', this._formatByteSize(this._configuration.minFileSizeLimit));

        this._configuration.displayAlert(formattedMessage);
    },

    /**
     * Truncates a long file name for display purposes.
     * @param {string} originalName - The full file name.
     * @returns {string} The truncated file name.
     * @private
     */
    _truncateFileName: function(originalName) {
        const maxLength = 30; // Max length for display
        const extensionIndex = originalName.lastIndexOf('.');

        if (originalName.length <= maxLength) {
            return originalName;
        }

        if (extensionIndex > maxLength - 5) { // If extension is near the end, preserve it
            const prefix = originalName.substring(0, maxLength - 5);
            const suffix = originalName.substring(extensionIndex);
            return `${prefix}...${suffix}`;
        } else {
            return `${originalName.substring(0, maxLength - 3)}...`;
        }
    },

    /**
     * Checks if a file's extension is among the allowed types.
     * @param {string} fileName - The name of the file.
     * @returns {boolean} True if the extension is allowed or if no extensions are specified.
     * @private
     */
    _checkAllowedExtension: function(fileName) {
        const allowed = this._configuration.permittedFileExtensions;
        if (allowed.length === 0) {
            return true; // No restrictions
        }

        const fileExtension = (fileName.lastIndexOf('.') !== -1) ?
            fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase() :
            ''; // No extension

        // Convert allowed extensions to a Set for efficient lookup
        const allowedSet = new Set(allowed.map(ext => ext.toLowerCase()));
        return allowedSet.has(fileExtension);
    },

    /**
     * Formats a byte size into a human-readable string (e.g., "1.2 MB").
     * @param {number} bytes - The size in bytes.
     * @returns {string} Formatted size string.
     * @private
     */
    _formatByteSize: function(bytes) {
        if (bytes === 0) return '0 B'; // Handle zero bytes
        if (typeof bytes !== 'number' || bytes < 0) return 'N/A';

        const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024)); // Calculate the unit index
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
    }
};


/**
 * EnhancedFileUploader: Extends CoreFileProcessor to provide a complete UI,
 * including a drop area, upload button, and a dynamic file list.
 * @inherits upldKit.CoreFileProcessor
 */
upldKit.EnhancedFileUploader = function(opts) {
    // Call parent constructor first
    upldKit.CoreFileProcessor.apply(this, arguments);

    // Additional configuration specific to the UI component
    upldKit.mergeObjects(this._configuration, {
        containerElement: null, // The main DOM element for the uploader widget
        fileListContainer: null, // Custom element to use for the file list, if provided
        // HTML templates for the widget structure and individual file items
        widgetTemplate: '<div class="upload-component">' +
            '<div class="upload-drop-zone"><span>Drop your files here to begin upload</span></div>' +
            '<div class="upload-action-button">Select Files</div>' +
            '<ul class="upload-job-list"></ul>' + // Default file list container
            '<div class="upload-status-display" style="display:none;"></div>' + // New status display area
            '</div>',

        fileItemTemplate: '<li class="upload-job-item">' +
            '<span class="job-file-name"></span>' +
            '<span class="job-progress-spinner"></span>' +
            '<span class="job-file-size"></span>' +
            '<a class="job-cancel-action" href="#">Cancel</a>' +
            '<span class="job-status-text"></span>' +
            '</li>',
        // New: CSS classes for various states
        cssClasses: {
            dropAreaHover: 'is-drag-over',
            uploading: 'is-uploading',
            success: 'upload-success',
            failed: 'upload-failed',
            canceled: 'upload-canceled',
            paused: 'upload-paused' // Added for potential future features
        }
    });

    if (!this._configuration.containerElement) {
        console.error("EnhancedFileUploader: 'containerElement' option is required.");
        return;
    }

    this._uiElements = {}; // Stores references to key UI DOM elements
    this._jobDomMap = {}; // Maps jobId to its corresponding LI element

    this._initializeUserInterface();
    this._setupDropZone();
};

// Inherit prototype methods
upldKit.EnhancedFileUploader.prototype = Object.create(upldKit.CoreFileProcessor.prototype);
upldKit.EnhancedFileUploader.prototype.constructor = upldKit.EnhancedFileUploader;

// Override and add UI-specific methods
upldKit.mergeObjects(upldKit.EnhancedFileUploader.prototype, {
    /**
     * Initializes the main UI components by rendering the template and finding key elements.
     * @private
     */
    _initializeUserInterface: function() {
        const container = this._configuration.containerElement;
        const widgetRoot = upldKit.createElementFromString(this._configuration.widgetTemplate);
        if (!widgetRoot) {
            console.error("Failed to create widget root from template.");
            return;
        }

        container.appendChild(widgetRoot);
        this._uiElements.root = widgetRoot;
        this._uiElements.dropArea = upldKit.getElementsByClassName(widgetRoot, 'upload-drop-zone')[0];
        this._uiElements.uploadButton = upldKit.getElementsByClassName(widgetRoot, 'upload-action-button')[0];
        this._uiElements.fileList = this._configuration.fileListContainer || upldKit.getElementsByClassName(widgetRoot, 'upload-job-list')[0];
        this._uiElements.statusDisplay = upldKit.getElementsByClassName(widgetRoot, 'upload-status-display')[0];

        // Update the basic uploader's button element to our new UI button
        this._configuration.uploadButtonElem = this._uiElements.uploadButton;
        this._triggerButton = this._setupInitiationButton(this._uiElements.uploadButton); // Re-initialize button with new element
    },

    /**
     * Sets up drag-and-drop functionality for the designated drop zone.
     * @private
     */
    _setupDropZone: function() {
        const dropZone = this._uiElements.dropArea;
        if (!dropZone) {
            console.warn("No drop zone element found in the template.");
            return;
        }
        const self = this;

        upldKit.addEvent(dropZone, 'dragenter', upldKit.preventEventDefault);
        upldKit.addEvent(dropZone, 'dragleave', function(e) {
            upldKit.removeCssClass(dropZone, self._configuration.cssClasses.dropAreaHover);
            upldKit.preventEventDefault(e);
        });
        upldKit.addEvent(dropZone, 'dragover', function(e) {
            upldKit.addCssClass(dropZone, self._configuration.cssClasses.dropAreaHover);
            upldKit.preventEventDefault(e);
        });
        upldKit.addEvent(dropZone, 'drop', function(e) {
            upldKit.removeCssClass(dropZone, self._configuration.cssClasses.dropAreaHover);
            upldKit.preventEventDefault(e);
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                self._initiateBatchUpload(files);
            }
        });
    },

    /**
     * Overrides parent's `_handleJobSubmission` to add file item to the UI list.
     * @param {string} jobId - Unique identifier for the upload job.
     * @param {string} fileName - Name of the file.
     * @private
     */
    _handleJobSubmission: function(jobId, fileName) {
        upldKit.CoreFileProcessor.prototype._handleJobSubmission.apply(this, arguments);
        this._addFileItemToUI(jobId, fileName);
    },

    /**
     * Adds a new file entry to the UI list, preparing it for progress updates.
     * @param {string} jobId - Unique identifier for the upload job.
     * @param {string} fileName - Name of the file.
     * @private
     */
    _addFileItemToUI: function(jobId, fileName) {
        const fileItem = upldKit.createElementFromString(this._configuration.fileItemTemplate);
        if (!fileItem) {
            console.error("Failed to create file item from template for file:", fileName);
            return;
        }

        const fileNameSpan = upldKit.getElementsByClassName(fileItem, 'job-file-name')[0];
        const fileSizeSpan = upldKit.getElementsByClassName(fileItem, 'job-file-size')[0];
        const spinner = upldKit.getElementsByClassName(fileItem, 'job-progress-spinner')[0];
        const cancelLink = upldKit.getElementsByClassName(fileItem, 'job-cancel-action')[0];
        const statusText = upldKit.getElementsByClassName(fileItem, 'job-status-text')[0];

        upldKit.setElementText(fileNameSpan, this._truncateFileName(fileName));
        upldKit.addCssClass(fileItem, this._configuration.cssClasses.uploading); // Mark as uploading

        // Store references for later updates
        this._jobDomMap[jobId] = {
            element: fileItem,
            fileNameSpan: fileNameSpan,
            fileSizeSpan: fileSizeSpan,
            spinner: spinner,
            cancelLink: cancelLink,
            statusText: statusText
        };

        // Attach cancel event listener
        upldKit.addEvent(cancelLink, 'click', e => {
            upldKit.preventEventDefault(e);
            this._taskHandler.cancel(jobId);
        });

        this._uiElements.fileList.appendChild(fileItem);
    },

    /**
     * Overrides parent's `_handleJobProgress` to update the UI with progress.
     * @param {string} jobId - Unique identifier for the upload job.
     * @param {string} fileName - Name of the file.
     * @param {number} uploadedBytes - Bytes transferred so far.
     * @param {number} totalBytes - Total bytes of the file.
     * @private
     */
    _handleJobProgress: function(jobId, fileName, uploadedBytes, totalBytes) {
        upldKit.CoreFileProcessor.prototype._handleJobProgress.apply(this, arguments);
        const item = this._jobDomMap[jobId];
        if (item && item.fileSizeSpan) {
            const percentage = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;
            upldKit.setElementText(item.fileSizeSpan, `${this._formatByteSize(uploadedBytes)} / ${this._formatByteSize(totalBytes)} (${percentage}%)`);
            // Optionally update a visual progress bar here
        }
    },

    /**
     * Overrides parent's `_handleJobCompletion` to update the UI status.
     * @param {string} jobId - Unique identifier for the upload job.
     * @param {string} fileName - Name of the file.
     * @param {object} serverResponse - The JSON response from the server.
     * @private
     */
    _handleJobCompletion: function(jobId, fileName, serverResponse) {
        upldKit.CoreFileProcessor.prototype._handleJobCompletion.apply(this, arguments);
        const item = this._jobDomMap[jobId];
        if (item && item.element) {
            upldKit.removeCssClass(item.element, this._configuration.cssClasses.uploading);
            upldKit.deleteElement(item.spinner); // Remove spinner on completion
            upldKit.deleteElement(item.cancelLink); // Remove cancel button

            if (serverResponse && serverResponse.success) {
                upldKit.addCssClass(item.element, this._configuration.cssClasses.success);
                upldKit.setElementText(item.statusText, 'Upload successful');
            } else {
                upldKit.addCssClass(item.element, this._configuration.cssClasses.failed);
                upldKit.setElementText(item.statusText, serverResponse.error || 'Upload failed');
            }
        }
        delete this._jobDomMap[jobId]; // Clean up map entry
    },

    /**
     * Overrides parent's `_handleJobCancellation` to update the UI status.
     * @param {string} jobId - Unique identifier for the upload job.
     * @param {string} fileName - Name of the file.
     * @private
     */
    _handleJobCancellation: function(jobId, fileName) {
        upldKit.CoreFileProcessor.prototype._handleJobCancellation.apply(this, arguments);
        const item = this._jobDomMap[jobId];
        if (item && item.element) {
            upldKit.removeCssClass(item.element, this._configuration.cssClasses.uploading);
            upldKit.addCssClass(item.element, this._configuration.cssClasses.canceled);
            upldKit.deleteElement(item.spinner);
            upldKit.deleteElement(item.cancelLink);
            upldKit.setElementText(item.statusText, 'Cancelled');
        }
        delete this._jobDomMap[jobId]; // Clean up map entry
    }
});


// Placeholder for upldKit.FileSelectionButton, upldKit.XhrTransferHandler, upldKit.FormTransferHandler
// These would be separate classes implementing the necessary logic for their respective roles.
// For this clone, I'll provide minimal definitions to satisfy the structure.

upldKit.FileSelectionButton = function(config) {
    this._config = upldKit.mergeObjects({
        targetElement: null,
        allowMultiples: true,
        onSelectionChange: function(input) {}
    }, config);

    this._inputElement = null; // The hidden file input
    this._createInput();
    this._attachEvents();
};

upldKit.FileSelectionButton.prototype = {
    _createInput: function() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('name', 'file');
        if (this._config.allowMultiples) {
            input.setAttribute('multiple', 'multiple');
        }
        // Basic styling to hide but keep functional
        input.style.cssText = 'position:absolute; right:0; top:0; font-family:arial; font-size:118px; margin:0; padding:0; cursor:pointer; opacity:0; filter:alpha(opacity=0); z-index:2;';

        this._config.targetElement.style.position = this._config.targetElement.style.position || 'relative';
        this._config.targetElement.style.overflow = 'hidden';
        this._config.targetElement.appendChild(input);
        this._inputElement = input;
    },
    _attachEvents: function() {
        upldKit.addEvent(this._inputElement, 'change', e => {
            this._config.onSelectionChange(this._inputElement);
        });
    },
    reset: function() {
        if (this._inputElement) {
            // Recreate input element to clear its selected files
            upldKit.deleteElement(this._inputElement);
            this._createInput();
            this._attachEvents();
        }
    }
};

upldKit.XhrTransferHandler = function(config) {
    this._config = upldKit.mergeObjects({
        debugMode: false,
        uploadUrl: '',
        maxConnections: 3,
        onProgressUpdate: function() {},
        onTransferComplete: function() {},
        onTransferCancelled: function() {}
    }, config);
    this._jobs = {}; // Store {file, xhr, params} for each job
    this._queue = []; // Array of job IDs waiting to be processed
    this._activeConnections = 0;
};

upldKit.XhrTransferHandler.isSupported = function() {
    // Check for FileReader and XMLHttpRequest Level 2 support
    return !!(window.File && window.FileList && window.Blob && window.FileReader && window.FormData && (new XMLHttpRequest()).upload);
};

upldKit.XhrTransferHandler.prototype = {
    add: function(file) {
        const jobId = upldKit.generateUniqueId();
        this._jobs[jobId] = {
            file: file,
            fileName: file.name || file.fileName || 'unknown_file',
            xhr: null,
            params: null,
            status: 'queued' // 'queued', 'uploading', 'completed', 'cancelled'
        };
        this._queue.push(jobId);
        if (this._config.debugMode) console.log(`XHR: Job ${jobId} (${this._jobs[jobId].fileName}) added to queue.`);
        this._processQueue();
        return jobId;
    },
    getName: function(jobId) {
        return this._jobs[jobId] ? this._jobs[jobId].fileName : null;
    },
    upload: function(jobId, params) {
        if (this._jobs[jobId]) {
            this._jobs[jobId].params = params;
            this._processQueue(); // Try to upload immediately if a slot is free
        }
    },
    cancel: function(jobId) {
        const job = this._jobs[jobId];
        if (job) {
            if (job.xhr && job.xhr.readyState !== XMLHttpRequest.DONE) {
                job.xhr.abort();
                if (this._config.debugMode) console.log(`XHR: Job ${jobId} aborted.`);
            } else {
                // If not yet started or already done, just remove from queue/jobs
                const queueIndex = upldKit.findEntryIndex(this._queue, jobId);
                if (queueIndex !== -1) {
                    this._queue.splice(queueIndex, 1);
                    if (this._config.debugMode) console.log(`XHR: Job ${jobId} removed from queue.`);
                }
            }
            if (job.status !== 'cancelled') { // Prevent double-triggering
                job.status = 'cancelled';
                this._config.onTransferCancelled(jobId, job.fileName);
            }
            // Decrement active connections if it was uploading
            if (job.status === 'uploading') {
                this._activeConnections--;
            }
            delete this._jobs[jobId]; // Clean up
            this._processQueue();
        }
    },
    _processQueue: function() {
        while (this._activeConnections < this._config.maxConnections && this._queue.length > 0) {
            const jobId = this._queue.shift(); // Get next job from queue
            if (this._jobs[jobId] && this._jobs[jobId].status !== 'cancelled') { // Ensure job wasn't cancelled while in queue
                this._startUpload(jobId);
            } else if (this._jobs[jobId]) { // If it was cancelled, just clean up
                delete this._jobs[jobId];
            }
        }
    },
    _startUpload: function(jobId) {
        const job = this._jobs[jobId];
        if (!job || !job.file || !job.params) {
            console.error(`XHR: Cannot start upload for job ${jobId}. Missing file or params.`);
            return;
        }

        this._activeConnections++;
        job.status = 'uploading';

        const xhr = new XMLHttpRequest();
        job.xhr = xhr;

        const formData = new FormData();
        formData.append('file', job.file, job.fileName); // Append the actual file
        for (const key in job.params) {
            if (Object.prototype.hasOwnProperty.call(job.params, key)) {
                formData.append(key, job.params[key]);
            }
        }

        upldKit.addEvent(xhr.upload, 'progress', e => {
            if (e.lengthComputable) {
                this._config.onProgressUpdate(jobId, job.fileName, e.loaded, e.total);
            }
        });

        upldKit.addEvent(xhr, 'load', () => {
            this._activeConnections--;
            job.status = 'completed';
            let response = {};
            try {
                response = JSON.parse(xhr.responseText);
            } catch (e) {
                console.warn(`XHR: Could not parse response for job ${jobId}: ${xhr.responseText}`, e);
                response = {
                    success: false,
                    error: 'Server response invalid.'
                };
            }
            this._config.onTransferComplete(jobId, job.fileName, response);
            delete this._jobs[jobId];
            this._processQueue();
        });

        upldKit.addEvent(xhr, 'error', () => {
            this._activeConnections--;
            job.status = 'failed';
            this._config.onTransferComplete(jobId, job.fileName, {
                success: false,
                error: 'Network error or server unreachable.'
            });
            delete this._jobs[jobId];
            this._processQueue();
        });

        upldKit.addEvent(xhr, 'abort', () => {
            this._activeConnections--;
            job.status = 'cancelled';
            this._config.onTransferCancelled(jobId, job.fileName);
            delete this._jobs[jobId];
            this._processQueue();
        });

        xhr.open('POST', this._config.uploadUrl, true);
        xhr.send(formData);
        if (this._config.debugMode) console.log(`XHR: Started upload for job ${jobId} (${job.fileName}).`);
    }
};

upldKit.FormTransferHandler = function(config) {
    this._config = upldKit.mergeObjects({
        debugMode: false,
        uploadUrl: '',
        onProgressUpdate: function() {}, // Not really supported by Forms
        onTransferComplete: function() {},
        onTransferCancelled: function() {}
    }, config);
    this._jobs = {}; // Store {fileInput, iframe} for each job
    this._lastJobId = null; // Only one job at a time for form uploads
};

upldKit.FormTransferHandler.isSupported = function() {
    return true; // Form uploads are always a fallback
};

upldKit.FormTransferHandler.prototype = {
    add: function(fileInput) {
        const jobId = upldKit.generateUniqueId();
        this._jobs[jobId] = {
            fileInput: fileInput,
            fileName: fileInput.value.replace(/.*(\/|\\)/, ""),
            iframe: null,
            status: 'queued'
        };
        this._lastJobId = jobId; // Keep track of the current/last job
        if (this._config.debugMode) console.log(`Form: Job ${jobId} (${this._jobs[jobId].fileName}) added.`);
        return jobId;
    },
    getName: function(jobId) {
        return this._jobs[jobId] ? this._jobs[jobId].fileName : null;
    },
    upload: function(jobId, params) {
        const job = this._jobs[jobId];
        if (!job || job.status !== 'queued') {
            console.warn(`Form: Job ${jobId} is not in a 'queued' state for upload.`);
            return;
        }
        job.status = 'uploading';

        const iframe = this._createIframe();
        job.iframe = iframe;

        const form = this._createForm(jobId, job.fileInput, params);
        document.body.appendChild(form); // Temporarily append form to submit
        form.appendChild(job.fileInput); // Move the actual file input into the form

        upldKit.addEvent(iframe, 'load', () => {
            this._handleIframeLoad(jobId);
        });

        form.submit();
        upldKit.deleteElement(form); // Remove form as it's submitted
        if (this._config.debugMode) console.log(`Form: Started upload for job ${jobId} (${job.fileName}).`);
    },
    cancel: function(jobId) {
        const job = this._jobs[jobId];
        if (job) {
            if (job.iframe) {
                // Cancelling form upload is tricky, often involves removing iframe
                upldKit.deleteElement(job.iframe);
            }
            if (job.status !== 'cancelled') {
                job.status = 'cancelled';
                this._config.onTransferCancelled(jobId, job.fileName);
            }
            delete this._jobs[jobId];
        }
    },
    _createIframe: function() {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none'; // Keep it hidden
        iframe.src = 'javascript:false;'; // Prevent initial navigation
        iframe.id = `upldKit_iframe_${upldKit.generateUniqueId()}`; // Unique ID
        iframe.name = iframe.id; // Name for form target
        document.body.appendChild(iframe); // Append to body to be part of DOM
        return iframe;
    },
    _createForm: function(jobId, fileInput, params) {
        const form = document.createElement('form');
        form.action = this._config.uploadUrl;
        form.method = 'POST';
        form.target = this._jobs[jobId].iframe.name; // Target the hidden iframe
        form.enctype = 'multipart/form-data';
        form.style.display = 'none';

        // Add extra parameters as hidden inputs
        for (const key in params) {
            if (Object.prototype.hasOwnProperty.call(params, key)) {
                const hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = key;
                hiddenField.value = params[key];
                form.appendChild(hiddenField);
            }
        }
        return form;
    },
    _handleIframeLoad: function(jobId) {
        const job = this._jobs[jobId];
        if (!job || job.status === 'cancelled') {
            upldKit.deleteElement(job.iframe); // Clean up iframe if job was cancelled
            return;
        }

        let response = {};
        try {
            // Get response from iframe, might be tricky due to cross-origin policies
            const iframeDoc = job.iframe.contentDocument || job.iframe.contentWindow.document;
            const responseText = iframeDoc.body ? iframeDoc.body.innerText : '';
            response = JSON.parse(responseText);
        } catch (e) {
            console.warn(`Form: Could not parse iframe response for job ${jobId}:`, e);
            response = {
                success: false,
                error: 'Server response invalid or inaccessible.'
            };
        }

        job.status = 'completed';
        this._config.onTransferComplete(jobId, job.fileName, response);
        upldKit.deleteElement(job.iframe); // Clean up iframe
        delete this._jobs[jobId];
    }
};