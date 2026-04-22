/* eslint-disable new-cap */
/* global XHR: false, FormPayload: false */
//
// Dynamic Content Uploader Module
//
// Creator: Roy van Kaathoven
// Mail: ik@royvankaathoven.nl
//
(function(docElem, globalObj) {
    'use strict';

    // Core module for managing file uploads within an editor context.
    var mediaUploader = function(configOpts, editorInstance) {
        this.configuration = mediaUploader.helpers.combine(configOpts, mediaUploader.presetOptions);
        this.activeEditor = editorInstance;
        this.fileIdPlaceholder = '{file_name_marker}';
        this.previousContent = null;
    };

    /**
     * Stores references to available editor integrations.
     *
     * @type {object}
     */
    mediaUploader.editorRegistry = {};

    /**
     * Collection of helper functions for common tasks.
     */
    mediaUploader.helpers = {

        /**
         * Merges multiple objects into a single new object.
         * Later objects' properties overwrite earlier ones.
         *
         * @param {object[]} sourceObjects - A list of objects to merge.
         * @returns {object} The combined object.
         */
        combine: function() {
            let mergedResult = {};
            for (let idx = arguments.length - 1; idx >= 0; idx--) {
                let currentObj = arguments[idx];
                for (let propKey in currentObj) {
                    if (currentObj.hasOwnProperty(propKey)) {
                        mergedResult[propKey] = currentObj[propKey];
                    }
                }
            }
            return mergedResult;
        },

        /**
         * Appends new text to existing content, ensuring proper line breaks.
         * Avoids excessive newlines at the beginning or in between.
         *
         * @param {string} existingContent - The current text content.
         * @param {string} newAddition - The text to be appended.
         * @returns {string} The updated content string.
         */
        addLineInIsolation: function(existingContent, newAddition) {
            return (existingContent + "\n\n[[DELIM]]" + newAddition)
                .replace(/(\n{2,})\[\[DELIM\]\]/, "\n\n")
                .replace(/^(\n*)/, "");
        },

        /**
         * Inserts a given string at the current caret position within a textarea.
         * Handles various browser selection models.
         *
         * @param {HTMLTextAreaElement} targetElement - The textarea element.
         * @param {string} insertionText - The string to insert.
         */
        injectTextAtCaret: function(targetElement, insertionText) {
            let scrollOffset = targetElement.scrollTop;
            let charPosition = 0;
            let browserAgent = false;
            let selectionRange;

            if ((targetElement.selectionStart || targetElement.selectionStart === '0')) {
                browserAgent = "ff"; // Firefox/Modern browsers
            } else if (docElem.selection) {
                browserAgent = "ie"; // Internet Explorer
            }

            if (browserAgent === "ie") {
                targetElement.focus();
                selectionRange = docElem.selection.createRange();
                selectionRange.moveStart('character', -targetElement.value.length);
                charPosition = selectionRange.text.length;
            } else if (browserAgent === "ff") {
                charPosition = targetElement.selectionStart;
            }

            let prefixContent = (targetElement.value).substring(0, charPosition);
            let suffixContent = (targetElement.value).substring(charPosition, targetElement.value.length);
            targetElement.value = prefixContent + insertionText + suffixContent;
            charPosition = charPosition + insertionText.length;

            if (browserAgent === "ie") {
                targetElement.focus();
                selectionRange = docElem.selection.createRange();
                selectionRange.moveStart('character', -targetElement.value.length);
                selectionRange.moveStart('character', charPosition);
                selectionRange.moveEnd('character', 0);
                selectionRange.select();
            } else if (browserAgent === "ff") {
                targetElement.selectionStart = charPosition;
                targetElement.selectionEnd = charPosition;
                targetElement.focus();
            }
            targetElement.scrollTop = scrollOffset;
        }
    };

    /**
     * Default options for the media uploader module.
     *
     * @type {object}
     */
    mediaUploader.presetOptions = {
        // Endpoint URL for file uploads.
        destinationURL: 'upload_attachment.php',

        // HTTP method for sending the file.
        transferMethod: 'POST',

        // Form field name for the file.
        fileInputName: 'file',

        // Default file extension if none can be detected.
        fallbackExtension: 'png',

        // Key in the JSON response that holds the uploaded file's URL.
        jsonResponseKey: 'filename',

        // Array of allowed MIME types for uploads.
        permittedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/gif'
        ],

        // Text displayed as a placeholder during upload.
        loadingMessage: '![Resource uploading...]()',

        // Template for the final URL after successful upload.
        // {file_name_marker} will be replaced by the actual filename.
        finalUrlTemplate: "![resource]({file_name_marker})",

        // Message shown on upload failure.
        failureMessage: "Error during resource upload",

        // Additional key-value parameters to send with the upload.
        additionalParameters: {},

        // Extra HTTP headers to include with the upload request.
        customHeaders: {},

        // Callback executed before the file transfer begins.
        // Returning `false` prevents the upload.
        onBeforeUpload: function() {
            return true;
        },

        // Callback fired when a file is received (e.g., via paste or drop).
        onFileAquired: function() {},

        // Custom handler for upload completion responses.
        // Returning `false` prevents default response processing.
        onUploadCompletion: function() {
            return true;
        },

        // Custom error handler for upload failures.
        // Returning `false` prevents the default error alert.
        onUploadFailure: function() {
            return true;
        },

        // Callback after a file has been successfully uploaded and processed.
        onUploadSuccess: function() {}
    };

    /**
     * Initiates the file upload process for a given blob.
     *
     * @param {Blob} resourceBlob - The file data received from a transfer event.
     * @returns {XMLHttpRequest} The XHR object used for the request.
     */
    mediaUploader.prototype.transferResource = function(resourceBlob) {
        let _self = this;
        let transferData = new FormData();
        let ajaxRequest = new XMLHttpRequest();
        let configuration = this.configuration;
        let fileExtension = configuration.fallbackExtension;

        // Allow custom modification of the form data
        if (typeof configuration.prepareFormData === 'function') {
            configuration.prepareFormData(transferData, resourceBlob);
        }

        // Determine file extension, especially for clipboard files.
        if (resourceBlob.name) {
            let namePatternMatches = resourceBlob.name.match(/\.(.+)$/);
            if (namePatternMatches) {
                fileExtension = namePatternMatches[1];
            }
        }

        let serverFilename = "image-" + Date.now() + "." + fileExtension;
        // Custom filename generation if specified
        if (typeof configuration.serverFilenameGenerator === 'function') {
            serverFilename = configuration.serverFilenameGenerator(resourceBlob);
        }

        transferData.append(configuration.fileInputName, resourceBlob, serverFilename);

        // Include any additional parameters from configuration.
        if (typeof configuration.additionalParameters === "object") {
            for (let paramKey in configuration.additionalParameters) {
                if (configuration.additionalParameters.hasOwnProperty(paramKey)) {
                    transferData.append(paramKey, configuration.additionalParameters[paramKey]);
                }
            }
        }

        ajaxRequest.open(configuration.transferMethod, configuration.destinationURL);

        // Apply custom headers if defined.
        if (typeof configuration.customHeaders === "object") {
            for (let headerName in configuration.customHeaders) {
                if (configuration.customHeaders.hasOwnProperty(headerName)) {
                    ajaxRequest.setRequestHeader(headerName, configuration.customHeaders[headerName]);
                }
            }
        }

        // Define the onload handler for the AJAX request.
        ajaxRequest.onload = function() {
            // Check for successful HTTP status codes.
            if (ajaxRequest.status === 200 || ajaxRequest.status === 201) {
                _self.onUploadCompletionHandler(ajaxRequest);
            } else {
                _self.onUploadFailureHandler(ajaxRequest);
            }
        };

        // Execute pre-upload hook; if it returns false, abort the upload.
        if (configuration.onBeforeUpload(ajaxRequest) !== false) {
            ajaxRequest.send(transferData);
        }
        return ajaxRequest;
    };

    /**
     * Checks if a given file type is allowed for uploading.
     *
     * @param {File} candidateFile - The file object to check.
     * @returns {boolean} True if the file type is permitted, false otherwise.
     */
    mediaUploader.prototype.isResourcePermitted = function(candidateFile) {
        return this.configuration.permittedMimeTypes.indexOf(candidateFile.type) >= 0;
    };

    /**
     * Processes the response from a successful file upload.
     *
     * @param {XMLHttpRequest} completedRequest - The XMLHttpRequest object.
     * @returns {void}
     */
    mediaUploader.prototype.onUploadCompletionHandler = function(completedRequest) {
        if (this.configuration.onUploadCompletion.call(this, completedRequest) !== false) {
            let responsePayload = JSON.parse(completedRequest.responseText);
            let returnedFilename = responsePayload[this.configuration.jsonResponseKey];

            if (responsePayload && returnedFilename) {
                let newContentSnippet = this.configuration.finalUrlTemplate.replace(this.fileIdPlaceholder, returnedFilename);
                let fullEditorText = this.activeEditor.getCurrentValue().replace(this.previousContent, newContentSnippet);
                this.activeEditor.updateValue(fullEditorText);
            }
        }
    };


    /**
     * Handles errors that occur during file upload.
     *
     * @param {XMLHttpRequest} failedRequest - The XMLHttpRequest object that failed.
     * @returns {void}
     */
    mediaUploader.prototype.onUploadFailureHandler = function(failedRequest) {
        if (this.configuration.onUploadFailure.call(this, failedRequest) !== false) {
            let currentEditorText = this.activeEditor.getCurrentValue().replace(this.previousContent, "");
            this.activeEditor.updateValue(currentEditorText);
        }
    };

    /**
     * Callback function executed when a file has been prepared for insertion
     * (either by drop or paste).
     *
     * @param {File} insertedFile - The file object that was inserted.
     * @returns {void}
     */
    mediaUploader.prototype.onResourceInserted = function(insertedFile) {
        if (this.configuration.onFileAquired.call(this, insertedFile) !== false) {
            this.previousContent = this.configuration.loadingMessage;
            this.activeEditor.insertText(this.previousContent);
        }
    };


    /**
     * Event handler for paste events. Checks for file data and initiates upload.
     * @param {Event} pasteEvent - The paste event object.
     * @returns {boolean} True if the event was handled (file pasted), false otherwise.
     */
    mediaUploader.prototype.handlePasteEvent = function(pasteEvent) {
        let eventHandled = false;
        let pasteData = pasteEvent.clipboardData;
        let dataItems;

        if (typeof pasteData === "object") {
            dataItems = pasteData.items || pasteData.files || [];

            for (let itemIdx = 0; itemIdx < dataItems.length; itemIdx++) {
                let currentItem = dataItems[itemIdx];
                if (this.isResourcePermitted(currentItem)) {
                    eventHandled = true;
                    this.onResourceInserted(currentItem.getAsFile());
                    this.transferResource(currentItem.getAsFile());
                }
            }
        }

        if (eventHandled) {
            pasteEvent.preventDefault();
        }

        return eventHandled;
    };

    /**
     * Event handler for drop events. Iterates through dropped files and uploads allowed ones.
     * @param {Event} dropEvent - The drop event object.
     * @returns {boolean} True if the event was handled (file dropped), false otherwise.
     */
    mediaUploader.prototype.handleDropEvent = function(dropEvent) {
        let eventHandled = false;
        for (let fileIdx = 0; fileIdx < dropEvent.dataTransfer.files.length; fileIdx++) {
            let droppedFile = dropEvent.dataTransfer.files[fileIdx];
            if (this.isResourcePermitted(droppedFile)) {
                eventHandled = true;
                this.onResourceInserted(droppedFile);
                this.transferResource(droppedFile);
            }
        }

        return eventHandled;
    };

    // Expose the media uploader module globally.
    globalObj.mediaUploader = mediaUploader;

})(document, window);