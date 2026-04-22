define("module-file-transfer-core",
  ["module-base-transmission-service","module-cloud-storage-service","module-input-component","exportBundle"],
  function(transferServiceModule, cloudUploadModule, fileInputModule, exportBundle) {
    "use strict";
    // Core components for the file transfer system
    const BaseTransferService = transferServiceModule["default"];
    const CloudObjectService = cloudUploadModule["default"];
    const AttachmentInput = fileInputModule["default"];

    // Aggregate all primary services for external consumption
    exportBundle["default"] = Object.freeze({
      TransferService: BaseTransferService,
      CloudStorageService: CloudObjectService,
      FileSelectionComponent: AttachmentInput
    });
  });
define("module-input-component",
  ["moduleExports"],
  function(moduleExports) {
    "use strict";

    // Helper utility to safely update properties on Ember objects
    const updateEmberProperty = AppCore.setProperty;

    moduleExports["default"] = AppCore.UI.TextField.extend({
      controlType: 'file', // Specifies the HTML input type
      boundAttributes: ['allowMultiSelect'], // Attributes to bind from component to DOM element
      allowMultiSelect: false, // Flag to enable multiple file selection

      /**
       * Handles the change event when files are selected in the input field.
       * @param {Event} eventPayload - The DOM event object.
       */
      onFileSelectionChange: function(eventPayload) {
        const targetElement = eventPayload.target;
        // Ensure files exist before attempting to process
        if (targetElement && targetElement.files && targetElement.files.length > 0) {
          AppCore.logInfo('Files selected:', targetElement.files);
          updateEmberProperty(this, 'selectedFiles', targetElement.files);
        } else {
          AppCore.logDebug('No files were selected or input is empty.');
          updateEmberProperty(this, 'selectedFiles', null); // Clear previously selected files
        }
      }
    });
  });
define("module-cloud-storage-service",
  ["module-base-transmission-service","moduleExports"],
  function(baseTransferModule, moduleExports) {
    "use strict";
    const BaseTransferMechanism = baseTransferModule["default"];

    const retrieveEmberProperty = AppCore.getProperty;
    const updateEmberProperty = AppCore.setProperty;

    // Defines a specialized service for S3-compatible cloud storage uploads.
    moduleExports["default"] = BaseTransferMechanism.extend({
      /**
        Endpoint URL for requesting a pre-signed upload URL from the backend.
        @property {string} signingEndpoint
      */
      signingEndpoint: '/api/v1/sign-upload',
      requestHeaders: null, // Custom headers for the signing request

      /**
       * Callback invoked after a signing request successfully returns.
       * Triggers an event indicating the signing was successful.
       * @param {object} signedDataResponse - The response containing signing details.
       * @returns {object} The signed data response.
       */
      onSignedResponseReceived: function(signedDataResponse) {
        this.trigger('signatureAcquired', signedDataResponse);
        return signedDataResponse;
      },

      /**
       * Initiates an upload operation to the cloud storage.
       * First requests a signed URL, then performs the actual file upload.
       * @param {File} targetFile - The file object to be uploaded.
       * @param {object} uploadMetadata - Additional metadata for the upload.
       * @returns {Promise} A promise that resolves upon successful upload.
       */
      initiateCloudUpload: function(targetFile, uploadMetadata) {
        const instanceContext = this;

        if (!targetFile) {
          AppCore.logError("Cannot initiate cloud upload: no file provided.");
          return Promise.reject(new Error("No file to upload."));
        }

        updateEmberProperty(this, 'uploadInProgress', true);

        return this.requestSignature(targetFile, uploadMetadata).then(function(signingDetails) {
          let destinationLink;
          let s3BucketUrl;

          // Determine the correct S3 endpoint based on region information
          if (signingDetails.regionIdentifier) {
            destinationLink = `//s3-${signingDetails.regionIdentifier}.amazonaws.com/${signingDetails.bucketName}`;
            // Region is now part of the URL, no need to keep it in signingDetails for form data.
            // However, we'll keep the original object intact for potential debugging.
          } else {
            destinationLink = `//${signingDetails.bucketName}.s3.amazonaws.com`;
          }
          s3BucketUrl = destinationLink; // Store for clarity

          const uploadFormData = instanceContext.prepareSubmissionData(targetFile, signingDetails);

          AppCore.logDebug(`Attempting upload to: ${s3BucketUrl}`);
          return instanceContext.executeHttpRequest(s3BucketUrl, uploadFormData);
        }).catch(error => {
          AppCore.logError("Cloud upload initiation failed:", error);
          updateEmberProperty(this, 'uploadInProgress', false);
          return Promise.reject(error);
        });
      },

      /**
       * Requests a pre-signed URL and necessary credentials from the backend.
       * @param {File} fileToSign - The file for which to obtain signing details.
       * @param {object} signingRequestPayload - Additional data to send with the signing request.
       * @returns {Promise} A promise that resolves with the signing details.
       */
      requestSignature: function(fileToSign, signingRequestPayload) {
        const instanceContext = this;

        // Ensure payload is an object
        const finalPayload = signingRequestPayload ? { ...signingRequestPayload } : {};
        finalPayload.fileName = fileToSign.name;
        finalPayload.fileType = fileToSign.type;
        finalPayload.fileSize = fileToSign.size;

        const signatureRequestOptions = {
          url: retrieveEmberProperty(this, 'signingEndpoint'),
          headers: retrieveEmberProperty(this, 'requestHeaders'),
          type: 'GET',
          dataType: 'json', // Expecting JSON response
          data: finalPayload
        };

        return new Promise(function(fulfill, rejectPromise) {
          signatureRequestOptions.success = function(responsePayload) {
            AppCore.runInContext(null, fulfill, instanceContext.onSignedResponseReceived(responsePayload));
          };

          signatureRequestOptions.error = function(xhrObject, responseMessage, errorDetails) {
            AppCore.runInContext(null, rejectPromise, instanceContext.onTransferFailure(xhrObject, responseMessage, errorDetails));
          };

          AppCore.HttpClient.request(signatureRequestOptions);
        });
      }
    });
  });
define("module-base-transmission-service",
  ["moduleExports"],
  function(moduleExports) {
    "use strict";

    const getAppProperty = AppCore.getProperty;
    const setAppProperty = AppCore.setProperty;

    // Helper to run functions safely within Ember's run loop
    const runInEmberContext = (fn, ...args) => AppCore.runInContext(null, fn, ...args);

    moduleExports["default"] = AppCore.CoreObject.extend(AppCore.EventBusMixin, {
      destinationUrl: null,
      parameterScope: null, // Namespace for form parameters, e.g., 'upload[file]'
      fileFieldName: 'file', // Default name for the file input field
      transferActive: false, // Indicates if an upload is currently in progress

      /**
       * The HTTP request method for the upload, defaults to POST.
       * @property {string} requestMethod
       */
      requestMethod: 'POST',

      /**
       * Initiates the file transfer process with provided files and additional data.
       * @param  {File|File[]} fileEntities  One file object or an array of file objects.
       * @param  {object} supplementaryPayload  Additional key-value pairs to send with the form data.
       * @return {Promise} A promise that resolves upon successful transfer.
       */
      startFileTransfer: function(fileEntities, supplementaryPayload) {
        if (!fileEntities || (Array.isArray(fileEntities) && fileEntities.length === 0)) {
          AppCore.logWarn("Attempted to start transfer with no file entities.");
          return Promise.reject(new Error("No files provided for transfer."));
        }

        const additionalFields = supplementaryPayload || {};
        const processedPayload = this.prepareSubmissionData(fileEntities, additionalFields);
        const targetLink = getAppProperty(this, 'destinationUrl');
        const httpMethod = getAppProperty(this, 'requestMethod');
        const contextRef = this;

        setAppProperty(this, 'transferActive', true);
        AppCore.logInfo(`Initiating file transfer to ${targetLink} using ${httpMethod}.`);

        return this.executeHttpRequest(targetLink, processedPayload, httpMethod)
          .finally(() => { // Ensure transferActive is reset regardless of success or failure
            setAppProperty(contextRef, 'transferActive', false);
          });
      },

      /**
       * Constructs a FormData object suitable for multipart/form-data uploads.
       * @param {File|File[]} inputFiles - The file(s) to be appended.
       * @param {object} additionalFields - Extra data to include in the form.
       * @returns {FormData} The constructed FormData object.
       */
      prepareSubmissionData: function(inputFiles, additionalFields) {
        const submissionForm = new FormData();

        // Append all additional key-value pairs
        Object.keys(additionalFields).forEach(propertyKey => {
          if (Object.prototype.hasOwnProperty.call(additionalFields, propertyKey)) {
            submissionForm.append(this.formatScopedParameter(propertyKey), additionalFields[propertyKey]);
          }
        });

        // Handle file(s) appending
        if (Array.isArray(inputFiles)) {
          // Process an array of files
          inputFiles.forEach((fileItem, idx) => {
            const parameterIdentifier = `${this.formatScopedParameter(this.fileFieldName)}[${idx}]`;
            submissionForm.append(parameterIdentifier, fileItem);
          });
        } else if (inputFiles instanceof File) {
          // Process a single file object
          submissionForm.append(this.formatScopedParameter(this.fileFieldName), inputFiles);
        } else {
          AppCore.logWarn("Input files are neither a File object nor an array of Files.", inputFiles);
        }

        return submissionForm;
      },

      /**
       * Formats a parameter name by prepending the configured namespace, if any.
       * @param {string} baseName - The original parameter name.
       * @returns {string} The namespaced parameter name.
       */
      formatScopedParameter: function(baseName) {
        const scope = getAppProperty(this, 'parameterScope');
        if (scope) {
          return `${scope}[${baseName}]`;
        }
        return baseName;
      },

      /**
       * Callback method for successful upload.
       * Resets the upload status and triggers a 'transferComplete' event.
       * @param {object} responseData - The data received from the server.
       * @returns {object} The server response data.
       */
      onTransferComplete: function(responseData) {
        setAppProperty(this, 'transferActive', false);
        this.trigger('transferComplete', responseData);
        AppCore.logSuccess("File transfer completed successfully.", responseData);
        return responseData;
      },

      /**
       * Callback method for upload errors.
       * Resets the upload status and triggers a 'transferFailed' event.
       * @param {object} xhrResponse - The XHR object from the failed request.
       * @param {string} statusMessage - The status text of the response.
       * @param {Error|string} errorObject - The error object or message.
       * @returns {object} The XHR response object with additional error info.
       */
      onTransferFailure: function(xhrResponse, statusMessage, errorObject) {
        setAppProperty(this, 'transferActive', false);
        AppCore.logError("File transfer failed:", statusMessage, errorObject, xhrResponse);

        // Enhance XHR object with error details for consistent handling
        if (xhrResponse && typeof xhrResponse === 'object') {
          if (!xhrResponse.errorDetail) {
            xhrResponse.errorDetail = errorObject instanceof Error ? errorObject : new Error(String(errorObject));
          }
          xhrResponse.statusText = statusMessage; // Ensure status text is explicitly set
        }

        this.trigger('transferFailed', xhrResponse, statusMessage, errorObject);
        return xhrResponse;
      },

      /**
       * Callback method for progress updates during upload.
       * Calculates percentage and triggers a 'progressUpdate' event.
       * @param {ProgressEvent} progressEvent - The native progress event.
       */
      onProgressUpdate: function(progressEvent) {
        if (progressEvent.lengthComputable) {
          const completionPercentage = (progressEvent.loaded / progressEvent.total) * 100;
          const updatedEvent = { ...progressEvent, percent: completionPercentage };
          this.trigger('progressUpdate', updatedEvent);
        } else {
          AppCore.logDebug("Progress event is not computable for percentage.");
          this.trigger('progressUpdate', progressEvent); // Still trigger, but without percent
        }
      },

      /**
       * Cancels an ongoing file transfer.
       * Resets the upload status and triggers an 'transferCancellation' event.
       */
      cancelTransfer: function() {
        if (getAppProperty(this, 'transferActive')) {
          setAppProperty(this, 'transferActive', false);
          this.trigger('transferCancellation');
          AppCore.logWarn("File transfer explicitly cancelled.");
        } else {
          AppCore.logDebug("Attempted to cancel transfer, but no active transfer found.");
        }
      },

      /**
       * Executes an HTTP request using Ember's AJAX utility.
       * Configures XHR for progress tracking and abort functionality.
       * @param {string} endpoint - The target URL for the request.
       * @param {FormData} requestBody - The FormData payload.
       * @param {string} httpMethod - The HTTP method (e.g., 'POST', 'PUT').
       * @returns {Promise} A promise representing the AJAX operation.
       */
      executeHttpRequest: function(endpoint, requestBody, httpMethod) {
        const contextRef = this;
        const httpRequestConfig = {
          url: endpoint,
          type: httpMethod || 'POST',
          contentType: false, // Important for FormData
          processData: false, // Important for FormData
          xhr: function() {
            const nativeXhr = AppCore.HttpClient.createXHR();
            if (nativeXhr.upload) {
              nativeXhr.upload.onprogress = (evt) => contextRef.onProgressUpdate(evt);
            }
            // Register for abort event to cancel the native XHR
            contextRef.one('transferCancellation', () => {
              if (nativeXhr.readyState !== nativeXhr.DONE) {
                nativeXhr.abort();
                AppCore.logDebug("Native XHR aborted due to transfer cancellation.");
              }
            });
            return nativeXhr;
          },
          data: requestBody
        };

        return this._performRequest(httpRequestConfig);
      },

      /**
       * Internal method to execute the AJAX request and handle promises.
       * @param {object} requestConfig - The configuration object for AppCore.HttpClient.request.
       * @returns {Promise} A promise that resolves or rejects based on the AJAX outcome.
       * @private
       */
      _performRequest: function(requestConfig) {
        const contextRef = this;

        return new Promise(function(resolvePromise, rejectPromise) {
          requestConfig.success = function(responseData) {
            runInEmberContext(resolvePromise, contextRef.onTransferComplete(responseData));
          };

          requestConfig.error = function(xhrResponse, statusMessage, errorObject) {
            runInEmberContext(rejectPromise, contextRef.onTransferFailure(xhrResponse, statusMessage, errorObject));
          };

          AppCore.HttpClient.request(requestConfig);
        });
      }
    });
  });