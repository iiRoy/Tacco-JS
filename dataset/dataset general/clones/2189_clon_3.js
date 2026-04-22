/**
 * code-kit.js
 * 
 * A versatile file handling toolkit with upload capabilities, including progress feedback and intuitive drag-and-drop.
 * Original concept by Andrew Valums ( andrew(at)valums.com )
 * 
 * Licensed under the permissive MIT license or Apache License 2.0.
 */    

//
// Core utility functions for various tasks
//

var utilityKit = utilityKit || {};

/**
 * Merges properties from a source object into a target object.
 * Existing properties in the target will be overwritten.
 * @param {object} targetObject - The object to extend.
 * @param {object} sourceObject - The object containing properties to add.
 * @returns {object} The modified target object.
 */ 
utilityKit.mergeProps = function(targetObject, sourceObject){
    if (!targetObject || typeof targetObject !== 'object' || !sourceObject || typeof sourceObject !== 'object') {
        // Guard clause for invalid inputs
        console.warn("utilityKit.mergeProps received invalid arguments.");
        return targetObject || {};
    }
    for (let key in sourceObject){
        if (Object.prototype.hasOwnProperty.call(sourceObject, key)) {
            targetObject[key] = sourceObject[key];
        }
    }
    return targetObject;
};  

/**
 * Locates the first occurrence of an item within an array, returning its index.
 * Returns -1 if the item is not found.
 * @param {Array} collection - The array to search within.
 * @param {*} searchItem - The element to find.
 * @param {Number} [startIndex=0] - The array index to begin the search from.
 * @returns {Number} The index of the found element, or -1.
 */
utilityKit.findElemIndex = function(collection, searchItem, startIndex){
    if (!Array.isArray(collection)) {
        return -1; // Added guard clause for non-array input
    }
    
    if (collection.indexOf) {
        return collection.indexOf(searchItem, startIndex);
    }
    
    let currentIdx = startIndex || 0;
    const arrayLength = collection.length;    
    
    if (currentIdx < 0) {
        currentIdx += arrayLength;
    }  

    while (currentIdx < arrayLength) {  
        if (Object.prototype.hasOwnProperty.call(collection, currentIdx) && collection[currentIdx] === searchItem){  
            return currentIdx;
        }
        currentIdx++;
    }  
    return -1;  
}; 
    
/**
 * Provides a simple, incrementing unique ID for client-side use.
 */
utilityKit.generateUniqueId = (function(){
    let identifierCounter = 0; // Renamed 'id' to 'identifierCounter'
    return function(){ 
        return identifierCounter++; 
    };
})();

//
// Event binding and manipulation
//

/**
 * Attaches an event listener to a DOM element.
 * @param {Element} domElement - The target DOM element.
 * @param {string} eventName - The name of the event (e.g., 'click', 'load').
 * @param {Function} handlerFunction - The function to execute when the event occurs.
 */
utilityKit.addListener = function(domElement, eventName, handlerFunction){
    if (!domElement || !eventName || !handlerFunction) return; // Added guard clause
    
    if (domElement.addEventListener){
        domElement.addEventListener(eventName, handlerFunction, false);
    } else if (domElement.attachEvent){
        domElement.attachEvent('on' + eventName, handlerFunction);
    }
};

/**
 * Removes an event listener from a DOM element.
 * @param {Element} domElement - The target DOM element.
 * @param {string} eventName - The name of the event.
 * @param {Function} handlerFunction - The function that was previously attached.
 */
utilityKit.removeListener = function(domElement, eventName, handlerFunction){
    if (!domElement || !eventName || !handlerFunction) return; // Added guard clause
    
    if (domElement.removeEventListener){
        domElement.removeEventListener(eventName, handlerFunction, false);
    } else if (domElement.detachEvent){
        domElement.detachEvent('on' + eventName, handlerFunction);
    }
};

/**
 * Prevents the default action of an event.
 * @param {Event} eventObject - The event object.
 */
utilityKit.haltEvent = function(eventObject){
    if (!eventObject) return; // Added guard clause
    
    if (eventObject.preventDefault){
        eventObject.preventDefault();
    } else {
        eventObject.returnValue = false;
    }
};

//
// DOM Node operations
//

/**
 * Inserts a new node before a reference node.
 * @param {Element} newNode - The node to insert.
 * @param {Element} referenceNode - The node before which to insert the new node.
 */
utilityKit.insertNodeBefore = function(newNode, referenceNode){
    if (newNode && referenceNode && referenceNode.parentNode) { // Added guard clause
        referenceNode.parentNode.insertBefore(newNode, referenceNode);
    }
};

/**
 * Removes a specified DOM element from its parent.
 * @param {Element} targetNode - The element to remove.
 */
utilityKit.destroyNode = function(targetNode){
    if (targetNode && targetNode.parentNode){ // Added guard clause
        targetNode.parentNode.removeChild(targetNode);
    }
};

/**
 * Checks if a parent element contains a given descendant element.
 * @param {Element} ancestorNode - The potential parent element.
 * @param {Element} childNode - The potential descendant element.
 * @returns {boolean} True if ancestorNode contains childNode, false otherwise.
 */
utilityKit.isAncestorOf = function(ancestorNode, childNode){       
    // Direct comparison for same node
    if (ancestorNode === childNode) return true;
    
    // Modern browser check
    if (ancestorNode.contains){
        return ancestorNode.contains(childNode);
    } else {
        // Fallback for older browsers using compareDocumentPosition
        // Node.DOCUMENT_POSITION_CONTAINS = 8
        const position = childNode.compareDocumentPosition(ancestorNode);
        return (position & Node.DOCUMENT_POSITION_CONTAINS) !== 0;
    }
};

/**
 * Converts an HTML string into a live DOM element.
 * This method leverages innerHTML for quick element creation.
 * @param {string} htmlString - The HTML markup as a string.
 * @returns {Element|null} The created DOM element, or null if input is invalid.
 */
utilityKit.createElementFromString = (function(){
    const temporaryDiv = document.createElement('div'); // Renamed 'div' to 'temporaryDiv'
    return function(htmlString){
        if (typeof htmlString !== 'string' || !htmlString.trim()) {
            console.warn("utilityKit.createElementFromString expects a non-empty string.");
            return null;
        }
        temporaryDiv.innerHTML = htmlString;
        const generatedElement = temporaryDiv.firstChild; // Renamed 'element'
        if (generatedElement) {
            temporaryDiv.removeChild(generatedElement);
        }
        return generatedElement;
    };
})();

//
// Element styling and attributes
//

/**
 * Applies a set of CSS styles to an element.
 * Includes a fix for opacity in older IE versions.
 * @param {Element} targetElement - The DOM element to style.
 * @param {object} styleProperties - An object where keys are CSS property names and values are their desired values.
 */
utilityKit.applyStyles = function(targetElement, styleProperties){
    if (!targetElement || !styleProperties || typeof styleProperties !== 'object') {
        return; // Guard clause
    }

    if (styleProperties.opacity != null){
        // Check for IE-specific filter property for opacity
        const isLegacyIE = typeof targetElement.style.opacity !== 'string' && typeof(targetElement.filters) !== 'undefined';
        if (isLegacyIE){
            styleProperties.filter = 'alpha(opacity=' + Math.round(100 * styleProperties.opacity) + ')';
        }
    }
    utilityKit.mergeProps(targetElement.style, styleProperties); // Using the renamed extend function
};

/**
 * Checks if a DOM element has a specific CSS class.
 * @param {Element} targetElement - The element to check.
 * @param {string} classNameToFind - The name of the class to look for.
 * @returns {boolean} True if the element has the class, false otherwise.
 */
utilityKit.checkClass = function(targetElement, classNameToFind){
    if (!targetElement || !classNameToFind) return false;
    const classRegex = new RegExp('(^|\\s)' + classNameToFind + '(\\s|$)'); // Renamed 're'
    return classRegex.test(targetElement.className);
};

/**
 * Adds a CSS class to a DOM element if it doesn't already have it.
 * @param {Element} targetElement - The element to modify.
 * @param {string} classToAdd - The name of the class to add.
 */
utilityKit.addCssClass = function(targetElement, classToAdd){
    if (!targetElement || !classToAdd) return;
    if (!utilityKit.checkClass(targetElement, classToAdd)){ // Using the renamed hasClass function
        targetElement.className += ' ' + classToAdd;
    }
};

/**
 * Removes a CSS class from a DOM element.
 * @param {Element} targetElement - The element to modify.
 * @param {string} classToRemove - The name of the class to remove.
 */
utilityKit.removeCssClass = function(targetElement, classToRemove){
    if (!targetElement || !classToRemove) return;
    const classRemovalRegex = new RegExp('(^|\\s)' + classToRemove + '(\\s|$)', 'g'); // Renamed 're', added 'g' flag
    let newClassName = targetElement.className.replace(classRemovalRegex, ' ').trim(); // Use trim() to handle leading/trailing spaces
    targetElement.className = newClassName;
};

/**
 * Sets the text content of a DOM element, handling cross-browser differences.
 * @param {Element} targetElement - The element to update.
 * @param {string} newTextContent - The text string to set.
 */
utilityKit.updateTextContent = function(targetElement, newTextContent){
    if (!targetElement) return;
    // Prefer textContent for wider browser support
    if (targetElement.textContent !== undefined) {
        targetElement.textContent = newTextContent;
    } else if (targetElement.innerText !== undefined) {
        // Fallback for older IE
        targetElement.innerText = newTextContent;
    }
};

//
// Querying DOM elements
//

/**
 * Retrieves an array of direct child elements (nodeType 1) of a given element.
 * @param {Element} parentElement - The element whose children are to be retrieved.
 * @returns {Array<Element>} An array of child elements.
 */
utilityKit.getChildElements = function(parentElement){
    const childElements = []; // Renamed 'children'
    let currentChild = parentElement.firstChild; // Renamed 'child'

    while (currentChild){
        if (currentChild.nodeType === Node.ELEMENT_NODE){ // Using Node.ELEMENT_NODE constant
            childElements.push(currentChild);
        }
        currentChild = currentChild.nextSibling;
    }

    return childElements;
};

/**
 * Finds elements within a given root element that have a specific CSS class.
 * Uses querySelectorAll if available, falls back to a manual search.
 * @param {Element} rootElement - The element to start the search from.
 * @param {string} searchClassName - The CSS class name to find.
 * @returns {Array<Element>} An array of matching elements.
 */
utilityKit.findElementsByClassName = function(rootElement, searchClassName){
    if (!rootElement || !searchClassName) return [];
    
    if (rootElement.querySelectorAll){
        return Array.prototype.slice.call(rootElement.querySelectorAll('.' + searchClassName)); // Convert NodeList to Array
    }

    const foundElements = []; // Renamed 'result'
    const potentialCandidates = rootElement.getElementsByTagName("*"); // Renamed 'candidates'
    const totalCandidates = potentialCandidates.length; // Renamed 'len'

    for (let currentIdx = 0; currentIdx < totalCandidates; currentIdx++){
        if (utilityKit.checkClass(potentialCandidates[currentIdx], searchClassName)){ // Using renamed hasClass
            foundElements.push(potentialCandidates[currentIdx]);
        }
    }
    return foundElements;
};

/**
 * Converts a JavaScript object into a URL-encoded query string.
 * This function mimics the behavior of jQuery.param().
 * 
 * Example usage:
 * `utilityKit.serializeToQueryString({a:'b',c:'d'},'http://example.com/api?param=value');`
 * results in:
 * `http://example.com/api?param=value&a=b&c=d`
 *
 * @param  {Object} dataObject - The JSON-like object to serialize.
 * @param  {String} [baseUrl] - An optional base URL to append the query string to.
 * @param  {Boolean} [isRecursiveCall=false] - Internal flag for recursive calls.
 * @return {String} The URL-encoded query string.
 */
utilityKit.serializeToQueryString = function(dataObject, baseUrl, isRecursiveCall){
    const queryParts = []; // Renamed 'uristrings'
    let separator = '&'; // Renamed 'prefix'
    
    const appendParam = function(valueObj, keyName){ // Renamed 'add'
        const currentKeyPath = baseUrl 
            ? ( /\[\]$/.test(baseUrl) // Check for array-like keys
               ? baseUrl
               : baseUrl + '[' + keyName + ']')
            : keyName;
            
        // Ensure key and value are defined before processing
        if (currentKeyPath !== 'undefined' && keyName !== 'undefined') {  
            let encodedValue;
            if (typeof valueObj === 'object' && valueObj !== null) {
                encodedValue = utilityKit.serializeToQueryString(valueObj, currentKeyPath, true);
            } else if (typeof valueObj === 'function') {
                encodedValue = encodeURIComponent(currentKeyPath) + '=' + encodeURIComponent(valueObj());
            } else {
                encodedValue = encodeURIComponent(currentKeyPath) + '=' + encodeURIComponent(valueObj);
            }
            queryParts.push(encodedValue);
        }
    }; 

    if (!isRecursiveCall && baseUrl) {
      // Determine initial separator based on baseUrl presence of '?'
      separator = (/\?/.test(baseUrl)) ? (/\?$/.test(baseUrl) ? '' : '&') : '?';
      queryParts.push(baseUrl);
      // Recursively call for the dataObject after the base URL
      queryParts.push(utilityKit.serializeToQueryString(dataObject));
    } else if (Array.isArray(dataObject)) { // Using Array.isArray for robustness
        // Handle arrays
        for (let i = 0, len = dataObject.length; i < len; ++i){
            appendParam(dataObject[i], i);
        }
    } else if (dataObject !== null && typeof dataObject === "object"){
        // Handle objects (non-scalar, non-array)
        for (let key in dataObject){
            if (Object.prototype.hasOwnProperty.call(dataObject, key)) { // Added hasOwnProperty check
                appendParam(dataObject[key], key);
            }
        }
    } else {
        // Handle scalar values
        if (baseUrl && dataObject !== undefined) { // Ensure baseUrl exists for scalar types
            queryParts.push(encodeURIComponent(baseUrl) + '=' + encodeURIComponent(dataObject));
        } else if (baseUrl) { // If dataObject is undefined but baseUrl is key
            queryParts.push(encodeURIComponent(baseUrl) + '=');
        }
    }

    return queryParts.join(separator)
                     .replace(/^&/, '') // Clean up leading '&'
                     .replace(/%20/g, '+'); // Replace encoded spaces with '+'
};

//
//
// Uploader Modules
//
//

var utilityKit = utilityKit || {};
    
/**
 * Core module for basic file upload functionality.
 * Handles file selection, validation, and submission without UI elements like file lists or drag-and-drop zones.
 * @class utilityKit.BaseFileUploadManager
 * @param {object} initialConfig - Configuration options for the uploader.
 */
utilityKit.BaseFileUploadManager = function(initialConfig){
    this._settings = { // Renamed _options to _settings
        // Enable verbose logging in the console
        debugMode: false, // Renamed 'debug'
        uploadEndpoint: '/server/upload', // Renamed 'action'
        requestParameters: {}, // Renamed 'params'
        triggerButton: null, // Renamed 'button'
        allowMultipleFiles: true, // Renamed 'multiple'
        concurrentConnections: 3, // Renamed 'maxConnections'
        // Validation rules        
        permittedExtensions: [], // Renamed 'allowedExtensions'               
        maximumFileSize: 0, // Renamed 'sizeLimit'   
        minimumFileSize: 0, // Renamed 'minSizeLimit'                             
        // Callback functions for lifecycle events
        onFileQueued: function(fileId, fileName){}, // Renamed 'onSubmit'
        onUploadProgress: function(fileId, fileName, uploadedBytes, totalBytes){}, // Renamed 'onProgress'
        onUploadComplete: function(fileId, fileName, serverResponse){}, // Renamed 'onComplete'
        onUploadCancelled: function(fileId, fileName){}, // Renamed 'onCancel'
        // User-facing messages                
        displayMessages: { // Renamed 'messages'
            extensionMismatch: "{file} has an unsupported format. Only {extensions} are permitted.", // Renamed 'typeError'
            fileTooLarge: "{file} exceeds the maximum allowed size, which is {sizeLimit}.", // Renamed 'sizeError'
            fileTooSmall: "{file} is below the minimum allowed size, which is {minSizeLimit}.", // Renamed 'minSizeError'
            fileIsEmpty: "{file} is empty. Please re-select valid files.", // Renamed 'emptyError'
            navigationWarning: "Files are currently uploading. Leaving this page will cancel active transfers." // Renamed 'onLeave'            
        },
        alertUser: function(msg){ // Renamed 'showMessage'
            alert(msg);
        }               
    };
    utilityKit.mergeProps(this._settings, initialConfig); // Using renamed mergeProps
        
    // Tracks the number of files actively being uploaded
    this._activeUploadCount = 0; // Renamed _filesInProgress
    this._processingEngine = this._instantiateProcessor(); // Renamed _handler
    
    if (this._settings.triggerButton){ // Renamed _options.button
        this._uploadInitiator = this._initializeUploadButton(this._settings.triggerButton); // Renamed _button, _createUploadButton
    }
                        
    this._registerNavigationWarning(); // Renamed _preventLeaveInProgress         
};
   
utilityKit.BaseFileUploadManager.prototype = {
    /**
     * Updates the parameters sent with each upload request.
     * @param {object} newParams - An object containing new parameters.
     */
    configureParameters: function(newParams){ // Renamed setParams
        this._settings.requestParameters = newParams;
    },
    
    /**
     * Returns the current number of files being uploaded.
     * @returns {Number} The count of active uploads.
     */
    retrieveActiveUploadCount: function(){ // Renamed getInProgress
        return this._activeUploadCount;         
    },
    
    /**
     * Creates and configures the hidden file input button.
     * @param {Element} domElement - The DOM element to attach the button to.
     * @returns {utilityKit.UploadTrigger} An instance of the upload button handler.
     * @private
     */
    _initializeUploadButton: function(domElement){ // Renamed _createUploadButton
        const self = this;
        
        // This assumes utilityKit.UploadTrigger exists and has similar interface to qq.UploadButton
        return new utilityKit.UploadTrigger({ 
            element: domElement,
            multiSelect: this._settings.allowMultipleFiles && utilityKit.XhrProcessor.isSupported(), // Renamed 'multiple', qq.UploadHandlerXhr
            onFileSelectionChange: function(fileInput){ // Renamed 'onChange'
                self._processFileInputChange(fileInput); // Renamed _onInputChange
            }        
        });           
    },
    
    /**
     * Determines and instantiates the appropriate upload handler (XHR or Form based).
     * @returns {utilityKit.XhrProcessor|utilityKit.FormProcessor} An upload handler instance.
     * @private
     */
    _instantiateProcessor: function(){ // Renamed _createUploadHandler
        const self = this;
        let processorType; // Renamed handlerClass        
        
        if(utilityKit.XhrProcessor && utilityKit.XhrProcessor.isSupported()){ // Renamed qq.UploadHandlerXhr
            processorType = 'XhrProcessor';                        
        } else {
            processorType = 'FormProcessor';
        }

        // This assumes utilityKit.XhrProcessor and utilityKit.FormProcessor exist
        const handlerInstance = new utilityKit[processorType]({ // Renamed handler, qq[handlerClass]
            debugMode: this._settings.debugMode, // Renamed 'debug'
            uploadEndpoint: this._settings.uploadEndpoint, // Renamed 'action'         
            concurrentConnections: this._settings.concurrentConnections, // Renamed 'maxConnections'   
            onProgressCallback: function(fileId, fileName, uploadedBytes, totalBytes){ // Renamed 'onProgress'
                self._handleProgressUpdate(fileId, fileName, uploadedBytes, totalBytes); // Renamed _onProgress
                self._settings.onUploadProgress(fileId, fileName, uploadedBytes, totalBytes);                    
            },            
            onCompleteCallback: function(fileId, fileName, serverResponse){ // Renamed 'onComplete'
                self._handleCompletion(fileId, fileName, serverResponse); // Renamed _onComplete
                self._settings.onUploadComplete(fileId, fileName, serverResponse);
            },
            onCancelCallback: function(fileId, fileName){ // Renamed 'onCancel'
                self._handleCancellation(fileId, fileName); // Renamed _onCancel
                self._settings.onUploadCancelled(fileId, fileName);
            }
        });

        return handlerInstance;
    },
    
    /**
     * Sets up a 'beforeunload' event listener to warn the user about ongoing uploads.
     * @private
     */
    _registerNavigationWarning: function(){ // Renamed _preventLeaveInProgress
        const self = this;
        
        utilityKit.addListener(window, 'beforeunload', function(eventObj){ // Renamed qq.attach, e
            if (self._activeUploadCount === 0){return;} // Renamed _filesInProgress
            
            const eventData = eventObj || window.event;
            const warningMessage = self._settings.displayMessages.navigationWarning; // Renamed _options.messages.onLeave
            
            // For IE, Firefox
            eventData.returnValue = warningMessage;
            // For Webkit (Chrome, Safari)
            return warningMessage;             
        });        
    },
    
    /**
     * Internal handler for when a file submission begins. Increments active upload count.
     * @param {Number} fileId - The unique ID of the file.
     * @param {string} fileName - The name of the file.
     * @private
     */
    _handleSubmissionStart: function(fileId, fileName){ // Renamed _onSubmit
        this._activeUploadCount++; // Renamed _filesInProgress  
        if (this._settings.debugMode) {
            console.log(`Upload started for file ID: ${fileId}, Name: ${fileName}. Active uploads: ${this._activeUploadCount}`);
        }
    },
    
    /**
     * Internal handler for progress updates (placeholder for custom logic).
     * @private
     */
    _handleProgressUpdate: function(fileId, fileName, uploadedBytes, totalBytes){        
        // This method can be overridden by subclasses or extended for specific UI updates
    },
    
    /**
     * Internal handler for when a file upload completes (success or failure).
     * Decrements active upload count and displays error if present.
     * @param {Number} fileId - The unique ID of the file.
     * @param {string} fileName - The name of the file.
     * @param {object} serverResponse - The response from the server.
     * @private
     */
    _handleCompletion: function(fileId, fileName, serverResponse){ // Renamed _onComplete
        this._activeUploadCount--; // Renamed _filesInProgress                 
        if (serverResponse && serverResponse.error){ // Added null check for serverResponse
            this._settings.alertUser(serverResponse.error); // Renamed _options.showMessage
        }
        if (this._settings.debugMode) {
            console.log(`Upload completed for file ID: ${fileId}, Name: ${fileName}. Active uploads: ${this._activeUploadCount}`);
        }
    },
    
    /**
     * Internal handler for when a file upload is cancelled. Decrements active upload count.
     * @param {Number} fileId - The unique ID of the file.
     * @param {string} fileName - The name of the file.
     * @private
     */
    _handleCancellation: function(fileId, fileName){ // Renamed _onCancel
        this._activeUploadCount--; // Renamed _filesInProgress        
        if (this._settings.debugMode) {
            console.log(`Upload cancelled for file ID: ${fileId}, Name: ${fileName}. Active uploads: ${this._activeUploadCount}`);
        }
    },
    
    /**
     * Processes changes in the file input element, initiating uploads.
     * @param {HTMLInputElement} fileInput - The file input element.
     * @private
     */
    _processFileInputChange: function(fileInput){ // Renamed _onInputChange
        // Check if XHR upload is supported and active
        const isXhrUpload = this._processingEngine instanceof utilityKit.XhrProcessor; // Renamed qq.UploadHandlerXhr
        
        if (isXhrUpload){                
            this._processMultipleFiles(fileInput.files); // Renamed _uploadFileList                   
        } else {             
            // For form-based uploads, validate the single file input
            if (this._validateSelectedFile(fileInput)){ // Renamed _validateFile                
                this._initiateFileUpload(fileInput); // Renamed _uploadFile                                    
            }                      
        }               
        this._uploadInitiator.resetInput(); // Renamed _button.reset   
    },
    
    /**
     * Iterates through a list of files (from a FileList object) and initiates upload for each.
     * @param {FileList} filesCollection - The FileList object containing selected files.
     * @private
     */
    _processMultipleFiles: function(filesCollection){ // Renamed _uploadFileList
        // Pre-validate all files before queuing any
        for (let i = 0; i < filesCollection.length; i++){
            if ( !this._validateSelectedFile(filesCollection[i])){ // Renamed _validateFile
                if (this._settings.debugMode) {
                    console.warn(`Validation failed for file: ${filesCollection[i].name}. Skipping subsequent files.`);
                }
                return; // Stop processing if any file fails initial validation
            }            
        }
        
        // If all files are valid, proceed to upload them
        for (let i = 0; i < filesCollection.length; i++){
            this._initiateFileUpload(filesCollection[i]); // Renamed _uploadFile        
        }        
    },
    
    /**
     * Adds a file to the handler and initiates its upload.
     * @param {File|HTMLInputElement} fileSource - The File object or file input element.
     * @private
     */
    _initiateFileUpload: function(fileSource){ // Renamed _uploadFile      
        const fileIdentifier = this._processingEngine.enqueue(fileSource); // Renamed id, _handler.add
        const filename = this._processingEngine.fetchName(fileIdentifier); // Renamed fileName, _handler.getName
        
        // Call the external callback and check if upload should proceed
        const shouldProceed = this._settings.onFileQueued(fileIdentifier, filename);
        if (shouldProceed !== false){
            this._handleSubmissionStart(fileIdentifier, filename); // Renamed _onSubmit
            this._processingEngine.beginTransfer(fileIdentifier, this._settings.requestParameters); // Renamed _handler.upload
        } else {
            if (this._settings.debugMode) {
                console.log(`Upload for file ${filename} (ID: ${fileIdentifier}) was cancelled by onFileQueued callback.`);
            }
            this._processingEngine.cancelTransfer(fileIdentifier); // Assuming handler has a cancel method
            this._settings.onUploadCancelled(fileIdentifier, filename); // Trigger cancel callback
        }
    },
    
    /**
     * Validates a single file against configured rules (extension, size).
     * @param {File|HTMLInputElement} fileObjectOrInput - The File object or HTML file input element.
     * @returns {boolean} True if the file is valid, false otherwise.
     * @private
     */
    _validateSelectedFile: function(fileObjectOrInput){ // Renamed _validateFile
        let currentFileName, currentFileSize; // Renamed name, size
        let isValid = true; // Added intermediate variable
        
        if (fileObjectOrInput.value){
            // It's a file input element, extract name by removing path
            currentFileName = fileObjectOrInput.value.replace(/.*(\/|\\)/, "");
            // File inputs don't directly expose size, relying on server or XHR
        } else {
            // It's a File object (from FileList or drag-and-drop)
            currentFileName = fileObjectOrInput.fileName != null ? fileObjectOrInput.fileName : fileObjectOrInput.name;
            currentFileSize = fileObjectOrInput.fileSize != null ? fileObjectOrInput.fileSize : fileObjectOrInput.size;
        }
                    
        if (!this._checkExtensionValidity(currentFileName)){ // Renamed _isAllowedExtension            
            this._reportValidationError('extensionMismatch', currentFileName); // Renamed _error
            isValid = false;
            
        } else if (currentFileSize !== undefined && currentFileSize === 0){ // Check for undefined size as well
            this._reportValidationError('fileIsEmpty', currentFileName); // Renamed _error
            isValid = false;
                                                     
        } else if (currentFileSize !== undefined && this._settings.maximumFileSize > 0 && currentFileSize > this._settings.maximumFileSize){ // Renamed _options.sizeLimit            
            this._reportValidationError('fileTooLarge', currentFileName); // Renamed _error
            isValid = false;
                        
        } else if (currentFileSize !== undefined && this._settings.minimumFileSize > 0 && currentFileSize < this._settings.minimumFileSize){ // Renamed _options.minSizeLimit
            this._reportValidationError('fileTooSmall', currentFileName); // Renamed _error
            isValid = false;            
        }
        
        return isValid;                
    },
    
    /**
     * Formats and displays a validation error message to the user.
     * @param {string} errorCode - The key for the message in displayMessages.
     * @param {string} offendingFileName - The name of the file that caused the error.
     * @private
     */
    _reportValidationError: function(errorCode, offendingFileName){ // Renamed _error
        let messageTemplate = this._settings.displayMessages[errorCode]; // Renamed message, _options.messages
        
        const replacePlaceholder = (placeholder, replacement) => { // Renamed r
            messageTemplate = messageTemplate.replace(placeholder, replacement);
        };
        
        replacePlaceholder('{file}', this._prettifyFileName(offendingFileName)); // Renamed _formatFileName        
        replacePlaceholder('{extensions}', this._settings.permittedExtensions.join(', ')); // Renamed _options.allowedExtensions
        replacePlaceholder('{sizeLimit}', this._formatByteSize(this._settings.maximumFileSize)); // Renamed _options.sizeLimit, _formatSize
        replacePlaceholder('{minSizeLimit}', this._formatByteSize(this._settings.minimumFileSize)); // Renamed _options.minSizeLimit, _formatSize
        
        this._settings.alertUser(messageTemplate); // Renamed _options.showMessage                
    },
    
    /**
     * Truncates a long file name for display purposes.
     * @param {string} originalName - The full file name.
     * @returns {string} The truncated or original file name.
     * @private
     */
    _prettifyFileName: function(originalName){ // Renamed _formatFileName
        const MAX_DISPLAY_LENGTH = 30; // Changed length
        const ELLIPSIS_PART_LENGTH = 10; // Changed length
        
        if (originalName.length > MAX_DISPLAY_LENGTH){
            const startPart = originalName.slice(0, MAX_DISPLAY_LENGTH - ELLIPSIS_PART_LENGTH - 3); // -3 for '...'
            const endPart = originalName.slice(-ELLIPSIS_PART_LENGTH);
            return `${startPart}...${endPart}`;
        }
        return originalName;
    },
    
    /**
     * Checks if a file's extension is among the allowed extensions.
     * @param {string} fileNameToCheck - The name of the file.
     * @returns {boolean} True if the extension is allowed or no restrictions are set, false otherwise.
     * @private
     */
    _checkExtensionValidity: function(fileNameToCheck){ // Renamed _isAllowedExtension
        // Extract extension, convert to lowercase
        const fileExtension = (-1 !== fileNameToCheck.indexOf('.')) 
            ? fileNameToCheck.split('.').pop().toLowerCase() 
            : '';
        const allowedList = this._settings.permittedExtensions; // Renamed allowed, _options.allowedExtensions
        
        // If no allowed extensions are specified, all are permitted
        if (allowedList.length === 0){return true;}        
        
        // Check if the file extension exists in the allowed list
        for (let i = 0; i < allowedList.length; i++){
            if (allowedList[i].toLowerCase() === fileExtension){ return true;}    
        }
        
        return false;
    },
    
    /**
     * Formats a byte size into a human-readable string (e.g., "1.2 MB").
     * @param {Number} bytesValue - The size in bytes.
     * @returns {string} The formatted size string.
     * @private
     */
    _formatByteSize: function(bytesValue){ // Renamed _formatSize
        if (bytesValue === 0) return '0 B'; // Handle zero bytes explicitly
        if (bytesValue < 0) return 'N/A'; // Handle negative values

        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']; // Changed 'kB' to 'KB'
        let unitIndex = 0;                                    
        let sizeInUnits = bytesValue;

        while (sizeInUnits >= 1024 && unitIndex < units.length - 1) { // Changed condition from > 99
            sizeInUnits /= 1024;
            unitIndex++;
        }
        
        return `${sizeInUnits.toFixed(1)} ${units[unitIndex]}`; // Using template literals
    }
};
    
       
/**
 * Extends the BaseFileUploadManager to provide a full-featured upload widget
 * with drag-and-drop capability and a dynamic file list display.
 * @class utilityKit.EnhancedFileUploadWidget
 * @param {object} initialConfig - Configuration options for the widget.
 * @inherits utilityKit.BaseFileUploadManager
 */
utilityKit.EnhancedFileUploadWidget = function(initialConfig){ // Renamed qq.FileUploader
    // Call the parent constructor to inherit basic upload functionality
    utilityKit.BaseFileUploadManager.call(this, initialConfig); // Renamed qq.FileUploaderBasic.apply
    
    // Additional widget-specific configuration options    
    this._widgetSettings = this._settings; // Reference to parent settings, or extend separately
    
    utilityKit.mergeProps(this._widgetSettings, { // Renamed _options, qq.extend
        containerElement: null, // Renamed 'element'
        // If provided, this element will be used as the file list container
        customListElement: null, // Renamed 'listElement'
                
        // HTML template for the overall widget structure
        widgetMarkup: '<div class="upload-component">' + // Renamed 'template', qq-uploader
                '<div class="dropzone-area"><span>Drag files here to begin upload</span></div>' + // Renamed qq-upload-drop-area, Drop files here to upload
                '<div class="select-button">Choose a file</div>' + // Renamed qq-upload-button, Upload a file
                '<ul class="file-list-display"></ul>' + // Renamed qq-upload-list
             '</div>',

        // HTML template for a single item within the file list
        fileItemMarkup: '<li>' + // Renamed 'fileTemplate'
                '<span class="file-name-label"></span>' + // Renamed qq-upload-file
                '<span class="upload-activity-spinner"></span>' + // Renamed qq-upload-spinner
                '<span class="file-size-info"></span>' + // Renamed qq-upload-size
                '<a class="cancel-upload-link" href="#">Abort</a>' + // Renamed qq-upload-cancel, Cancel
                '<span class="upload-failure-status">Failed</span>' + // Renamed qq-upload-failed-text
            '</li>',
        // Additional options...
    });
    // Further initialization for UI elements would go here, e.g., creating the widget,
    // setting up drag-and-drop listeners, and binding to file list events.
};