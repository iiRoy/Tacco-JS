/*
 * Asset Embedding Module
 *
 * This module facilitates the inline embedding of media assets
 * within a content editor, handling file uploads via drag-and-drop
 * or paste events from the clipboard. It provides a flexible
 * configuration for server communication and editor integration.
 *
 * Original Author: R.V.K.
 * Modified By: AI Assistant (Type III Clone)
 */
(function(docRef, winRef) {
  'use strict';

  // --- Core Module Setup and Browser Compatibility Check ---

  // Ensure essential browser APIs are available for functionality.
  // If not, log a warning and prevent module initialization.
  if (!winRef.XMLHttpRequest || !winRef.FormData) {
    console.warn("AssetEmbedder: Required browser APIs (XMLHttpRequest, FormData) are not available. Module functionality will be limited or unavailable.");
    return;
  }

  /**
   * The main constructor for the AssetEmbedder module.
   * Initializes an instance with given configuration and a reference to the editor.
   *
   * @param {Object} configOptions - User-provided configuration overrides.
   * @param {Object} editorHostInstance - The editor instance (e.g., a textarea wrapper) to interact with.
   * @constructor
   */
  var AssetEmbedder = function(configOptions, editorHostInstance) {
    // Merge user configuration with default settings to create the active configuration.
    this.configuration = AssetEmbedder.toolkit.combineObjects({}, AssetEmbedder.defaultSettings, configOptions);

    // Store a reference to the target editor instance.
    this.targetEditor = editorHostInstance;

    // Define the placeholder string used within URL templates.
    this.placeholderToken = '{filename}';

    // Stores the temporary text (e.g., "Uploading...") inserted into the editor
    // This allows for later replacement with the final asset URL or removal on error.
    this.lastInsertedText = null;

    // Optional: Perform a basic validation of critical configuration items.
    if (typeof this.configuration.serverEndpoint !== 'string' || !this.configuration.serverEndpoint) {
      AssetEmbedder.toolkit.logger.warn("AssetEmbedder: 'serverEndpoint' configuration is missing or invalid. Uploads may fail.");
    }
  };

  /**
   * A registry for different editor integration adapters.
   * This allows the AssetEmbedder to work with various editor libraries.
   * @type {Object.<string, Function>}
   */
  AssetEmbedder.registeredEditors = {};

  /**
   * --- Utility Toolkit ---
   * A collection of helper functions used internally by the AssetEmbedder.
   */
  AssetEmbedder.toolkit = {

    /**
     * Deeply merges multiple objects into a new object.
     * Properties from later objects overwrite those from earlier ones.
     * Nested objects are merged recursively.
     *
     * @param {...Object} inputObjects - A variable number of objects to merge.
     * @returns {Object} A new object containing the merged properties.
     */
    combineObjects: function() {
      var mergedResult = {};
      // Iterate through arguments (objects to merge) in order.
      Array.prototype.slice.call(arguments).forEach(function(currentObj) {
        if (currentObj && typeof currentObj === 'object') {
          for (var propKey in currentObj) {
            // Ensure the property is directly on the object, not inherited.
            if (Object.prototype.hasOwnProperty.call(currentObj, propKey)) {
              // If both the current and existing values are objects (and not arrays),
              // perform a deep merge. Otherwise, shallowly assign the value.
              if (typeof mergedResult[propKey] === 'object' && mergedResult[propKey] !== null &&
                typeof currentObj[propKey] === 'object' && currentObj[propKey] !== null &&
                !Array.isArray(mergedResult[propKey]) && !Array.isArray(currentObj[propKey])) {
                mergedResult[propKey] = AssetEmbedder.toolkit.combineObjects(mergedResult[propKey], currentObj[propKey]);
              } else {
                mergedResult[propKey] = currentObj[propKey];
              }
            }
          }
        }
      });
      return mergedResult;
    },

    /**
     * Appends a new text snippet to existing content, ensuring there are
     * appropriate line breaks (at least two) but no excessive empty lines.
     *
     * @param {string} existingContent - The current content of the editor.
     * @param {string} newSnippet - The text string to be appended.
     * @returns {string} The combined content with normalized line breaks.
     */
    ensureLineSeparation: function(existingContent, newSnippet) {
      // Use a unique temporary marker to manage newline logic.
      var tempNewlineMarker = "[[ASSET_EMBEDDER_TEMP_NL_MARKER]]";
      var combinedString = existingContent + "\n\n" + tempNewlineMarker + newSnippet;

      // Replace instances where the marker is preceded by two or more newlines,
      // ensuring it's always preceded by exactly two.
      var cleanedString = combinedString.replace(/(\n{2,})\[\[ASSET_EMBEDDER_TEMP_NL_MARKER\]\]/, "\n\n");

      // Remove any leading newlines that might occur if existingContent was empty.
      return cleanedString.replace(/^(\n*)/, "");
    },

    /**
     * Inserts a specified content string at the current caret position
     * within a given HTML textarea element. Handles cross-browser differences.
     *
     * @param {HTMLTextAreaElement} textAreaElement - The target textarea DOM element.
     * @param {string} contentToInsert - The text content to place at the cursor.
     */
    injectContentAtCursor: function(textAreaElement, contentToInsert) {
      // Basic validation for input parameters.
      if (!textAreaElement || typeof contentToInsert !== 'string' || !textAreaElement.value) {
        AssetEmbedder.toolkit.logger.error("injectContentAtCursor: Invalid input parameters or target element.");
        return;
      }

      var initialScrollPosition = textAreaElement.scrollTop;
      var caretPosition = 0;
      var browserSelectionModel = null;
      var selectionRange;

      // Determine the browser's text selection model.
      if ((textAreaElement.selectionStart || textAreaElement.selectionStart === 0)) { // Modern browsers (Firefox, Chrome, Safari)
        browserSelectionModel = "modern";
      } else if (docRef.selection) { // Legacy IE
        browserSelectionModel = "legacyIE";
      }

      // Retrieve the current caret position.
      if (browserSelectionModel === "legacyIE") {
        textAreaElement.focus();
        selectionRange = docRef.selection.createRange();
        // Move selection start to the beginning of the textarea to calculate offset.
        selectionRange.moveStart('character', -textAreaElement.value.length);
        caretPosition = selectionRange.text.length;
      } else if (browserSelectionModel === "modern") {
        caretPosition = textAreaElement.selectionStart;
      } else {
        // Fallback for unsupported selection models: append content at the end.
        textAreaElement.value += contentToInsert;
        AssetEmbedder.toolkit.logger.warn("injectContentAtCursor: Unknown browser selection model, content appended to end.");
        return;
      }

      // Split the textarea's content, insert new text, and reconstruct.
      var prefixContent = textAreaElement.value.substring(0, caretPosition);
      var suffixContent = textAreaElement.value.substring(caretPosition, textAreaElement.value.length);
      textAreaElement.value = prefixContent + contentToInsert + suffixContent;
      caretPosition += contentToInsert.length; // Update caret position for after insertion.

      // Restore the caret position after content modification.
      if (browserSelectionModel === "legacyIE") {
        textAreaElement.focus();
        selectionRange = docRef.selection.createRange();
        selectionRange.moveStart('character', -textAreaElement.value.length);
        selectionRange.moveStart('character', caretPosition);
        selectionRange.moveEnd('character', 0); // Collapse selection to a point.
        selectionRange.select();
      } else if (browserSelectionModel === "modern") {
        textAreaElement.selectionStart = caretPosition;
        textAreaElement.selectionEnd = caretPosition;
        textAreaElement.focus();
      }
      textAreaElement.scrollTop = initialScrollPosition; // Restore original scroll position.
    },

    /**
     * A simple logging utility for consistent output.
     */
    logger: {
      log: function() {
        if (winRef.console && winRef.console.log) winRef.console.log.apply(winRef.console, arguments);
      },
      warn: function() {
        if (winRef.console && winRef.console.warn) winRef.console.warn.apply(winRef.console, arguments);
      },
      error: function() {
        if (winRef.console && winRef.console.error) winRef.console.error.apply(winRef.console, arguments);
      }
    },

    /**
     * Generates a simple, unique alphanumeric ID string.
     * Useful for temporary filenames or tracking.
     * @returns {string} A pseudo-unique ID.
     */
    generateUniqueId: function() {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },

    /**
     * Extracts the file extension from a given filename string.
     *
     * @param {string} fileName - The name of the file (e.g., "document.pdf").
     * @returns {string} The file extension without the leading dot (e.g., "pdf"), or an empty string if no extension is found.
     */
    extractFileExtension: function(fileName) {
      if (!fileName || typeof fileName !== 'string') return '';
      var matches = fileName.match(/\.([^.]+)$/); // Matches the last dot and characters after it.
      return matches ? matches[1] : '';
    }
  };

  /**
   * --- Default Configuration Settings ---
   * These settings define the default behavior of the AssetEmbedder.
   * They can be overridden by providing `configOptions` to the constructor.
   * @type {Object}
   */
  AssetEmbedder.defaultSettings = {
    /**
     * The URL of the server endpoint responsible for handling file uploads.
     * @type {string}
     */
    serverEndpoint: 'upload_asset.php',

    /**
     * The HTTP method to use for the upload request (e.g., 'POST', 'PUT').
     * @type {string}
     */
    httpMethod: 'POST',

    /**
     * The name of the form field that will contain the file data in the multipart/form-data request.
     * @type {string}
     */
    fileParamName: 'uploaded_file',

    /**
     * The default file extension to use if the original file's extension cannot be determined.
     * This helps in cases of clipboard data without a filename.
     * @type {string}
     */
    fallbackExtension: 'bin', // Changed from 'png' for broader applicability.

    /**
     * The key within the JSON response from the server that contains the URL or filename
     * of the successfully uploaded asset.
     * @type {string}
     */
    responseKeyForUrl: 'asset_url', // Changed from 'filename'.

    /**
     * An array of allowed MIME types for uploads. Files with types not in this list will be rejected.
     * @type {string[]}
     */
    permittedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp' // Added WebP image format support.
    ],

    /**
     * The temporary text string inserted into the editor immediately after a file is received
     * (e.g., dropped or pasted), before the upload completes. This acts as a visual placeholder.
     * @type {string}
     */
    tempPlaceholder: '![Uploading media...]()', // Updated placeholder text.

    /**
     * The template string used to embed the final asset URL into the editor after a successful upload.
     * The `{filename}` token will be dynamically replaced with the actual URL returned by the server.
     * @type {string}
     */
    finalEmbedTemplate: "![Media Asset]({filename})", // Updated template text.

    /**
     * The error message displayed in the editor if the upload process fails.
     * @type {string}
     */
    uploadFailedMessage: "Error: Failed to upload media.", // Updated error message.

    /**
     * An object containing additional key-value pairs to be sent with the file upload request
     * as part of the form data.
     * @type {Object.<string, string|number|boolean>}
     */
    additionalFormData: {},

    /**
     * An object containing custom HTTP headers to be sent with the upload request.
     * @type {Object.<string, string>}
     */
    customHeaders: {},

    /**
     * A callback function executed just before the file upload XMLHttpRequest is sent.
     * This allows for last-minute modifications to the request or FormData.
     *
     * @param {XMLHttpRequest} req - The XMLHttpRequest object.
     * @param {FormData} payload - The FormData object containing the file and other parameters.
     * @returns {boolean} Return `false` to cancel the upload; `true` to proceed.
     */
    onBeforeUpload: function(req, payload) {
      AssetEmbedder.toolkit.logger.log("AssetEmbedder: Running 'onBeforeUpload' hook.");
      return true;
    },

    /**
     * A callback function triggered immediately when a file is received via a paste or drop event,
     * before any upload request is dispatched.
     *
     * @param {File} receivedFile - The file object that was received.
     */
    onMediaReceived: function(receivedFile) {
      AssetEmbedder.toolkit.logger.log("AssetEmbedder: Media file received:", receivedFile.name || 'clipboard data');
    },

    /**
     * A callback function executed upon a successful file upload response from the server.
     *
     * @param {XMLHttpRequest} req - The XMLHttpRequest object containing the server's response.
     * @returns {boolean} Return `false` to prevent the default post-upload processing (e.g., inserting the URL into the editor); `true` to continue.
     */
    onUploadSuccess: function(req) {
      AssetEmbedder.toolkit.logger.log("AssetEmbedder: Upload successful. Status:", req.status);
      return true;
    },

    /**
     * A callback function executed when a file upload fails (e.g., HTTP error, network issue, server-side error).
     *
     * @param {XMLHttpRequest} req - The XMLHttpRequest object with error details.
     * @returns {boolean} Return `false` to prevent the default error handling (e.g., removing the placeholder or displaying an error message); `true` to continue.
     */
    onUploadFailure: function(req) {
      AssetEmbedder.toolkit.logger.error("AssetEmbedder: Upload failed. Status:", req.status, "Response:", req.responseText);
      return true;
    },

    /**
     * A callback function that allows for custom modification of the FormData object
     * before the file and `additionalFormData` are appended.
     *
     * @param {FormData} payload - The FormData object to customize.
     * @param {File} fileObject - The file being uploaded.
     */
    customizeFormData: function(payload, fileObject) {
      // Default implementation does nothing. Users can provide their own logic.
    },

    /**
     * A function that determines the filename to be sent to the server.
     * By default, it generates a unique name based on the original file name and a UUID.
     *
     * @param {File} fileObject - The file being uploaded.
     * @returns {string} The desired filename for the server.
     */
    getServerFileName: function(fileObject) {
      var baseName = fileObject.name ? fileObject.name.split('.').slice(0, -1).join('.') : 'clipboard_asset';
      var ext = AssetEmbedder.toolkit.extractFileExtension(fileObject.name || '') || AssetEmbedder.defaultSettings.fallbackExtension;
      // Sanitize baseName and append a unique identifier.
      return baseName.replace(/[^a-zA-Z0-9_\-]/g, '_') + '_' + AssetEmbedder.toolkit.generateUniqueId() + '.' + ext;
    }
  };


  // --- AssetEmbedder Prototype Methods ---

  /**
   * Dispatches an XMLHttpRequest to upload the given media file to the configured server endpoint.
   *
   * @param {File} mediaFile - The file object (Blob or File) to upload.
   * @returns {XMLHttpRequest|null} The XMLHttpRequest object if initiated, or null if the upload was prevented or invalid.
   */
  AssetEmbedder.prototype.dispatchUploadRequest = function(mediaFile) {
    // Guard clauses to ensure a valid editor and file are present.
    if (!this.targetEditor) {
      AssetEmbedder.toolkit.logger.error("AssetEmbedder: No target editor instance defined. Cannot dispatch upload.");
      return null;
    }
    if (!(mediaFile instanceof File) && !(mediaFile instanceof Blob)) {
      AssetEmbedder.toolkit.logger.error("AssetEmbedder: Invalid media file provided for upload. Expected File or Blob.", mediaFile);
      return null;
    }

    var selfRef = this;
    var requestPayload = new FormData();
    var ajaxRequest = new XMLHttpRequest();
    var configuration = this.configuration;
    var fileExtension = configuration.fallbackExtension;

    // Determine the file extension, prioritizing from the file's name.
    var extensionFromFileName = AssetEmbedder.toolkit.extractFileExtension(mediaFile.name || '');
    if (extensionFromFileName) {
      fileExtension = extensionFromFileName;
    }

    // Generate the filename that will be used on the server, using the configured method.
    var serverFileName = configuration.getServerFileName(mediaFile);
    if (!serverFileName) {
      AssetEmbedder.toolkit.logger.error("AssetEmbedder: getServerFileName did not return a valid filename. Upload aborted.");
      return null;
    }

    // Append the actual media file to the FormData payload.
    requestPayload.append(configuration.fileParamName, mediaFile, serverFileName);

    // Append any additional parameters specified in the configuration.
    if (typeof configuration.additionalFormData === "object") {
      for (var paramKey in configuration.additionalFormData) {
        if (Object.prototype.hasOwnProperty.call(configuration.additionalFormData, paramKey)) {
          requestPayload.append(paramKey, configuration.additionalFormData[paramKey]);
        }
      }
    }

    // Allow external customization of the FormData object before sending.
    if (typeof configuration.customizeFormData === 'function') {
      configuration.customizeFormData(requestPayload, mediaFile);
    }

    // Initialize the XMLHttpRequest.
    ajaxRequest.open(configuration.httpMethod, configuration.serverEndpoint, true); // `true` for asynchronous request.

    // Set any custom HTTP headers specified in the configuration.
    if (typeof configuration.customHeaders === "object") {
      for (var headerName in configuration.customHeaders) {
        if (Object.prototype.hasOwnProperty.call(configuration.customHeaders, headerName)) {
          ajaxRequest.setRequestHeader(headerName, configuration.customHeaders[headerName]);
        }
      }
    }

    // Define the handler for when the XMLHttpRequest successfully completes.
    ajaxRequest.onload = function() {
      // HTTP status codes in the 2xx range indicate success.
      if (ajaxRequest.status >= 200 && ajaxRequest.status < 300) {
        selfRef.handleUploadSuccess(ajaxRequest);
      } else {
        selfRef.handleUploadFailure(ajaxRequest, "Server responded with status " + ajaxRequest.status);
      }
    };

    // Define the handler for network errors during the XMLHttpRequest.
    ajaxRequest.onerror = function() {
      AssetEmbedder.toolkit.logger.error("AssetEmbedder: A network error occurred during upload for file:", mediaFile.name);
      selfRef.handleUploadFailure(ajaxRequest, "Network error during upload.");
    };

    // Execute the `onBeforeUpload` hook. If it returns `false`, cancel the upload.
    if (configuration.onBeforeUpload(ajaxRequest, requestPayload) === false) {
      AssetEmbedder.toolkit.logger.log("AssetEmbedder: Upload cancelled by 'onBeforeUpload' hook.");
      // If cancelled, remove the temporary placeholder from the editor.
      if (selfRef.lastInsertedText && selfRef.targetEditor && typeof selfRef.targetEditor.setValue === 'function') {
        selfRef.targetEditor.setValue(selfRef.targetEditor.getValue().replace(selfRef.lastInsertedText, ''));
      }
      selfRef.resetStatus(); // Clear any pending status.
      return null;
    }

    // Send the FormData payload.
    ajaxRequest.send(requestPayload);
    return ajaxRequest;
  };

  /**
   * Determines if the given media file's MIME type is permitted for upload
   * based on the `permittedMimeTypes` configuration.
   *
   * @param {File} mediaFile - The file object to check.
   * @returns {boolean} `true` if the file type is allowed, `false` otherwise.
   */
  AssetEmbedder.prototype.isMediaPermitted = function(mediaFile) {
    if (!mediaFile || !mediaFile.type) {
      AssetEmbedder.toolkit.logger.warn("AssetEmbedder: File or file type is undefined. Assuming non-permitted by default to be safe.");
      return false; // Be strict if file type is missing.
    }
    var allowedTypes = this.configuration.permittedMimeTypes;
    return allowedTypes.indexOf(mediaFile.type) >= 0;
  };

  /**
   * Handles the successful upload response from the server.
   * Parses the response, extracts the asset URL, and updates the editor content.
   *
   * @param {XMLHttpRequest} ajaxRequest - The completed XMLHttpRequest object.
   * @returns {void}
   */
  AssetEmbedder.prototype.handleUploadSuccess = function(ajaxRequest) {
    // Execute the `onUploadSuccess` hook. If it returns `false`, stop further processing.
    if (this.configuration.onUploadSuccess.call(this, ajaxRequest) !== false) {
      try {
        var parsedResponse = JSON.parse(ajaxRequest.responseText);
        var returnedFileName = parsedResponse[this.configuration.responseKeyForUrl];

        // Ensure the response is valid and contains the expected filename/URL.
        if (parsedResponse && returnedFileName) {
          // Construct the final embed string using the configured template.
          var finalEmbedString = this.configuration.finalEmbedTemplate.replace(this.placeholderToken, returnedFileName);

          // Replace the temporary placeholder in the editor with the final embed string.
          if (this.targetEditor && typeof this.targetEditor.getValue === 'function' && typeof this.targetEditor.setValue === 'function') {
            var updatedContent = this.targetEditor.getValue().replace(this.lastInsertedText, finalEmbedString);
            this.targetEditor.setValue(updatedContent);
            AssetEmbedder.toolkit.logger.log("AssetEmbedder: File successfully embedded:", returnedFileName);
          } else {
            AssetEmbedder.toolkit.logger.error("AssetEmbedder: Editor API (getValue/setValue) not available to update content after success.");
          }
        } else {
          AssetEmbedder.toolkit.logger.error("AssetEmbedder: Server response missing expected key '" + this.configuration.responseKeyForUrl + "'. Response:", parsedResponse);
          this.handleUploadFailure(ajaxRequest, "Invalid server response format."); // Treat as a failure.
        }
      } catch (error) {
        AssetEmbedder.toolkit.logger.error("AssetEmbedder: Error parsing server response or processing success:", error, ajaxRequest.responseText);
        this.handleUploadFailure(ajaxRequest, "Failed to parse server response."); // Treat parsing errors as failures.
      } finally {
        this.resetStatus(); // Always clear the last inserted text after attempting to process.
      }
    } else {
      this.resetStatus(); // Clear status even if hook prevents default handling.
    }
  };


  /**
   * Handles cases where the file upload fails (e.g., HTTP error, network issue, invalid server response).
   * Removes the temporary placeholder and optionally inserts an error message into the editor.
   *
   * @param {XMLHttpRequest} ajaxRequest - The XMLHttpRequest object with error details.
   * @param {string} [customErrorMessage] - An optional, specific message to augment the default error.
   * @returns {void}
   */
  AssetEmbedder.prototype.handleUploadFailure = function(ajaxRequest, customErrorMessage) {
    AssetEmbedder.toolkit.logger.error("AssetEmbedder: Upload failed. Details:", ajaxRequest, customErrorMessage);

    // Execute the `onUploadFailure` hook. If it returns `false`, stop further processing.
    if (this.configuration.onUploadFailure.call(this, ajaxRequest) !== false) {
      // If a temporary placeholder was inserted, replace it with an error message or remove it.
      if (this.lastInsertedText && this.targetEditor && typeof this.targetEditor.getValue === 'function' && typeof this.targetEditor.setValue === 'function') {
        var currentContent = this.targetEditor.getValue();
        var errorDisplayMessage = this.configuration.uploadFailedMessage + (customErrorMessage ? ' (' + customErrorMessage + ')' : '');
        // Replacing with a formatted error message.
        var newContent = currentContent.replace(this.lastInsertedText, `**${errorDisplayMessage}**`);
        this.targetEditor.setValue(newContent);
      } else {
        AssetEmbedder.toolkit.logger.error("AssetEmbedder: Editor API (getValue/setValue) not available to update content after failure.");
      }
    }
    this.resetStatus(); // Always clear the last inserted text.
  };

  /**
   * Called when a media file is initially received, either by drag-and-drop or paste.
   * Inserts a temporary placeholder into the editor to indicate ongoing upload.
   *
   * @param {File} receivedFile - The file object that was received.
   * @returns {void}
   */
  AssetEmbedder.prototype.handleMediaInsertion = function(receivedFile) {
    // Guard clause: Ensure a target editor is available.
    if (!this.targetEditor) {
      AssetEmbedder.toolkit.logger.error("AssetEmbedder: No target editor instance defined. Cannot insert media placeholder.");
      return;
    }

    // Execute the `onMediaReceived` hook. If it returns `false`, stop further processing.
    if (this.configuration.onMediaReceived.call(this, receivedFile) !== false) {
      this.lastInsertedText = this.configuration.tempPlaceholder;

      // Attempt to use the editor's specific `insertValue` method if available.
      // Otherwise, fall back to the generic `injectContentAtCursor` utility.
      if (typeof this.targetEditor.insertValue === 'function') {
        this.targetEditor.insertValue(this.lastInsertedText);
      } else if (typeof this.targetEditor.getElement === 'function') { // Assuming getElement returns the textarea.
        AssetEmbedder.toolkit.injectContentAtCursor(this.targetEditor.getElement(), this.lastInsertedText);
      } else {
        AssetEmbedder.toolkit.logger.error("AssetEmbedder: No suitable method found to insert placeholder into editor.");
        // As a last resort, if editor only has setValue and getValue, we could do:
        // this.targetEditor.setValue(this.targetEditor.getValue() + this.lastInsertedText);
      }
    }
  };

  /**
   * Resets the internal state related to the last inserted placeholder.
   * This method should be called after an upload (success or failure) completes.
   * @returns {void}
   */
  AssetEmbedder.prototype.resetStatus = function() {
    this.lastInsertedText = null;
  };

  /**
   * Event handler for clipboard paste events.
   * It inspects the clipboard data for file items (e.g., images) and
   * initiates an upload process for permitted files.
   *
   * @param {ClipboardEvent} eventObject - The native paste event object.
   * @returns {boolean} `true` if a file was detected and handled, `false` otherwise.
   */
  AssetEmbedder.prototype.onClipboardPaste = function(eventObject) {
    // Guard clauses for invalid event data.
    if (!eventObject || !eventObject.clipboardData) {
      AssetEmbedder.toolkit.logger.warn("AssetEmbedder: No clipboard data found in paste event.");
      return false;
    }

    var eventHandled = false;
    var pasteData = eventObject.clipboardData;
    // Access clipboard items, with a fallback for older browser APIs.
    var dataItems = pasteData.items || pasteData.files || [];

    for (var i = 0; i < dataItems.length; i++) {
      var currentItem = dataItems[i];

      // Check if the item is a file and if its type is permitted.
      if (currentItem.kind === 'file' && this.isMediaPermitted(currentItem)) {
        var clipboardFile = currentItem.getAsFile(); // Get the File object from the DataTransferItem.
        if (clipboardFile) {
          eventHandled = true; // Mark the event as handled.
          this.handleMediaInsertion(clipboardFile); // Insert placeholder.
          this.dispatchUploadRequest(clipboardFile); // Start upload.
        } else {
          AssetEmbedder.toolkit.logger.warn("AssetEmbedder: Failed to retrieve file from clipboard item:", currentItem);
        }
      }
    }

    // If a file upload was initiated, prevent the browser's default paste behavior.
    if (eventHandled) {
      eventObject.preventDefault();
    }
    return eventHandled;
  };

  /**
   * Event handler for file drop events.
   * It iterates through dropped files, checks for permitted media types,
   * and initiates an upload process for each valid file.
   *
   * @param {DragEvent} eventObject - The native drop event object.
   * @returns {boolean} `true` if at least one file was detected and handled, `false` otherwise.
   */
  AssetEmbedder.prototype.onFileDrop = function(eventObject) {
    // Guard clauses for invalid event data.
    if (!eventObject || !eventObject.dataTransfer || !eventObject.dataTransfer.files) {
      AssetEmbedder.toolkit.logger.warn("AssetEmbedder: No dataTransfer files found in drop event.");
      return false;
    }

    var eventHandled = false;
    var draggedData = eventObject.dataTransfer;

    // Prevent default browser behavior for drops (e.g., opening the file in a new tab).
    eventObject.preventDefault();
    eventObject.stopPropagation(); // Stop event propagation to avoid other listeners handling it.

    if (draggedData.files.length === 0) {
      AssetEmbedder.toolkit.logger.log("AssetEmbedder: No files detected in drop event.");
      return false;
    }

    for (var i = 0; i < draggedData.files.length; i++) {
      var droppedFile = draggedData.files[i];

      // Check if the dropped file's type is permitted.
      if (this.isMediaPermitted(droppedFile)) {
        eventHandled = true; // Mark the event as handled.
        this.handleMediaInsertion(droppedFile); // Insert placeholder.
        this.dispatchUploadRequest(droppedFile); // Start upload.
      } else {
        AssetEmbedder.toolkit.logger.warn("AssetEmbedder: Dropped file type not permitted:", droppedFile.type, "File name:", droppedFile.name);
      }
    }

    return eventHandled;
  };

  // Expose the AssetEmbedder constructor globally on the window object.
  winRef.AssetEmbedder = AssetEmbedder;

})(document, window);